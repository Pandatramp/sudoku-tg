window.PlatformAPI = {
  initialized: false,
  tg: null,
  lang: 'ru',

  translations: {
    ru: {
      noUserId: '⚠️ Не удалось получить ID пользователя.\nВозможно вы зашли в приложение с включенным прокси.\nЕсли без прокси ТГ не работает, то попробуйте зайти из под VPN',
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
      noUserId: '⚠️ Failed to get user ID.\nYou might have accessed the app with a proxy enabled.\n If Telegram doesnt work without a proxy, try using a VPN.',
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
  }
};