import { writable } from 'svelte/store';
function createSalahStore() {
    const { subscribe, set, update } = writable({
        current: null,
        next: null,
        timeUntilNext: '',
        times: null
    });
    // Mock prayer times for demonstration
    // In a real app, you'd fetch these from an API based on location
    function generateMockTimes() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return {
            fajr: new Date(today.getTime() + 5 * 60 * 60 * 1000), // 5:00 AM
            dhuhr: new Date(today.getTime() + 12 * 60 * 60 * 1000 + 15 * 60 * 1000), // 12:15 PM
            asr: new Date(today.getTime() + 15 * 60 * 60 * 1000 + 30 * 60 * 1000), // 3:30 PM
            maghrib: new Date(today.getTime() + 18 * 60 * 60 * 1000 + 45 * 60 * 1000), // 6:45 PM
            isha: new Date(today.getTime() + 20 * 60 * 60 * 1000 + 15 * 60 * 1000), // 8:15 PM
        };
    }
    function findNextSalah(times) {
        const now = new Date();
        const prayers = [
            { name: 'fajr', time: times.fajr, arabicName: 'الفجر' },
            { name: 'dhuhr', time: times.dhuhr, arabicName: 'الظهر' },
            { name: 'asr', time: times.asr, arabicName: 'العصر' },
            { name: 'maghrib', time: times.maghrib, arabicName: 'المغرب' },
            { name: 'isha', time: times.isha, arabicName: 'العشاء' },
        ];
        // Find the next prayer that hasn't passed today
        for (const prayer of prayers) {
            if (prayer.time > now) {
                return prayer;
            }
        }
        // If all prayers have passed today, return tomorrow's Fajr
        const tomorrow = new Date(times.fajr);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { name: 'fajr', time: tomorrow, arabicName: 'الفجر' };
    }
    function getTimeUntilNext(nextTime) {
        const now = new Date();
        const diff = nextTime.getTime() - now.getTime();
        if (diff <= 0)
            return '0 min';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
    function updateSalahTimes() {
        const times = generateMockTimes();
        const next = findNextSalah(times);
        const timeUntilNext = getTimeUntilNext(next.time);
        set({
            current: null, // Could implement current prayer detection
            next,
            timeUntilNext,
            times
        });
    }
    // Update every minute
    let interval;
    return {
        subscribe,
        init: () => {
            updateSalahTimes();
            interval = setInterval(updateSalahTimes, 60000); // Update every minute
        },
        destroy: () => {
            if (interval)
                clearInterval(interval);
        }
    };
}
export const salahStore = createSalahStore();
