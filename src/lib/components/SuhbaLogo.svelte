<script>
  let { size = '120px', className = '' } = $props();
</script>

<svg 
  width={size} 
  height={size} 
  viewBox="0 0 120 120" 
  class={className}
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- Orange background square -->
  <rect x="5" y="5" width="110" height="110" rx="25" fill="#f97316"/>
  
  <!-- Figure 1: Red Keffiyeh -->
  <g transform="translate(25, 45)">
    <!-- Head square -->
    <rect x="0" y="0" width="20" height="20" rx="2" fill="#d4a574"/>
    <!-- Red Keffiyeh -->
    <path d="M -2 0 Q 10 -5 22 0 L 20 -8 Q 10 -12 0 -8 Z" fill="#dc2626"/>
  </g>
  
  <!-- Figure 2: Red and White Shemagh -->
  <g transform="translate(50, 45)">
    <!-- Head square -->
    <rect x="0" y="0" width="20" height="20" rx="2" fill="#d4a574"/>
    <!-- Red and White Shemagh -->
    <path d="M -2 0 Q 10 -5 22 0 L 20 -8 Q 10 -12 0 -8 Z" fill="#ffffff"/>
    <!-- Red checkered pattern -->
    <g fill="#dc2626">
      <rect x="2" y="-6" width="2" height="2"/>
      <rect x="6" y="-6" width="2" height="2"/>
      <rect x="10" y="-6" width="2" height="2"/>
      <rect x="14" y="-6" width="2" height="2"/>
      <rect x="4" y="-4" width="2" height="2"/>
      <rect x="8" y="-4" width="2" height="2"/>
      <rect x="12" y="-4" width="2" height="2"/>
    </g>
  </g>
  
  <!-- Figure 3: Bald with Glasses -->
  <g transform="translate(75, 45)">
    <!-- Head square -->
    <rect x="0" y="0" width="20" height="20" rx="2" fill="#d4a574"/>
    <!-- Glasses -->
    <g stroke="#374151" stroke-width="1.5" fill="none">
      <!-- Left lens -->
      <circle cx="6" cy="10" r="3"/>
      <!-- Right lens -->
      <circle cx="14" cy="10" r="3"/>
      <!-- Bridge -->
      <line x1="9" y1="10" x2="11" y2="10"/>
    </g>
  </g>
</svg>

<style>
  svg {
    display: block;
    margin: 0 auto;
  }
</style>
