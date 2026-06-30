<script>
  import { onMount } from 'svelte';
  import { 
    Play, Pause, Book, Star, Crown, Heart, Shield, 
    Sparkles, Sun, Moon, Mountain, Target, Compass, ArrowLeft 
  } from 'lucide-svelte';
  
  let { onBack = () => {} } = $props();
  
  // Journey stations with spiritual themes
  const journeyStations = [
    {
      id: 'tawheed',
      title: 'Tawheed',
      titleAr: 'التوحيد',
      icon: Star,
      position: { x: 20, y: 80 },
      description: 'The foundation of faith - Unity of Allah',
      unlocked: true,
      completed: false,
      color: '#F59E0B'
    },
    {
      id: 'salah',
      title: 'Prayer',
      titleAr: 'الصلاة',
      icon: Moon,
      position: { x: 40, y: 60 },
      description: 'The pillar of worship - Connection with Allah',
      unlocked: true,
      completed: false,
      color: '#F59E0B'
    },
    {
      id: 'companions',
      title: 'Companions',
      titleAr: 'الصحابة',
      icon: Heart,
      position: { x: 60, y: 40 },
      description: 'The noble companions of the Prophet ﷺ',
      unlocked: false,
      completed: false,
      color: '#F59E0B'
    },
    {
      id: 'trials',
      title: 'Trials',
      titleAr: 'الابتلاء',
      icon: Shield,
      position: { x: 80, y: 30 },
      description: 'Tests of faith and perseverance',
      unlocked: false,
      completed: false,
      color: '#F59E0B'
    },
    {
      id: 'purification',
      title: 'Heart Purification',
      titleAr: 'تطهير القلب',
      icon: Sparkles,
      position: { x: 90, y: 20 },
      description: 'Cleansing the soul and achieving ihsan',
      unlocked: false,
      completed: false,
      color: '#F59E0B'
    }
  ];

  let currentStation = $state(null);
  let showQuiz = $state(false);
  let showWisdom = $state(false);
  let audioPlaying = $state(false);
  let currentQuote = $state('');
  let showFloatingQuote = $state(false);
  
  // Quiz data for stations
  const stationQuizzes = {
    tawheed: {
      question: "What is the meaning of 'La ilaha illa Allah'?",
      questionAr: "ما معنى 'لا إله إلا الله'؟",
      options: [
        "There is no god but Allah",
        "Allah is great",
        "Praise be to Allah",
        "In the name of Allah"
      ],
      correct: 0,
      explanation: "La ilaha illa Allah means 'There is no god but Allah' - the fundamental declaration of Islamic monotheism (Tawheed)."
    },
    salah: {
      question: "How many times do Muslims pray each day?",
      questionAr: "كم مرة يصلي المسلمون في اليوم؟",
      options: ["3", "5", "7", "2"],
      correct: 1,
      explanation: "Muslims are required to pray five times daily: Fajr, Dhuhr, Asr, Maghrib, and Isha."
    }
  };

  const inspirationalQuotes = [
    {
      arabic: "والذين جاهدوا فينا لنهدينهم سبلنا",
      english: "And those who strive for Us - We will surely guide them to Our ways",
      reference: "Quran 29:69"
    },
    {
      arabic: "وبشر الصابرين",
      english: "And give good tidings to the patient",
      reference: "Quran 2:155"
    },
    {
      arabic: "إن مع العسر يسرا",
      english: "Indeed, with hardship comes ease",
      reference: "Quran 94:6"
    },
    {
      arabic: "واصبر وما صبرك إلا بالله",
      english: "And be patient, and your patience is not but through Allah",
      reference: "Quran 16:127"
    }
  ];

  let currentQuizAnswer = $state(null);
  let quizCompleted = $state(false);
  
  onMount(() => {
    // Show floating quote occasionally
    setInterval(() => {
      if (!showQuiz && !showWisdom) {
        currentQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
        showFloatingQuote = true;
        setTimeout(() => {
          showFloatingQuote = false;
        }, 4000);
      }
    }, 15000);
  });

  function openStation(station) {
    currentStation = station;
    showQuiz = true;
    quizCompleted = false;
    currentQuizAnswer = null;
  }

  function completeQuiz(selectedAnswer) {
    const quiz = stationQuizzes[currentStation.id];
    currentQuizAnswer = selectedAnswer;
    quizCompleted = true;
    
    if (selectedAnswer === quiz.correct) {
      // Mark station as completed and unlock next
      const stationIndex = journeyStations.findIndex(s => s.id === currentStation.id);
      journeyStations[stationIndex].completed = true;
      
      if (stationIndex < journeyStations.length - 1) {
        journeyStations[stationIndex + 1].unlocked = true;
      }
    }
  }

  function openWisdom() {
    showWisdom = true;
    showQuiz = false;
  }

  function closeModals() {
    showQuiz = false;
    showWisdom = false;
    currentStation = null;
  }

  function toggleAudio() {
    audioPlaying = !audioPlaying;
  }
</script>

<div class="seerah-trip min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 relative overflow-hidden">
  <!-- Desert background elements -->
  <div class="absolute inset-0 pointer-events-none">
    <!-- Sand dunes -->
    <div class="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-amber-200 to-transparent opacity-50"></div>
    <div class="absolute bottom-0 right-0 w-96 h-24 bg-gradient-to-l from-amber-300 to-transparent opacity-30 rounded-full"></div>
    
    <!-- Sun/Moon -->
    <div class="absolute top-8 right-8 w-16 h-16 bg-yellow-400 rounded-full shadow-lg opacity-80"></div>
    <div class="absolute top-8 right-8 w-16 h-16 bg-yellow-300 rounded-full animate-pulse"></div>
  </div>

  <!-- Header -->
  <div class="relative z-10 text-center pt-12 pb-8">
    <!-- Back button -->
    <button 
      class="absolute top-4 left-4 flex items-center space-x-2 text-amber-700 hover:text-amber-900 
             bg-white/80 hover:bg-white/90 rounded-xl px-4 py-2 transition-all duration-200"
      onclick={onBack}
    >
      <ArrowLeft size={20} />
      <span class="font-medium">Back</span>
    </button>
    
    <div class="flex items-center justify-center mb-4">
      <Compass class="text-yellow-600 mr-3" size={32} />
      <h1 class="text-4xl font-bold text-amber-900">Seerah Trip</h1>
      <Compass class="text-yellow-600 ml-3" size={32} />
    </div>
    <p class="text-amber-700 text-lg">رحلة روحية في السيرة النبوية</p>
    <p class="text-amber-600 mt-2">Your spiritual journey through the life of Prophet Muhammad ﷺ</p>
  </div>

  <!-- Journey Map -->
  <div class="relative h-96 mx-4 mb-12">
    <!-- Desert path -->
    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path
        d="M 5,90 Q 25,70 45,65 T 85,25"
        stroke="#D97706"
        stroke-width="0.5"
        fill="none"
        stroke-dasharray="2,2"
        class="opacity-60"
      />
      <path
        d="M 5,90 Q 25,70 45,65 T 85,25"
        stroke="#F59E0B"
        stroke-width="0.3"
        fill="none"
        class="animate-pulse"
      />
    </svg>

    <!-- Journey stations -->
    {#each journeyStations as station, index}
      {@const StationIcon = station.icon}
      <button 
        class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-none p-0"
        style="left: {station.position.x}%; top: {station.position.y}%"
        onclick={() => station.unlocked && openStation(station)}
        disabled={!station.unlocked}
        aria-label="Open {station.title} station"
      >
        <!-- Station glow effect -->
        <div class="absolute inset-0 rounded-full {station.unlocked ? 'bg-yellow-400' : 'bg-gray-400'} opacity-20 animate-ping" 
             class:animate-pulse={station.unlocked && !station.completed}></div>
        
        <!-- Station circle -->
        <div class="relative w-16 h-16 rounded-full border-4 {station.unlocked ? 'border-yellow-500 bg-white' : 'border-gray-400 bg-gray-100'} 
                    flex items-center justify-center shadow-lg transition-all duration-300
                    {station.unlocked ? 'hover:scale-110' : 'opacity-50'}
                    {station.completed ? 'border-green-500 bg-green-50' : ''}">
          
          <StationIcon 
                          class="{station.unlocked ? 'text-yellow-600' : 'text-gray-500'} {station.completed ? 'text-green-600' : ''}" 
                          size={24} />
          
          {#if station.completed}
            <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Star class="text-white" size={12} />
            </div>
          {/if}
        </div>

        <!-- Station label -->
        <div class="absolute top-20 left-1/2 transform -translate-x-1/2 text-center min-w-max">
          <div class="text-sm font-semibold text-amber-800">{station.title}</div>
          <div class="text-xs text-amber-600 font-arabic">{station.titleAr}</div>
        </div>
      </button>
    {/each}
  </div>

  <!-- Campfire/Wisdom Area -->
  <div class="fixed bottom-8 right-8 z-20">
    <div class="relative">
      <!-- Campfire glow -->
      <div class="absolute inset-0 bg-orange-400 rounded-full opacity-30 animate-pulse scale-110"></div>
      
      <!-- Campfire button -->
      <button 
        class="relative w-16 h-16 bg-gradient-to-t from-orange-600 to-yellow-500 rounded-full shadow-lg
               flex items-center justify-center transition-all duration-300 hover:scale-105"
        onclick={openWisdom}
      >
        <Mountain class="text-white" size={24} />
      </button>
      
      <!-- Wisdom indicator -->
      <div class="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center animate-bounce">
        <Book class="text-white" size={12} />
      </div>
    </div>
  </div>

  <!-- Floating Inspirational Quote -->
  {#if showFloatingQuote && currentQuote}
    <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30
                bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-2xl p-6 text-center
                animate-in fade-in duration-500 max-w-md mx-4">
      <div class="text-2xl font-arabic text-amber-800 mb-3 leading-relaxed">{currentQuote.arabic}</div>
      <div class="text-sm text-amber-600 mb-2 italic">{currentQuote.english}</div>
      <div class="text-xs text-amber-500 font-medium">— {currentQuote.reference} —</div>
    </div>
  {/if}

  <!-- Quiz Modal -->
  {#if showQuiz && currentStation}
    {@const CurrentStationIcon = currentStation.icon}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <!-- Quiz header -->
        <div class="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-center">
          <CurrentStationIcon class="text-white mx-auto mb-2" size={32} />
          <h3 class="text-xl font-bold text-white">{currentStation.title}</h3>
          <p class="text-yellow-100 text-sm">{currentStation.titleAr}</p>
        </div>

        <!-- Quiz content -->
        <div class="p-6">
          {#if !quizCompleted}
            <!-- Quiz question -->
            <div class="mb-6">
              <h4 class="text-lg font-semibold text-gray-800 mb-4">
                {stationQuizzes[currentStation.id].question}
              </h4>
              <div class="text-sm text-gray-600 mb-4 font-arabic">
                {stationQuizzes[currentStation.id].questionAr}
              </div>
            </div>

            <!-- Quiz options -->
            <div class="space-y-3">
              {#each stationQuizzes[currentStation.id].options as option, index}
                <button 
                  class="w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-yellow-400 
                         hover:bg-yellow-50 transition-all duration-200"
                  onclick={() => completeQuiz(index)}
                >
                  {option}
                </button>
              {/each}
            </div>
          {:else}
            <!-- Quiz result -->
            <div class="text-center mb-6">
              <div class="w-20 h-20 mx-auto mb-4 rounded-full 
                          {currentQuizAnswer === stationQuizzes[currentStation.id].correct ? 'bg-green-100' : 'bg-red-100'}
                          flex items-center justify-center">
                {#if currentQuizAnswer === stationQuizzes[currentStation.id].correct}
                  <Star class="text-green-600" size={32} />
                {:else}
                  <Heart class="text-red-600" size={32} />
                {/if}
              </div>
              
              <h4 class="text-lg font-semibold mb-2 
                         {currentQuizAnswer === stationQuizzes[currentStation.id].correct ? 'text-green-800' : 'text-red-800'}">
                {currentQuizAnswer === stationQuizzes[currentStation.id].correct ? 'Excellent!' : 'Keep Learning!'}
              </h4>
              
              <p class="text-gray-600 text-sm leading-relaxed">
                {stationQuizzes[currentStation.id].explanation}
              </p>
            </div>
          {/if}

          <!-- Action buttons -->
          <div class="flex gap-3 mt-6">
            <button 
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium
                     hover:bg-gray-200 transition-colors duration-200"
              onclick={closeModals}
            >
              Close
            </button>
            {#if quizCompleted}
              <button 
                class="flex-1 py-3 px-4 bg-yellow-500 text-white rounded-lg font-medium
                       hover:bg-yellow-600 transition-colors duration-200"
                onclick={closeModals}
              >
                Continue Journey
              </button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Wisdom/Audio Modal -->
  {#if showWisdom}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div class="bg-gradient-to-b from-amber-50 to-orange-100 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <!-- Wisdom header -->
        <div class="bg-gradient-to-r from-orange-600 to-yellow-500 p-6 text-center relative">
          <!-- Tent/campfire scene -->
          <div class="absolute inset-0 opacity-20">
            <div class="w-full h-full bg-gradient-to-t from-orange-800 to-transparent"></div>
          </div>
          
          <div class="relative">
            <Mountain class="text-white mx-auto mb-2" size={32} />
            <h3 class="text-xl font-bold text-white">Wisdom Corner</h3>
            <p class="text-orange-100 text-sm">ركن الحكمة</p>
          </div>
        </div>

        <!-- Wisdom content -->
        <div class="p-6">
          <div class="text-center mb-6">
            <div class="text-lg font-arabic text-amber-800 mb-4 leading-relaxed">
              "وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ"
            </div>
            <div class="text-sm text-amber-600">
              "And We have not sent you except as a mercy to the worlds"
            </div>
            <div class="text-xs text-amber-500 mt-2">— Quran 21:107 —</div>
          </div>

          <!-- Audio player -->
          <div class="bg-white rounded-lg p-4 mb-6 shadow-inner">
            <div class="flex items-center justify-center space-x-4">
              <button 
                class="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center
                       hover:bg-yellow-600 transition-colors duration-200"
                onclick={toggleAudio}
              >
                {#if audioPlaying}
                  <Pause class="text-white" size={20} />
                {:else}
                  <Play class="text-white" size={20} />
                {/if}
              </button>
              
              <div class="flex-1 text-center">
                <div class="text-sm font-medium text-gray-800">Quranic Recitation</div>
                <div class="text-xs text-gray-600">Surat Al-Anbiya</div>
              </div>
            </div>
            
            {#if audioPlaying}
              <div class="mt-3 flex justify-center space-x-1">
                {#each Array(5) as _, i}
                  <div class="w-1 bg-yellow-400 rounded-full animate-pulse" 
                       style="height: {Math.random() * 20 + 10}px; animation-delay: {i * 0.1}s"></div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Close button -->
          <button 
            class="w-full py-3 px-4 bg-amber-500 text-white rounded-lg font-medium
                   hover:bg-amber-600 transition-colors duration-200"
            onclick={closeModals}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .font-arabic {
    font-family: 'Arabic Typesetting', 'Traditional Arabic', serif;
  }
  
  .animate-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
</style>