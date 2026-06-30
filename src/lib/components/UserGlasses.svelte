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
  
  <!-- Glasses -->
  <g stroke-width="1.5">
    <!-- Left lens -->
    <circle cx="10" cy="8.5" r="1.8"/>
    <!-- Right lens -->
    <circle cx="14" cy="8.5" r="1.8"/>
    <!-- Bridge -->
    <line x1="11.8" y1="8.5" x2="12.2" y2="8.5"/>
    <!-- Left temple -->
    <line x1="8.2" y1="8.5" x2="7.5" y2="8"/>
    <!-- Right temple -->
    <line x1="15.8" y1="8.5" x2="16.5" y2="8"/>
  </g>
</svg>
