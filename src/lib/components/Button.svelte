<script>

  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    onclick,
    onkeydown,
    class: className = '',
    ariaLabel,
    type = 'button',
    children
  } = $props();

  const baseClasses = 'relative overflow-hidden font-semibold rounded-3xl focus-ring-improved smooth-transition touch-target interactive-card';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl hover:shadow-purple-500/25 btn-primary',
    secondary: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-2xl hover:shadow-emerald-500/25 btn-primary',
    glass: 'glass-effect text-white/90 hover:text-white hover:bg-white/20',
    theme: 'text-current opacity-60 hover:opacity-100 glass-effect border'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-6 text-lg'
  };

  function handleClick() {
    if (!disabled && !loading && onclick) {
      onclick();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
    if (onkeydown) {
      onkeydown(e);
    }
  }
</script>

<button
  {type}
  class="{baseClasses} {variants[variant]} {sizes[size]} {className} {disabled || loading ? 'btn-loading' : ''}"
  {disabled}
  onclick={handleClick}
  onkeydown={handleKeydown}
  aria-label={ariaLabel}
>
  {#if loading}
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="flex space-x-1">
        <div class="w-2 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 0ms"></div>
        <div class="w-2 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 150ms"></div>
        <div class="w-2 h-2 bg-white rounded-full animate-pulse" style="animation-delay: 300ms"></div>
      </div>
    </div>
    <div class="opacity-0">
      {@render children?.()}
    </div>
  {:else}
    {@render children?.()}
  {/if}
</button>