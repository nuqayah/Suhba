<script>
  import { BookOpen, User, CheckCircle, Clock, Star, ArrowRight } from 'lucide-svelte';
  import { currentLanguage } from '$lib/stores/language';
  import { translations } from '$lib/stores/translations';

  let { currentTheme, gameQuestions = [], players = [], onGameEnd } = $props();

  const t = $derived(translations[$currentLanguage.code]);

  // Game state
  let currentPlayerIndex = $state(0);
  let currentHadith = $state(null);
  let hadithIndex = $state(0);
  let gamePhase = $state('preparation'); // preparation, playing, completed, gameOver
  let playerAnswers = $state([]);
  let timeRemaining = $state(45);
  let timer = $state(null);
  let currentAnswer = $state('');
  let showResult = $state(false);
  let gameResults = $state([]);

  // Sample Hadith data for completion
  const hadithDatabase = [
    {
      id: 1,
      text: "Actions are but by intention and every man shall have but that which he intended.",
      arabic: "إنما الأعمال بالنيات وإنما لكل امرئ ما نوى",
      incomplete: "Actions are but by _______ and every man shall have but that which he _______.",
      incompleteArabic: "إنما الأعمال _______ وإنما لكل امرئ ما _______",
      blanks: ["intention", "intended"],
      blanksArabic: ["بالنيات", "نوى"],
      narrator: "Umar ibn al-Khattab",
      source: "Bukhari & Muslim",
      explanation: "This foundational hadith emphasizes that the value of actions lies in the intentions behind them.",
      points: 10
    },
    {
      id: 2,
      text: "The believer is not one who eats his fill while his neighbor goes hungry.",
      arabic: "ليس المؤمن الذي يشبع وجاره جائع",
      incomplete: "The believer is not one who eats his _______ while his neighbor goes _______.",
      incompleteArabic: "ليس المؤمن الذي _______ وجاره _______",
      blanks: ["fill", "hungry"],
      blanksArabic: ["يشبع", "جائع"],
      narrator: "Anas ibn Malik",
      source: "Authenticated by al-Albani",
      explanation: "This hadith teaches us about social responsibility and caring for our neighbors.",
      points: 10
    },
    {
      id: 3,
      text: "None of you truly believes until he loves for his brother what he loves for himself.",
      arabic: "لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه",
      incomplete: "None of you truly believes until he _______ for his brother what he _______ for himself.",
      incompleteArabic: "لا يؤمن أحدكم حتى _______ لأخيه ما _______ لنفسه",
      blanks: ["loves", "loves"],
      blanksArabic: ["يحب", "يحب"],
      narrator: "Anas ibn Malik",
      source: "Bukhari & Muslim",
      explanation: "This hadith emphasizes the importance of brotherhood and wanting good for others.",
      points: 10
    },
    {
      id: 4,
      text: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
      arabic: "من كان يؤمن بالله واليوم الآخر فليقل خيرا أو ليصمت",
      incomplete: "Whoever believes in Allah and the Last Day should speak _______ or remain _______.",
      incompleteArabic: "من كان يؤمن بالله واليوم الآخر فليقل _______ أو _______",
      blanks: ["good", "silent"],
      blanksArabic: ["خيرا", "ليصمت"],
      narrator: "Abu Hurairah",
      source: "Bukhari & Muslim",
      explanation: "This hadith teaches us about the importance of good speech and the wisdom of silence.",
      points: 10
    },
    {
      id: 5,
      text: "The world is green and beautiful, and Allah has appointed you as His stewards over it.",
      arabic: "إن الدنيا خضرة حلوة وإن الله استخلفكم فيها",
      incomplete: "The world is green and _______, and Allah has appointed you as His _______ over it.",
      incompleteArabic: "إن الدنيا خضرة _______ وإن الله _______ فيها",
      blanks: ["beautiful", "stewards"],
      blanksArabic: ["حلوة", "استخلفكم"],
      narrator: "Abu Sa'id al-Khudri",
      source: "Muslim",
      explanation: "This hadith emphasizes environmental responsibility and stewardship of Earth.",
      points: 10
    }
  ];

  // Initialize game
  function startGame() {
    gamePhase = 'playing';
    currentPlayerIndex = 0;
    hadithIndex = 0;
    gameResults = [];
    nextPlayer();
  }

  function nextPlayer() {
    if (hadithIndex >= hadithDatabase.length) {
      endGame();
      return;
    }

    currentHadith = hadithDatabase[hadithIndex];
    currentAnswer = '';
    showResult = false;
    timeRemaining = 45;
    
    // Start timer
    timer = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) {
        submitAnswer();
      }
    }, 1000);
  }

  function submitAnswer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }

    const playerAnswer = currentAnswer.trim().toLowerCase();
    const correctAnswers = currentHadith.blanks.map(blank => blank.toLowerCase());
    
    // Check if answer contains the required words (flexible matching)
    let score = 0;
    let correctCount = 0;
    
    correctAnswers.forEach(correctWord => {
      if (playerAnswer.includes(correctWord) || 
          playerAnswer.split(' ').some(word => 
            word.includes(correctWord) || correctWord.includes(word)
          )) {
        correctCount++;
        score += 5;
      }
    });

    // Bonus for complete accuracy
    if (correctCount === correctAnswers.length) {
      score += 5;
    }

    // Store result
    gameResults.push({
      player: players[currentPlayerIndex],
      playerId: currentPlayerIndex,
      hadith: currentHadith,
      answer: currentAnswer,
      score: score,
      correctCount: correctCount,
      totalBlanks: correctAnswers.length,
      timeUsed: 45 - timeRemaining
    });

    showResult = true;

    // Move to next player after showing result
    setTimeout(() => {
      currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
      
      // If we've completed a full round, move to next hadith
      if (currentPlayerIndex === 0) {
        hadithIndex++;
      }
      
      if (hadithIndex >= hadithDatabase.length) {
        endGame();
      } else {
        nextPlayer();
      }
    }, 4000);
  }

  function endGame() {
    gamePhase = 'gameOver';
    
    // Calculate final scores per player
    const playerScores = players.map((player, index) => {
      const playerResults = gameResults.filter(result => result.playerId === index);
      const totalScore = playerResults.reduce((sum, result) => sum + result.score, 0);
      const totalCorrect = playerResults.reduce((sum, result) => sum + result.correctCount, 0);
      const averageTime = playerResults.length > 0 
        ? playerResults.reduce((sum, result) => sum + result.timeUsed, 0) / playerResults.length 
        : 0;
      
      return {
        player,
        playerId: index,
        totalScore,
        totalCorrect,
        averageTime: Math.round(averageTime),
        hadithsCompleted: playerResults.length
      };
    }).sort((a, b) => b.totalScore - a.totalScore);

    onGameEnd(playerScores);
  }

  const getCurrentPlayer = () => players[currentPlayerIndex];
  
  const scoreColor = (score, maxScore) => {
    const percentage = score / maxScore;
    if (percentage >= 0.8) return 'text-green-600';
    if (percentage >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };
</script>

<div class="hadith-completion min-h-screen {currentTheme.bg} p-4">
  <!-- Game Header -->
  <div class="text-center mb-6">
    <div class="flex items-center justify-center mb-4">
      <BookOpen class="text-green-600 mr-3" size={32} />
      <h1 class="text-3xl font-bold {currentTheme.text}">Hadith Completion</h1>
      <BookOpen class="text-green-600 ml-3" size={32} />
    </div>
    
    <div class="flex items-center justify-center space-x-6 text-sm {currentTheme.text}">
      <div class="flex items-center space-x-2">
        <User class="w-4 h-4" />
        <span>{players.length} Players</span>
      </div>
      <div class="flex items-center space-x-2">
        <BookOpen class="w-4 h-4" />
        <span>Hadith {hadithIndex + 1}/{hadithDatabase.length}</span>
      </div>
    </div>
  </div>

  <!-- Current Player Indicator -->
  {#if gamePhase === 'playing'}
    <div class="text-center mb-6">
      <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-2xl p-4 max-w-md mx-auto">
        <div class="flex items-center justify-center space-x-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <span class="text-white font-bold">{getCurrentPlayer()?.name?.[0] || 'P'}</span>
          </div>
          <div>
            <h3 class="font-bold {currentTheme.text}">{getCurrentPlayer()?.name || `Player ${currentPlayerIndex + 1}`}</h3>
            <p class="text-sm {currentTheme.text} opacity-70">Your turn to complete the hadith</p>
          </div>
        </div>
        
        <!-- Timer -->
        <div class="flex items-center justify-center space-x-2">
          <Clock class="w-4 h-4 {currentTheme.text}" />
          <span class="{currentTheme.text} font-mono text-lg">{timeRemaining}s</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Hadith Display -->
  {#if currentHadith && gamePhase === 'playing' && !showResult}
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 mb-6">
      <!-- Hadith Info -->
      <div class="text-center mb-6">
        <div class="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          Narrated by {currentHadith.narrator}
        </div>
      </div>

      <!-- Incomplete Hadith in English -->
      <div class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
        <h3 class="font-bold text-blue-800 mb-3">Complete this Hadith:</h3>
        <p class="text-lg text-blue-900 leading-relaxed italic">
          "{currentHadith.incomplete}"
        </p>
      </div>

      <!-- Incomplete Hadith in Arabic -->
      <div class="mb-6 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border border-amber-200">
        <h3 class="font-bold text-amber-800 mb-3 text-right">أكمل هذا الحديث:</h3>
        <p class="text-xl text-amber-900 leading-relaxed font-arabic text-right">
          "{currentHadith.incompleteArabic}"
        </p>
      </div>

      <!-- Answer Input -->
      <div class="mb-6">
        <label for="hadith-answer" class="block font-bold {currentTheme.text} mb-3">Your Answer:</label>
        <textarea
          id="hadith-answer"
          bind:value={currentAnswer}
          placeholder="Complete the hadith with the missing words..."
          class="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none resize-none"
          rows="3"
        ></textarea>
      </div>

      <!-- Submit Button -->
      <div class="text-center">
        <button
          onclick={submitAnswer}
          disabled={!currentAnswer.trim()}
          class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
      </div>
    </div>
  {/if}

  <!-- Result Display -->
  {#if showResult && gameResults.length > 0}
    {@const lastResult = gameResults[gameResults.length - 1]}
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 mb-6">
      <h2 class="text-2xl font-bold {currentTheme.text} mb-6 text-center">Result</h2>
      
      <!-- Player Score -->
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-white font-bold text-2xl">{lastResult.score}</span>
        </div>
        <h3 class="text-xl font-bold {currentTheme.text}">
          {lastResult.player?.name || `Player ${lastResult.playerId + 1}`}
        </h3>
        <p class="{scoreColor(lastResult.score, 15)} font-medium">
          {lastResult.correctCount}/{lastResult.totalBlanks} blanks correct
        </p>
      </div>

      <!-- Player's Answer -->
      <div class="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-xl">
        <h3 class="font-bold text-blue-800 mb-2">Your Answer:</h3>
        <p class="text-blue-700">"{lastResult.answer}"</p>
      </div>

      <!-- Correct Complete Hadith -->
      <div class="mb-6 p-4 bg-green-100 border border-green-300 rounded-xl">
        <h3 class="font-bold text-green-800 mb-2">Complete Hadith:</h3>
        <p class="text-green-700 italic mb-2">"{currentHadith.text}"</p>
        <p class="text-green-700 font-arabic text-right">"{currentHadith.arabic}"</p>
      </div>

      <!-- Missing Words -->
      <div class="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-xl">
        <h3 class="font-bold text-yellow-800 mb-2">Missing Words:</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-yellow-700 font-medium">English:</p>
            <ul class="text-yellow-700">
              {#each currentHadith.blanks as blank}
                <li>• {blank}</li>
              {/each}
            </ul>
          </div>
          <div>
            <p class="text-yellow-700 font-medium">Arabic:</p>
            <ul class="text-yellow-700 font-arabic text-right">
              {#each currentHadith.blanksArabic as blank}
                <li>• {blank}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>

      <!-- Explanation -->
      <div class="p-4 bg-purple-100 border border-purple-300 rounded-xl">
        <h3 class="font-bold text-purple-800 mb-2">Teaching:</h3>
        <p class="text-purple-700">{currentHadith.explanation}</p>
        <p class="text-purple-600 text-sm mt-2">Source: {currentHadith.source}</p>
      </div>
    </div>
  {/if}

  <!-- Game Over -->
  {#if gamePhase === 'gameOver'}
    <div class="text-center">
      <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Star class="w-12 h-12 text-white" />
      </div>
      <h2 class="text-3xl font-bold {currentTheme.text} mb-6">Hadith Completion Complete!</h2>
      
      <!-- Final Rankings -->
      <div class="max-w-2xl mx-auto space-y-4">
        {#each gameResults.reduce((acc, result) => {
          const existing = acc.find(p => p.playerId === result.playerId);
          if (existing) {
            existing.totalScore += result.score;
            existing.totalCorrect += result.correctCount;
            existing.hadithsCompleted++;
          } else {
            acc.push({
              player: result.player,
              playerId: result.playerId,
              totalScore: result.score,
              totalCorrect: result.correctCount,
              hadithsCompleted: 1
            });
          }
          return acc;
        }, []).sort((a, b) => b.totalScore - a.totalScore) as ranking, index}
          <div class="flex items-center justify-between p-6 {currentTheme.cardBg} {currentTheme.border} border-2 rounded-xl">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">{index + 1}</span>
              </div>
              <div>
                <h3 class="font-bold {currentTheme.text}">{ranking.player?.name || `Player ${ranking.playerId + 1}`}</h3>
                <p class="text-sm {currentTheme.text} opacity-70">{ranking.hadithsCompleted} hadith(s) completed</p>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-green-600 text-xl">{ranking.totalScore} pts</div>
              <div class="text-sm {currentTheme.text} opacity-70">{ranking.totalCorrect} words correct</div>
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
            <li>• Each player takes turns completing a famous hadith</li>
            <li>• Fill in the missing words in both English and Arabic</li>
            <li>• You have 45 seconds per hadith</li>
            <li>• Score points for each correct word (5 pts each + 5 bonus for perfect)</li>
            <li>• Learn the meaning and source of each hadith</li>
          </ul>
        </div>
      </div>
      
      <button
        onclick={startGame}
        class="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 font-semibold text-lg"
      >
        Start Hadith Completion
      </button>
    </div>
  {/if}
</div>

<style>
  .font-arabic {
    font-family: 'Arabic Typesetting', 'Traditional Arabic', serif;
    direction: rtl;
  }
</style>
