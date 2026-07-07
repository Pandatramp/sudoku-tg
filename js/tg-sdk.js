// js/tg-sdk.js - Telegram SDK для Судоку
// Правила: 3 бесплатные подсказки + 1 подсказка за 1 Star

window.PlatformAPI = {
  initialized: false,
  tg: null,
  
  // ==================== ИНИЦИАЛИЗАЦИЯ ====================
  
  async init() {
    if (window.Telegram && window.Telegram.WebApp) {
      this.tg = window.Telegram.WebApp;
      this.tg.ready();
      this.tg.expand();
      this.initialized = true;
      console.log('✅ Telegram SDK готов');
      
      // ✅ Сохраняем язык при инициализации
      const lang = this.tg.initDataUnsafe?.user?.language_code || 'ru';
      window.detectedLang = lang;
      
      return lang;
    }
    console.warn('⚠️ Telegram WebApp не найден, работа в локальном режиме');
    window.detectedLang = 'ru';
    return 'ru';
  },
  
  // ==================== ОБЛАЧНОЕ ХРАНИЛИЩЕ ====================
  
  cloudSave(key, value) {
    return new Promise((resolve) => {
      if (this.initialized && this.tg) {
        this.tg.CloudStorage.setItem(key, String(value), () => resolve());
      } else {
        resolve();
      }
    });
  },
  
  cloudLoad(key, defaultValue = null) {
    return new Promise((resolve) => {
      if (this.initialized && this.tg) {
        this.tg.CloudStorage.getItem(key, (err, value) => {
          resolve((err || value === null || value === undefined) ? defaultValue : value);
        });
      } else {
        resolve(defaultValue);
      }
    });
  },
  
  // ==================== ПРОГРЕСС ИГРЫ ====================
  
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
  
  // ==================== БЕСПЛАТНЫЕ ПОДСКАЗКИ (3 шт на уровень) ====================
  
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
  
  // ==================== ИСПОЛЬЗОВАНИЕ ПОДСКАЗКИ ====================
  
  async useHint() {
    const freeHints = await this.getFreeHints();
    
    if (freeHints > 0) {
      await this.setFreeHints(freeHints - 1);
      return { success: true, type: 'free', remaining: freeHints - 1 };
    }
    
    return await this.buyHint();
  },
  
  // ==================== ПОЛУЧЕНИЕ ID ПОЛЬЗОВАТЕЛЯ ====================
  
  getUserId() {
    // 1. Прямой доступ
    if (this.tg?.initDataUnsafe?.user?.id) {
      return this.tg.initDataUnsafe.user.id;
    }
    
    // 2. Парсинг initData
    if (this.tg?.initData) {
      try {
        const params = new URLSearchParams(this.tg.initData);
        const userJson = params.get('user');
        if (userJson) {
          const user = JSON.parse(decodeURIComponent(userJson));
          if (user.id) return user.id;
        }
      } catch (e) {
        console.error('Ошибка парсинга initData:', e);
      }
    }
    
    // 3. Если игра открыта через iframe (Telegram Web)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tgWebAppData = urlParams.get('tgWebAppData');
      if (tgWebAppData) {
        const params = new URLSearchParams(tgWebAppData);
        const userJson = params.get('user');
        if (userJson) {
          const user = JSON.parse(decodeURIComponent(userJson));
          if (user.id) return user.id;
        }
      }
    } catch (e) {
      console.error('Ошибка парсинга URL:', e);
    }
    
    // 4. Локальный режим
    return null;
  },
  
  // ==================== ПОКУПКА ОДНОЙ ПОДСКАЗКИ ЗА 1 STAR ====================
  
  async buyHint() {
    try {
      // ✅ Получаем ID через отдельный метод
      const userId = this.getUserId();
      
      // ❌ Если ID нет — показываем сообщение и выходим
      if (!userId) {
        // ✅ Используем showAlert для красивой ошибки
        this.showAlert(
          '⚠️ Не удалось определить пользователя.\n\n' +
          'Пожалуйста, откройте игру заново через бота.\n' +
          'Если ошибка повторяется, напишите разработчику.'
        );
        return { success: false, error: 'no_user_id' };
      }

      console.log('✅ User ID:', userId);

      // ✅ Отправляем запрос с ID
      const response = await fetch('https://sudoku-bot.pandatramp.workers.dev/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, stars: 1 })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.url) {
        throw new Error(data.error || 'Нет URL счёта');
      }

      // ✅ Открываем инвойс
      return new Promise((resolve) => {
        if (!this.tg || !this.tg.openInvoice) {
          this.showAlert('⚠️ Оплата недоступна в текущем режиме');
          resolve({ success: false, local: true });
          return;
        }
        
        this.tg.openInvoice(data.url, (status) => {
          if (status === 'paid') {
            resolve({ success: true, type: 'paid' });
          } else if (status === 'cancelled') {
            resolve({ success: false, cancelled: true });
          } else {
            this.showAlert('❌ Ошибка оплаты. Попробуйте позже.');
            resolve({ success: false, failed: true });
          }
        });
      });
    } catch (error) {
      console.error('Ошибка покупки:', error);
      this.showAlert(`❌ Ошибка: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  
  // ==================== УВЕДОМЛЕНИЯ ====================
  
  showAlert(message) {
    if (this.tg) {
      this.tg.showAlert(message);
    } else {
      alert(message);
    }
  },
  
  getPlayerName() {
    return this.tg?.initDataUnsafe?.user?.first_name || 'Игрок';
  }
};