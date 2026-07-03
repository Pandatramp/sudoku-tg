// vk-sdk.js — Адаптер под VK Mini Apps (с защитой от зависания)
window.PlatformAPI = {
  initialized: false,
  lastInterstitial: 0,

  // Вспомогательная функция: резолвит Promise с таймаутом
  _withTimeout(promise, ms, fallbackValue) {
    return Promise.race([
      promise,
      new Promise(resolve => setTimeout(() => resolve(fallbackValue), ms))
    ]);
  },

  async init() {
    console.log('🔍 [vk-sdk] init() начался');

    // Проверяем, что vkBridge вообще загружен
    if (typeof vkBridge === 'undefined') {
      console.warn('⚠️ VK Bridge не загружен (локальный режим)');
      window.detectedLang = (navigator.language || 'ru').split('-')[0];
      this.initialized = false;
      return;
    }

    try {
      console.log('🔍 [vk-sdk] Отправляем VKWebAppInit...');

      // ✅ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: таймаут 2 секунды
      // Если за 2 секунды ВК не ответил — считаем, что мы вне ВК
      const result = await this._withTimeout(
        vkBridge.send('VKWebAppInit'),
        2000,
        { timeout: true }
      );

      if (result && result.timeout) {
        console.warn('⚠️ VK Bridge не ответил (локальный режим вне ВК)');
        this.initialized = false;
        window.detectedLang = (navigator.language || 'ru').split('-')[0];
        return;
      }

      this.initialized = true;
      console.log('✅ VK Bridge успешно инициализирован');

      // Определяем язык пользователя
      try {
        const userInfo = await this._withTimeout(
          vkBridge.send('VKWebAppGetUserInfo'),
          1500,
          null
        );
        let lang = userInfo?.language || (navigator.language || 'ru').split('-')[0];
        if (!['ru', 'en', 'be', 'kk', 'uk', 'uz', 'tr'].includes(lang)) lang = 'ru';
        window.detectedLang = lang;
      } catch (e) {
        window.detectedLang = (navigator.language || 'ru').split('-')[0];
      }

      // Подписка на смену темы
      vkBridge.subscribe((event) => {
        if (event.detail?.type === 'VKWebAppUpdateConfig') {
          const config = event.detail.data;
          if (config.appearance) {
            window.dispatchEvent(new CustomEvent('vkThemeChange', { detail: config.appearance }));
          }
        }
      });

    } catch (e) {
      console.warn('⚠️ Ошибка инициализации VK Bridge:', e);
      window.detectedLang = (navigator.language || 'ru').split('-')[0];
      this.initialized = false;
    }
  },

  async saveProgress(level) {
    if (!this.initialized) return;
    try {
      await vkBridge.send('VKWebAppStorageSet', { key: 'sudoku_level', value: String(level) });
    } catch (e) { console.warn('Не удалось сохранить:', e); }
  },

  async loadProgress() {
    if (!this.initialized) return null;
    try {
      const res = await vkBridge.send('VKWebAppStorageGet', { keys: ['sudoku_level'] });
      const found = res.keys?.find(k => k.key === 'sudoku_level');
      return found ? parseInt(found.value) : null;
    } catch (e) { return null; }
  },

  async showInterstitial() {
    const now = Date.now();
    if (now - this.lastInterstitial < 60000) return;
    this.lastInterstitial = now;
    if (!this.initialized) return;
    try {
      await this._withTimeout(vkBridge.send('VKWebAppShowInterstitialAd'), 1000, null);
    } catch (e) { console.warn('Ошибка интерстишиала:', e); }
  },

  async showRewardedHint() {
    if (!this.initialized) return false;
    try {
      const result = await this._withTimeout(
        vkBridge.send('VKWebAppShowRewardedVideoAd'),
        30000,
        { result: false }
      );
      return result?.result === true || result?.result === 'rewarded';
    } catch (e) { return false; }
  }
};