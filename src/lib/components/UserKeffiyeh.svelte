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
  
  <!-- Keffiyeh head covering -->
  <path d="M8.5 6.5 C9 4.5 10.5 3.5 12 3.5 C13.5 3.5 15 4.5 15.5 6.5"/>
  <path d="M8.5 6.5 C8 5.5 7.5 5 7.5 4.5 C7.5 4 8 3.5 8.5 3.5"/>
  <path d="M15.5 6.5 C16 5.5 16.5 5 16.5 4.5 C16.5 4 16 3.5 15.5 3.5"/>
  
  <!-- Keffiyeh pattern (more geometric) -->
  <path d="M9 3.8 L10 4.2 L11 3.8 L12 4.2 L13 3.8 L14 4.2 L15 3.8" stroke-width="1"/>
  <path d="M8.5 4.5 L9.5 5 L10.5 4.5 L11.5 5 L12.5 4.5 L13.5 5 L14.5 4.5 L15.5 5" stroke-width="1"/>
  
  <!-- Hanging tassels -->
  <line x1="8" y1="5.5" x2="8" y2="6.5" stroke-width="1"/>
  <line x1="16" y1="5.5" x2="16" y2="6.5" stroke-width="1"/>
</svg>
