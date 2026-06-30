// SQLite database schema for Islamic content in Suhba
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
// Core Islamic content tables
// Quran structure
export const surahs = sqliteTable('surahs', {
    id: integer('id').primaryKey(),
    number: integer('number').notNull().unique(),
    name: text('name').notNull(),
    nameArabic: text('name_arabic').notNull(),
    nameTransliteration: text('name_transliteration').notNull(),
    revelationType: text('revelation_type').notNull(), // 'meccan' | 'medinan'
    versesCount: integer('verses_count').notNull(),
    revelationOrder: integer('revelation_order'),
    meaning: text('meaning'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
export const verses = sqliteTable('verses', {
    id: integer('id').primaryKey(),
    surahId: integer('surah_id').references(() => surahs.id).notNull(),
    number: integer('number').notNull(),
    textArabic: text('text_arabic').notNull(),
    textTranslation: text('text_translation'),
    textTransliteration: text('text_transliteration'),
    sajdah: integer('sajdah', { mode: 'boolean' }).default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
// Tafsir and explanations
export const tafsir = sqliteTable('tafsir', {
    id: integer('id').primaryKey(),
    verseId: integer('verse_id').references(() => verses.id).notNull(),
    scholar: text('scholar').notNull(), // e.g., 'Al-Muyassar', 'Ibn Kathir'
    explanation: text('explanation').notNull(),
    explanationArabic: text('explanation_arabic'),
    source: text('source'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
// Hadith collections
export const hadithCollections = sqliteTable('hadith_collections', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    nameArabic: text('name_arabic').notNull(),
    compiler: text('compiler').notNull(),
    compilerArabic: text('compiler_arabic'),
    description: text('description'),
    authenticityLevel: text('authenticity_level'), // 'sahih', 'hasan', 'daif'
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
export const hadiths = sqliteTable('hadiths', {
    id: integer('id').primaryKey(),
    collectionId: integer('collection_id').references(() => hadithCollections.id).notNull(),
    bookNumber: integer('book_number'),
    hadithNumber: text('hadith_number'),
    textArabic: text('text_arabic').notNull(),
    textTranslation: text('text_translation'),
    grade: text('grade'), // Authentication grade
    chapter: text('chapter'),
    theme: text('theme'),
    context: text('context'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
// Islamic figures (Prophets, Sahabas, Scholars)
export const islamicFigures = sqliteTable('islamic_figures', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    nameArabic: text('name_arabic').notNull(),
    category: text('category').notNull(), // 'prophet', 'sahaba', 'scholar', 'tabi'
    birthYear: text('birth_year'),
    deathYear: text('death_year'),
    era: text('era'),
    region: text('region'),
    biography: text('biography'),
    biographyArabic: text('biography_arabic'),
    significance: text('significance'),
    majorWorks: text('major_works'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
// Game-specific tables
// Game questions (from our restructured content)
export const games = sqliteTable('games', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    nameArabic: text('name_arabic'),
    type: text('type').notNull(), // 'fiqh_master', 'wisdom_seeker', 'iman_defender'
    description: text('description'),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
export const gameQuestions = sqliteTable('game_questions', {
    id: integer('id').primaryKey(),
    gameId: integer('game_id').references(() => games.id).notNull(),
    prompt: text('prompt').notNull(),
    promptArabic: text('prompt_arabic'),
    difficulty: text('difficulty').notNull(), // 'easy', 'medium', 'hard'
    category: text('category'), // 'fiqh', 'aqeedah', 'hadith', etc.
    explanation: text('explanation'),
    explanationArabic: text('explanation_arabic'),
    hadithReference: text('hadith_reference'),
    hadithReferenceArabic: text('hadith_reference_arabic'),
    sources: text('sources'), // JSON array of sources
    scholarlyOpinion: text('scholarly_opinion'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
export const questionOptions = sqliteTable('question_options', {
    id: integer('id').primaryKey(),
    questionId: integer('question_id').references(() => gameQuestions.id).notNull(),
    optionText: text('option_text').notNull(),
    optionTextArabic: text('option_text_arabic'),
    isCorrect: integer('is_correct', { mode: 'boolean' }).default(false),
    orderIndex: integer('order_index').notNull(),
    explanation: text('explanation'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
// User and gameplay tables
export const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    username: text('username').notNull().unique(),
    email: text('email'),
    passwordHash: text('password_hash'),
    preferredLanguage: text('preferred_language').default('en'),
    themePreference: text('theme_preference').default('desert'),
    totalPoints: integer('total_points').default(0),
    gamesPlayed: integer('games_played').default(0),
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    lastLoginAt: integer('last_login_at', { mode: 'timestamp' })
});
export const gameSessions = sqliteTable('game_sessions', {
    id: integer('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    gameId: integer('game_id').references(() => games.id).notNull(),
    roomCode: text('room_code'),
    gameMode: text('game_mode').notNull(), // 'solo', 'multiplayer'
    difficulty: text('difficulty').notNull(),
    score: integer('score').default(0),
    questionsAnswered: integer('questions_answered').default(0),
    correctAnswers: integer('correct_answers').default(0),
    startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    sessionData: text('session_data'), // JSON for additional data
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
export const userResponses = sqliteTable('user_responses', {
    id: integer('id').primaryKey(),
    sessionId: integer('session_id').references(() => gameSessions.id).notNull(),
    questionId: integer('question_id').references(() => gameQuestions.id).notNull(),
    selectedOptionId: integer('selected_option_id').references(() => questionOptions.id),
    responseText: text('response_text'), // For open-ended questions
    isCorrect: integer('is_correct', { mode: 'boolean' }),
    timeTaken: integer('time_taken'), // in milliseconds
    answeredAt: integer('answered_at', { mode: 'timestamp' }).notNull()
});
// Achievements and progress
export const achievements = sqliteTable('achievements', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    nameArabic: text('name_arabic'),
    description: text('description').notNull(),
    descriptionArabic: text('description_arabic'),
    category: text('category').notNull(),
    requirement: text('requirement').notNull(), // JSON describing requirement
    rewardPoints: integer('reward_points').default(0),
    badgeIcon: text('badge_icon'),
    rarity: text('rarity').default('common'), // 'common', 'rare', 'epic', 'legendary'
    isActive: integer('is_active', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
export const userAchievements = sqliteTable('user_achievements', {
    id: integer('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    achievementId: integer('achievement_id').references(() => achievements.id).notNull(),
    unlockedAt: integer('unlocked_at', { mode: 'timestamp' }).notNull(),
    progress: real('progress').default(0), // For progressive achievements
    metadata: text('metadata') // JSON for additional data
});
// Prayer times (for integration)
export const prayerTimes = sqliteTable('prayer_times', {
    id: integer('id').primaryKey(),
    userId: integer('user_id').references(() => users.id),
    location: text('location').notNull(),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    date: text('date').notNull(), // YYYY-MM-DD format
    fajr: text('fajr').notNull(),
    dhuhr: text('dhuhr').notNull(),
    asr: text('asr').notNull(),
    maghrib: text('maghrib').notNull(),
    isha: text('isha').notNull(),
    calculationMethod: text('calculation_method'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull()
});
// Content versioning and updates
export const contentVersions = sqliteTable('content_versions', {
    id: integer('id').primaryKey(),
    contentType: text('content_type').notNull(), // 'quran', 'hadith', 'questions'
    version: text('version').notNull(),
    description: text('description'),
    releasedAt: integer('released_at', { mode: 'timestamp' }).notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(true)
});
