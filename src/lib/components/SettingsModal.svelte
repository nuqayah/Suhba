<script>
  import { currentLanguage, languages } from '$lib/stores/language';
  import { translations } from '$lib/stores/translations';
  import { Settings, X, Globe, Palette } from 'lucide-svelte';
  import { onMount } from 'svelte';
  
  let modalElement = $state();
  
  let { isOpen = false, onClose, currentTheme = 'desert', onThemeChange } = $props();
  
  const t = $derived(translations[$currentLanguage.code]);
  
  function handleLanguageChange(lang) {
    currentLanguage.setLanguage(lang);
  }
  
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      onClose();
    }
  }
  
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
  
  onMount(() => {
    // Focus trap for accessibility
    if (modalElement && isOpen) {
      const focusableElements = modalElement.querySelectorAll(
        'button, [href], [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      function trapFocus(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
      
      document.addEventListener('keydown', trapFocus);
      firstElement?.focus();
      
      return () => {
        document.removeEventListener('keydown', trapFocus);
      };
    }
  });
  
  // Reactive theme names that update with language changes
  const themes = $derived([
    { id: 'desert', name: t.themeDesert, emoji: '🏜️' },
    { id: 'scroll', name: t.themeScroll, emoji: '📜' },
    { id: 'midnight', name: t.themeMidnight, emoji: '🌙' }
  ]);
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 theme-transition"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="settings-title"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div 
      bind:this={modalElement}
      class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full p-6 theme-transition {$currentLanguage.direction === 'rtl' ? 'text-right' : 'text-left'}"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
          <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center" aria-hidden="true">
            <Settings class="w-5 h-5 text-white" />
          </div>
          <h2 id="settings-title" class="text-xl font-bold text-gray-800">{t.settings}</h2>
        </div>
        <button
          onclick={onClose}
          class="p-2 hover:bg-gray-100 rounded-xl transition-colors focus-ring touch-target"
          aria-label="{t.close || 'Close settings'}"
        >
          <X class="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <!-- Language Settings -->
      <div class="mb-8">
        <div class="flex items-center space-x-2 mb-4 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
          <Globe class="w-5 h-5 text-gray-600" aria-hidden="true" />
          <h3 class="font-semibold text-gray-800">{t.language}</h3>
        </div>
        <div class="space-y-2" role="radiogroup" aria-labelledby="language-group">
          <span id="language-group" class="sr-only">{t.language}</span>
          {#each languages as lang}
            <button
              onclick={() => handleLanguageChange(lang)}
              class="w-full p-3 rounded-xl border-2 smooth-transition flex items-center justify-between focus-ring touch-target {
                $currentLanguage.code === lang.code 
                  ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-300' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }"
              role="radio"
              aria-checked={$currentLanguage.code === lang.code}
              aria-label="{lang.name}"
            >
              <div class="flex items-center space-x-3 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
                {#if lang.code === 'en'}
                  <svg class="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                    <text x="12" y="16" text-anchor="middle" class="text-xs font-bold fill-white">EN</text>
                  </svg>
                {:else}
                  <svg class="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" fill="#10B981"/>
                    <text x="12" y="16" text-anchor="middle" class="text-xs font-bold fill-white">AR</text>
                  </svg>
                {/if}
                <span class="font-medium text-gray-800">{lang.name}</span>
              </div>
              {#if $currentLanguage.code === lang.code}
                <div class="w-2 h-2 bg-indigo-500 rounded-full" aria-hidden="true"></div>
              {/if}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Theme Settings -->
      <div class="mb-6">
        <div class="flex items-center space-x-2 mb-4 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
          <Palette class="w-5 h-5 text-gray-600" aria-hidden="true" />
          <h3 class="font-semibold text-gray-800">{t.theme}</h3>
        </div>
        <div class="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="theme-group">
          <span id="theme-group" class="sr-only">{t.theme}</span>
          {#each themes as theme}
            <button
              onclick={() => onThemeChange(theme.id)}
              class="p-3 rounded-xl border-2 smooth-transition text-center focus-ring touch-target {
                currentTheme === theme.id 
                  ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-300' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }"
              role="radio"
              aria-checked={currentTheme === theme.id}
              aria-label="{theme.name}"
            >
              <div class="text-2xl mb-1" aria-hidden="true">{theme.emoji}</div>
              <div class="text-xs font-medium text-gray-700">{theme.name}</div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}