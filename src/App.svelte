<script>
  import Header from "./lib/Header.svelte";
  import DatabaseView from "./lib/DatabaseView.svelte";
  import PreviewView from "./lib/PreviewView.svelte";
  import DishModal from "./lib/DishModal.svelte";
  import ConfirmDialog from "./lib/ConfirmDialog.svelte";
  import { ui } from "./lib/ui.svelte.js";
</script>

<Header />

<main class="container">
  {#if ui.activeTab === "database"}
    <DatabaseView />
  {:else}
    <PreviewView />
  {/if}
</main>

<DishModal />
<ConfirmDialog />

<footer class="app-footer">
  <div class="container">
    <p>Created by RV and JK. &copy; 2026 RVJK</p>
  </div>
</footer>

<style>
  main {
    flex: 1;
    padding-bottom: 4.5rem;
  }

  .app-footer {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10;
    background: var(--bg);
    border-top: 1px solid var(--border);
    padding: 1.25rem 0;
    color: var(--text-muted);
    font-size: 0.82rem;
    text-align: center;
  }

  .app-footer p {
    margin: 0;
  }
</style>
