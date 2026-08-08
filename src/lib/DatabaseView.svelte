<script>
  import Icon from "./Icon.svelte";
  import { store } from "./store.svelte.js";
  import { ui } from "./ui.svelte.js";
  import { parseBoldLines } from "./richText.js";

  const columns = [
    { key: "id", label: "ID" },
    { key: "tags", label: "Tags" },
    { key: "category", label: "Category" },
    { key: "german", label: "German" },
    { key: "english", label: "English" },
  ];

  function sortIcon(col) {
    if (store.currentSort !== col) return "sort";
    return store.currentSortDir === "asc" ? "sortUp" : "sortDown";
  }
</script>

<div class="toolbar">
  <div class="hint">
    <Icon name="tag" size={14} /> Always print the PDF at 100% scale — card dimensions
    are calibrated to the physical stock.
  </div>
  <button
    class="btn btn-success"
    disabled={!store.filteredDishes.length}
    onclick={() => store.addAllToCards()}
  >
    <Icon name="plus" size={16} /> Add all to preview
  </button>
</div>

<div class="table-wrap card-surface">
  <table>
    <thead>
      <tr>
        {#each columns as col}
          <th class="sortable" onclick={() => store.sort(col.key)}>
            <span>{col.label}</span>
            <Icon name={sortIcon(col.key)} size={13} />
          </th>
        {/each}
        <th class="col-actions">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each store.sortedDishes as dish (dish.id)}
        <tr>
          <td class="col-id">{dish.id}</td>
          <td>{dish.tags?.length ? dish.tags.join(", ") : ""}</td>
          <td>{dish.category}</td>
          <td>
            {#each parseBoldLines(dish.germanText) as line, i}
              {#if i > 0}<br />{/if}
              {#each line as run}
                {#if run.bold}<strong>{run.text}</strong>{:else}{run.text}{/if}
              {/each}
            {/each}
          </td>
          <td>
            {#each parseBoldLines(dish.englishText) as line, i}
              {#if i > 0}<br />{/if}
              {#each line as run}
                {#if run.bold}<strong>{run.text}</strong>{:else}{run.text}{/if}
              {/each}
            {/each}
          </td>
          <td class="col-actions">
            <div class="row-actions">
              <button
                class="btn btn-icon btn-danger"
                title="Delete"
                onclick={() => ui.confirmDeleteDish(dish.id)}
              >
                <Icon name="trash" size={15} />
              </button>
              <button
                class="btn btn-icon btn-warning"
                title="Duplicate"
                onclick={() => ui.openCopyDish(dish.id)}
              >
                <Icon name="copy" size={15} />
              </button>
              <button
                class="btn btn-icon btn-primary"
                title="Edit"
                onclick={() => ui.openEditDish(dish.id)}
              >
                <Icon name="edit" size={15} />
              </button>
              <button
                class="btn btn-icon btn-success"
                title="Add to preview (shift-click for ×6)"
                onclick={(e) => store.addToCards(dish.id, e.shiftKey)}
              >
                <Icon name="plus" size={15} />
              </button>
            </div>
          </td>
        </tr>
      {:else}
        <tr
          ><td colspan={columns.length + 1} class="empty-row"
            >No dishes match your search.</td
          ></tr
        >
      {/each}
    </tbody>
  </table>
</div>

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

  .table-wrap {
    overflow-x: auto;
    margin-bottom: 2rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;
  }

  thead th {
    text-align: left;
    background: var(--surface-2);
    color: var(--text-muted);
    font-weight: 600;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.7rem 0.9rem;
    white-space: nowrap;
  }

  th.sortable {
    cursor: pointer;
    user-select: none;
    display: table-cell;
  }

  th.sortable span {
    margin-right: 0.15rem;
  }

  th.sortable:hover {
    color: var(--text);
  }

  td {
    padding: 0.65rem 0.9rem;
    border-top: 1px solid var(--border);
    vertical-align: top;
  }

  .col-id {
    color: var(--text-muted);
    width: 3.5rem;
  }

  .col-actions {
    text-align: center;
    white-space: nowrap;
  }

  .row-actions {
    display: inline-flex;
    gap: 0.3rem;
  }

  .empty-row {
    text-align: center;
    color: var(--text-muted);
    padding: 2rem;
  }

  tbody tr:hover {
    background: var(--surface-2);
  }
</style>
