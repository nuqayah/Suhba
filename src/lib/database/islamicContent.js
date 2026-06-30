// Islamic Content Database Service for Suhba
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { surahs, verses, hadithCollections, hadiths, islamicFigures, games, gameQuestions, questionOptions } from './schema.js';
import { eq, and, like } from 'drizzle-orm';
// Database connection (this would be configured based on environment)
const sqlite = new Database(':memory:'); // In-memory for now, use file path in production
export const db = drizzle(sqlite);
// Islamic Content Service
export class IslamicContentService {
    // Quran methods
    async getAllSurahs() {
        return await db.select().from(surahs).orderBy(surahs.number);
    }
    async getSurah(number) {
        const result = await db.select().from(surahs).where(eq(surahs.number, number));
        return result[0];
    }
    async getVersesBySurah(surahId) {
        return await db.select().from(verses)
            .where(eq(verses.surahId, surahId))
            .orderBy(verses.number);
    }
    async getVerse(surahNumber, verseNumber) {
        const surah = await this.getSurah(surahNumber);
        if (!surah)
            return undefined;
        const result = await db.select().from(verses)
            .where(and(eq(verses.surahId, surah.id), eq(verses.number, verseNumber)));
        return result[0];
    }
    async searchQuran(query, language = 'en') {
        const searchColumn = language === 'ar' ? verses.textArabic : verses.textTranslation;
        return await db.select().from(verses)
            .where(like(searchColumn, `%${query}%`))
            .limit(50);
    }
    // Hadith methods
    async getAllHadithCollections() {
        return await db.select().from(hadithCollections);
    }
    async getHadithsByCollection(collectionId) {
        return await db.select().from(hadiths)
            .where(eq(hadiths.collectionId, collectionId));
    }
    async searchHadiths(query, language = 'en') {
        const searchColumn = language === 'ar' ? hadiths.textArabic : hadiths.textTranslation;
        return await db.select().from(hadiths)
            .where(like(searchColumn, `%${query}%`))
            .limit(50);
    }
    // Game content methods
    async getGameQuestions(gameType, difficulty) {
        const gameResult = await db.select().from(games).where(eq(games.type, gameType));
        if (!gameResult.length)
            return [];
        let query = db.select().from(gameQuestions).where(eq(gameQuestions.gameId, gameResult[0].id));
        if (difficulty) {
            query = query.where(eq(gameQuestions.difficulty, difficulty));
        }
        return await query;
    }
    async getQuestionWithOptions(questionId) {
        const question = await db.select().from(gameQuestions)
            .where(eq(gameQuestions.id, questionId));
        if (!question.length)
            return null;
        const options = await db.select().from(questionOptions)
            .where(eq(questionOptions.questionId, questionId))
            .orderBy(questionOptions.orderIndex);
        return {
            ...question[0],
            options
        };
    }
    async getRandomQuestion(gameType, difficulty, excludeIds = []) {
        const gameResult = await db.select().from(games).where(eq(games.type, gameType));
        if (!gameResult.length)
            return null;
        // This is simplified - in production you'd use proper random selection
        const questions = await db.select().from(gameQuestions)
            .where(and(eq(gameQuestions.gameId, gameResult[0].id), eq(gameQuestions.difficulty, difficulty)));
        const availableQuestions = questions.filter(q => !excludeIds.includes(q.id));
        if (!availableQuestions.length)
            return null;
        const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        return await this.getQuestionWithOptions(randomQuestion.id);
    }
    // Islamic figures methods
    async getAllIslamicFigures() {
        return await db.select().from(islamicFigures).orderBy(islamicFigures.name);
    }
    async getIslamicFiguresByCategory(category) {
        return await db.select().from(islamicFigures)
            .where(eq(islamicFigures.category, category));
    }
    async searchIslamicFigures(query) {
        return await db.select().from(islamicFigures)
            .where(like(islamicFigures.name, `%${query}%`));
    }
    // Data seeding methods (for migration)
    async seedQuranData(quranData) {
        // Implementation would parse and insert Quran data
        console.log('Seeding Quran data...');
        // This would process the quran.txt file
    }
    async seedTafsirData(tafsirData) {
        // Implementation would parse and insert Tafsir data
        console.log('Seeding Tafsir data...');
        // This would process the almuyassar-ghareeb.json file
    }
    async seedGameQuestions(gameType, questionsData) {
        console.log(`Seeding ${gameType} questions...`);
        // First, ensure the game exists
        let game = await db.select().from(games).where(eq(games.type, gameType));
        if (!game.length) {
            const gameResult = await db.insert(games).values({
                name: this.getGameDisplayName(gameType),
                type: gameType,
                description: `Islamic ${gameType} trivia game`,
                createdAt: new Date()
            }).returning();
            game = gameResult;
        }
        // Insert questions
        for (const [difficulty, questions] of Object.entries(questionsData)) {
            for (const question of questions) {
                const questionResult = await db.insert(gameQuestions).values({
                    gameId: game[0].id,
                    prompt: question.prompt,
                    promptArabic: question.prompt_ar,
                    difficulty,
                    category: question.category,
                    explanation: question.explanation,
                    explanationArabic: question.explanation_ar,
                    hadithReference: question.hadith,
                    hadithReferenceArabic: question.hadith_ar,
                    sources: JSON.stringify(question.sources || []),
                    scholarlyOpinion: question.scholarly_opinion,
                    createdAt: new Date()
                }).returning();
                // Insert options
                for (let i = 0; i < question.options.length; i++) {
                    await db.insert(questionOptions).values({
                        questionId: questionResult[0].id,
                        optionText: question.options[i],
                        optionTextArabic: question.options_ar?.[i] || question.options[i],
                        isCorrect: question.correct === i,
                        orderIndex: i,
                        createdAt: new Date()
                    });
                }
            }
        }
    }
    getGameDisplayName(gameType) {
        switch (gameType) {
            case 'fiqh_master': return 'Fiqh Master';
            case 'wisdom_seeker': return 'Wisdom Seeker';
            case 'iman_defender': return 'Iman Defender';
            default: return gameType;
        }
    }
    // Statistics and analytics
    async getGameStats(gameType) {
        const game = await db.select().from(games).where(eq(games.type, gameType));
        if (!game.length)
            return null;
        const questionCount = await db.select().from(gameQuestions)
            .where(eq(gameQuestions.gameId, game[0].id));
        return {
            gameName: game[0].name,
            totalQuestions: questionCount.length,
            difficulties: {
                easy: questionCount.filter(q => q.difficulty === 'easy').length,
                medium: questionCount.filter(q => q.difficulty === 'medium').length,
                hard: questionCount.filter(q => q.difficulty === 'hard').length
            }
        };
    }
    async getAllStats() {
        const allGames = await db.select().from(games);
        const stats = await Promise.all(allGames.map(game => this.getGameStats(game.type)));
        return stats.filter(Boolean);
    }
}
// Export singleton instance
export const islamicContentService = new IslamicContentService();
// Migration helper to populate database from existing files
export class ContentMigration {
    async migrateFromFiles() {
        console.log('🕌 Starting Islamic content migration...');
        try {
            // Migrate game content from the restructured files
            await this.migrateGameContent();
            // TODO: Migrate Quran and Hadith content from data files
            // await this.migrateQuranContent();
            // await this.migrateHadithContent();
            console.log('✅ Migration completed successfully');
        }
        catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    }
    async migrateGameContent() {
        // Import the restructured game content
        const { fiqhMaster } = await import('../games/fiqhMaster/index.js');
        const { wisdomSeeker } = await import('../games/wisdomSeeker/index.js');
        const { imanDefender } = await import('../games/imanDefender/index.js');
        // Migrate each game type
        await islamicContentService.seedGameQuestions('fiqh_master', fiqhMaster);
        await islamicContentService.seedGameQuestions('wisdom_seeker', wisdomSeeker);
        await islamicContentService.seedGameQuestions('iman_defender', imanDefender);
    }
    async migrateQuranContent() {
        // TODO: Parse and migrate data/quran.txt
        console.log('Migrating Quran content...');
    }
    async migrateHadithContent() {
        // TODO: Parse and migrate hadith data
        console.log('Migrating Hadith content...');
    }
}
export const contentMigration = new ContentMigration();
