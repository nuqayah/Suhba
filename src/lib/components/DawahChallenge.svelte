<script>
  import { MessageCircle, Users, Star, ThumbsUp, ThumbsDown, Clock, Award, Target } from 'lucide-svelte';
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/stores/translations';

  let { currentTheme, players = [], onGameEnd } = $props();

  const t = $derived(translations[$currentLanguage.code]);

  // Game state
  let currentPlayerIndex = $state(0);
  let currentChallenge = $state(null);
  let challengeIndex = $state(0);
  let gamePhase = $state('preparation'); // preparation, explaining, voting, results, gameOver
  let timeRemaining = $state(120); // 2 minutes to explain
  let timer = $state(null);
  let currentExplanation = $state('');
  let votes = $state({});
  let gameResults = $state([]);
  let showResult = $state(false);

  // Dawah challenge topics
  const dawahChallenges = [
    {
      id: 1,
      topic: "What is Islam?",
      target: "child",
      difficulty: "easy",
      description: "Explain Islam to a 10-year-old child in simple, friendly terms",
      tips: "Use simple words, analogies they understand, focus on love and kindness",
      maxScore: 20
    },
    {
      id: 2,
      topic: "Why do Muslims pray 5 times a day?",
      target: "non-muslim",
      difficulty: "medium",
      description: "Explain the daily prayers to someone who has never heard of Islam",
      tips: "Connect to universal concepts, explain the spiritual and practical benefits",
      maxScore: 25
    },
    {
      id: 3,
      topic: "What is the purpose of life in Islam?",
      target: "scholar",
      difficulty: "hard",
      description: "Give a scholarly explanation with references and depth",
      tips: "Use Quranic verses, hadith references, philosophical depth",
      maxScore: 30
    },
    {
      id: 4,
      topic: "Why is charity (Zakat) important?",
      target: "child",
      difficulty: "easy",
      description: "Teach a young person about sharing and helping others",
      tips: "Use examples they can relate to, emphasize kindness and community",
      maxScore: 20
    },
    {
      id: 5,
      topic: "What is the Quran?",
      target: "non-muslim",
      difficulty: "medium",
      description: "Introduce the Quran to someone unfamiliar with Islamic texts",
      tips: "Compare to familiar concepts, explain its role and significance",
      maxScore: 25
    },
    {
      id: 6,
      topic: "The concept of Tawheed (Oneness of Allah)",
      target: "scholar",
      difficulty: "hard",
      description: "Explain the theological concept of monotheism in Islam",
      tips: "Discuss the different categories, compare with other beliefs",
      maxScore: 30
    },
    {
      id: 7,
      topic: "Why do Muslim women wear hijab?",
      target: "non-muslim",
      difficulty: "medium",
      description: "Respectfully explain the concept of hijab and modesty",
      tips: "Address common misconceptions, emphasize choice and spirituality",
      maxScore: 25
    },
    {
      id: 8,
      topic: "What happens during Hajj?",
      target: "child",
      difficulty: "easy",
      description: "Describe the pilgrimage in an exciting, educational way",
      tips: "Make it sound like an adventure, explain the unity aspect",
      maxScore: 20
    }
  ];

  // Voting criteria
  const votingCriteria = [
    { id: 'clarity', name: 'Clarity', description: 'Was the explanation clear and easy to understand?' },
    { id: 'accuracy', name: 'Accuracy', description: 'Was the information correct and authentic?' },
    { id: 'appropriateness', name: 'Appropriateness', description: 'Was it suitable for the target audience?' },
    { id: 'engagement', name: 'Engagement', description: 'Was it interesting and engaging?' }
  ];

  function startGame() {
    gamePhase = 'explaining';
    currentPlayerIndex = 0;
    challengeIndex = 0;
    gameResults = [];
    nextPlayer();
  }

  function nextPlayer() {
    if (challengeIndex >= dawahChallenges.length) {
      endGame();
      return;
    }

    currentChallenge = dawahChallenges[challengeIndex];
    currentExplanation = '';
    showResult = false;
    votes = {};
    timeRemaining = 120; // 2 minutes
    
    // Start timer
    timer = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        submitExplanation();
      }
    }, 1000);
  }

  function submitExplanation() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    if (!currentExplanation.trim()) {
      currentExplanation = "No explanation provided.";
    }

    gamePhase = 'voting';
    
    // Initialize votes for other players
    players.forEach((_, index) => {
      if (index !== currentPlayerIndex) {
        votes[index] = {};
      }
    });
  }

  function submitVote(voterIndex, criterion, score) {
    if (!votes[voterIndex]) votes[voterIndex] = {};
    votes[voterIndex][criterion] = score;
    
    // Check if all voters have voted on all criteria
    const otherPlayers = players.filter((_, index) => index !== currentPlayerIndex);
    const allVoted = otherPlayers.every((_, index) => {
      const playerVotes = votes[index];
      return playerVotes && votingCriteria.every(criteria => playerVotes[criteria.id] !== undefined);
    });
    
    if (allVoted) {
      calculateResults();
    }
  }

  function calculateResults() {
    // Calculate average scores for each criterion
    const criteriaScores = {};
    votingCriteria.forEach(criteria => {
      const scores = Object.values(votes).map(vote => vote[criteria.id] || 0);
      criteriaScores[criteria.id] = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    });

    // Calculate total score
    const totalScore = Object.values(criteriaScores).reduce((a, b) => a + b, 0);
    const maxPossibleScore = votingCriteria.length * 5; // 5 is max score per criterion
    const normalizedScore = Math.round((totalScore / maxPossibleScore) * currentChallenge.maxScore);

    // Store result
    gameResults.push({
      player: players[currentPlayerIndex],
      playerId: currentPlayerIndex,
      challenge: currentChallenge,
      explanation: currentExplanation,
      criteriaScores,
      totalScore: normalizedScore,
      timeUsed: 120 - timeRemaining
    });

    gamePhase = 'results';
    showResult = true;

    // Move to next player after showing results
    setTimeout(() => {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      
      // If we've completed a full round, move to next challenge
      if (currentPlayerIndex === 0) {
        challengeIndex++;
      }
      
      if (challengeIndex >= dawahChallenges.length) {
        endGame();
      } else {
        nextPlayer();
      }
    }, 6000);
  }

  function endGame() {
    gamePhase = 'gameOver';
    
    // Calculate final scores per player
    const playerScores = players.map((player, index) => {
      const playerResults = gameResults.filter(result => result.playerId === index);
      const totalScore = playerResults.reduce((sum, result) => sum + result.totalScore, 0);
      const averageScore = playerResults.length > 0 ? Math.round(totalScore / playerResults.length) : 0;
      const challengesCompleted = playerResults.length;
      
      return {
        player,
        playerId: index,
        totalScore,
        averageScore,
        challengesCompleted,
        results: playerResults
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    onGameEnd(playerScores);
  }

  const getCurrentPlayer = () => players[currentPlayerIndex];
  const getVotingPlayers = () => players.filter((_, index) => index !== currentPlayerIndex);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getTargetIcon = (target) => {
    switch (target) {
      case 'child': return '👧';
      case 'non-muslim': return '🤝';
      case 'scholar': return '📚';
      default: return '👤';
    }
  };
</script>

<div class="dawah-challenge min-h-screen {currentTheme.bg} p-4">
  <!-- Game Header -->
  <div class="text-center mb-6">
    <div class="flex items-center justify-center mb-4">
      <MessageCircle class="text-blue-600 mr-3" size={32} />
      <h1 class="text-3xl font-bold {currentTheme.text}">Dawah Challenge</h1>
      <MessageCircle class="text-blue-600 ml-3" size={32} />
    </div>
    
    <div class="flex items-center justify-center space-x-6 text-sm {currentTheme.text}">
      <div class="flex items-center space-x-2">
        <Users class="w-4 h-4" />
        <span>{players.length} Players</span>
      </div>
      <div class="flex items-center space-x-2">
        <Target class="w-4 h-4" />
        <span>Challenge {challengeIndex + 1}/{dawahChallenges.length}</span>
      </div>
    </div>
  </div>

  <!-- Current Player Indicator -->
  {#if gamePhase === 'explaining'}
    <div class="text-center mb-6">
      <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-2xl p-4 max-w-md mx-auto">
        <div class="flex items-center justify-center space-x-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span class="text-white font-bold">{getCurrentPlayer()?.name?.[0] || 'P'}</span>
          </div>
          <div>
            <h3 class="font-bold {currentTheme.text}">{getCurrentPlayer()?.name || `Player ${currentPlayerIndex + 1}`}</h3>
            <p class="text-sm {currentTheme.text} opacity-70">Your turn to explain</p>
          </div>
        </div>
        
        <!-- Timer -->
        <div class="flex items-center justify-center space-x-2">
          <Clock class="w-4 h-4 {currentTheme.text}" />
          <span class="{currentTheme.text} font-mono text-lg">{formatTime(timeRemaining)}</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Challenge Display -->
  {#if currentChallenge && (gamePhase === 'explaining' || gamePhase === 'voting')}
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 mb-6">
      <!-- Challenge Info -->
      <div class="flex flex-wrap items-center justify-center gap-4 mb-6">
        <div class="{getDifficultyColor(currentChallenge.difficulty)} text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
          {currentChallenge.difficulty}
        </div>
        <div class="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          Target: {currentChallenge.target} {getTargetIcon(currentChallenge.target)}
        </div>
        <div class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          Max: {currentChallenge.maxScore} pts
        </div>
      </div>

      <!-- Challenge Topic -->
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold {currentTheme.text} mb-3">{currentChallenge.topic}</h2>
        <p class="{currentTheme.text} text-lg mb-4">{currentChallenge.description}</p>
        
        <!-- Tips -->
        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 max-w-2xl mx-auto">
          <h4 class="font-bold text-yellow-800 mb-2">💡 Tips:</h4>
          <p class="text-yellow-700 text-sm">{currentChallenge.tips}</p>
        </div>
      </div>

      <!-- Explanation Input (only during explaining phase) -->
      {#if gamePhase === 'explaining'}
        <div class="mb-6">
          <label for="dawah-explanation" class="block font-bold {currentTheme.text} mb-3">Your Explanation:</label>
          <textarea
            id="dawah-explanation"
            bind:value={currentExplanation}
            placeholder="Explain the concept clearly and appropriately for your target audience..."
            class="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none resize-none"
            rows="6"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="text-center">
          <button
            onclick={submitExplanation}
            class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold text-lg"
          >
            Submit Explanation
          </button>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Voting Phase -->
  {#if gamePhase === 'voting'}
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 mb-6">
      <h2 class="text-2xl font-bold {currentTheme.text} mb-6 text-center">Voting Time</h2>
      
      <!-- Show the explanation -->
      <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 class="font-bold text-blue-800 mb-2">
          {getCurrentPlayer()?.name || `Player ${currentPlayerIndex + 1}`}'s Explanation:
        </h3>
        <p class="text-blue-700 italic leading-relaxed">"{currentExplanation}"</p>
      </div>

      <!-- Voting for each player -->
      {#each getVotingPlayers() as voter, voterIndex}
        {@const realVoterIndex = players.indexOf(voter)}
        <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <h3 class="font-bold {currentTheme.text} mb-4">
            {voter?.name || `Player ${realVoterIndex + 1}`} - Rate this explanation:
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each votingCriteria as criteria}
              <div class="p-3 bg-white rounded-lg border">
                <h4 class="font-medium text-gray-800 mb-2">{criteria.name}</h4>
                <p class="text-sm text-gray-600 mb-3">{criteria.description}</p>
                
                <div class="flex space-x-2">
                  {#each [1, 2, 3, 4, 5] as score}
                    <button
                      onclick={() => submitVote(realVoterIndex, criteria.id, score)}
                      class="w-8 h-8 rounded-full border-2 transition-all duration-200
                             {votes[realVoterIndex]?.[criteria.id] === score 
                               ? 'bg-blue-500 border-blue-500 text-white' 
                               : 'border-gray-300 hover:border-blue-400'}"
                    >
                      {score}
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Results Display -->
  {#if showResult && gameResults.length > 0}
    {@const lastResult = gameResults[gameResults.length - 1]}
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 mb-6">
      <h2 class="text-2xl font-bold {currentTheme.text} mb-6 text-center">Results</h2>
      
      <!-- Player Score -->
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-2xl">{lastResult.totalScore}</span>
        </div>
        <h3 class="text-xl font-bold {currentTheme.text}">
          {lastResult.player?.name || `Player ${lastResult.playerId + 1}`}
        </h3>
        <p class="{currentTheme.text} opacity-70">out of {lastResult.challenge.maxScore} points</p>
      </div>

      <!-- Criteria Breakdown -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {#each votingCriteria as criteria}
          {@const score = lastResult.criteriaScores[criteria.id] || 0}
          <div class="text-center p-3 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-800 text-sm mb-1">{criteria.name}</h4>
            <div class="text-lg font-bold text-blue-600">{score.toFixed(1)}/5</div>
          </div>
        {/each}
      </div>

      <!-- Player's Explanation -->
      <div class="p-4 bg-blue-100 border border-blue-300 rounded-xl">
        <h3 class="font-bold text-blue-800 mb-2">Your Explanation:</h3>
        <p class="text-blue-700 italic">"{lastResult.explanation}"</p>
      </div>
    </div>
  {/if}

  <!-- Game Over -->
  {#if gamePhase === 'gameOver'}
    <div class="text-center">
      <div class="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Award class="w-12 h-12 text-white" />
      </div>
      <h2 class="text-3xl font-bold {currentTheme.text} mb-6">Dawah Challenge Complete!</h2>
      
      <!-- Final Rankings -->
      <div class="max-w-2xl mx-auto space-y-4">
        {#each gameResults.reduce((acc, result) => {
          const existing = acc.find(p => p.playerId === result.playerId);
          if (existing) {
            existing.totalScore += result.totalScore;
            existing.challengesCompleted++;
          } else {
            acc.push({
              player: result.player,
              playerId: result.playerId,
              totalScore: result.totalScore,
              challengesCompleted: 1
            });
          }
          return acc;
        }, []).sort((a, b) => b.totalScore - a.totalScore) as ranking, index}
          <div class="flex items-center justify-between p-6 {currentTheme.cardBg} {currentTheme.border} border-2 rounded-xl">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{index + 1}</span>
              </div>
              <div>
                <h3 class="font-bold {currentTheme.text}">{ranking.player?.name || `Player ${ranking.playerId + 1}`}</h3>
                <p class="text-sm {currentTheme.text} opacity-70">{ranking.challengesCompleted} explanation(s)</p>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-blue-600 text-xl">{ranking.totalScore} pts</div>
              <div class="text-sm {currentTheme.text} opacity-70">
                Avg: {Math.round(ranking.totalScore / ranking.challengesCompleted)}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Start Game Button -->
  {#if gamePhase === 'preparation'}
    <div class="text-center">
      <div class="mb-6">
        <h2 class="text-2xl font-bold {currentTheme.text} mb-4">How to Play</h2>
        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-2xl p-6 max-w-2xl mx-auto">
          <ul class="text-left {currentTheme.text} space-y-2">
            <li>• Each player explains Islamic concepts to different audiences</li>
            <li>• Adapt your explanation to: children, non-Muslims, or scholars</li>
            <li>• You have 2 minutes to craft your explanation</li>
            <li>• Other players rate you on clarity, accuracy, appropriateness, and engagement</li>
            <li>• Practice your dawah skills in a fun, supportive environment</li>
          </ul>
        </div>
      </div>
      
      <button
        onclick={startGame}
        class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold text-lg"
      >
        Start Dawah Challenge
      </button>
    </div>
  {/if}
</div>

<style>
  .font-arabic {
    font-family: 'Arabic Typesetting', 'Traditional Arabic', serif;
  }
</style>
