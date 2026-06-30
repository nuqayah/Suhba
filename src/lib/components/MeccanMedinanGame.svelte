<script>
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/stores/translations';
  import { newGameContent } from '$lib/gameContent';
  import { Star, Check, RotateCcw } from 'lucide-svelte';
  
  let { currentTheme, onScore, onNext } = $props();
  
  const t = $derived(translations[$currentLanguage.code]);
  
  let gameData = newGameContent.meccanMedinan[0];
  let shuffledSurahs = $state([...gameData.surahs].sort(() => Math.random() - 0.5));
  let meccanDropped = $state([]);
  let medinanDropped = $state([]);
  let showResult = $state(false);
  let draggedItem = $state(null);
  
  function handleDragStart(event, surah) {
    draggedItem = surah;
    event.dataTransfer.effectAllowed = 'move';
  }
  
  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }
  
  function handleDrop(event, category) {
    event.preventDefault();
    if (draggedItem) {
      if (category === 'meccan') {
        meccanDropped = [...meccanDropped, draggedItem];
      } else {
        medinanDropped = [...medinanDropped, draggedItem];
      }
      shuffledSurahs = shuffledSurahs.filter(s => s.id !== draggedItem.id);
      draggedItem = null;
    }
  }
  
  function checkAnswer() {
    const meccanCorrect = meccanDropped.every(s => s.type === 'meccan');
    const medinanCorrect = medinanDropped.every(s => s.type === 'medinan');
    const allPlaced = shuffledSurahs.length === 0;
    
    if (allPlaced && meccanCorrect && medinanCorrect) {
      onScore();
    }
    showResult = true;
  }
  
  function reset() {
    shuffledSurahs = [...gameData.surahs].sort(() => Math.random() - 0.5);
    meccanDropped = [];
    medinanDropped = [];
    showResult = false;
  }
  
  const canCheck = $derived(shuffledSurahs.length === 0);
</script>

<div class="space-y-8">
  <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm">
    <div class="flex items-center justify-center mb-6">
      <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
        <Star class="w-8 h-8 text-white" />
      </div>
    </div>
    
    <h3 class="text-xl font-semibold {currentTheme.text} mb-6 text-center">{gameData.prompt}</h3>
    
    <!-- Remaining Surahs -->
    <div class="mb-8">
      <h4 class="text-lg font-medium {currentTheme.text} mb-4">Surahs to Classify:</h4>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        {#each shuffledSurahs as surah}
          <div
            draggable="true"
            ondragstart={(e) => handleDragStart(e, surah)}
            class="p-3 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-xl cursor-move hover:scale-105 transition-all duration-300 text-center"
          >
            <div class="font-semibold text-blue-800">{surah.name}</div>
            <div class="text-sm text-blue-600">{surah.arabic}</div>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Drop Zones -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Meccan Drop Zone -->
      <div
        class="min-h-32 p-6 border-2 border-dashed border-amber-300 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50"
        ondragover={handleDragOver}
        ondrop={(e) => handleDrop(e, 'meccan')}
      >
        <h4 class="text-lg font-bold text-amber-800 mb-4 text-center">{t.meccan} مكي</h4>
        <div class="space-y-2">
          {#each meccanDropped as surah}
            <div class="p-2 bg-amber-200 rounded-lg text-center">
              <div class="font-medium text-amber-900">{surah.name}</div>
              <div class="text-sm text-amber-700">{surah.arabic}</div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Medinan Drop Zone -->
      <div
        class="min-h-32 p-6 border-2 border-dashed border-emerald-300 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50"
        ondragover={handleDragOver}
        ondrop={(e) => handleDrop(e, 'medinan')}
      >
        <h4 class="text-lg font-bold text-emerald-800 mb-4 text-center">{t.medinan} مدني</h4>
        <div class="space-y-2">
          {#each medinanDropped as surah}
            <div class="p-2 bg-emerald-200 rounded-lg text-center">
              <div class="font-medium text-emerald-900">{surah.name}</div>
              <div class="text-sm text-emerald-700">{surah.arabic}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div class="flex justify-center space-x-4">
      {#if canCheck && !showResult}
        <button
          onclick={checkAnswer}
          class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 font-semibold"
        >
          {t.checkOrder}
        </button>
      {/if}
      
      <button
        onclick={reset}
        class="{currentTheme.cardBg} {currentTheme.border} border-2 {currentTheme.text} px-8 py-4 rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold backdrop-blur-sm"
      >
        <RotateCcw class="w-5 h-5 inline mr-2" />
        {t.tryAgain}
      </button>
    </div>
    
    <!-- Result -->
    {#if showResult}
      <div class="mt-6 p-6 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-2xl border border-emerald-300/50">
        <div class="text-center">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check class="w-6 h-6 text-white" />
          </div>
          <h4 class="text-lg font-semibold {currentTheme.text} mb-2">Explanation</h4>
          <p class="{currentTheme.text} opacity-80 text-sm leading-relaxed">{gameData.explanation}</p>
          <button
            onclick={onNext}
            class="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
          >
            {t.nextQuestion}
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>
