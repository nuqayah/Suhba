<script>
  import { onMount, onDestroy } from 'svelte';
  import { 
    enhancedWsManager, 
    currentRoom, 
    currentPlayer, 
    connectedPlayers,
    isHost,
    gameInProgress,
    connectionState
  } from '$lib/stores/enhancedWebsocket';
  import { Users, Crown, Wifi, WifiOff, Clock, Trophy, Play, Settings } from 'lucide-svelte';
  import Button from './Button.svelte';

  let { roomCode, gameType, onGameEnd } = $props();

  let timeRemaining = $state(0);
  let currentQuestion = $state(null);
  let selectedAnswer = $state(null);
  let showResults = $state(false);
  let gameTimer = null;

  $effect(() => {
    if ($currentRoom?.gameState.phase === 'question') {
      startQuestionTimer();
    } else if ($currentRoom?.gameState.phase === 'results') {
      showResults = true;
      setTimeout(() => {
        showResults = false;
      }, 3000);
    } else if ($currentRoom?.gameState.phase === 'finished') {
      onGameEnd();
    }
  });

  onMount(async () => {
    try {
      await enhancedWsManager.connect();
      // Room should already be joined from parent component
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  });

  onDestroy(() => {
    if (gameTimer) {
      clearInterval(gameTimer);
    }
  });

  function startQuestionTimer() {
    const duration = $currentRoom?.settings.timePerQuestion || 30;
    timeRemaining = duration;
    
    if (gameTimer) clearInterval(gameTimer);
    
    gameTimer = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        clearInterval(gameTimer);
        gameTimer = null;
        submitAnswer();
      }
    }, 1000);
  }

  async function submitAnswer() {
    if (selectedAnswer !== null && $currentRoom) {
      await enhancedWsManager.submitAnswer(
        $currentRoom.gameState.currentQuestion,
        selectedAnswer
      );
      selectedAnswer = null;
    }
  }

  async function startGame() {
    if ($isHost) {
      await enhancedWsManager.startGame();
    }
  }

  async function leaveRoom() {
    await enhancedWsManager.leaveRoom();
    onGameEnd();
  }

  function getConnectionIcon(quality) {
    switch (quality) {
      case 'excellent':
      case 'good': return Wifi;
      case 'fair': return Wifi;
      case 'poor': return WifiOff;
      default: return WifiOff;
    }
  }

  function getConnectionColor(quality) {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-yellow-500';
      case 'fair': return 'text-orange-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }

  const ConnectionIcon = $derived(getConnectionIcon($connectionState.quality));
</script>

<div class="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
  <!-- Header with connection status -->
  <div class="flex justify-between items-center mb-6">
    <div class="flex items-center gap-4">
      <h1 class="text-2xl font-bold text-amber-800">🕌 Suhba Room</h1>
      <div class="bg-white/80 px-3 py-1 rounded-full text-sm font-mono">
        #{roomCode}
      </div>
    </div>
    
    <!-- Connection indicator -->
    <div class="flex items-center gap-2">
      <ConnectionIcon
        size={16} 
        class={getConnectionColor($connectionState.quality)}  
      />
      <span class="text-xs text-gray-600">
        {#if $connectionState.connected}
          {$connectionState.latency}ms
        {:else if $connectionState.reconnecting}
          Reconnecting...
        {:else}
          Disconnected
        {/if}
      </span>
    </div>
  </div>

  <!-- Players list -->
  <div class="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-6">
    <div class="flex items-center gap-2 mb-3">
      <Users size={20} class="text-amber-600" />
      <h2 class="font-semibold text-amber-800">
        Players in Suhba ({$connectedPlayers.length})
      </h2>
    </div>
    
    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
      {#each $connectedPlayers as player (player.id)}
        <div class="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
          {#if player.isHost}
            <Crown size={16} class="text-yellow-600" />
          {/if}
          <span class="text-sm font-medium {player.connected ? 'text-gray-800' : 'text-gray-400'}">
            {player.name}
          </span>
          {#if !player.connected}
            <div class="w-2 h-2 bg-red-400 rounded-full"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Game content -->
  {#if !$gameInProgress}
    <!-- Waiting room -->
    <div class="bg-white/80 backdrop-blur-sm rounded-lg p-8 text-center">
      <div class="mb-6">
        <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play size={32} class="text-amber-600" />
        </div>
        <h2 class="text-xl font-bold text-amber-800 mb-2">
          Ready for {gameType}?
        </h2>
        <p class="text-gray-600">
          Waiting for {$isHost ? 'you' : 'the host'} to start the game...
        </p>
      </div>
      
      {#if $isHost}
        <Button 
          onclick={startGame}
          disabled={$connectedPlayers.length < 2}
          class="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
        >
          <Play size={16} />
          Start Game
        </Button>
        
        {#if $connectedPlayers.length < 2}
          <p class="text-sm text-gray-500 mt-2">
            Need at least 2 players to start
          </p>
        {/if}
      {:else}
        <div class="animate-pulse">
          <div class="w-6 h-6 bg-amber-300 rounded-full mx-auto"></div>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Active game -->
    <div class="space-y-6">
      <!-- Question timer -->
      {#if $currentRoom?.gameState.phase === 'question'}
        <div class="bg-white/80 backdrop-blur-sm rounded-lg p-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <Clock size={16} class="text-amber-600" />
              <span class="text-sm font-medium">Question {$currentRoom.gameState.currentQuestion + 1}</span>
            </div>
            <div class="text-lg font-bold {timeRemaining <= 5 ? 'text-red-600' : 'text-amber-600'}">
              {timeRemaining}s
            </div>
          </div>
          
          <!-- Progress bar -->
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-amber-500 h-2 rounded-full transition-all duration-1000 {timeRemaining <= 5 ? 'bg-red-500' : ''}"
              style="width: {(timeRemaining / ($currentRoom?.settings.timePerQuestion || 30)) * 100}%"
            ></div>
          </div>
        </div>
      {/if}

      <!-- Question content -->
      {#if currentQuestion}
        <div class="bg-white/80 backdrop-blur-sm rounded-lg p-6">
          <h3 class="text-lg font-semibold text-amber-800 mb-4">
            {currentQuestion.prompt}
          </h3>
          
          <div class="grid gap-3">
            {#each currentQuestion.options as option, index}
              <button
                onclick={() => selectedAnswer = index}
                class="p-4 rounded-lg border-2 transition-all text-left {
                  selectedAnswer === index 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-200 hover:border-amber-300 bg-white'
                }"
                disabled={$currentRoom?.gameState.phase !== 'question'}
              >
                <span class="font-medium text-amber-700 mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            {/each}
          </div>

          {#if selectedAnswer !== null && $currentRoom?.gameState.phase === 'question'}
            <Button 
              onclick={submitAnswer}
              class="mt-4 bg-green-600 hover:bg-green-700 text-white"
            >
              Submit Answer
            </Button>
          {/if}
        </div>
      {/if}

      <!-- Results overlay -->
      {#if showResults}
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div class="text-center">
              <Trophy size={48} class="text-yellow-500 mx-auto mb-4" />
              <h3 class="text-xl font-bold mb-4">Question Results</h3>
              
              <div class="space-y-2">
                {#each $connectedPlayers as player}
                  <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{player.name}</span>
                    <span class="font-bold">{$currentRoom?.gameState.scores[player.id] || 0}</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Leave room button -->
  <div class="fixed bottom-4 left-4">
    <Button 
      onclick={leaveRoom}
      variant="secondary"
      class="bg-red-100 hover:bg-red-200 text-red-700 border-red-300"
    >
      Leave Suhba
    </Button>
  </div>
</div>
