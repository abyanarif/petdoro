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
    focus: { label: '🎯 Focus',       duration: 25 * 60, exp: 50,  coins: 10, label_short: 'Focus' },
    short: { label: '☕ Short Break', duration:  5 * 60, exp: 10,  coins:  3, label_short: 'Short Break' },
    long:  { label: '🌙 Long Break',  duration: 15 * 60, exp: 20,  coins:  5, label_short: 'Long Break' },
  },
  PETS: {
    crocodile: {
      name: 'Buaya Kece',
      stages: [
        { label: '🥚 Hatchling', image: 'animal_assets/crocodile_0.png', glowClass: 'pet-glow-0' },
        { label: '🐊 Adolescent', image: 'animal_assets/crocodile_1.png', glowClass: 'pet-glow-1' },
        { label: '🦖 Evolved', image: 'animal_assets/crocodile_2.png', glowClass: 'pet-glow-2' },
      ],
    },
    owl: {
      name: 'Hantu Bijak',
      stages: [
        { label: '🥚 Hatchling', image: 'animal_assets/owl_0.png',  glowClass: 'pet-glow-0' },
        { label: '🦉 Adolescent', image: 'animal_assets/owl_1.png',  glowClass: 'pet-glow-1' },
        { label: '🌙 Evolved', image: 'animal_assets/owl_2.png',  glowClass: 'pet-glow-2' },
      ],
    },
  },
  EXP_PER_STAGE: [100, 250, 999999], // EXP needed to reach next stage
  TIPS: [
    'Mulai sesi fokus untuk merawat hewan peliharaanmu! 🐾',
    'Hewan peliharaanmu butuh 25 menit fokus untuk naik level! ⚡',
    'Streak harian membuat hewan lebih bahagia! 🔥',
    'Selesaikan 4 sesi fokus lalu ambil long break! 🌙',
    'Hindari distraksi saat timer berjalan! 🎯',
    'Petdoro = Pet + Pomodoro. Belajar sambil rawat pet! 🍅',
  ],
  ACHIEVEMENTS: [
    { id: 'first_session',  icon: '🍅', title: 'Sesi Pertama',    desc: 'Selesaikan 1 sesi fokus',          check: s => s.totalSessions >= 1 },
    { id: 'sessions_5',     icon: '🔥', title: 'On Fire!',         desc: 'Selesaikan 5 sesi fokus',          check: s => s.totalSessions >= 5 },
    { id: 'sessions_25',    icon: '🎖️', title: 'Dedicated',        desc: 'Selesaikan 25 sesi fokus',         check: s => s.totalSessions >= 25 },
    { id: 'streak_3',       icon: '📅', title: '3 Hari Streak',    desc: 'Fokus 3 hari berturut-turut',      check: s => s.maxStreak >= 3 },
    { id: 'streak_7',       icon: '🗓️', title: 'Seminggu Penuh',   desc: 'Fokus 7 hari berturut-turut',      check: s => s.maxStreak >= 7 },
    { id: 'pet_evolve',     icon: '✨', title: 'Evolusi!',          desc: 'Tingkatkan hewan ke stadium 2',   check: s => s.pets.crocodile.stage >= 1 || s.pets.owl.stage >= 1 },
    { id: 'pet_max',        icon: '🏆', title: 'Pet Master',       desc: 'Capai evolusi tertinggi',          check: s => s.pets.crocodile.stage >= 2 || s.pets.owl.stage >= 2 },
    { id: 'coins_100',      icon: '🪙', title: 'Kolektor Koin',    desc: 'Kumpulkan 100 koin total',         check: s => s.totalCoins >= 100 },
  ],
  MOODS: {
    idle:    { emoji: '😴', text: 'Mengantuk...' },
    happy:   { emoji: '😊', text: 'Senang!' },
    excited: { emoji: '🤩', text: 'Semangat!' },
    running: { emoji: '💪', text: 'Fokus bareng!' },
    break:   { emoji: '😌', text: 'Santai dulu~' },
    petted:  { emoji: '😍', text: 'Manja!' },
  },
};

/* ============================================================
   2. STATE MANAGEMENT
   ============================================================ */
const DEFAULT_STATE = () => ({
  user: { name: 'Trainer', photoUrl: '' },
  activePet: 'crocodile',
  petCustomNames: { crocodile: '', owl: '' }, // custom names per pet
  onboardingDone: false,                       // first-run flag
  pets: {
    crocodile: { stage: 0, exp: 0 },
    owl:       { stage: 0, exp: 0 },
  },
  totalSessions:  0,
  todaySessions:  0,
  totalMinutes:   0,
  totalCoins:     0,
  coins:          0,
  streak:         0,
  maxStreak:      0,
  lastActiveDate: null,
  settings: { sound: true, vibration: true },
  weeklyData:     [0, 0, 0, 0, 0, 0, 0], // Mon-Sun
  unlockedAchievements: [],
  tipDismissed: false,
});

let state = DEFAULT_STATE();

function loadState() {
  try {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = deepMerge(DEFAULT_STATE(), parsed);
    }
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
   3. TIMER MODULE
   ============================================================ */
const Timer = (() => {
  let interval   = null;
  let remaining  = 25 * 60;
  let totalTime  = 25 * 60;
  let mode       = 'focus';
  let isRunning  = false;
  let onTick     = null;
  let onComplete = null;

  function setMode(newMode) {
    if (isRunning) stop();
    mode = newMode;
    const cfg = CONFIG.SESSION_MODES[newMode];
    remaining = cfg.duration;
    totalTime = cfg.duration;
    if (onTick) onTick(remaining, totalTime, false);
  }

  function start(tickCb, completeCb) {
    if (isRunning) return;
    isRunning  = true;
    onTick     = tickCb;
    onComplete = completeCb;
    interval   = setInterval(() => {
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
    const cfg = CONFIG.SESSION_MODES[mode];
    remaining = cfg.duration;
    totalTime = cfg.duration;
    if (onTick) onTick(remaining, totalTime, false);
  }

  function getState() {
    return { remaining, totalTime, mode, isRunning };
  }

  return { setMode, start, pause, stop, reset, getState };
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
      loop:     options.loop !== undefined ? options.loop : true,
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
    userAvatar:      () => document.getElementById('user-avatar'),
    userName:        () => document.getElementById('user-name'),
    streakText:      () => document.getElementById('streak-text'),
    coinsDisplay:    () => document.getElementById('coins-display'),
    expDisplay:      () => document.getElementById('exp-display'),
    levelDisplay:    () => document.getElementById('level-display'),
    xpBar:           () => document.getElementById('xp-bar'),
    xpText:          () => document.getElementById('xp-text'),
    petImage:        () => document.getElementById('pet-image'),
    petStageBadge:   () => document.getElementById('pet-stage-badge'),
    petNameBadge:    () => document.getElementById('pet-name-badge'),
    petMood:         () => document.getElementById('pet-mood'),
    timerDisplay:    () => document.getElementById('timer-display'),
    timerMinutes:    () => document.getElementById('timer-minutes'),
    timerSeconds:    () => document.getElementById('timer-seconds'),
    btnPlay:         () => document.getElementById('btn-play'),
    btnPause:        () => document.getElementById('btn-pause'),
    btnReset:        () => document.getElementById('btn-reset'),
    btnPet:          () => document.getElementById('btn-pet'),
    btnSettings:     () => document.getElementById('btn-settings'),
    sessionDots:     () => document.getElementById('session-dots'),
    statSessions:    () => document.getElementById('stat-sessions'),
    statMinutes:     () => document.getElementById('stat-minutes'),
    statLevel:       () => document.getElementById('stat-level'),
    tipCard:         () => document.getElementById('tip-card'),
    tipText:         () => document.getElementById('tip-text'),
    tipDismiss:      () => document.getElementById('btn-dismiss-tip'),
    lottiesSandclock:() => document.getElementById('lottie-sandclock'),
    auraRing:        () => document.getElementById('aura-ring'),
    // Overlays
    overlayComplete: () => document.getElementById('overlay-complete'),
    completeLottie:  () => document.getElementById('lottie-complete'),
    completeTitle:   () => document.getElementById('complete-title'),
    completeSubtitle:() => document.getElementById('complete-subtitle'),
    completeEmoji:   () => document.getElementById('complete-emoji'),
    rewardCoins:     () => document.getElementById('reward-coins'),
    rewardExp:       () => document.getElementById('reward-exp'),
    btnContinue:     () => document.getElementById('btn-continue'),
    overlayLevelup:  () => document.getElementById('overlay-levelup'),
    levelupLottie:   () => document.getElementById('lottie-levelup'),
    levelupSubtitle: () => document.getElementById('levelup-subtitle'),
    levelupBefore:   () => document.getElementById('levelup-before'),
    levelupAfter:    () => document.getElementById('levelup-after'),
    btnLevelupOk:    () => document.getElementById('btn-levelup-ok'),
    modalSettings:   () => document.getElementById('modal-settings'),
    settingsBackdrop:() => document.getElementById('settings-backdrop'),
    toggleSound:     () => document.getElementById('toggle-sound'),
    toggleVibration: () => document.getElementById('toggle-vibration'),
    btnResetData:    () => document.getElementById('btn-reset-data'),
    toast:           () => document.getElementById('toast'),
    toastIcon:       () => document.getElementById('toast-icon'),
    toastMessage:    () => document.getElementById('toast-message'),
    // Nav
    navItems:        () => document.querySelectorAll('.nav-item'),
    pageHome:        () => document.getElementById('page-home'),
    pageShop:        () => document.getElementById('page-shop'),
    pageStats:       () => document.getElementById('page-stats'),
    sessionBtns:     () => document.querySelectorAll('.session-btn'),
    // Shop
    petCardCroc:     () => document.getElementById('pet-card-crocodile'),
    petCardOwl:      () => document.getElementById('pet-card-owl'),
    btnSelectCroc:   () => document.getElementById('btn-select-crocodile'),
    btnSelectOwl:    () => document.getElementById('btn-select-owl'),
    crocXpBar:       () => document.getElementById('croc-xp-bar'),
    crocXpText:      () => document.getElementById('croc-xp-text'),
    owlXpBar:        () => document.getElementById('owl-xp-bar'),
    owlXpText:       () => document.getElementById('owl-xp-text'),
    crocLevelBadge:  () => document.getElementById('croc-level-badge'),
    owlLevelBadge:   () => document.getElementById('owl-level-badge'),
    crocEvo:         () => [0,1,2].map(i => document.getElementById(`croc-evo-${i}`)),
    owlEvo:          () => [0,1,2].map(i => document.getElementById(`owl-evo-${i}`)),
    // Stats page
    bigStatSessions: () => document.getElementById('big-stat-sessions'),
    bigStatMinutes:  () => document.getElementById('big-stat-minutes'),
    bigStatCoins:    () => document.getElementById('big-stat-coins'),
    bigStatStreak:   () => document.getElementById('big-stat-streak'),
    achievementsList:() => document.getElementById('achievements-list'),
    weeklyChart:     () => document.getElementById('weekly-chart'),
  };

  // ── HEADER ────────────────────────────────────────────────
  function renderHeader() {
    const petKey   = state.activePet;
    const petData  = state.pets[petKey];
    const stageIdx = petData.stage;
    const maxExp   = CONFIG.EXP_PER_STAGE[stageIdx];
    const expPct   = Math.min(100, (petData.exp / maxExp) * 100);
    const level    = stageIdx + 1;

    els.coinsDisplay().textContent    = state.coins;
    els.expDisplay().textContent      = petData.exp;
    els.levelDisplay().textContent    = level;
    els.xpBar().style.width           = `${expPct}%`;
    els.xpText().textContent          = `${petData.exp}/${maxExp} XP`;
    els.streakText().textContent      = `🔥 ${state.streak} day streak`;
    els.statSessions().textContent    = state.totalSessions;
    els.statMinutes().textContent     = state.totalMinutes;
    els.statLevel().textContent       = level;

    // Sync settings modal current pet name
    const customName = (state.petCustomNames?.[petKey] || '').trim();
    const settingsNameEl = document.getElementById('settings-pet-current-name');
    if (settingsNameEl) settingsNameEl.textContent = customName || '–';
  }

  // ── PET ───────────────────────────────────────────────────
  function renderPet() {
    const petKey   = state.activePet;
    const petData  = state.pets[petKey];
    const petCfg   = CONFIG.PETS[petKey];
    const stageCfg = petCfg.stages[petData.stage];
    const customName = (state.petCustomNames?.[petKey] || '').trim();

    const img = els.petImage();
    img.src = stageCfg.image;
    img.className = `w-full h-full object-contain drop-shadow-2xl transition-all duration-500 animate-float ${stageCfg.glowClass}`;

    els.petStageBadge().textContent = stageCfg.label;

    // Update new pet-info-line elements
    const speciesEl = document.getElementById('pet-species-label');
    const levelEl   = document.getElementById('pet-level-label');
    const nameEl    = document.getElementById('pet-custom-name');
    if (speciesEl) speciesEl.textContent = petCfg.name;
    if (levelEl)   levelEl.textContent   = `Lv. ${petData.stage + 1}`;
    if (nameEl)    nameEl.textContent     = customName || '–';
  }

  // ── TIMER ─────────────────────────────────────────────────
  function renderTimer(remaining, _total, isRunning) {
    const m   = Math.floor(remaining / 60);
    const s   = remaining % 60;
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
    const play  = els.btnPlay();
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
    if (visible) {
      sc.style.opacity = '0.6';
      ar.classList.add('running');
    } else {
      sc.style.opacity = '0';
      ar.classList.remove('running');
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
    const done  = state.todaySessions % 4;
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.className = `session-dot${i < done ? ' filled' : ''}`;
      dotsEl.appendChild(dot);
    }
  }

  // ── PET SHOP ──────────────────────────────────────────────
  function renderShop() {
    const pets = ['crocodile', 'owl'];
    pets.forEach(petKey => {
      const petData  = state.pets[petKey];
      const stage    = petData.stage;
      const exp      = petData.exp;
      const maxExp   = CONFIG.EXP_PER_STAGE[stage];
      const pct      = Math.min(100, (exp / maxExp) * 100);
      const isActive = state.activePet === petKey;

      // XP bar
      const xpBar  = petKey === 'crocodile' ? els.crocXpBar() : els.owlXpBar();
      const xpText = petKey === 'crocodile' ? els.crocXpText() : els.owlXpText();
      if (xpBar)  xpBar.style.width = `${pct}%`;
      if (xpText) xpText.textContent = `${exp}/${maxExp}`;

      // Level badge
      const lvlBadge = petKey === 'crocodile' ? els.crocLevelBadge() : els.owlLevelBadge();
      if (lvlBadge) lvlBadge.textContent = `Lv ${stage + 1}`;

      // Evo stages
      const evoEls = petKey === 'crocodile' ? els.crocEvo() : els.owlEvo();
      evoEls.forEach((el, i) => {
        if (!el) return;
        el.classList.toggle('reached', i <= stage);
      });

      // Card selected state
      const card = petKey === 'crocodile' ? els.petCardCroc() : els.petCardOwl();
      if (card) card.classList.toggle('selected', isActive);

      // Select button state
      const btn = petKey === 'crocodile' ? els.btnSelectCroc() : els.btnSelectOwl();
      if (btn) {
        btn.classList.toggle('active-pet', isActive);
        btn.innerHTML = isActive
          ? '<i data-lucide="check-circle" class="w-4 h-4"></i> Aktif!'
          : `<i data-lucide="check" class="w-4 h-4"></i> Pilih ${petKey === 'crocodile' ? 'Buaya' : 'Hantu'}`;
        lucide.createIcons({ icons: {}, nameAttr: 'data-lucide', attrs: {}, nodes: [btn] });
      }
    });
  }

  // ── STATS PAGE ────────────────────────────────────────────
  function renderStats() {
    els.bigStatSessions().textContent = state.totalSessions;
    els.bigStatMinutes().textContent  = state.totalMinutes;
    els.bigStatCoins().textContent    = state.totalCoins;
    els.bigStatStreak().textContent   = state.maxStreak;

    renderAchievements();
    renderWeeklyChart();
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
    const days   = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const data   = state.weeklyData;
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
    renderStats,
    renderAll,
    renderTip,
  };
})();

/* ============================================================
   5b. ONBOARDING MODULE
   ============================================================ */
const Onboarding = (() => {
  let selectedPet  = null;
  let petNameValue = '';
  let currentStep  = 1;

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
    const toEl   = getEl(`ob-panel-${to}`);
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
      const card  = getEl(`ob-card-${p}`);
      const ring  = getEl(`ob-ring-${p}`);
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
    const previewEl   = getEl('ob-preview');
    const emojiEl     = getEl('ob-preview-emoji');
    const textEl      = getEl('ob-preview-text');
    if (!previewEl) return;

    const petEmojis = { crocodile: '🐊', owl: '🦉' };
    const nameStr   = petNameValue.trim();
    const petStr    = selectedPet ? petEmojis[selectedPet] : null;

    const ready = petStr && nameStr.length >= 2;
    previewEl.style.opacity   = ready ? '1' : '0';
    previewEl.style.transform = ready ? 'translateY(0)' : 'translateY(6px)';

    if (ready && emojiEl && textEl) {
      emojiEl.textContent = petStr;
      const petName = CONFIG.PETS[selectedPet].name;
      textEl.textContent = `“${nameStr}” – ${petName} Lv. 1`;
    }
  }

  // ── Validate start button ─────────────────────────────────
  function validateStartBtn() {
    const btn     = getEl('btn-ob-start');
    const hintEl  = getEl('ob-name-hint');
    if (!btn) return;
    const nameOk = petNameValue.trim().length >= 2;
    const petOk  = !!selectedPet;
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
    overlay.style.opacity    = '0';
    overlay.style.transform  = 'scale(0.96)';
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
    selectedPet  = null;
    petNameValue = '';
    currentStep  = 1;
    updateStepDots(1);

    // Reset panels
    const p1 = getEl('ob-panel-1');
    const p2 = getEl('ob-panel-2');
    if (p1) p1.classList.remove('hidden', 'ob-exit', 'ob-enter');
    if (p2) p2.classList.add('hidden');

    // Animate in
    overlay.classList.remove('hidden');
    overlay.style.opacity   = '0';
    overlay.style.transform = 'scale(1.04)';
    overlay.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.opacity   = '1';
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
    const nameInput  = getEl('ob-pet-name-input');
    const countEl    = getEl('ob-name-count');
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

    const petKey    = state.activePet;
    const cfg       = CONFIG.SESSION_MODES[mode];
    const petData   = state.pets[petKey];
    const oldStage  = petData.stage;

    // Add rewards
    state.coins          += cfg.coins;
    state.totalCoins     += cfg.coins;
    state.totalSessions  += 1;
    state.todaySessions  += 1;
    state.totalMinutes   += Math.round(cfg.duration / 60);

    // Update weekly data (day of week 0=Mon)
    const dayIdx = (new Date().getDay() + 6) % 7;
    state.weeklyData[dayIdx] = (state.weeklyData[dayIdx] || 0) + 1;

    // Add EXP to active pet
    petData.exp += cfg.exp;

    // Update streak
    updateStreak();

    // Check evolution
    let evolved = false;
    const maxExp = CONFIG.EXP_PER_STAGE[petData.stage];
    if (petData.stage < 2 && petData.exp >= maxExp) {
      petData.exp  -= maxExp;
      petData.stage += 1;
      evolved = true;
    }

    // Check achievements
    const newAchievements = checkAchievements();

    saveState();

    // Show complete overlay
    showFocusComplete(cfg.coins, cfg.exp, evolved, oldStage, petData.stage, newAchievements);

    // Update stats UI
    UI.renderHeader();
    UI.renderSessionDots();
  }

  function showFocusComplete(coins, exp, evolved, oldStage, newStage, newAchievements) {
    const petKey   = state.activePet;
    const petCfg   = CONFIG.PETS[petKey];

    // Set reward overlay content
    const overlay = UI.els.overlayComplete();
    const lottieEl = document.getElementById('lottie-complete');

    UI.els.completeTitle().textContent    = 'Sesi Selesai! 🎉';
    UI.els.completeSubtitle().textContent = `${petCfg.name}mu senang!`;
    UI.els.completeEmoji().textContent    = '🎉';
    UI.els.rewardCoins().textContent      = `+${coins}`;
    UI.els.rewardExp().textContent        = `+${exp} XP`;

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
    UI.els.completeTitle().textContent    = 'Break Selesai! ☕';
    UI.els.completeSubtitle().textContent = 'Siap untuk sesi fokus berikutnya?';
    UI.els.completeEmoji().textContent    = '☕';
    UI.els.rewardCoins().textContent      = '';
    UI.els.rewardExp().textContent        = '';
    overlay.classList.remove('hidden');
    LottieManager.load('lottie-complete', 'animation_assets/coffeebreak.json', { loop: true, autoplay: true });
    UI.els.btnContinue().onclick = () => {
      overlay.classList.add('hidden');
      LottieManager.destroy('lottie-complete');
    };
  }

  function showLevelUp(petKey, oldStage, newStage) {
    const petCfg    = CONFIG.PETS[petKey];
    const overlay   = UI.els.overlayLevelup();

    UI.els.levelupSubtitle().textContent = `${petCfg.name} berevolusi ke stadium ${newStage + 1}!`;
    UI.els.levelupBefore().src           = petCfg.stages[oldStage].image;
    UI.els.levelupAfter().src            = petCfg.stages[newStage].image;

    overlay.classList.remove('hidden');
    LottieManager.load('lottie-levelup', 'animation_assets/level up.json', { loop: true, autoplay: true });

    UI.els.btnLevelupOk().onclick = () => {
      overlay.classList.add('hidden');
      LottieManager.destroy('lottie-levelup');
      UI.renderPet();
    };
  }

  function updateStreak() {
    const today    = new Date().toDateString();
    const lastDate = state.lastActiveDate;

    if (!lastDate) {
      state.streak         = 1;
      state.lastActiveDate = today;
    } else if (lastDate === today) {
      // Already counted today
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toDateString()) {
        state.streak        += 1;
        state.lastActiveDate = today;
      } else {
        state.streak         = 1;
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
  const pages = { home: 'page-home', shop: 'page-shop', stats: 'page-stats' };
  let   currentPage = 'home';

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
    if (page === 'shop')  UI.renderShop();
    if (page === 'stats') UI.renderStats();
    if (page === 'home')  UI.renderTip();
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
  document.getElementById('toast-icon').textContent    = icon;
  document.getElementById('toast-message').textContent = message;
  toastEl.style.opacity     = '1';
  toastEl.style.transform   = 'translateX(-50%) translateY(0)';
  toastEl.style.pointerEvents = 'none';

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.style.opacity   = '0';
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
    state.user.name     = user.first_name + (user.last_name ? ' ' + user.last_name : '');
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
      const audioCtx  = getCtx();
      const oscillator = audioCtx.createOscillator();
      const gainNode   = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type       = type;
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
    setTimeout(() => beep(784, 0.3,  'sine', 0.4), 300);
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
    });

    // Pet button
    document.getElementById('btn-pet').addEventListener('click', () => {
      Game.petThePet();
    });

    // Session mode buttons
    document.querySelectorAll('.session-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (Timer.getState().isRunning) {
          showToast('⏸️', 'Hentikan timer dulu sebelum ganti mode!');
          return;
        }
        document.querySelectorAll('.session-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const mode = btn.dataset.mode;
        Timer.setMode(mode);
        UI.setMood(mode === 'focus' ? 'happy' : 'break');
        UI.setSandclockVisible(false);
        LottieManager.destroy('lottie-sandclock');

        const ts = Timer.getState();
        UI.renderTimer(ts.remaining, ts.totalTime, false);
      });
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
      const input    = document.getElementById('settings-pet-name-input');
      const newName  = input?.value.trim();
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

    // Pet selector (shop)
    document.querySelectorAll('.select-pet-btn').forEach(btn => {

      btn.addEventListener('click', () => {
        const pet = btn.dataset.pet;
        if (pet && CONFIG.PETS[pet]) {
          const wasActive = state.activePet === pet;
          if (!wasActive) {
            state.activePet = pet;
            saveState();
            UI.renderPet();
            UI.renderShop();
            UI.renderHeader();
            showToast('🐾', `${CONFIG.PETS[pet].name} dipilih!`);
          }
        }
      });
    });

    // Pet card click (shop) – also triggers selection
    document.querySelectorAll('.pet-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.select-pet-btn')) return;
        const pet = card.dataset.pet;
        if (pet) card.querySelector('.select-pet-btn')?.click();
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
    document.getElementById('toggle-sound').checked     = state.settings.sound;
    document.getElementById('toggle-vibration').checked = state.settings.vibration;
  }

  // ── ROTATE TIPS ───────────────────────────────────────────
  function startTipRotation() {
    setInterval(() => {
      if (!state.tipDismissed) {
        const tip = CONFIG.TIPS[Math.floor(Math.random() * CONFIG.TIPS.length)];
        const el  = document.getElementById('tip-text');
        if (el) el.textContent = tip;
      }
    }, 30000);
  }

  // ── STREAK CHECK ──────────────────────────────────────────
  function checkStreakOnLoad() {
    if (!state.lastActiveDate) return;
    const today     = new Date().toDateString();
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
