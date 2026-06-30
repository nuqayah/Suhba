// Main game content aggregator - imports from separate game modules
import { fiqhMaster } from './games/fiqhMaster/index.js';
import { wisdomSeeker } from './games/wisdomSeeker/index.js';
import { imanDefender } from './games/imanDefender/index.js';
// Re-export all game content in the original structure for backward compatibility
export const newGameContent = {
    fiqhMaster,
    wisdomSeeker,
    imanDefender
};
// Helper function to get question names - preserved from original
export function getQuestionNames() {
    return [
        'fiqhMaster',
        'wisdomSeeker',
        'imanDefender'
    ];
}
// Export individual games for direct imports (optional)
export { fiqhMaster, wisdomSeeker, imanDefender };
