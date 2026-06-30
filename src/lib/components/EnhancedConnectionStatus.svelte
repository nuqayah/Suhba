<script>
  import { connectionState } from '$lib/stores/enhancedWebsocket';
  import { Wifi, WifiOff, AlertCircle, CheckCircle, Loader } from 'lucide-svelte';

  let { position = 'top-right', size = 'md', showDetails = false } = $props();

  function getPositionClasses() {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'top-4 right-4';
    }
  }

  function getSizeClasses() {
    switch (size) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'md': return 'w-8 h-8 text-sm';
      case 'lg': return 'w-10 h-10 text-base';
      default: return 'w-8 h-8 text-sm';
    }
  }

  function getStatusIcon(state) {
    if (state.connecting || state.reconnecting) return Loader;
    if (state.connected) {
      switch (state.quality) {
        case 'excellent':
        case 'good': return CheckCircle;
        case 'fair': return Wifi;
        case 'poor': return AlertCircle;
        default: return WifiOff;
      }
    }
    return WifiOff;
  }

  function getStatusColor(state) {
    if (state.connecting || state.reconnecting) return 'text-blue-500 bg-blue-100';
    if (state.connected) {
      switch (state.quality) {
        case 'excellent': return 'text-green-500 bg-green-100';
        case 'good': return 'text-yellow-500 bg-yellow-100';
        case 'fair': return 'text-orange-500 bg-orange-100';
        case 'poor': return 'text-red-500 bg-red-100';
        default: return 'text-gray-500 bg-gray-100';
      }
    }
    return 'text-red-500 bg-red-100';
  }

  function getStatusText(state) {
    if (state.connecting) return 'Connecting to Suhba...';
    if (state.reconnecting) return 'Reconnecting...';
    if (state.connected) {
      switch (state.quality) {
        case 'excellent': return `Excellent (${state.latency}ms)`;
        case 'good': return `Good (${state.latency}ms)`;
        case 'fair': return `Fair (${state.latency}ms)`;
        case 'poor': return `Poor (${state.latency}ms)`;
        default: return 'Connected';
      }
    }
    return state.error || 'Disconnected';
  }

  const StatusIcon = $derived(getStatusIcon($connectionState));
</script>

<!-- Connection Status Indicator -->
<div class="fixed {getPositionClasses()} z-40">
  <div class="relative group">
    <!-- Status Icon -->
    <div class="
      {getSizeClasses()} 
      {getStatusColor($connectionState)}
      rounded-full 
      flex items-center justify-center 
      border-2 border-white 
      shadow-lg 
      backdrop-blur-sm
      transition-all duration-200
      {$connectionState.connecting || $connectionState.reconnecting ? 'animate-pulse' : ''}
    ">
      <StatusIcon
        size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16}
        class={$connectionState.connecting || $connectionState.reconnecting ? 'animate-spin' : ''}
      />
    </div>

    <!-- Detailed Status Tooltip -->
    {#if showDetails || true}
      <div class="
        absolute right-0 top-full mt-2 
        bg-white/95 backdrop-blur-sm 
        border border-gray-200 
        rounded-lg shadow-lg p-3 
        min-w-48
        opacity-0 group-hover:opacity-100 
        transform translate-y-1 group-hover:translate-y-0 
        pointer-events-none group-hover:pointer-events-auto
        transition-all duration-200
        text-xs
      ">
        <!-- Connection Status -->
        <div class="flex items-center gap-2 mb-2">
          <div class="w-2 h-2 rounded-full {
            $connectionState.connected ? 'bg-green-500' : 'bg-red-500'
          }"></div>
          <span class="font-medium text-gray-800">
            {$connectionState.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <!-- Connection Quality -->
        {#if $connectionState.connected}
          <div class="space-y-1 text-gray-600">
            <div class="flex justify-between">
              <span>Quality:</span>
              <span class="font-medium capitalize">{$connectionState.quality}</span>
            </div>
            <div class="flex justify-between">
              <span>Latency:</span>
              <span class="font-medium">{$connectionState.latency}ms</span>
            </div>
            
            <!-- Signal Strength Bars -->
            <div class="flex items-center gap-1 mt-2">
              <span class="text-xs text-gray-500 mr-2">Signal:</span>
              {#each Array(5) as _, i}
                <div class="
                  w-1 h-3 bg-gray-300 rounded-sm
                  {$connectionState.quality === 'excellent' && i < 5 ? 'bg-green-500' : ''}
                  {$connectionState.quality === 'good' && i < 4 ? 'bg-yellow-500' : ''}
                  {$connectionState.quality === 'fair' && i < 3 ? 'bg-orange-500' : ''}
                  {$connectionState.quality === 'poor' && i < 2 ? 'bg-red-500' : ''}
                "></div>
              {/each}
            </div>
          </div>
        {:else}
          <!-- Error Message -->
          {#if $connectionState.error}
            <div class="text-red-600 text-xs">
              {$connectionState.error}
            </div>
          {/if}
        {/if}

        <!-- Islamic Touch -->
        <div class="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
          🕌 {getStatusText($connectionState)}
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Reconnection Notice -->
{#if $connectionState.reconnecting}
  <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
    <div class="bg-white/95 backdrop-blur-sm border border-amber-200 rounded-lg shadow-lg p-6 text-center">
      <div class="animate-spin w-8 h-8 border-2 border-amber-300 border-t-amber-600 rounded-full mx-auto mb-3"></div>
      <h3 class="font-semibold text-amber-800 mb-2">Reconnecting to Suhba...</h3>
      <p class="text-sm text-gray-600">
        Don't worry, we'll have you back in the gathering soon! 🤲
      </p>
    </div>
  </div>
{/if}
