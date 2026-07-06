window.Game = {
  state: {
    level: 1, puzzle: [], solution: [], playerBoard: [], notes: [], timer: 0, timerInterval: null,
    selectedCell: null, history: [], isNotesMode: false, isPaused: false, musicEnabled: true, sfxEnabled: true,
    hintsAvailable: 3, highlighting: true, darkTheme: false,
    lang: localStorage.getItem('sudoku_lang') || 'ru', musicVolume: 0.5, sfxVolume: 0.5
  },

  i18n: {
    ru: {
      btnPlay: "▶ Играть", btnContinue: "▶ Продолжить", btnSettings: "⚙️ Настройки", btnControls: "🎮 Управление", btnRules: "📖 Правила", btnInfo: "ℹ️ Информация",
      pauseTitle: "Пауза", pauseContinue: "▶ Продолжить", pauseRestart: "🔄 Перезагрузить уровень", pauseSettings: "⚙️ Настройки", pauseRules: "📖 Правила", pauseInfo: "ℹ️ Информация", pauseControls: "🎮 Управление", pauseExit: "🚪 На стартовый экран",
      settingsTitle: "⚙️ Настройки", settingMusic: "🎵 Музыка", settingSFX: "🔊 Звуки", settingHighlight: "✨ Подсветка", settingDark: "🌙 Тёмная тема", settingDone: "✓ Готово",
      rulesTitle: "📖 Правила", rulesBack: "⬅ В меню",
      rulesContent: `🎯 <b>Цель игры:</b><br>Заполни поле 9×9 цифрами от 1 до 9 так, чтобы в каждом столбце, строке и квадрате 3×3 цифра встречалась только один раз.<br><br>✏️ <b>Заметки:</b><br>Включив этот режим, можно заполнять ячейки несколькими цифрами сразу.<br><br>💡 <b>Помощь:</b><br>Исправление ошибки. Если ошибок нет, то заполняется пустая ячейка.<br><br>↩️ <b>Отмена:</b><br>Отмена последнего действия.<br><br>✨ <b>Подсветка:</b><br>При выделении ячейки подсвечиваются квадрат 3×3, столбец, строка и все ячейки с таким же значением.`,
      infoTitle: "ℹ️ Информация", infoBack: "⬅ В меню",
      infoContent: "Спасибо, что играете в эту игру!<br><br>Я очень люблю судоку и постарался добавить сюда всё, что мне нравилось в подобных играх, и убрать то, что доставляло неудобства.<br><br>Если у вас есть вопросы, предложения или вы нашли ошибку — напишите мне:<br> pandagdev@outlook.com<br><br>Или в одной из соцсетей, указанных на странице игры.<br><br><small style='opacity: 0.7'>Версия: 1.0</small>",
      controlsTitle: "🎮 Управление", controlsBack: "⬅ В меню", restartTitle: "Перезапуск уровня", restartText: "Начать уровень заново?<br>Весь текущий прогресс и заметки будут потеряны.",
      restartYes: "🔄 Да", restartNo: "❌ Нет", hintTitle: "Помощь", hintText: "Использовать одну подсказку?<br>Осталось: <span id='hint-modal-counter'>3</span>",
      hintYes: "✅ Да", hintNo: "❌ Нет", winTitle: "Уровень пройден!", winTime: "Время:", winNext: "Следующий уровень",
      notesLabel: "Заметки", hintLabel: "Помощь", undoLabel: "Отмена", alertNoHints: "⚠️ Подсказки закончились!", levelPrefix: "Уровень:",
      menuTitle: "Судоку", menuSubtitle: "Классика", menuSubtitle2: "Бесконечные Уровни",
      hintBuyTitle: "Подсказка за звезду",
      hintBuyText: "Бесплатные подсказки закончились.<br>Купить одну подсказку за 1⭐?",
      hintBuyYes: "✅ Да",
      hintBuyNo: "❌ Нет",
      debugTitle: "Переход на уровень", debugGo: "✅ Перейти", debugCancel: "❌ Отмена"
    },
    en: {
      btnPlay: "▶ Play", btnContinue: "▶ Continue", btnSettings: "⚙️ Settings", btnControls: "🎮 Controls", btnRules: "📖 Rules", btnInfo: "ℹ️ Info",
      pauseTitle: "Pause", pauseContinue: "▶ Continue", pauseRestart: "🔄 Restart Level", pauseSettings: "⚙️ Settings", pauseRules: "📖 Rules", pauseInfo: "ℹ️ Info", pauseControls: "🎮 Controls", pauseExit: "🚪 Exit to Menu",
      settingsTitle: "⚙️ Settings", settingMusic: "🎵 Music", settingSFX: "🔊 Sound Effects", settingHighlight: "✨ Highlight", settingDark: "🌙 Dark Theme", settingDone: "✓ Done",
      rulesTitle: "📖 Rules", rulesBack: "⬅ Back",
      rulesContent: `🎯 <b>How to Play</b><br>Fill the 9×9 grid with numbers from 1 to 9 so that each column, row and 3×3 square contains each number exactly once.<br><br>✏️ <b>Notes:</b><br>In this mode, you can add multiple candidate numbers to a single cell.<br><br>💡 <b>Hint:</b><br>Corrects a mistake. If there are no mistakes, it fills in an empty cell.<br><br>↩️ <b>Undo:</b><br>Undo your last move.<br><br>✨ <b>Highlight:</b><br>When you select a cell, it highlights its 3×3 box, row, column, and all cells with the same number.`,
      infoTitle: "ℹ️ Info", infoBack: "⬅ Back",
      infoContent: "Thanks for playing this game!<br><br>I really love sudoku, so I've tried to include everything I've enjoyed in similar games, while removing the things that felt annoying.<br><br>If you have any questions, suggestions, or if you've found a bug — feel free to email me:<br>📧 pandagdev@outlook.com<br><br>Or reach out via social media links on the game's page.<br><br><small style='opacity: 0.7'>Version: 1.0</small>",
      controlsTitle: "🎮 Controls", controlsBack: "⬅ Back", restartTitle: "Restart Level", restartText: "Restart level?<br>All current progress and notes will be lost.",
      restartYes: "🔄 Yes", restartNo: "❌ No", hintTitle: "Hint", hintText: "Use one hint?<br>Remaining: <span id='hint-modal-counter'>3</span>",
      hintYes: "✅ Yes", hintNo: "❌ No", winTitle: "Level Completed!", winTime: "Time:", winNext: "Next Level",
      notesLabel: "Notes", hintLabel: "Hint", undoLabel: "Undo", alertNoHints: "⚠️ No hints left!", levelPrefix: "Level:",
      menuTitle: "Sudoku", menuSubtitle: "Classic", menuSubtitle2: "Infinite Levels",
      hintBuyTitle: "Hint for Star",
      hintBuyText: "No free hints left.<br>Buy one hint for 1⭐?",
      hintBuyYes: "✅ Yes",
      hintBuyNo: "❌ No",
      debugTitle: "Go to Level", debugGo: "✅ Go", debugCancel: "❌ Cancel"
    }
  },

  async init() {
    
    this.sounds = {};
    this.bgmOffset = 0;
    this.bgmStartTime = 0;
    this._sdkPaused = false;
    this._isBGMStarting = false;

    this.cacheDOM();
    this.loadSettings();
    await PlatformAPI.init();

    if (window.detectedLang) {
      this.state.lang = window.detectedLang;
      localStorage.setItem('sudoku_lang', window.detectedLang);
    }

    window.addEventListener('vkThemeChange', (e) => {
      const isDark = e.detail === 'dark';
      if (this.state.darkTheme !== isDark) {
        this.state.darkTheme = isDark;
        this.applyDarkTheme();
        this.saveSettings();
      }
    });

    this.updateLanguageUI();
    this.checkSavedGame();
    this.bindEvents();
    this.showMenu();

    // ✅ Восстанавливаем количество подсказок из сохранённой игры
    const savedGame = localStorage.getItem('sudoku_saved_game');
    if (savedGame) {
      try {
        const gs = JSON.parse(savedGame);
        // ✅ Используем !== undefined, чтобы 0 не превращался в 3
        if (gs && gs.hintsAvailable !== undefined) {
          this.state.hintsAvailable = gs.hintsAvailable;
          this.updateHintUI();
        }
      } catch(e) {}
    }

    document.body.classList.add('loaded');

    this.initAudio();

    window.addEventListener('beforeunload', () => { this.saveGameState(); });
    this.initAutoScale();

    const handleTabVisibility = () => {
      
      if (document.hidden) {
        if (this.state.musicEnabled) this.stopBGM();
        this.stopTimer();
        this.updateGameplayAPI(false);
      } else {
        if (!this._sdkPaused) {
          if (this.state.musicEnabled) { 
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
              this.audioCtx.resume().catch(() => {});
            }
            
            setTimeout(() => { 
              if (this.state.musicEnabled && !this.bgmSource && this.screens.menu.classList.contains('hidden')) {
                this.playBGM(); 
              }
            }, 300);
          }
          
          if (this.screens.menu.classList.contains('hidden') && 
              this.screens.pause.classList.contains('hidden') && 
              this.screens.win.classList.contains('hidden')) {
            this.startTimer();
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleTabVisibility);
    document.addEventListener('webkitvisibilitychange', handleTabVisibility);
    
  },

  cacheDOM() {
    this.screens = { menu: document.getElementById('menu'), game: document.getElementById('game'), win: document.getElementById('win-screen'), pause: document.getElementById('pause-modal'), settings: document.getElementById('settings-modal'), rules: document.getElementById('rules-modal'), info: document.getElementById('info-modal'), controls: document.getElementById('controls-modal'), restartConfirm: document.getElementById('restart-confirm-modal'), hintConfirm: document.getElementById('hint-confirm-modal'), hintBuy: document.getElementById('hint-buy-modal') };
    this.els = { menuLevel: document.getElementById('menu-level'), levelNum: document.getElementById('level-num'), board: document.getElementById('board'), timer: document.getElementById('timer'), winTime: document.getElementById('win-time'), btnNotes: document.getElementById('btn-notes'), btnHint: document.getElementById('btn-hint'), hintCounter: document.getElementById('hint-counter'), hintModalCounter: document.getElementById('hint-modal-counter'), toggleMusic: document.getElementById('toggle-music'), toggleSFX: document.getElementById('toggle-sfx'), musicVolumeSlider: document.getElementById('volume-slider'), sfxVolumeSlider: document.getElementById('sfx-volume-slider'), toggleHighlight: document.getElementById('toggle-highlight'), toggleDarkTheme: document.getElementById('toggle-dark-theme'), langToggle: document.getElementById('btn-lang-toggle') };
    this.debugModal = document.getElementById('debug-level-modal');
    this.debugInput = document.getElementById('debug-level-input');
    this.debugGoBtn = document.getElementById('debug-level-go');
    this.debugCancelBtn = document.getElementById('debug-level-cancel');
    this.debugMinus = document.getElementById('debug-minus');
    this.debugPlus = document.getElementById('debug-plus');
    
    this.wrapViewport('game', 'game-content'); this.wrapViewport('menu', 'menu-content'); this.wrapViewport('controls-modal', 'controls-content');
  },

  wrapViewport(screenId, wrapperId) {
    const el = document.getElementById(screenId); if (!el || document.getElementById(wrapperId)) return;
    const wrapper = document.createElement('div'); wrapper.id = wrapperId; while (el.firstChild) wrapper.appendChild(el.firstChild); el.appendChild(wrapper);
  },

  async initAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContext();

    // Загружаем музыку как AudioBuffer (нужно для сохранения позиции offset)
    try {
      const res = await fetch('sounds/music.ogg');
      this.sounds = { music: await this.audioCtx.decodeAudioData(await res.arrayBuffer()) };
    } catch (e) {
      this.sounds = {};
    }
  },

  updateMusicVolume(val) {
    this.state.musicVolume = val;
    // ✅ Мгновенно применяем громкость к играющему потоку
    if (this.bgmGain) {
      this.bgmGain.gain.value = val; // Убрал умножение на 0.5, чтобы ползунок 0.0-1.0 работал прямо
    }
  },
  
  updateSFXVolume(val) { 
    this.state.sfxVolume = val; 
    // Громкость применяется при воспроизведении, менять её в буферах не нужно
  },  
  
  async playBGM() {
    if (!this.state.musicEnabled || !this.audioCtx) {
      return;
    }
    
    // ✅ Если файл ещё не загрузился — ждём и пробуем снова
    if (!this.sounds?.music) {
      setTimeout(() => this.playBGM(), 100);
      return;
    }
    
    // ✅ КРИТИЧНО: если уже играет — НЕ запускаем второй раз
    if (this.bgmSource) {
      return;
    }

    // ✅ Разблокируем AudioContext при первом клике/возврате на вкладку
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume().catch(e => console.warn('Resume failed:', e));
    }
    
    if (this.audioCtx.state !== 'running') {
      return;
    }

    this.bgmSource = this.audioCtx.createBufferSource();
    this.bgmSource.buffer = this.sounds.music;
    this.bgmSource.loop = true;

    // ✅ Сохраняем gainNode в this.bgmGain
    this.bgmGain = this.audioCtx.createGain();
    this.bgmGain.gain.value = this.state.musicVolume;

    this.bgmSource.connect(this.bgmGain).connect(this.audioCtx.destination);
    this.bgmStartTime = this.audioCtx.currentTime;

    console.log(`▶️ Запуск музыки с позиции: ${this.bgmOffset.toFixed(2)}с`);
    this.bgmSource.start(0, this.bgmOffset);

    this.bgmSource.onended = () => {
      this.bgmSource = null;
      this.bgmOffset = 0;
    };
    
  },
  
  stopBGM() {
    if (this.bgmSource && this.sounds?.music) {
      const duration = this.sounds.music.duration;
      if (duration > 0) {
        const elapsed = this.audioCtx.currentTime - this.bgmStartTime;
        // Безопасный modulo
        this.bgmOffset = ((elapsed % duration) + duration) % duration;
      }
      
      // ⚠️ Отключаем onended, чтобы он не сбросил offset в 0
      this.bgmSource.onended = null;
      
      try {
        this.bgmSource.stop();
      } catch (e) {
        // Игнорируем ошибку
      }
      
      this.bgmSource = null;
      this._isBGMStarting = false; // ✅ Сбрасываем флаг
      console.log('⏹️ Музыка остановлена, offset:', this.bgmOffset.toFixed(2) + 'с');
    }
  },
  
  playSound(key) {
    if (!this.state.sfxEnabled) return;
    
    const urls = {
      click: 'sounds/click.mp3',
      win: 'sounds/win.mp3'
    };

    if (!urls[key]) return;

    // Создаём обычный HTML5-аудиообъект на лету (браузер кэширует файлы)
    const audio = new Audio(urls[key]);
    audio.volume = this.state.sfxVolume;
    audio.play().catch(() => {}); // Тихо игнорируем блокировку автоплея
  },

  loadSettings() {
    const saved = localStorage.getItem('sudoku_settings');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        this.state.musicEnabled = s.musicEnabled !== undefined ? s.musicEnabled : true;
        this.state.sfxEnabled = s.sfxEnabled !== undefined ? s.sfxEnabled : true;
        this.state.highlighting = s.highlighting !== undefined ? s.highlighting : true;
        this.state.darkTheme = s.darkTheme !== undefined ? s.darkTheme : false;
        this.state.musicVolume = s.musicVolume !== undefined ? s.musicVolume : 0.5;
        this.state.sfxVolume = s.sfxVolume !== undefined ? s.sfxVolume : 0.5;
      } catch (e) { console.error(e); }
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) this.state.darkTheme = true;
    }
    this.applyDarkTheme(); this.updateMusicVolume(this.state.musicVolume); this.updateSFXVolume(this.state.sfxVolume);
  },
  saveSettings() { localStorage.setItem('sudoku_settings', JSON.stringify({ musicEnabled: this.state.musicEnabled, sfxEnabled: this.state.sfxEnabled, musicVolume: this.state.musicVolume, sfxVolume: this.state.sfxVolume, highlighting: this.state.highlighting, darkTheme: this.state.darkTheme })); },
  applyDarkTheme() { if (this.state.darkTheme) document.body.classList.add('dark-theme'); else document.body.classList.remove('dark-theme'); this.updateControlsVisibility(); },

  autoScale() { this.scaleGameField(); this.scaleMenu(); this.scaleControls(); this.scaleModals(); },
  
  scaleGameField() {
    const gameEl = document.getElementById('game-content'); if (!gameEl || gameEl.parentElement.classList.contains('hidden')) return;
    gameEl.style.transform = ''; void gameEl.offsetWidth;
    const gw = gameEl.scrollWidth, gh = gameEl.scrollHeight, vw = window.innerWidth, vh = window.innerHeight, padding = 24;
    const scale = Math.min((vw - padding) / gw, (vh - padding) / gh);
    const finalScale = (window.innerWidth >= 600 && window.innerWidth < 1100) ? Math.max(0.25, Math.min(3.0, scale)) : Math.max(0.25, Math.min(1.0, scale));
    gameEl.style.transform = `scale(${finalScale})`; gameEl.style.transformOrigin = 'center center';
  },

  scaleMenu() {
    const menuEl = document.getElementById('menu-content'); if (!menuEl || menuEl.parentElement.classList.contains('hidden')) return;
    menuEl.style.transform = ''; void menuEl.offsetWidth;
    const mw = menuEl.scrollWidth, mh = menuEl.scrollHeight, vw = window.innerWidth, vh = window.innerHeight, padding = 24;
    const scale = Math.min((vw - padding) / mw, (vh - padding) / mh);
    const finalScale = (window.innerWidth >= 600 && window.innerWidth < 1100) ? Math.max(0.25, Math.min(3.0, scale)) : Math.max(0.25, Math.min(1.0, scale));
    menuEl.style.transform = `scale(${finalScale})`; menuEl.style.transformOrigin = 'center center';
  },

  scaleControls() {
    const controlsEl = document.getElementById('controls-content'); if (!controlsEl || controlsEl.parentElement.classList.contains('hidden')) return;
    controlsEl.style.transform = ''; void controlsEl.offsetWidth;
    const cw = controlsEl.scrollWidth, ch = controlsEl.scrollHeight, vw = window.innerWidth, vh = window.innerHeight, padding = 40;
    const scale = Math.min((vw - padding) / cw, (vh - padding) / ch);
    controlsEl.style.transform = `scale(${Math.max(0.25, Math.min(1.0, scale))})`; controlsEl.style.transformOrigin = 'center center';
  },

  scaleModals() {
    const vh = window.innerHeight, maxH = vh * 0.88;
    const modals = [
      { id: 'pause-modal', sel: '.pause-menu' }, { id: 'settings-modal', sel: '.pause-menu' }, { id: 'rules-modal', sel: '.pause-menu' }, { id: 'info-modal', sel: '.pause-menu' },
      { id: 'restart-confirm-modal', sel: '.modal' }, { id: 'hint-confirm-modal', sel: '.modal' }, 
      { id: 'debug-level-modal', sel: '.modal' }
    ];
    modals.forEach(({ id, sel }) => {
      const overlay = document.getElementById(id); if (!overlay || overlay.classList.contains('hidden')) return;
      const content = overlay.querySelector(sel); if (!content) return;
      content.style.transform = ''; void content.offsetHeight;
      const h = content.scrollHeight;
      content.style.transform = (h > maxH) ? `scale(${Math.max(0.4, Math.min(1, maxH / h))})` : '';
      content.style.transformOrigin = 'center center';
    });
    const controlsOverlay = document.getElementById('controls-modal');
    if (controlsOverlay && !controlsOverlay.classList.contains('hidden')) {
      const box = controlsOverlay.querySelector('.controls-box-image'), iframe = controlsOverlay.querySelector('#controls-iframe');
      if (box) { box.style.transform = ''; box.style.transformOrigin = ''; }
      if (iframe) { iframe.style.transform = ''; iframe.style.width = ''; iframe.style.height = ''; iframe.style.maxWidth = ''; }
    }
  },

  initAutoScale() { 
    this.autoScale();
    let resizeTimer;
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (Math.abs(w - lastW) > 30 || Math.abs(h - lastH) > 30) {
          lastW = w; lastH = h; this.autoScale();
        }
      }, 100);
    });
    
    window.addEventListener('orientationchange', () => { setTimeout(() => this.autoScale(), 150); });
  },

  showMenu() {
    this.stopTimer(); this.state.isPaused = false; 
    this.screens.menu.classList.remove('hidden'); this.screens.game.classList.add('hidden'); this.screens.win.classList.add('hidden'); this.screens.pause.classList.add('hidden');
    this.screens.settings.classList.add('hidden'); this.screens.rules.classList.add('hidden'); this.screens.info.classList.add('hidden');
    this.screens.controls.classList.add('hidden'); this.screens.restartConfirm.classList.add('hidden'); this.screens.hintConfirm.classList.add('hidden');
    if (this.debugModal) this.debugModal.classList.add('hidden');
    this.els.menuLevel.textContent = this.state.level; this.checkSavedGame(); setTimeout(() => this.autoScale(), 50);
    
    // ✅ Запуск игры (стартовый экран) = active
    this.updateGameplayAPI(true);
  },
  showGame() {
    this.screens.menu.classList.add('hidden'); this.screens.game.classList.remove('hidden'); this.screens.win.classList.add('hidden'); this.screens.pause.classList.add('hidden'); this.screens.settings.classList.add('hidden');
    this.screens.rules.classList.add('hidden'); this.screens.info.classList.add('hidden'); this.screens.controls.classList.add('hidden'); this.screens.restartConfirm.classList.add('hidden'); this.screens.hintConfirm.classList.add('hidden'); 
    if (this.debugModal) this.debugModal.classList.add('hidden');
    setTimeout(() => this.autoScale(), 50);
  },
  showPauseMenu() { 
    this.saveGameState(); 
    this.state.isPaused = true; 
    this.stopTimer(); 
    this.screens.pause.classList.remove('hidden'); 
    this.updateGameplayAPI(false); // ✅ Пауза
    setTimeout(() => this.autoScale(), 50); 
  },
  hidePauseMenu() { 
    this.state.isPaused = false; 
    this.screens.pause.classList.add('hidden'); 
    this.startTimer(); 
    this.updateGameplayAPI(true); // ✅ Возобновление
  },  
  
  requestGameFullscreen() {
    // В VK Mini Apps игры автоматически разворачиваются на весь экран
    // Нативный фоллбэк для локального теста
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1100;
    if (!isMobile) return;

    const el = document.documentElement;
    try {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (e) {
      console.warn('📱 Fullscreen blocked (gesture/policy)');
    }
  },

  async startLevel() {
    const { puzzle, solution } = SudokuGen.generatePuzzle(this.state.level);
    this.state.puzzle = puzzle; this.state.solution = solution; this.state.playerBoard = puzzle.map(row => [...row]);
    this.state.notes = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
    this.state.timer = 0; this.state.history = []; this.state.selectedCell = null; this.state.isPaused = false; this.state.isNotesMode = false;
    this.state.hintsAvailable = 3; this.els.btnNotes.classList.remove('active'); this.updateHintUI();
    
    this.renderBoard(); this.els.levelNum.textContent = this.state.level; this.showGame();
    this.startTimer(); this.playBGM();
    PlatformAPI.saveProgress(this.state.level);
    
    // ✅ Игровое поле = active
    this.updateGameplayAPI(true);
  },

  renderBoard() {
    this.els.board.innerHTML = '';
    let hlRow = -1, hlCol = -1, hlBoxStartR = -1, hlBoxStartC = -1, hlNum = 0;
    if (this.state.selectedCell && this.state.highlighting) {
      hlRow = this.state.selectedCell.r; hlCol = this.state.selectedCell.c; hlBoxStartR = Math.floor(hlRow / 3) * 3; hlBoxStartC = Math.floor(hlCol / 3) * 3;
      const selVal = this.state.playerBoard[hlRow][hlCol]; if (selVal !== 0) hlNum = selVal;
    }
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div'); cell.className = 'cell'; cell.dataset.r = r; cell.dataset.c = c;
      if (c % 3 === 2 && c < 8) cell.classList.add('box-border-right'); if (r % 3 === 2 && r < 8) cell.classList.add('box-border-bottom');
      if (this.state.selectedCell && this.state.highlighting) {
        if (r === hlRow) cell.classList.add('hl-row'); if (c === hlCol) cell.classList.add('hl-col');
        if (r >= hlBoxStartR && r < hlBoxStartR + 3 && c >= hlBoxStartC && c < hlBoxStartC + 3) cell.classList.add('hl-box');
        if (hlNum !== 0 && this.state.playerBoard[r][c] === hlNum) cell.classList.add('hl-num');
      }
      const val = this.state.playerBoard[r][c];
      if (val !== 0) { cell.textContent = val; if (this.state.puzzle[r][c] !== 0) cell.classList.add('given'); else cell.classList.add('user'); }
      else { const notes = this.state.notes[r][c]; if (notes && notes.length > 0) { const grid = document.createElement('div'); grid.className = 'notes-grid'; for(let n=1; n<=9; n++) { const span = document.createElement('span'); span.className = 'note-item'; span.textContent = notes.includes(n) ? n : ''; grid.appendChild(span); } cell.appendChild(grid); } }
      if (this.state.selectedCell && this.state.selectedCell.r === r && this.state.selectedCell.c === c) cell.classList.add('selected');
      cell.addEventListener('click', () => this.selectCell(r, c)); this.els.board.appendChild(cell);
    }
  },
  selectCell(r, c) { this.state.selectedCell = { r, c }; this.renderBoard(); },

  handleInput(num) {
    if (this.state.isPaused) return;
    const { r, c } = this.state.selectedCell || {};
    if (r === undefined) return;
    if (this.state.puzzle[r][c] !== 0) return;

    this.playSound('click');
    this.state.history.push({ board: JSON.parse(JSON.stringify(this.state.playerBoard)), notes: JSON.parse(JSON.stringify(this.state.notes)) });

    if (num === 0) {
      this.state.playerBoard[r][c] = 0; this.state.notes[r][c] = []; this.renderBoard(); this.saveGameState(); return;
    }

    if (this.state.isNotesMode) {
      if (this.state.playerBoard[r][c] !== 0) this.state.playerBoard[r][c] = 0;
      const idx = this.state.notes[r][c].indexOf(num);
      if (idx === -1) { this.state.notes[r][c].push(num); this.state.notes[r][c].sort(); } 
      else { this.state.notes[r][c].splice(idx, 1); }
      this.renderBoard(); this.saveGameState(); return;
    }

    this.state.playerBoard[r][c] = Number(num);
    this.state.notes[r][c] = [];

    const digit = Number(num);
    for (let col = 0; col < 9; col++) {
      if (this.state.playerBoard[r][col] === 0) this.state.notes[r][col] = this.state.notes[r][col].filter(n => n !== digit);
    }
    for (let row = 0; row < 9; row++) {
      if (this.state.playerBoard[row][c] === 0) this.state.notes[row][c] = this.state.notes[row][c].filter(n => n !== digit);
    }
    const startRow = Math.floor(r / 3) * 3;
    const startCol = Math.floor(c / 3) * 3;
    for (let row = startRow; row < startRow + 3; row++) {
      for (let col = startCol; col < startCol + 3; col++) {
        if (this.state.playerBoard[row][col] === 0) this.state.notes[row][col] = this.state.notes[row][col].filter(n => n !== digit);
      }
    }

    this.renderBoard(); this.saveGameState(); this.checkWin();
  },

  checkWin() {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (Number(this.state.playerBoard[r][c]) !== Number(this.state.solution[r][c])) return;
    this.playSound('win'); this.stopTimer(); this.els.winTime.textContent = this.formatTime(this.state.timer); this.screens.win.classList.remove('hidden'); this.clearSavedGame();
    this.updateGameplayAPI(false); // ✅ Уровень завершён
  },

  useHint() {
    if (this.state.isPaused) return;
    let errors = [];
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (this.state.playerBoard[r][c] !== 0 && this.state.playerBoard[r][c] !== this.state.solution[r][c]) errors.push({ r, c });

    const saveState = () => this.state.history.push({ board: this.state.playerBoard.map(r => [...r]), notes: this.state.notes.map(r => [...r]) });
    let targetR = -1, targetC = -1;
    let placedDigit = 0;

    if (errors.length > 0) {
      saveState();
      const { r, c } = errors[Math.floor(Math.random() * errors.length)];
      this.state.playerBoard[r][c] = this.state.solution[r][c]; placedDigit = this.state.solution[r][c]; this.state.notes[r][c] = []; targetR = r; targetC = c;
    } else {
      let empty = [];
      for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (this.state.playerBoard[r][c] === 0) empty.push({ r, c });
      if (empty.length > 0) {
        saveState();
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        this.state.playerBoard[r][c] = this.state.solution[r][c]; placedDigit = this.state.solution[r][c]; this.state.notes[r][c] = []; targetR = r; targetC = c;
      }
    }

    if (targetR !== -1) {
      if (placedDigit > 0) {
        for (let col = 0; col < 9; col++) {
          if (this.state.playerBoard[targetR][col] === 0) this.state.notes[targetR][col] = this.state.notes[targetR][col].filter(n => n !== placedDigit);
        }
        for (let row = 0; row < 9; row++) {
          if (this.state.playerBoard[row][targetC] === 0) this.state.notes[row][targetC] = this.state.notes[row][targetC].filter(n => n !== placedDigit);
        }
        const startRow = Math.floor(targetR / 3) * 3;
        const startCol = Math.floor(targetC / 3) * 3;
        for (let row = startRow; row < startRow + 3; row++) {
          for (let col = startCol; col < startCol + 3; col++) {
            if (this.state.playerBoard[row][col] === 0) this.state.notes[row][col] = this.state.notes[row][col].filter(n => n !== placedDigit);
          }
        }
      }
      this.renderBoard(); this.saveGameState(); this.checkWin();
      const idx = targetR * 9 + targetC;
      const cells = this.els.board.querySelectorAll('.cell');
      if (cells[idx]) { cells[idx].classList.add('blink-cell'); setTimeout(() => cells[idx].classList.remove('blink-cell'), 1500); }
    }
  },

  startTimer() { this.stopTimer(); this.state.timerInterval = setInterval(() => { this.state.timer++; this.els.timer.textContent = this.formatTime(this.state.timer); }, 1000); },
  stopTimer() { clearInterval(this.state.timerInterval); },
  formatTime(sec) { const m = Math.floor(sec / 60).toString().padStart(2, '0'); const s = (sec % 60).toString().padStart(2, '0'); return `${m}:${s}`; },
  saveProgress() { localStorage.setItem('sudoku_campaign_level', this.state.level); },
  loadProgress() { const s = localStorage.getItem('sudoku_campaign_level'); if(s) this.state.level = parseInt(s); },


  updateGameplayAPI(isActive) {
    // В VK Mini Apps нет аналога GameplayAPI — оставляем пустым
    // Метод нужен, чтобы не ломать вызовы в других местах
  },

  bindEvents() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());
    document.addEventListener('touchmove', (e) => { if (!e.target.closest('input[type="range"]')) e.preventDefault(); }, { passive: false });
    document.addEventListener('touchstart', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
    document.addEventListener('dragstart', e => e.preventDefault());
    
    document.getElementById('btn-play').addEventListener('click', () => {
      this.requestGameFullscreen(); // ✅ Синхронно, внутри жеста
      this.startLevel();
    });

    document.getElementById('btn-continue-save').addEventListener('click', () => {
      this.requestGameFullscreen(); // ✅ Синхронно
      this.loadGameState();
    });

    document.getElementById('btn-home').addEventListener('click', () => this.showPauseMenu());
    document.getElementById('btn-next').addEventListener('click', async () => {
      this.state.level++;
      this.clearSavedGame();
      this.saveProgress();
      PlatformAPI.saveProgress(this.state.level);
      const wasMusicPlaying = this.state.musicEnabled && !!this.bgmSource;
      if (wasMusicPlaying) this.stopBGM();
      this.startLevel();
      if (wasMusicPlaying && this.state.musicEnabled) this.playBGM();
    });
    
    document.getElementById('numpad').addEventListener('click', e => { 
      const btn = e.target.closest('button'); 
      if (btn && btn.dataset.num !== undefined) this.handleInput(parseInt(btn.dataset.num)); 
    });
    
    document.getElementById('btn-notes').addEventListener('click', () => { 
      this.state.isNotesMode = !this.state.isNotesMode; 
      this.els.btnNotes.classList.toggle('active', this.state.isNotesMode); 
    });
    
    document.getElementById('btn-hint').addEventListener('click', () => this.showHintModal());
    document.getElementById('btn-undo').addEventListener('click', () => this.performUndo());
    document.getElementById('btn-continue').addEventListener('click', () => this.hidePauseMenu());
    document.getElementById('btn-restart').addEventListener('click', () => this.showRestartModal());
    document.getElementById('btn-exit-menu').addEventListener('click', () => this.exitToMenu());
    document.getElementById('btn-settings').addEventListener('click', () => this.showSettingsModal());
    document.getElementById('btn-settings-pause').addEventListener('click', () => this.showSettingsModal());
    document.getElementById('btn-settings-back').addEventListener('click', () => this.hideSettingsModal());
    
    document.getElementById('toggle-music').addEventListener('change', (e) => { 
      this.state.musicEnabled = e.target.checked; 
      if (this.state.musicEnabled) this.playBGM(); 
      else this.stopBGM(); 
      this.saveSettings(); 
    });
    
    document.getElementById('volume-slider').addEventListener('input', (e) => this.updateMusicVolume(parseFloat(e.target.value)));
    document.getElementById('volume-slider').addEventListener('change', () => this.saveSettings());
    
    document.getElementById('toggle-sfx').addEventListener('change', (e) => { 
      this.state.sfxEnabled = e.target.checked; 
      this.saveSettings(); 
    });
    
    document.getElementById('sfx-volume-slider').addEventListener('input', (e) => { 
      this.updateSFXVolume(parseFloat(e.target.value)); 
      this.playSound('click'); // Предпросмотр с новой громкостью
    });    
    
    document.getElementById('sfx-volume-slider').addEventListener('change', () => this.saveSettings());
    document.getElementById('toggle-highlight').addEventListener('change', (e) => { 
      this.state.highlighting = e.target.checked; 
      this.saveSettings(); 
      this.renderBoard(); 
    });
    document.getElementById('toggle-dark-theme').addEventListener('change', (e) => { 
      this.state.darkTheme = e.target.checked; 
      this.applyDarkTheme(); 
      this.saveSettings(); 
    });
    
    document.getElementById('btn-info').addEventListener('click', () => this.showInfoModal());
    document.getElementById('btn-info-pause').addEventListener('click', () => this.showInfoModal());
    document.getElementById('btn-controls').addEventListener('click', () => this.showControlsModal());
    document.getElementById('btn-controls-pause').addEventListener('click', () => this.showControlsModal());
    document.getElementById('btn-rules-pause').addEventListener('click', () => this.showRulesModal());
    document.getElementById('btn-rules').addEventListener('click', () => this.showRulesModal());
    document.getElementById('btn-rules-back').addEventListener('click', () => this.hideRulesModal());
    document.getElementById('btn-info-back').addEventListener('click', () => this.hideInfoModal());
    
    const controlsBackBtn = document.getElementById('btn-controls-back'); 
    if (controlsBackBtn) controlsBackBtn.addEventListener('click', () => this.hideControlsModal());
    
    document.getElementById('btn-restart-yes').addEventListener('click', () => this.confirmRestart());
    document.getElementById('btn-restart-no').addEventListener('click', () => this.hideRestartModal());
    document.getElementById('btn-hint-yes').addEventListener('click', () => this.confirmPaidHint());
    document.getElementById('btn-hint-no').addEventListener('click', () => this.hideHintModal());
    document.getElementById('btn-hint-buy-yes').addEventListener('click', () => this.buyHintForStar());
    document.getElementById('btn-hint-buy-no').addEventListener('click', () => this.hideHintBuyModal());
    document.getElementById('btn-lang-toggle').addEventListener('click', () => this.toggleLanguage());

    document.addEventListener('click', (e) => {
      const target = e.target;
      const modals = [
        { id: 'settings-modal', fn: () => this.hideSettingsModal() },
        { id: 'rules-modal', fn: () => this.hideRulesModal() },
        { id: 'info-modal', fn: () => this.hideInfoModal() },
        { id: 'pause-modal', fn: () => this.hidePauseMenu() },
        { id: 'restart-confirm-modal', fn: () => this.hideRestartModal() },
        { id: 'hint-confirm-modal', fn: () => this.hideHintModal() },
        { id: 'controls-modal', fn: () => this.hideControlsModal() },
        { id: 'debug-level-modal', fn: () => this.hideDebugLevelModal() },
        { id: 'hint-buy-modal', fn: () => this.hideHintBuyModal() }
      ];
      for (const m of modals) { if (target.id === m.id) { m.fn(); return; } }
    });

    document.addEventListener('keydown', (e) => { if (e.repeat) return; this.handleKeyboard(e); });

    let secretSeq = [];
    const checkSecret = (type) => {
      secretSeq.push(type);
      if (secretSeq.length > 6) secretSeq.shift();
      if (secretSeq.join(',') === 'timer,timer,timer,level,level,level') {
        secretSeq = []; this.showDebugLevelModal();
      }
    };
    document.getElementById('timer').addEventListener('click', () => checkSecret('timer'));
    document.getElementById('level-num').addEventListener('click', () => checkSecret('level'));

    const processLevelGo = () => {
      const lvl = parseInt(this.debugInput.value);
      if (lvl && lvl > 0) {
        this.state.level = lvl;
        this.saveProgress();
        this.clearSavedGame();
        this.startLevel();
        this.hideDebugLevelModal();
      }
    };

    this.debugGoBtn.addEventListener('click', processLevelGo);

    const handleMobileEnter = (e) => {
      if (e.key === 'Enter' || e.keyCode === 13 || e.which === 13) {
        e.preventDefault();
        e.stopPropagation();
        processLevelGo();
        this.debugInput.blur();
      }
    };
    this.debugInput.addEventListener('keydown', handleMobileEnter);
    this.debugInput.addEventListener('keypress', handleMobileEnter);

    this.debugCancelBtn.addEventListener('click', () => this.hideDebugLevelModal());

    const handlePlus = () => { let val = parseInt(this.debugInput.value) || 0; this.debugInput.value = val + 1; };
    const handleMinus = () => { let val = parseInt(this.debugInput.value) || 0; if (val > 1) this.debugInput.value = val - 1; };

    const setupAccelerator = (btn, actionFn) => {
        let t1, t2;
        btn.addEventListener('pointerdown', (e) => {
            e.preventDefault(); actionFn();
            t1 = setTimeout(() => { t2 = setInterval(actionFn, 70); }, 400);
        });
        const clear = () => { clearTimeout(t1); clearInterval(t2); };
        btn.addEventListener('pointerup', clear);
        btn.addEventListener('pointerleave', clear);
    };

    if (this.debugPlus) setupAccelerator(this.debugPlus, handlePlus);
    if (this.debugMinus) setupAccelerator(this.debugMinus, handleMinus);

    const unlockAudio = () => {
      if (this.audioCtx && this.audioCtx.state === 'suspended') this.audioCtx.resume().catch(() => {});
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('click', unlockAudio, { once: true });
  },

  handleKeyboard(e) {
    // ✅ БЛОКИРОВКА: Если открыто окно победы — игнорируем всё, кроме Enter
    if (!this.screens.win.classList.contains('hidden')) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault();
        document.getElementById('btn-next')?.click(); // Жмём "Следующий уровень"
      }
      return; // Все остальные клавиши игнорируем
    }

    // Игнорируем ввод, если фокус в поле ввода (окно отладки)
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;

    const key = e.key.toLowerCase();
    
    // Обработка Escape
    if (key === 'escape') {
      e.preventDefault();
      if (!this.screens.hintConfirm.classList.contains('hidden')) { this.hideHintModal(); return; }
      if (!this.screens.restartConfirm.classList.contains('hidden')) { this.hideRestartModal(); return; }
      if (!this.screens.controls.classList.contains('hidden')) { this.hideControlsModal(); return; }
      if (!this.screens.info.classList.contains('hidden')) { this.hideInfoModal(); return; }
      if (!this.screens.rules.classList.contains('hidden')) { this.hideRulesModal(); return; }
      if (!this.screens.settings.classList.contains('hidden')) { this.hideSettingsModal(); return; }
      if (!this.screens.pause.classList.contains('hidden')) { this.hidePauseMenu(); return; }
      if (!this.screens.hintBuy.classList.contains('hidden')) { this.hideHintBuyModal(); return; }
      if (this.debugModal && !this.debugModal.classList.contains('hidden')) { this.hideDebugLevelModal(); return; }
      if (!this.screens.game.classList.contains('hidden')) { 
        if (this.state.selectedCell) { 
          this.state.selectedCell = null; 
          this.renderBoard(); 
        } else {
          this.showPauseMenu(); 
        }
      }
      return;
    }
    
    // Обработка Enter в модальных окнах
    if ((key === 'enter') && !this.screens.hintConfirm.classList.contains('hidden')) { e.preventDefault(); this.confirmPaidHint(); return; }
    if ((key === 'enter') && this.debugModal && !this.debugModal.classList.contains('hidden')) { e.preventDefault(); this.debugGoBtn.click(); return; }
    
    const isGameActive = !this.screens.game.classList.contains('hidden') && !this.state.isPaused;
    if (isGameActive) {
      let dr = 0, dc = 0;
      if (key === 'arrowup' || key === 'w' || key === 'ц') dr = -1;
      if (key === 'arrowdown' || key === 's' || key === 'ы') dr = 1;
      if (key === 'arrowleft' || key === 'a' || key === 'ф') dc = -1;
      if (key === 'arrowright' || key === 'd' || key === 'в') dc = 1;
      if (dr !== 0 || dc !== 0) { 
        e.preventDefault(); 
        const r = this.state.selectedCell ? this.state.selectedCell.r : 0; 
        const c = this.state.selectedCell ? this.state.selectedCell.c : 0; 
        this.selectCell(Math.max(0, Math.min(8, r + dr)), Math.max(0, Math.min(8, c + dc))); 
        return; 
      }
      if (key === 'q' || key === 'й') { e.preventDefault(); this.state.isNotesMode = !this.state.isNotesMode; this.els.btnNotes.classList.toggle('active', this.state.isNotesMode); return; }
      if (key === 'e' || key === 'у') { e.preventDefault(); this.performUndo(); return; }
      if (key === 'r' || key === 'к') { e.preventDefault(); this.handleInput(0); return; }
      let num = null; if (key >= '1' && key <= '9') num = parseInt(key);
      if (num !== null) { e.preventDefault(); this.handleInput(num); return; }
      if (key === 'enter') { e.preventDefault(); this.showHintModal(); return; }
      if (e.ctrlKey && (key === 'g' || key === 'п')) { e.preventDefault(); this.useHint(); return; }
    }
  },

  updateControlsVisibility() {
    const iframe = document.getElementById('controls-iframe'); if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage({ type: 'updateControls', theme: this.state.darkTheme ? 'dark' : 'light', lang: this.state.lang }, '*');
  },

  updateLanguageUI() {
    const t = this.i18n[this.state.lang];
    document.querySelectorAll('[data-i18n]').forEach(el => { const key = el.getAttribute('data-i18n'); if (t[key]) el.innerHTML = t[key]; });
    const rulesEl = document.getElementById('rules-content'), infoEl = document.getElementById('info-content');
    if (rulesEl && t.rulesContent) rulesEl.innerHTML = t.rulesContent; if (infoEl && t.infoContent) infoEl.innerHTML = t.infoContent;
    const flagRU = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA5IDYiPjxyZWN0IHdpZHRoPSI5IiBoZWlnaHQ9IjIiIGZpbGw9IiNmZmYiLz48cmVjdCB5PSIyIiB3aWR0aD0iOSIgaGVpZ2h0PSIyIiBmaWxsPSIjMDAzOWE2Ii8+PHJlY3QgeT0iNCIgd2lkdGg9IjkiIGhlaWdodD0iMiIgZmlsbD0iI2Q1MmIxZSIvPjwvc3ZnPg==';
    const flagGB = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDMiPjxyZWN0IHdpZHRoPSI2IiBoZWlnaHQ9IjMiIGZpbGw9IiMwMTIxNjkiLz48cGF0aCBkPSJNMCAwTDYgM002IDBMIDAgMyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuMiIvPjxwYXRoIGQ9Ik0wIDBMNiAzTTYgMEwgMCAzIiBzdHJva2U9IiNjODEwMmUiIHN0cm9rZS13aWR0aD0iLjYiLz48cGF0aCBkPSJNMyAwdjNNMCAxLjVoNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuMiIvPjxwYXRoIGQ9Ik0zIDB2M00wIDEuNWg2IiBzdHJva2U9IiNjODEwMmUiIHN0cm9rZS13aWR0aD0iLjYiLz48L3N2Zz4=';
    const flagSrc = this.state.lang === 'ru' ? flagRU : flagGB;
    const text = this.state.lang.toUpperCase();
    this.els.langToggle.innerHTML = `<img src="${flagSrc}" class="flag-icon" alt="Flag"> ${text}`;
    document.documentElement.lang = this.state.lang; this.updateControlsVisibility();
  },
  toggleLanguage() { this.state.lang = this.state.lang === 'ru' ? 'en' : 'ru'; localStorage.setItem('sudoku_lang', this.state.lang); this.updateLanguageUI(); this.updateControlsVisibility(); },

  showRulesModal() { this.screens.rules.classList.remove('hidden'); setTimeout(() => this.autoScale(), 50); this.updateControlsVisibility(); },
  hideRulesModal() { this.screens.rules.classList.add('hidden'); },
  showInfoModal() { this.screens.info.classList.remove('hidden'); setTimeout(() => this.autoScale(), 50); },
  hideInfoModal() { this.screens.info.classList.add('hidden'); },
  showControlsModal() { this.screens.controls.classList.remove('hidden'); setTimeout(() => this.autoScale(), 50); this.updateControlsVisibility(); },
  hideControlsModal() { this.screens.controls.classList.add('hidden'); },
  showSettingsModal() { 
    this.els.toggleMusic.checked = this.state.musicEnabled; this.els.toggleSFX.checked = this.state.sfxEnabled; this.els.musicVolumeSlider.value = this.state.musicVolume; this.els.sfxVolumeSlider.value = this.state.sfxVolume; this.els.toggleHighlight.checked = this.state.highlighting; this.els.toggleDarkTheme.checked = this.state.darkTheme; 
    this.screens.settings.classList.remove('hidden'); setTimeout(() => this.autoScale(), 50); 
  }, 
  hideSettingsModal() { this.screens.settings.classList.add('hidden'); },
  showRestartModal() { this.screens.restartConfirm.classList.remove('hidden'); setTimeout(() => this.autoScale(), 50); },
  hideRestartModal() { this.screens.restartConfirm.classList.add('hidden'); },
  
  showHintModal() {
    if (this.state.hintsAvailable <= 0) {
      // Бесплатные кончились — показываем окно подтверждения покупки
      this.showHintBuyConfirm();
      return;
    }
    const counterEl = document.getElementById('hint-modal-counter');
    if (counterEl) counterEl.textContent = this.state.hintsAvailable;
    this.screens.hintConfirm.classList.remove('hidden');
    setTimeout(() => this.autoScale(), 50);
  },

  hideHintModal() {
    this.screens.hintConfirm.classList.add('hidden');
  },

  showHintBuyConfirm() {
    const counterEl = document.getElementById('hint-modal-counter');
    if (counterEl) counterEl.textContent = this.state.hintsAvailable;
    this.screens.hintBuy.classList.remove('hidden');
    setTimeout(() => this.autoScale(), 50);
  },

  hideHintBuyModal() {
    this.screens.hintBuy.classList.add('hidden');
  },

  // Покупка подсказки за 1 Star (после подтверждения)
  async buyHintForStar() {
    const result = await PlatformAPI.buyHint();
    
    if (result.success) {
      this.useHint();
      this.saveGameState();
    }
  },
  
  async confirmRestart() {
    this.hideRestartModal();
    this.clearSavedGame();
    this.startLevel();
  },

  confirmPaidHint() { 
    if (this.state.hintsAvailable > 0) { 
      this.state.hintsAvailable--; 
      this.updateHintUI(); 
      this.hideHintModal(); 
      this.useHint(); 
      this.saveGameState(); // ✅ Сохраняем состояние после использования подсказки
    } 
  },
  updateHintUI() { 
    this.els.hintCounter.textContent = this.state.hintsAvailable;
    this.els.btnHint.style.opacity = '1'; this.els.btnHint.style.pointerEvents = 'auto'; 
  },
  
  performUndo() { if (this.state.history.length === 0) return; const last = this.state.history.pop(); this.state.playerBoard = JSON.parse(JSON.stringify(last.board)); this.state.notes = JSON.parse(JSON.stringify(last.notes)); this.saveGameState(); this.renderBoard(); },
  checkSavedGame() {
    const saved = localStorage.getItem('sudoku_saved_game');
    if (saved) { try { const gs = JSON.parse(saved); if (gs && gs.level) { document.getElementById('btn-continue-save').classList.remove('hidden'); document.getElementById('btn-play').classList.add('hidden'); return; } } catch (e) {} }
    document.getElementById('btn-continue-save').classList.add('hidden'); document.getElementById('btn-play').classList.remove('hidden');
  },

  saveGameState() { 
    if (!this.state.puzzle.length) return; 
    const gameState = { 
      level: this.state.level, 
      puzzle: this.state.puzzle, 
      solution: this.state.solution, 
      playerBoard: this.state.playerBoard, 
      notes: this.state.notes, 
      timer: this.state.timer, 
      hintsAvailable: this.state.hintsAvailable, // ✅ Это должно быть
      history: this.state.history, 
      timestamp: Date.now() 
    };
    localStorage.setItem('sudoku_saved_game', JSON.stringify(gameState));
  },

  async loadGameState() {
    let gs = null;
    if (!gs) {
      const local = localStorage.getItem('sudoku_saved_game');
      if (local) gs = JSON.parse(local);
    }
    if (!gs) return;

    this.state.level = gs.level;
    this.state.puzzle = gs.puzzle;
    this.state.solution = gs.solution;
    this.state.playerBoard = gs.playerBoard;
    this.state.notes = gs.notes || Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
    this.state.timer = gs.timer;
    // ✅ Исправлено: используем !== undefined вместо || 3
    this.state.hintsAvailable = gs.hintsAvailable !== undefined ? gs.hintsAvailable : 3;
    this.state.history = gs.history || [];
    this.state.selectedCell = null;
    this.state.isPaused = false;
    this.state.isNotesMode = false;
    this.els.btnNotes.classList.remove('active');
    this.updateHintUI();
    
    this.renderBoard();
    this.els.levelNum.textContent = this.state.level;
    this.els.timer.textContent = this.formatTime(this.state.timer);
    this.showGame(); 
    this.startTimer();
    this.playBGM();
    
    this.updateGameplayAPI(true);
  },
  
  clearSavedGame() { localStorage.removeItem('sudoku_saved_game'); document.getElementById('btn-continue-save').classList.add('hidden'); document.getElementById('btn-play').classList.remove('hidden'); },
  exitToMenu() { this.saveGameState(); this.hidePauseMenu(); this.showMenu(); },

  // ✅ Исправление: Клавиатура НЕ открывается автоматически
  showDebugLevelModal() {
    if (!this.debugModal) return;
    this.debugInput.value = this.state.level;
    this.debugModal.classList.remove('hidden');
    
    setTimeout(() => {
      if (this.debugInput) this.debugInput.blur();
    }, 100);

    setTimeout(() => this.autoScale(), 50);
  },
  
  hideDebugLevelModal() {
    if (!this.debugModal) return;
    this.debugModal.classList.add('hidden');
  }
};

document.addEventListener('DOMContentLoaded', () => { Game.loadProgress(); Game.init(); });