<script lang="ts">
  import { onMount } from 'svelte';
  import { crossfade, scale, fade } from 'svelte/transition';
  import { 
    Shuffle, Users, Clock, Trophy, Heart, Book, Star, ArrowLeft, Check, 
    RotateCcw, Lightbulb, SkipForward, Play, Moon, Sun, Scroll, 
    MessageCircle, Zap, Crown, Shield, Calendar, Scale, Sparkles, 
    Plus, User, UserCheck, Compass, Settings, DoorOpen, Copy, Mic, MicOff 
  } from 'lucide-svelte';

  // Reactive state using Svelte 5 runes
  let currentScreen = $state('home');
  let currentGame = $state(null);
  let score = $state(0);
  let round = $state(1);
  let isFlipped = $state(false);
  let selectedAnswer = $state('');
  let theme = $state('desert');
  let chillCategory = $state(null);
  let timelineItems = $state([]);
  let selectedTimelineItems = $state([]);
  let multipleChoiceAnswer = $state('');
  
  // New game mode states
  let gameMode = $state('solo');
  let players = $state([]);
  let currentPlayer = $state(0);
  let teamScores = $state({});
  let showWWPDAnswer = $state(false);
  let selectedOption = $state(null);
  let roomName = $state('The Suhba');
  let roomMode = $state('Private');
  let playerCount = $state('4');
  let roomPassword = $state('12345678');
  let roomCode = $state('');
  let copiedRoomCode = $state(false);
  let copyResetTimer = $state(null);
  let showGameMode = $state(false);
  let selectedRoleTitle = $state('');
  let isRoomCreator = $state(true);
  let isMicOpen = $state(false);
  let privateDifficulty = $state('easy');
  let privateQuestionIndex = $state(1);
  let privateTotalQuestions = $state(12);
  let privateSecondsLeft = $state(0);
  let privateSelectedOption = $state(null);
  let privateAnswersRevealed = $state(false);
  let privateCorrectIndex = $state(0);
  let privateTimerId = $state(null);
  let showPrivateGameOver = $state(false);

  const privateQuestion = {
    prompt: 'Who was the last prophet sent to mankind?',
    options: [
      'Prophet Mohammad ﷺ',
      'Prophet Mousa',
      'Prophet Issa'
    ]
  };

  const leaderboard = [
    { name: 'Mohammed Badawi', score: 12 },
    { name: 'Mustafa Jibaly', score: 10 },
    { name: 'Abdallah Bassem N.', score: 9 },
    { name: 'Ayub Mustafa Jibaly', score: 8 },
    { name: 'Mustafa Jibaly', score: 7 }
  ];

  const [sendCloud, receiveCloud] = crossfade({
    duration: 500,
    easing: t => t
  });

  // Game content database
  const gameContent = {
    prophet: [
      {
        prompt: "This prophet was swallowed by a great fish and sent to the people of Nineveh",
        clues: [
          "Initially tried to flee from Allah's command by sea",
          "Made sincere tawbah inside the whale",
          "His people eventually accepted his message"
        ],
        answer: "Prophet Yunus (Jonah) عليه السلام",
        story: "Prophet Yunus was commanded to call his people to worship Allah, but when they rejected him, he left in anger. Allah tested him by having him swallowed by a whale, where he made sincere tawbah."
      }
    ],
    ayah: [
      {
        prompt: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ...",
        answer: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
        translation: "And whoever fears Allah, He will make for him a way out",
        surah: "At-Talaq (65:2)"
      }
    ],
    sahabi: [
      {
        prompt: "Known for incredible generosity, bought a well for all Muslims, and married two daughters of the Prophet ﷺ",
        clues: [
          "Called Dhun-Nurayn (possessor of two lights)",
          "The Prophet ﷺ said nothing would harm him after a certain day",
          "Third Caliph of Islam"
        ],
        answer: "Uthman ibn Affan رضي الله عنه",
        story: "His generosity was legendary - he equipped entire armies and bought wells for public use."
      }
    ],
    sunnah: [
      {
        prompt: "You're about to enter your home...",
        answer: "Say 'Bismillah', give salam, and enter with right foot",
        dalil: "The Prophet ﷺ would say Bismillah and give salam when entering"
      }
    ],
    wwpd: [
      {
        prompt: "Your neighbor is playing loud music late at night, disturbing your sleep and prayer. What would the Prophet ﷺ likely do?",
        options: [
          "Immediately go and angrily confront them",
          "Call the authorities to complain",
          "Approach them kindly during the day and gently explain the situation",
          "Just bear it in silence and never say anything"
        ],
        correct: 2,
        answer: "Approach them kindly during the day and gently explain the situation",
        explanation: "The Prophet ﷺ always addressed issues with wisdom, kindness, and at appropriate times. He taught us to be good neighbors and to address conflicts with gentle counsel.",
        hadith: "The Prophet ﷺ said: 'He is not a believer whose neighbor does not feel safe from his harm.'",
        difficulty: "intermediate"
      },
      {
        prompt: "You see someone struggling financially, but they haven't asked for help and seem proud. How would the Prophet ﷺ handle this?",
        options: [
          "Ignore it - if they don't ask, don't interfere",
          "Publicly announce their situation to get them help",
          "Find a discreet way to help without embarrassing them",
          "Tell them directly they need to ask for help"
        ],
        correct: 2,
        answer: "Find a discreet way to help without embarrassing them",
        explanation: "The Prophet ﷺ was extremely considerate of people's dignity. He would often help people secretly to preserve their honor.",
        hadith: "The Prophet ﷺ said: 'The upper hand is better than the lower hand, and begin with those for whom you are responsible.'",
        difficulty: "intermediate"
      }
    ],
    timeline: [
      {
        prompt: "Arrange these events in chronological order:",
        events: [
          { id: 1, text: "Birth of Prophet Muhammad ﷺ", year: "570 CE" },
          { id: 2, text: "First Revelation in Cave Hira", year: "610 CE" },
          { id: 3, text: "Hijra to Madinah", year: "622 CE" },
          { id: 4, text: "Conquest of Makkah", year: "630 CE" }
        ],
        correctOrder: [1, 2, 3, 4],
        explanation: "These are key milestones in the life of Prophet Muhammad ﷺ"
      },
      {
        prompt: "Order these major battles of early Islam:",
        events: [
          { id: 1, text: "Battle of Badr", year: "624 CE" },
          { id: 2, text: "Battle of Uhud", year: "625 CE" },
          { id: 3, text: "Battle of the Trench", year: "627 CE" },
          { id: 4, text: "Treaty of Hudaybiyyah", year: "628 CE" }
        ],
        correctOrder: [1, 2, 3, 4],
        explanation: "These battles shaped the early Muslim community and demonstrated divine support"
      }
    ],
    ethics: [
      {
        prompt: "Your friend asks you to lie to their parents about where they're going tonight. What should you do?",
        options: [
          "Agree to help your friend",
          "Politely decline and explain why lying is wrong",
          "Tell their parents yourself",
          "Ignore the request"
        ],
        correct: 1,
        explanation: "Islam teaches us to be truthful and to encourage others toward good. We should kindly decline and explain the importance of honesty."
      },
      {
        prompt: "You find a wallet with money and ID on the street. What's the most Islamic approach?",
        options: [
          "Keep the money but return the wallet",
          "Take it to the police or try to find the owner",
          "Leave it where you found it",
          "Keep everything since no one saw you"
        ],
        correct: 1,
        explanation: "The Prophet ﷺ said: 'He is not one of us who does not have mercy on our young and does not respect our elders.' Returning lost items is an act of trustworthiness (amanah)."
      },
      {
        prompt: "Your colleague is being treated unfairly at work because of their race. What should you do?",
        options: [
          "Stay quiet to avoid workplace drama",
          "Support them privately but don't get involved publicly",
          "Stand up for them and report the discrimination",
          "Advise them to just tolerate it"
        ],
        correct: 2,
        explanation: "Islam commands us to stand against injustice. The Prophet ﷺ said: 'Help your brother, whether he is an oppressor or he is oppressed.' We must actively work against discrimination."
      }
    ],
    names99: [
      {
        prompt: "Which of Allah's names means 'The Most Merciful'?",
        options: [
          "Ar-Rahman",
          "Al-Hakeem",
          "Al-Qadeer",
          "As-Saboor"
        ],
        correct: 0,
        explanation: "Ar-Rahman means 'The Most Merciful' - Allah's mercy encompasses all of creation."
      },
      {
        prompt: "Which name of Allah means 'The All-Knowing'?",
        options: [
          "Al-Hakeem",
          "Al-Aleem",
          "Al-Qadeer",
          "Ar-Razzaq"
        ],
        correct: 1,
        explanation: "Al-Aleem means 'The All-Knowing' - Allah knows everything that was, is, and will be."
      },
      {
        prompt: "Which of Allah's names means 'The Provider'?",
        options: [
          "Al-Malik",
          "Al-Hakeem",
          "Ar-Razzaq",
          "As-Saboor"
        ],
        correct: 2,
        explanation: "Ar-Razzaq means 'The Provider' - Allah provides sustenance for all His creation."
      },
      {
        prompt: "Which name of Allah means 'The Patient'?",
        options: [
          "As-Saboor",
          "Al-Haleem",
          "Ar-Rahman",
          "Al-Ghafoor"
        ],
        correct: 0,
        explanation: "As-Saboor means 'The Patient' - Allah is patient with His servants despite their shortcomings."
      },
      {
        prompt: "Which of Allah's names means 'The Forgiver'?",
        options: [
          "Ar-Rahman",
          "Al-Ghafoor",
          "Al-Haleem",
          "At-Tawwab"
        ],
        correct: 1,
        explanation: "Al-Ghafoor means 'The Forgiver' - Allah forgives those who sincerely repent."
      }
    ]
  };

  const chillContent = {
    funny: [
      {
        title: "The Bedouin's Lesson",
        story: "A Bedouin came to the mosque and, not knowing the etiquette, began to urinate in a corner. The Sahaba were shocked, but the Prophet ﷺ gently stopped them from scolding the man. He waited patiently, helped clean the area, and kindly taught the Bedouin proper mosque etiquette with such grace that the man's heart filled with love for Islam.",
        reflection: "How can we teach others with the same patience and kindness?"
      }
    ],
    heartwarming: [
      {
        title: "Umar's Tears",
        story: "Umar ibn al-Khattab رضي الله عنه would cry so intensely during prayer that tears carved permanent marks down his cheeks. His khushu was so deep that everyone who saw him was moved by his connection with Allah, showing that true strength includes spiritual tenderness.",
        reflection: "What helps you feel a deeper connection in your prayers?"
      }
    ],
    battles: [
      {
        title: "Safiyyah's Courage",
        story: "During the Battle of the Trench, when an enemy soldier breached the women's quarters, Safiyyah bint Abdul-Muttalib, the Prophet's aunt, didn't hesitate. She grabbed a tent pole and defended everyone inside, showing that courage comes in many forms and from all members of the ummah.",
        reflection: "How can we show courage in protecting our communities today?"
      }
    ]
  };

  const gameTypes = [
    { id: 'prophet', name: 'Guess the Prophet', icon: Crown, gradient: 'from-amber-400 via-orange-400 to-red-400', shadow: 'shadow-amber-500/25' },
    { id: 'ayah', name: 'Complete the Ayah', icon: Book, gradient: 'from-emerald-400 via-teal-400 to-cyan-400', shadow: 'shadow-emerald-500/25' },
    { id: 'sahabi', name: 'Guess the Sahabi', icon: Users, gradient: 'from-blue-400 via-indigo-400 to-purple-400', shadow: 'shadow-blue-500/25' },
    { id: 'sunnah', name: 'Name a Sunnah', icon: Heart, gradient: 'from-rose-400 via-pink-400 to-fuchsia-400', shadow: 'shadow-rose-500/25' },
    { id: 'wwpd', name: 'What Would Prophet ﷺ Do?', icon: Compass, gradient: 'from-purple-400 via-violet-400 to-indigo-400', shadow: 'shadow-purple-500/25' },
    { id: 'timeline', name: 'Timeline Challenge', icon: Calendar, gradient: 'from-violet-400 via-purple-400 to-indigo-400', shadow: 'shadow-violet-500/25' },
    { id: 'ethics', name: 'Islamic Ethics', icon: Scale, gradient: 'from-teal-400 via-cyan-400 to-blue-400', shadow: 'shadow-teal-500/25' },
    { id: 'names99', name: '99 Names', icon: Sparkles, gradient: 'from-pink-400 via-rose-400 to-orange-400', shadow: 'shadow-pink-500/25' }
  ];

  const chillCategories = [
    { id: 'funny', name: 'Funny', icon: Zap, gradient: 'from-yellow-400 via-amber-400 to-orange-400', shadow: 'shadow-yellow-500/25' },
    { id: 'heartwarming', name: 'Heartwarming', icon: Heart, gradient: 'from-pink-400 via-rose-400 to-red-400', shadow: 'shadow-pink-500/25' },
    { id: 'battles', name: 'Courage', icon: Shield, gradient: 'from-red-400 via-orange-400 to-amber-400', shadow: 'shadow-red-500/25' }
  ];

  const themes = {
    desert: {
      bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
      text: 'text-amber-900',
      cardBg: 'bg-white/90 backdrop-blur-sm',
      border: 'border-amber-200/50'
    },
    scroll: {
      bg: 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100',
      text: 'text-amber-800',
      cardBg: 'bg-amber-50/90 backdrop-blur-sm',
      border: 'border-amber-300/50'
    },
    midnight: {
      bg: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900',
      text: 'text-slate-100',
      cardBg: 'bg-slate-800/90 backdrop-blur-sm',
      border: 'border-slate-600/50'
    }
  };

  const currentTheme = $derived(themes[theme]);

  function handleCardClick() {
    isFlipped = !isFlipped;
  }


  function startChillCategory(category) {
    chillCategory = category;
    currentScreen = 'chillTell';
    isFlipped = false;
  }

  function handleCorrect() {
    score++;
    round++;
    isFlipped = false;
  }

  function handleSkip() {
    round++;
    isFlipped = false;
  }

  function handleFlipBack() {
    isFlipped = false;
  }

  function initializeGame() {
    if (gameMode === 'team' && players.length > 0) {
      const initialScores = {};
      players.forEach(player => {
        initialScores[player] = 0;
      });
      teamScores = initialScores;
    }
    currentPlayer = 0;
    score = 0;
    round = 1;
  }

  function cycleTheme() {
    if (theme === 'desert') theme = 'scroll';
    else if (theme === 'scroll') theme = 'midnight';
    else theme = 'desert';
  }

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function handleTimelineClick(item) {
    if (selectedTimelineItems.includes(item.id)) {
      selectedTimelineItems = selectedTimelineItems.filter(id => id !== item.id);
    } else {
      selectedTimelineItems = [...selectedTimelineItems, item.id];
    }
  }

  function checkTimelineOrder() {
    const content = gameContent[currentGame?.id]?.[0];
    if (!content) return false;
    
    return JSON.stringify(selectedTimelineItems) === JSON.stringify(content.correctOrder);
  }

  function handleMultipleChoice(optionIndex) {
    multipleChoiceAnswer = optionIndex;
    isFlipped = true;
  }

  function checkMultipleChoice() {
    const content = gameContent[currentGame?.id]?.[0];
    if (!content) return false;
    
    return multipleChoiceAnswer === content.correct;
  }

  function resetGameState() {
    selectedTimelineItems = [];
    multipleChoiceAnswer = '';
    isFlipped = false;
    showWWPDAnswer = false;
    selectedOption = null;
  }

  function generateRoomCode(length = 9) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function handleRoomModeChange(event) {
    roomMode = event.currentTarget.value;
    if (roomMode === 'Private') {
      roomCode = generateRoomCode();
    }
  }

  function handleCopyRoomCode() {
    if (!roomCode) return;
    navigator?.clipboard?.writeText(roomCode);
    copiedRoomCode = true;
    if (copyResetTimer) clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => {
      copiedRoomCode = false;
    }, 1200);
  }

  onMount(() => {
    if (roomMode === 'Private') {
      roomCode = generateRoomCode();
    }
  });

  function getDifficultySeconds(value) {
    if (value === 'hard') return 20;
    if (value === 'medium') return 25;
    return 40;
  }

  function startPrivateQuestion() {
    privateSecondsLeft = getDifficultySeconds(privateDifficulty);
    privateSelectedOption = null;
    privateAnswersRevealed = false;
    if (privateTimerId) clearInterval(privateTimerId);
    privateTimerId = setInterval(() => {
      if (privateSecondsLeft <= 1) {
        clearInterval(privateTimerId);
        privateTimerId = null;
        privateSecondsLeft = 0;
        privateAnswersRevealed = true;
      } else {
        privateSecondsLeft -= 1;
      }
    }, 1000);
  }

  function selectPrivateAnswer(index) {
    if (privateAnswersRevealed) return;
    privateSelectedOption = index;
  }

  function advancePrivateQuestion() {
    if (privateQuestionIndex >= privateTotalQuestions) {
      if (privateTimerId) {
        clearInterval(privateTimerId);
        privateTimerId = null;
      }
      showPrivateGameOver = true;
      return;
    }
    privateQuestionIndex += 1;
    startPrivateQuestion();
  }

  function openGameMode(title) {
    selectedRoleTitle = title;
    showGameMode = true;
  }

  function closeGameMode() {
    showGameMode = false;
  }

  function handleWWPDOption(optionIndex) {
    selectedOption = optionIndex;
    showWWPDAnswer = true;
  }

  function startGame(game) {
    currentGame = game;
    currentScreen = 'playing';
    resetGameState();
    
    // Initialize timeline items if it's a timeline game
    if (game.id === 'timeline') {
      const content = getRandomContent(game.id);
      if (content) {
        timelineItems = shuffleArray(content.events);
      }
    }
  }

  function getRandomContent(gameId) {
    const contentArray = gameContent[gameId];
    if (!contentArray || contentArray.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * contentArray.length);
    return contentArray[randomIndex];
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

{#if currentScreen === 'home'}
  <div class="min-h-screen w-full bg-white flex items-center justify-center game-flow">
    <div class="relative w-full h-screen bg-white">
      <button
        class="absolute top-3 left-3 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full border border-black/60 bg-white flex items-center justify-center transition-colors duration-300 hover:bg-[#62b8af] cursor-pointer"
        aria-label="Settings"
        type="button"
      >
        <Settings class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-black" />
      </button>

      <div class="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-[#62b8af] flex items-center justify-center">
        <User class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
      </div>

      <div class="absolute inset-0 flex items-center justify-center">
        <img
          src="/cloud-bg.svg"
          alt="Background cloud"
          class="w-full h-full object-contain"
          out:sendCloud={{ key: 'home-cloud' }}
        />
      </div>

      <div class="relative z-10 flex flex-col items-center justify-center h-full space-y-4">
        <h1 class="text-[clamp(1.75rem,4.5vw,3.25rem)] font-semibold text-black" style="font-family: 'Nunito', sans-serif;">Suhba</h1>
        <button
          onclick={() => currentScreen = 'modeSelector'}
          class="px-5 sm:px-7 md:px-10 lg:px-14 py-2.5 sm:py-3 md:py-3.5 lg:py-4 rounded-2xl bg-[#ffd230] text-black shadow-sm border border-black/60 text-base sm:text-lg md:text-xl lg:text-2xl transition-transform duration-200 hover:scale-105 cursor-pointer"
          style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.08em;"
        >
          START
        </button>
      </div>
    </div>
  </div>

{:else if currentScreen === 'modeSelector'}
  <div class="min-h-screen w-full bg-white flex items-center justify-center game-flow">
    <div class="relative w-full h-screen bg-white">
      <button
        class="absolute top-3 left-3 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full border border-black/60 bg-white flex items-center justify-center transition-colors duration-300 hover:bg-[#62b8af] cursor-pointer"
        aria-label="Settings"
        type="button"
      >
        <Settings class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-black" />
      </button>

      <div class="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-[#62b8af] flex items-center justify-center">
        <User class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
      </div>

      <button
        onclick={() => currentScreen = 'home'}
        class="fixed top-14 left-8 sm:top-16 sm:left-10 md:top-20 md:left-14 lg:top-24 lg:left-16 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#62b8af] flex items-center justify-center border border-black/60 shadow-sm cursor-pointer z-20 transition-transform duration-200 hover:scale-105"
        aria-label="Back"
        type="button"
      >
        <ArrowLeft class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
      </button>

      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/cloud-bg.svg"
          alt="Background cloud"
          class="w-full h-full object-contain opacity-60"
          in:receiveCloud={{ key: 'mode-cloud' }}
        />
      </div>

      <div class="relative z-10 flex flex-col items-center justify-center h-full space-y-6">
        <button
          onclick={() => {
            gameMode = 'solo';
            currentScreen = 'gameSelector';
          }}
          class="w-[70%] max-w-md px-6 py-3 rounded-2xl bg-[#7ac4b5] text-black shadow-sm border border-black/60 text-base sm:text-lg md:text-xl font-semibold transition-transform duration-200 hover:scale-105 cursor-pointer"
        >
          ONLINE MODE
        </button>

        <button
          onclick={() => {
            gameMode = 'team';
            currentScreen = 'teamSetup';
          }}
          class="w-[70%] max-w-md px-6 py-3 rounded-2xl bg-[#7ac4b5] text-black shadow-sm border border-black/60 text-base sm:text-lg md:text-xl font-semibold transition-transform duration-200 hover:scale-105 cursor-pointer"
        >
          LOCAL GATHERING
        </button>
      </div>
    </div>
  </div>

{:else if currentScreen === 'teamSetup'}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden game-flow">
    <div class="max-w-2xl mx-auto relative z-10">
      <div class="flex items-center justify-between mb-8">
        <button
          onclick={() => currentScreen = 'modeSelector'}
          class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
        >
          <ArrowLeft class="w-5 h-5" />
          <span>Back</span>
        </button>
        <h2 class="text-2xl font-bold {currentTheme.text}">Team Setup</h2>
        <div></div>
      </div>

      <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm mb-6">
        <h3 class="text-xl font-semibold {currentTheme.text} mb-6">Add Players</h3>
        <div class="space-y-4">
          {#each players as player, index}
            <div class="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-xl">
              <span class="{currentTheme.text}">{player}</span>
              <button
                onclick={() => players = players.filter((_, i) => i !== index)}
                class="text-red-500 hover:text-red-700 transition-colors text-xl font-bold w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          {/each}
          <div class="flex space-x-3">
            <input
              type="text"
              placeholder="Player name..."
              class="flex-1 p-3 rounded-xl border-2 {currentTheme.border} bg-transparent {currentTheme.text} placeholder-opacity-60"
              onkeypress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  players = [...players, e.target.value.trim()];
                  e.target.value = '';
                }
              }}
            />
            <button
              onclick={() => {
                const input = document.querySelector('input[placeholder=\"Player name...\"]');
                if (input && input.value.trim()) {
                  players = [...players, input.value.trim()];
                  input.value = '';
                }
              }}
              class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {#if players.length > 0}
        <button
          onclick={() => {
            initializeGame();
            currentScreen = 'gameSelector';
          }}
          class="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300"
        >
          Start Team Game ({players.length} players)
        </button>
      {/if}
    </div>
  </div>

{:else if currentScreen === 'gameSelector'}
  <div class="min-h-screen w-full bg-white flex items-center justify-center game-flow">
    <div class="relative w-full h-screen bg-white">
      <button
        class="absolute top-3 left-3 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full border border-black/60 bg-white flex items-center justify-center transition-colors duration-300 hover:bg-[#62b8af] cursor-pointer"
        aria-label="Settings"
        type="button"
      >
        <Settings class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-black" />
      </button>

      <div class="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full bg-[#62b8af] flex items-center justify-center">
        <User class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
      </div>

      <button
        onclick={() => currentScreen = 'modeSelector'}
        class="fixed top-14 left-8 sm:top-16 sm:left-10 md:top-20 md:left-14 lg:top-24 lg:left-16 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#62b8af] flex items-center justify-center border border-black/60 shadow-sm cursor-pointer z-20 transition-transform duration-200 hover:scale-105"
        aria-label="Back"
        type="button"
      >
        <ArrowLeft class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
      </button>

      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/cloud-bg.svg"
          alt="Background cloud"
          class="w-full h-full object-contain opacity-60"
        />
      </div>

      <div class="relative z-10 flex flex-col items-center justify-center h-full space-y-8">
        <button
          onclick={() => {
            gameMode = 'solo';
            currentScreen = 'createRoom';
          }}
          class="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-3xl bg-[#7ac4b5] text-black shadow-sm border border-black/60 flex flex-col items-center justify-center gap-3 text-base sm:text-lg md:text-xl font-semibold transition-transform duration-200 hover:scale-105 cursor-pointer"
        >
          <div class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 border-white flex items-center justify-center">
            <Plus class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          </div>
          <span>CREATE ROOM</span>
        </button>

        <button
          onclick={() => {
            gameMode = 'solo';
            currentScreen = 'playing';
          }}
          class="w-44 h-44 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-3xl bg-[#7ac4b5] text-black shadow-sm border border-black/60 flex flex-col items-center justify-center gap-3 text-base sm:text-lg md:text-xl font-semibold transition-transform duration-200 hover:scale-105 cursor-pointer"
        >
          <div class="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 border-white flex items-center justify-center">
            <DoorOpen class="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
          </div>
          <span>JOIN ROOM</span>
        </button>
      </div>
    </div>
  </div>

{:else if currentScreen === 'createRoom'}
  <div class="min-h-screen w-full bg-white flex items-center justify-center game-flow">
    <div class="relative w-full h-screen bg-white">
      <button
        onclick={() => currentScreen = 'gameSelector'}
        class="fixed top-14 left-8 sm:top-16 sm:left-10 md:top-20 md:left-14 lg:top-24 lg:left-16 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#62b8af] flex items-center justify-center border border-black/60 shadow-sm cursor-pointer z-20 transition-transform duration-200 hover:scale-105"
        aria-label="Back"
        type="button"
      >
        <ArrowLeft class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
      </button>

      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/cloud-bg.svg"
          alt="Background cloud"
          class="w-full h-full object-contain opacity-60"
        />
      </div>

      <div class="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <div class="w-full max-w-lg">
          {#if roomMode === 'Private' && roomCode}
            <div class="flex items-center justify-center gap-3 mb-4 sm:mb-6">
              <div class="text-sm sm:text-base md:text-lg font-semibold text-black">
                ROOM # {roomCode}
              </div>
              <button
                class="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-black/60 flex items-center justify-center cursor-pointer transition-colors duration-300 {copiedRoomCode ? 'bg-green-500' : 'bg-[#62b8af]'}"
                aria-label="Copy room code"
                type="button"
                onclick={handleCopyRoomCode}
              >
                {#if copiedRoomCode}
                  <Check class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                {:else}
                  <Copy class="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                {/if}
              </button>
            </div>
          {/if}

          <div class="rounded-3xl bg-[#7ac4b5] border-2 border-black/60 p-6 sm:p-8 md:p-9 space-y-5">
            <div class="flex items-center justify-between gap-3 rounded-2xl bg-[#89dbcb] border border-black/60 px-5 py-4">
              <span class="text-base sm:text-lg md:text-xl font-semibold text-black">ROOM NAME:</span>
              <select
                bind:value={roomName}
                class="w-44 sm:w-56 md:w-64 rounded-full bg-[#e0f2f1] border border-black/60 px-4 py-2 text-sm sm:text-base md:text-lg font-semibold text-black cursor-pointer text-center"
              >
                <option>The Suhba</option>
                <option>The Ikhwah</option>
                <option>The Ummah Members</option>
                <option>The Brothers</option>
                <option>Brotherhood</option>
              </select>
            </div>

            <div class="flex items-center justify-between gap-3 rounded-2xl bg-[#89dbcb] border border-black/60 px-5 py-4">
              <span class="text-base sm:text-lg md:text-xl font-semibold text-black">ROOM MODE:</span>
              <select
                bind:value={roomMode}
                onchange={handleRoomModeChange}
                class="w-44 sm:w-56 md:w-64 rounded-full bg-[#e0f2f1] border border-black/60 px-4 py-2 text-sm sm:text-base md:text-lg font-semibold text-black cursor-pointer text-center"
              >
                <option>Public</option>
                <option>Private</option>
              </select>
            </div>

            <div class="flex items-center justify-between gap-3 rounded-2xl bg-[#89dbcb] border border-black/60 px-5 py-4">
              <span class="text-base sm:text-lg md:text-xl font-semibold text-black"># OF PLAYERS:</span>
              <select
                bind:value={playerCount}
                class="w-44 sm:w-56 md:w-64 rounded-full bg-[#e0f2f1] border border-black/60 px-4 py-2 text-sm sm:text-base md:text-lg font-semibold text-black cursor-pointer text-center"
              >
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
              </select>
            </div>

            <div class="flex items-center justify-between gap-3 rounded-2xl bg-[#89dbcb] border border-black/60 px-5 py-4">
              <span class="text-base sm:text-lg md:text-xl font-semibold text-black">PASSWORD:</span>
              <input
                type="text"
                bind:value={roomPassword}
                class="w-44 sm:w-56 md:w-64 rounded-full bg-[#e0f2f1] border border-black/60 px-4 py-2 text-sm sm:text-base md:text-lg font-semibold text-black text-center"
              />
            </div>

            <div class="pt-3 flex justify-center">
              <button
                onclick={() => currentScreen = 'roomRoles'}
                class="px-7 sm:px-10 py-3 rounded-2xl bg-[#ffd230] text-black shadow-sm border border-black/60 text-base sm:text-lg md:text-xl font-semibold transition-transform duration-200 hover:scale-105 cursor-pointer"
                type="button"
              >
                CREATE ROOM
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

{:else if currentScreen === 'roomRoles'}
  <div class="min-h-screen w-full bg-white flex items-center justify-center game-flow">
    <div class="relative w-full h-screen bg-white">
      <button
        onclick={() => currentScreen = 'createRoom'}
        class="fixed top-14 left-8 sm:top-16 sm:left-10 md:top-20 md:left-14 lg:top-24 lg:left-16 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-[#62b8af] flex items-center justify-center border border-black/60 shadow-sm cursor-pointer z-20 transition-transform duration-200 hover:scale-105"
        aria-label="Back"
        type="button"
      >
        <ArrowLeft class="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
      </button>

      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/cloud-bg.svg"
          alt="Background cloud"
          class="w-full h-full object-contain opacity-60"
        />
      </div>

      <div class="relative z-10 flex items-center justify-center h-full px-6">
        <div class="relative w-full max-w-md rounded-3xl bg-[#7ac4b5] border-2 border-black/60 p-5 sm:p-6 md:p-7">
          <div class="space-y-3 sm:space-y-4">
            <button
              class="w-full rounded-2xl bg-[#e0f2f1] border border-black/60 px-4 py-3 text-sm sm:text-base md:text-lg font-semibold text-black flex items-center gap-3 cursor-pointer"
              type="button"
              onclick={() => openGameMode('WHO IS THE FIGURE?')}
            >
              <User class="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              <span>WHO IS THE FIGURE?</span>
            </button>
            <button
              class="w-full rounded-2xl bg-[#e0f2f1] border border-black/60 px-4 py-3 text-sm sm:text-base md:text-lg font-semibold text-black flex items-center gap-3 cursor-pointer"
              type="button"
              onclick={() => openGameMode('THE HAFIZ POTENTIAL')}
            >
              <Book class="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              <span>THE HAFIZ POTENTIAL</span>
            </button>
            <button
              class="w-full rounded-2xl bg-[#e0f2f1] border border-black/60 px-4 py-3 text-sm sm:text-base md:text-lg font-semibold text-black flex items-center gap-3 cursor-pointer"
              type="button"
              onclick={() => openGameMode('THE HADITH EXPERT')}
            >
              <MessageCircle class="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              <span>THE HADITH EXPERT</span>
            </button>
            <button
              class="w-full rounded-2xl bg-[#e0f2f1] border border-black/60 px-4 py-3 text-sm sm:text-base md:text-lg font-semibold text-black flex items-center gap-3 cursor-pointer"
              type="button"
              onclick={() => openGameMode('THE SEERAH MASTER')}
            >
              <Book class="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              <span>THE SEERAH MASTER</span>
            </button>
            <button
              class="w-full rounded-2xl bg-[#e0f2f1] border border-black/60 px-4 py-3 text-sm sm:text-base md:text-lg font-semibold text-black flex items-center gap-3 cursor-pointer"
              type="button"
              onclick={() => openGameMode('THE STORYTELLER')}
            >
              <MessageCircle class="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              <span>THE STORYTELLER</span>
            </button>
            <button
              class="w-full rounded-2xl bg-[#e0f2f1] border border-black/60 px-4 py-3 text-sm sm:text-base md:text-lg font-semibold text-black flex items-center gap-3 cursor-pointer"
              type="button"
              onclick={() => openGameMode("THE MA'AJAM BEE")}
            >
              <Book class="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              <span>THE MA'AJAM BEE</span>
            </button>
            <button
              class="w-full rounded-2xl bg-[#e0f2f1] border border-black/60 px-4 py-3 text-sm sm:text-base md:text-lg font-semibold text-black flex items-center gap-3 cursor-pointer"
              type="button"
              onclick={() => openGameMode('THE FAQEH')}
            >
              <Scroll class="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              <span>THE FAQEH</span>
            </button>
          </div>

          {#if showGameMode}
            <div
              class="absolute inset-0 rounded-3xl bg-black/50"
              in:fade={{ duration: 150 }}
              out:fade={{ duration: 150 }}
            ></div>
            <div
              class="absolute inset-0 flex items-center justify-center px-4"
              in:scale={{ duration: 200, start: 0.95 }}
              out:scale={{ duration: 150, start: 1 }}
            >
              <div class="w-full max-w-xs sm:max-w-sm rounded-3xl bg-[#7ac4b5] border-2 border-black/60 p-5 sm:p-6 md:p-7 shadow-lg">
                <div class="relative mb-4">
                  <button
                    class="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-[#62b8af] border border-black/60 flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105"
                    aria-label="Close"
                    type="button"
                    onclick={closeGameMode}
                  >
                    <ArrowLeft class="w-4 h-4 text-white" />
                  </button>
                  <div class="text-xs sm:text-sm font-semibold text-black text-center">
                    <span class="font-bold">{selectedRoleTitle}</span> GAME MODE
                  </div>
                </div>
                <div class="flex flex-col items-center gap-3">
                  <button
                    class="w-full max-w-[10rem] rounded-2xl bg-[#e0f2f1] border border-black/60 py-2 text-sm sm:text-base font-semibold text-black cursor-pointer"
                    type="button"
                    onclick={() => {
                      privateDifficulty = 'easy';
                      showGameMode = false;
                      if (roomMode === 'Private') {
                        showPrivateGameOver = false;
                        privateQuestionIndex = 1;
                        startPrivateQuestion();
                        currentScreen = 'privatePlaying';
                      }
                    }}
                  >
                    EASY
                  </button>
                  <button
                    class="w-full max-w-[10rem] rounded-2xl bg-[#e0f2f1] border border-black/60 py-2 text-sm sm:text-base font-semibold text-black cursor-pointer"
                    type="button"
                    onclick={() => {
                      privateDifficulty = 'medium';
                      showGameMode = false;
                      if (roomMode === 'Private') {
                        showPrivateGameOver = false;
                        privateQuestionIndex = 1;
                        startPrivateQuestion();
                        currentScreen = 'privatePlaying';
                      }
                    }}
                  >
                    MEDIUM
                  </button>
                  <button
                    class="w-full max-w-[10rem] rounded-2xl bg-[#e0f2f1] border border-black/60 py-2 text-sm sm:text-base font-semibold text-black cursor-pointer"
                    type="button"
                    onclick={() => {
                      privateDifficulty = 'hard';
                      showGameMode = false;
                      if (roomMode === 'Private') {
                        showPrivateGameOver = false;
                        privateQuestionIndex = 1;
                        startPrivateQuestion();
                        currentScreen = 'privatePlaying';
                      }
                    }}
                  >
                    HARD
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

{:else if currentScreen === 'chillSelector'}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden game-flow">
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-5xl mx-auto relative z-10">
      <div class="flex items-center justify-between mb-12">
        <button
          onclick={() => currentScreen = 'home'}
          class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
        >
          <ArrowLeft class="w-5 h-5" />
          <span>Back</span>
        </button>
        <h2 class="text-3xl font-bold {currentTheme.text}">Choose a Category</h2>
        <div></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each chillCategories as category}
          <button
            onclick={() => startChillCategory(category)}
            class="group relative bg-gradient-to-br {category.gradient} p-8 rounded-3xl hover:shadow-2xl {category.shadow} hover:-translate-y-3 hover:scale-105 transition-all duration-500 overflow-hidden"
          >
            <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative">
              <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svelte:component this={category.icon} class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-white font-bold text-xl text-center leading-tight">{category.name}</h3>
              <div class="w-12 h-1 bg-white/40 rounded-full mx-auto mt-4 group-hover:w-16 transition-all duration-300"></div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

{:else if currentScreen === 'privatePlaying'}
  <div class="min-h-screen w-full bg-white flex items-center justify-center game-flow">
    <div class="relative w-full h-screen bg-white">
      <button
        class="absolute top-3 left-3 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full border border-black/60 bg-white flex items-center justify-center transition-colors duration-300 hover:bg-[#62b8af] cursor-pointer"
        aria-label="Settings"
        type="button"
      >
        <Settings class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-black" />
      </button>

      {#if roomMode === 'Private'}
        <button
          onclick={() => isMicOpen = !isMicOpen}
          class="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full border border-black/60 flex items-center justify-center cursor-pointer"
          style={`background-color: ${isMicOpen ? '#e48686' : '#000000'}`}
          aria-label="Mic toggle"
          type="button"
        >
          {#if isMicOpen}
            <Mic class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
          {:else}
            <MicOff class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
          {/if}
        </button>
      {/if}

      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/cloud-bg.svg"
          alt="Background cloud"
          class="w-full h-full object-contain opacity-60"
        />
      </div>

      <div class="relative z-10 flex items-center justify-center h-full px-6">
        <div class="w-full max-w-lg rounded-3xl bg-[#7ac4b5] border-2 border-black/60 p-6 sm:p-8 md:p-9">
          {#if showPrivateGameOver}
            <div class="text-center text-sm sm:text-base font-semibold text-black mb-4">GAME OVER</div>
            <div class="space-y-3">
              {#each leaderboard as entry, index}
                <div class="flex items-center justify-between gap-3 rounded-2xl bg-[#e0f2f1] border border-black/60 px-4 py-2 text-sm sm:text-base font-semibold text-black">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-[#7ed957] text-black flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span>{entry.name}</span>
                  </div>
                  <div class="w-8 text-center rounded-full bg-[#e0f2f1] border border-black/60 text-sm font-bold">{entry.score}</div>
                </div>
              {/each}
            </div>
            <div class="pt-4 flex items-center justify-center gap-3">
              {#if isRoomCreator}
                <button
                  class="px-6 py-2 rounded-2xl bg-[#ffd230] text-black shadow-sm border border-black/60 text-sm sm:text-base font-semibold cursor-pointer"
                  type="button"
                  onclick={() => {
                    showPrivateGameOver = false;
                    if (privateTimerId) {
                      clearInterval(privateTimerId);
                      privateTimerId = null;
                    }
                    currentScreen = 'roomRoles';
                  }}
                >
                  REPEAT
                </button>
              {/if}
              <button
                class="px-6 py-2 rounded-2xl bg-[#e48686] text-black shadow-sm border border-black/60 text-sm sm:text-base font-semibold cursor-pointer"
                type="button"
                onclick={() => {
                  showPrivateGameOver = false;
                  if (privateTimerId) {
                    clearInterval(privateTimerId);
                    privateTimerId = null;
                  }
                  currentScreen = 'modeSelector';
                }}
              >
                EXIT
              </button>
            </div>
          {:else}
            <div class="relative mb-5">
              <div
                class="absolute -top-4 -left-4 rounded-full bg-[#62b8af] text-white text-xs sm:text-sm font-semibold px-3 py-1 border-2 border-black/60"
                style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.06em;"
              >
                {privateQuestionIndex}/{privateTotalQuestions}
              </div>
              <div
                class="absolute -bottom-4 -right-4 w-10 h-10 rounded-full bg-white text-black text-xs sm:text-sm font-semibold border-2 border-black/60 flex items-center justify-center"
                style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em;"
              >
                {privateSecondsLeft}
              </div>
              <div
                class="rounded-2xl bg-white border-2 border-black/60 px-5 py-6 text-sm sm:text-base md:text-lg text-black"
                style="font-family: 'Nunito', sans-serif;"
              >
                {privateQuestion.prompt}
              </div>
            </div>

            <div class="space-y-3">
              {#each privateQuestion.options as option, index}
                <button
                  onclick={() => selectPrivateAnswer(index)}
                  class="w-full rounded-2xl border-2 border-black/60 px-4 py-3 text-sm sm:text-base md:text-lg font-medium text-black flex items-center gap-3 cursor-pointer {
                    privateAnswersRevealed && privateSelectedOption === index
                      ? privateSelectedOption === privateCorrectIndex
                        ? 'bg-[#7ed957]'
                        : 'bg-[#e48686]'
                      : 'bg-[#e0f2f1]'
                  }"
                  type="button"
                  style="font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em;"
                >
                  <div
                    class="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-black/60 flex items-center justify-center text-sm sm:text-base font-bold {
                      privateSelectedOption === index ? 'bg-[#ffd230]' : 'bg-white'
                    }"
                    style="font-family: 'Bebas Neue', sans-serif;"
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </button>
              {/each}
            </div>

            {#if privateAnswersRevealed}
              <div class="pt-4 flex justify-center">
                <button
                  class="px-6 py-2 rounded-2xl bg-[#62b8af] text-black shadow-sm border border-black/60 text-sm sm:text-base font-semibold cursor-pointer"
                  type="button"
                  onclick={advancePrivateQuestion}
                >
                  NEXT
                </button>
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>
  </div>

{:else if currentScreen === 'playing'}
  {@const content = getRandomContent(currentGame?.id)}
  {#if content && currentGame?.id === 'wwpd'}
    <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden game-flow">
      <div class="max-w-5xl mx-auto relative z-10">
        <!-- Header -->
        <div class="flex items-center justify-between mb-12">
          <button
            onclick={() => currentScreen = 'gameSelector'}
            class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>Back</span>
          </button>
          <div class="text-center">
            <h2 class="text-2xl font-bold {currentTheme.text}">{currentGame?.name}</h2>
            <p class="{currentTheme.text} opacity-60 text-sm mt-1">
              {gameMode === 'team' && players.length > 0 
                ? `${players[currentPlayer]}'s turn • Round ${round}` 
                : `Round ${round} • Score ${score}`}
            </p>
          </div>
          <div></div>
        </div>

        <!-- WWPD Card -->
        <div class="max-w-3xl mx-auto mb-16">
          <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto">
              <Compass class="w-8 h-8 text-white" />
            </div>
            
            <h3 class="text-xl font-semibold text-center {currentTheme.text} mb-8 leading-relaxed">
              {content.prompt}
            </h3>
            
            {#if !showWWPDAnswer}
              <div class="space-y-4 mb-6">
                {#each content.options as option, index}
                  <button
                    onclick={() => handleWWPDOption(index)}
                    class="w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 {currentTheme.border} hover:bg-gradient-to-r hover:from-purple-100/20 hover:to-indigo-100/20"
                  >
                    <span class="{currentTheme.text} opacity-60 mr-3 font-medium">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span class="{currentTheme.text}">{option}</span>
                  </button>
                {/each}
              </div>
            {/if}

            {#if showWWPDAnswer}
              <div class="space-y-4">
                {#each content.options as option, index}
                  <div 
                    class="p-4 rounded-2xl border-2 flex items-center justify-between {
                      index === content.correct 
                        ? 'bg-emerald-100/20 border-emerald-300/50' 
                        : selectedOption === index 
                        ? 'bg-red-100/20 border-red-300/50'
                        : `${currentTheme.border} opacity-50`
                    }"
                  >
                    <div class="{currentTheme.text}">
                      <span class="mr-3 font-medium">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                    </div>
                    {#if index === content.correct}
                      <Check class="w-5 h-5 text-emerald-600" />
                    {/if}
                  </div>
                {/each}
                
                <div class="mt-6 p-6 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-2xl">
                  <h4 class="font-semibold {currentTheme.text} mb-3">Explanation:</h4>
                  <p class="{currentTheme.text} opacity-90 mb-4 leading-relaxed">{content.explanation}</p>
                  {#if content.hadith}
                    <div class="border-t border-emerald-300/30 pt-4">
                      <p class="{currentTheme.text} opacity-80 text-sm italic">{content.hadith}</p>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Action Buttons -->
        {#if showWWPDAnswer}
          <div class="flex justify-center space-x-6">
            <button
              onclick={() => {
                if (gameMode === 'team') {
                  const currentPlayerName = players[currentPlayer];
                  if (selectedOption === content.correct) {
                    teamScores[currentPlayerName] = (teamScores[currentPlayerName] || 0) + 1;
                  }
                  currentPlayer = (currentPlayer + 1) % players.length;
                } else {
                  if (selectedOption === content.correct) {
                    score++;
                  }
                }
                round++;
                resetGameState();
              }}
              class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center space-x-3 font-semibold hover:scale-105"
            >
              <SkipForward class="w-5 h-5" />
              <span>Next Question</span>
            </button>
            <button
              onclick={() => resetGameState()}
              class="{currentTheme.cardBg} {currentTheme.border} border-2 {currentTheme.text} px-8 py-4 rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center space-x-3 font-semibold backdrop-blur-sm hover:scale-105"
            >
              <RotateCcw class="w-5 h-5" />
              <span>Try Again</span>
            </button>
          </div>
        {/if}

        <!-- Team Scores -->
        {#if gameMode === 'team' && players.length > 0}
          <div class="mt-12">
            <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-6 backdrop-blur-sm">
              <h3 class="text-lg font-semibold {currentTheme.text} mb-4 text-center">Team Scores</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {#each players as player, index}
                  <div 
                    class="p-3 rounded-xl text-center transition-all duration-300 {
                      index === currentPlayer 
                        ? 'bg-gradient-to-r from-emerald-100/30 to-teal-100/30 border-2 border-emerald-300/50' 
                        : 'bg-gradient-to-r from-gray-100/20 to-gray-200/20'
                    }"
                  >
                    <p class="{currentTheme.text} font-medium">{player}</p>
                    <p class="{currentTheme.text} text-2xl font-bold">{teamScores[player] || 0}</p>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else if content && (currentGame?.id === 'prophet' || currentGame?.id === 'ayah' || currentGame?.id === 'sahabi' || currentGame?.id === 'sunnah')}
    <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden game-flow">
      <!-- Background decoration -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-1/4 right-10 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 left-10 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl"></div>
      </div>

      <div class="max-w-5xl mx-auto relative z-10">
        <!-- Header -->
        <div class="flex items-center justify-between mb-12">
          <button
            onclick={() => currentScreen = 'gameSelector'}
            class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>Back</span>
          </button>
          <div class="text-center">
            <h2 class="text-2xl font-bold {currentTheme.text}">{currentGame?.name}</h2>
            <p class="{currentTheme.text} opacity-60 text-sm mt-1">
              {gameMode === 'team' && players.length > 0 
                ? `${players[currentPlayer]}'s turn • Round ${round}` 
                : `Round ${round} • Score ${score}`}
            </p>
          </div>
          <button class="{currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm">
            <Shuffle class="w-5 h-5" />
          </button>
        </div>

        <!-- Game Card -->
        <div class="mb-16">
          <div class="perspective-1000 w-full max-w-lg mx-auto">
            <div 
              class="relative w-full h-96 transform-style-preserve-3d transition-all duration-700 cursor-pointer {isFlipped ? 'rotate-y-180' : ''} hover:scale-105"
              onclick={handleCardClick}
            >
              <!-- Front of card -->
              <div class="absolute inset-0 w-full h-full backface-hidden">
                <div class="w-full h-full {currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl shadow-2xl p-8 flex flex-col justify-center items-center backdrop-blur-sm">
                  <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Book class="w-8 h-8 text-white" />
                  </div>
                  <h3 class="text-xl font-semibold text-center {currentTheme.text} mb-6 leading-relaxed">
                    {content.prompt || content.title}
                  </h3>
                  <div class="text-center {currentTheme.text} opacity-60 text-sm flex items-center space-x-2">
                    <div class="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
                    <span>Tap to reveal</span>
                    <div class="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <!-- Back of card -->
              <div class="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                <div class="w-full h-full bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-cyan-400/10 {currentTheme.cardBg} border-2 border-emerald-300/50 rounded-3xl shadow-2xl p-8 flex flex-col justify-center backdrop-blur-sm">
                  <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto">
                    <Check class="w-8 h-8 text-white" />
                  </div>
                  <div class="text-center">
                    <h4 class="text-lg font-semibold {currentTheme.text} mb-4 leading-relaxed">
                      {content.answer || content.story}
                    </h4>
                    {#if content.translation}
                      <p class="{currentTheme.text} opacity-80 mb-2 italic text-sm">{content.translation}</p>
                    {/if}
                    {#if content.surah}
                      <p class="{currentTheme.text} opacity-60 text-sm">{content.surah}</p>
                    {/if}
                    {#if content.reflection}
                      <div class="mt-6 p-4 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-2xl">
                        <MessageCircle class="w-5 h-5 mx-auto mb-2 text-emerald-600" />
                        <p class="{currentTheme.text} opacity-80 text-sm italic">{content.reflection}</p>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        {#if isFlipped}
          <div class="flex justify-center space-x-6">
            <button
              onclick={() => {
                if (gameMode === 'team') {
                  const currentPlayerName = players[currentPlayer];
                  teamScores[currentPlayerName] = (teamScores[currentPlayerName] || 0) + 1;
                  currentPlayer = (currentPlayer + 1) % players.length;
                } else {
                  score++;
                }
                round++;
                isFlipped = false;
              }}
              class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center space-x-3 font-semibold hover:scale-105"
            >
              <Check class="w-5 h-5" />
              <span>Correct</span>
            </button>
            <button
              onclick={() => {
                if (gameMode === 'team') {
                  currentPlayer = (currentPlayer + 1) % players.length;
                }
                round++;
                isFlipped = false;
              }}
              class="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 flex items-center space-x-3 font-semibold hover:scale-105"
            >
              <SkipForward class="w-5 h-5" />
              <span>Skip</span>
            </button>
            <button
              onclick={handleFlipBack}
              class="{currentTheme.cardBg} {currentTheme.border} border-2 {currentTheme.text} px-8 py-4 rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center space-x-3 font-semibold backdrop-blur-sm hover:scale-105"
            >
              <RotateCcw class="w-5 h-5" />
              <span>Try Again</span>
            </button>
          </div>
        {/if}

        <!-- Team Scores -->
        {#if gameMode === 'team' && players.length > 0}
          <div class="mt-12">
            <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-6 backdrop-blur-sm">
              <h3 class="text-lg font-semibold {currentTheme.text} mb-4 text-center">Team Scores</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {#each players as player, index}
                  <div 
                    class="p-3 rounded-xl text-center transition-all duration-300 {
                      index === currentPlayer 
                        ? 'bg-gradient-to-r from-emerald-100/30 to-teal-100/30 border-2 border-emerald-300/50' 
                        : 'bg-gradient-to-r from-gray-100/20 to-gray-200/20'
                    }"
                  >
                    <p class="{currentTheme.text} font-medium">{player}</p>
                    <p class="{currentTheme.text} text-2xl font-bold">{teamScores[player] || 0}</p>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  {:else if content && currentGame?.id === 'timeline'}
    <!-- Timeline Challenge Interface -->
    <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden game-flow">
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-1/4 right-10 w-32 h-32 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 left-10 w-40 h-40 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div class="max-w-5xl mx-auto relative z-10">
        <div class="flex items-center justify-between mb-12">
          <button
            onclick={() => currentScreen = 'gameSelector'}
            class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>Back</span>
          </button>
          <div class="text-center">
            <h2 class="text-2xl font-bold {currentTheme.text}">Timeline Challenge</h2>
            <p class="{currentTheme.text} opacity-60 text-sm mt-1">Round {round} • Score {score}</p>
          </div>
          <div></div>
        </div>

        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl shadow-2xl p-8 mb-8 backdrop-blur-sm">
          <h3 class="text-xl font-semibold {currentTheme.text} mb-6 text-center">{content.prompt}</h3>
          
          <div class="space-y-4 mb-8">
            {#each timelineItems as item, index}
              <button
                onclick={() => handleTimelineClick(item)}
                class="w-full p-4 rounded-2xl border-2 transition-all duration-300 {
                  selectedTimelineItems.includes(item.id) 
                    ? 'bg-gradient-to-r from-violet-100 to-purple-100 border-violet-300 transform scale-105' 
                    : currentTheme.cardBg + ' ' + currentTheme.border + ' hover:scale-102'
                } backdrop-blur-sm"
              >
                <div class="flex items-center justify-between">
                  <span class="{currentTheme.text} font-medium">{item.text}</span>
                  <div class="flex items-center space-x-3">
                    <span class="{currentTheme.text} opacity-60 text-sm">{item.year}</span>
                    {#if selectedTimelineItems.includes(item.id)}
                      <div class="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {selectedTimelineItems.indexOf(item.id) + 1}
                      </div>
                    {/if}
                  </div>
                </div>
              </button>
            {/each}
          </div>

          {#if selectedTimelineItems.length === content.events.length}
            <div class="text-center">
              <button
                onclick={() => {
                  if (checkTimelineOrder()) {
                    handleCorrect();
                  } else {
                    handleSkip();
                  }
                  isFlipped = true;
                }}
                class="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 font-semibold hover:scale-105"
              >
                Check Order
              </button>
            </div>
          {/if}

          {#if isFlipped}
            <div class="mt-8 p-6 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-2xl border border-emerald-300/50">
              <div class="text-center">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {#if checkTimelineOrder()}
                    <Check class="w-6 h-6 text-white" />
                  {:else}
                    <RotateCcw class="w-6 h-6 text-white" />
                  {/if}
                </div>
                <h4 class="text-lg font-semibold {currentTheme.text} mb-2">
                  {checkTimelineOrder() ? 'Correct!' : 'Not quite right'}
                </h4>
                <p class="{currentTheme.text} opacity-80 text-sm">{content.explanation}</p>
                <div class="mt-4 flex justify-center space-x-4">
                  <button
                    onclick={() => resetGameState()}
                    class="{currentTheme.cardBg} {currentTheme.border} border-2 {currentTheme.text} px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold backdrop-blur-sm hover:scale-105"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

  {:else if content && (currentGame?.id === 'ethics' || currentGame?.id === 'names99')}
    <!-- Multiple Choice Interface -->
    <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden game-flow">
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-1/4 right-10 w-32 h-32 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 left-10 w-40 h-40 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full blur-3xl"></div>
      </div>

      <div class="max-w-5xl mx-auto relative z-10">
        <div class="flex items-center justify-between mb-12">
          <button
            onclick={() => currentScreen = 'gameSelector'}
            class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>Back</span>
          </button>
          <div class="text-center">
            <h2 class="text-2xl font-bold {currentTheme.text}">{currentGame?.name}</h2>
            <p class="{currentTheme.text} opacity-60 text-sm mt-1">Round {round} • Score {score}</p>
          </div>
          <div></div>
        </div>

        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl shadow-2xl p-8 mb-8 backdrop-blur-sm">
          <h3 class="text-xl font-semibold {currentTheme.text} mb-8 text-center leading-relaxed">{content.prompt}</h3>
          
          <div class="space-y-4 mb-8">
            {#each content.options as option, index}
              <button
                onclick={() => handleMultipleChoice(index)}
                class="w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left {
                  multipleChoiceAnswer === index 
                    ? 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-300 transform scale-105' 
                    : currentTheme.cardBg + ' ' + currentTheme.border + ' hover:scale-102'
                } backdrop-blur-sm"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center {currentTheme.text} opacity-60 font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span class="{currentTheme.text} font-medium">{option}</span>
                </div>
              </button>
            {/each}
          </div>

          {#if isFlipped}
            <div class="mt-8 p-6 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-2xl border border-emerald-300/50">
              <div class="text-center">
                <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  {#if checkMultipleChoice()}
                    <Check class="w-6 h-6 text-white" />
                  {:else}
                    <RotateCcw class="w-6 h-6 text-white" />
                  {/if}
                </div>
                <h4 class="text-lg font-semibold {currentTheme.text} mb-2">
                  {checkMultipleChoice() ? 'Correct!' : 'Not quite right'}
                </h4>
                <p class="{currentTheme.text} opacity-80 text-sm leading-relaxed">{content.explanation}</p>
                <div class="mt-6 flex justify-center space-x-4">
                  <button
                    onclick={() => {
                      if (checkMultipleChoice()) {
                        handleCorrect();
                      } else {
                        handleSkip();
                      }
                      resetGameState();
                    }}
                    class="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 font-semibold hover:scale-105"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}

{:else if currentScreen === 'chillTell'}
  {@const stories = chillContent[chillCategory?.id] || []}
  {@const story = stories[0]}
  {#if story}
    <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden game-flow">
      <!-- Background decoration -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-10 w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div class="max-w-5xl mx-auto relative z-10">
        <div class="flex items-center justify-between mb-12">
          <button
            onclick={() => currentScreen = 'chillSelector'}
            class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
          >
            <ArrowLeft class="w-5 h-5" />
            <span>Back</span>
          </button>
          <h2 class="text-2xl font-bold {currentTheme.text}">{chillCategory?.name} Stories</h2>
          <div></div>
        </div>

        <div class="mb-16">
          <div class="perspective-1000 w-full max-w-lg mx-auto">
            <div 
              class="relative w-full h-96 transform-style-preserve-3d transition-all duration-700 cursor-pointer {isFlipped ? 'rotate-y-180' : ''} hover:scale-105"
              onclick={handleCardClick}
            >
              <!-- Front of card -->
              <div class="absolute inset-0 w-full h-full backface-hidden">
                <div class="w-full h-full {currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl shadow-2xl p-8 flex flex-col justify-center items-center backdrop-blur-sm">
                  <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                    <Book class="w-8 h-8 text-white" />
                  </div>
                  <h3 class="text-xl font-semibold text-center {currentTheme.text} mb-6 leading-relaxed">
                    {story.title}
                  </h3>
                  <div class="text-center {currentTheme.text} opacity-60 text-sm flex items-center space-x-2">
                    <div class="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
                    <span>Tap to reveal</span>
                    <div class="w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <!-- Back of card -->
              <div class="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                <div class="w-full h-full bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-cyan-400/10 {currentTheme.cardBg} border-2 border-emerald-300/50 rounded-3xl shadow-2xl p-8 flex flex-col justify-center backdrop-blur-sm">
                  <div class="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg mx-auto">
                    <Check class="w-8 h-8 text-white" />
                  </div>
                  <div class="text-center">
                    <h4 class="text-lg font-semibold {currentTheme.text} mb-4 leading-relaxed">
                      {story.story}
                    </h4>
                    {#if story.reflection}
                      <div class="mt-6 p-4 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-2xl">
                        <MessageCircle class="w-5 h-5 mx-auto mb-2 text-emerald-600" />
                        <p class="{currentTheme.text} opacity-80 text-sm italic">{story.reflection}</p>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {#if isFlipped}
          <div class="text-center">
            <button
              onclick={handleFlipBack}
              class="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-12 py-6 rounded-3xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 font-bold text-lg flex items-center space-x-4 mx-auto hover:scale-105"
            >
              <MessageCircle class="w-6 h-6" />
              <span>Discuss This</span>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style>
  :global(.game-flow button) {
    border: 2px solid #000;
  }
</style>
