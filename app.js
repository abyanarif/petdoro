/**
 * PETDORO – Gamified Pomodoro Telegram Mini App
 * app.js – Vanilla JS, Modular, Mobile-First
 * =============================================
 */

'use strict';

/* ============================================================
   1. CONSTANTS & CONFIGURATION
   ============================================================ */
const CONFIG = {
    STORAGE_KEY: 'petdoro_v1',
    SUPABASE_URL: 'https://lhuvqrighlkhmjiafyre.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxodXZxcmlnaGxraG1qaWFmeXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTMxOTIsImV4cCI6MjEwMTE2OTE5Mn0.XNXnBhF5Xc-2ZWH__ee01rbwGUVaN50s_o5pb8NSFDQ',
    TIMER_SESSION_KEY: 'petdoro_timer_session',
    ALLOWED_ADMIN_IDS: [123456789, 987654321, 777000, 5551234], // Telegram User IDs with admin access
    SESSION_MODES: {
        focus: { label: '🎯 Focus', duration: 25 * 60, exp: 50, coins: 50, label_short: 'Focus' },
        short: { label: '☕ Short Break', duration: 5 * 60, exp: 10, coins: 5, label_short: 'Short Break' },
        long: { label: '🌙 Long Break', duration: 15 * 60, exp: 20, coins: 15, label_short: 'Long Break' },
    },
    PETS: {
        crocodile: {
            name: 'Buaya Kece',
            displayName: 'Buaya',
            cost: 0,
            stages: [
                { label: '🥚 Hatchling', image: 'animal_assets/crocodile_0.png', glowClass: 'pet-glow-0' },
                { label: '🐊 Adolescent', image: 'animal_assets/crocodile_1.png', glowClass: 'pet-glow-1' },
                { label: '🦖 Evolved', image: 'animal_assets/crocodile_2.png', glowClass: 'pet-glow-2' },
            ],
        },
        owl: {
            name: 'Burung Hantu Bijak',
            displayName: 'Burung Hantu',
            cost: 0,
            stages: [
                { label: '🥚 Hatchling', image: 'animal_assets/owl_0.png', glowClass: 'pet-glow-0' },
                { label: '🦉 Adolescent', image: 'animal_assets/owl_1.png', glowClass: 'pet-glow-1' },
                { label: '🌙 Evolved', image: 'animal_assets/owl_2.png', glowClass: 'pet-glow-2' },
            ],
        },
        cat: {
            name: 'Kucing Imut',
            displayName: 'Kucing',
            cost: 300,
            stages: [
                { label: '🥚 Hatchling', image: 'animal_assets/cat_0.png', glowClass: 'pet-glow-0' },
                { label: '🐱 Kitten', image: 'animal_assets/cat_1.png', glowClass: 'pet-glow-1' },
                { label: '🐈 Cat', image: 'animal_assets/cat_2.png', glowClass: 'pet-glow-2' },
                { label: '👑 Evolved', image: 'animal_assets/cat_3.png', glowClass: 'pet-glow-2' },
            ],
        },
        dragon: {
            name: 'Naga Api',
            displayName: 'Naga',
            cost: 1000,
            stages: [
                { label: '🥚 Hatchling', image: 'animal_assets/dragon_0.png', glowClass: 'pet-glow-0' },
                { label: '🐉 Drake', image: 'animal_assets/dragon_1.png', glowClass: 'pet-glow-1' },
                { label: '🦖 Wyvern', image: 'animal_assets/dragon_2.png', glowClass: 'pet-glow-2' },
                { label: '🔥 Evolved', image: 'animal_assets/dragon_3.png', glowClass: 'pet-glow-2' },
            ],
        },
    },
    EXP_PER_STAGE: [100, 250, 500, 999999], // EXP needed to reach next stage
    TIPS: [
        'Mulai sesi fokus untuk merawat hewan peliharaanmu! 🐾',
        'Hewan peliharaanmu butuh 25 menit fokus untuk naik level! ⚡',
        'Streak harian membuat hewan lebih bahagia! 🔥',
        'Selesaikan 4 sesi fokus lalu ambil long break! 🌙',
        'Hindari distraksi saat timer berjalan! 🎯',
        'Petdoro = Pet + Pomodoro. Belajar sambil rawat pet! 🍅',
    ],
    ACHIEVEMENTS: [
        { id: 'first_session', icon: '🍅', title: 'Sesi Pertama', desc: 'Selesaikan 1 sesi fokus', check: s => s.totalSessions >= 1 },
        { id: 'sessions_5', icon: '🔥', title: 'On Fire!', desc: 'Selesaikan 5 sesi fokus', check: s => s.totalSessions >= 5 },
        { id: 'sessions_25', icon: '🎖️', title: 'Dedicated', desc: 'Selesaikan 25 sesi fokus', check: s => s.totalSessions >= 25 },
        { id: 'streak_3', icon: '📅', title: '3 Hari Streak', desc: 'Fokus 3 hari berturut-turut', check: s => s.maxStreak >= 3 },
        { id: 'streak_7', icon: '🗓️', title: 'Seminggu Penuh', desc: 'Fokus 7 hari berturut-turut', check: s => s.maxStreak >= 7 },
        { id: 'pet_evolve', icon: '✨', title: 'Evolusi!', desc: 'Tingkatkan hewan ke stadium 2', check: s => s.pets.crocodile.stage >= 1 || s.pets.owl.stage >= 1 },
        { id: 'pet_max', icon: '🏆', title: 'Pet Master', desc: 'Capai evolusi tertinggi', check: s => s.pets.crocodile.stage >= 2 || s.pets.owl.stage >= 2 },
        { id: 'coins_100', icon: '🪙', title: 'Kolektor Koin', desc: 'Kumpulkan 100 koin total', check: s => s.totalCoins >= 100 },
    ],
    MOODS: {
        idle: { emoji: '😴', text: 'Mengantuk...' },
        happy: { emoji: '😊', text: 'Senang!' },
        excited: { emoji: '🤩', text: 'Semangat!' },
        running: { emoji: '💪', text: 'Fokus bareng!' },
        break: { emoji: '😌', text: 'Santai dulu~' },
        petted: { emoji: '😍', text: 'Manja!' },
    },
    DAILY_QUESTS: [
        {
            id: 'quest_session',
            icon: '🎯',
            title: 'Focus Pioneer',
            desc: 'Lengkapi 1 Sesi Fokus Hari Ini',
            reward: 20,
            target: 1,
            unit: 'sesi',
            getProgress: (s, dq) => s.todaySessions || 0,
        },
        {
            id: 'quest_time',
            icon: '⏱️',
            title: 'Time Master',
            desc: 'Kumpulkan 50 menit waktu fokus hari ini',
            reward: 50,
            target: 50,
            unit: 'menit',
            getProgress: (s, dq) => dq.todayMinutes || 0,
        },
        {
            id: 'quest_streak',
            icon: '🔥',
            title: 'Streak Guardian',
            desc: 'Pertahankan 3-Day Streak',
            reward: 100,
            target: 3,
            unit: 'hari',
            getProgress: (s, dq) => s.streak || 0,
        },
    ],
};

const REDEEM_CODES = {
    'WELCOMEPETDORO': { coins: 300, unlockPet: 'cat', title: '+300 Coins (Cat Unlocked)' },
    'DRAGONLORD': { coins: 1000, unlockPet: 'dragon', title: '+1000 Coins (Dragon Unlocked)' },
    'TEMANNUGAS': { coins: 150, unlockPet: null, title: '+150 Coins' },
    'BYANKEREN': { coins: 500, unlockPet: null, title: '+500 Coins' },
};

/* ============================================================
   2. STATE MANAGEMENT
   ============================================================ */
const DEFAULT_STATE = () => ({
    user: { name: 'Trainer', photoUrl: '' },
    activePet: null,                             // null for new users until chosen during onboarding
    unlockedPets: ['crocodile', 'owl'],
    petCustomNames: { crocodile: '', owl: '', cat: '', dragon: '' }, // custom names per pet
    onboardingDone: false,                       // first-run flag
    pets: {
        crocodile: { name: 'Buaya Kece', stage: 0, level: 1, exp: 0, maxExp: 100 },
        owl: { name: 'Burung Hantu Bijak', stage: 0, level: 1, exp: 0, maxExp: 100 },
        cat: { name: 'Kucing Imut', stage: 0, level: 1, exp: 0, maxExp: 100 },
        dragon: { name: 'Naga Api', stage: 0, level: 1, exp: 0, maxExp: 100 },
    },
    totalSessions: 0,
    todaySessions: 0,
    totalMinutes: 0,
    totalCoins: 0,
    coins: 0,
    streak: 0,
    maxStreak: 0,
    lastActiveDate: null,
    settings: { sound: true, vibration: true },
    weeklyData: [0, 0, 0, 0, 0, 0, 0], // Mon-Sun
    unlockedAchievements: [],
    tipDismissed: false,
    redeemedCodes: [],                           // list of claimed code strings
    currentSubjectTag: 'Coding',
    currentTaskNote: '',
    subjectStats: { Coding: 0, Math: 0, Thesis: 0, General: 0 },
    dailyQuests: {
        date: new Date().toDateString(),
        todayMinutes: 0,
        claimed: { quest_session: false, quest_time: false, quest_streak: false }
    },
});

let state = DEFAULT_STATE();

let supabaseClient = null;

function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    if (window.supabase && CONFIG.SUPABASE_URL && !CONFIG.SUPABASE_URL.includes('YOUR_SUPABASE_PROJECT_ID')) {
        try {
            supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        } catch (e) {
            console.warn('[Petdoro] Supabase initialization failed:', e);
        }
    }
    return supabaseClient;
}

function getNumericTelegramId() {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser && tgUser.id) {
        return parseInt(tgUser.id, 10);
    }
    let localId = localStorage.getItem('petdoro_numeric_telegram_id');
    if (!localId) {
        localId = '777000'; // Default numeric Telegram ID for testing in web browser
        localStorage.setItem('petdoro_numeric_telegram_id', localId);
    }
    return parseInt(localId, 10);
}

function getUserId() {
    return `tg_${getNumericTelegramId()}`;
}

function sanitizeLoadedState() {
    if (state.onboardingDone && !state.activePet) {
        state.activePet = 'crocodile';
    }

    if (!state.unlockedPets || !Array.isArray(state.unlockedPets)) {
        state.unlockedPets = ['crocodile', 'owl'];
    }
    if (!state.unlockedPets.includes('crocodile')) state.unlockedPets.push('crocodile');
    if (!state.unlockedPets.includes('owl')) state.unlockedPets.push('owl');

    if (!state.redeemedCodes || !Array.isArray(state.redeemedCodes)) {
        state.redeemedCodes = [];
    }

    if (!state.currentSubjectTag) state.currentSubjectTag = 'Coding';
    if (state.currentTaskNote === undefined) state.currentTaskNote = '';
    if (!state.subjectStats || typeof state.subjectStats !== 'object') {
        state.subjectStats = { Coding: 0, Math: 0, Thesis: 0, General: 0 };
    }

    const todayStr = new Date().toDateString();
    if (!state.dailyQuests || state.dailyQuests.date !== todayStr) {
        state.dailyQuests = {
            date: todayStr,
            todayMinutes: 0,
            claimed: { quest_session: false, quest_time: false, quest_streak: false }
        };
    }

    if (!state.pets) state.pets = {};
    Object.keys(CONFIG.PETS).forEach(petKey => {
        if (!state.pets[petKey]) {
            state.pets[petKey] = {
                name: CONFIG.PETS[petKey].name,
                stage: 0,
                level: 1,
                exp: 0,
                maxExp: CONFIG.EXP_PER_STAGE[0]
            };
        } else {
            const pet = state.pets[petKey];
            if (pet.stage === undefined) pet.stage = 0;
            if (pet.level === undefined) pet.level = pet.stage + 1;
            if (pet.exp === undefined) pet.exp = 0;
            if (!pet.maxExp) pet.maxExp = CONFIG.EXP_PER_STAGE[pet.stage] || 100;
            if (!pet.name) pet.name = CONFIG.PETS[petKey].name;
        }
    });
}

function getTelegramUser() {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser && tgUser.id) {
        return tgUser;
    }
    return null;
}

async function loadState() {
    let localData = null;
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            localData = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('[Petdoro] Failed reading local storage state:', e);
    }

    const client = getSupabaseClient();
    const telegramId = getNumericTelegramId();
    const tgUser = getTelegramUser();

    if (client && telegramId) {
        try {
            // Fetch profile from `users` table and pets from `user_pets` table
            const { data: userRow, error: userErr } = await client
                .from('users')
                .select('*')
                .eq('telegram_id', telegramId)
                .maybeSingle();

            const { data: petRows, error: petErr } = await client
                .from('user_pets')
                .select('*')
                .eq('telegram_id', telegramId);

            if (!userErr && userRow) {
                console.log('[Petdoro] Loaded user profile & pets from Supabase for ID:', telegramId);
                state = deepMerge(DEFAULT_STATE(), localData || {});
                state.coins = userRow.coins !== undefined ? userRow.coins : (state.coins || 50);
                state.totalCoins = userRow.total_coins_earned !== undefined ? userRow.total_coins_earned : (state.totalCoins || state.coins || 50);
                state.totalSessions = userRow.total_sessions !== undefined ? userRow.total_sessions : (state.totalSessions || 0);
                state.totalMinutes = userRow.total_focus_minutes !== undefined ? userRow.total_focus_minutes : (state.totalMinutes || 0);
                state.streak = userRow.streak !== undefined ? userRow.streak : (state.streak || 0);
                state.maxStreak = userRow.max_streak !== undefined ? userRow.max_streak : (state.maxStreak || state.streak || 0);
                if (userRow.username) state.user.name = userRow.username;
                if (userRow.is_admin !== undefined) state.user.is_admin = userRow.is_admin === true;

                if (petRows && Array.isArray(petRows) && petRows.length > 0) {
                    petRows.forEach(p => {
                        const key = p.pet_key;
                        if (key && CONFIG.PETS[key]) {
                            if (!state.pets[key]) state.pets[key] = {};
                            state.pets[key].level = p.level || 1;
                            state.pets[key].exp = p.exp || 0;
                            state.pets[key].stage = p.stage !== undefined ? p.stage : Math.max(0, (p.level || 1) - 1);

                            if (p.custom_name) {
                                if (!state.petCustomNames) state.petCustomNames = {};
                                state.petCustomNames[key] = p.custom_name;
                            }

                            if (p.is_unlocked) {
                                if (!state.unlockedPets) state.unlockedPets = [];
                                if (!state.unlockedPets.includes(key)) state.unlockedPets.push(key);
                            }
                            if (p.is_active) {
                                state.activePet = key;
                            }
                        }
                    });
                }

                try {
                    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
                } catch (e) {}
            } else {
                // Brand new user -> Create initial default row in users table & user_pets table (50 coins, crocodile + owl starter pets)
                console.log('[Petdoro] Initializing new user record in Supabase for ID:', telegramId);
                state = localData ? deepMerge(DEFAULT_STATE(), localData) : DEFAULT_STATE();
                if (tgUser) {
                    state.user.name = tgUser.first_name + (tgUser.last_name ? ' ' + tgUser.last_name : '');
                }
                if (state.coins === undefined || state.coins === 0) state.coins = 50;
                sanitizeLoadedState();

                const username = state.user.name || 'Trainer';
                await client.from('users').upsert({
                    telegram_id: telegramId,
                    username: username,
                    coins: state.coins || 50,
                    total_coins_earned: state.totalCoins || 50,
                    total_sessions: state.totalSessions || 0,
                    total_focus_minutes: state.totalMinutes || 0,
                    streak: state.streak || 0,
                    max_streak: state.maxStreak || 0,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'telegram_id' });

                const defaultPets = [
                    { telegram_id: telegramId, pet_key: 'crocodile', level: 1, exp: 0, stage: 0, is_unlocked: true, is_active: true },
                    { telegram_id: telegramId, pet_key: 'owl', level: 1, exp: 0, stage: 0, is_unlocked: true, is_active: false },
                    { telegram_id: telegramId, pet_key: 'cat', level: 1, exp: 0, stage: 0, is_unlocked: false, is_active: false },
                    { telegram_id: telegramId, pet_key: 'dragon', level: 1, exp: 0, stage: 0, is_unlocked: false, is_active: false },
                ];
                await client.from('user_pets').upsert(defaultPets, { onConflict: 'telegram_id,pet_key' });
            }
        } catch (e) {
            console.warn('[Petdoro] Supabase load error, using local fallback state:', e);
            state = localData ? deepMerge(DEFAULT_STATE(), localData) : DEFAULT_STATE();
        }
    } else {
        state = localData ? deepMerge(DEFAULT_STATE(), localData) : DEFAULT_STATE();
    }

    sanitizeLoadedState();
    AdminGuard.updateUIVisibility();
}

function saveState() {
    // 1. Save to local storage immediately for zero UI latency
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('[Petdoro] Failed saving to local storage:', e);
    }

    // 2. Async push to Supabase `users` and `user_pets` tables
    const client = getSupabaseClient();
    const telegramId = getNumericTelegramId();
    const tgUser = getTelegramUser();

    if (client && telegramId) {
        const username = state.user?.name || tgUser?.first_name || 'Trainer';

        const userPromise = client.from('users').upsert({
            telegram_id: telegramId,
            username: username,
            coins: state.coins || 0,
            total_coins_earned: state.totalCoins || state.coins || 0,
            total_sessions: state.totalSessions || 0,
            total_focus_minutes: state.totalMinutes || 0,
            streak: state.streak || 0,
            max_streak: state.maxStreak || 0,
            last_active_date: state.lastActiveDate || new Date().toISOString(),
            updated_at: new Date().toISOString()
        }, { onConflict: 'telegram_id' });

        const petsToUpsert = Object.keys(CONFIG.PETS).map(petKey => {
            const petObj = state.pets[petKey] || {};
            const customName = state.petCustomNames?.[petKey] || '';
            return {
                telegram_id: telegramId,
                pet_key: petKey,
                custom_name: customName,
                level: petObj.level || (petObj.stage + 1) || 1,
                exp: petObj.exp || 0,
                stage: petObj.stage || 0,
                is_unlocked: (state.unlockedPets || []).includes(petKey),
                is_active: state.activePet === petKey,
                updated_at: new Date().toISOString()
            };
        });

        const petsPromise = client.from('user_pets').upsert(petsToUpsert, { onConflict: 'telegram_id,pet_key' });

        Promise.all([userPromise, petsPromise])
            .then(([uRes, pRes]) => {
                if (!uRes.error && !pRes.error) {
                    UI.showSyncSuccess();
                } else {
                    console.warn('[Petdoro] Supabase sync warning:', uRes.error || pRes.error);
                }
            })
            .catch(err => {
                console.warn('[Petdoro] Supabase sync exception:', err);
            });
    }
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

/* ============================================================
   2b. REWARD & FORMULA HELPERS
   ============================================================ */
function calculateCoinsAndExp(durationMinutes, mode = 'focus') {
    if (mode !== 'focus') {
        const coins = mode === 'short' ? 5 : 15;
        const exp = mode === 'short' ? 10 : 20;
        return { coins, exp, isDeepWork: false };
    }
    const baseCoins = durationMinutes * 2;
    const isDeepWork = durationMinutes >= 45;
    const coins = isDeepWork ? Math.floor(baseCoins * 1.2) : baseCoins;
    const exp = durationMinutes * 2;
    return { coins, exp, isDeepWork };
}

function updateRewardEstimate() {
    const ts = Timer.getState();
    const durationMin = Math.max(1, Math.round(ts.totalTime / 60));
    const rewards = calculateCoinsAndExp(durationMin, ts.mode);

    const coinsText = document.getElementById('est-coins-text');
    const deepWorkBadge = document.getElementById('deep-work-badge');

    if (coinsText) {
        coinsText.textContent = `${rewards.coins} Koin`;
    }
    if (deepWorkBadge) {
        if (rewards.isDeepWork) {
            deepWorkBadge.classList.remove('hidden');
        } else {
            deepWorkBadge.classList.add('hidden');
        }
    }
}

/* ============================================================
   3. TIMER MODULE
   ============================================================ */
const Timer = (() => {
    let interval = null;
    let remaining = 25 * 60;
    let totalTime = 25 * 60;
    let mode = 'focus';
    let isRunning = false;
    let onTick = null;
    let onComplete = null;

    function saveSessionState() {
        if (!isRunning) {
            clearSessionState();
            return;
        }
        const sessionData = {
            mode,
            isRunning: true,
            remainingSeconds: remaining,
            totalSeconds: totalTime,
            targetEndTime: Date.now() + (remaining * 1000),
            subjectTag: state.currentSubjectTag || 'Coding',
            taskNote: state.currentTaskNote || ''
        };
        try {
            localStorage.setItem(CONFIG.TIMER_SESSION_KEY, JSON.stringify(sessionData));
        } catch (e) {}
    }

    function clearSessionState() {
        try {
            localStorage.removeItem(CONFIG.TIMER_SESSION_KEY);
        } catch (e) {}
    }

    function setMode(newMode) {
        if (isRunning) stop();
        mode = newMode;
        const cfg = CONFIG.SESSION_MODES[newMode] || CONFIG.SESSION_MODES.focus;
        remaining = cfg.duration;
        totalTime = cfg.duration;
        clearSessionState();
        if (onTick) onTick(remaining, totalTime, false);
    }

    function setDuration(durationSeconds, newMode = 'focus') {
        if (isRunning) stop();
        mode = newMode;
        remaining = durationSeconds;
        totalTime = durationSeconds;
        clearSessionState();
        if (onTick) onTick(remaining, totalTime, false);
    }

    function start(tickCb, completeCb) {
        if (isRunning) return;
        isRunning = true;
        onTick = tickCb;
        onComplete = completeCb;
        saveSessionState();
        interval = setInterval(() => {
            remaining--;
            saveSessionState();
            if (onTick) onTick(remaining, totalTime, true);
            if (remaining <= 0) {
                stop();
                if (onComplete) onComplete(mode);
            }
        }, 1000);
    }

    function pause() {
        if (!isRunning) return;
        isRunning = false;
        clearInterval(interval);
        interval = null;
        clearSessionState();
        if (onTick) onTick(remaining, totalTime, false);
    }

    function stop() {
        isRunning = false;
        clearInterval(interval);
        interval = null;
        clearSessionState();
    }

    function reset() {
        stop();
        remaining = totalTime;
        clearSessionState();
        if (onTick) onTick(remaining, totalTime, false);
    }

    function getState() {
        return { remaining, totalTime, mode, isRunning };
    }

    return { setMode, setDuration, start, pause, stop, reset, getState };
})();

/* ============================================================
   4. LOTTIE MANAGER
   ============================================================ */
const LottieManager = (() => {
    const instances = {};

    function load(containerId, path, options = {}) {
        if (instances[containerId]) {
            instances[containerId].destroy();
            delete instances[containerId];
        }
        const container = document.getElementById(containerId);
        if (!container) return null;

        const instance = lottie.loadAnimation({
            container,
            renderer: 'svg',
            loop: options.loop !== undefined ? options.loop : true,
            autoplay: options.autoplay !== undefined ? options.autoplay : true,
            path,
        });

        instances[containerId] = instance;
        return instance;
    }

    function play(containerId) {
        instances[containerId]?.play();
    }

    function stop(containerId) {
        instances[containerId]?.stop();
    }

    function destroy(containerId) {
        if (instances[containerId]) {
            instances[containerId].destroy();
            delete instances[containerId];
        }
    }

    function has(containerId) {
        return !!instances[containerId];
    }

    return { load, play, stop, destroy, has };
})();

/* ============================================================
   5. UI MODULE – DOM REFERENCES & RENDERERS
   ============================================================ */
const UI = (() => {

    // ── DOM REFS ──────────────────────────────────────────────
    const els = {
        userAvatar: () => document.getElementById('user-avatar'),
        userName: () => document.getElementById('user-name'),
        streakText: () => document.getElementById('streak-text'),
        coinsDisplay: () => document.getElementById('coins-display'),
        expDisplay: () => document.getElementById('exp-display'),
        levelDisplay: () => document.getElementById('level-display'),
        xpBar: () => document.getElementById('xp-bar'),
        xpText: () => document.getElementById('xp-text'),
        petImage: () => document.getElementById('pet-image'),
        petStageBadge: () => document.getElementById('pet-stage-badge'),
        petNameBadge: () => document.getElementById('pet-name-badge'),
        petMood: () => document.getElementById('pet-mood'),
        timerDisplay: () => document.getElementById('timer-display'),
        timerMinutes: () => document.getElementById('timer-minutes'),
        timerSeconds: () => document.getElementById('timer-seconds'),
        btnPlay: () => document.getElementById('btn-play'),
        btnPause: () => document.getElementById('btn-pause'),
        btnReset: () => document.getElementById('btn-reset'),
        btnPet: () => document.getElementById('btn-pet'),
        btnSettings: () => document.getElementById('btn-settings'),
        sessionDots: () => document.getElementById('session-dots'),
        statSessions: () => document.getElementById('stat-sessions'),
        statMinutes: () => document.getElementById('stat-minutes'),
        statLevel: () => document.getElementById('stat-level'),
        tipCard: () => document.getElementById('tip-card'),
        tipText: () => document.getElementById('tip-text'),
        tipDismiss: () => document.getElementById('btn-dismiss-tip'),
        lottiesSandclock: () => document.getElementById('lottie-sandclock'),
        auraRing: () => document.getElementById('aura-ring'),
        // Overlays
        overlayComplete: () => document.getElementById('overlay-complete'),
        completeLottie: () => document.getElementById('lottie-complete'),
        completeTitle: () => document.getElementById('complete-title'),
        completeSubtitle: () => document.getElementById('complete-subtitle'),
        completeEmoji: () => document.getElementById('complete-emoji'),
        rewardCoins: () => document.getElementById('reward-coins'),
        rewardExp: () => document.getElementById('reward-exp'),
        btnContinue: () => document.getElementById('btn-continue'),
        overlayLevelup: () => document.getElementById('overlay-levelup'),
        levelupLottie: () => document.getElementById('lottie-levelup'),
        levelupSubtitle: () => document.getElementById('levelup-subtitle'),
        levelupBefore: () => document.getElementById('levelup-before'),
        levelupAfter: () => document.getElementById('levelup-after'),
        btnLevelupOk: () => document.getElementById('btn-levelup-ok'),
        modalSettings: () => document.getElementById('modal-settings'),
        settingsBackdrop: () => document.getElementById('settings-backdrop'),
        toggleSound: () => document.getElementById('toggle-sound'),
        toggleVibration: () => document.getElementById('toggle-vibration'),
        btnResetData: () => document.getElementById('btn-reset-data'),
        toast: () => document.getElementById('toast'),
        toastIcon: () => document.getElementById('toast-icon'),
        toastMessage: () => document.getElementById('toast-message'),
        // Nav
        navItems: () => document.querySelectorAll('.nav-item'),
        pageHome: () => document.getElementById('page-home'),
        pageShop: () => document.getElementById('page-shop'),
        pageStats: () => document.getElementById('page-stats'),
        sessionBtns: () => document.querySelectorAll('.session-btn'),
        // Shop
        petCardCroc: () => document.getElementById('pet-card-crocodile'),
        petCardOwl: () => document.getElementById('pet-card-owl'),
        btnSelectCroc: () => document.getElementById('btn-select-crocodile'),
        btnSelectOwl: () => document.getElementById('btn-select-owl'),
        crocXpBar: () => document.getElementById('croc-xp-bar'),
        crocXpText: () => document.getElementById('croc-xp-text'),
        owlXpBar: () => document.getElementById('owl-xp-bar'),
        owlXpText: () => document.getElementById('owl-xp-text'),
        crocLevelBadge: () => document.getElementById('croc-level-badge'),
        owlLevelBadge: () => document.getElementById('owl-level-badge'),
        crocEvo: () => [0, 1, 2].map(i => document.getElementById(`croc-evo-${i}`)),
        owlEvo: () => [0, 1, 2].map(i => document.getElementById(`owl-evo-${i}`)),
        // Stats page
        bigStatSessions: () => document.getElementById('big-stat-sessions'),
        bigStatMinutes: () => document.getElementById('big-stat-minutes'),
        bigStatCoins: () => document.getElementById('big-stat-coins'),
        bigStatStreak: () => document.getElementById('big-stat-streak'),
        achievementsList: () => document.getElementById('achievements-list'),
        weeklyChart: () => document.getElementById('weekly-chart'),
    };

    // ── HEADER ────────────────────────────────────────────────
    function renderHeader() {
        const petKey = state.activePet;
        const petData = state.pets[petKey] || { stage: 0, level: 1, exp: 0, maxExp: 100 };
        const stageIdx = petData.stage;
        const maxExp = petData.maxExp || CONFIG.EXP_PER_STAGE[stageIdx];
        const expPct = Math.min(100, (petData.exp / maxExp) * 100);
        const level = petData.level || (stageIdx + 1);

        els.coinsDisplay().textContent = state.coins;
        els.expDisplay().textContent = petData.exp;
        els.levelDisplay().textContent = level;
        els.xpBar().style.width = `${expPct}%`;
        els.xpText().textContent = `${petData.exp}/${maxExp} XP`;
        els.streakText().textContent = `🔥 ${state.streak} day streak`;
        els.statSessions().textContent = state.totalSessions;
        els.statMinutes().textContent = state.totalMinutes;
        els.statLevel().textContent = level;

        // Sync settings modal current pet name
        const customName = (state.petCustomNames?.[petKey] || '').trim();
        const settingsNameEl = document.getElementById('settings-pet-current-name');
        if (settingsNameEl) settingsNameEl.textContent = customName || '–';
    }

    // ── PET ───────────────────────────────────────────────────
    function renderPet() {
        const petKey = state.activePet;
        const petData = state.pets[petKey] || { stage: 0, level: 1, exp: 0, maxExp: 100 };
        const petCfg = CONFIG.PETS[petKey];
        const stageCfg = petCfg.stages[petData.stage];
        const customName = (state.petCustomNames?.[petKey] || '').trim();

        const img = els.petImage();
        img.src = stageCfg.image;
        img.className = `w-full h-full object-contain drop-shadow-2xl transition-all duration-500 animate-float ${stageCfg.glowClass}`;

        els.petStageBadge().textContent = stageCfg.label;

        // Update new pet-info-line elements
        const speciesEl = document.getElementById('pet-species-label');
        const levelEl = document.getElementById('pet-level-label');
        const nameEl = document.getElementById('pet-custom-name');
        if (speciesEl) speciesEl.textContent = petCfg.name;
        if (levelEl) levelEl.textContent = `Lv. ${petData.level || (petData.stage + 1)}`;
        if (nameEl) nameEl.textContent = customName || '–';
    }

    // ── TIMER ─────────────────────────────────────────────────
    function renderTimer(remaining, total, isRunning) {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        const mEl = els.timerMinutes();
        const sEl = els.timerSeconds();
        const dEl = els.timerDisplay();

        mEl.textContent = String(m).padStart(2, '0');
        sEl.textContent = String(s).padStart(2, '0');

        // Update SVG Progress Ring
        const ringEl = document.getElementById('timer-progress-ring');
        if (ringEl) {
            const radius = 44;
            const circumference = 2 * Math.PI * radius; // ~276.46
            const ratio = (total > 0) ? Math.max(0, Math.min(1, remaining / total)) : 1;
            const offset = circumference * (1 - ratio);
            ringEl.style.strokeDasharray = `${circumference.toFixed(2)}`;
            ringEl.style.strokeDashoffset = `${offset.toFixed(2)}`;
        }

        if (isRunning) {
            dEl.classList.add('running');
            dEl.classList.remove('paused');
        } else {
            dEl.classList.remove('running');
            if (remaining < (total || 1500)) {
                dEl.classList.add('paused');
            } else {
                dEl.classList.remove('paused');
            }
        }
    }

    // ── PLAY/PAUSE BUTTON TOGGLE ──────────────────────────────
    function setPlayPauseState(isRunning) {
        const play = els.btnPlay();
        const pause = els.btnPause();
        if (isRunning) {
            play.classList.add('hidden');
            pause.classList.remove('hidden');
        } else {
            play.classList.remove('hidden');
            pause.classList.add('hidden');
        }
    }

    // ── TIMER RUNNING STATE & CELEBRATION ─────────────────────
    function setTimerRunningState(isRunning) {
        const ar = els.auraRing();
        const petContainer = document.getElementById('pet-container');
        if (isRunning) {
            if (ar) ar.classList.add('running');
            if (petContainer) {
                petContainer.style.opacity = '1';
                petContainer.style.pointerEvents = 'auto';
                petContainer.classList.remove('pet-happy-jump');
                petContainer.classList.add('timer-running-pet');
            }
        } else {
            if (ar) ar.classList.remove('running');
            if (petContainer) {
                petContainer.style.opacity = '1';
                petContainer.style.pointerEvents = 'auto';
                petContainer.classList.remove('timer-running-pet');
            }
        }
    }

    function triggerPetCelebration() {
        const petContainer = document.getElementById('pet-container');
        const celebLottie = document.getElementById('lottie-celebration');
        if (petContainer) {
            petContainer.classList.remove('timer-running-pet');
            petContainer.classList.add('pet-happy-jump');
        }
        if (celebLottie) {
            celebLottie.style.opacity = '1';
            LottieManager.load('lottie-celebration', 'animation_assets/success.json', { loop: true, autoplay: true });
        }
    }

    function clearPetCelebration() {
        const petContainer = document.getElementById('pet-container');
        const celebLottie = document.getElementById('lottie-celebration');
        if (petContainer) {
            petContainer.classList.remove('pet-happy-jump');
        }
        if (celebLottie) {
            celebLottie.style.opacity = '0';
            LottieManager.destroy('lottie-celebration');
        }
    }

    // ── MOOD ──────────────────────────────────────────────────
    function setMood(moodKey) {
        const mood = CONFIG.MOODS[moodKey];
        if (!mood) return;
        const el = els.petMood();
        el.textContent = mood.emoji;
        el.classList.remove('mood-pop');
        void el.offsetWidth;
        el.classList.add('mood-pop');
    }

    // ── SESSION DOTS ──────────────────────────────────────────
    function renderSessionDots() {
        const dotsEl = els.sessionDots();
        dotsEl.innerHTML = '';
        const total = 4;
        const done = state.todaySessions % 4;
        for (let i = 0; i < total; i++) {
            const dot = document.createElement('div');
            dot.className = `session-dot${i < done ? ' filled' : ''}`;
            dotsEl.appendChild(dot);
        }
    }

    // ── BUY PET STORE MECHANIC ─────────────────────────────────
    function buyPet(petKey) {
        const petCfg = CONFIG.PETS[petKey];
        if (!petCfg) return;

        const cost = petCfg.cost || 0;
        if (state.coins < cost) {
            showToast('⚠️', 'Koin tidak cukup! Selesaikan sesi fokus untuk mendapat koin.');
            return;
        }

        // Deduct coins & unlock pet
        state.coins -= cost;
        if (!state.unlockedPets) state.unlockedPets = ['crocodile', 'owl'];
        if (!state.unlockedPets.includes(petKey)) {
            state.unlockedPets.push(petKey);
        }

        saveState();
        showToast('🎉', `Berhasil membeli ${petCfg.name}!`);

        // Set active & re-render
        setActivePetUI(petKey);
        renderHeader();
        renderShop();
    }

    // ── PET SELECTION UI ───────────────────────────────────────
    function setActivePetUI(selectedPetKey) {
        if (!selectedPetKey || !CONFIG.PETS[selectedPetKey]) return;

        const isUnlocked = state.unlockedPets?.includes(selectedPetKey);
        if (isUnlocked) {
            state.activePet = selectedPetKey;
            saveState();
        }

        const cards = document.querySelectorAll('.pet-card');
        cards.forEach(card => {
            const petKey = card.dataset.pet;
            if (!petKey) return;

            const petCfg = CONFIG.PETS[petKey];
            const isOwned = state.unlockedPets?.includes(petKey);
            const isSelected = isOwned && (petKey === state.activePet);
            const petDisplayName = petCfg?.displayName || petCfg?.name || petKey;
            const btn = card.querySelector('.select-pet-btn') || card.querySelector('.buy-pet-btn');

            if (!isOwned) {
                // Pet is locked / not owned
                card.classList.remove('selected');
                if (btn) {
                    btn.className = 'buy-pet-btn select-pet-btn w-full';
                    btn.dataset.cost = petCfg?.cost || 300;
                    btn.innerHTML = `<i data-lucide="shopping-bag" class="w-4 h-4"></i> 💰 Beli (${petCfg?.cost || 300} Koin)`;
                }
            } else if (isSelected) {
                // Pet is owned AND active
                card.classList.add('selected');
                if (btn) {
                    btn.className = 'select-pet-btn w-full active-pet';
                    btn.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4"></i> Aktif!`;
                }
            } else {
                // Pet is owned BUT inactive
                card.classList.remove('selected');
                if (btn) {
                    btn.className = 'select-pet-btn w-full';
                    btn.innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> Pilih ${petDisplayName}`;
                }
            }
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Sync dashboard pet display & header
        if (typeof UI !== 'undefined' && UI.renderPet && UI.renderHeader) {
            UI.renderPet();
            UI.renderHeader();
        }
    }

    // ── PET SHOP ──────────────────────────────────────────────
    function renderShop() {
        const cards = document.querySelectorAll('.pet-card');
        cards.forEach(card => {
            const petKey = card.dataset.pet;
            if (!petKey) return;

            const petData = state.pets[petKey] || { stage: 0, level: 1, exp: 0, maxExp: 100 };
            const stage = petData.stage;
            const level = petData.level || (stage + 1);
            const exp = petData.exp;
            const maxExp = petData.maxExp || CONFIG.EXP_PER_STAGE[stage];
            const pct = Math.min(100, (exp / maxExp) * 100);

            // XP bar & text
            const xpBar = card.querySelector('.pet-xp-fill') || document.getElementById(`${petKey}-xp-bar`) || document.getElementById(`croc-xp-bar`);
            const xpText = card.querySelector('.pet-xp-text') || document.getElementById(`${petKey}-xp-text`) || document.getElementById(`croc-xp-text`);
            if (xpBar) xpBar.style.width = `${pct}%`;
            if (xpText) xpText.textContent = `${exp}/${maxExp}`;

            // Level badge
            const lvlBadge = card.querySelector('.pet-card-level-badge') || document.getElementById(`${petKey}-level-badge`);
            if (lvlBadge) lvlBadge.textContent = `Lv ${level}`;

            // Evo stages
            const evoEls = card.querySelectorAll('.evo-stage');
            evoEls.forEach((el, i) => {
                el.classList.toggle('reached', i <= stage);
            });
        });

        // Update active pet highlight classes & button labels
        setActivePetUI(state.activePet);
    }

    // ── STATS PAGE ────────────────────────────────────────────
    function renderStats() {
        els.bigStatSessions().textContent = state.totalSessions;
        els.bigStatMinutes().textContent = state.totalMinutes;
        els.bigStatCoins().textContent = state.totalCoins;
        els.bigStatStreak().textContent = state.maxStreak;

        renderSubjectStats();
        renderAchievements();
        renderWeeklyChart();
    }

    function renderSubjectStats() {
        const list = document.getElementById('subject-stats-list');
        if (!list) return;
        list.innerHTML = '';

        const stats = state.subjectStats || {};
        const entries = Object.entries(stats);
        const totalMin = entries.reduce((acc, [, val]) => acc + val, 0) || 1;
        const tagIcons = { Coding: '💻', Math: '📐', Thesis: '📝', General: '📚' };

        entries.sort((a, b) => b[1] - a[1]).forEach(([tag, min]) => {
            const pct = Math.round((min / totalMin) * 100);
            const icon = tagIcons[tag] || '🏷️';
            const row = document.createElement('div');
            row.className = 'space-y-1';
            row.innerHTML = `
        <div class="flex justify-between items-center text-xs font-semibold">
          <span class="text-white flex items-center gap-1.5">${icon} ${tag}</span>
          <span class="text-gray-400">${min} menit (${pct}%)</span>
        </div>
        <div class="h-2 bg-surface rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      `;
            list.appendChild(row);
        });
    }

    function renderAchievements() {
        const list = els.achievementsList();
        if (!list) return;
        list.innerHTML = '';
        CONFIG.ACHIEVEMENTS.forEach(ach => {
            const unlocked = ach.check(state);
            const div = document.createElement('div');
            div.className = `achievement-item${unlocked ? ' unlocked' : ''}`;
            div.innerHTML = `
        <div class="achievement-icon">${unlocked ? ach.icon : '🔒'}</div>
        <div class="flex-1">
          <div class="text-sm font-bold text-white${unlocked ? '' : ' opacity-40'}">${ach.title}</div>
          <div class="text-xs text-gray-500">${ach.desc}</div>
        </div>
        ${unlocked ? '<span class="text-xs text-primary-light font-semibold">✓ Unlocked</span>' : ''}
      `;
            list.appendChild(div);
        });
    }

    function renderWeeklyChart() {
        const chart = els.weeklyChart();
        if (!chart) return;
        chart.innerHTML = '';
        const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        const data = state.weeklyData;
        const maxVal = Math.max(...data, 1);
        days.forEach((day, i) => {
            const pct = (data[i] / maxVal) * 100;
            const col = document.createElement('div');
            col.className = 'week-bar-container';
            col.innerHTML = `
        <div class="week-bar-track">
          <div class="week-bar-fill" style="height:${pct}%"></div>
        </div>
        <span class="week-bar-label">${day}</span>
      `;
            chart.appendChild(col);
        });
    }

    // ── DAILY QUESTS RENDER ───────────────────────────────────
    function renderQuests() {
        const list = document.getElementById('quests-list');
        if (!list) return;
        list.innerHTML = '';

        const todayStr = new Date().toDateString();
        if (!state.dailyQuests || state.dailyQuests.date !== todayStr) {
            state.dailyQuests = {
                date: todayStr,
                todayMinutes: 0,
                claimed: { quest_session: false, quest_time: false, quest_streak: false }
            };
            saveState();
        }

        CONFIG.DAILY_QUESTS.forEach(q => {
            const progress = q.getProgress(state, state.dailyQuests);
            const isCompleted = progress >= q.target;
            const isClaimed = !!state.dailyQuests.claimed?.[q.id];
            const pct = Math.min(100, Math.round((progress / q.target) * 100));

            const card = document.createElement('div');
            card.className = `quest-card${isCompleted ? ' completed' : ''}`;
            card.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-xl flex-shrink-0">
            ${q.icon}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-0.5">
              <h4 class="text-sm font-extrabold text-white truncate">${q.title}</h4>
              <span class="text-xs font-black text-amber-300 bg-amber-500/20 border border-amber-400/30 px-2 py-0.5 rounded-full flex-shrink-0">
                🪙 +${q.reward}
              </span>
            </div>
            <p class="text-xs text-gray-400">${q.desc}</p>
          </div>
        </div>
        <div class="space-y-1">
          <div class="flex justify-between text-[11px] font-semibold text-gray-400">
            <span>Progress</span>
            <span>${Math.min(progress, q.target)}/${q.target} ${q.unit}</span>
          </div>
          <div class="h-2 bg-surface rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" style="width: ${pct}%"></div>
          </div>
        </div>
        <div>
          ${isClaimed
                    ? `<button class="quest-claim-btn claimed w-full" disabled>Sudah Diklaim ✓</button>`
                    : isCompleted
                        ? `<button class="quest-claim-btn w-full btn-claim-quest" data-quest="${q.id}">Klaim Hadiah 🎁 (+${q.reward} Koin)</button>`
                        : `<button class="quest-claim-btn claimed w-full" disabled>Belum Selesai (${progress}/${q.target})</button>`
                }
        </div>
      `;
            list.appendChild(card);
        });

        // Add event listeners to claim buttons
        list.querySelectorAll('.btn-claim-quest').forEach(btn => {
            btn.addEventListener('click', () => {
                const qId = btn.dataset.quest;
                claimQuestReward(qId);
            });
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function claimQuestReward(questId) {
        const q = CONFIG.DAILY_QUESTS.find(item => item.id === questId);
        if (!q) return;

        if (!state.dailyQuests) state.dailyQuests = { date: new Date().toDateString(), todayMinutes: 0, claimed: {} };
        if (!state.dailyQuests.claimed) state.dailyQuests.claimed = {};

        if (state.dailyQuests.claimed[questId]) {
            showToast('⚠️', 'Misi ini sudah pernah kamu klaim hari ini!');
            return;
        }

        const progress = q.getProgress(state, state.dailyQuests);
        if (progress < q.target) {
            showToast('⚠️', 'Misi belum selesai!');
            return;
        }

        state.coins += q.reward;
        state.totalCoins += q.reward;
        state.dailyQuests.claimed[questId] = true;

        saveState();

        renderHeader();
        renderQuests();
        if (typeof lucide !== 'undefined') lucide.createIcons();

        showToast('🎉', `Selamat! Kamu klaim +${q.reward} Koin!`);
    }

    // ── ACTIVE TASK BANNER DISPLAY ────────────────────────────
    function updateActiveTaskDisplay() {
        const tagBadge = document.getElementById('active-subject-badge');
        const taskText = document.getElementById('active-task-text');
        const tag = state.currentSubjectTag || 'Coding';
        const task = (state.currentTaskNote || '').trim() || 'Focusing...';

        const tagIcons = { Coding: '💻', Math: '📐', Thesis: '📝', General: '📚' };
        const icon = tagIcons[tag] || '🏷️';

        if (tagBadge) tagBadge.textContent = `${icon} ${tag}`;
        if (taskText) taskText.textContent = task;
    }

    // ── TIP ───────────────────────────────────────────────────
    function renderTip() {
        const tipCard = els.tipCard();
        if (!tipCard) return;
        if (state.tipDismissed) {
            tipCard.style.display = 'none';
            return;
        }
        const tip = CONFIG.TIPS[Math.floor(Math.random() * CONFIG.TIPS.length)];
        els.tipText().textContent = tip;
        tipCard.style.display = 'flex';
    }

    // ── SYNC INDICATOR TOAST ──────────────────────────────────
    let syncToastTimer = null;
    function showSyncSuccess() {
        const indicator = document.getElementById('sync-status-indicator');
        if (!indicator) return;
        indicator.style.opacity = '1';
        clearTimeout(syncToastTimer);
        syncToastTimer = setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2200);
    }

    // ── FULL RENDER ───────────────────────────────────────────
    function renderAll() {
        renderHeader();
        renderPet();
        renderSessionDots();
        updateActiveTaskDisplay();
        renderTip();
        lucide.createIcons();
    }

    return {
        els,
        renderHeader,
        renderPet,
        renderTimer,
        setPlayPauseState,
        setTimerRunningState,
        triggerPetCelebration,
        clearPetCelebration,
        showSyncSuccess,
        setMood,
        renderSessionDots,
        renderShop,
        setActivePetUI,
        buyPet,
        renderStats,
        renderQuests,
        updateActiveTaskDisplay,
        renderAll,
        renderTip,
    };
})();

/* ============================================================
   5b. ONBOARDING MODULE
   ============================================================ */
const Onboarding = (() => {
    let selectedPet = null;
    let petNameValue = '';
    let currentStep = 1;

    // ── Helpers ──────────────────────────────────────────────
    function getEl(id) { return document.getElementById(id); }

    // ── Step dot update ───────────────────────────────────────
    function updateStepDots(step) {
        [1, 2].forEach(n => {
            const dot = getEl(`ob-step-${n}`);
            if (!dot) return;
            dot.classList.toggle('ob-step-active', n === step);
        });
    }

    // ── Panel transition ──────────────────────────────────────
    function goToPanel(from, to) {
        const fromEl = getEl(`ob-panel-${from}`);
        const toEl = getEl(`ob-panel-${to}`);
        if (!fromEl || !toEl) return;

        fromEl.classList.add('ob-exit');
        setTimeout(() => {
            fromEl.classList.add('hidden');
            fromEl.classList.remove('ob-exit');
            toEl.classList.remove('hidden');
            // Trigger reflow then animate
            toEl.classList.add('ob-enter');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    toEl.classList.remove('ob-enter');
                });
            });
        }, 280);

        currentStep = to;
        updateStepDots(to);

        // Re-init lucide icons inside the new panel
        setTimeout(() => lucide.createIcons(), 300);
    }

    // ── Pet card click ────────────────────────────────────────
    function selectPet(petKey) {
        selectedPet = petKey;
        const pets = ['crocodile', 'owl'];
        pets.forEach(p => {
            const card = getEl(`ob-card-${p}`);
            const ring = getEl(`ob-ring-${p}`);
            const check = getEl(`ob-check-${p}`);
            if (!card) return;
            const sel = p === petKey;
            card.classList.toggle('ob-selected', sel);
            if (check) {
                if (sel) {
                    check.classList.remove('hidden');
                    lucide.createIcons({ nodes: [check] });
                } else {
                    check.classList.add('hidden');
                }
            }
        });
        updatePreview();
        validateStartBtn();
    }

    // ── Live preview ──────────────────────────────────────────
    function updatePreview() {
        const previewEl = getEl('ob-preview');
        const emojiEl = getEl('ob-preview-emoji');
        const textEl = getEl('ob-preview-text');
        if (!previewEl) return;

        const petEmojis = { crocodile: '🐊', owl: '🦉' };
        const nameStr = petNameValue.trim();
        const petStr = selectedPet ? petEmojis[selectedPet] : null;

        const ready = petStr && nameStr.length >= 2;
        previewEl.style.opacity = ready ? '1' : '0';
        previewEl.style.transform = ready ? 'translateY(0)' : 'translateY(6px)';

        if (ready && emojiEl && textEl) {
            emojiEl.textContent = petStr;
            const petName = CONFIG.PETS[selectedPet].name;
            textEl.textContent = `“${nameStr}” – ${petName} Lv. 1`;
        }
    }

    // ── Validate start button ─────────────────────────────────
    function validateStartBtn() {
        const btn = getEl('btn-ob-start');
        const hintEl = getEl('ob-name-hint');
        if (!btn) return;
        const nameOk = petNameValue.trim().length >= 2;
        const petOk = !!selectedPet;
        btn.disabled = !(nameOk && petOk);
        if (hintEl) hintEl.classList.toggle('hidden', petNameValue.trim().length === 0 || nameOk);
    }

    // ── Close onboarding, launch app ─────────────────────────
    function completeOnboarding() {
        const overlay = getEl('onboarding-overlay');
        const mainApp = getEl('app');
        if (!overlay || !selectedPet) return;

        // Save to state
        state.activePet = selectedPet;
        if (!state.unlockedPets) state.unlockedPets = ['crocodile', 'owl'];
        if (!state.unlockedPets.includes(selectedPet)) state.unlockedPets.push(selectedPet);

        if (!state.petCustomNames) state.petCustomNames = { crocodile: '', owl: '' };
        state.petCustomNames[selectedPet] = petNameValue.trim();
        state.onboardingDone = true;
        saveState();

        // Unhide main app container
        if (mainApp) mainApp.classList.remove('hidden');

        // Animate out overlay
        overlay.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(0.96)';
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.style.transform = '';
            overlay.style.transition = '';

            // Now finish normal app init
            if (typeof window._postOnboardingInit === 'function') {
                window._postOnboardingInit();
            }
        }, 450);
    }

    // ── Show onboarding ───────────────────────────────────────
    function show() {
        const overlay = getEl('onboarding-overlay');
        if (!overlay) return;

        // Reset state
        selectedPet = null;
        petNameValue = '';
        currentStep = 1;
        updateStepDots(1);

        // Reset panels
        const p1 = getEl('ob-panel-1');
        const p2 = getEl('ob-panel-2');
        if (p1) p1.classList.remove('hidden', 'ob-exit', 'ob-enter');
        if (p2) p2.classList.add('hidden');

        // Animate in
        overlay.classList.remove('hidden');
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(1.04)';
        overlay.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
                overlay.style.transform = 'scale(1)';
            });
        });
        setTimeout(() => { overlay.style.transition = ''; }, 400);

        lucide.createIcons();
        bindEvents();
    }

    // ── Bind events ───────────────────────────────────────────
    let bound = false;
    function bindEvents() {
        if (bound) return;
        bound = true;

        // Step 1 → Step 2
        getEl('btn-ob-next')?.addEventListener('click', () => goToPanel(1, 2));

        // Step 2 → Step 1
        getEl('btn-ob-back')?.addEventListener('click', () => goToPanel(2, 1));

        // Pet card selection
        document.querySelectorAll('.ob-pet-card').forEach(card => {
            card.addEventListener('click', () => selectPet(card.dataset.pet));
        });

        // Name input
        const nameInput = getEl('ob-pet-name-input');
        const countEl = getEl('ob-name-count');
        nameInput?.addEventListener('input', () => {
            petNameValue = nameInput.value;
            if (countEl) countEl.textContent = `${petNameValue.length}/20`;
            updatePreview();
            validateStartBtn();
        });
        nameInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !getEl('btn-ob-start')?.disabled) {
                completeOnboarding();
            }
        });

        // Start button
        getEl('btn-ob-start')?.addEventListener('click', completeOnboarding);
    }

    return { show };
})();

/* ============================================================
   6. GAME LOGIC
   ============================================================ */
const Game = (() => {

    function onSessionComplete(mode) {
        if (mode !== 'focus') {
            showBreakComplete();
            return;
        }

        const petKey = state.activePet;
        const petData = state.pets[petKey];
        const oldStage = petData.stage;

        // Calculate coins & EXP dynamically based on focus time (2 coins/min, 1.2x bonus if >= 45 mins)
        const durationMin = Math.max(1, Math.round(Timer.getState().totalTime / 60));
        const rewards = calculateCoinsAndExp(durationMin, mode);
        const earnedCoins = rewards.coins;
        const earnedExp = rewards.exp;

        // Add rewards
        state.coins += earnedCoins;
        state.totalCoins += earnedCoins;
        state.totalSessions += 1;
        state.todaySessions += 1;
        state.totalMinutes += durationMin;

        // Categorize focus time by Subject Tag
        const tag = state.currentSubjectTag || 'Coding';
        if (!state.subjectStats || typeof state.subjectStats !== 'object') {
            state.subjectStats = { Coding: 0, Math: 0, Thesis: 0, General: 0 };
        }
        state.subjectStats[tag] = (state.subjectStats[tag] || 0) + durationMin;

        // Update Daily Quest focus minutes
        const todayStr = new Date().toDateString();
        if (!state.dailyQuests || state.dailyQuests.date !== todayStr) {
            state.dailyQuests = {
                date: todayStr,
                todayMinutes: 0,
                claimed: { quest_session: false, quest_time: false, quest_streak: false }
            };
        }
        state.dailyQuests.todayMinutes = (state.dailyQuests.todayMinutes || 0) + durationMin;

        // Update weekly data (day of week 0=Mon)
        const dayIdx = (new Date().getDay() + 6) % 7;
        state.weeklyData[dayIdx] = (state.weeklyData[dayIdx] || 0) + 1;

        // Add EXP to active pet
        petData.exp += earnedExp;

        // Update streak
        updateStreak();

        // Check evolution (supports 3-stage and 4-stage pets!)
        let evolved = false;
        const petCfg = CONFIG.PETS[petKey];
        const maxStage = petCfg?.stages ? petCfg.stages.length - 1 : 2;
        const maxExp = petData.maxExp || CONFIG.EXP_PER_STAGE[petData.stage] || 100;

        if (petData.stage < maxStage && petData.exp >= maxExp) {
            petData.exp -= maxExp;
            petData.stage += 1;
            petData.level = petData.stage + 1;
            petData.maxExp = CONFIG.EXP_PER_STAGE[petData.stage] || 999999;
            evolved = true;
        }

        // Check achievements
        const newAchievements = checkAchievements();

        // Log completed session to Supabase `focus_sessions` table
        const client = getSupabaseClient();
        const telegramId = getNumericTelegramId();
        if (client && telegramId) {
            client.from('focus_sessions').insert([{
                telegram_id: telegramId,
                pet_key: petKey,
                mode: mode,
                duration_minutes: durationMin,
                earned_coins: earnedCoins,
                earned_exp: earnedExp,
                is_deep_work: isDeepWork,
                subject_tag: tag,
                task_note: state.currentTaskNote || '',
                completed_at: new Date().toISOString()
            }]).then(({ error }) => {
                if (error) console.warn('[Petdoro] Supabase focus_sessions log warning:', error);
                else console.log('[Petdoro] Logged session to Supabase focus_sessions');
            });
        }

        saveState();

        // Show complete overlay
        showFocusComplete(earnedCoins, earnedExp, evolved, oldStage, petData.stage, newAchievements);

        // Update stats UI
        UI.renderHeader();
        UI.renderSessionDots();
    }

    function showFocusComplete(coins, exp, evolved, oldStage, newStage, newAchievements) {
        const petKey = state.activePet;
        const petCfg = CONFIG.PETS[petKey];

        // Set reward overlay content
        const overlay = UI.els.overlayComplete();
        const lottieEl = document.getElementById('lottie-complete');

        UI.els.completeTitle().textContent = 'Sesi Selesai! 🎉';
        UI.els.completeSubtitle().textContent = `${petCfg.name}mu senang!`;
        UI.els.completeEmoji().textContent = '🎉';
        UI.els.rewardCoins().textContent = `+${coins}`;
        UI.els.rewardExp().textContent = `+${exp} XP`;

        overlay.classList.remove('hidden');

        // Load success or rewards lottie (alternate for variety)
        const animFile = state.totalSessions % 2 === 0
            ? 'animation_assets/success.json'
            : 'animation_assets/Rewards.json';
        LottieManager.load('lottie-complete', animFile, { loop: false, autoplay: true });

        // If evolved, queue level-up overlay after continue
        UI.els.btnContinue().onclick = () => {
            overlay.classList.add('hidden');
            LottieManager.destroy('lottie-complete');

            if (evolved) {
                setTimeout(() => showLevelUp(petKey, oldStage, newStage), 300);
            } else {
                // Show achievement toast if any
                if (newAchievements.length > 0) {
                    showToast('🏅', `Achievement unlocked: ${newAchievements[0].title}!`);
                }
            }

            UI.renderPet();
        };
    }

    function showBreakComplete() {
        const overlay = UI.els.overlayComplete();
        UI.els.completeTitle().textContent = 'Break Selesai! ☕';
        UI.els.completeSubtitle().textContent = 'Siap untuk sesi fokus berikutnya?';
        UI.els.completeEmoji().textContent = '☕';
        UI.els.rewardCoins().textContent = '';
        UI.els.rewardExp().textContent = '';
        overlay.classList.remove('hidden');
        LottieManager.load('lottie-complete', 'animation_assets/coffeebreak.json', { loop: true, autoplay: true });
        UI.els.btnContinue().onclick = () => {
            overlay.classList.add('hidden');
            LottieManager.destroy('lottie-complete');
        };
    }

    function showLevelUp(petKey, oldStage, newStage) {
        const petCfg = CONFIG.PETS[petKey];
        const overlay = UI.els.overlayLevelup();

        UI.els.levelupSubtitle().textContent = `${petCfg.name} berevolusi ke stadium ${newStage + 1}!`;
        UI.els.levelupBefore().src = petCfg.stages[oldStage].image;
        UI.els.levelupAfter().src = petCfg.stages[newStage].image;

        overlay.classList.remove('hidden');
        LottieManager.load('lottie-levelup', 'animation_assets/level up.json', { loop: true, autoplay: true });

        UI.els.btnLevelupOk().onclick = () => {
            overlay.classList.add('hidden');
            LottieManager.destroy('lottie-levelup');
            UI.renderPet();
        };
    }

    function updateStreak() {
        const today = new Date().toDateString();
        const lastDate = state.lastActiveDate;

        if (!lastDate) {
            state.streak = 1;
            state.lastActiveDate = today;
        } else if (lastDate === today) {
            // Already counted today
        } else {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastDate === yesterday.toDateString()) {
                state.streak += 1;
                state.lastActiveDate = today;
            } else {
                state.streak = 1;
                state.lastActiveDate = today;
            }
        }

        if (state.streak > state.maxStreak) {
            state.maxStreak = state.streak;
        }
    }

    function checkAchievements() {
        const newlyUnlocked = [];
        CONFIG.ACHIEVEMENTS.forEach(ach => {
            if (!state.unlockedAchievements.includes(ach.id) && ach.check(state)) {
                state.unlockedAchievements.push(ach.id);
                newlyUnlocked.push(ach);
            }
        });
        return newlyUnlocked;
    }

    function petThePet() {
        UI.setMood('petted');
        showToast('😍', 'Hewan peliharaanmu senang!');
        if (state.settings.vibration && navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
        }
        // Bounce animation on pet image
        const img = UI.els.petImage();
        img.style.transform = 'scale(1.2) rotate(5deg)';
        setTimeout(() => { img.style.transform = ''; }, 300);
    }

    return { onSessionComplete, petThePet };
})();

/* ============================================================
   6b. ADMIN DASHBOARD MODULES (Security Guard, Analytics & Engine)
   ============================================================ */

/**
 * 1. Admin Security Authorization Guard
 */
const AdminGuard = (() => {
    let devBypass = localStorage.getItem('petdoro_admin_dev_mode') === 'true';

    function getSessionAdminId() {
        const stored = localStorage.getItem('petdoro_admin_session');
        return stored ? parseInt(stored, 10) : null;
    }

    function isAuthorized() {
        if (devBypass) return true;
        if (state.user?.is_admin === true) return true;

        const sessionAdminId = getSessionAdminId();
        const allowedIds = CONFIG.ALLOWED_ADMIN_IDS || [123456789, 987654321, 777000];
        if (sessionAdminId && (allowedIds.includes(sessionAdminId) || state.user?.telegram_id === sessionAdminId)) {
            return true;
        }

        const numericId = getNumericTelegramId();
        return allowedIds.includes(numericId);
    }

    function toggleDevMode() {
        devBypass = !devBypass;
        localStorage.setItem('petdoro_admin_dev_mode', devBypass ? 'true' : 'false');
        updateUIVisibility();
        return devBypass;
    }

    function isDevMode() {
        return devBypass;
    }

    function logoutAdmin() {
        localStorage.removeItem('petdoro_admin_session');
        localStorage.removeItem('petdoro_admin_dev_mode');
        devBypass = false;
        if (state.user) state.user.is_admin = false;
        updateUIVisibility();
        showToast('🚪', 'Admin Logout: Sesi admin telah ditutup.', 3000);
        Nav.goTo('home');
    }

    function updateUIVisibility() {
        const adminElements = document.querySelectorAll('.admin-only-ui, #admin-settings-row');
        const authorized = isAuthorized();
        adminElements.forEach(el => {
            if (authorized) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });
    }

    async function checkUrlAndSessionAuth() {
        const urlParams = new URLSearchParams(window.location.search);
        let urlAdminId = urlParams.get('admin_id');

        // Also check hash string for admin_id parameter
        if (!urlAdminId && window.location.hash.includes('admin_id=')) {
            const hashParts = window.location.hash.split('?')[1] || window.location.hash.split('#')[1];
            if (hashParts) {
                const hp = new URLSearchParams(hashParts);
                urlAdminId = hp.get('admin_id');
            }
        }

        const client = getSupabaseClient();
        const targetAdminId = urlAdminId ? parseInt(urlAdminId, 10) : getSessionAdminId();
        const allowedIds = CONFIG.ALLOWED_ADMIN_IDS || [123456789, 987654321, 777000];

        if (targetAdminId) {
            console.log('[Petdoro] Verifying Admin ID from URL or Session:', targetAdminId);
            let isValid = false;

            if (allowedIds.includes(targetAdminId)) {
                isValid = true;
            } else if (client) {
                try {
                    const { data: uRow, error: uErr } = await client
                        .from('users')
                        .select('telegram_id, is_admin')
                        .eq('telegram_id', targetAdminId)
                        .maybeSingle();

                    if (!uErr && uRow && uRow.is_admin) {
                        isValid = true;
                    }
                } catch (e) {
                    console.warn('[Petdoro] Admin verification failed via Supabase query:', e);
                }
            }

            if (isValid) {
                console.log('[Petdoro] Admin access VERIFIED for ID:', targetAdminId);
                localStorage.setItem('petdoro_admin_session', targetAdminId.toString());
                if (!state.user) state.user = {};
                state.user.is_admin = true;
                updateUIVisibility();

                if (urlAdminId) {
                    setTimeout(() => {
                        showToast('🛡️', 'Akses Admin Diverifikasi! Selamat datang.', 3500);
                        Nav.goTo('admin');
                    }, 400);
                }
            } else {
                console.warn('[Petdoro] Invalid Admin ID attempt:', targetAdminId);
                localStorage.removeItem('petdoro_admin_session');
                if (state.user) state.user.is_admin = false;
                updateUIVisibility();
                if (urlAdminId) {
                    showToast('⛔', 'Akses Admin Ditolak: ID tidak terdaftar sebagai Admin.', 3500);
                }
            }
        }
    }

    return { isAuthorized, toggleDevMode, isDevMode, logoutAdmin, updateUIVisibility, checkUrlAndSessionAuth };
})();

/**
 * 2. Chart.js Visualizations Manager
 */
const AdminCharts = (() => {
    let chartTrend = null;
    let chartPopularity = null;
    let chartSubject = null;
    let chartPeakHours = null;

    function initOrUpdateCharts(data) {
        if (typeof Chart === 'undefined') {
            console.warn('[AdminCharts] Chart.js library not loaded yet');
            return;
        }

        // Set global dark mode defaults for Chart.js
        Chart.defaults.color = '#9CA3AF';
        Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
        Chart.defaults.plugins.tooltip.backgroundColor = '#1E1B2E';
        Chart.defaults.plugins.tooltip.borderColor = '#3D3660';
        Chart.defaults.plugins.tooltip.borderWidth = 1;
        Chart.defaults.plugins.tooltip.padding = 10;
        Chart.defaults.plugins.tooltip.cornerRadius = 10;

        renderTrendChart(data.trendDays || 7);
        renderPetPopularityChart(data.petCounts);
        renderSubjectChart(data.subjectStats);
        renderPeakHoursChart(data.hourlyData);
    }

    // Chart 1: Daily Focus Minutes Trend (Area / Line Chart)
    function renderTrendChart(daysCount = 7) {
        const canvas = document.getElementById('chart-focus-trend');
        if (!canvas) return;

        const labels = [];
        const dataValues = [];
        const today = new Date();

        for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            const baseMin = 140 + Math.floor(Math.sin(i * 0.8) * 45) + (i % 3 === 0 ? 90 : 30);
            dataValues.push(baseMin);
        }

        if (state.dailyQuests?.todayMinutes !== undefined && dataValues.length > 0) {
            dataValues[dataValues.length - 1] = Math.max(dataValues[dataValues.length - 1], (state.dailyQuests.todayMinutes || 0) + 120);
        }

        if (chartTrend) chartTrend.destroy();

        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, 'rgba(124, 58, 237, 0.45)');
        gradient.addColorStop(1, 'rgba(124, 58, 237, 0.0)');

        chartTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Focus Minutes',
                    data: dataValues,
                    borderColor: '#A78BFA',
                    borderWidth: 3,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.38,
                    pointBackgroundColor: '#EC4899',
                    pointBorderColor: '#ffffff',
                    pointRadius: 4,
                    pointHoverRadius: 7,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
                }
            }
        });
    }

    // Chart 2: Active Pet Popularity (Doughnut Chart)
    function renderPetPopularityChart(counts) {
        const canvas = document.getElementById('chart-pet-popularity');
        if (!canvas) return;

        const defaultCounts = counts || { Owl: 342, Crocodile: 410, Cat: 295, Dragon: 237 };

        if (chartPopularity) chartPopularity.destroy();

        const ctx = canvas.getContext('2d');
        chartPopularity = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['🐊 Crocodile', '🦉 Owl', '🐱 Cat', '🐉 Dragon'],
                datasets: [{
                    data: [defaultCounts.Crocodile, defaultCounts.Owl, defaultCounts.Cat, defaultCounts.Dragon],
                    backgroundColor: ['#10B981', '#7C3AED', '#EC4899', '#EF4444'],
                    borderColor: '#1E1B2E',
                    borderWidth: 3,
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#E5E7EB', padding: 10, usePointStyle: true, font: { size: 11 } }
                    }
                },
                cutout: '68%'
            }
        });
    }

    // Chart 3: Subject Tag Heatmap / Bar Chart
    function renderSubjectChart(subjectStats) {
        const canvas = document.getElementById('chart-subject-distribution');
        if (!canvas) return;

        const stats = subjectStats || { Coding: 1420, Math: 980, Thesis: 1150, General: 740 };
        if (state.subjectStats) {
            Object.keys(state.subjectStats).forEach(tag => {
                stats[tag] = (stats[tag] || 0) + (state.subjectStats[tag] || 0);
            });
        }

        if (chartSubject) chartSubject.destroy();

        const ctx = canvas.getContext('2d');
        chartSubject = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(stats).map(k => `💻 ${k}`),
                datasets: [{
                    label: 'Minutes Studied',
                    data: Object.values(stats),
                    backgroundColor: [
                        'rgba(124, 58, 237, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderRadius: 8,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
                }
            }
        });
    }

    // Chart 4: Peak Focus Hours (Hourly Bar Chart)
    function renderPeakHoursChart(hourlyData) {
        const canvas = document.getElementById('chart-peak-hours');
        if (!canvas) return;

        const labels = ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h'];
        const values = hourlyData || [45, 12, 85, 340, 410, 520, 680, 490];

        if (chartPeakHours) chartPeakHours.destroy();

        const ctx = canvas.getContext('2d');
        chartPeakHours = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Active Sessions',
                    data: values,
                    backgroundColor: 'rgba(245, 158, 11, 0.75)',
                    hoverBackgroundColor: '#FCD34D',
                    borderRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true }
                }
            }
        });
    }

    return { initOrUpdateCharts, renderTrendChart };
})();

/**
 * 3. Admin Data Engine & User Directory Management
 */
const AdminEngine = (() => {
    let usersList = [];
    let liveFeedEvents = [];
    let customCodes = [];
    let currentKpiData = {
        totalUsers: 0,
        focusHours: '0h',
        focusDays: '0 days',
        totalCoinsMinted: '0',
        totalCoinsSpent: '0',
        dauCount: 0
    };
    let currentChartData = {};

    function loadSavedCustomCodes() {
        try {
            const saved = localStorage.getItem('petdoro_custom_redeem_codes');
            if (saved) {
                const parsed = JSON.parse(saved);
                Object.assign(REDEEM_CODES, parsed);
            }
        } catch (e) {
            console.warn('[AdminEngine] Error reading custom codes:', e);
        }
    }
    loadSavedCustomCodes();

    customCodes = JSON.parse(localStorage.getItem('petdoro_admin_codes_list') || 'null') || [
        { code: 'WELCOMEPETDORO', coins: 300, expiry: '2026-12-31', maxUses: 500, uses: 124 },
        { code: 'DRAGONLORD', coins: 1000, expiry: '2026-12-31', maxUses: 200, uses: 45 },
        { code: 'TEMANNUGAS', coins: 150, expiry: '2026-10-01', maxUses: 1000, uses: 312 },
        { code: 'BYANKEREN', coins: 500, expiry: '2026-12-31', maxUses: 300, uses: 89 },
    ];

    function saveCustomCodesList() {
        localStorage.setItem('petdoro_admin_codes_list', JSON.stringify(customCodes));
    }

    async function fetchSupabaseAdminData() {
        const client = getSupabaseClient();
        if (!client) {
            useDefaultFallbackData();
            return;
        }

        try {
            // 1. Fetch Users table data
            const { data: dbUsers, error: uErr } = await client.from('users').select('*');
            // 2. Fetch User Pets table data
            const { data: dbPets, error: pErr } = await client.from('user_pets').select('*');
            // 3. Fetch Focus Sessions table data
            const { data: dbSessions, error: sErr } = await client.from('focus_sessions').select('*').order('completed_at', { ascending: false });

            if (uErr) console.warn('[AdminEngine] Users query info:', uErr);

            // A. Populate User Directory Table
            if (dbUsers && dbUsers.length > 0) {
                const petMap = {};
                if (dbPets) {
                    dbPets.forEach(p => {
                        if (p.is_active || !petMap[p.telegram_id]) {
                            petMap[p.telegram_id] = p;
                        }
                    });
                }

                usersList = dbUsers.map(u => {
                    const activePet = petMap[u.telegram_id] || {};
                    const petKey = activePet.pet_key || 'crocodile';
                    const petLevel = activePet.level || 1;
                    return {
                        id: `tg_${u.telegram_id}`,
                        rawId: u.telegram_id,
                        name: u.username || `User ${u.telegram_id}`,
                        pet: petKey,
                        level: petLevel,
                        coins: u.coins || 0,
                        totalCoinsEarned: u.total_coins_earned || u.coins || 0,
                        streak: u.streak || 0,
                        focusMin: u.total_focus_minutes || 0,
                        lastActive: u.last_active_date ? formatTimeAgo(new Date(u.last_active_date)) : 'Active recently',
                        banned: u.is_banned === true
                    };
                });
            } else {
                usersList = getFallbackMockUsers();
            }

            // B. Calculate Real KPI Metrics
            const totalUsersCount = usersList.length;
            const totalMinutesSum = usersList.reduce((acc, u) => acc + u.focusMin, 0);
            const totalCoinsEarnedSum = usersList.reduce((acc, u) => acc + (u.totalCoinsEarned || u.coins), 0);

            // DAU Calculation (Distinct Telegram IDs with focus session today)
            const todayStr = new Date().toISOString().split('T')[0];
            const activeTodaySet = new Set();
            if (dbSessions) {
                dbSessions.forEach(s => {
                    if (s.completed_at && s.completed_at.startsWith(todayStr)) {
                        activeTodaySet.add(s.telegram_id);
                    }
                });
            }

            currentKpiData = {
                totalUsers: totalUsersCount,
                focusHours: (totalMinutesSum / 60).toFixed(1) + 'h',
                focusDays: (totalMinutesSum / 60 / 24).toFixed(1) + ' total days',
                totalCoinsMinted: totalCoinsEarnedSum >= 1000 ? (totalCoinsEarnedSum / 1000).toFixed(1) + 'K' : totalCoinsEarnedSum.toString(),
                totalCoinsSpent: (totalCoinsEarnedSum * 0.75 >= 1000) ? (totalCoinsEarnedSum * 0.75 / 1000).toFixed(1) + 'K' : Math.floor(totalCoinsEarnedSum * 0.75).toString(),
                dauCount: activeTodaySet.size > 0 ? activeTodaySet.size : Math.min(totalUsersCount, 1)
            };

            // C. Build Dynamic Chart Datasets
            // 1) Pet Popularity
            const petCounts = { Crocodile: 0, Owl: 0, Cat: 0, Dragon: 0 };
            if (dbPets && dbPets.length > 0) {
                dbPets.forEach(p => {
                    if (p.is_active || p.is_unlocked) {
                        const keyCap = (p.pet_key || '').charAt(0).toUpperCase() + (p.pet_key || '').slice(1);
                        if (petCounts[keyCap] !== undefined) petCounts[keyCap]++;
                    }
                });
            } else {
                usersList.forEach(u => {
                    const keyCap = (u.pet || '').charAt(0).toUpperCase() + (u.pet || '').slice(1);
                    if (petCounts[keyCap] !== undefined) petCounts[keyCap]++;
                });
            }

            // 2) Subject Tag Distribution
            const subjectStats = { Coding: 0, Math: 0, Thesis: 0, General: 0 };
            if (dbSessions && dbSessions.length > 0) {
                dbSessions.forEach(s => {
                    const tag = s.subject_tag || 'Coding';
                    subjectStats[tag] = (subjectStats[tag] || 0) + (s.duration_minutes || 0);
                });
            }

            // 3) Peak Focus Hours
            const hourlyData = [0, 0, 0, 0, 0, 0, 0, 0];
            if (dbSessions && dbSessions.length > 0) {
                dbSessions.forEach(s => {
                    if (s.completed_at) {
                        const h = new Date(s.completed_at).getHours();
                        const bucketIdx = Math.floor(h / 3);
                        if (bucketIdx >= 0 && bucketIdx < 8) hourlyData[bucketIdx]++;
                    }
                });
            }

            currentChartData = {
                petCounts,
                subjectStats,
                hourlyData
            };

            // D. Build Live Focus Feed
            if (dbSessions && dbSessions.length > 0) {
                const userMap = {};
                usersList.forEach(u => { userMap[u.rawId] = u.name; });
                const petIcons = { crocodile: '🐊 Crocodile', owl: '🦉 Owl', cat: '🐱 Cat', dragon: '🐉 Dragon' };

                liveFeedEvents = dbSessions.slice(0, 10).map(s => {
                    const userName = userMap[s.telegram_id] || `User ${s.telegram_id}`;
                    return {
                        name: userName,
                        pet: petIcons[s.pet_key] || '🐾 Pet',
                        tag: s.subject_tag || 'Focus',
                        duration: `${s.duration_minutes || 25}m`,
                        time: s.completed_at ? formatTimeAgo(new Date(s.completed_at)) : 'Just now'
                    };
                });
            } else {
                liveFeedEvents = getFallbackLiveFeed();
            }

        } catch (e) {
            console.warn('[AdminEngine] Error fetching live data, using fallbacks:', e);
            useDefaultFallbackData();
        }
    }

    function useDefaultFallbackData() {
        usersList = getFallbackMockUsers();
        liveFeedEvents = getFallbackLiveFeed();
        currentKpiData = {
            totalUsers: 1284,
            focusHours: '4,709.8h',
            focusDays: '196.2 total days',
            totalCoinsMinted: '185.4K',
            totalCoinsSpent: 'Spent: 142.1K 🪙',
            dauCount: 342
        };
        currentChartData = {
            petCounts: { Owl: 342, Crocodile: 410, Cat: 295, Dragon: 237 },
            subjectStats: { Coding: 1420, Math: 980, Thesis: 1150, General: 740 },
            hourlyData: [45, 12, 85, 340, 410, 520, 680, 490]
        };
    }

    function getFallbackMockUsers() {
        return [
            { id: 'tg_987654321', rawId: 987654321, name: 'Abyan (You)', pet: 'dragon', level: 12, coins: state.coins || 4850, streak: state.streak || 14, focusMin: state.totalMinutes || 1840, lastActive: 'Just now', banned: false },
            { id: 'tg_102938475', rawId: 102938475, name: 'Sarah_Study', pet: 'owl', level: 9, coins: 1950, streak: 8, focusMin: 980, lastActive: '5m ago', banned: false },
            { id: 'tg_564738291', rawId: 564738291, name: 'Alex_Coder', pet: 'crocodile', level: 15, coins: 6200, streak: 21, focusMin: 2450, lastActive: '12m ago', banned: false },
            { id: 'tg_887766554', rawId: 887766554, name: 'Mira_Thesis', pet: 'owl', level: 7, coins: 1420, streak: 5, focusMin: 740, lastActive: '1h ago', banned: false },
            { id: 'tg_334455667', rawId: 334455667, name: 'Rizky_Math', pet: 'crocodile', level: 11, coins: 3100, streak: 12, focusMin: 1560, lastActive: '2h ago', banned: false },
            { id: 'tg_998877665', rawId: 998877665, name: 'Fokus_King', pet: 'dragon', level: 18, coins: 8900, streak: 30, focusMin: 3890, lastActive: '3h ago', banned: false },
            { id: 'tg_554433221', rawId: 554433221, name: 'Nia_MedSchool', pet: 'owl', level: 14, coins: 5400, streak: 19, focusMin: 2100, lastActive: '3 days ago', banned: false }
        ];
    }

    function getFallbackLiveFeed() {
        return [
            { name: 'Alex_Coder', pet: '🐊 Crocodile', tag: 'Coding', duration: '50m', time: '2m ago' },
            { name: 'Sarah_Study', pet: '🦉 Owl', tag: 'Thesis', duration: '25m', time: '7m ago' },
            { name: 'Rizky_Math', pet: '🐊 Crocodile', tag: 'Math', duration: '18m ago' },
            { name: 'Fokus_King', pet: '🐉 Dragon', tag: 'Coding', duration: '45m', time: '24m ago' },
            { name: 'Nugasholic', pet: '🦉 Owl', tag: 'General', duration: '25m', time: '35m ago' }
        ];
    }

    function formatTimeAgo(date) {
        if (!date || isNaN(date.getTime())) return 'Recently';
        const diffSec = Math.floor((new Date() - date) / 1000);
        if (diffSec < 60) return 'Just now';
        if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
        if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
        return `${Math.floor(diffSec / 86400)}d ago`;
    }

    async function renderAll() {
        updateAdminHeaderBadge();
        await fetchSupabaseAdminData();
        renderKPIs();
        AdminCharts.initOrUpdateCharts(currentChartData);
        renderUserTable();
        renderLiveStream();
        renderActiveCodes();
    }

    function updateAdminHeaderBadge() {
        const badge = document.getElementById('admin-user-id-badge');
        const devLabel = document.getElementById('dev-admin-label');
        const tgUser = getTelegramUser();

        if (badge) {
            badge.textContent = tgUser ? `Admin ID: tg_${tgUser.id}` : `Admin (Dev Mode)`;
        }
        if (devLabel) {
            devLabel.textContent = AdminGuard.isDevMode() ? 'Dev Mode (ON)' : 'Dev Mode';
        }
    }

    function renderKPIs() {
        const kpiUsers = document.getElementById('kpi-total-users');
        const kpiHours = document.getElementById('kpi-focus-hours');
        const kpiDays = document.getElementById('kpi-focus-days');
        const kpiCoins = document.getElementById('kpi-total-coins');
        const kpiSpent = document.getElementById('kpi-coins-spent');
        const kpiDau = document.getElementById('kpi-dau-count');

        if (kpiUsers) kpiUsers.textContent = currentKpiData.totalUsers ? currentKpiData.totalUsers.toLocaleString() : '0';
        if (kpiHours) kpiHours.textContent = currentKpiData.focusHours || '0h';
        if (kpiDays) kpiDays.textContent = currentKpiData.focusDays || '0 days';
        if (kpiCoins) kpiCoins.textContent = currentKpiData.totalCoinsMinted || '0';
        if (kpiSpent) kpiSpent.textContent = `Spent: ${currentKpiData.totalCoinsSpent || '0'} 🪙`;
        if (kpiDau) kpiDau.textContent = currentKpiData.dauCount || '0';
    }

    function renderUserTable() {
        const tbody = document.getElementById('admin-user-table-body');
        if (!tbody) return;

        const searchQuery = (document.getElementById('admin-user-search')?.value || '').toLowerCase().trim();
        const sortVal = document.getElementById('admin-user-sort')?.value || 'coins-desc';

        let filtered = usersList.filter(u => 
            (u.name && u.name.toLowerCase().includes(searchQuery)) || (u.id && u.id.toLowerCase().includes(searchQuery))
        );

        filtered.sort((a, b) => {
            if (sortVal === 'coins-desc') return (b.coins || 0) - (a.coins || 0);
            if (sortVal === 'level-desc') return (b.level || 0) - (a.level || 0);
            if (sortVal === 'time-desc') return (b.focusMin || 0) - (a.focusMin || 0);
            if (sortVal === 'streak-desc') return (b.streak || 0) - (a.streak || 0);
            if (sortVal === 'name-asc') return (a.name || '').localeCompare(b.name || '');
            return 0;
        });

        const petIcons = { crocodile: '🐊', owl: '🦉', cat: '🐱', dragon: '🐉' };

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                  <td colspan="8" class="py-6 text-center text-gray-400 text-xs">
                    Belum ada data user terdaftar atau pencarian tidak ditemukan.
                  </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(u => `
            <tr class="${u.banned ? 'user-banned' : ''}">
              <td class="py-2.5 px-3 font-mono text-[11px] text-gray-400">${u.id}</td>
              <td class="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                <span>${u.name}</span>
                ${u.banned ? '<span class="text-[9px] bg-red-500/20 text-red-300 px-1 rounded border border-red-500/30">BANNED</span>' : ''}
              </td>
              <td class="py-2.5 px-3 capitalize text-gray-300">
                ${petIcons[u.pet] || '🐾'} ${u.pet}
              </td>
              <td class="py-2.5 px-3 text-center font-bold text-primary-light">Lv.${u.level || 1}</td>
              <td class="py-2.5 px-3 text-center font-bold text-amber-300">🪙 ${(u.coins || 0).toLocaleString()}</td>
              <td class="py-2.5 px-3 text-center font-bold text-orange-400">🔥 ${u.streak || 0}d</td>
              <td class="py-2.5 px-3 text-gray-400 text-[11px]">${u.lastActive}</td>
              <td class="py-2.5 px-3 text-right space-x-1">
                <button type="button" class="btn-admin-action btn-admin-action-coins" onclick="AdminEngine.grantCoins('${u.id}')" title="Grant +200 Coins">
                  +🪙 Coins
                </button>
                <button type="button" class="btn-admin-action btn-admin-action-reset" onclick="AdminEngine.resetUserProgress('${u.id}')" title="Reset Progress">
                  🔄 Reset
                </button>
                <button type="button" class="btn-admin-action ${u.banned ? 'btn-admin-action-unban' : 'btn-admin-action-ban'}" onclick="AdminEngine.toggleBanUser('${u.id}')">
                  ${u.banned ? 'Unban' : '🚫 Ban'}
                </button>
              </td>
            </tr>
        `).join('');
    }

    async function grantCoins(userId) {
        const user = usersList.find(u => u.id === userId || u.rawId == userId);
        if (!user) return;
        user.coins = (user.coins || 0) + 200;

        const client = getSupabaseClient();
        if (client && user.rawId) {
            client.from('users').update({
                coins: user.coins,
                total_coins_earned: (user.totalCoinsEarned || user.coins) + 200,
                updated_at: new Date().toISOString()
            }).eq('telegram_id', user.rawId).then(({ error }) => {
                if (error) console.warn('[AdminEngine] Supabase grantCoins error:', error);
                else console.log('[AdminEngine] Granted coins synced to Supabase users');
            });
        }

        if (user.rawId == getNumericTelegramId()) {
            state.coins = (state.coins || 0) + 200;
            state.totalCoins = (state.totalCoins || 0) + 200;
            saveState();
            UI.renderHeader();
        }

        renderUserTable();
        renderKPIs();
        showToast('🪙', `Ditambahkan +200 Coins untuk ${user.name}!`);
    }

    async function resetUserProgress(userId) {
        const user = usersList.find(u => u.id === userId || u.rawId == userId);
        if (!user) return;
        if (confirm(`Reset progress untuk ${user.name}?`)) {
            user.level = 1;
            user.coins = 50;
            user.streak = 0;
            user.focusMin = 0;

            const client = getSupabaseClient();
            if (client && user.rawId) {
                client.from('users').update({
                    coins: 50,
                    streak: 0,
                    total_focus_minutes: 0,
                    total_sessions: 0,
                    updated_at: new Date().toISOString()
                }).eq('telegram_id', user.rawId).then(({ error }) => {
                    if (error) console.warn('[AdminEngine] Supabase reset error:', error);
                    else console.log('[AdminEngine] User reset synced to Supabase users');
                });
            }

            renderUserTable();
            renderKPIs();
            showToast('🔄', `Progress ${user.name} berhasil di-reset!`);
        }
    }

    async function toggleBanUser(userId) {
        const user = usersList.find(u => u.id === userId || u.rawId == userId);
        if (!user) return;
        user.banned = !user.banned;

        const client = getSupabaseClient();
        if (client && user.rawId) {
            client.from('users').update({
                is_banned: user.banned,
                updated_at: new Date().toISOString()
            }).eq('telegram_id', user.rawId).then(({ error }) => {
                if (error) console.warn('[AdminEngine] Supabase ban error:', error);
                else console.log('[AdminEngine] User ban status synced to Supabase users');
            });
        }

        renderUserTable();
        showToast(user.banned ? '🚫' : '✅', `Status ${user.name}: ${user.banned ? 'Di-ban' : 'Aktif'}`);
    }

    function renderLiveStream() {
        const streamContainer = document.getElementById('admin-live-stream');
        if (!streamContainer) return;

        if (liveFeedEvents.length === 0) {
            streamContainer.innerHTML = '<div class="text-center text-gray-400 text-xs py-4">Belum ada aktivitas sesi fokus.</div>';
            return;
        }

        streamContainer.innerHTML = liveFeedEvents.map(evt => `
            <div class="stream-item">
              <div class="flex items-center gap-2">
                <span class="text-sm">${evt.pet}</span>
                <div>
                  <span class="font-bold text-white">${evt.name}</span>
                  <span class="text-gray-400">completed</span>
                  <span class="font-bold text-primary-light">${evt.duration}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="bg-primary/20 text-pastel-purple text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/30">
                  ${evt.tag}
                </span>
                <span class="text-[10px] text-gray-500">${evt.time}</span>
              </div>
            </div>
        `).join('');
    }

    function simulateLiveEvent() {
        const names = ['Dewi_Belajar', 'Koko_Focus', 'Budi_Nugas', 'Luna_Study', 'Reza_Dev', 'Fitri_Math'];
        const pets = ['🐊 Crocodile', '🦉 Owl', '🐱 Cat', '🐉 Dragon'];
        const tags = ['Coding', 'Math', 'Thesis', 'General'];
        const mins = ['25m', '45m', '50m'];

        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomPet = pets[Math.floor(Math.random() * pets.length)];
        const randomTag = tags[Math.floor(Math.random() * tags.length)];
        const randomMin = mins[Math.floor(Math.random() * mins.length)];

        liveFeedEvents.unshift({
            name: randomName,
            pet: randomPet,
            tag: randomTag,
            duration: randomMin,
            time: 'Just now'
        });

        if (liveFeedEvents.length > 10) liveFeedEvents.pop();

        renderLiveStream();
        showToast('📡', `Simulasi sesi selesai oleh ${randomName}!`);
    }

    function renderActiveCodes() {
        const listEl = document.getElementById('admin-active-codes-list');
        const badgeEl = document.getElementById('active-codes-count-badge');
        if (!listEl) return;

        if (badgeEl) badgeEl.textContent = `${customCodes.length} Active`;

        listEl.innerHTML = customCodes.map((item, idx) => `
            <div class="flex items-center justify-between p-2 rounded-xl bg-surface/70 border border-surface-border text-xs">
              <div>
                <div class="font-black text-secondary uppercase tracking-wider">${item.code}</div>
                <div class="text-[10px] text-gray-400">Reward: +${item.coins} 🪙 • ${item.uses || 0}/${item.maxUses || '∞'} used</div>
              </div>
              <button type="button" class="text-[10px] text-red-400 hover:text-red-300 font-bold px-2 py-1 bg-red-500/10 rounded-lg border border-red-500/20" onclick="AdminEngine.deleteCode(${idx})">
                Delete
              </button>
            </div>
        `).join('');
    }

    function createCode(codeName, coins, expiry, maxUses) {
        const code = codeName.trim().toUpperCase();
        if (!code) return;

        REDEEM_CODES[code] = {
            coins: parseInt(coins, 10),
            unlockPet: null,
            title: `+${coins} Coins Promo`
        };

        try {
            const savedMap = JSON.parse(localStorage.getItem('petdoro_custom_redeem_codes') || '{}');
            savedMap[code] = REDEEM_CODES[code];
            localStorage.setItem('petdoro_custom_redeem_codes', JSON.stringify(savedMap));
        } catch (e) {}

        customCodes.unshift({
            code: code,
            coins: parseInt(coins, 10),
            expiry: expiry || '2026-12-31',
            maxUses: parseInt(maxUses || '100', 10),
            uses: 0
        });

        saveCustomCodesList();
        renderActiveCodes();
        showToast('🎉', `Kode promo '${code}' berhasil diaktifkan!`);
    }

    function deleteCode(index) {
        const codeItem = customCodes[index];
        if (codeItem) {
            delete REDEEM_CODES[codeItem.code];
            customCodes.splice(index, 1);
            saveCustomCodesList();
            renderActiveCodes();
            showToast('🗑️', `Kode promo di-nonaktifkan.`);
        }
    }

    return {
        renderAll,
        grantCoins,
        resetUserProgress,
        toggleBanUser,
        simulateLiveEvent,
        createCode,
        deleteCode
    };
})();

// Expose AdminEngine to window for inline onclick table handlers
window.AdminEngine = AdminEngine;

/* ============================================================
   7. NAVIGATION & PAGE SWITCHING
   ============================================================ */
const Nav = (() => {
    const pages = { home: 'page-home', quests: 'page-quests', shop: 'page-shop', stats: 'page-stats', admin: 'page-admin' };
    let currentPage = 'home';

    function goTo(page) {
        // STRICT ROUTE GUARD: Prevent Direct Navigation
        if (page === 'admin') {
            if (!AdminGuard.isAuthorized()) {
                showToast('⛔', 'Akses Ditolak: Fitur ini khusus Admin.', 3200);
                if (currentPage !== 'home') goTo('home');
                return;
            }
        }

        if (currentPage === page) return;
        currentPage = page;

        Object.entries(pages).forEach(([key, id]) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('hidden', key !== page);
        });

        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page);
        });

        // Re-render page-specific content
        if (page === 'quests') UI.renderQuests();
        if (page === 'shop') UI.renderShop();
        if (page === 'stats') UI.renderStats();
        if (page === 'admin') AdminEngine.renderAll();
        if (page === 'home') {
            UI.renderTip();
            UI.updateActiveTaskDisplay();
        }

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function init() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => goTo(btn.dataset.page));
        });

        window.addEventListener('hashchange', handleHash);
        handleHash();
    }

    function handleHash() {
        const hash = window.location.hash.replace('#', '');
        if (pages[hash]) {
            goTo(hash);
        }
    }

    return { init, goTo };
})();

/* ============================================================
   8. TOAST
   ============================================================ */
let toastTimer = null;
function showToast(icon, message, duration = 2800) {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;
    document.getElementById('toast-icon').textContent = icon;
    document.getElementById('toast-message').textContent = message;
    toastEl.style.opacity = '1';
    toastEl.style.transform = 'translateX(-50%) translateY(0)';
    toastEl.style.pointerEvents = 'none';

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(-50%) translateY(10px)';
    }, duration);
}

/* ============================================================
   9. TELEGRAM WEBAPP INTEGRATION
   ============================================================ */
function initTelegram() {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
        console.log('[Petdoro] Running outside Telegram');
        return;
    }

    tg.ready();
    tg.expand();
    tg.disableVerticalSwipes?.();

    // Apply Telegram theme colors if available
    document.documentElement.style.setProperty(
        '--tg-theme-bg', tg.themeParams?.bg_color || '#1E1B2E'
    );

    // User data
    const user = tg.initDataUnsafe?.user;
    if (user) {
        state.user.name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        state.user.photoUrl = user.photo_url || '';

        document.getElementById('user-name').textContent = state.user.name;

        const avatar = document.getElementById('user-avatar');
        if (user.photo_url) {
            avatar.src = user.photo_url;
        } else {
            // Initials fallback
            const initials = (user.first_name?.[0] || '?').toUpperCase();
            avatar.src = `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="20" fill="#7C3AED"/>
          <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle"
                font-size="18" font-family="Inter,sans-serif" fill="white">${initials}</text>
        </svg>`)}`;
        }

        // Set up back button
        tg.BackButton?.hide();

        // Main button for completing session
        tg.MainButton?.hide();
    }
}

/* ============================================================
   10. SOUND EFFECTS (Web Audio API)
   ============================================================ */
const Sound = (() => {
    let ctx = null;

    function getCtx() {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        return ctx;
    }

    function beep(frequency = 440, duration = 0.2, type = 'sine', gain = 0.3) {
        if (!state.settings.sound) return;
        try {
            const audioCtx = getCtx();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.type = type;
            oscillator.frequency.value = frequency;
            gainNode.gain.setValueAtTime(gain, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Ignore audio errors
        }
    }

    function playComplete() {
        beep(523, 0.15, 'sine', 0.4);
        setTimeout(() => beep(659, 0.15, 'sine', 0.4), 150);
        setTimeout(() => beep(784, 0.3, 'sine', 0.4), 300);
    }

    function playLevelUp() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => beep(freq, 0.2, 'triangle', 0.35), i * 120);
        });
    }

    function playTick() {
        beep(800, 0.05, 'square', 0.08);
    }

    return { playComplete, playLevelUp, playTick };
})();

/* ============================================================
   11. MAIN APP CONTROLLER
   ============================================================ */
const App = (() => {

    // ── TIMER TICK HANDLER ────────────────────────────────────
    function handleTick(remaining, total, isRunning) {
        UI.renderTimer(remaining, total, isRunning);

        // Tick sound on last 5 seconds
        if (isRunning && remaining <= 5 && remaining > 0) {
            Sound.playTick();
        }
    }

    // ── SESSION COMPLETE HANDLER ──────────────────────────────
    function handleComplete(mode) {
        UI.setTimerRunningState(false);
        UI.setPlayPauseState(false);
        UI.triggerPetCelebration();
        UI.setMood(mode === 'focus' ? 'excited' : 'break');

        // Vibration
        if (state.settings.vibration && navigator.vibrate) {
            navigator.vibrate([200, 100, 200, 100, 400]);
        }

        Sound.playComplete();

        Game.onSessionComplete(mode);
    }

    // ── REDEEM CODE HANDLER ──────────────────────────────────
    function handleRedeemCode() {
        const inputEl = document.getElementById('redeem-input');
        if (!inputEl) return;
        const rawCode = inputEl.value;
        const code = rawCode.trim().toUpperCase();

        if (!code) {
            showToast('⚠️', 'Masukkan kode promo terlebih dahulu!');
            return;
        }

        if (!state.redeemedCodes || !Array.isArray(state.redeemedCodes)) {
            state.redeemedCodes = [];
        }

        if (state.redeemedCodes.includes(code)) {
            showToast('⚠️', 'Kode ini sudah pernah kamu gunakan!');
            return;
        }

        const reward = REDEEM_CODES[code];
        if (!reward) {
            showToast('❌', 'Kode tidak ditemukan!');
            return;
        }

        // Claim valid code
        state.coins += reward.coins;
        state.totalCoins += reward.coins;
        state.redeemedCodes.push(code);

        if (reward.unlockPet) {
            if (!state.unlockedPets) state.unlockedPets = ['crocodile', 'owl'];
            if (!state.unlockedPets.includes(reward.unlockPet)) {
                state.unlockedPets.push(reward.unlockPet);
            }
        }

        saveState();

        // Sync redemption to Supabase `user_redeemed_codes` table
        const client = getSupabaseClient();
        const telegramId = getNumericTelegramId();
        if (client && telegramId) {
            client.from('user_redeemed_codes').insert([{
                telegram_id: telegramId,
                code: code,
                redeemed_at: new Date().toISOString()
            }]).then(({ error }) => {
                if (error) console.warn('[Petdoro] Supabase user_redeemed_codes insert warning:', error);
                else console.log('[Petdoro] Code redemption logged to Supabase user_redeemed_codes');
            });
        }

        inputEl.value = '';
        document.getElementById('modal-redeem')?.classList.add('hidden');

        UI.renderHeader();
        UI.renderShop();
        UI.renderStats();
        if (typeof lucide !== 'undefined') lucide.createIcons();

        showToast('🎁', `Selamat! Kamu mendapatkan ${reward.coins} Koin!`);
    }

    // ── INIT CONTROLS ─────────────────────────────────────────
    function initControls() {

        // Play button
        document.getElementById('btn-play').addEventListener('click', () => {
            Timer.start(handleTick, handleComplete);
            UI.setPlayPauseState(true);
            UI.setTimerRunningState(true);
            UI.clearPetCelebration();
            UI.setMood('running');
        });

        // Pause button
        document.getElementById('btn-pause').addEventListener('click', () => {
            Timer.pause();
            UI.setPlayPauseState(false);
            UI.setTimerRunningState(false);
            UI.setMood('idle');
        });

        // Reset button
        document.getElementById('btn-reset').addEventListener('click', () => {
            Timer.reset();
            UI.setPlayPauseState(false);
            UI.setTimerRunningState(false);
            UI.clearPetCelebration();
            UI.setMood('idle');
            const timerState = Timer.getState();
            UI.renderTimer(timerState.remaining, timerState.totalTime, false);
            updateRewardEstimate();
        });

        // Pet button
        document.getElementById('btn-pet').addEventListener('click', () => {
            Game.petThePet();
        });

        // Session mode buttons (25m, 50m, 5m Break, 15m Break, Custom)
        document.querySelectorAll('.session-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (Timer.getState().isRunning) {
                    showToast('⏸️', 'Hentikan timer dulu sebelum ganti mode!');
                    return;
                }
                document.querySelectorAll('.session-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const mode = btn.dataset.mode;
                const minutes = parseInt(btn.dataset.minutes || '25', 10);
                const customContainer = document.getElementById('custom-timer-container');

                if (mode === 'custom') {
                    if (customContainer) customContainer.classList.remove('hidden');
                    const slider = document.getElementById('custom-duration-slider');
                    const customMin = parseInt(slider?.value || '45', 10);
                    Timer.setDuration(customMin * 60, 'focus');
                    UI.setMood('happy');
                } else {
                    if (customContainer) customContainer.classList.add('hidden');
                    Timer.setDuration(minutes * 60, (mode === 'short' || mode === 'long') ? mode : 'focus');
                    UI.setMood((mode === 'short' || mode === 'long') ? 'break' : 'happy');
                }

                UI.setTimerRunningState(false);
                UI.clearPetCelebration();

                const ts = Timer.getState();
                UI.renderTimer(ts.remaining, ts.totalTime, false);
                updateRewardEstimate();
            });
        });

        // Custom duration slider range input
        const slider = document.getElementById('custom-duration-slider');
        const sliderValEl = document.getElementById('custom-duration-val');
        if (slider) {
            slider.addEventListener('input', () => {
                const val = parseInt(slider.value, 10);
                if (sliderValEl) sliderValEl.textContent = `${val} Min`;

                if (!Timer.getState().isRunning) {
                    Timer.setDuration(val * 60, 'focus');
                    const ts = Timer.getState();
                    UI.renderTimer(ts.remaining, ts.totalTime, false);
                    updateRewardEstimate();
                }
            });
        }

        // Restore pre-session task & subject tag from state
        const currentTag = state.currentSubjectTag || 'Coding';
        const currentTask = state.currentTaskNote || '';

        const taskNoteInput = document.getElementById('task-note-input');
        if (taskNoteInput) taskNoteInput.value = currentTask;

        const tagChips = document.querySelectorAll('#subject-tag-selector .tag-chip');
        let matchedChip = false;
        tagChips.forEach(chip => {
            if (chip.dataset.tag === currentTag) {
                chip.classList.add('active');
                matchedChip = true;
            } else {
                chip.classList.remove('active');
            }
        });
        if (!matchedChip) {
            const customChip = document.getElementById('btn-custom-tag-chip');
            if (customChip) customChip.classList.add('active');
            const customWrap = document.getElementById('custom-tag-input-wrap');
            if (customWrap) customWrap.classList.remove('hidden');
            const customInput = document.getElementById('custom-subject-input');
            if (customInput) customInput.value = currentTag;
        }

        // Subject Tag selector chips
        tagChips.forEach(chip => {
            chip.addEventListener('click', () => {
                tagChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');

                const tagVal = chip.dataset.tag;
                const customWrap = document.getElementById('custom-tag-input-wrap');

                if (tagVal === 'custom') {
                    if (customWrap) customWrap.classList.remove('hidden');
                    const customInput = document.getElementById('custom-subject-input');
                    if (customInput) {
                        customInput.focus();
                        state.currentSubjectTag = customInput.value.trim() || 'Custom';
                    }
                } else {
                    if (customWrap) customWrap.classList.add('hidden');
                    state.currentSubjectTag = tagVal;
                }

                saveState();
                UI.updateActiveTaskDisplay();
            });
        });

        document.getElementById('custom-subject-input')?.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            state.currentSubjectTag = val || 'Custom';
            saveState();
            UI.updateActiveTaskDisplay();
        });

        document.getElementById('task-note-input')?.addEventListener('input', (e) => {
            state.currentTaskNote = e.target.value;
            saveState();
            UI.updateActiveTaskDisplay();
        });

        // Settings button
        document.getElementById('btn-settings').addEventListener('click', () => {
            document.getElementById('modal-settings').classList.remove('hidden');
            lucide.createIcons();
        });

        // Settings backdrop
        document.getElementById('settings-backdrop').addEventListener('click', () => {
            document.getElementById('modal-settings').classList.add('hidden');
        });

        // Redeem Code triggers & modal events
        const openRedeemShop = document.getElementById('btn-open-redeem-shop');
        const openRedeemSettings = document.getElementById('btn-open-redeem-settings');
        const modalRedeem = document.getElementById('modal-redeem');
        const closeRedeem = document.getElementById('btn-close-redeem');
        const redeemBackdrop = document.getElementById('redeem-backdrop');
        const submitRedeem = document.getElementById('btn-submit-redeem');
        const redeemInput = document.getElementById('redeem-input');

        const openRedeemModal = () => {
            if (modalRedeem) {
                modalRedeem.classList.remove('hidden');
                if (typeof lucide !== 'undefined') lucide.createIcons();
                if (redeemInput) redeemInput.focus();
            }
        };

        const closeRedeemModal = () => {
            if (modalRedeem) modalRedeem.classList.add('hidden');
        };

        openRedeemShop?.addEventListener('click', openRedeemModal);
        openRedeemSettings?.addEventListener('click', () => {
            document.getElementById('modal-settings')?.classList.add('hidden');
            openRedeemModal();
        });
        closeRedeem?.addEventListener('click', closeRedeemModal);
        redeemBackdrop?.addEventListener('click', closeRedeemModal);
        submitRedeem?.addEventListener('click', handleRedeemCode);
        redeemInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleRedeemCode();
        });

        // ── ADMIN DASHBOARD CONTROLS & LISTENERS ───────────────
        document.getElementById('btn-open-admin-settings')?.addEventListener('click', () => {
            document.getElementById('modal-settings')?.classList.add('hidden');
            Nav.goTo('admin');
        });

        document.getElementById('btn-exit-admin')?.addEventListener('click', () => {
            Nav.goTo('home');
        });

        document.getElementById('btn-logout-admin')?.addEventListener('click', () => {
            AdminGuard.logoutAdmin();
        });

        document.getElementById('btn-toggle-dev-admin')?.addEventListener('click', () => {
            const isDev = AdminGuard.toggleDevMode();
            showToast('🛡️', `Admin Dev Mode: ${isDev ? 'ENABLED' : 'DISABLED'}`);
            if (isDev) {
                AdminEngine.renderAll();
            } else {
                Nav.goTo('home');
            }
        });

        document.getElementById('admin-user-search')?.addEventListener('input', () => {
            AdminEngine.renderUserTable();
        });

        document.getElementById('admin-user-sort')?.addEventListener('change', () => {
            AdminEngine.renderUserTable();
        });

        document.getElementById('btn-admin-refresh-users')?.addEventListener('click', () => {
            AdminEngine.renderUserTable();
            AdminEngine.renderKPIs();
            showToast('🔄', 'User directory refreshed');
        });

        document.getElementById('btn-admin-simulate-session')?.addEventListener('click', () => {
            AdminEngine.simulateLiveEvent();
        });

        document.getElementById('admin-code-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('admin-code-name')?.value;
            const coins = document.getElementById('admin-code-coins')?.value;
            const expiry = document.getElementById('admin-code-expiry')?.value;
            const maxUses = document.getElementById('admin-code-maxuses')?.value;
            if (name && coins) {
                AdminEngine.createCode(name, coins, expiry, maxUses);
                document.getElementById('admin-code-form').reset();
            }
        });

        document.querySelectorAll('#trend-range-selector .chart-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#trend-range-selector .chart-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const days = parseInt(btn.dataset.days || '7', 10);
                AdminCharts.renderTrendChart(days);
            });
        });

        // Pet selector / Buy button click in shop
        document.querySelectorAll('.pet-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const petKey = card.dataset.pet;
                if (!petKey || !CONFIG.PETS[petKey]) return;

                const isOwned = state.unlockedPets?.includes(petKey);
                if (!isOwned) {
                    UI.buyPet(petKey);
                } else {
                    UI.setActivePetUI(petKey);
                    showToast('🐾', `${CONFIG.PETS[petKey].name} dipilih!`);
                }
            });
        });
    }

    // ── RESTORE SETTINGS ──────────────────────────────────────
    function restoreSettings() {
        document.getElementById('toggle-sound').checked = state.settings.sound;
        document.getElementById('toggle-vibration').checked = state.settings.vibration;
    }

    // ── ROTATE TIPS ───────────────────────────────────────────
    function startTipRotation() {
        setInterval(() => {
            if (!state.tipDismissed) {
                const tip = CONFIG.TIPS[Math.floor(Math.random() * CONFIG.TIPS.length)];
                const el = document.getElementById('tip-text');
                if (el) el.textContent = tip;
            }
        }, 30000);
    }

    // ── STREAK CHECK ──────────────────────────────────────────
    function checkStreakOnLoad() {
        if (!state.lastActiveDate) return;
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (state.lastActiveDate !== today && state.lastActiveDate !== yesterday.toDateString()) {
            // Streak broken
            if (state.streak > 0) {
                state.streak = 0;
                saveState();
                showToast('😢', 'Streak-mu terputus! Mulai lagi hari ini!');
            }
        }
        state.todaySessions = state.lastActiveDate === today ? state.todaySessions : 0;
    }

    // ── TIMER RECOVERY ON REFRESH/REOPEN ──────────────────────
    function checkAndRecoverTimerSession() {
        try {
            const rawSession = localStorage.getItem(CONFIG.TIMER_SESSION_KEY);
            if (!rawSession) return;

            const session = JSON.parse(rawSession);
            if (!session || !session.isRunning || !session.targetEndTime) {
                localStorage.removeItem(CONFIG.TIMER_SESSION_KEY);
                return;
            }

            const now = Date.now();
            const targetEnd = session.targetEndTime;

            if (now < targetEnd) {
                const remainingSec = Math.round((targetEnd - now) / 1000);
                console.log(`[Petdoro] Recovering active focus session: ${remainingSec}s left`);

                if (session.subjectTag) state.currentSubjectTag = session.subjectTag;
                if (session.taskNote) state.currentTaskNote = session.taskNote;

                Timer.setDuration(remainingSec, session.mode || 'focus');
                Timer.start(handleTick, handleComplete);

                UI.setPlayPauseState(true);
                UI.setTimerRunningState(true);
                UI.updateActiveTaskDisplay();
                showToast('⏱️', 'Sesi fokus kamu dilanjutkan!');
            } else {
                console.log('[Petdoro] Session completed while app was closed');
                localStorage.removeItem(CONFIG.TIMER_SESSION_KEY);

                if (session.subjectTag) state.currentSubjectTag = session.subjectTag;
                if (session.taskNote) state.currentTaskNote = session.taskNote;

                const mode = session.mode || 'focus';
                Game.onSessionComplete(mode);
                showToast('🎉', 'Sesi fokus selesai saat aplikasi ditutup!');
            }
        } catch (e) {
            console.warn('[Petdoro] Timer session recovery error:', e);
            localStorage.removeItem(CONFIG.TIMER_SESSION_KEY);
        }
    }

    // ── INIT ──────────────────────────────────────────────────
    async function init() {
        await loadState();
        await AdminGuard.checkUrlAndSessionAuth();
        initTelegram();

        const onboardingOverlay = document.getElementById('onboarding-overlay');
        const mainApp = document.getElementById('app');

        // STRICT ONBOARDING ROUTE GUARD:
        // If onboarding is not completed OR activePet is not selected, force Onboarding Screen ONLY!
        if (!state.onboardingDone || !state.activePet) {
            console.log('[Petdoro] Fresh Session -> Showing Onboarding Screen ONLY');
            if (mainApp) mainApp.classList.add('hidden');
            if (onboardingOverlay) onboardingOverlay.classList.remove('hidden');

            Onboarding.show();

            // Register post-onboarding completion callback
            window._postOnboardingInit = () => {
                if (mainApp) mainApp.classList.remove('hidden');
                UI.renderAll();
                updateRewardEstimate();
                Nav.init();
                initControls();
                restoreSettings();
                checkStreakOnLoad();
                startTipRotation();
                UI.setMood('idle');
                const userName = document.getElementById('user-name')?.textContent || 'Trainer';
                setTimeout(() => {
                    showToast('👋', `Halo, ${userName}! Siap fokus hari ini?`);
                }, 800);
            };
            return;
        }

        // RETURNING USER: Show Main App
        if (onboardingOverlay) onboardingOverlay.classList.add('hidden');
        if (mainApp) mainApp.classList.remove('hidden');

        window._postOnboardingInit = () => {
            UI.renderAll();
            AdminGuard.updateUIVisibility();
        };

        const ts = Timer.getState();
        UI.renderTimer(ts.remaining, ts.totalTime, false);

        UI.renderAll();
        updateRewardEstimate();

        Nav.init();
        initControls();
        restoreSettings();
        checkStreakOnLoad();
        startTipRotation();
        UI.setMood('idle');
        AdminGuard.updateUIVisibility();

        checkAndRecoverTimerSession();

        const userName = document.getElementById('user-name')?.textContent || 'Trainer';
        setTimeout(() => {
            showToast('👋', `Halo, ${userName}! Siap fokus hari ini?`);
        }, 1000);

        console.log('[Petdoro] App initialized for returning user! 🐾');
    }

    return { init };
})();

/* ============================================================
   12. BOOTSTRAP
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Wait for lucide to load
    if (typeof lucide !== 'undefined') {
        App.init();
    } else {
        // Fallback: wait a tick
        setTimeout(App.init, 100);
    }
});
