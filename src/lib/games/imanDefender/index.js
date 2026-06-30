export const imanDefender = {
    // Negative words (sins/harmful traits) and their positive counterparts
    wordPairs: [
        {
            negative: "Lying",
            arabic: "الكذب",
            positives: ["Honesty", "Truthfulness", "Sincerity", "Trust"],
            correctAnswer: "Honesty",
            islamicContext: "The Prophet ﷺ said: 'Truthfulness leads to righteousness'"
        },
        {
            negative: "Backbiting",
            arabic: "الغيبة",
            positives: ["Silence", "Praise", "Forgiveness", "Charity"],
            correctAnswer: "Silence",
            islamicContext: "Speaking good or remaining silent protects from sin"
        },
        {
            negative: "Anger",
            arabic: "الغضب",
            positives: ["Patience", "Forgiveness", "Kindness", "Prayer"],
            correctAnswer: "Patience",
            islamicContext: "The strong person controls their anger through patience"
        },
        {
            negative: "Envy",
            arabic: "الحسد",
            positives: ["Gratitude", "Contentment", "Dua", "Charity"],
            correctAnswer: "Gratitude",
            islamicContext: "Gratitude for Allah's blessings removes envy from the heart"
        },
        {
            negative: "Pride",
            arabic: "الكبر",
            positives: ["Humility", "Worship", "Service", "Gratitude"],
            correctAnswer: "Humility",
            islamicContext: "Pride prevents entry to Paradise; humility elevates the believer"
        },
        {
            negative: "Greed",
            arabic: "الطمع",
            positives: ["Charity", "Generosity", "Zakah", "Gratitude"],
            correctAnswer: "Charity",
            islamicContext: "Giving charity purifies wealth and removes greed"
        },
        {
            negative: "Hatred",
            arabic: "البغضاء",
            positives: ["Love", "Forgiveness", "Brotherhood", "Prayer"],
            correctAnswer: "Forgiveness",
            islamicContext: "Forgiving others removes hatred and brings peace to the heart"
        },
        {
            negative: "Laziness",
            arabic: "الكسل",
            positives: ["Action", "Initiative", "Worship", "Work"],
            correctAnswer: "Action",
            islamicContext: "Allah loves those who take action for good deeds"
        },
        {
            negative: "Ingratitude",
            arabic: "كفران النعمة",
            positives: ["Gratitude", "Praise", "Remembrance", "Charity"],
            correctAnswer: "Gratitude",
            islamicContext: "Gratitude increases Allah's blessings and brings contentment"
        },
        {
            negative: "Despair",
            arabic: "اليأس",
            positives: ["Hope", "Trust", "Prayer", "Patience"],
            correctAnswer: "Hope",
            islamicContext: "Never despair of Allah's mercy; He is Most Merciful"
        },
        {
            negative: "Jealousy",
            arabic: "الغيرة",
            positives: ["Acceptance", "Trust", "Prayer", "Wisdom"],
            correctAnswer: "Acceptance",
            islamicContext: "Accept Allah's decree and trust in His wisdom"
        },
        {
            negative: "Dishonesty",
            arabic: "عدم الأمانة",
            positives: ["Trustworthiness", "Integrity", "Honor", "Sincerity"],
            correctAnswer: "Trustworthiness",
            islamicContext: "The believer is known for their trustworthiness and integrity"
        },
        {
            negative: "Selfishness",
            arabic: "الأنانية",
            positives: ["Generosity", "Service", "Compassion", "Brotherhood"],
            correctAnswer: "Generosity",
            islamicContext: "The believer prefers others over themselves in goodness"
        },
        {
            negative: "Arrogance",
            arabic: "التكبر",
            positives: ["Humility", "Modesty", "Respect", "Service"],
            correctAnswer: "Humility",
            islamicContext: "Humility before Allah and creation leads to success"
        },
        {
            negative: "Ingratitude",
            arabic: "عدم الشكر",
            positives: ["Thankfulness", "Praise", "Recognition", "Appreciation"],
            correctAnswer: "Thankfulness",
            islamicContext: "Be grateful for Allah's countless blessings"
        },
        {
            negative: "Impatience",
            arabic: "عدم الصبر",
            positives: ["Patience", "Perseverance", "Trust", "Prayer"],
            correctAnswer: "Patience",
            islamicContext: "Allah is with those who are patient"
        },
        {
            negative: "Cruelty",
            arabic: "القسوة",
            positives: ["Mercy", "Kindness", "Compassion", "Gentleness"],
            correctAnswer: "Mercy",
            islamicContext: "Allah shows mercy to those who show mercy to others"
        },
        {
            negative: "Suspicion",
            arabic: "سوء الظن",
            positives: ["Trust", "Good Opinion", "Forgiveness", "Understanding"],
            correctAnswer: "Good Opinion",
            islamicContext: "Think well of others and avoid negative assumptions"
        },
        {
            negative: "Stubbornness",
            arabic: "العناد",
            positives: ["Flexibility", "Understanding", "Wisdom", "Humility"],
            correctAnswer: "Flexibility",
            islamicContext: "Be flexible in matters that don't compromise faith"
        },
        {
            negative: "Wastefulness",
            arabic: "الإسراف",
            positives: ["Moderation", "Conservation", "Gratitude", "Wisdom"],
            correctAnswer: "Moderation",
            islamicContext: "Eat and drink but do not be wasteful"
        }
    ]
};
// Random names for solo mode
export const randomNames = [
    "Ahmad", "Ali", "Omar", "Yusuf", "Ibrahim", "Ismail", "Musa", "Isa", "Dawud", "Sulaiman",
    "Ayub", "Aisha", "Khadija", "Maryam", "Zainab", "Umm Kulthum", "Safiyyah", "Hafsa", "Amina", "Ruqayya",
    "Abdullah", "Abdul Rahman", "Abdur Rahman", "Abdul Malik", "Abdur Rahim", "Khalid", "Hamza", "Bilal", "Salman", "Abu Bakr"
];
// Get random name from the list
export function getRandomName(excludeNames = []) {
    const availableNames = randomNames.filter(name => !excludeNames.includes(name));
    return availableNames[Math.floor(Math.random() * availableNames.length)];
}
// Get random names for questions based on mode
export function getQuestionNames(gameMode, players = [], questionData = {}) {
    if (gameMode === 'solo') {
        // For solo mode, use random names
        const name1 = getRandomName();
        const name2 = getRandomName([name1]);
        return {
            character: questionData.character || name1,
            questioner: questionData.questioner || name1,
            mufti: questionData.mufti === 'you' ? name2 : (questionData.mufti || name2)
        };
    }
    else {
        // For multiplayer mode, use player names
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
        return {
            character: questionData.character || shuffledPlayers[0],
            questioner: questionData.questioner || shuffledPlayers[0],
            mufti: questionData.mufti === 'you' ? shuffledPlayers[1] : (questionData.mufti || shuffledPlayers[1])
        };
    }
}
