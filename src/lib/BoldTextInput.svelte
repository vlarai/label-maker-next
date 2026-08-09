<script>
  import { tick } from "svelte";
  import Icon from "./Icon.svelte";
  import { parseBoldLines } from "./richText.js";
  import { ui } from "./ui.svelte.js";

  let { id = undefined, value = $bindable(""), placeholder = "" } = $props();

  let textareaEl;

  function toggleBold() {
    const start = textareaEl.selectionStart;
    const end = textareaEl.selectionEnd;
    if (start === end) return;

    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);

    if (before.endsWith("**") && after.startsWith("**")) {
      value = before.slice(0, -2) + selected + after.slice(2);
      selectRange(start - 2, end - 2);
    } else {
      value = before + "**" + selected + "**" + after;
      selectRange(start + 2, end + 2);
    }
  }

  async function selectRange(start, end) {
    await tick();
    textareaEl.focus();
    textareaEl.setSelectionRange(start, end);
  }
</script>

<div class="bold-text-input">
  <div class="toolbar">
    <button
      type="button"
      class="bold-btn"
      title="Bold selection"
      aria-label="Bold selection"
      onclick={toggleBold}
    >
      <Icon name="bold" size={13} />
    </button>
  </div>
  <textarea
    bind:this={textareaEl}
    {id}
    {placeholder}
    rows="2"
    bind:value
  ></textarea>
  {#if value && ui.showTextPreview}
    <div class="rendered-preview">
      {#each parseBoldLines(value) as line}
        <div class="preview-line">
          {#each line as run}
            {#if run.bold}<strong>{run.text}</strong>{:else}{run.text}{/if}
          {/each}
          {#if line.length === 0}&nbsp;{/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .bold-text-input {
    display: flex;
    flex-direction: column;
  }

  .toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 0.25rem;
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

  textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    color: var(--text);
    font-size: 0.9rem;
    font-family: inherit;
    resize: vertical;
    transition:
      border-color 120ms ease,
      box-shadow 120ms ease;
  }

  textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: var(--focus-ring);
  }

  .rendered-preview {
    margin-top: 0.35rem;
    padding: 0.4rem 0.6rem;
    border-radius: var(--radius-sm);
    background: var(--surface-2);
    color: var(--text-muted);
    font-size: 0.82rem;
    line-height: 1.4;
  }

  .preview-line strong {
    color: var(--text);
  }

  @media (max-width: 640px) {
    .bold-btn {
      width: 2rem;
      height: 2rem;
    }
  }
</style>
