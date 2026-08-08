<script>
  import { ui } from "./ui.svelte.js";
</script>

{#if ui.confirm}
  <div
    class="backdrop"
    role="presentation"
    onclick={() => ui.resolveConfirm(false)}
  >
    <div
      class="dialog card-surface"
      role="alertdialog"
      aria-modal="true"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === "Escape" && ui.resolveConfirm(false)}
    >
      <p class="message">{ui.confirm.message}</p>
      <div class="actions">
        <button class="btn btn-ghost" onclick={() => ui.resolveConfirm(false)}
          >Cancel</button
        >
        <button
          class="btn {ui.confirm.danger ? 'btn-danger' : 'btn-primary'}"
          onclick={() => ui.resolveConfirm(true)}
        >
          {ui.confirm.confirmLabel ?? "Confirm"}
        </button>
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
    z-index: 200;
    animation: fadeIn 120ms ease;
  }

  .dialog {
    width: min(360px, 90vw);
    padding: 1.25rem;
    animation: pop 140ms ease;
  }

  .message {
    margin: 0 0 1rem;
    font-size: 0.95rem;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
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
      transform: scale(0.96) translateY(4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
