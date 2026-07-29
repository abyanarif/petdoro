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
    activePet: 'crocodile',
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

function loadState() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            state = deepMerge(DEFAULT_STATE(), parsed);
        }
        // Migration & sanitization for unlocked pets & redeemed codes & quests
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
    } catch (e) {
        console.warn('[Petdoro] Failed to load state:', e);
    }
}

function saveState() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('[Petdoro] Failed to save state:', e);
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

    function setMode(newMode) {
        if (isRunning) stop();
        mode = newMode;
        const cfg = CONFIG.SESSION_MODES[newMode] || CONFIG.SESSION_MODES.focus;
        remaining = cfg.duration;
        totalTime = cfg.duration;
        if (onTick) onTick(remaining, totalTime, false);
    }

    function setDuration(durationSeconds, newMode = 'focus') {
        if (isRunning) stop();
        mode = newMode;
        remaining = durationSeconds;
        totalTime = durationSeconds;
        if (onTick) onTick(remaining, totalTime, false);
    }

    function start(tickCb, completeCb) {
        if (isRunning) return;
        isRunning = true;
        onTick = tickCb;
        onComplete = completeCb;
        interval = setInterval(() => {
            remaining--;
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
        if (onTick) onTick(remaining, totalTime, false);
    }

    function stop() {
        isRunning = false;
        clearInterval(interval);
        interval = null;
    }

    function reset() {
        stop();
        remaining = totalTime;
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
    function renderTimer(remaining, _total, isRunning) {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        const mEl = els.timerMinutes();
        const sEl = els.timerSeconds();
        const dEl = els.timerDisplay();

        mEl.textContent = String(m).padStart(2, '0');
        sEl.textContent = String(s).padStart(2, '0');

        if (isRunning) {
            dEl.classList.add('running');
            dEl.classList.remove('paused');
        } else {
            dEl.classList.remove('running');
            if (remaining < CONFIG.SESSION_MODES[Timer.getState().mode].duration) {
                dEl.classList.add('paused');
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

    // ── SANDCLOCK & AURA ─────────────────────────────────────
    function setSandclockVisible(visible) {
        const sc = els.lottiesSandclock();
        const ar = els.auraRing();
        const petContainer = document.getElementById('pet-container');
        if (visible) {
            sc.style.opacity = '1';
            ar.classList.add('running');
            if (petContainer) {
                petContainer.style.opacity = '0';
                petContainer.style.transform = 'scale(0.7)';
                petContainer.style.pointerEvents = 'none';
            }
        } else {
            sc.style.opacity = '0';
            ar.classList.remove('running');
            if (petContainer) {
                petContainer.style.opacity = '1';
                petContainer.style.transform = 'scale(1)';
                petContainer.style.pointerEvents = 'auto';
            }
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
        setSandclockVisible,
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
        if (!overlay) return;

        // Save to state
        state.activePet = selectedPet;
        if (!state.petCustomNames) state.petCustomNames = { crocodile: '', owl: '' };
        state.petCustomNames[selectedPet] = petNameValue.trim();
        state.onboardingDone = true;
        saveState();

        // Animate out overlay
        overlay.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(0.96)';
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.style.transform = '';
            overlay.style.transition = '';

            // Now finish normal app init
            window._postOnboardingInit();
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
   7. NAVIGATION & PAGE SWITCHING
   ============================================================ */
const Nav = (() => {
    const pages = { home: 'page-home', quests: 'page-quests', shop: 'page-shop', stats: 'page-stats' };
    let currentPage = 'home';

    function goTo(page) {
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
        UI.setSandclockVisible(false);
        UI.setPlayPauseState(false);
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
            UI.setSandclockVisible(true);
            UI.setMood('running');
            if (!LottieManager.has('lottie-sandclock')) {
                LottieManager.load('lottie-sandclock', 'animation_assets/sandclock.json', { loop: true, autoplay: true });
            } else {
                LottieManager.play('lottie-sandclock');
            }
        });

        // Pause button
        document.getElementById('btn-pause').addEventListener('click', () => {
            Timer.pause();
            UI.setPlayPauseState(false);
            UI.setSandclockVisible(false);
            UI.setMood('idle');
        });

        // Reset button
        document.getElementById('btn-reset').addEventListener('click', () => {
            Timer.reset();
            UI.setPlayPauseState(false);
            UI.setSandclockVisible(false);
            UI.setMood('idle');
            LottieManager.destroy('lottie-sandclock');
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

                UI.setSandclockVisible(false);
                LottieManager.destroy('lottie-sandclock');

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

        // Sound toggle
        document.getElementById('toggle-sound').addEventListener('change', e => {
            state.settings.sound = e.target.checked;
            saveState();
        });

        // Vibration toggle
        document.getElementById('toggle-vibration').addEventListener('change', e => {
            state.settings.vibration = e.target.checked;
            saveState();
        });

        // Reset data button
        document.getElementById('btn-reset-data').addEventListener('click', () => {
            if (confirm('Reset semua data? Ini tidak dapat dibatalkan!')) {
                localStorage.removeItem(CONFIG.STORAGE_KEY);
                state = DEFAULT_STATE();
                saveState();
                Timer.reset();
                document.getElementById('modal-settings').classList.add('hidden');
                // Re-show onboarding for fresh start
                Onboarding.show();
            }
        });

        // Tip dismiss
        document.getElementById('btn-dismiss-tip').addEventListener('click', () => {
            state.tipDismissed = true;
            saveState();
            document.getElementById('tip-card').style.display = 'none';
        });

        // Rename pet (settings modal)
        document.getElementById('btn-rename-pet')?.addEventListener('click', () => {
            const input = document.getElementById('settings-pet-name-input');
            const newName = input?.value.trim();
            if (!newName || newName.length < 2) {
                showToast('⚠️', 'Nama minimal 2 karakter!');
                return;
            }
            if (!state.petCustomNames) state.petCustomNames = { crocodile: '', owl: '' };
            state.petCustomNames[state.activePet] = newName.substring(0, 20);
            saveState();
            UI.renderPet();
            UI.renderHeader();
            if (input) input.value = '';
            showToast('🏷️', `Nama diganti jadi “${newName}”!`);
        });

        // Sync settings input placeholder when modal opens
        document.getElementById('btn-settings').addEventListener('click', () => {
            const currentName = (state.petCustomNames?.[state.activePet] || '').trim();
            const input = document.getElementById('settings-pet-name-input');
            if (input) input.placeholder = currentName ? `Nama saat ini: ${currentName}` : 'Nama baru hewanmu...';
        }, { capture: false });

        // Tip dismiss
        document.getElementById('btn-dismiss-tip').addEventListener('click', () => {
            state.tipDismissed = true;
            saveState();
            document.getElementById('tip-card').style.display = 'none';
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

    // ── INIT SANDCLOCK ────────────────────────────────────────
    function preloadSandclock() {
        LottieManager.load('lottie-sandclock', 'animation_assets/sandclock.json', { loop: true, autoplay: false });
        document.getElementById('lottie-sandclock').style.opacity = '0';
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

    // ── INIT ──────────────────────────────────────────────────
    function init() {
        loadState();
        initTelegram();

        // Initial timer render
        const ts = Timer.getState();
        UI.renderTimer(ts.remaining, ts.totalTime, false);

        // Full UI render
        UI.renderAll();
        updateRewardEstimate();

        // Nav
        Nav.init();

        // Controls
        initControls();

        // Settings
        restoreSettings();

        // Preload sandclock
        preloadSandclock();

        // Streak check
        checkStreakOnLoad();

        // Tip rotation
        startTipRotation();

        // Set initial mood
        UI.setMood('idle');

        // Welcome toast
        const userName = document.getElementById('user-name').textContent;
        setTimeout(() => {
            showToast('👋', `Halo, ${userName}! Siap fokus hari ini?`);
        }, 1000);

        console.log('[Petdoro] App initialized! 🐾');
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
