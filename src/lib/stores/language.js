import { writable } from 'svelte/store';
import { browser } from '$app/environment';
export const languages = [
    { code: 'en', name: 'English', direction: 'ltr', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', direction: 'rtl', flag: '🇸🇦' }
];
const defaultLanguage = languages[0];
function createLanguageStore() {
    const { subscribe, set, update } = writable(defaultLanguage);
    return {
        subscribe,
        setLanguage: (lang) => {
            set(lang);
            if (browser) {
                localStorage.setItem('suhba-language', JSON.stringify(lang));
                document.documentElement.dir = lang.direction;
                document.documentElement.lang = lang.code;
            }
        },
        init: () => {
            if (browser) {
                const stored = localStorage.getItem('suhba-language');
                if (stored) {
                    try {
                        const lang = JSON.parse(stored);
                        set(lang);
                        document.documentElement.dir = lang.direction;
                        document.documentElement.lang = lang.code;
                    }
                    catch {
                        set(defaultLanguage);
                    }
                }
            }
        }
    };
}
export const currentLanguage = createLanguageStore();
