<script>
  import { onMount, onDestroy } from 'svelte';
  import { salahStore } from '$lib/stores/salah';
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/stores/translations';
  import { Clock, Sun, Moon, Sunrise, Calendar, Compass, Building } from 'lucide-svelte';
  
  let { currentTheme = { text: 'text-white/80' }, theme = 'desert' } = $props();
  
  const t = $derived(translations[$currentLanguage.code]);
  
  // Custom Mosque Icon Component
  function MosqueIcon({ class: className = 'w-4 h-4' }) {
    return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l-2 2v2H8l-2 2v2H4v12h16V10h-2V8l-2-2h-2V4l-2-2z"/>
      <circle cx="8" cy="6" r="1"/>
      <circle cx="16" cy="6" r="1"/>
      <path d="M10 14h4v4h-4z"/>
    </svg>`;
  }

  // Theme-based clock icon and text
  const clockProps = $derived({
    desert: { icon: 'mosque', text: $currentLanguage.code === 'ar' ? 'وقت الصلاة' : 'Salah Time' },
    scroll: { icon: 'mosque', text: $currentLanguage.code === 'ar' ? 'وقت الصلاة' : 'Salah Time' },
    midnight: { icon: 'mosque', text: $currentLanguage.code === 'ar' ? 'وقت الصلاة' : 'Salah Time' }
  }[theme] || { icon: 'mosque', text: 'Next Salah' });
  
  onMount(() => {
    salahStore.init();
  });
  
  onDestroy(() => {
    salahStore.destroy();
  });
</script>

<div class="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-sm {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
  <!-- Mosque Icon -->
  <svg class="w-4 h-4 {currentTheme.iconColor}" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l-2 2v2H8l-2 2v2H4v12h16V10h-2V8l-2-2h-2V4l-2-2z"/>
    <circle cx="8" cy="6" r="1"/>
    <circle cx="16" cy="6" r="1"/>
    <path d="M10 14h4v4h-4z"/>
  </svg>
  <div class="{currentTheme.suhbaColor} font-medium">
    {#if $salahStore.next}
      <span class="text-xs opacity-80">{clockProps.text}:</span>
      <span class="font-bold {$currentLanguage.direction === 'rtl' ? 'mr-1' : 'ml-1'}">
        {$currentLanguage.code === 'ar' ? $salahStore.next.arabicName : t[$salahStore.next.name]}:
      </span>
      <span class="{currentTheme.iconColor} font-bold {$currentLanguage.direction === 'rtl' ? 'mr-1' : 'ml-1'}">
        {$salahStore.timeUntilNext}
      </span>
    {:else}
      <span>{clockProps.text}</span>
    {/if}
  </div>
</div>

<style>
  /* Ensure the component is always visible */
  div {
    min-width: fit-content;
  }
</style>