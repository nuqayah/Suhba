<script>
  import { onMount } from 'svelte';
  import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-svelte';

  let {
    message,
    type = 'info',
    duration = 4000,
    onClose
  } = $props();

  let visible = $state(true);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const styles = {
    success: 'bg-green-500/90 text-white border-green-400',
    error: 'bg-red-500/90 text-white border-red-400',
    warning: 'bg-yellow-500/90 text-white border-yellow-400',
    info: 'bg-blue-500/90 text-white border-blue-400'
  };

  function handleClose() {
    visible = false;
    setTimeout(() => {
      onClose?.();
    }, 300);
  }

  onMount(() => {
    if (duration > 0) {
      const timeout = setTimeout(handleClose, duration);
      return () => clearTimeout(timeout);
    }
  });

  const Icon = $derived(icons[type]);
</script>

{#if visible}
  <div 
    class="fixed top-4 right-4 z-50 max-w-sm w-full sm:w-auto transform transition-all duration-300 {visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}"
    role="alert"
    aria-live="polite"
  >
    <div class="backdrop-blur-md rounded-xl border {styles[type]} p-4 shadow-lg">
      <div class="flex items-center space-x-3">
        <Icon class="w-5 h-5 flex-shrink-0" />
        <p class="font-medium flex-1">{message}</p>
        <button
          onclick={handleClose}
          class="text-white/70 hover:text-white transition-colors p-1"
          aria-label="Close notification"
        >
          <XCircle class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
{/if}
