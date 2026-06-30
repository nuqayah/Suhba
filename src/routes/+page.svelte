<script>
import { onMount } from 'svelte';
import { 
    Book, User, Settings, Play, Pause, MessageCircle, ArrowLeft, 
    Check, Heart, Zap, Shield, Star, Crown, Users, Clock, 
    Trophy, RotateCcw, Lightbulb, SkipForward, Moon, Sun, 
    Scroll, Calendar, Scale, Sparkles, Plus, UserCheck, 
    Compass, Target, FileText, Volume2, BookOpen, List, 
    UserPlus, Globe, Shuffle, 
    Cog, Settings2, Wrench, ChevronLeft, ChevronRight, CornerUpLeft,
    History, Link, Layers, HelpCircle
} from 'lucide-svelte';
import { currentLanguage } from '$lib/stores/language';
import { translations } from '$lib/stores/translations';
import { newGameContent, getQuestionNames } from '$lib/gameContent';
import { wsManager, connectionState, roomState } from '$lib/stores/websocket';
import SettingsModal from '$lib/components/SettingsModal.svelte';
import AuthModal from '$lib/components/AuthModal.svelte';
import SalahTimer from '$lib/components/SalahTimer.svelte';
import SuhbaLogo from '$lib/components/SuhbaLogo.svelte';
import UserShmagh from '$lib/components/UserShmagh.svelte';
import UserGlasses from '$lib/components/UserGlasses.svelte';
import UserKeffiyeh from '$lib/components/UserKeffiyeh.svelte';
import SeerahTrip from '$lib/components/SeerahTrip.svelte';
import LastScholarStanding from '$lib/components/LastScholarStanding.svelte';
import LightningIjaza from '$lib/components/LightningIjaza.svelte';
import HadithCompletion from '$lib/components/HadithCompletion.svelte';
import DawahChallenge from '$lib/components/DawahChallenge.svelte';
import Button from '$lib/components/Button.svelte';
import ToastContainer from '$lib/components/ToastContainer.svelte';
import ConnectionStatus from '$lib/components/ConnectionStatus.svelte';
import InstallPrompt from '$lib/components/InstallPrompt.svelte';
import { toastManager } from '$lib/stores/toast';
// Reactive state using Svelte 5 runes
let currentScreen = $state('home');
let currentGame = $state(null);
let score = $state(0);
let round = $state(1);
let isFlipped = $state(false);
// Generate a unique client ID for debugging
const clientId = Math.random().toString(36).substring(2, 8).toUpperCase();
console.log('🆔 Client ID:', clientId);
let theme = $state('desert');
let chillCategory = $state(null);
// New game mode states
let gameMode = $state('solo');
let players = $state([]);
let currentPlayer = $state(0);
let teamScores = $state({});
let selectedDifficulty = $state('medium'); // Default to medium
let previousScreen = $state('modeSelector'); // Track navigation history
// New states for modals and UI
let showSettings = $state(false);
let showAuth = $state(false);
let showRoomSelector = $state(false);
let roomCode = $state('');
let isRoomHost = $state(false);
let roomPlayers = $state([]);
let showCopyMessage = $state(false);
// Loading states for better UX
let isCreatingRoom = $state(false);
let isJoiningRoom = $state(false);
let isLoadingGame = $state(false);
// Language and translations - simplified to avoid store conflicts
const t = $derived((translations && translations[$currentLanguage.code]) ? translations[$currentLanguage.code] : {});
// Initialize app
onMount(() => {
    // Initialize language store
    currentLanguage.init();
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('suhba-theme');
    if (savedTheme) {
        theme = savedTheme;
    }
    // Load points from localStorage
    const savedPoints = localStorage.getItem('suhba-points');
    if (savedPoints) {
        totalPoints = parseInt(savedPoints);
    }
    // Cleanup function for Iman Defender
    return () => {
        if (gameLoop) {
            clearInterval(gameLoop);
            gameLoop = null;
        }
    };
});
// Save points to localStorage whenever they change
$effect(() => {
    localStorage.setItem('suhba-points', totalPoints.toString());
});
// Points and rewards system
let totalPoints = $state(0);
let showReward = $state(false);
let rewardMessage = $state('');
let showTafsirMoment = $state(false);
let tafsirContent = $state({});
// Game-specific states
let currentQuestionIndex = $state(0);
let currentQuestion = $state(null);
let gameQuestions = $state([]);
let selectedAnswer = $state(null);
let showExplanation = $state(false);
let isCorrect = $state(false);
let questionNames = $state({});
// New game states
let currentGameMode = $state(null); // For sub-game modes (timeline, decisions, etc.)
let draggedEvents = $state([]); // For timeline scramble
let currentTimelineChapter = $state(null);
let userOrder = $state([]); // User's arrangement
let isTimelineComplete = $state(false);
let matchedPairs = $state([]); // For Hadith matching
let currentAsmaName = $state(null); // For Asma'ul Husna wheel
let wheelRotation = $state(0);
let timeRemaining = $state(30); // Timer for various games
// Iman Defender states
let imanDefenderActive = $state(false);
let fallingWords = $state([]); // Array of falling negative words
let righteousConcepts = $state([]); // 4 righteous concepts at bottom
let currentWordPair = $state(null);
let gameSpeed = $state(2);
let spawnRate = $state(2000);
let survivalTime = $state(0);
let accuracy = $state(1.0);
let hits = $state(0);
let misses = $state(0);
let gameScore = $state(0);
let activePowerups = $state([]);
let cannonFiring = $state(false);
let wordId = $state(0); // Unique ID for each falling word
let gameRunning = $state(false);
let gameLoop = $state(null);
let gamePaused = $state(false); // General pause state for all games
let lastSpawn = $state(0);
// Help popup states
let showGameHelp = $state(false);
let selectedHelpGame = $state(null);
let difficultyTimer = $state(0);
let consecutiveHits = $state(0);
let shieldActive = $state(false);
let pointMultiplier = $state(1);
const chillContent = {
    prophets: [
        {
            title: "Ibrahim's Ultimate Test",
            story: "When Allah commanded Prophet Ibrahim عليه السلام to sacrifice his beloved son Ismail, both father and son submitted completely to Allah's will. As Ibrahim prepared to carry out the command, Allah replaced Ismail with a ram, showing that true submission to Allah brings the greatest rewards and that Allah never burdens a soul beyond what it can bear.",
            reflection: "How can we show complete trust in Allah's wisdom during our own tests?"
        },
        {
            title: "Musa and the Poor Man",
            story: "Prophet Musa عليه السلام once saw a man making dua for hours. Musa asked Allah why this man's prayers weren't being answered. Allah revealed that the man had a morsel of haram food in his stomach. When Musa told him, the man wept, fasted for 40 days to purify himself, and then his dua was immediately answered.",
            reflection: "How does the purity of our earnings affect the acceptance of our prayers?"
        }
    ],
    sahaba: [
        {
            title: "The Price of Faith",
            story: "Khabbab ibn al-Aratt was a blacksmith and slave who accepted Islam early in Makkah. His owner tortured him daily, heating iron rods and pressing them to his back until his flesh sizzled and stuck to the ground. When he showed his scars to the Prophet ﷺ and asked for relief, the Prophet replied with tears: 'Those before you were sawed in half yet never gave up their faith. By Allah, this matter will be complete until a rider travels from San'a to Hadramawt fearing no one but Allah.' Years later, when Islam triumphed and people asked about his scars, Khabbab smiled: 'This was the price I paid for the light that entered my heart.'",
            reflection: "What sacrifices are we willing to make for our faith and principles?"
        },
        {
            title: "Abu Bakr's Generosity",
            story: "When the Prophet ﷺ called for donations for the Tabuk expedition, Abu Bakr رضي الله عنه brought everything he owned. When asked what he left for his family, he simply said, 'Allah and His Messenger.' His complete trust in Allah's provision and his willingness to give everything for Islam showed the depth of his faith and love for the Prophet ﷺ.",
            reflection: "How can we balance our worldly responsibilities with our spiritual priorities?"
        }
    ]
};
// Game types with translation keys
const gameTypesBase = [
    // The Main Games
    { id: 'fiqhMaster', nameKey: 'fiqhMaster', icon: Scale, gradient: 'from-emerald-400 via-teal-400 to-cyan-400', shadow: 'shadow-emerald-500/25' },
    { id: 'wisdomSeeker', nameKey: 'wisdomSeeker', icon: Lightbulb, gradient: 'from-blue-400 via-indigo-400 to-purple-400', shadow: 'shadow-blue-500/25' },
    { id: 'chroniclesOfFaith', nameKey: 'chroniclesOfFaith', icon: Scroll, gradient: 'from-amber-400 via-orange-400 to-red-400', shadow: 'shadow-amber-500/25' },
    // Additional Games
    { id: 'hangman', nameKey: 'hangman', icon: Users, gradient: 'from-purple-400 via-pink-400 to-red-400', shadow: 'shadow-purple-500/25' },
    { id: 'tilawahTrail', nameKey: 'tilawahTrail', icon: Book, gradient: 'from-green-400 via-emerald-400 to-teal-400', shadow: 'shadow-green-500/25' },
    // New Interactive Games
    { id: 'seerahScenarios', nameKey: 'seerahScenarios', icon: History, gradient: 'from-rose-400 via-pink-400 to-fuchsia-400', shadow: 'shadow-rose-500/25' },
    { id: 'hadithLab', nameKey: 'hadithLab', icon: Link, gradient: 'from-violet-400 via-purple-400 to-indigo-400', shadow: 'shadow-violet-500/25' },
    { id: 'pillarFoundations', nameKey: 'pillarFoundations', icon: Layers, gradient: 'from-cyan-400 via-blue-400 to-indigo-400', shadow: 'shadow-cyan-500/25' },
    // Journey Games (Solo Only)
    { id: 'seerahTrip', nameKey: 'seerahTrip', name: 'Seerah Trip', icon: Compass, gradient: 'from-yellow-400 via-orange-400 to-amber-500', shadow: 'shadow-yellow-500/25', soloOnly: true },
    // Reflex Games (Solo Only)
    { id: 'imanDefender', nameKey: 'imanDefender', icon: Shield, gradient: 'from-orange-400 via-red-400 to-pink-400', shadow: 'shadow-orange-500/25', soloOnly: true },
    // New Competition Games
    { id: 'lastScholarStanding', nameKey: 'lastScholarStanding', icon: Crown, gradient: 'from-yellow-400 via-orange-400 to-red-400', shadow: 'shadow-yellow-500/25', suhbaOnly: true },
    { id: 'lightningIjaza', nameKey: 'lightningIjaza', icon: Zap, gradient: 'from-yellow-400 via-amber-400 to-orange-400', shadow: 'shadow-yellow-500/25', suhbaOnly: true },
    { id: 'hadithCompletion', nameKey: 'hadithCompletion', icon: BookOpen, gradient: 'from-green-400 via-emerald-400 to-teal-400', shadow: 'shadow-green-500/25' },
    { id: 'dawahChallenge', nameKey: 'dawahChallenge', icon: MessageCircle, gradient: 'from-blue-400 via-purple-400 to-indigo-400', shadow: 'shadow-blue-500/25', suhbaOnly: true }
];
// Add translated names to game types
const gameTypes = $derived(gameTypesBase.map(game => ({
    ...game,
    name: (t && t[game.nameKey]) || game.nameKey
})));
// Filter games based on game mode
const availableGames = $derived(gameMode === 'team'
    ? (gameTypes || []).filter(game => !game.soloOnly)
    : (gameTypes || []).filter(game => !game.suhbaOnly));
const chillCategories = $derived([
    { id: 'prophets', name: 'Prophets Stories', icon: Star, gradient: 'from-purple-400 via-indigo-400 to-blue-400', shadow: 'shadow-purple-500/25' },
    { id: 'sahaba', name: 'Sahaba Stories', icon: Users, gradient: 'from-emerald-400 via-green-400 to-teal-400', shadow: 'shadow-emerald-500/25' }
]);
const themes = {
    desert: {
        bg: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50',
        text: 'text-amber-900',
        cardBg: 'bg-white/90 backdrop-blur-sm',
        border: 'border-amber-200/50',
        iconColor: 'text-amber-700',
        suhbaColor: 'text-amber-900',
        loginBg: 'bg-amber-100/20 backdrop-blur-sm',
        loginHoverBg: 'hover:bg-amber-100/40',
        loginText: 'text-amber-900/90',
        loginHoverText: 'hover:text-amber-900'
    },
    scroll: {
        bg: 'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100',
        text: 'text-amber-800',
        cardBg: 'bg-amber-50/90 backdrop-blur-sm',
        border: 'border-amber-300/50',
        iconColor: 'text-amber-700',
        suhbaColor: 'text-amber-800',
        loginBg: 'bg-amber-100/30 backdrop-blur-sm',
        loginHoverBg: 'hover:bg-amber-100/50',
        loginText: 'text-amber-800/90',
        loginHoverText: 'hover:text-amber-800'
    },
    midnight: {
        bg: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900',
        text: 'text-slate-100',
        cardBg: 'bg-slate-800/90 backdrop-blur-sm',
        border: 'border-slate-600/50',
        iconColor: 'text-slate-100',
        suhbaColor: 'text-slate-100',
        loginBg: 'bg-white/10 backdrop-blur-sm',
        loginHoverBg: 'hover:bg-white/20',
        loginText: 'text-white/90',
        loginHoverText: 'hover:text-white'
    }
};
const currentTheme = $derived((themes && theme && themes[theme]) ? themes[theme] : (themes && themes['desert']) ? themes['desert'] : {});
// Theme-based login button properties
const loginButtonProps = $derived(() => {
    const props = {
        desert: { text: $currentLanguage.code === 'ar' ? 'أنا' : 'me', icon: UserShmagh },
        scroll: { text: $currentLanguage.code === 'ar' ? 'أنا' : 'me', icon: UserGlasses },
        midnight: { text: $currentLanguage.code === 'ar' ? 'أنا' : 'me', icon: UserKeffiyeh }
    };
    return (theme && props[theme]) ? props[theme] : { text: $currentLanguage.code === 'ar' ? 'أنا' : 'me', icon: UserShmagh };
});
// Theme-based settings icon
const settingsIcon = $derived(() => {
    const icons = {
        desert: Cog,
        scroll: Settings2,
        midnight: Wrench
    };
    return (theme && icons[theme]) ? icons[theme] : Settings;
});
// Theme-based back button properties with correct direction logic
// English: < back (ChevronLeft)
// Arabic: رجوع > (ChevronRight)
const backButtonProps = $derived(() => {
    const defaultProps = {
        text: (t && t.back) || 'Back',
        icon: $currentLanguage.direction === 'rtl' ? ChevronRight : ChevronLeft
    };
    const props = {
        desert: defaultProps,
        scroll: defaultProps,
        midnight: defaultProps
    };
    return (theme && props[theme]) ? props[theme] : defaultProps;
});
function handleCardClick() {
    isFlipped = !isFlipped;
}
function startChillCategory(category) {
    chillCategory = category;
    currentScreen = 'chillTell';
    isFlipped = false;
}
function goBackToChillSelector() {
    console.log('🔙 Going back to chill selector');
    currentScreen = 'chillSelector';
    chillCategory = null;
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
    if (theme === 'desert')
        theme = 'scroll';
    else if (theme === 'scroll')
        theme = 'midnight';
    else
        theme = 'desert';
    // Save to localStorage
    localStorage.setItem('suhba-theme', theme);
}
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
function resetGameState() {
    selectedAnswer = null;
    showExplanation = false;
    isCorrect = false;
    currentQuestionIndex = 0;
    currentQuestion = null;
    gameQuestions = [];
    questionNames = {};
    showTafsirMoment = false;
    tafsirContent = {};
    gamePaused = false; // Reset pause state
}
function showHelp(game, event) {
    event.stopPropagation(); // Prevent card click
    selectedHelpGame = game;
    showGameHelp = true;
}
function closeHelp() {
    showGameHelp = false;
    selectedHelpGame = null;
}
function startGame(game) {
    // Safety check for game object
    if (!game || !game.id) {
        console.error('Invalid game object:', game);
        return;
    }
    // Check if game is coming soon
    if (game.id === 'tilawahTrail') {
        alert('Tilawah Trail - Coming Soon! This exciting Quranic verse completion game is under development.');
        return;
    }
    currentGame = game;
    resetGameState();
    // Handle different game types
    if (game.id === 'seerahScenarios' || game.id === 'hadithLab' || game.id === 'pillarFoundations') {
        currentScreen = 'gameMode';
    }
    else if (game.id === 'seerahTrip') {
        currentScreen = 'seerahTrip';
    }
    else if (game.id === 'lastScholarStanding') {
        currentScreen = 'lastScholarStanding';
    }
    else if (game.id === 'lightningIjaza') {
        currentScreen = 'lightningIjaza';
    }
    else if (game.id === 'hadithCompletion') {
        currentScreen = 'hadithCompletion';
    }
    else if (game.id === 'dawahChallenge') {
        currentScreen = 'dawahChallenge';
    }
    else if (game.id === 'imanDefender') {
        currentScreen = 'playing';
        initializeImanDefender();
    }
    else if (gameMode === 'solo') {
        // Show difficulty selection for solo games
        currentScreen = 'difficultySelector';
    }
    else {
        // For team/multiplayer mode, use medium difficulty as default
        if (gameMode !== 'solo') {
            selectedDifficulty = 'medium';
        }
        currentScreen = 'playing';
        initializeGameQuestions(game.id);
    }
}
function startGameWithDifficulty(difficulty) {
    selectedDifficulty = difficulty;
    currentScreen = 'playing';
    initializeGameQuestions(currentGame.id);
}
function initializeGameQuestions(gameId) {
    if (!newGameContent) {
        console.error('Game content not available');
        return;
    }
    if (!gameId) {
        console.error('Game ID not provided');
        return;
    }
    if (gameId === 'seerahScenarios') {
        // For Seerah Scenarios in prophetic decisions mode
        if (newGameContent.seerahScenarios?.propheticDecisions) {
            gameQuestions = [...newGameContent.seerahScenarios.propheticDecisions];
            shuffleArray(gameQuestions);
        }
    }
    else if (gameId === 'lastScholarStanding') {
        // Last Scholar Standing uses its own question format
        if (newGameContent.lastScholarStanding?.questions) {
            gameQuestions = [...newGameContent.lastScholarStanding.questions];
            shuffleArray(gameQuestions);
        }
    }
    else if (gameId === 'lightningIjaza') {
        // Lightning Ijaza uses its own question format
        if (newGameContent.lightningIjaza?.questions) {
            gameQuestions = [...newGameContent.lightningIjaza.questions];
            shuffleArray(gameQuestions);
        }
    }
    else if (gameId === 'hadithCompletion') {
        // Hadith Completion uses hadith data
        if (newGameContent.hadithCompletion?.hadiths) {
            gameQuestions = [...newGameContent.hadithCompletion.hadiths];
            shuffleArray(gameQuestions);
        }
    }
    else if (gameId === 'dawahChallenge') {
        // Dawah Challenge uses challenge data
        if (newGameContent.dawahChallenge?.challenges) {
            gameQuestions = [...newGameContent.dawahChallenge.challenges];
            shuffleArray(gameQuestions);
        }
    }
    else if (newGameContent[gameId]) {
        let questions = [];
        // Handle the nested difficulty structure
        const gameContent = newGameContent[gameId];
        if (gameMode === 'solo' && selectedDifficulty && selectedDifficulty !== 'all') {
            // Get questions from specific difficulty level
            if (gameContent[selectedDifficulty]) {
                questions = [...gameContent[selectedDifficulty]];
            }
        }
        else {
            // Get questions from all difficulty levels
            if (gameContent.easy)
                questions.push(...gameContent.easy);
            if (gameContent.medium)
                questions.push(...gameContent.medium);
            if (gameContent.hard)
                questions.push(...gameContent.hard);
        }
        gameQuestions = questions;
        shuffleArray(gameQuestions);
    }
    currentQuestionIndex = 0;
    loadCurrentQuestion();
}
function loadCurrentQuestion() {
    if (currentQuestionIndex < gameQuestions.length) {
        currentQuestion = gameQuestions[currentQuestionIndex];
        questionNames = getQuestionNames(gameMode, players, currentQuestion);
        selectedAnswer = null;
        showExplanation = false;
        isCorrect = false;
    }
}
function isAnswerCorrect(answerIndex) {
    // For sourceScholar mode, check if the option has correct: true
    if (selectedGame?.id === 'hadithLab' && gameMode === 'sourceScholar') {
        const options = currentQuestion.options;
        return options && options[answerIndex] && options[answerIndex].correct === true;
    }
    // For other modes, use the correct index
    return answerIndex === currentQuestion.correct;
}
function handleAnswerSelection(answerIndex) {
    // Check if it's multiplayer and if it's the current player's turn
    if (gameMode === 'team' && $connectionState.connected) {
        const currentPlayerIndex = players.findIndex(p => p === getMyPlayerName());
        if (currentPlayerIndex !== currentPlayer) {
            console.log(`⚠️ Not your turn! Current player: ${players[currentPlayer]}, You: ${getMyPlayerName()}`);
            return; // Prevent answering when it's not your turn
        }
        console.log(`🎯 Player ${getMyPlayerName()} selected answer ${answerIndex}`);
    }
    selectedAnswer = answerIndex;
    isCorrect = isAnswerCorrect(answerIndex);
    showExplanation = true;
    if (isCorrect) {
        // Award points
        const pointsEarned = currentQuestion.difficulty === 'hard' ? 15 :
            currentQuestion.difficulty === 'medium' ? 10 : 5;
        totalPoints += pointsEarned;
        if (gameMode === 'team') {
            const currentPlayerName = players[currentPlayer];
            teamScores[currentPlayerName] = (teamScores[currentPlayerName] || 0) + pointsEarned;
        }
        else {
            score += pointsEarned;
        }
        // Show reward message
        rewardMessage = `Great job! +${pointsEarned} points`;
        showReward = true;
        setTimeout(() => showReward = false, 2000);
    }
    else {
        // Show Tafsir Moment for wrong answers
        showTafsirMoment = true;
        const localizedContent = getLocalizedContent(currentQuestion, 'en');
        tafsirContent = {
            explanation: localizedContent.explanation,
            hadith: localizedContent.hadith || null,
            verse: currentQuestion.verse || null
        };
    }
    // Broadcast answer selection to other players if in multiplayer mode
    if (gameMode === 'team' && $connectionState.connected && roomCode) {
        wsManager.selectAnswer(roomCode, answerIndex, isCorrect, currentPlayer, players[currentPlayer]);
    }
}
function nextQuestion() {
    // In multiplayer mode, only allow the current player to advance to next question
    if (gameMode === 'team' && $connectionState.connected) {
        const myPlayerIndex = players.findIndex(p => p === getMyPlayerName());
        if (myPlayerIndex !== currentPlayer) {
            console.log(`⚠️ Only ${players[currentPlayer]} can advance to next question!`);
            return; // Prevent non-current player from advancing
        }
    }
    // Calculate next state
    const nextPlayerIndex = gameMode === 'team' ? (currentPlayer + 1) % players.length : currentPlayer;
    const nextQuestionIndex = currentQuestionIndex + 1;
    // Broadcast to other players if in multiplayer mode
    if (gameMode === 'team' && $connectionState.connected && roomCode) {
        console.log(`🎯 ${getMyPlayerName()} advancing to next question`);
        wsManager.nextQuestion(roomCode, nextPlayerIndex, nextQuestionIndex);
    }
    // Apply changes locally
    if (gameMode === 'team') {
        currentPlayer = nextPlayerIndex;
    }
    currentQuestionIndex = nextQuestionIndex;
    round++;
    if (currentQuestionIndex < gameQuestions.length) {
        resetAnswerState(); // Reset answer-related state
        loadCurrentQuestion();
    }
    else {
        // Game finished
        currentScreen = 'gameComplete';
    }
}
// Helper function to reset answer state between questions
function resetAnswerState() {
    selectedAnswer = null;
    showExplanation = false;
    isCorrect = false;
    showTafsirMoment = false;
    showReward = false;
}
function closeTafsirMoment() {
    showTafsirMoment = false;
}
function formatQuestionText(text, names) {
    let formattedText = text;
    // Replace character names based on game mode
    if (names.character) {
        formattedText = formattedText.replace(/Ali|Ahmed|Ayub|Amina|Yusuf|Omar/g, names.character);
    }
    if (names.questioner) {
        formattedText = formattedText.replace(/Ahmed|Amina|Yusuf/g, names.questioner);
    }
    if (names.mufti && names.mufti !== 'you') {
        formattedText = formattedText.replace(/you/g, names.mufti);
    }
    return formattedText;
}
// Function to get localized game content
function getLocalizedContent(content, language) {
    // Handle null/undefined content
    if (!content) {
        return {
            prompt: '',
            options: [],
            explanation: '',
            hadith: '',
            scenario: '',
            hadithText: ''
        };
    }
    if (language === 'ar') {
        // Return Arabic version if available, otherwise return original
        return {
            prompt: content.prompt_ar || content.prompt,
            options: content.options_ar || content.options,
            explanation: content.explanation_ar || content.explanation,
            hadith: content.hadith_ar || content.hadith,
            scenario: content.scenario_ar || content.scenario,
            hadithText: content.hadithText_ar || content.hadithText
        };
    }
    return content;
}
// Room management functions
// Map frontend game IDs to backend quiz types
function getQuizTypeFromGame(gameId) {
    const gameQuizMapping = {
        'maqasidMaster': 'maqasid',
        'meccanMedinanGame': 'makan_nuzul',
        'tilawahTrail': 'tarteeb_suwar',
        'seerahScenarios': 'ghareeb',
        'hadithLab': 'ghareeb',
        'pillarFoundations': 'ghareeb',
        'imanDefender': 'ghareeb'
    };
    return gameQuizMapping[gameId] || 'ghareeb'; // default to ghareeb
}
async function createRoom() {
    if (isCreatingRoom)
        return; // Prevent double-click
    isCreatingRoom = true;
    try {
        roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        isRoomHost = true;
        roomPlayers = ['Host']; // Add host as first player
        gameMode = 'team';
        previousScreen = 'suhbaSelector';
        // Connect to WebSocket backend if not already connected
        if (!$connectionState.connected) {
            await wsManager.connect();
        }
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        currentScreen = 'createRoomGameSelector';
        console.log('🎯 HOST created room:', roomCode, '- isRoomHost:', isRoomHost);
        toastManager.showSuccess(`Room ${roomCode} created successfully!`);
    }
    catch (error) {
        console.error('Failed to create room:', error);
        const errorMsg = $connectionState.error || 'Failed to create room. Please try again.';
        toastManager.showError(errorMsg);
    }
    finally {
        isCreatingRoom = false;
    }
}
async function joinRoom() {
    if (!roomCode.trim() || isJoiningRoom)
        return; // Prevent invalid/double attempts
    isJoiningRoom = true;
    try {
        isRoomHost = false;
        gameMode = 'team';
        // Connect to WebSocket backend if not already connected
        if (!$connectionState.connected) {
            await wsManager.connect();
        }
        // Join room in backend - use default quiz type, backend will handle the actual room type
        await wsManager.joinRoom(roomCode, 'ghareeb');
        console.log('👥 PLAYER joined room:', roomCode, '- isRoomHost:', isRoomHost);
        toastManager.showSuccess(`Successfully joined room ${roomCode}!`);
        currentScreen = 'roomLobby';
    }
    catch (error) {
        console.error('Failed to join room:', error);
        toastManager.showError(`Failed to join room ${roomCode}. Please check the code and try again.`);
    }
    finally {
        isJoiningRoom = false;
    }
}
function leaveRoom() {
    // Leave room in backend if connected
    if ($connectionState.connected && roomCode) {
        wsManager.leaveRoom(roomCode);
    }
    roomCode = '';
    isRoomHost = false;
    roomPlayers = [];
    gameMode = 'team';
    currentScreen = 'suhbaSelector';
}
function copyRoomCode() {
    navigator.clipboard.writeText(roomCode).then(() => {
        showCopyMessage = true;
        setTimeout(() => {
            showCopyMessage = false;
        }, 2000);
    });
}
// Helper function to determine current player's name based on host status
function getMyPlayerName() {
    if (isRoomHost) {
        return 'Host';
    }
    else {
        // For non-host players, determine position based on room state
        const playerNames = $roomState.players.length > 0 ? $roomState.players : players;
        if (playerNames.length <= 1) {
            return 'Player 2'; // Default for second player
        }
        // Use client ID to consistently determine player position
        const availableSlots = playerNames.filter(p => p !== 'Host');
        if (availableSlots.length === 0) {
            return 'Player 2';
        }
        // More reliable player identification
        const myIndex = Math.abs(clientId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % Math.max(1, availableSlots.length);
        return availableSlots[myIndex] || `Player ${Math.min(playerNames.length + 1, 6)}`;
    }
}
// Helper function to check if it's not the current player's turn
function isNotMyTurn() {
    if (gameMode !== 'team' || !$connectionState.connected) {
        return false; // In solo mode or offline, always allow answering
    }
    const myName = getMyPlayerName();
    const playerNames = $roomState.players.length > 0 ? $roomState.players : players;
    const myPlayerIndex = playerNames.findIndex(p => p === myName);
    console.log(`🎯 Turn check - My name: ${myName}, My index: ${myPlayerIndex}, Current player: ${currentPlayer}, Players: ${JSON.stringify(playerNames)}`);
    // If player not found in list, assume it's their turn (fallback)
    if (myPlayerIndex === -1) {
        return false;
    }
    return myPlayerIndex !== currentPlayer;
}
// Handle multiplayer game start from WebSocket
$effect(() => {
    console.log(`[${clientId}] Effect triggered - gameStarted:`, $roomState.gameStarted, 'isRoomHost:', isRoomHost, 'gameId:', $roomState.gameId, 'currentScreen:', currentScreen);
    if ($roomState.gameStarted && !isRoomHost && $roomState.gameId && currentScreen === 'roomLobby') {
        console.log(`[${clientId}] 🎮 Non-host player starting game:`, $roomState.gameId);
        // Find the game from availableGames using the gameId from WebSocket
        const gameToStart = availableGames.find(game => game.id === $roomState.gameId);
        if (!gameToStart) {
            console.error('❌ Game not found:', $roomState.gameId, 'Available games:', availableGames.map(g => g.id));
            return;
        }
        console.log('✅ Game found, starting:', gameToStart.name);
        // Set the current game so non-host players know what to play
        currentGame = gameToStart;
        gameMode = 'team';
        players = $roomState.players.length > 0 ? [...$roomState.players] : ['Host', 'Player 2'];
        // Initialize game state
        initializeGame();
        resetGameState();
        console.log('🚀 Launching game screen for:', currentGame.id);
        // Start the same game that host selected
        if (currentGame.id === 'imanDefender') {
            currentScreen = 'playing';
            initializeImanDefender();
        }
        else if (currentGame.id === 'seerahScenarios' || currentGame.id === 'hadithLab' || currentGame.id === 'pillarFoundations') {
            currentScreen = 'gameMode';
        }
        else {
            selectedDifficulty = 'medium';
            currentScreen = 'playing';
            initializeGameQuestions(currentGame.id);
        }
        // Reset game started state to prevent retriggering
        wsManager.resetGameStarted();
        console.log('✅ Game launch completed for non-host player');
    }
});
// Simplified answer synchronization - removed complex effect
let lastProcessedMessage = $state(null);
// Simplified next question synchronization - removed complex effect
let nextQuestionSync = $state(false);
function startMultiplayerGame() {
    if (($roomState.playerCount || roomPlayers.length) >= 2 && currentGame) {
        console.log(`[${clientId}] 🎯 Host starting multiplayer game:`, currentGame.id, 'with', ($roomState.playerCount || roomPlayers.length), 'players');
        // Set up team mode properly
        gameMode = 'team';
        players = $roomState.players.length > 0 ? [...$roomState.players] : [...roomPlayers];
        previousScreen = 'roomLobby';
        // Notify backend that game is starting
        if ($connectionState.connected && roomCode) {
            console.log('📡 Sending game start signal to backend for room:', roomCode);
            wsManager.startGame(roomCode, currentGame.id, currentGame.id);
        }
        else {
            console.warn('⚠️ Not connected to backend, cannot notify other players');
        }
        // Initialize game state first
        initializeGame();
        resetGameState();
        console.log('🚀 Host launching game screen for:', currentGame.id);
        // Directly start the selected game instead of going to game selector
        if (currentGame.id === 'imanDefender') {
            currentScreen = 'playing';
            initializeImanDefender();
        }
        else if (currentGame.id === 'seerahScenarios' || currentGame.id === 'hadithLab' || currentGame.id === 'pillarFoundations') {
            currentScreen = 'gameMode';
        }
        else {
            // For other games, go directly to playing screen with medium difficulty
            selectedDifficulty = 'medium';
            currentScreen = 'playing';
            initializeGameQuestions(currentGame.id);
        }
        console.log('✅ Host game launch completed');
    }
    else {
        console.warn('⚠️ Cannot start game - not enough players or no game selected');
    }
}
// New game functions
function selectGameMode(mode) {
    currentGameMode = mode;
    currentScreen = 'playing';
    if (currentGame.id === 'seerahScenarios') {
        if (mode === 'timelineScramble') {
            initializeTimelineScramble();
        }
        else if (mode === 'propheticDecisions') {
            initializeGameQuestions('seerahScenarios');
        }
    }
    else if (currentGame.id === 'hadithLab') {
        initializeHadithLab(mode);
    }
    else if (currentGame.id === 'pillarFoundations') {
        initializePillarFoundations(mode);
    }
}
function initializeTimelineScramble() {
    if (!newGameContent?.seerahScenarios?.timelineScramble) {
        console.error('Seerah Scenarios timeline content not available');
        return;
    }
    const chapters = newGameContent.seerahScenarios.timelineScramble;
    if (chapters && chapters.length > 0) {
        currentTimelineChapter = chapters[Math.floor(Math.random() * chapters.length)];
        if (currentTimelineChapter?.events) {
            draggedEvents = [...currentTimelineChapter.events].sort(() => Math.random() - 0.5);
            userOrder = [];
            isTimelineComplete = false;
        }
    }
}
function initializeHadithLab(mode) {
    if (!newGameContent?.hadithLab) {
        console.error('Hadith Lab content not available');
        return;
    }
    if (mode === 'isnadChains') {
        const chains = newGameContent.hadithLab.isnadChains;
        if (chains && chains.length > 0) {
            currentQuestion = chains[Math.floor(Math.random() * chains.length)];
        }
    }
    else if (mode === 'matnMatching') {
        const matching = newGameContent.hadithLab.matnMatching;
        if (matching && matching.length > 0) {
            currentQuestion = matching[Math.floor(Math.random() * matching.length)];
            matchedPairs = [];
        }
    }
    else if (mode === 'sourceScholar') {
        const scholar = newGameContent.hadithLab.sourceScholar;
        if (scholar && scholar.length > 0) {
            currentQuestion = scholar[Math.floor(Math.random() * scholar.length)];
        }
    }
}
function initializePillarFoundations(mode) {
    if (!newGameContent?.pillarFoundations) {
        console.error('Pillar Foundations content not available');
        return;
    }
    if (mode === 'beliefBuilder') {
        const beliefs = newGameContent.pillarFoundations.beliefBuilder;
        if (beliefs && beliefs.length > 0) {
            currentQuestion = beliefs[Math.floor(Math.random() * beliefs.length)];
        }
    }
    else if (mode === 'categorizationBlitz') {
        const categories = newGameContent.pillarFoundations.categorizationBlitz;
        if (categories && categories.length > 0) {
            currentQuestion = categories[Math.floor(Math.random() * categories.length)];
            timeRemaining = 30;
        }
    }
    else if (mode === 'asmaUlHusna') {
        const names = newGameContent.pillarFoundations.asmaUlHusna;
        if (names && names.length > 0) {
            currentAsmaName = names[Math.floor(Math.random() * names.length)];
            wheelRotation = 0;
            timeRemaining = 15;
        }
    }
}
// Iman Defender Functions
function initializeImanDefender() {
    if (!newGameContent?.imanDefender?.difficulty) {
        console.error('Iman Defender content not available');
        return;
    }
    imanDefenderActive = true;
    fallingWords = [];
    righteousConcepts = [];
    gameSpeed = newGameContent.imanDefender.difficulty.baseSpeed;
    spawnRate = newGameContent.imanDefender.difficulty.spawnRate;
    survivalTime = 0;
    accuracy = 1.0;
    hits = 0;
    misses = 0;
    gameScore = 0;
    activePowerups = [];
    cannonFiring = false;
    wordId = 0;
    gameRunning = true;
    lastSpawn = Date.now();
    difficultyTimer = 0;
    consecutiveHits = 0;
    shieldActive = false;
    pointMultiplier = 1;
    // Generate initial righteous concepts
    generateRighteousConcepts();
    // Start game loop
    startImanDefenderLoop();
}
function generateRighteousConcepts() {
    const wordPairs = newGameContent.imanDefender.wordPairs;
    const randomPair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    currentWordPair = randomPair;
    // Shuffle the positives array and take 4
    const shuffled = [...randomPair.positives].sort(() => Math.random() - 0.5);
    righteousConcepts = shuffled.slice(0, 4);
}
function startImanDefenderLoop() {
    gameLoop = setInterval(() => {
        updateImanDefenderGame();
    }, 16); // ~60 FPS
}
function updateImanDefenderGame() {
    if (!gameRunning)
        return;
    const now = Date.now();
    // Update survival time
    survivalTime += 16;
    // Update difficulty every 10 seconds
    difficultyTimer += 16;
    if (difficultyTimer >= 10000) {
        increaseDifficulty();
        difficultyTimer = 0;
    }
    // Spawn new words
    if (now - lastSpawn >= spawnRate) {
        spawnFallingWord();
        lastSpawn = now;
    }
    // Update falling words positions
    updateFallingWords();
    // Update powerups
    updatePowerups();
    // Update score
    gameScore = calculateScore();
}
function increaseDifficulty() {
    const diff = newGameContent.imanDefender.difficulty;
    gameSpeed = Math.min(gameSpeed + diff.speedIncrease, diff.maxSpeed);
    spawnRate = Math.max(spawnRate - diff.spawnRateDecrease, diff.minSpawnRate);
}
function spawnFallingWord() {
    const wordPairs = newGameContent.imanDefender.wordPairs;
    const randomWord = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    // Check for powerup spawn
    const shouldSpawnPowerup = Math.random() < newGameContent.imanDefender.difficulty.powerupChance;
    if (shouldSpawnPowerup) {
        spawnPowerup();
    }
    else {
        const newWord = {
            id: wordId++,
            text: randomWord.negative,
            arabic: randomWord.arabic,
            correctAnswer: randomWord.correctAnswer,
            x: Math.random() * 300 + 50, // Random horizontal position
            y: -50, // Start above screen
            speed: gameSpeed,
            type: 'negative'
        };
        fallingWords = [...fallingWords, newWord];
    }
}
function spawnPowerup() {
    const powerups = newGameContent.imanDefender.powerups;
    const randomPowerup = powerups[Math.floor(Math.random() * powerups.length)];
    const newPowerup = {
        id: wordId++,
        ...randomPowerup,
        x: Math.random() * 300 + 50,
        y: -50,
        speed: gameSpeed * 0.8, // Slightly slower than negative words
        type: 'powerup'
    };
    fallingWords = [...fallingWords, newPowerup];
}
function updateFallingWords() {
    fallingWords = fallingWords.map(word => ({
        ...word,
        y: word.y + word.speed
    })).filter(word => {
        // Remove words that reached the bottom
        if (word.y >= 500) { // Assuming game area height is 500px
            if (word.type === 'negative') {
                // Game over if negative word reaches bottom
                if (!shieldActive) {
                    endImanDefenderGame();
                    return false;
                }
                else {
                    // Shield protects from one miss
                    shieldActive = false;
                }
            }
            return false;
        }
        return true;
    });
}
function updatePowerups() {
    const now = Date.now();
    activePowerups = activePowerups.filter(powerup => {
        return now - powerup.startTime < powerup.duration;
    });
    // Update effects
    pointMultiplier = activePowerups.some(p => p.effect === 'doublePoints') ? 2 : 1;
    shieldActive = activePowerups.some(p => p.effect === 'shield');
}
function calculateScore() {
    const scoring = newGameContent.imanDefender.scoring;
    let score = hits * scoring.correctHit * pointMultiplier;
    score += Math.floor(survivalTime / 1000) * scoring.survivalBonus;
    score += Math.floor(consecutiveHits / 5) * scoring.accuracyBonus;
    return score;
}
function handleRighteousConceptClick(concept) {
    if (!gameRunning || cannonFiring)
        return;
    // Find the closest falling negative word
    const negativeWords = fallingWords.filter(w => w.type === 'negative');
    if (negativeWords.length === 0)
        return;
    const closestWord = negativeWords.reduce((closest, word) => {
        return word.y > closest.y ? word : closest;
    });
    // Check if correct answer
    if (concept === closestWord.correctAnswer) {
        fireCannonAtWord(closestWord, true);
        hits++;
        consecutiveHits++;
    }
    else {
        fireCannonAtWord(closestWord, false);
        misses++;
        consecutiveHits = 0;
    }
    // Update accuracy
    accuracy = hits / (hits + misses);
    // Generate new concepts for next word
    generateRighteousConcepts();
}
function fireCannonAtWord(word, isCorrect) {
    cannonFiring = true;
    // Visual cannon firing effect
    setTimeout(() => {
        if (isCorrect) {
            // Remove the word (successful hit)
            fallingWords = fallingWords.filter(w => w.id !== word.id);
            // Add points and effects
            const points = newGameContent.imanDefender.scoring.correctHit * pointMultiplier;
            totalPoints += points;
        }
        cannonFiring = false;
    }, 300);
}
function handlePowerupClick(powerup) {
    if (!gameRunning)
        return;
    // Remove powerup from falling words
    fallingWords = fallingWords.filter(w => w.id !== powerup.id);
    // Activate powerup effect
    activatePowerup(powerup);
    // Add powerup points
    const points = newGameContent.imanDefender.scoring.powerupBonus * pointMultiplier;
    totalPoints += points;
}
function activatePowerup(powerup) {
    const now = Date.now();
    switch (powerup.effect) {
        case 'slowMotion':
            gameSpeed *= 0.5;
            setTimeout(() => {
                gameSpeed = newGameContent.imanDefender.difficulty.baseSpeed;
            }, powerup.duration);
            break;
        case 'clearAll':
            fallingWords = fallingWords.filter(w => w.type !== 'negative');
            break;
        case 'shield':
        case 'highlight':
        case 'doublePoints':
            activePowerups.push({
                ...powerup,
                startTime: now
            });
            break;
    }
}
function endImanDefenderGame() {
    gameRunning = false;
    imanDefenderActive = false;
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    // Show game over screen
    currentScreen = 'gameComplete';
}
function pauseImanDefender() {
    gameRunning = !gameRunning;
    if (gameRunning) {
        startImanDefenderLoop();
    }
    else if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
}
function pauseGame() {
    gamePaused = !gamePaused;
    // For Iman Defender, use the existing specific pause function
    if (currentGame?.id === 'imanDefender') {
        pauseImanDefender();
        return;
    }
    // For other games, handle pause state
    if (gamePaused) {
        // Game is now paused - stop any timers if they exist
        if (gameLoop) {
            clearInterval(gameLoop);
            gameLoop = null;
        }
    }
    else {
        // Game is resumed - restart timers if needed
        // This can be extended based on specific game needs
    }
}
</script>

{#if currentScreen === 'home'}
  {@const LoginIcon = loginButtonProps?.icon || UserShmagh}
  {@const SettingsIcon = settingsIcon() || Settings}
  <!-- Fixed positioning ensures these elements are positioned relative to viewport, not this container -->
  <div class="min-h-screen {currentTheme.bg} flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
    
    <!-- User Button - Fixed to viewport top-left, theme-based styling -->
    <button
      onclick={() => showAuth = true}
      class="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 outline-none hover:shadow-lg"
      style="position: fixed !important; top: 16px !important; left: 16px !important; z-index: 999 !important; transform: none !important; 
        {theme === 'midnight' ? 'background: rgba(255, 255, 255, 0.9); color: #1f2937; border: 1px solid rgba(255, 255, 255, 0.2);' : 
         theme === 'desert' ? 'background: rgba(101, 67, 33, 0.9); color: white; border: 1px solid rgba(101, 67, 33, 0.3);' :
         'background: rgba(139, 116, 91, 0.9); color: white; border: 1px solid rgba(139, 116, 91, 0.3);'}"
      aria-label="User login and profile - {loginButtonProps.text}"
    >
      <LoginIcon class="w-5 h-5" />
      <span>{loginButtonProps.text}</span>
    </button>
    
    <!-- Top Right Controls - Salah Timer and Settings -->
    <div class="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 flex items-center space-x-3">
      <SalahTimer {currentTheme} {theme} />
      <button
        onclick={() => showSettings = true}
        class="p-3 rounded-xl transition-all duration-300 outline-none hover:shadow-lg"
        style="{theme === 'midnight' ? 'background: rgba(255, 255, 255, 0.9); color: #1f2937; border: 1px solid rgba(255, 255, 255, 0.2);' : 
                theme === 'desert' ? 'background: rgba(101, 67, 33, 0.9); color: white; border: 1px solid rgba(101, 67, 33, 0.3);' :
                'background: rgba(139, 116, 91, 0.9); color: white; border: 1px solid rgba(139, 116, 91, 0.3);'}"
        aria-label="Open settings - Language and theme options"
      >
        <SettingsIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
    </div>

    <div class="text-center mb-8 sm:mb-16 relative z-10 pt-8 sm:pt-0">
      <div class="mb-6">
        <div class="mx-auto mb-6 transform hover:scale-105 transition-transform duration-300">
          <SuhbaLogo size="120px" className="drop-shadow-2xl" />
        </div>
      </div>
      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-light {currentTheme.suhbaColor} mb-4 font-serif tracking-wide">{t.appTitle}</h1>
      <p class="{currentTheme.text} opacity-80 text-lg sm:text-xl font-medium">{t.appTagline}</p>
      <div class="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto mt-4"></div>
    </div>

    <div class="space-y-4 sm:space-y-6 w-full max-w-xs sm:max-w-sm relative z-10 px-4 sm:px-0">
      <Button
        variant="primary"
        size="lg"
        class="w-full"
        onclick={() => currentScreen = 'modeSelector'}
        ariaLabel="{t.startGame} - {t.appTagline}"
      >
        {#snippet children()}
          <div class="flex items-center justify-center space-x-3 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
            <Play class="w-6 h-6" />
            <span>{t.startGame}</span>
          </div>
        {/snippet}
      </Button>

      <Button
        variant="secondary"
        size="lg"
        class="w-full"
        onclick={() => currentScreen = 'chillSelector'}
        ariaLabel="{t.chillTell} - Relaxed conversation topics"
      >
        {#snippet children()}
          <div class="flex items-center justify-center space-x-3 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
            <MessageCircle class="w-6 h-6" />
            <span>{t.chillTell}</span>
          </div>
        {/snippet}
      </Button>
    </div>

    <div class="mt-16 relative z-10">
      <Button
        variant="theme"
        size="sm"
        onclick={cycleTheme}
        ariaLabel="Change theme - Currently {theme === 'desert' ? t.themeDesert : theme === 'scroll' ? t.themeScroll : t.themeMidnight}"
        class="text-sm"
      >
        {#snippet children()}
          <div class="flex items-center space-x-2">
            {#if theme === 'desert'}
              <Sun class="w-4 h-4" />
            {:else if theme === 'scroll'}
              <Scroll class="w-4 h-4" />
            {:else}
              <Moon class="w-4 h-4" />
            {/if}
            <span>{t.theme}: {theme === 'desert' ? t.themeDesert : theme === 'scroll' ? t.themeScroll : t.themeMidnight}</span>
          </div>
        {/snippet}
      </Button>
    </div>
  </div>

{:else if currentScreen === 'modeSelector'}
  {@const SettingsIcon = settingsIcon() || Settings}
  {@const BackIcon = backButtonProps?.icon || ChevronLeft}
  {@const LoginIcon = loginButtonProps?.icon || UserShmagh}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden" dir="{'ltr'}">
    <!-- Header with Login, Salah Timer, and Settings -->
    <div class="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
      <!-- Login Button -->
      <button
        onclick={() => showAuth = true}
        class="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}"
      >
        <LoginIcon class="w-4 h-4" />
        <span class="text-sm font-medium">{loginButtonProps.text}</span>
      </button>
      
      <!-- Salah Timer -->
      <SalahTimer {currentTheme} {theme} />
      
      <!-- Settings Button -->
      <button
        onclick={() => showSettings = true}
        class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
      >
        <SettingsIcon class="w-5 h-5 {currentTheme.iconColor}" />
      </button>
    </div>
    
    <div class="max-w-2xl mx-auto relative z-10 pt-20">
      <div class="flex items-center justify-between mb-16">
        <button
          onclick={() => currentScreen = 'home'}
          class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}"
          type="button"
        >
          <BackIcon class="w-5 h-5 {currentTheme.iconColor}" />
          <span>{backButtonProps.text}</span>
        </button>
        <h2 class="text-3xl font-bold {currentTheme.text}">{t.chooseGameMode}</h2>
        <div></div>
      </div>

      <div class="space-y-8">
        <button
          onclick={() => {
            console.log('Solo play button clicked');
            gameMode = 'solo';
            previousScreen = 'modeSelector';
            currentScreen = 'gameSelector';
          }}
          class="group w-full bg-gradient-to-r from-blue-400 to-indigo-500 p-10 rounded-3xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 text-white cursor-pointer z-10 relative"
        >
          <User class="w-16 h-16 mx-auto mb-6" />
          <h3 class="text-2xl font-bold mb-4">{t.soloPlay}</h3>
          <p class="opacity-90 text-lg">{t.soloDescription}</p>
        </button>

        <button
          onclick={() => {
            console.log('Suhba mode button clicked');
            gameMode = 'team';
            currentScreen = 'suhbaSelector';
          }}
          class="group w-full bg-gradient-to-r from-emerald-400 to-teal-500 p-10 rounded-3xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 text-white cursor-pointer z-10 relative"
        >
          <Users class="w-16 h-16 mx-auto mb-6" />
          <h3 class="text-2xl font-bold mb-4">{t.suhbaMode}</h3>
          <p class="opacity-90 text-lg">{t.suhbaDescription}</p>
        </button>
      </div>
    </div>
  </div>

{:else if currentScreen === 'suhbaSelector'}
  {@const SettingsIcon = settingsIcon()}
  {@const BackIcon = backButtonProps.icon}
  {@const LoginIcon = loginButtonProps?.icon || UserShmagh}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden" dir="{'ltr'}">
    
    <!-- User Button - Top Left -->
    <Button
      variant="glass"
      size="sm"
      onclick={() => showAuth = true}
      class="absolute top-4 left-4 sm:top-6 sm:left-6 z-20"
      ariaLabel="User login and profile - {loginButtonProps.text}"
    >
      {#snippet children()}
        <div class="flex items-center space-x-2">
          <LoginIcon class="w-5 h-5" />
          <span class="font-medium">{loginButtonProps.text}</span>
        </div>
      {/snippet}
    </Button>
    
    <!-- Top Right Controls - Salah Timer and Settings -->
    <div class="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center space-x-3">
      <SalahTimer {currentTheme} {theme} />
      <Button
        variant="glass"
        size="sm"
        onclick={() => showSettings = true}
        class="p-3"
        ariaLabel="Open settings - Language and theme options"
      >
        {#snippet children()}
          <SettingsIcon class="w-5 h-5" />
        {/snippet}
      </Button>
    </div>
    
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-5xl mx-auto relative z-10 pt-16">
      <div class="flex items-center justify-between mb-12">
        <button
          onclick={() => currentScreen = 'modeSelector'}
          class="flex items-center space-x-2 {currentTheme.text} opacity-90 hover:opacity-100 transition-all duration-300 px-6 py-3 rounded-xl {currentTheme.cardBg} {currentTheme.border} border-2 backdrop-blur-sm hover:shadow-lg hover:scale-105 focus-ring-improved interactive-card"
          aria-label="Go back to mode selection"
        >
          <BackIcon class="w-5 h-5 {currentTheme.text}" />
          <span class="font-semibold">{backButtonProps.text}</span>
        </button>
        <h2 class="text-3xl font-bold {currentTheme.text}">{t.teamPlay}</h2>
        <div class="w-24"></div>
      </div>

      <!-- Room Options -->
      <div class="mb-8">
        <h3 class="text-2xl font-bold {currentTheme.text} mb-6 text-center">{t.roomOptions}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <!-- Create Room -->
          <Button
            variant="primary"
            onclick={createRoom}
            loading={isCreatingRoom}
            disabled={isCreatingRoom}
            class="group bg-gradient-to-br from-purple-400 to-pink-500 p-6 text-white card-hover"
            ariaLabel="Create new room - {t.invitePlayers}"
          >
            {#snippet children()}
              <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 smooth-transition">
                <Plus class="w-8 h-8 text-white" />
              </div>
              <h4 class="text-xl font-bold mb-2">{t.createRoom}</h4>
              <p class="text-sm opacity-90">{t.invitePlayers}</p>
            {/snippet}
          </Button>
          
          <!-- Join Room -->
          <div class="group bg-gradient-to-br from-teal-400 to-cyan-500 p-6 rounded-3xl card-hover text-white">
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 smooth-transition">
              <UserPlus class="w-8 h-8 text-white" />
            </div>
            <h4 class="text-xl font-bold mb-4">{t.joinRoom}</h4>
            <div class="space-y-3">
              <input
                type="text"
                bind:value={roomCode}
                placeholder="{t.roomCodePlaceholder}"
                class="w-full p-3 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/60 backdrop-blur-sm focus:border-white/40 focus-ring text-center smooth-transition"
                maxlength="6"
                disabled={isJoiningRoom}
                aria-label="Enter room code"
              />
              <Button
                variant="glass"
                size="sm"
                onclick={joinRoom}
                loading={isJoiningRoom}
                disabled={!roomCode.trim() || isJoiningRoom}
                class="w-full text-white"
                ariaLabel="Join room with code {roomCode}"
              >
                {#snippet children()}
                  {t.joinRoom}
                {/snippet}
              </Button>
            </div>
          </div>
          
          <!-- Local Team Setup -->
          <button
            onclick={() => {
              gameMode = 'team';
              players = [];
              previousScreen = 'suhbaSelector';
              currentScreen = 'teamSetup';
            }}
            class="group bg-gradient-to-br from-indigo-400 to-blue-500 p-6 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
          >
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Users class="w-8 h-8 text-white" />
            </div>
            <h4 class="text-xl font-bold mb-2">{t.teamSetup}</h4>
            <p class="text-sm opacity-90">Local multiplayer</p>
          </button>
        </div>
      </div>

    </div>
  </div>

{:else if currentScreen === 'createRoomGameSelector'}
  {@const LoginIcon = loginButtonProps?.icon || UserShmagh}
  {@const BackIcon = backButtonProps?.icon || ChevronLeft}
  {@const SettingsIcon = settingsIcon() || Settings}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden">
    <!-- User Button - Left Side -->
    <div class="absolute top-6 left-6 z-20">
      <button
        onclick={() => showAuth = true}
        class="flex items-center space-x-3 {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm rounded-xl px-4 py-2 {currentTheme.text} hover:shadow-lg transition-all duration-300 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}"
      >
        <LoginIcon class="w-5 h-5 {currentTheme.iconColor}" />
        <span>{loginButtonProps.text}</span>
      </button>
    </div>

    <!-- Settings Button - Right Side -->
    <div class="absolute top-6 right-6 z-20">
      <button
        onclick={() => showSettings = true}
        class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
      >
        <SettingsIcon class="w-5 h-5 {currentTheme.iconColor}" />
      </button>
    </div>

    <!-- Salah Timer -->
    <div class="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
      <SalahTimer />
    </div>

    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-5xl mx-auto relative z-10">
      <div class="flex items-center justify-between mb-12">
        <button
          onclick={() => currentScreen = 'suhbaSelector'}
          class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
        >
          <BackIcon class="w-5 h-5 {currentTheme.iconColor}" />
          <span>{backButtonProps.text}</span>
        </button>
        <h2 class="text-3xl font-bold {currentTheme.text}">{t.chooseYourGame}</h2>
        <div class="flex items-center space-x-2 {currentTheme.text} opacity-70">
          <span class="text-sm">Room: {roomCode}</span>
        </div>
      </div>

      <!-- Games Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each availableGames as game}
        {@const GameIcon = game.icon}
          <button
            onclick={async () => {
              currentGame = game;
              // Create room in backend with the selected game type
              if (isRoomHost && roomCode) {
                try {
                  const quizType = getQuizTypeFromGame(game.id);
                  await wsManager.createRoom(roomCode, quizType, true);
                  console.log('Successfully created room on backend:', roomCode, quizType);
                } catch (error) {
                  console.error('Failed to create room:', error);
                  // Handle error - maybe show error message to user
                  return;
                }
              }
              currentScreen = 'roomLobby';
            }}
            class="group relative bg-gradient-to-br {game.gradient} p-8 rounded-3xl hover:shadow-2xl {game.shadow} hover:-translate-y-3 hover:scale-105 transition-all duration-500 overflow-hidden"
          >
            <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <!-- Help Icon -->
            <div
              onclick={(e) => showHelp(game, e)}
              class="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 cursor-pointer"
              title="Game Info"
              role="button"
              tabindex="0"
            >
              <HelpCircle class="w-4 h-4 text-white" />
            </div>
            
            <div class="relative">
              <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <GameIcon class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-white font-bold text-xl text-center leading-tight">{game.name}</h3>
              <div class="w-12 h-1 bg-white/40 rounded-full mx-auto mt-4 group-hover:w-16 transition-all duration-300"></div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

{:else if currentScreen === 'gameSelector'}
  {@const LoginIcon = loginButtonProps?.icon || UserShmagh}
  {@const BackIcon = backButtonProps?.icon || ChevronLeft}
  {@const SettingsIcon = settingsIcon() || Settings}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden">
    <!-- User Button - Left Side -->
    <button
      onclick={() => showAuth = true}
      class="absolute top-6 left-6 z-20 flex items-center space-x-2 {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm rounded-xl px-4 py-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300"
    >
      <LoginIcon class="w-5 h-5 {currentTheme.text}" />
      <span class="font-medium">{loginButtonProps.text}</span>
    </button>
    
    <!-- Salah Timer - Center Right -->
    <div class="absolute top-6 right-24 z-20">
      <SalahTimer {currentTheme} {theme} />
    </div>
    
    <!-- Settings Button - Far Right -->
    <button
      onclick={() => showSettings = true}
      class="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
    >
      <SettingsIcon class="w-5 h-5 {currentTheme.iconColor}" />
    </button>
    
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-5xl mx-auto relative z-10">
      <div class="flex items-center justify-between mb-12">
        <button
          onclick={() => {
            currentScreen = previousScreen;
          }}
          class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
        >
          <BackIcon class="w-5 h-5 {currentTheme.iconColor}" />
          <span>{backButtonProps.text}</span>
        </button>
        <h2 class="text-3xl font-bold {currentTheme.text}">{t.chooseYourGame}</h2>
        <div></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each availableGames as game}
          {@const GameIcon = game.icon}
          <button
            onclick={() => startGame(game)}
            class="group relative bg-gradient-to-br {game.gradient} p-8 rounded-3xl hover:shadow-2xl {game.shadow} hover:-translate-y-3 hover:scale-105 transition-all duration-500 overflow-hidden"
          >
            <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <!-- Help Icon -->
            <div
              onclick={(e) => showHelp(game, e)}
              class="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 z-10 cursor-pointer"
              title="Game Info"
              role="button"
              tabindex="0"
            >
              <HelpCircle class="w-4 h-4 text-white" />
            </div>
            
            <div class="relative">
              <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <GameIcon class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-white font-bold text-xl text-center leading-tight">{game.name}</h3>
              <div class="w-12 h-1 bg-white/40 rounded-full mx-auto mt-4 group-hover:w-16 transition-all duration-300"></div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

{:else if currentScreen === 'chillSelector'}
  {@const SettingsIcon = settingsIcon()}
  {@const BackIcon = backButtonProps.icon}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden" dir="{'ltr'}">
    <!-- Settings and Salah Timer -->
    <div class="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
      <div></div>
      <SalahTimer {currentTheme} {theme} />
    </div>
    
    <button
      onclick={() => showSettings = true}
      class="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
    >
      <SettingsIcon class="w-5 h-5 {currentTheme.iconColor}" />
    </button>
    
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-5xl mx-auto relative z-10 pt-16">
      <div class="flex items-center justify-between mb-12">
        <button
          onclick={() => currentScreen = 'home'}
          class="flex items-center space-x-2 {currentTheme.text} opacity-90 hover:opacity-100 transition-all duration-300 px-6 py-3 rounded-xl {currentTheme.cardBg} {currentTheme.border} border-2 backdrop-blur-sm hover:shadow-lg hover:scale-105 focus-ring-improved interactive-card"
          aria-label="Go back to home screen"
        >
          <BackIcon class="w-5 h-5 {currentTheme.text}" />
          <span class="font-semibold">{backButtonProps.text}</span>
        </button>
        <h2 class="text-3xl font-bold {currentTheme.text}">Choose a Category</h2>
        <div class="w-24"></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        {#each chillCategories as category}
          {@const CategoryIcon = category.icon}
          <button
            onclick={() => startChillCategory(category)}
            class="group relative bg-gradient-to-br {category.gradient} p-8 rounded-3xl hover:shadow-2xl {category.shadow} hover:-translate-y-3 hover:scale-105 transition-all duration-500 overflow-hidden"
          >
            <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="relative">
              <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CategoryIcon class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-white font-bold text-xl text-center leading-tight">{category.name}</h3>
              <div class="w-12 h-1 bg-white/40 rounded-full mx-auto mt-4 group-hover:w-16 transition-all duration-300"></div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>

{:else if currentScreen === 'playing'}
  {@const BackIcon = backButtonProps.icon}
  {@const SettingsIcon = settingsIcon()}
  {@const CurrentGameIcon = currentGame.icon}
  <!-- Unified playing screen with settings and salah timer -->
  <div class="min-h-screen {currentTheme.bg} relative overflow-hidden" dir="{'ltr'}">
    <!-- Navigation Header -->
    <div class="relative z-10 p-6">
      <div class="flex items-center justify-between mb-8">
        <button
          onclick={() => currentScreen = 'gameSelector'}
          class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}"
        >
          <BackIcon class="w-5 h-5 {currentTheme.iconColor}" />
          <span>{backButtonProps.text}</span>
        </button>
        
        <div class="flex items-center space-x-6 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
          <SalahTimer {currentTheme} {theme} />
          {#if currentGame?.id !== 'imanDefender'}
            <button
              onclick={pauseGame}
              class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
            >
              {#if gamePaused}
                <Play class="w-5 h-5 {currentTheme.iconColor}" />
              {:else}
                <Pause class="w-5 h-5 {currentTheme.iconColor}" />
              {/if}
            </button>
          {/if}
          <button
            onclick={() => showSettings = true}
            class="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
          >
            <SettingsIcon class="w-5 h-5 {currentTheme.iconColor}" />
          </button>
        </div>
      </div>
      
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold {currentTheme.text}">{currentGame?.name}</h2>
        <div class="flex items-center justify-center space-x-6 text-sm mt-2">
          {#if gameMode === 'team' && players.length > 0}
            <span class="{currentTheme.text} opacity-60">Round {round}</span>
          {:else}
            <span class="{currentTheme.text} opacity-60">Round {round}</span>
            <span class="{currentTheme.text} opacity-60">•</span>
            <span class="{currentTheme.text} opacity-60">Score: {score}</span>
          {/if}
          <span class="{currentTheme.text} opacity-60">•</span>
          <div class="flex items-center space-x-2">
            <Star class="w-4 h-4 text-amber-500" />
            <span class="{currentTheme.text} opacity-60">Total: {totalPoints}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Game Content -->
    <div class="px-6 pb-6">
      {#if currentGame?.id === 'imanDefender' && imanDefenderActive}
        <!-- Iman Defender Game -->
        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden" style="height: 600px;">
          <!-- Game Header -->
          <div class="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <div class="flex items-center space-x-4">
              <div class="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <span class="{currentTheme.text} text-sm font-semibold">Time: {Math.floor(survivalTime / 1000)}s</span>
              </div>
              <div class="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <span class="{currentTheme.text} text-sm font-semibold">Score: {gameScore}</span>
              </div>
              <div class="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                <span class="{currentTheme.text} text-sm font-semibold">Accuracy: {Math.floor(accuracy * 100)}%</span>
              </div>
            </div>
            
            <button
              onclick={pauseImanDefender}
              class="bg-white/10 backdrop-blur-sm p-2 rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              <span class="{currentTheme.text}">{gameRunning ? '⏸️' : '▶️'}</span>
            </button>
          </div>
          
          <!-- Active Powerups Display -->
          {#if activePowerups.length > 0}
            <div class="absolute top-16 right-4 z-10">
              {#each activePowerups as powerup}
                <div class="bg-gradient-to-r from-amber-400/20 to-orange-400/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2">
                  <span class="{currentTheme.text} text-xs font-semibold">{powerup.icon} {powerup.name}</span>
                </div>
              {/each}
            </div>
          {/if}
          
          <!-- Game Area -->
          <div class="absolute inset-4 top-20 bottom-24 overflow-hidden rounded-xl bg-gradient-to-b from-sky-400/10 via-blue-400/5 to-purple-400/10">
            <!-- Falling Words -->
            {#each fallingWords as word (word.id)}
              <button 
                class="absolute transition-all duration-75 ease-linear cursor-pointer select-none border-0 bg-transparent p-0"
                style="left: {word.x}px; top: {word.y}px;"
                onclick={() => word.type === 'powerup' ? handlePowerupClick(word) : null}
                type="button"
              >
                {#if word.type === 'negative'}
                  <div class="bg-gradient-to-br from-red-400 to-red-600 text-white px-4 py-2 rounded-xl shadow-lg border-2 border-red-300/50 text-center min-w-[120px]">
                    <div class="font-bold text-sm">{word.text}</div>
                    <div class="text-xs opacity-80">{word.arabic}</div>
                  </div>
                {:else if word.type === 'powerup'}
                  <div class="bg-gradient-to-br from-amber-400 to-orange-500 text-white px-3 py-2 rounded-xl shadow-lg border-2 border-amber-300/50 text-center animate-pulse">
                    <div class="text-lg">{word.icon}</div>
                    <div class="text-xs font-semibold">{word.name}</div>
                  </div>
                {/if}
              </button>
            {/each}
            
            <!-- Cannon Visual -->
            <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div class="relative">
                <!-- Cannon Base -->
                <div class="w-16 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-b-full"></div>
                <!-- Cannon Barrel -->
                <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 w-4 h-8 bg-gradient-to-b from-gray-700 to-gray-900 rounded-t-full {cannonFiring ? 'animate-pulse' : ''}"></div>
                <!-- Firing Effect -->
                {#if cannonFiring}
                  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-2 h-4 bg-gradient-to-t from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
                {/if}
              </div>
            </div>
          </div>
          
          <!-- Righteous Concepts Buttons -->
          <div class="absolute bottom-4 left-4 right-4">
            <div class="grid grid-cols-2 gap-3">
              {#each righteousConcepts as concept}
                <button
                  onclick={() => handleRighteousConceptClick(concept)}
                  disabled={!gameRunning || cannonFiring}
                  class="bg-gradient-to-br from-emerald-400 to-teal-500 text-white px-4 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed {
                    activePowerups.some(p => p.effect === 'highlight') && concept === currentWordPair?.correctAnswer ? 'ring-4 ring-amber-400 ring-opacity-75' : ''
                  }"
                >
                  {concept}
                </button>
              {/each}
            </div>
          </div>
          
          <!-- Shield Active Indicator -->
          {#if shieldActive}
            <div class="absolute inset-0 border-4 border-blue-400 rounded-3xl animate-pulse pointer-events-none">
              <div class="absolute top-2 left-2 bg-blue-400 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                🛡️ Shield Active
              </div>
            </div>
          {/if}
        </div>
        
      {:else if currentGame?.id === 'seerahScenarios' && currentGameMode === 'timelineScramble'}
        <!-- Timeline Scramble Game -->
        {#if currentTimelineChapter}
          <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm">
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-gradient-to-br {currentGame.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CurrentGameIcon class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-2xl font-semibold {currentTheme.text} mb-2">{currentTimelineChapter.chapter}</h3>
              <p class="{currentTheme.text} opacity-70">{currentTimelineChapter.background}</p>
            </div>
            
            <div class="mb-8">
              <h4 class="font-semibold {currentTheme.text} mb-4">Arrange these events in chronological order:</h4>
              <div class="grid grid-cols-1 gap-4">
                {#each draggedEvents as event, index}
                  <div 
                    class="p-4 rounded-xl border-2 {currentTheme.cardBg} {currentTheme.border} cursor-move hover:border-blue-300/50 transition-all duration-300"
                    draggable="true"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span class="{currentTheme.text} flex-1">{event.text}</span>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
            
            <div class="text-center">
              <button
                onclick={() => {
                  // Simple check for now - in a real implementation, you'd handle drag/drop
                  const isCorrect = draggedEvents.every((event, index) => event.order === index + 1);
                  if (isCorrect) {
                    alert('Perfect! You got the timeline right!');
                    currentScreen = 'gameComplete';
                  } else {
                    alert('Not quite right. Try rearranging the events!');
                  }
                }}
                class="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
              >
                Check Timeline
              </button>
            </div>
          </div>
        {/if}
        
      {:else if currentQuestion}
        <!-- Regular Question-Answer Game -->
        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm">
          <!-- Question Display -->
          <div class="text-center mb-8">
            <div class="w-16 h-16 bg-gradient-to-br {currentGame.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CurrentGameIcon class="w-8 h-8 text-white" />
            </div>
            
            <!-- Turn Indicator for Multiplayer -->
            {#if gameMode === 'team' && $connectionState.connected}
              <div class="mb-4">
                <div class="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100/20 to-purple-100/20 border border-blue-300/30 rounded-xl px-4 py-2">
                  <Users class="w-4 h-4 {currentTheme.text}" />
                  <span class="{currentTheme.text} text-sm font-medium">
                    {players[currentPlayer]}'s Turn
                    {isNotMyTurn() ? '' : ' (You)'}
                  </span>
                  {#if !isNotMyTurn()}
                    <Crown class="w-4 h-4 text-amber-500" />
                  {/if}
                </div>
              </div>
            {/if}
            
            <h3 class="text-xl font-semibold {currentTheme.text} mb-6 leading-relaxed">
              {#if currentQuestion.scenario}
                {formatQuestionText(getLocalizedContent(currentQuestion, 'en').prompt || currentQuestion.scenario, questionNames)}
              {:else if currentQuestion.hadithText}
                {getLocalizedContent(currentQuestion, 'en').hadith || currentQuestion.hadithText}
              {:else if currentQuestion.prompt}
                {formatQuestionText(getLocalizedContent(currentQuestion, 'en').prompt, questionNames)}
              {:else}
                {currentQuestion.text || 'Question content'}
              {/if}
            </h3>
          </div>
          
          <!-- Answer Options -->
          {#if currentQuestion.options}
            <div class="space-y-4 mb-8">
              {#each (getLocalizedContent(currentQuestion, 'en').options || currentQuestion.options) as option, index}
                <button
                  onclick={() => !showExplanation && !isNotMyTurn() && handleAnswerSelection(index)}
                  disabled={showExplanation || isNotMyTurn()}
                  class="w-full p-4 rounded-xl text-left transition-all duration-300 border-2 {
                    showExplanation 
                      ? (isAnswerCorrect(index)
                          ? 'bg-green-100/20 border-green-300/50 {currentTheme.text}' 
                          : (index === selectedAnswer 
                              ? 'bg-red-100/20 border-red-300/50 {currentTheme.text}' 
                              : '{currentTheme.cardBg} {currentTheme.border} opacity-50'))
                      : isNotMyTurn()
                        ? '{currentTheme.cardBg} {currentTheme.border} opacity-30 cursor-not-allowed'
                        : 'hover:bg-gradient-to-r hover:from-blue-100/20 hover:to-purple-100/20 hover:border-blue-300/50 {currentTheme.cardBg} {currentTheme.border}'
                  } {currentTheme.text}"
                >
                  <div class="flex items-center space-x-4">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-sm">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span class="flex-1">
                      {#if typeof option === 'object' && option?.book}
                        {option.book}
                      {:else}
                        {option}
                      {/if}
                    </span>
                    {#if showExplanation}
                      {#if isAnswerCorrect(index)}
                        <Check class="w-5 h-5 text-green-600" />
                      {:else if index === selectedAnswer}
                        <ArrowLeft class="w-5 h-5 text-red-600 rotate-45" />
                      {/if}
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          {/if}
          
          <!-- Explanation Section -->
          {#if showExplanation}
            <div class="bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-2xl p-6 mb-6">
              <div class="flex items-center space-x-2 mb-4">
                <Lightbulb class="w-5 h-5 text-blue-600" />
                <h4 class="font-semibold {currentTheme.text}">{t.explanation}</h4>
              </div>
              <p class="{currentTheme.text} opacity-80 leading-relaxed">
                {getLocalizedContent(currentQuestion, 'en').explanation}
              </p>
              
              {#if currentQuestion.lesson}
                <div class="mt-4 p-4 bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-xl">
                  <p class="{currentTheme.text} opacity-80 italic text-sm font-medium">
                    {$currentLanguage.code === 'ar' ? 'العبرة: ' : 'Lesson: '}{currentQuestion.lesson}
                  </p>
                </div>
              {/if}
              
              {#if currentQuestion.hadith}
                <div class="mt-4 p-4 bg-gradient-to-r from-amber-100/20 to-orange-100/20 rounded-xl">
                  <p class="{currentTheme.text} opacity-80 italic text-sm">
                    "{getLocalizedContent(currentQuestion, 'en').hadith}"
                  </p>
                </div>
              {/if}
            </div>
            
            <div class="text-center">
              <button
                onclick={nextQuestion}
                disabled={isNotMyTurn()}
                class="{isNotMyTurn() 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:shadow-lg'
                } px-8 py-3 rounded-xl transition-all duration-300 font-semibold flex items-center space-x-2 mx-auto"
              >
                <SkipForward class="w-5 h-5" />
                <span>{isNotMyTurn() ? `${players[currentPlayer]}'s Turn` : t.nextQuestion}</span>
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm text-center">
          <h3 class="text-xl font-semibold {currentTheme.text} mb-4">Loading...</h3>
          <p class="{currentTheme.text} opacity-70">Preparing your questions...</p>
        </div>
      {/if}
    </div>
    
    <!-- Team Scores (if team mode) -->
    {#if gameMode === 'team' && players.length > 0}
      <div class="px-6 pb-6">
        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-6 backdrop-blur-sm">
          <h3 class="text-lg font-semibold {currentTheme.text} mb-4 text-center">{t.teamScores}</h3>
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
    
    <!-- Pause Overlay for All Games -->
    {#if gamePaused && currentGame?.id !== 'imanDefender'}
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-white text-2xl">⏸️</span>
          </div>
          <h3 class="text-2xl font-bold {currentTheme.text} mb-4">Game Paused</h3>
          <p class="{currentTheme.text} opacity-80 mb-6">Take a break and come back when you're ready!</p>
          <button
            onclick={pauseGame}
            class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Resume Game
          </button>
        </div>
      </div>
    {/if}
  </div>

{:else if currentScreen === 'roomLobby'}
  {@const SettingsIcon = settingsIcon()}
  {@const BackIcon = backButtonProps.icon}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden" dir="{'ltr'}">
    <!-- Settings and Salah Timer -->
    <div class="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
      <div></div>
      <SalahTimer {currentTheme} {theme} />
    </div>
    
    <button
      onclick={() => showSettings = true}
      class="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
    >
      <SettingsIcon class="w-5 h-5 {currentTheme.iconColor}" />
    </button>
    
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
      <div class="flex items-center justify-between mb-12">
        <button
          onclick={leaveRoom}
          class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
        >
          <BackIcon class="w-5 h-5 {currentTheme.iconColor}" />
          <span>{backButtonProps.text}</span>
        </button>
        <h2 class="text-3xl font-bold {currentTheme.text}">{t.roomOptions}</h2>
        <div></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Room Info -->
        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm">
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Globe class="w-10 h-10 text-white" />
            </div>
            <h3 class="text-2xl font-bold {currentTheme.text} mb-2">Room Code</h3>
            <div class="bg-gradient-to-r from-purple-100/20 to-pink-100/20 rounded-2xl p-6 mb-4">
              <div class="text-4xl font-mono font-bold {currentTheme.text} tracking-wider">{roomCode}</div>
            </div>
            
            <div class="flex space-x-3 justify-center {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
              <button
                onclick={copyRoomCode}
                class="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}"
              >
                <Shuffle class="w-4 h-4" />
                <span class="text-sm font-medium">{t.copyRoomCode}</span>
              </button>
              
              {#if showCopyMessage}
                <div class="bg-green-500 text-white px-4 py-3 rounded-xl text-sm font-medium animate-fade-in">
                  {t.roomCodeCopied}
                </div>
              {/if}
            </div>
            
            <p class="{currentTheme.text} opacity-60 text-sm mt-4">{t.shareRoomCode}</p>
          </div>
        </div>

        <!-- Players List -->
        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm">
          <div class="flex items-center space-x-3 mb-6 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
            <Users class="w-6 h-6 {currentTheme.text}" />
            <h3 class="text-xl font-bold {currentTheme.text}">{t.playersInRoom}</h3>
            <span class="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {$roomState.playerCount || roomPlayers.length}
            </span>
          </div>
          
          <div class="space-y-3 mb-8">
            {#each ($roomState.players.length > 0 ? $roomState.players : roomPlayers) as player, index}
              <div class="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-gray-100/20 to-gray-200/20 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
                <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                  <User class="w-5 h-5 text-white" />
                </div>
                <div class="flex-1">
                  <p class="{currentTheme.text} font-medium">{player}</p>
                  {#if index === 0 || player === 'Host'}
                    <p class="{currentTheme.text} opacity-60 text-sm">Host</p>
                  {/if}
                </div>
                {#if (isRoomHost && index === 0) || player === 'Host'}
                  <Crown class="w-5 h-5 text-amber-500" />
                {/if}
              </div>
            {/each}
          </div>
          
          {#if ($roomState.playerCount || roomPlayers.length) < 2}
            <div class="text-center py-8">
              <div class="w-16 h-16 bg-gradient-to-br from-gray-300/20 to-gray-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock class="w-8 h-8 {currentTheme.text} opacity-50" />
              </div>
              <p class="{currentTheme.text} opacity-60">{t.waitingForPlayers}</p>
            </div>
          {:else if isRoomHost}
            <button
              onclick={startMultiplayerGame}
              class="w-full bg-gradient-to-r from-emerald-400 to-teal-500 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-3 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}"
            >
              <Play class="w-6 h-6" />
              <span>{t.startMultiplayerGame}</span>
            </button>
          {:else}
            <div class="text-center py-4">
              <p class="{currentTheme.text} opacity-60">Waiting for host to start the game...</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>

{:else if currentScreen === 'teamSetup'}
  {@const SettingsIcon = settingsIcon()}
  {@const BackIcon = backButtonProps.icon}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden" dir="{'ltr'}">
    <!-- Settings and Salah Timer -->
    <div class="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
      <div></div>
      <SalahTimer {currentTheme} {theme} />
    </div>
    
    <button
      onclick={() => showSettings = true}
      class="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
    >
      <SettingsIcon class="w-5 h-5 {currentTheme.iconColor}" />
    </button>
    
    <div class="max-w-2xl mx-auto relative z-10 pt-16">
      <div class="flex items-center justify-between mb-12">
        <button
          onclick={() => currentScreen = 'suhbaSelector'}
          class="flex items-center space-x-2 {currentTheme.text} opacity-90 hover:opacity-100 transition-all duration-300 px-6 py-3 rounded-xl {currentTheme.cardBg} {currentTheme.border} border-2 backdrop-blur-sm hover:shadow-lg hover:scale-105 focus-ring-improved interactive-card"
          aria-label="Go back to Suhba mode selection"
        >
          <BackIcon class="w-5 h-5 {currentTheme.iconColor}" />
          <span class="font-semibold">{backButtonProps.text}</span>
        </button>
        <h2 class="text-3xl font-bold {currentTheme.text}">{t.teamSetup}</h2>
        <div class="w-24"></div>
      </div>

      <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm">
        <h3 class="text-xl font-bold {currentTheme.text} mb-6">{t.addPlayers}</h3>
        
        <!-- Add Player Input -->
        <div class="flex space-x-3 mb-6 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
          <input
            type="text"
            placeholder="{t.playerName}"
            class="flex-1 p-4 rounded-xl border-2 {currentTheme.border} {currentTheme.cardBg} {currentTheme.text} placeholder-opacity-60 backdrop-blur-sm focus:border-emerald-300 transition-colors"
            onkeydown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                players = [...players, e.target.value.trim()];
                e.target.value = '';
              }
            }}
          />
          <button
            onclick={(e) => {
              const input = e.target.parentElement.querySelector('input');
              if (input.value.trim()) {
                players = [...players, input.value.trim()];
                input.value = '';
              }
            }}
            class="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-6 py-4 rounded-xl hover:shadow-lg transition-all duration-300"
          >
            <Plus class="w-5 h-5 {currentTheme.iconColor}" />
          </button>
        </div>
        
        <!-- Players List -->
        {#if players.length > 0}
          <div class="space-y-3 mb-6">
            {#each players as player, index}
              <div class="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-emerald-100/20 to-teal-100/20 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}">
                <User class="w-5 h-5 {currentTheme.text}" />
                <span class="{currentTheme.text} font-medium flex-1">{player}</span>
                <button
                  onclick={() => players = players.filter((_, i) => i !== index)}
                  class="text-red-500 hover:text-red-700 transition-colors"
                >
                  <ArrowLeft class="w-4 h-4 rotate-45" />
                </button>
              </div>
            {/each}
          </div>
        {/if}
        
        {#if players.length >= 2}
          <button
            onclick={() => {
              initializeGame();
              currentScreen = 'gameSelector';
            }}
            class="w-full bg-gradient-to-r from-purple-400 to-pink-500 text-white p-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg flex items-center justify-center space-x-3 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}"
          >
            <Play class="w-6 h-6" />
            <span>{t.startTeamGame} ({players.length} {t.players})</span>
          </button>
        {:else}
          <p class="{currentTheme.text} opacity-60 text-center py-4">Add at least 2 players to start</p>
        {/if}
      </div>
    </div>
  </div>

{:else if currentScreen === 'chillTell'}
  {@const stories = chillContent[chillCategory?.id] || []}
  {@const story = stories[0]}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden" dir="{'ltr'}">
      <!-- Settings and Salah Timer -->
      <div class="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div></div>
        <SalahTimer {currentTheme} {theme} />
      </div>
      
      <button
        onclick={() => showSettings = true}
        class="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
      >
        <Settings class="w-5 h-5 {currentTheme.text}" />
      </button>
      
      <!-- Background decoration -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-10 w-40 h-40 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div class="max-w-5xl mx-auto relative z-10">
        <div class="flex items-center justify-between mb-12">
          <button
            onclick={goBackToChillSelector}
            class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
          >
            <ArrowLeft class="w-5 h-5 {currentTheme.iconColor}" />
            <span>{t.back}</span>
          </button>
          <h2 class="text-2xl font-bold {currentTheme.text}">{chillCategory?.name} Stories</h2>
          <div></div>
        </div>

        {#if story}
        <div class="mb-16">
          <div class="perspective-1000 w-full max-w-lg mx-auto">
            <div 
              class="relative w-full h-96 transform-style-preserve-3d transition-all duration-700 cursor-pointer {isFlipped ? 'rotate-y-180' : ''} hover:scale-105"
              onclick={handleCardClick}
              role="button"
              tabindex="0"
              onkeydown={(e) => e.key === 'Enter' && handleCardClick()}
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
                    <span>{t.tapToReveal}</span>
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
              <span>{t.discussThis}</span>
            </button>
          </div>
        {/if}
        {/if}
        
        {#if !story}
        <div class="text-center py-12">
          <p class="{currentTheme.text} opacity-60">No story content available for this category.</p>
        </div>
        {/if}
      </div>
    </div>

{:else if currentScreen === 'gameComplete'}
  {@const SettingsIcon = settingsIcon()}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden" dir="{'ltr'}">
    <!-- Settings and Salah Timer -->
    <div class="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
      <div></div>
      <SalahTimer {currentTheme} {theme} />
    </div>
    
    <button
      onclick={() => showSettings = true}
      class="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
    >
      <SettingsIcon class="w-5 h-5 {currentTheme.iconColor}" />
    </button>
    
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-10 w-40 h-40 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
      <div class="flex items-center justify-between mb-12">
        <button
          onclick={() => currentScreen = 'gameSelector'}
          class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
        >
          <ArrowLeft class="w-5 h-5 {currentTheme.iconColor}" />
          <span>Back to Games</span>
        </button>
        <h2 class="text-3xl font-bold {currentTheme.text}">Game Complete!</h2>
        <div></div>
      </div>

      <div class="text-center mb-12">
        <div class="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Trophy class="w-12 h-12 text-white" />
        </div>
        <h3 class="text-2xl font-bold {currentTheme.text} mb-4">Congratulations!</h3>
        <p class="{currentTheme.text} opacity-70 text-lg">You've completed {currentGame?.name}</p>
      </div>

      {#if currentGame?.id === 'imanDefender'}
        <!-- Iman Defender Specific Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-6 backdrop-blur-sm text-center">
            <Clock class="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold {currentTheme.text} mb-2">Survival Time</h4>
            <p class="text-3xl font-bold {currentTheme.text}">{Math.floor(survivalTime / 1000)}s</p>
          </div>
          
          <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-6 backdrop-blur-sm text-center">
            <Target class="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold {currentTheme.text} mb-2">Accuracy</h4>
            <p class="text-3xl font-bold {currentTheme.text}">{Math.floor(accuracy * 100)}%</p>
          </div>
          
          <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-6 backdrop-blur-sm text-center">
            <Star class="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold {currentTheme.text} mb-2">Final Score</h4>
            <p class="text-3xl font-bold {currentTheme.text}">{gameScore}</p>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-6 backdrop-blur-sm text-center">
            <Shield class="w-8 h-8 text-green-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold {currentTheme.text} mb-2">Words Defeated</h4>
            <p class="text-3xl font-bold {currentTheme.text}">{hits}</p>
          </div>
          
          <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-6 backdrop-blur-sm text-center">
            <Zap class="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold {currentTheme.text} mb-2">Best Streak</h4>
            <p class="text-3xl font-bold {currentTheme.text}">{consecutiveHits}</p>
          </div>
        </div>
      {:else}
        <!-- Regular Game Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <!-- Total Points -->
          <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-6 backdrop-blur-sm text-center">
            <Star class="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold {currentTheme.text} mb-2">Total Points</h4>
            <p class="text-3xl font-bold {currentTheme.text}">{totalPoints}</p>
          </div>
          
          <!-- Questions Answered -->
          <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-6 backdrop-blur-sm text-center">
            <Check class="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <h4 class="text-lg font-semibold {currentTheme.text} mb-2">Questions</h4>
            <p class="text-3xl font-bold {currentTheme.text}">{currentQuestionIndex}</p>
          </div>
        </div>
      {/if}

      <!-- Team Scores (if multiplayer) -->
      {#if gameMode === 'team' && players.length > 0}
        <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm mb-8">
          <h3 class="text-xl font-bold {currentTheme.text} mb-6 text-center">Final Scores</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each players as player}
              <div class="p-4 rounded-xl text-center bg-gradient-to-r from-emerald-100/20 to-teal-100/20">
                <User class="w-6 h-6 {currentTheme.text} mx-auto mb-2" />
                <p class="{currentTheme.text} font-medium">{player}</p>
                <p class="{currentTheme.text} text-2xl font-bold">{teamScores[player] || 0}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <div class="text-center space-y-4">
        <button
          onclick={() => {
            currentScreen = 'gameSelector';
            resetGameState();
          }}
          class="bg-gradient-to-r from-blue-400 to-indigo-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold mr-4"
        >
          Play Again
        </button>
        <button
          onclick={() => currentScreen = 'home'}
          class="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
        >
          Home
        </button>
      </div>
    </div>
  </div>

{:else if currentScreen === 'seerahTrip'}
  <SeerahTrip onBack={() => currentScreen = 'gameSelector'} />
{:else if currentScreen === 'lastScholarStanding'}
  <LastScholarStanding 
    {currentTheme} 
    gameQuestions={gameQuestions} 
    players={roomPlayers} 
    onGameEnd={(winner) => {
      console.log('Last Scholar Standing ended, winner:', winner);
      currentScreen = 'gameSelector';
    }} 
  />
{:else if currentScreen === 'lightningIjaza'}
  <LightningIjaza 
    {currentTheme} 
    gameQuestions={gameQuestions} 
    players={roomPlayers} 
    onGameEnd={(results) => {
      console.log('Lightning Ijaza ended, results:', results);
      currentScreen = 'gameSelector';
    }} 
  />
{:else if currentScreen === 'hadithCompletion'}
  <HadithCompletion 
    {currentTheme} 
    gameQuestions={gameQuestions} 
    players={roomPlayers} 
    onGameEnd={(results) => {
      console.log('Hadith Completion ended, results:', results);
      currentScreen = 'gameSelector';
    }} 
  />
{:else if currentScreen === 'dawahChallenge'}
  <DawahChallenge 
    {currentTheme} 
    players={roomPlayers} 
    onGameEnd={(results) => {
      console.log('Dawah Challenge ended, results:', results);
      currentScreen = 'gameSelector';
    }} 
  />
{:else if currentScreen === 'gameMode'}
  {@const SettingsIcon = settingsIcon()}
  {@const BackIcon = backButtonProps.icon}
  {@const CurrentGameIcon = currentGame.icon}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden" dir="{'ltr'}">
    <!-- Settings and Salah Timer -->
    <div class="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
      <div></div>
      <SalahTimer {currentTheme} {theme} />
    </div>
    
    <button
      onclick={() => showSettings = true}
      class="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
    >
      <SettingsIcon class="w-5 h-5 {currentTheme.iconColor}" />
    </button>
    
    <!-- Background decoration -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-4xl mx-auto relative z-10">
      <div class="flex items-center justify-between mb-12">
        <button
          onclick={() => currentScreen = 'gameSelector'}
          class="flex items-center space-x-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 px-4 py-2 rounded-xl {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm"
        >
          <BackIcon class="w-5 h-5 {currentTheme.iconColor}" />
          <span>{backButtonProps.text}</span>
        </button>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-gradient-to-br {currentGame.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CurrentGameIcon class="w-8 h-8 text-white" />
          </div>
          <h2 class="text-3xl font-bold {currentTheme.text}">{currentGame?.name}</h2>
          <p class="{currentTheme.text} opacity-60">Choose Your Challenge</p>
        </div>
        <div></div>
      </div>

      <!-- Game Mode Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#if currentGame?.id === 'seerahScenarios'}
          <!-- Timeline Scramble -->
          <button
            onclick={() => selectGameMode('timelineScramble')}
            class="group bg-gradient-to-br from-amber-400 to-orange-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
          >
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Calendar class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold mb-4">Timeline Scramble</h3>
            <p class="text-sm opacity-90">Arrange Seerah events in chronological order</p>
          </button>
          
          <!-- Prophetic Decisions -->
          <button
            onclick={() => selectGameMode('propheticDecisions')}
            class="group bg-gradient-to-br from-emerald-400 to-teal-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
          >
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Lightbulb class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold mb-4">Prophetic Decisions</h3>
            <p class="text-sm opacity-90">Learn from the Prophet's ﷺ wise choices</p>
          </button>
          
        {:else if currentGame?.id === 'hadithLab'}
          <!-- Isnad Chains -->
          <button
            onclick={() => selectGameMode('isnadChains')}
            class="group bg-gradient-to-br from-violet-400 to-purple-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
          >
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Link class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold mb-4">Link the Chain</h3>
            <p class="text-sm opacity-90">Connect narrators in correct Isnad order</p>
          </button>
          
          <!-- Matn Matching -->
          <button
            onclick={() => selectGameMode('matnMatching')}
            class="group bg-gradient-to-br from-blue-400 to-indigo-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
          >
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold mb-4">Match the Matn</h3>
            <p class="text-sm opacity-90">Connect Hadith texts to their meanings</p>
          </button>
          
          <!-- Source Scholar -->
          <button
            onclick={() => selectGameMode('sourceScholar')}
            class="group bg-gradient-to-br from-teal-400 to-cyan-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
          >
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <BookOpen class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold mb-4">Source Scholar</h3>
            <p class="text-sm opacity-90">Identify the correct Hadith collections</p>
          </button>
          
        {:else if currentGame?.id === 'pillarFoundations'}
          <!-- Belief Builder -->
          <button
            onclick={() => selectGameMode('beliefBuilder')}
            class="group bg-gradient-to-br from-cyan-400 to-blue-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
          >
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Layers class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold mb-4">Belief Builder</h3>
            <p class="text-sm opacity-90">Build pillars by identifying beliefs</p>
          </button>
          
          <!-- Categorization Blitz -->
          <button
            onclick={() => selectGameMode('categorizationBlitz')}
            class="group bg-gradient-to-br from-rose-400 to-pink-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
          >
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold mb-4">Categorization Blitz</h3>
            <p class="text-sm opacity-90">Quick-fire categorization challenge</p>
          </button>
          
          <!-- Asma'ul Husna Ring -->
          <button
            onclick={() => selectGameMode('asmaUlHusna')}
            class="group bg-gradient-to-br from-emerald-400 to-green-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
          >
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Star class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-xl font-bold mb-4">Asma'ul Husna Ring</h3>
            <p class="text-sm opacity-90">Spin to match Allah's beautiful names</p>
          </button>
        {/if}
      </div>
    </div>
  </div>

{:else if currentScreen === 'difficultySelector'}
  {@const BackIcon = backButtonProps?.icon || ChevronLeft}
  {@const CurrentGameIcon = currentGame?.icon || User}
  {@const LoginIcon = loginButtonProps?.icon || UserShmagh}
  {@const SettingsIcon = settingsIcon() || Settings}
  <div class="min-h-screen {currentTheme.bg} p-6 relative overflow-hidden">
    <!-- User Button - Left Side -->
    <button
      onclick={() => showAuth = true}
      class="absolute top-6 left-6 z-20 flex items-center space-x-2 {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm rounded-xl px-4 py-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300"
    >
      <LoginIcon class="w-5 h-5 {currentTheme.text}" />
      <span class="font-medium">{loginButtonProps.text}</span>
    </button>
    
    <!-- Salah Timer - Center Right -->
    <div class="absolute top-6 right-24 z-20">
      <SalahTimer {currentTheme} {theme} />
    </div>
    
    <!-- Settings Button - Far Right -->
    <button
      onclick={() => showSettings = true}
      class="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300"
    >
      <SettingsIcon class="w-5 h-5 {currentTheme.iconColor}" />
    </button>

    <!-- Back Button -->
    <button
      onclick={() => currentScreen = 'gameSelector'}
      class="absolute top-24 {$currentLanguage.direction === 'rtl' ? 'right-6' : 'left-6'} flex items-center space-x-2 {currentTheme.cardBg} {currentTheme.border} border backdrop-blur-sm rounded-xl px-4 py-2 {currentTheme.text} opacity-70 hover:opacity-100 transition-all duration-300 z-10 {$currentLanguage.direction === 'rtl' ? 'space-x-reverse' : ''}"
    >
      <BackIcon class="w-5 h-5 {currentTheme.text}" />
      <span class="font-medium">{t.back}</span>
    </button>

    <!-- Main Content -->
    <div class="pt-32 max-w-4xl mx-auto">
      <!-- Game Header -->
      <div class="text-center mb-16">
        <div class="w-20 h-20 bg-gradient-to-br {currentGame?.gradient || 'from-blue-400 to-indigo-500'} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <CurrentGameIcon class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-4xl font-bold {currentTheme.text} mb-4">{currentGame?.name}</h1>
        <p class="{currentTheme.text} opacity-70 text-lg">{t.chooseDifficulty}</p>
      </div>

      <!-- Difficulty Selection Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Easy -->
        <button
          onclick={() => startGameWithDifficulty('easy')}
          class="group bg-gradient-to-br from-green-400 to-emerald-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
        >
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-4">{t.easy}</h3>
          <p class="opacity-90 text-lg mb-4">{t.perfectForBeginners}</p>
          <div class="bg-white/20 rounded-xl p-4">
            <p class="text-sm opacity-90">• {t.basicQuestions}</p>
            <p class="text-sm opacity-90">• {t.pointsPerCorrectAnswer5}</p>
            <p class="text-sm opacity-90">• {t.greatForLearning}</p>
          </div>
        </button>

        <!-- Medium -->
        <button
          onclick={() => startGameWithDifficulty('medium')}
          class="group bg-gradient-to-br from-blue-400 to-indigo-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
        >
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-4">{t.medium}</h3>
          <p class="opacity-90 text-lg mb-4">{t.balancedChallenge}</p>
          <div class="bg-white/20 rounded-xl p-4">
            <p class="text-sm opacity-90">• {t.intermediateQuestions}</p>
            <p class="text-sm opacity-90">• {t.pointsPerCorrectAnswer10}</p>
            <p class="text-sm opacity-90">• {t.goodForPractice}</p>
          </div>
        </button>

        <!-- Hard -->
        <button
          onclick={() => startGameWithDifficulty('hard')}
          class="group bg-gradient-to-br from-red-400 to-pink-500 p-8 rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-500 text-white"
        >
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <!-- First star -->
              <path d="M8 2l1.5 3L12 6l-2.5 1L8 10l-1.5-3L4 6l2.5-1L8 2z" opacity="0.7"/>
              <!-- Second star (main) -->
              <path d="M16 8l2.5 5L24 14.5l-5.5 2.5L16 22l-2.5-5L8 14.5l5.5-2.5L16 8z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold mb-4">{t.hard}</h3>
          <p class="opacity-90 text-lg mb-4">{t.expertLevel}</p>
          <div class="bg-white/20 rounded-xl p-4">
            <p class="text-sm opacity-90">• {t.advancedQuestions}</p>
            <p class="text-sm opacity-90">• {t.pointsPerCorrectAnswer15}</p>
            <p class="text-sm opacity-90">• {t.testYourKnowledge}</p>
          </div>
        </button>

      </div>
    </div>
  </div>

{/if}

<!-- Modals -->
<SettingsModal 
  isOpen={showSettings} 
  onClose={() => showSettings = false}
  currentTheme={currentTheme}
  onThemeChange={(newTheme) => {
    theme = newTheme;
    localStorage.setItem('suhba-theme', theme);
  }}
/>

<AuthModal 
  isOpen={showAuth} 
  onClose={() => showAuth = false}
/>

<!-- Tafsir Moment Modal -->
{#if showTafsirMoment}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl p-8 backdrop-blur-sm max-w-2xl w-full">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Book class="w-8 h-8 text-white" />
        </div>
        <h3 class="text-2xl font-bold {currentTheme.text} mb-2">{$currentLanguage.code === 'ar' ? 'لحظة تفسير' : 'Tafsir Moment'}</h3>
        <p class="{currentTheme.text} opacity-60">{$currentLanguage.code === 'ar' ? 'تعلم من هذه اللحظة' : 'Learn from this moment'}</p>
      </div>
      
      <div class="space-y-4">
        <div class="bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-2xl p-6">
          <h4 class="font-semibold {currentTheme.text} mb-3">{t.explanation}</h4>
          <p class="{currentTheme.text} opacity-80 leading-relaxed">
            {tafsirContent.explanation}
          </p>
        </div>
        
        {#if tafsirContent.hadith}
          <div class="bg-gradient-to-r from-amber-100/20 to-orange-100/20 rounded-2xl p-6">
            <h4 class="font-semibold {currentTheme.text} mb-3">{t.relatedHadith}</h4>
            <p class="{currentTheme.text} opacity-80 italic leading-relaxed">
              "{tafsirContent.hadith}"
            </p>
          </div>
        {/if}
        
        {#if tafsirContent.verse}
          <div class="bg-gradient-to-r from-emerald-100/20 to-teal-100/20 rounded-2xl p-6">
            <h4 class="font-semibold {currentTheme.text} mb-3">{$currentLanguage.code === 'ar' ? 'الآية ذات الصلة' : 'Related Verse'}</h4>
            <p class="{currentTheme.text} opacity-80 leading-relaxed">
              {tafsirContent.verse}
            </p>
          </div>
        {/if}
      </div>
      
      <div class="text-center mt-8">
        <button
          onclick={closeTafsirMoment}
          class="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
        >
          Continue Learning
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Reward Notification -->
{#if showReward}
  <div class="fixed top-24 right-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in">
    <div class="flex items-center space-x-2">
      <Trophy class="w-5 h-5 {currentTheme.iconColor}" />
      <span class="font-semibold">{rewardMessage}</span>
    </div>
  </div>
{/if}

<!-- Game Help Popup -->
{#if showGameHelp && selectedHelpGame}
  {@const GameIcon = selectedHelpGame.icon}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="{currentTheme.cardBg} {currentTheme.border} border-2 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-br {selectedHelpGame.gradient} p-6 text-white relative">
        <div
          onclick={closeHelp}
          class="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
          role="button"
          tabindex="0"
        >
          <span class="text-white text-lg">×</span>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GameIcon class="w-8 h-8 text-white" />
          </div>
          <h2 class="text-2xl font-bold">{selectedHelpGame.name}</h2>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        <div class="mb-6">
          <h3 class="font-bold {currentTheme.text} mb-3">How to Play:</h3>
          <p class="{currentTheme.text} text-sm leading-relaxed opacity-80">
            {t[selectedHelpGame.nameKey + 'Desc'] || 'Game description coming soon!'}
          </p>
        </div>
        
        <!-- Game Mode Info -->
        <div class="grid grid-cols-1 gap-4 mb-6">
          {#if gameMode === 'solo' || currentScreen === 'gameSelector'}
            <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 class="font-bold text-blue-800 mb-2">Solo Play</h4>
              <p class="text-blue-700 text-sm">
                {#if selectedHelpGame.soloOnly}
                  This is a solo-only game designed for individual practice and skill building.
                {:else if selectedHelpGame.suhbaOnly}
                  This game is designed for multiplayer interaction. Switch to Suhba Mode to play with others.
                {:else}
                  Test your knowledge individually with personal scoring and progress tracking.
                {/if}
              </p>
            </div>
          {:else if gameMode === 'team' || currentScreen === 'suhbaSelector'}
            <div class="p-4 bg-green-50 border border-green-200 rounded-xl">
              <h4 class="font-bold text-green-800 mb-2">Suhba Mode</h4>
              <p class="text-green-700 text-sm">
                {#if selectedHelpGame.soloOnly}
                  This game is not available in multiplayer mode. Switch to Solo Play to enjoy it.
                {:else if selectedHelpGame.suhbaOnly}
                  Perfect! This game is designed specifically for multiplayer interaction and social gameplay.
                {:else}
                  Play with friends and family! Take turns, compete for points, and learn together.
                {/if}
              </p>
            </div>
          {/if}
        </div>
        
        <!-- Game-specific tips -->
        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <h4 class="font-bold text-yellow-800 mb-2">💡 Tips</h4>
          <div class="text-yellow-700 text-sm">
            {#if selectedHelpGame.id === 'lastScholarStanding'}
              <p>• Use power-ups wisely to survive elimination</p>
              <p>• Difficulty increases each round</p>
              <p>• Last player standing wins!</p>
            {:else if selectedHelpGame.id === 'lightningIjaza'}
              <p>• First to buzz gets to answer</p>
              <p>• Wrong answers give penalties</p>
              <p>• Speed and accuracy are key</p>
            {:else if selectedHelpGame.id === 'hadithCompletion'}
              <p>• Complete famous hadith texts</p>
              <p>• Fill in missing words carefully</p>
              <p>• Learn authentic Islamic teachings</p>
            {:else if selectedHelpGame.id === 'dawahChallenge'}
              <p>• Explain concepts to different audiences</p>
              <p>• Adapt your language to the target</p>
              <p>• Practice your dawah skills</p>
            {:else}
              <p>• Read questions carefully</p>
              <p>• Take your time to think</p>
              <p>• Learn from explanations</p>
            {/if}
          </div>
        </div>
        
        <!-- Close Button -->
        <div class="mt-6 text-center">
          <button
            onclick={closeHelp}
            class="bg-gradient-to-r {selectedHelpGame.gradient} text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Toast Notifications -->
<ToastContainer />

<!-- Connection Status Indicator - Only show during multiplayer modes -->
{#if gameMode === 'team' || currentScreen === 'suhbaSelector' || currentScreen === 'roomLobby' || currentScreen === 'createRoomGameSelector'}
  <ConnectionStatus position="top-right" size="md" />
{/if}

<!-- PWA Install Prompt -->
<InstallPrompt />
