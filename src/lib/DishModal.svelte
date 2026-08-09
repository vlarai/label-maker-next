<script>
  import Icon from "./Icon.svelte";
  import ComboBox from "./ComboBox.svelte";
  import TagInput from "./TagInput.svelte";
  import BoldTextInput from "./BoldTextInput.svelte";
  import { store } from "./store.svelte.js";
  import { ui } from "./ui.svelte.js";
  import { dietOptions, allergenOptions } from "./data.js";

  // ui.modalInitial is itself a $state proxy (any object stored in a
  // $state field is deeply reactive), so it must be unwrapped with
  // $state.snapshot before it can be cloned into a free-standing draft.
  let form = $state(structuredClone($state.snapshot(ui.modalInitial)));

  $effect(() => {
    if (ui.modalOpen) {
      form = structuredClone($state.snapshot(ui.modalInitial));
    }
  });

  function toggle(key, value) {
    const arr = form[key];
    const i = arr.indexOf(value);
    if (i === -1) arr.push(value);
    else arr.splice(i, 1);
  }

  function submit() {
    ui.saveDish(form);
  }
</script>

{#if ui.modalOpen}
  <div class="backdrop" role="presentation">
    <div
      class="modal card-surface"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="modal-header">
        <h2>{form.id ? "Edit dish" : "Add dish"}</h2>
        <div class="modal-header-actions">
          <button
            class="btn btn-icon btn-ghost"
            title={ui.showTextPreview ? "Hide text preview" : "Show text preview"}
            aria-label={ui.showTextPreview ? "Hide text preview" : "Show text preview"}
            onclick={() => ui.toggleTextPreview()}
          >
            <Icon name={ui.showTextPreview ? "eye" : "eyeOff"} />
          </button>
          <button
            class="btn btn-icon btn-ghost"
            aria-label="Close"
            onclick={() => ui.closeModal()}
          >
            <Icon name="close" />
          </button>
        </div>
      </div>

      <div class="modal-body">
        <section>
          <h3>Dish</h3>
          <div class="field-grid">
            <div class="field">
              <label for="germanText">German text</label>
              <BoldTextInput id="germanText" bind:value={form.germanText} />
            </div>
            <div class="field">
              <label for="englishText">English text</label>
              <BoldTextInput id="englishText" bind:value={form.englishText} />
            </div>
          </div>
          <div class="field">
            <label for="category">Category</label>
            <ComboBox
              id="category"
              options={store.categories}
              bind:value={form.category}
            />
          </div>
          <div class="field">
            <label for="tags">Tags</label>
            <TagInput
              id="tags"
              options={store.tags}
              bind:value={form.tags}
              placeholder="Add a tag…"
            />
          </div>
        </section>

        <section>
          <h3>Allergens</h3>
          <div class="chip-grid">
            {#each allergenOptions as opt}
              <label class="chip">
                <input
                  type="checkbox"
                  checked={form.allergens.includes(opt.value)}
                  onchange={() => toggle("allergens", opt.value)}
                />
                {opt.label}
              </label>
            {/each}
          </div>
        </section>

        <section>
          <h3>Diet</h3>
          <div class="chip-grid">
            {#each dietOptions as opt}
              <label class="chip">
                <input
                  type="checkbox"
                  checked={form.diets.includes(opt.value)}
                  onchange={() => toggle("diets", opt.value)}
                />
                {opt.label}
              </label>
            {/each}
          </div>
        </section>
      </div>

      <div class="modal-footer">
        <button class="btn btn-ghost" onclick={() => ui.closeModal()}
          >Cancel</button
        >
        <button class="btn btn-primary" onclick={submit}>Save changes</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(10, 12, 16, 0.45);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 150;
    padding: 1.5rem;
    animation: fadeIn 120ms ease;
  }

  .modal {
    width: min(640px, 100%);
    max-height: 88vh;
    display: flex;
    flex-direction: column;
    animation: pop 140ms ease;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 1.25rem;
    border-bottom: 1px solid var(--border);
  }

  .modal-header h2 {
    font-size: 1.05rem;
  }

  .modal-header-actions {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .modal-body {
    padding: 1.25rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  section h3 {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 0.7rem;
  }

  .field-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.8rem;
    margin-bottom: 0.8rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-bottom: 0.8rem;
  }

  .field:last-child {
    margin-bottom: 0;
  }

  .chip-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    color: var(--text);
    background: var(--surface-2);
    border: 1px solid var(--border);
    padding: 0.35rem 0.7rem;
    border-radius: 999px;
    cursor: pointer;
    user-select: none;
    transition: border-color 120ms ease;
  }

  .chip:has(input:checked) {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
    color: var(--accent);
  }

  .chip input {
    accent-color: var(--accent);
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--border);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0.97) translateY(6px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @media (max-width: 640px) {
    .backdrop {
      padding: 0.75rem;
    }

    .modal {
      max-height: calc(100dvh - 1.5rem);
    }
  }
</style>
