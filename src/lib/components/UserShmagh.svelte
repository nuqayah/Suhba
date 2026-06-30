<script>
  let { className = '', size = 24 } = $props();
</script>

<svg 
  width={size} 
  height={size} 
  viewBox="0 0 24 24" 
  class="{className}"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- Head circle -->
  <circle cx="12" cy="9" r="3"/>
  
  <!-- Body -->
  <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
  
  <!-- Shmagh/Shemagh head covering -->
  <path d="M8.5 6.5 C9 4.5 10.5 3.5 12 3.5 C13.5 3.5 15 4.5 15.5 6.5"/>
  <path d="M8.5 6.5 C8 5.5 7.5 5 7.5 4.5 C7.5 4 8 3.5 8.5 3.5"/>
  <path d="M15.5 6.5 C16 5.5 16.5 5 16.5 4.5 C16.5 4 16 3.5 15.5 3.5"/>
  
  <!-- Checkered pattern lines -->
  <line x1="9" y1="4.5" x2="9.5" y2="4"/>
  <line x1="10.5" y1="4.5" x2="11" y2="4"/>
  <line x1="13" y1="4.5" x2="13.5" y2="4"/>
  <line x1="14.5" y1="4.5" x2="15" y2="4"/>
</svg>
