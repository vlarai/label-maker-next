<script>
  import Icon from "./Icon.svelte";
  import { parseBoldLines } from "./richText.js";

  let {
    id = undefined,
    label = undefined,
    value = $bindable(""),
    placeholder = "",
  } = $props();

  // A zero-width character used purely as DOM scaffolding: placed next to
  // every <strong> so there's always somewhere for the caret to land that
  // isn't inside the bold span. A truly empty text node doesn't work here —
  // Chrome silently folds typing at an empty-text-node/element boundary
  // back into the adjacent inline element, so newly typed text keeps
  // inheriting the bold formatting. Stripped back out in serializeDom.
  const ZWSP = "​";

  function stripZwsp(text) {
    return text.split(ZWSP).join("");
  }

  let editorEl = $state();
  // Tracks the last value we rendered into the DOM, so the $effect below
  // can tell "value changed from outside this component" (re-render needed)
  // apart from "we just wrote this value ourselves in handleInput/toggleBold"
  // (DOM is already up to date — re-rendering here would blow away the
  // caret position we just restored).
  let lastSyncedValue = "";

  $effect(() => {
    if (!editorEl) return;
    if (value !== lastSyncedValue) {
      renderFromValue(value);
      lastSyncedValue = value;
    }
  });

  // Rebuilds the contenteditable's DOM from the canonical "**bold**"/\n
  // string: **bold** spans become real <strong> elements (so the asterisks
  // never appear on screen) and \n becomes a <br>. Every <strong> is padded
  // with an empty text-node neighbor on each side it doesn't already have
  // one — without that, a caret placed right at the edge of a <strong> has
  // nowhere to land but inside it, so the browser keeps bolding whatever
  // gets typed next.
  function renderFromValue(text) {
    editorEl.replaceChildren();
    const lastTopLevel = () => editorEl.lastChild;
    const lines = parseBoldLines(text);
    lines.forEach((line, i) => {
      if (i > 0) editorEl.appendChild(document.createElement("br"));
      for (const run of line) {
        if (!run.text) continue;
        if (run.bold) {
          if (lastTopLevel()?.nodeType !== Node.TEXT_NODE) {
            editorEl.appendChild(document.createTextNode(ZWSP));
          }
          const strong = document.createElement("strong");
          strong.textContent = run.text;
          editorEl.appendChild(strong);
          editorEl.appendChild(document.createTextNode(ZWSP));
        } else {
          editorEl.appendChild(document.createTextNode(run.text));
        }
      }
    });
    // A trailing <br> (blank final line) needs the same text-node anchor
    // after it as a <strong> does, or typing there lands before the break
    // instead of on the new line.
    if (editorEl.lastChild && editorEl.lastChild.nodeType !== Node.TEXT_NODE) {
      editorEl.appendChild(document.createTextNode(ZWSP));
    }
  }

  // Reads the DOM back into the canonical string: <strong> is re-wrapped in
  // ** markers, <br> becomes \n. Any literal ** the user just typed (not
  // yet turned into a <strong>) passes through as plain text, which is what
  // lets parseBoldLines pick it up as soon as a pair completes.
  function serializeDom() {
    let out = "";
    for (const node of editorEl.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) out += stripZwsp(node.textContent);
      else if (node.nodeName === "BR") out += "\n";
      else if (node.nodeName === "STRONG")
        out += "**" + stripZwsp(node.textContent) + "**";
      else out += node.textContent ?? "";
    }
    return out;
  }

  function fullSerializedLength(node) {
    if (node.nodeType === Node.TEXT_NODE) return stripZwsp(node.textContent).length;
    if (node.nodeName === "BR") return 1;
    if (node.nodeName === "STRONG") return stripZwsp(node.textContent).length + 4;
    return node.textContent?.length ?? 0;
  }

  function visibleOffsetWithin(text, rawOffset) {
    return stripZwsp(text.slice(0, rawOffset)).length;
  }

  // Maps a live DOM caret position (as given by the Selection API, against
  // whatever the DOM looks like right now) to an offset into the string
  // serializeDom() would produce for that same DOM.
  function domPositionToSerializedOffset(container, offset) {
    if (container === editorEl) {
      let result = 0;
      const children = Array.from(editorEl.childNodes);
      for (let i = 0; i < offset && i < children.length; i++) {
        result += fullSerializedLength(children[i]);
      }
      return result;
    }

    let result = 0;
    let found = false;

    function visit(node) {
      if (found) return;
      if (node === container) {
        found = true;
        if (node.nodeType === Node.TEXT_NODE) {
          result += visibleOffsetWithin(node.textContent, offset);
        } else if (node.nodeName === "STRONG") {
          // e.g. selectNodeContents(strong) gives the <strong> itself as
          // container with a child-index offset, not its text node — walk
          // in past the opening ** the same way the STRONG branch below does.
          result += 2;
          const children = Array.from(node.childNodes);
          for (let i = 0; i < offset && i < children.length; i++) {
            result += stripZwsp(children[i].textContent ?? "").length;
          }
        } else {
          const children = Array.from(node.childNodes);
          for (let i = 0; i < offset && i < children.length; i++) {
            result += fullSerializedLength(children[i]);
          }
        }
        return;
      }
      if (node.nodeType === Node.TEXT_NODE) {
        result += stripZwsp(node.textContent).length;
        return;
      }
      if (node.nodeName === "BR") {
        result += 1;
        return;
      }
      if (node.nodeName === "STRONG") {
        result += 2;
        for (const child of node.childNodes) {
          visit(child);
          if (found) return;
        }
        result += 2;
        return;
      }
      for (const child of node.childNodes) {
        visit(child);
        if (found) return;
      }
    }

    for (const node of editorEl.childNodes) {
      visit(node);
      if (found) break;
    }
    return result;
  }

  // Inverse of the above, but against a freshly-rendered DOM (built by
  // renderFromValue), where a serialized offset that falls inside a **
  // marker itself gets snapped to just outside the <strong> it belongs to.
  function serializedOffsetToDomPosition(target) {
    let remaining = target;
    for (const node of editorEl.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const len = stripZwsp(node.textContent).length;
        // A pure-padding node has no visible characters, so it's never a
        // meaningful landing target by itself — if we're about to land
        // here, snap to the far side of its zero-width char rather than
        // before it (offset 0 is the unsafe, bold-absorbing boundary).
        if (len === 0 && node.textContent.length > 0) {
          if (remaining <= 0) return { node, offset: node.textContent.length };
          continue;
        }
        if (remaining <= len) return { node, offset: remaining };
        remaining -= len;
      } else if (node.nodeName === "BR") {
        if (remaining <= 0) return { before: node };
        remaining -= 1;
      } else if (node.nodeName === "STRONG") {
        const len = stripZwsp(node.textContent).length;
        if (remaining <= 2) {
          const prev = node.previousSibling;
          return prev?.nodeType === Node.TEXT_NODE
            ? { node: prev, offset: prev.textContent.length }
            : { before: node };
        }
        if (remaining <= 2 + len) {
          return { node: node.firstChild, offset: remaining - 2 };
        }
        if (remaining <= 4 + len) {
          const next = node.nextSibling;
          return next?.nodeType === Node.TEXT_NODE
            ? { node: next, offset: next.textContent.length }
            : { after: node };
        }
        remaining -= 4 + len;
      }
    }
    return { end: true };
  }

  function resolveBoundary(pos) {
    if (pos.node) {
      const max = pos.node.textContent.length;
      return [pos.node, Math.min(Math.max(pos.offset, 0), max)];
    }
    if (pos.before) {
      const parent = pos.before.parentNode;
      return [parent, Array.prototype.indexOf.call(parent.childNodes, pos.before)];
    }
    if (pos.after) {
      const parent = pos.after.parentNode;
      return [parent, Array.prototype.indexOf.call(parent.childNodes, pos.after) + 1];
    }
    return [editorEl, editorEl.childNodes.length];
  }

  function placeSelection(startPos, endPos) {
    const sel = window.getSelection();
    if (!sel) return;
    const [sn, so] = resolveBoundary(startPos);
    const [en, eo] = resolveBoundary(endPos);
    const range = document.createRange();
    range.setStart(sn, so);
    range.setEnd(en, eo);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function placeCaret(pos) {
    placeSelection(pos, pos);
  }

  function currentCaretOffset() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!editorEl.contains(range.startContainer) && range.startContainer !== editorEl) {
      return null;
    }
    return domPositionToSerializedOffset(range.startContainer, range.startOffset);
  }

  function commit(next) {
    value = next;
    lastSyncedValue = next;
  }

  function handleInput() {
    const savedOffset = currentCaretOffset();
    const serialized = serializeDom();
    renderFromValue(serialized);
    commit(serialized);
    if (savedOffset !== null) {
      placeCaret(serializedOffsetToDomPosition(savedOffset));
    }
  }

  // Replaces the current selection with `text` by splicing it into the
  // canonical string at the selection's serialized offsets, then rebuilding
  // the DOM from that string — the same reliable path handleInput/toggleBold
  // use, rather than mutating the live DOM with a Range (which native
  // Enter/paste handling would otherwise do in browser- and
  // context-dependent ways).
  function replaceSelectionWith(text) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const start = domPositionToSerializedOffset(range.startContainer, range.startOffset);
    const end = domPositionToSerializedOffset(range.endContainer, range.endOffset);
    const next = value.slice(0, start) + text + value.slice(end);
    renderFromValue(next);
    commit(next);
    placeCaret(serializedOffsetToDomPosition(start + text.length));
  }

  function handleKeydown(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    replaceSelectionWith("\n");
  }

  function handlePaste(e) {
    e.preventDefault();
    replaceSelectionWith(e.clipboardData.getData("text/plain"));
  }

  function toggleBold() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    if (!editorEl.contains(range.commonAncestorContainer)) return;

    const start = domPositionToSerializedOffset(range.startContainer, range.startOffset);
    const end = domPositionToSerializedOffset(range.endContainer, range.endOffset);

    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);

    let next, newStart, newEnd;
    if (before.endsWith("**") && after.startsWith("**")) {
      next = before.slice(0, -2) + selected + after.slice(2);
      newStart = start - 2;
      newEnd = end - 2;
    } else {
      next = before + "**" + selected + "**" + after;
      newStart = start + 2;
      newEnd = end + 2;
    }

    renderFromValue(next);
    commit(next);
    editorEl.focus();
    placeSelection(
      serializedOffsetToDomPosition(newStart),
      serializedOffsetToDomPosition(newEnd),
    );
  }
</script>

<div class="bold-text-input">
  <div class="toolbar">
    {#if label}<span class="input-label">{label}</span>{/if}
    <button
      type="button"
      class="bold-btn"
      title="Select some text, then click to make it bold"
      aria-label="Bold selection"
      onclick={toggleBold}
    >
      <Icon name="bold" size={13} />
    </button>
  </div>
  <div
    bind:this={editorEl}
    {id}
    class="editor"
    contenteditable="true"
    role="textbox"
    tabindex="0"
    aria-multiline="true"
    aria-label={label}
    data-placeholder={placeholder}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onpaste={handlePaste}
  ></div>
</div>

<style>
  .bold-text-input {
    display: flex;
    flex-direction: column;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .input-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text);
  }

  .bold-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    height: 1.6rem;
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text-muted);
    cursor: pointer;
  }

  .bold-btn:hover {
    background: var(--surface-2);
    color: var(--text);
  }

  .editor {
    width: 100%;
    min-height: 4.6rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text);
    font-size: 0.9rem;
    font-family: inherit;
    line-height: 1.4;
    overflow-y: auto;
    resize: vertical;
    white-space: pre-wrap;
    word-break: break-word;
    transition:
      border-color 120ms ease,
      box-shadow 120ms ease;
  }

  .editor:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: var(--focus-ring);
  }

  .editor:empty::before {
    content: attr(data-placeholder);
    color: var(--text-muted);
    pointer-events: none;
  }

  @media (max-width: 640px) {
    .bold-btn {
      width: 2rem;
      height: 2rem;
    }
  }
</style>
