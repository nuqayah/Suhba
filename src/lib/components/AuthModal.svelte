<script>
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/stores/translations';
  import { User, X, Mail, Phone, Chrome } from 'lucide-svelte';
  
  let { isOpen = false, onClose } = $props();
  
  const t = $derived(translations[$currentLanguage.code]);
  
  let authMode = $state('login');
  let loginMethod = $state('google');
  let email = $state('');
  let phone = $state('');
  let password = $state('');
  
  function handleGoogleLogin() {
    // Implement Google login logic here
    console.log('Google login clicked');
    onClose();
  }
  
  function handleEmailLogin() {
    // Implement email login logic here
    console.log('Email login:', email, password);
    onClose();
  }
  
  function handlePhoneLogin() {
    // Implement phone login logic here
    console.log('Phone login:', phone, password);
    onClose();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full p-6 {$currentLanguage.direction === 'rtl' ? 'text-right' : 'text-left'}">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-3 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
          <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <User class="w-5 h-5 text-white" />
          </div>
          <h2 class="text-xl font-bold text-gray-800">{authMode === 'login' ? t.login : t.signUp}</h2>
        </div>
        <button
          onclick={onClose}
          class="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X class="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <!-- Auth Method Selection -->
      <div class="mb-6">
        <div class="flex space-x-2 mb-4 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
          <button
            onclick={() => authMode = 'login'}
            class="flex-1 py-2 px-4 rounded-xl transition-all duration-300 {
              authMode === 'login'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }"
          >
            {t.login}
          </button>
          <button
            onclick={() => authMode = 'signup'}
            class="flex-1 py-2 px-4 rounded-xl transition-all duration-300 {
              authMode === 'signup'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }"
          >
            {t.signUp}
          </button>
        </div>
      </div>
      
      <!-- Google Login -->
      <button
        onclick={handleGoogleLogin}
        class="w-full mb-4 p-4 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center space-x-3 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}"
      >
        <Chrome class="w-5 h-5 text-gray-600" />
        <span class="font-medium text-gray-800">{t.loginWithGoogle}</span>
      </button>
      
      <div class="flex items-center mb-4">
        <div class="flex-1 h-px bg-gray-200"></div>
        <span class="px-3 text-gray-500 text-sm">أو</span>
        <div class="flex-1 h-px bg-gray-200"></div>
      </div>
      
      <!-- Login Method Toggle -->
      <div class="flex space-x-2 mb-4 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
        <button
          onclick={() => loginMethod = 'email'}
          class="flex-1 py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''} {
            loginMethod === 'email'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
          }"
        >
          <Mail class="w-4 h-4" />
          <span class="text-sm">{t.email}</span>
        </button>
        <button
          onclick={() => loginMethod = 'phone'}
          class="flex-1 py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''} {
            loginMethod === 'phone'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'text-gray-600 hover:bg-gray-100 border-2 border-gray-200'
          }"
        >
          <Phone class="w-4 h-4" />
          <span class="text-sm">{t.phone}</span>
        </button>
      </div>
      
      <!-- Email/Phone Form -->
      <div class="space-y-4">
        {#if loginMethod === 'email'}
          <input
            type="email"
            bind:value={email}
            placeholder={t.email}
            class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors {$currentLanguage.direction === 'rtl' ? 'text-right' : 'text-left'}"
          />
        {:else}
          <input
            type="tel"
            bind:value={phone}
            placeholder={t.phone}
            class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors {$currentLanguage.direction === 'rtl' ? 'text-right' : 'text-left'}"
          />
        {/if}
        
        <input
          type="password"
          bind:value={password}
          placeholder={t.password}
          class="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors {$currentLanguage.direction === 'rtl' ? 'text-right' : 'text-left'}"
        />
        
        <button
          onclick={loginMethod === 'email' ? handleEmailLogin : handlePhoneLogin}
          class="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 font-semibold"
        >
          {authMode === 'login' ? t.login : t.signUp}
        </button>
      </div>
    </div>
  </div>
{/if}