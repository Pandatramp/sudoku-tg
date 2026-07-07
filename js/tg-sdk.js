// js/tg-sdk.js - Telegram SDK для Судоку
// Правила: 3 бесплатные подсказки + 1 подсказка за 1 Star

window.PlatformAPI = {
  initialized: false,
  tg: null,
  _userId: null, // ✅ Кешируем ID после первого получения
  
  // ==================== ИНИЦИАЛИЗАЦИЯ ====================
  
  async init() {
    if (window.Telegram && window.Telegram.WebApp) {
      this.tg = window.Telegram.WebApp;
      this.tg.ready();
      this.tg.expand();
      this.initialized = true;
      console.log('✅ Telegram SDK готов');
      
      // ✅ Сразу получаем и кешируем ID
      this._userId = this.extractUserId();
      console.log('👤 User ID:', this._userId);
      
      const lang = this.tg.initDataUnsafe?.user?.language_code || 'ru';
      window.detectedLang = lang;
      
      return lang;
    }
    console.warn('⚠️ Telegram WebApp не найден, работа в локальном режиме');
    window.detectedLang = 'ru';
    return 'ru';
  },
  
  // ==================== РАСШИРЕННОЕ ПОЛУЧЕНИЕ ID ====================
  
  extractUserId() {
    console.log('🔍 Попытка получить ID пользователя...');
    
    // Способ 1: initDataUnsafe (самый прямой)
    if (this.tg?.initDataUnsafe?.user?.id) {
      const id = this.tg.initDataUnsafe.user.id;
      console.log('✅ Способ 1 (initDataUnsafe):', id);
      return id;
    }
    
    // Способ 2: парсинг initData
    if (this.tg?.initData) {
      try {
        console.log('📝 initData:', this.tg.initData);
        const params = new URLSearchParams(this.tg.initData);
        const userJson = params.get('user');
        if (userJson) {
          console.log('📝 userJson:', userJson);
          const user = JSON.parse(decodeURIComponent(userJson));
          if (user.id) {
            console.log('✅ Способ 2 (initData парсинг):', user.id);
            return user.id;
          }
        }
      } catch (e) {
        console.error('❌ Ошибка парсинга initData:', e);
      }
    }
    
    // Способ 3: параметры URL (для WebApp в iframe)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tgWebAppData = urlParams.get('tgWebAppData');
      console.log('📝 tgWebAppData из URL:', tgWebAppData ? 'есть' : 'нет');
      
      if (tgWebAppData) {
        const params = new URLSearchParams(tgWebAppData);
        const userJson = params.get('user');
        if (userJson) {
          const user = JSON.parse(decodeURIComponent(userJson));
          if (user.id) {
            console.log('✅ Способ 3 (URL параметры):', user.id);
            return user.id;
          }
        }
      }
    } catch (e) {
      console.error('❌ Ошибка парсинга URL:', e);
    }
    
    // Способ 4: WebApp.initDataUnsafe (альтернативный доступ)
    try {
      if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
        const id = window.Telegram.WebApp.initDataUnsafe.user.id;
        console.log('✅ Способ 4 (window.Telegram):', id);
        return id;
      }
    } catch (e) {
      console.error('❌ Ошибка доступа к window.Telegram:', e);
    }
    
    console.warn('❌ Не удалось получить ID пользователя ни одним способом');
    return null;
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
  
  // ==================== БЕСПЛАТНЫЕ ПОДСКАЗКИ ====================
  
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
  // Если уже есть — возвращаем
  if (this._userId) {
    console.log('✅ Используем кешированный ID:', this._userId);
    return this._userId;
  }
  
  console.log('🔍 Пытаемся получить user_id...');
  
  try {
    // Прямой доступ к WebApp
    const webApp = window.Telegram?.WebApp;
    console.log('📱 WebApp:', webApp);
    
    if (webApp) {
      // Проверяем initDataUnsafe
      if (webApp.initDataUnsafe?.user?.id) {
        const id = webApp.initDataUnsafe.user.id;
        console.log('✅ ID из initDataUnsafe.user:', id);
        this._userId = id;
        return id;
      }
      
      // Если нет, пробуем из initData
      if (webApp.initData) {
        console.log('📝 Пробуем парсить initData...');
        const params = new URLSearchParams(webApp.initData);
        const userJson = params.get('user');
        if (userJson) {
          const user = JSON.parse(decodeURIComponent(userJson));
          if (user.id) {
            console.log('✅ ID из initData:', user.id);
            this._userId = user.id;
            return id;
          }
        }
      }
    }
    
    console.warn('❌ Не удалось получить ID');
    console.log('🔍 window.Telegram:', window.Telegram);
    console.log('🔍 WebApp:', webApp);
    console.log('🔍 initDataUnsafe:', webApp?.initDataUnsafe);
    console.log('🔍 user:', webApp?.initDataUnsafe?.user);
    
    return null;
  } catch (e) {
    console.error('❌ Ошибка получения user_id:', e);
    return null;
  }
},
  
  // ==================== ПОКУПКА ПОДСКАЗКИ ЗА ЗВЕЗДУ ====================
  
  async buyHint() {
    try {
      // ✅ Получаем ID
      const userId = this.getUserId();
      
      if (!userId) {
        console.error('❌ Не удалось получить ID пользователя');
        
        // ❌ Показываем детальную ошибку для диагностики
        const debugInfo = [
          '⚠️ Не удалось определить пользователя.',
          '',
          'Техническая информация:',
          `- Telegram WebApp: ${this.initialized ? '✅ есть' : '❌ нет'}`,
          `- initData: ${this.tg?.initData ? '✅ есть' : '❌ нет'}`,
          `- initDataUnsafe: ${this.tg?.initDataUnsafe ? '✅ есть' : '❌ нет'}`,
          `- user: ${this.tg?.initDataUnsafe?.user ? '✅ есть' : '❌ нет'}`,
          '',
          'Пожалуйста, откройте игру заново через бота.',
          'Если ошибка повторяется, напишите разработчику.'
        ].join('\n');
        
        this.showAlert(debugInfo);
        return { success: false, error: 'no_user_id' };
      }

      console.log('✅ Пользователь ID:', userId);
      console.log('📤 Отправка запроса на создание инвойса...');

      // ✅ Отправляем запрос
      const response = await fetch('https://sudoku-bot.pandatramp.workers.dev/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          stars: 1 
        })
      });

      console.log('📥 Статус ответа:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Ошибка сервера:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Ответ сервера:', data);
      
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
        
        console.log('💰 Открываем инвойс...');
        
        this.tg.openInvoice(data.url, (status) => {
          console.log('💳 Статус оплаты:', status);
          
          if (status === 'paid') {
            this.showAlert('✅ Подсказка куплена!');
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
      console.error('❌ Ошибка покупки:', error);
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