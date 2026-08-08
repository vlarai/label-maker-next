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
    <p>Created by RV and JK. &copy; 2025 RVJK</p>
  </div>
</footer>

<style>
  main {
    padding-bottom: 4rem;
    min-height: 60vh;
  }

  .app-footer {
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
