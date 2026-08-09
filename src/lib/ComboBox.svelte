<script>
  import Icon from "./Icon.svelte";

  let {
    value = $bindable(""),
    options = [],
    id = undefined,
    placeholder = "",
  } = $props();

  let open = $state(false);
  let highlighted = $state(-1);
  // While browsing (just opened via focus/chevron, not yet typing) the
  // full option list is shown even though `value` already holds a full
  // category name — otherwise a value that exactly matches an option
  // would filter the list down to just itself.
  let browsing = $state(false);
  let inputEl;
  let rootEl;

  let filtered = $derived(
    !browsing && value.trim()
      ? options.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
      : options,
  );

  function select(option) {
    value = option;
    open = false;
    highlighted = -1;
    inputEl?.focus();
  }

  function toggleOpen() {
    open = !open;
    if (open) {
      browsing = true;
      inputEl?.focus();
    }
  }

  function onKeydown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open = true;
      highlighted = Math.min(highlighted + 1, filtered.length - 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      highlighted = Math.max(highlighted - 1, 0);
    } else if (e.key === "Enter") {
      if (open && highlighted >= 0 && filtered[highlighted]) {
        e.preventDefault();
        select(filtered[highlighted]);
      }
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

<div class="combobox" bind:this={rootEl}>
  <div class="combobox-field">
    <input
      bind:this={inputEl}
      {id}
      type="text"
      {placeholder}
      autocomplete="off"
      role="combobox"
      aria-expanded={open}
      aria-controls="{id}-listbox"
      bind:value
      onfocus={() => {
        open = true;
        browsing = true;
      }}
      oninput={() => (browsing = false)}
      onkeydown={onKeydown}
    />
    <button
      type="button"
      class="field-btn chevron-btn"
      aria-label="Toggle category options"
      tabindex="-1"
      onclick={toggleOpen}
    >
      <Icon name="chevronDown" size={14} />
    </button>
  </div>
  {#if open && filtered.length}
    <ul class="combobox-list" id="{id}-listbox" role="listbox">
      {#each filtered as option, i}
        <li>
          <button
            type="button"
            class="combobox-option"
            class:active={i === highlighted}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => select(option)}
          >
            {option}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .combobox {
    position: relative;
  }

  .combobox-field {
    position: relative;
    display: flex;
  }

  .combobox-field input {
    width: 100%;
    padding-right: 1.9rem;
  }

  .field-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.35rem;
    height: 1.35rem;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
  }

  .field-btn:hover {
    background: var(--surface-2);
    color: var(--text);
  }

  .chevron-btn {
    right: 0.3rem;
    border-radius: var(--radius-sm);
  }

  .combobox-list {
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

  .combobox-option {
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

  .combobox-option:hover,
  .combobox-option.active {
    background: var(--surface-2);
    color: var(--accent);
  }

  @media (max-width: 640px) {
    .field-btn {
      width: 1.8rem;
      height: 1.8rem;
    }
  }
</style>
