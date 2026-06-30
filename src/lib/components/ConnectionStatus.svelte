<script>
  import { connectionState } from '$lib/stores/websocket';
  import { Wifi, WifiOff, RotateCw } from 'lucide-svelte';

  let {
    position = 'top-right',
    size = 'md',
    showText = false
  } = $props();

  const positionClasses = {
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'inline': 'relative inline-flex'
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  function getStatusText(state) {
    if (state.connecting) return 'Connecting...';
    if (state.connected) return 'Connected';
    if (state.error) return state.error;
    return 'Disconnected';
  }

  function getStatusColor(state) {
    if (state.connecting) return 'bg-amber-500/90 border-amber-400';
    if (state.connected) return 'bg-green-500/90 border-green-400';
    return 'bg-red-500/90 border-red-400';
  }

  function getIcon(state) {
    if (state.connecting) return RotateCw;
    if (state.connected) return Wifi;
    return WifiOff;
  }
</script>

<div class="{positionClasses[position]} {showText ? 'flex items-center space-x-2' : ''}">
  <div 
    class="
      {sizeClasses[size]} 
      {getStatusColor($connectionState)}
      backdrop-blur-md rounded-full border flex items-center justify-center
      transition-all duration-300 shadow-lg
      {$connectionState.connecting ? 'animate-pulse' : ''}
    "
    title={getStatusText($connectionState)}
    role="status"
    aria-label="Connection status: {getStatusText($connectionState)}"
  >
    {#if $connectionState.connecting}
      <RotateCw class="{iconSizes[size]} text-white animate-spin" />
    {:else if $connectionState.connected}
      <Wifi class="{iconSizes[size]} text-white" />
    {:else}
      <WifiOff class="{iconSizes[size]} text-white" />
    {/if}
  </div>
  
  {#if showText}
    <span 
      class="
        text-sm font-medium px-3 py-1 rounded-full backdrop-blur-md border
        {getStatusColor($connectionState)} text-white
        transition-all duration-300
      "
    >
      {getStatusText($connectionState)}
    </span>
  {/if}
</div>