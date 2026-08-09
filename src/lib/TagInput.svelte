<script>
  import Icon from "./Icon.svelte";

  let {
    value = $bindable([]),
    options = [],
    id = undefined,
    placeholder = "",
  } = $props();

  let draft = $state("");
  let open = $state(false);
  let highlighted = $state(-1);
  let inputEl;
  let rootEl;

  let filtered = $derived(
    options.filter((o) => {
      if (value.includes(o)) return false;
      return draft.trim() ? o.toLowerCase().includes(draft.toLowerCase()) : true;
    }),
  );

  function normalize(raw) {
    return raw.trim().toLowerCase();
  }

  function addTag(raw) {
    const tag = normalize(raw);
    if (!tag || value.includes(tag)) {
      draft = "";
      return;
    }
    value.push(tag);
    draft = "";
    highlighted = -1;
  }

  function removeTag(tag) {
    const i = value.indexOf(tag);
    if (i !== -1) value.splice(i, 1);
    inputEl?.focus();
  }

  function onKeydown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (open && highlighted >= 0 && filtered[highlighted]) {
        addTag(filtered[highlighted]);
      } else {
        addTag(draft);
      }
      open = true;
      highlighted = -1;
    } else if (e.key === "Backspace" && !draft && value.length) {
      removeTag(value[value.length - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      open = true;
      highlighted = Math.min(highlighted + 1, filtered.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlighted = Math.max(highlighted - 1, 0);
    } else if (e.key === "Escape") {
      open = false;
    }
  }

  // Capture phase so this fires even if something between the click
  // target and window stops bubble-phase propagation.
  function onDocClick(e) {
    if (open && rootEl && !rootEl.contains(e.target)) open = false;
  }
</script>

<svelte:window onclickcapture={onDocClick} />

<div class="tag-input" bind:this={rootEl}>
  <div class="tag-field">
    {#each value as tag}
      <span class="tag-chip">
        {tag}
        <button
          type="button"
          aria-label={`Remove tag ${tag}`}
          onclick={() => removeTag(tag)}
        >
          <Icon name="close" size={10} />
        </button>
      </span>
    {/each}
    <input
      bind:this={inputEl}
      {id}
      type="text"
      placeholder={value.length ? "" : placeholder}
      autocomplete="off"
      role="combobox"
      aria-expanded={open}
      aria-controls="{id}-listbox"
      bind:value={draft}
      onfocus={() => (open = true)}
      onkeydown={onKeydown}
    />
  </div>
  {#if open && filtered.length}
    <ul class="tag-list" id="{id}-listbox" role="listbox">
      {#each filtered as option, i}
        <li>
          <button
            type="button"
            class="tag-option"
            class:active={i === highlighted}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => addTag(option)}
          >
            {option}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .tag-input {
    position: relative;
  }

  .tag-field {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.35rem;
    width: 100%;
    min-height: 2.4rem;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    transition:
      border-color 120ms ease,
      box-shadow 120ms ease;
  }

  .tag-field:focus-within {
    border-color: var(--accent);
    box-shadow: var(--focus-ring);
  }

  .tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
    padding: 0.15rem 0.3rem 0.15rem 0.55rem;
    border-radius: 999px;
  }

  .tag-chip button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.05rem;
    height: 1.05rem;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .tag-chip button:hover {
    background: color-mix(in srgb, var(--accent) 25%, transparent);
  }

  .tag-field input {
    flex: 1 1 6rem;
    min-width: 6rem;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text);
    font-size: 0.9rem;
    padding: 0.15rem 0;
  }

  .tag-list {
    position: absolute;
    z-index: 20;
    top: calc(100% + 0.3rem);
    left: 0;
    right: 0;
    max-height: 12rem;
    overflow-y: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    padding: 0.3rem;
    list-style: none;
  }

  .tag-option {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.4rem 0.6rem;
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 0.88rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .tag-option:hover,
  .tag-option.active {
    background: var(--surface-2);
    color: var(--accent);
  }

  @media (max-width: 640px) {
    .tag-chip button {
      width: 1.4rem;
      height: 1.4rem;
    }
  }
</style>
