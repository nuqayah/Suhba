<script>
  import { Crown, Shield, Star, Users, Zap, Heart, X } from 'lucide-svelte';
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/stores/translations';

  let { currentTheme, gameQuestions = [], players = [], onGameEnd } = $props();

  const t = $derived(translations[$currentLanguage.code]);

  // Game state
  let currentRound = $state(1);
  let activePlayers = $state([...players.map((p, i) => ({ ...p, id: i, lives: 3, powerUps: ['secondChance'] }))]);
  let currentQuestion = $state(null);
  let questionIndex = $state(0);
  let showQuestion = $state(false);
  let showResults = $state(false);
  let gamePhase = $state('preparation'); // preparation, question, answering, results, elimination, gameOver
  let currentCategory = $state('Aqeedah');
  let timeRemaining = $state(30);
  let timer = $state(null);
  let playerAnswers = $state({});
  let eliminatedThisRound = $state([]);

  const categories = ['Aqeedah', 'Fiqh', 'Seerah', 'Quran'];
  const powerUps = {
    secondChance: { name: 'Second Chance', icon: Heart, color: 'bg-pink-500' },
    askUmmah: { name: 'Ask the Ummah', icon: Users, color: 'bg-blue-500' },
    scholarInsight: { name: "Scholar's Insight", icon: Star, color: 'bg-yellow-500' }
  };

  function startGame() {
    gamePhase = 'question';
    nextQuestion();
  }

  function nextQuestion() {
    if (questionIndex >= gameQuestions.length) {
      questionIndex = 0; // Loop back to start
    }
    
    currentQuestion = gameQuestions[questionIndex];
    currentCategory = categories[(currentRound - 1) % categories.length];
    questionIndex++;
    showQuestion = true;
    showResults = false;
    playerAnswers = {};
    timeRemaining = 30;
    gamePhase = 'answering';
    
    // Start timer
    timer = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        submitAnswers();
      }
    }, 1000);
  }

  function submitAnswer(playerId, answerIndex) {
    if (gamePhase !== 'answering') return;
    playerAnswers[playerId] = answerIndex;
    
    // Check if all active players have answered
    const activePlayerIds = activePlayers.map(p => p.id);
    const answeredCount = Object.keys(playerAnswers).filter(id => activePlayerIds.includes(parseInt(id))).length;
    
    if (answeredCount === activePlayers.length) {
      submitAnswers();
    }
  }

  function submitAnswers() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    
    gamePhase = 'results';
    showResults = true;
    eliminatedThisRound = [];
    
    // Check answers and eliminate players
    activePlayers.forEach(player => {
      const playerAnswer = playerAnswers[player.id];
      const isCorrect = playerAnswer === currentQuestion.correct;
      
      if (!isCorrect) {
        player.lives--;
        if (player.lives <= 0) {
          eliminatedThisRound.push(player);
        }
      }
    });
    
    // Remove eliminated players
    activePlayers = activePlayers.filter(p => p.lives > 0);
    
    // Check win condition
    if (activePlayers.length <= 1) {
      setTimeout(() => {
        gamePhase = 'gameOver';
        onGameEnd(activePlayers[0] || null);
      }, 3000);
    } else {
      setTimeout(() => {
        currentRound++;
        nextQuestion();
      }, 4000);
    }
  }

  function usePowerUp(playerId, powerUpType) {
    const player = activePlayers.find(p => p.id === playerId);
    if (!player || !player.powerUps.includes(powerUpType)) return;
    
    // Remove power-up from player
    player.powerUps = player.powerUps.filter(p => p !== powerUpType);
    
    switch (powerUpType) {
      case 'secondChance':
        player.lives++;
        break;
      case 'askUmmah':
        // Show most popular answer hint
        break;
      case 'scholarInsight':
        // Show explanation hint
        break;
    }
  }

  const difficultyColor = $derived.by(() => {
    switch (currentQuestion?.difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  });
</script>

<div class="last-scholar-standing min-h-screen {currentTheme.bg} p-4">
  <!-- Game Header -->
  <div class="text-center mb-6">
    <div class="flex items-center justify-center mb-4">
      <Crown class="text-yellow-600 mr-3" size={32} />
      <h1 class="text-3xl font-bold {currentTheme.text}">Last Scholar Standing</h1>
      <Crown class="text-yellow-600 ml-3" size={32} />
    </div>
    
    <div class="flex items-center justify-center space-x-6 text-sm {currentTheme.text}">
      <div class="flex items-center space-x-2">
        <Zap class="w-4 h-4" />
        <span>Round {currentRound}</span>
      </div>
      <div class="flex items-center space-x-2">
        <Users class="w-4 h-4" />
        <span>{activePlayers.length} Players</span>
      </div>
      <div class="px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full">
        {currentCategory}
      </div>
    </div>
  </div>

  <!-- Players Status -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {#each activePlayers as player}
      <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-xl p-4 text-center">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <span class="text-white font-bold">{player.name?.[0] || 'P'}</span>
        </div>
        <div class="font-semibold {currentTheme.text} text-sm mb-2">{player.name || `Player ${player.id + 1}`}</div>
        
        <!-- Lives -->
        <div class="flex justify-center space-x-1 mb-2">
          {#each Array(3) as _, i}
            <Heart class="w-4 h-4 {i < player.lives ? 'text-red-500 fill-current' : 'text-gray-300'}" />
          {/each}
        </div>
        
        <!-- Power-ups -->
        <div class="flex justify-center space-x-1">
          {#each player.powerUps as powerUp}
            {@const PowerUpIcon = powerUps[powerUp].icon}
            <button
              onclick={() => usePowerUp(player.id, powerUp)}
              class="{powerUps[powerUp].color} w-6 h-6 rounded-full flex items-center justify-center text-white text-xs hover:scale-110 transition-transform"
              title={powerUps[powerUp].name}
            >
              <PowerUpIcon class="w-3 h-3" />
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Eliminated Players This Round -->
  {#if eliminatedThisRound.length > 0 && showResults}
    <div class="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl">
      <h3 class="text-lg font-bold text-red-800 mb-2">Eliminated This Round</h3>
      <div class="flex flex-wrap gap-2">
        {#each eliminatedThisRound as player}
          <div class="flex items-center space-x-2 bg-red-200 px-3 py-1 rounded-lg">
            <X class="w-4 h-4 text-red-600" />
            <span class="text-red-800 font-medium">{player.name || `Player ${player.id + 1}`}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Question Display -->
  {#if showQuestion && currentQuestion && gamePhase === 'answering'}
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 mb-6">
      <!-- Timer -->
      <div class="flex justify-center mb-6">
        <div class="relative w-20 h-20">
          <div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div 
            class="absolute inset-0 rounded-full border-4 border-blue-500 transition-all duration-1000"
            style="stroke-dasharray: {2 * Math.PI * 36}; stroke-dashoffset: {2 * Math.PI * 36 * (1 - timeRemaining / 30)}; border-radius: 50%;"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-2xl font-bold {currentTheme.text}">{timeRemaining}</span>
          </div>
        </div>
      </div>

      <!-- Difficulty Badge -->
      <div class="flex justify-center mb-4">
        <span class="{difficultyColor} text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
          {currentQuestion.difficulty || 'medium'}
        </span>
      </div>

      <!-- Question -->
      <h2 class="text-xl font-bold {currentTheme.text} mb-6 text-center">
        {currentQuestion.prompt}
      </h2>
      
      {#if currentQuestion.prompt_ar}
        <p class="text-lg {currentTheme.text} opacity-80 mb-6 text-center font-arabic">
          {currentQuestion.prompt_ar}
        </p>
      {/if}

      <!-- Answer Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each currentQuestion.options as option, index}
          <button
            onclick={() => submitAnswer(0, index)}
            class="p-4 text-left rounded-xl border-2 transition-all duration-200 hover:scale-105
                   {playerAnswers[0] === index 
                     ? 'border-blue-500 bg-blue-50' 
                     : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}"
          >
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center font-bold">
                {String.fromCharCode(65 + index)}
              </div>
              <span class="{currentTheme.text}">{option}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Results Display -->
  {#if showResults && currentQuestion}
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 mb-6">
      <h2 class="text-2xl font-bold {currentTheme.text} mb-6 text-center">Round Results</h2>
      
      <!-- Correct Answer -->
      <div class="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl">
        <h3 class="font-bold text-green-800 mb-2">Correct Answer:</h3>
        <p class="text-green-700">{currentQuestion.options[currentQuestion.correct]}</p>
      </div>

      <!-- Explanation -->
      {#if currentQuestion.explanation}
        <div class="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-xl">
          <h3 class="font-bold text-blue-800 mb-2">Explanation:</h3>
          <p class="text-blue-700">{currentQuestion.explanation}</p>
        </div>
      {/if}

      <!-- Player Results -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each activePlayers as player}
          {@const playerAnswer = playerAnswers[player.id]}
          {@const isCorrect = playerAnswer === currentQuestion.correct}
          <div class="p-3 rounded-lg {isCorrect ? 'bg-green-100' : 'bg-red-100'}">
            <div class="flex items-center justify-between">
              <span class="font-medium {isCorrect ? 'text-green-800' : 'text-red-800'}">
                {player.name || `Player ${player.id + 1}`}
              </span>
              <div class="flex items-center space-x-2">
                {#if isCorrect}
                  <Star class="w-4 h-4 text-green-600" />
                {:else}
                  <X class="w-4 h-4 text-red-600" />
                {/if}
                <span class="text-sm">{player.lives} lives</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Game Over -->
  {#if gamePhase === 'gameOver'}
    <div class="text-center">
      <div class="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Crown class="w-12 h-12 text-white" />
      </div>
      {#if activePlayers.length > 0}
        <h2 class="text-3xl font-bold {currentTheme.text} mb-4">
          🏆 {activePlayers[0].name || `Player ${activePlayers[0].id + 1}`} Wins!
        </h2>
        <p class="{currentTheme.text} opacity-80">The Last Scholar Standing!</p>
      {:else}
        <h2 class="text-3xl font-bold {currentTheme.text} mb-4">No Winner</h2>
        <p class="{currentTheme.text} opacity-80">All scholars have fallen!</p>
      {/if}
    </div>
  {/if}

  <!-- Start Game Button -->
  {#if gamePhase === 'preparation'}
    <div class="text-center">
      <button
        onclick={startGame}
        class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold text-lg"
      >
        Start Battle
      </button>
    </div>
  {/if}
</div>

<style>
  .font-arabic {
    font-family: 'Arabic Typesetting', 'Traditional Arabic', serif;
  }
</style>
