<script>
  import { toastManager } from '$lib/stores/toast';
  import Toast from './Toast.svelte';
  
  // Extract the store directly
  const toastsStore = toastManager.toasts;
</script>

<div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
  {#each $toastsStore as toast (toast.id)}
    <div class="pointer-events-auto">
      <Toast
        message={toast.message}
        type={toast.type}
        duration={0}
        onClose={() => toastManager.removeToast(toast.id)}
      />
    </div>
  {/each}
</div>