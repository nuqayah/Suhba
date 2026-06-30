<script>
  import { onMount } from 'svelte';
  import { showInstallPrompt, getInstallInstructions, isPWA } from '$lib/pwa';
  import { Download, X, Smartphone } from 'lucide-svelte';

  let showPrompt = $state(false);
  let isAppInstalled = $state(false);

  onMount(() => {
    // Check if already installed as PWA
    isAppInstalled = isPWA();
    
    // Show install prompt after a delay if not installed
    if (!isAppInstalled) {
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('suhba-install-prompt-dismissed');
        if (!hasSeenPrompt) {
          showPrompt = true;
        }
      }, 5000); // Show after 5 seconds of usage
    }
  });

  async function handleInstall() {
    const success = await showInstallPrompt();
    if (success) {
      showPrompt = false;
      localStorage.setItem('suhba-install-prompt-dismissed', 'true');
    }
  }

  function dismissPrompt() {
    showPrompt = false;
    localStorage.setItem('suhba-install-prompt-dismissed', 'true');
  }
</script>

{#if showPrompt && !isAppInstalled}
  <div class="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
    <div class="bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-lg shadow-lg p-4 border border-amber-500">
      <!-- Close button -->
      <button 
        onclick={dismissPrompt}
        class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
        aria-label="Dismiss install prompt"
      >
        <X size={14} />
      </button>

      <div class="flex items-start gap-3 pr-6">
        <!-- Icon -->
        <div class="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Smartphone size={18} />
        </div>

        <!-- Content -->
        <div class="flex-1">
          <h3 class="font-bold text-sm mb-1">📱 Install Suhba App</h3>
          <p class="text-xs opacity-90 mb-3">
            Get quick access to Islamic trivia games! Install for offline play and faster loading.
          </p>
          
          <!-- Install button -->
          <button 
            onclick={handleInstall}
            class="bg-white text-amber-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            <Download size={14} />
            Install App
          </button>
          
          <!-- Instructions for manual install -->
          <p class="text-xs opacity-75 mt-2">
            {getInstallInstructions()}
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- PWA Status indicator (for development) -->
{#if isAppInstalled}
  <div class="fixed top-4 right-4 z-40 opacity-50">
    <div class="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
      📱 PWA
    </div>
  </div>
{/if}