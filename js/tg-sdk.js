window.PlatformAPI = {
  initialized: false,
  tg: null,
  lang: 'ru',

  translations: {
    ru: {
      noUserId: '⚠️ Не удалось получить ID пользователя.\nВозможно вы зашли в приложение с включенным прокси.\nЕсли без прокси ТГ не работает, то попробуйте зайти из под VPN либо заранее купить звезды через настройки Telegram',
      paymentUnavailable: '⚠️ Оплата недоступна',
      paymentError: '❌ Ошибка оплаты. Попробуйте позже.',
      errorPrefix: '❌ Ошибка: ',
      invoiceNotFound: 'Нет URL счёта',
      buyHintTitle: 'Подсказка за звезду',
      buyHintText: 'Бесплатные подсказки закончились.\nКупить одну подсказку за 1⭐?',
      buyHintYes: '✅ Купить за 1⭐',
      buyHintNo: '❌ Нет'
    },
    en: {
      noUserId: '⚠️ Failed to get user ID.\nYou might have accessed the app with a proxy enabled.\n If Telegram doesnt work without a proxy, try using a VPN, or buy Stars in advance via Telegram settings',
      paymentUnavailable: '⚠️ Payment is not available',
      paymentError: '❌ Payment error. Please try again.',
      errorPrefix: '❌ Error: ',
      invoiceNotFound: 'No invoice URL',
      buyHintTitle: 'Hint for Star',
      buyHintText: 'No free hints left.\nBuy one hint for 1⭐?',
      buyHintYes: '✅ Buy for 1⭐',
      buyHintNo: '❌ No'
    }
  },

  getLanguage() {
    return this.lang;
  },

  setLanguage(lang) {
    this.lang = lang === 'en' ? 'en' : 'ru';
    console.log('🌍 PlatformAPI язык:', this.lang);
  },

  t(key) {
    const dict = this.translations[this.lang] || this.translations.ru;
    return dict[key] || key;
  },

  async init() {
    if (window.Telegram && window.Telegram.WebApp) {
      this.tg = window.Telegram.WebApp;
      this.tg.ready();
      this.tg.expand();
      this.initialized = true;

      this.lang = this.tg.initDataUnsafe?.user?.language_code || 'ru';

      if (!this.tg.initDataUnsafe?.user && this.tg.initData) {
        try {
          const params = new URLSearchParams(this.tg.initData);
          const userJson = params.get('user');
          if (userJson) {
            const user = JSON.parse(decodeURIComponent(userJson));
            if (!this.tg.initDataUnsafe) this.tg.initDataUnsafe = {};
            this.tg.initDataUnsafe.user = user;
            if (!this.lang || this.lang === 'ru') {
              this.lang = user.language_code || 'ru';
            }
          }
        } catch (e) {
          // Тихо игнорируем
        }
      }

      console.log('✅ Telegram SDK готов, язык:', this.lang);
      return this.lang;
    }
    console.warn('⚠️ Telegram WebApp не найден, работа в локальном режиме');
    return 'ru';
  },

  cloudSave(key, value) {
    return new Promise((resolve) => {
      if (this.initialized) {
        this.tg.CloudStorage.setItem(key, String(value), () => resolve());
      } else {
        resolve();
      }
    });
  },

  cloudLoad(key, defaultValue) {
    return new Promise((resolve) => {
      if (this.initialized) {
        this.tg.CloudStorage.getItem(key, (err, value) => {
          resolve((err || value === null || value === undefined) ? defaultValue : value);
        });
      } else {
        resolve(defaultValue);
      }
    });
  },

  // ==================== РАБОТА С TIMESTAMP ====================

  /**
   * Получить текущий timestamp (Unix time в миллисекундах)
   */
  getTimestamp() {
    return Date.now();
  },

  /**
   * Сохранить данные с timestamp в облако
   * @param {string} key - ключ для сохранения
   * @param {any} data - данные для сохранения (будут преобразованы в JSON)
   * @param {number} timestamp - опционально, если не указан - будет использован текущий
   */
  async cloudSaveWithTimestamp(key, data, timestamp = null) {
    const ts = timestamp || this.getTimestamp();
    const payload = JSON.stringify({
      data: data,
      timestamp: ts
    });
    await this.cloudSave(key, payload);
    return ts;
  },

  /**
   * Загрузить данные с timestamp из облака
   * @param {string} key - ключ для загрузки
   * @returns {Promise<{data: any, timestamp: number} | null>} - объект с данными и timestamp или null
   */
  async cloudLoadWithTimestamp(key) {
    const stored = await this.cloudLoad(key);
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      // Проверяем, что это наш формат (есть data и timestamp)
      if (parsed && typeof parsed === 'object' && 'data' in parsed && 'timestamp' in parsed) {
        return {
          data: parsed.data,
          timestamp: parsed.timestamp
        };
      }
      // Если старый формат без timestamp — возвращаем как есть
      return {
        data: parsed,
        timestamp: 0
      };
    } catch (e) {
      // Если не JSON — возвращаем как строку
      return {
        data: stored,
        timestamp: 0
      };
    }
  },

  /**
   * Сравнить два timestamp и вернуть самое свежее
   * @param {number} ts1 - первый timestamp
   * @param {number} ts2 - второй timestamp
   * @returns {number} - наибольший timestamp (самое свежее)
   */
  getNewestTimestamp(ts1, ts2) {
    return Math.max(ts1 || 0, ts2 || 0);
  },

  /**
   * Проверить, является ли первое сохранение новее второго
   * @param {number} ts1 - первый timestamp
   * @param {number} ts2 - второй timestamp
   * @returns {boolean} - true если ts1 >= ts2
   */
  isNewer(ts1, ts2) {
    return (ts1 || 0) >= (ts2 || 0);
  },

  async saveProgress(level) {
    await this.cloudSave('sudoku_level', level);
    localStorage.setItem('sudoku_level', level);
  },

  async loadProgress() {
    const cloudLevel = await this.cloudLoad('sudoku_level');
    if (cloudLevel !== null) return parseInt(cloudLevel);
    const localLevel = localStorage.getItem('sudoku_level');
    return localLevel ? parseInt(localLevel) : 1;
  },

  async getFreeHints() {
    const value = await this.cloudLoad('free_hints', '3');
    return parseInt(value);
  },

  async setFreeHints(count) {
    await this.cloudSave('free_hints', count);
  },

  async resetFreeHints() {
    await this.setFreeHints(3);
  },

  async useHint() {
    const freeHints = await this.getFreeHints();
    if (freeHints > 0) {
      await this.setFreeHints(freeHints - 1);
      return { success: true, type: 'free', remaining: freeHints - 1 };
    }
    return await this.buyHint();
  },

  async buyHint() {
    try {
      let userId = this.tg?.initDataUnsafe?.user?.id;

      if (!userId && this.tg?.initData) {
        try {
          const params = new URLSearchParams(this.tg.initData);
          const userJson = params.get('user');
          if (userJson) {
            const user = JSON.parse(decodeURIComponent(userJson));
            userId = user.id;
          }
        } catch (e) {
          // Тихо игнорируем
        }
      }

      if (!userId) {
        // ✅ Используем перевод
        this.showAlert(this.t('noUserId'));
        return { success: false, error: 'no_user_id' };
      }

      console.log('✅ User ID:', userId);

      const response = await fetch('https://sudoku-bot.pandatramp.workers.dev/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, stars: 1 })
      });

      const data = await response.json();
      if (!data.url) throw new Error(this.t('invoiceNotFound'));

      console.log('✅ Invoice URL:', data.url);

      return new Promise((resolve) => {
        if (!this.tg || !this.tg.openInvoice) {
          this.showAlert(this.t('paymentUnavailable'));
          resolve({ success: false, local: true });
          return;
        }

        this.tg.openInvoice(data.url, (status) => {
          if (status === 'paid') resolve({ success: true, type: 'paid' });
          else if (status === 'cancelled') resolve({ success: false, cancelled: true });
          else {
            this.showAlert(this.t('paymentError'));
            resolve({ success: false, failed: true });
          }
        });
      });
    } catch (error) {
      console.error('Ошибка покупки:', error);
      this.showAlert(this.t('errorPrefix') + error.message);
      return { success: false, error: error.message };
    }
  },

  showAlert(message) {
    if (this.tg) this.tg.showAlert(message);
    else alert(message);
  },

  getPlayerName() {
    return this.tg?.initDataUnsafe?.user?.first_name || 'Игрок';
  },

  // ==================== ОБЛАЧНОЕ СОХРАНЕНИЕ ЧЕРЕЗ БОТА ====================

  async cloudSaveViaBot(key, data, timestamp = null) {
    try {
      const userId = this.tg?.initDataUnsafe?.user?.id;
      if (!userId) {
        console.warn('⚠️ Нет user_id для облачного сохранения');
        return false;
      }
      
      const ts = timestamp || Date.now();
      const response = await fetch('https://sudoku-bot.pandatramp.workers.dev/api/cloud-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          key: 'sudoku_saved_game',
          data: data,
          timestamp: ts
        })
      });
      
      const result = await response.json();
      console.log('💾 Облачное сохранение через бота:', result);
      return result.success;
    } catch (error) {
      console.error('❌ Ошибка облачного сохранения:', error);
      return false;
    }
  },

  async cloudLoadViaBot() {
    try {
      const userId = this.tg?.initDataUnsafe?.user?.id;
      if (!userId) {
        console.warn('⚠️ Нет user_id для загрузки из облака');
        return null;
      }
      
      const response = await fetch(
        `https://sudoku-bot.pandatramp.workers.dev/api/cloud-load?user_id=${userId}&key=sudoku_saved_game`
      );
      
      const result = await response.json();
      console.log('📥 Облачная загрузка через бота:', result);
      
      if (result.success && result.data) {
        return {
          data: result.data,
          timestamp: result.timestamp || 0
        };
      }
      return null;
    } catch (error) {
      console.error('❌ Ошибка загрузки из облака:', error);
      return null;
    }
  },

  // ... существующий код ...
  
  // ==================== ДИАГНОСТИЧЕСКИЕ МЕТОДЫ ====================

  // 1. Проверка Telegram WebApp
  checkTelegram() {
    console.log('📱 ПРОВЕРКА TELEGRAM WEBAPP');
    console.log('Telegram:', window.Telegram);
    console.log('WebApp:', window.Telegram?.WebApp);
    console.log('CloudStorage:', window.Telegram?.WebApp?.CloudStorage);
    console.log('initDataUnsafe:', window.Telegram?.WebApp?.initDataUnsafe);
    console.log('user:', window.Telegram?.WebApp?.initDataUnsafe?.user);
    console.log('user.id:', window.Telegram?.WebApp?.initDataUnsafe?.user?.id);
  },

  // 2. Проверка облачного сохранения игры
  async checkCloudSave() {
    console.log('☁️ ПРОВЕРКА ОБЛАЧНОГО СОХРАНЕНИЯ');
    const data = await this.cloudLoad('sudoku_saved_game');
    console.log('☁️ Данные в облаке:', data);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log('📊 Распарсенные данные:', parsed);
        console.log('📊 Уровень:', parsed.level || parsed.data?.level);
        console.log('⏱️ Timestamp:', parsed.timestamp || parsed.data?.timestamp);
      } catch (e) {
        console.log('❌ Не удалось распарсить:', e);
      }
    } else {
      console.log('ℹ️ В облаке нет данных');
    }
  },

  // 3. Проверка локального сохранения
  checkLocalSave() {
    console.log('💾 ПРОВЕРКА ЛОКАЛЬНОГО СОХРАНЕНИЯ');
    const local = localStorage.getItem('sudoku_saved_game');
    console.log('💾 Локальное сохранение:', local);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        console.log('📊 Локальный уровень:', parsed.level || parsed.data?.level);
        console.log('⏱️ Timestamp:', parsed.timestamp || parsed.data?.timestamp);
      } catch (e) {
        console.log('❌ Ошибка парсинга локального:', e);
      }
    } else {
      console.log('ℹ️ Нет локального сохранения');
    }
  },

  // 4. Проверка cloudLoadWithTimestamp
  async checkTimestamp() {
    console.log('⏱️ ПРОВЕРКА cloudLoadWithTimestamp');
    const result = await this.cloudLoadWithTimestamp('sudoku_saved_game');
    console.log('📦 Результат cloudLoadWithTimestamp:', result);
    if (result) {
      console.log('📊 Данные:', result.data);
      console.log('⏱️ Timestamp:', result.timestamp);
    } else {
      console.log('ℹ️ Нет данных');
    }
  },

  // 5. Полный тест облачного хранилища
  async testCloudStorage() {
    console.log('🔍 ДИАГНОСТИКА ОБЛАЧНОГО ХРАНИЛИЩА');
    console.log('====================================');
    
    const testKey = 'test_' + Date.now();
    const testData = { test: 'hello', timestamp: Date.now() };
    
    console.log('📤 Сохраняем тестовые данные:', testData);
    
    try {
      await this.cloudSave(testKey, JSON.stringify(testData));
      console.log('✅ Сохранение выполнено');
      
      const loaded = await this.cloudLoad(testKey);
      console.log('📥 Загруженные данные:', loaded);
      
      if (loaded === JSON.stringify(testData)) {
        console.log('✅ Облачное хранилище РАБОТАЕТ!');
      } else {
        console.log('❌ Данные не совпадают!');
      }
      
      await this.cloudSave(testKey, null);
      console.log('🗑️ Тестовые данные удалены');
      
    } catch (error) {
      console.error('❌ Ошибка при работе с облачным хранилищем:', error);
    }
    
    console.log('====================================');
  }
};