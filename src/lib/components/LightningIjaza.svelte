<script>
  import { Zap, Clock, Star, Trophy, User, CheckCircle } from 'lucide-svelte';
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/stores/translations';

  let { currentTheme, gameQuestions = [], players = [], onGameEnd } = $props();

  const t = $derived(translations[$currentLanguage.code]);

  // Game state
  let currentQuestion = $state(null);
  let questionIndex = $state(0);
  let gamePhase = $state('preparation'); // preparation, question, buzzer, answered, results, gameOver
  let timeRemaining = $state(15);
  let timer = $state(null);
  let buzzerPressed = $state(false);
  let buzzerPlayer = $state(null);
  let playerScores = $state({});
  let currentRound = $state(1);
  let totalRounds = $state(10);
  let penaltyTime = $state(0);
  let roundResults = $state([]);

  // Initialize player scores
  players.forEach((player, index) => {
    playerScores[index] = { score: 0, correct: 0, penalties: 0 };
  });

  // Question categories for rotation
  const categories = ['Hadith Completion', 'Quranic Verses', 'Historical Dates', 'Fiqh Rulings'];
  let currentCategory = $state(categories[0]);

  function startGame() {
    gamePhase = 'question';
    nextQuestion();
  }

  function nextQuestion() {
    if (questionIndex >= gameQuestions.length) {
      endGame();
      return;
    }

    currentQuestion = gameQuestions[questionIndex];
    currentCategory = categories[questionIndex % categories.length];
    questionIndex++;
    currentRound = questionIndex;
    
    gamePhase = 'question';
    buzzerPressed = false;
    buzzerPlayer = null;
    timeRemaining = 15;
    penaltyTime = 0;
    
    // Start countdown timer
    timer = setInterval(() => {
      if (penaltyTime > 0) {
        penaltyTime--;
        return;
      }
      
      timeRemaining--;
      if (timeRemaining <= 0) {
        // Time's up - no one gets points
        showResults(null, false);
      }
    }, 1000);
  }

  function pressBuzzer(playerId) {
    if (gamePhase !== 'question' || buzzerPressed || penaltyTime > 0) return;
    
    buzzerPressed = true;
    buzzerPlayer = playerId;
    gamePhase = 'buzzer';
    
    // Stop the timer
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    
    // Player has 10 seconds to answer
    timeRemaining = 10;
    timer = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        // Time's up for this player - mark as wrong
        submitAnswer(buzzerPlayer, -1); // -1 indicates timeout
      }
    }, 1000);
  }

  function submitAnswer(playerId, answerIndex) {
    if (gamePhase !== 'buzzer' || playerId !== buzzerPlayer) return;
    
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    
    const isCorrect = answerIndex === currentQuestion.correct;
    const isTimeout = answerIndex === -1;
    
    // Update scores
    if (isCorrect) {
      playerScores[playerId].score += 10;
      playerScores[playerId].correct++;
    } else {
      playerScores[playerId].penalties++;
      if (!isTimeout) {
        // Wrong answer penalty - other players get a chance
        penaltyTime = 3; // 3 second penalty
        buzzerPressed = false;
        buzzerPlayer = null;
        gamePhase = 'question';
        timeRemaining = Math.max(5, timeRemaining); // At least 5 seconds for others
        
        timer = setInterval(() => {
          if (penaltyTime > 0) {
            penaltyTime--;
            return;
          }
          
          timeRemaining--;
          if (timeRemaining <= 0) {
            showResults(null, false);
          }
        }, 1000);
        return;
      }
    }
    
    showResults(playerId, isCorrect);
  }

  function showResults(playerId, isCorrect) {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    
    gamePhase = 'results';
    
    // Store round results
    roundResults.push({
      question: currentQuestion,
      winner: playerId,
      correct: isCorrect,
      round: currentRound
    });
    
    // Continue to next question after showing results
    setTimeout(() => {
      if (currentRound >= totalRounds) {
        endGame();
      } else {
        nextQuestion();
      }
    }, 4000);
  }

  function endGame() {
    gamePhase = 'gameOver';
    
    // Calculate final rankings
    const rankings = Object.entries(playerScores)
      .map(([playerId, scores]) => ({
        playerId: parseInt(playerId),
        player: players[parseInt(playerId)],
        ...scores
      }))
      .sort((a, b) => b.score - a.score);
    
    onGameEnd(rankings);
  }

  const getPlayerRank = (playerId) => {
    const sortedScores = Object.entries(playerScores)
      .sort(([,a], [,b]) => b.score - a.score);
    return sortedScores.findIndex(([id]) => parseInt(id) === playerId) + 1;
  };
</script>

<div class="lightning-ijaza min-h-screen {currentTheme.bg} p-4">
  <!-- Game Header -->
  <div class="text-center mb-6">
    <div class="flex items-center justify-center mb-4">
      <Zap class="text-yellow-500 mr-3" size={32} />
      <h1 class="text-3xl font-bold {currentTheme.text}">Lightning Ijaza</h1>
      <Zap class="text-yellow-500 ml-3" size={32} />
    </div>
    
    <div class="flex items-center justify-center space-x-6 text-sm {currentTheme.text}">
      <div class="flex items-center space-x-2">
        <Clock class="w-4 h-4" />
        <span>Round {currentRound}/{totalRounds}</span>
      </div>
      <div class="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">
        {currentCategory}
      </div>
    </div>
  </div>

  <!-- Scoreboard -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {#each players as player, index}
      {@const scores = playerScores[index]}
      {@const rank = getPlayerRank(index)}
      <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-xl p-4 text-center
                  {buzzerPlayer === index ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}">
        <div class="relative">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <span class="text-white font-bold">{player.name?.[0] || 'P'}</span>
          </div>
          {#if rank === 1 && scores.score > 0}
            <div class="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <Trophy class="w-3 h-3 text-white" />
            </div>
          {/if}
        </div>
        
        <div class="font-semibold {currentTheme.text} text-sm mb-1">{player.name || `Player ${index + 1}`}</div>
        <div class="text-2xl font-bold text-blue-600 mb-1">{scores.score}</div>
        <div class="text-xs {currentTheme.text} opacity-70">
          ✓ {scores.correct} | ✗ {scores.penalties}
        </div>
        
        <!-- Buzzer Button -->
        {#if gamePhase === 'question' && !buzzerPressed && penaltyTime === 0}
          <button
            onclick={() => pressBuzzer(index)}
            class="mt-2 w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-bold"
          >
            BUZZ!
          </button>
        {:else if buzzerPlayer === index}
          <div class="mt-2 w-full bg-yellow-500 text-white py-2 px-4 rounded-lg font-bold animate-pulse">
            YOUR TURN
          </div>
        {:else}
          <div class="mt-2 w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-bold">
            WAIT
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Timer Display -->
  {#if gamePhase === 'question' || gamePhase === 'buzzer'}
    <div class="flex justify-center mb-6">
      <div class="relative w-24 h-24">
        <div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div 
          class="absolute inset-0 rounded-full border-4 transition-all duration-1000
                 {gamePhase === 'question' ? 'border-blue-500' : 'border-yellow-500'}"
          style="stroke-dasharray: {2 * Math.PI * 44}; stroke-dashoffset: {2 * Math.PI * 44 * (1 - timeRemaining / (gamePhase === 'question' ? 15 : 10))};"
        ></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-3xl font-bold {currentTheme.text}">{timeRemaining}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Penalty Indicator -->
  {#if penaltyTime > 0}
    <div class="text-center mb-6">
      <div class="inline-block bg-red-500 text-white px-6 py-3 rounded-xl animate-pulse">
        <span class="font-bold">PENALTY TIME: {penaltyTime}s</span>
      </div>
    </div>
  {/if}

  <!-- Question Display -->
  {#if currentQuestion && (gamePhase === 'question' || gamePhase === 'buzzer')}
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 mb-6">
      <h2 class="text-xl font-bold {currentTheme.text} mb-6 text-center">
        {currentQuestion.prompt}
      </h2>
      
      {#if currentQuestion.prompt_ar}
        <p class="text-lg {currentTheme.text} opacity-80 mb-6 text-center font-arabic">
          {currentQuestion.prompt_ar}
        </p>
      {/if}

      <!-- Answer Options (only show if someone buzzed) -->
      {#if gamePhase === 'buzzer' && buzzerPlayer !== null}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each currentQuestion.options as option, index}
            <button
              onclick={() => submitAnswer(buzzerPlayer, index)}
              class="p-4 text-left rounded-xl border-2 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-200"
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
        
        <div class="mt-4 text-center">
          <p class="{currentTheme.text} font-medium">
            {players[buzzerPlayer]?.name || `Player ${buzzerPlayer + 1}`} - Choose your answer!
          </p>
        </div>
      {:else if gamePhase === 'question'}
        <div class="text-center">
          <p class="{currentTheme.text} text-lg">Press your buzzer to answer!</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Results Display -->
  {#if gamePhase === 'results' && currentQuestion}
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 mb-6">
      <h2 class="text-2xl font-bold {currentTheme.text} mb-6 text-center">Round {currentRound} Results</h2>
      
      <!-- Round Winner -->
      {#if roundResults[roundResults.length - 1]?.winner !== null}
        {@const lastResult = roundResults[roundResults.length - 1]}
        {@const winner = players[lastResult.winner]}
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {#if lastResult.correct}
              <CheckCircle class="w-8 h-8 text-white" />
            {:else}
              <span class="text-white font-bold text-2xl">×</span>
            {/if}
          </div>
          <h3 class="text-xl font-bold {currentTheme.text}">
            {#if lastResult.correct}
              🎉 {winner?.name || `Player ${lastResult.winner + 1}`} got it right!
            {:else}
              😔 {winner?.name || `Player ${lastResult.winner + 1}`} got it wrong
            {/if}
          </h3>
        </div>
      {:else}
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold {currentTheme.text}">⏰ Time's up! No one answered</h3>
        </div>
      {/if}
      
      <!-- Correct Answer -->
      <div class="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl">
        <h3 class="font-bold text-green-800 mb-2">Correct Answer:</h3>
        <p class="text-green-700">{currentQuestion.options[currentQuestion.correct]}</p>
      </div>

      <!-- Explanation -->
      {#if currentQuestion.explanation}
        <div class="p-4 bg-blue-100 border border-blue-300 rounded-xl">
          <h3 class="font-bold text-blue-800 mb-2">Explanation:</h3>
          <p class="text-blue-700">{currentQuestion.explanation}</p>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Game Over -->
  {#if gamePhase === 'gameOver'}
    <div class="text-center">
      <div class="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Trophy class="w-12 h-12 text-white" />
      </div>
      <h2 class="text-3xl font-bold {currentTheme.text} mb-6">Lightning Ijaza Complete!</h2>
      
      <!-- Final Rankings -->
      <div class="max-w-md mx-auto space-y-3">
        {#each Object.entries(playerScores).sort(([,a], [,b]) => b.score - a.score) as [playerId, scores], index}
          {@const player = players[parseInt(playerId)]}
          <div class="flex items-center justify-between p-4 {currentTheme.cardBg} {currentTheme.border} border-2 rounded-xl">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-sm">{index + 1}</span>
              </div>
              <span class="font-medium {currentTheme.text}">{player?.name || `Player ${parseInt(playerId) + 1}`}</span>
            </div>
            <div class="text-right">
              <div class="font-bold text-blue-600">{scores.score} pts</div>
              <div class="text-xs {currentTheme.text} opacity-70">{scores.correct}/{totalRounds}</div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Start Game Button -->
  {#if gamePhase === 'preparation'}
    <div class="text-center">
      <button
        onclick={startGame}
        class="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 font-semibold text-lg"
      >
        Start Lightning Round!
      </button>
    </div>
  {/if}
</div>

<style>
  .font-arabic {
    font-family: 'Arabic Typesetting', 'Traditional Arabic', serif;
  }
</style>