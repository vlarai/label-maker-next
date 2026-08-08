<script>
  import Icon from "./Icon.svelte";
  import { store } from "./store.svelte.js";
  import { ui } from "./ui.svelte.js";
  import { diets, allergens } from "./data.js";
  import { iconUrl } from "./foodIcons.js";
  import { parseBoldLines } from "./richText.js";
</script>

<div class="toolbar">
  <div class="hint">
    <Icon name="tag" size={14} /> Click a card to remove it. Always print at 100%
    scale — the sizes below are calibrated to the PDF output.
  </div>
  <button
    class="btn btn-danger"
    disabled={!store.cards.length}
    onclick={() => ui.confirmDeleteAllCards()}
  >
    <Icon name="trash" size={16} /> Delete all
  </button>
</div>

{#if !store.cards.length}
  <div class="empty-state card-surface">
    No labels in the preview yet. Go to the Database tab and add dishes.
  </div>
{:else}
  <div class="printable">
    {#each store.cards as card, index (index)}
      <div
        class="hilton-card"
        role="button"
        tabindex="0"
        title="Click to remove"
        onclick={() => store.deleteCard(index)}
        onkeydown={(e) =>
          (e.key === "Enter" || e.key === " ") && store.deleteCard(index)}
      >
        <div class="hilton-item">
          {#each parseBoldLines(card.germanText) as line}
            <p>
              {#each line as run}
                {#if run.bold}<strong>{run.text}</strong>{:else}{run.text}{/if}
              {/each}
            </p>
          {/each}
        </div>
        <hr />
        <div class="hilton-item">
          {#each parseBoldLines(card.englishText) as line}
            <p>
              {#each line as run}
                {#if run.bold}<strong>{run.text}</strong>{:else}{run.text}{/if}
              {/each}
            </p>
          {/each}
        </div>
        <div class="hilton-item">
          <div class="icons">
            <div class="diets">
              {#each card.diets as diet}
                <div class="icon">
                  <img
                    src={iconUrl(diets[diet].toLowerCase())}
                    height="50"
                    alt={diets[diet]}
                  />
                </div>
              {/each}
            </div>
            <div class="allergens">
              {#each card.allergens as allergen}
                <div class="icon">
                  <img
                    src={iconUrl(allergens[allergen].toLowerCase())}
                    height="50"
                    alt={allergens[allergen]}
                  />
                  <div class="bottom-center">{allergens[allergen]}</div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    margin: 1.25rem 0;
  }

  .hint {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.82rem;
    color: var(--text-muted);
    background: var(--surface-2);
    padding: 0.45rem 0.75rem;
    border-radius: var(--radius-sm);
  }

  .empty-state {
    padding: 3rem 1.5rem;
    text-align: center;
    color: var(--text-muted);
    margin-bottom: 2rem;
  }

  /* --- printable grid: sizes below mirror the PDF card geometry (65mm x 115mm)
     so the on-screen preview stays true to what the printed label looks like. --- */
  .printable {
    margin: 0 auto 2rem;
    display: grid;
    grid-template-columns: repeat(3, 184pt);
    justify-content: center;
    gap: 1rem;
    overflow-x: auto;
  }

  .hilton-card {
    display: grid;
    grid-template-rows: 1fr 2pt 1fr 1fr;
    align-items: center;
    font-family: "Loew 2.0", sans-serif;
    font-size: 14pt;
    text-align: center;
    width: 184pt;
    height: 326pt;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition:
      box-shadow 120ms ease,
      transform 120ms ease,
      border-color 120ms ease;
  }

  .hilton-card:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--danger);
    transform: translateY(-2px);
  }

  .hilton-card:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }

  .hilton-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 12pt;
    color: var(--text);
  }

  .hilton-card p {
    margin: 0;
  }

  .hilton-card hr {
    width: 75%;
    margin: auto;
    border: none;
    height: 1pt;
    background-color: var(--border);
  }

  .icons {
    display: flex;
    flex-flow: column;
    margin-bottom: 10pt;
  }

  .diets {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .allergens {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap-reverse;
    justify-content: center;
  }

  .icon {
    position: relative;
    margin-bottom: 8pt;
  }

  .bottom-center {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 8pt;
    color: var(--text);
  }
</style>
