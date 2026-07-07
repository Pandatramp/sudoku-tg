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
      return this.tg.initDataUnsafe?.user?.language_code || 'ru';
    }
    return 'ru';
  },
  
  // ==================== ОБЛАЧНОЕ ХРАНИЛИЩЕ ====================
  
  cloudSave(key, value) {
    return new Promise((resolve) => {
      if (this.initialized) {
        this.tg.CloudStorage.setItem(key, String(value), () => resolve());
      } else {
        resolve();
      }
    });
  },
  
  cloudLoad(key, defaultValue = null) {
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
  // Логика: сначала бесплатные (3 шт), потом покупка за 1 Star
  
  async useHint() {
    // 1. Пробуем бесплатную
    const freeHints = await this.getFreeHints();
    
    if (freeHints > 0) {
      await this.setFreeHints(freeHints - 1);
      return { success: true, type: 'free', remaining: freeHints - 1 };
    }
    
    // 2. Бесплатные кончились — покупаем за 1 Star
    return await this.buyHint();
  },
  
  // ==================== ПОКУПКА ОДНОЙ ПОДСКАЗКИ ЗА 1 STAR ====================
  
  async buyHint() {
    try {
      console.log('🔄 Отправка запроса на создание invoice...');
      
      const response = await fetch('https://sudoku-bot.pandatramp.workers.dev/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: this.tg?.initDataUnsafe?.user?.id,
          stars: 1
        })
      });
      
      console.log('📥 Статус ответа:', response.status);
      
      const data = await response.json();
      console.log('📦 Данные ответа:', data);
      
      if (!data.url) {
        console.error('❌ В ответе нет URL:', data);
        throw new Error(data.error || 'Нет URL счёта');
      }
      
      console.log('✅ URL получен:', data.url);
      
      // Открываем окно оплаты
      return new Promise((resolve) => {
        if (!this.tg || !this.tg.openInvoice) {
          this.showAlert('⚠️ Оплата недоступна в локальном режиме');
          resolve({ success: false, local: true });
          return;
        }
        
        this.tg.openInvoice(data.url, async (status) => {
          console.log('💳 Статус оплаты:', status);
          if (status === 'paid') {
            resolve({ success: true, type: 'paid' });
          } else if (status === 'cancelled') {
            resolve({ success: false, cancelled: true });
          } else {
            this.showAlert('Ошибка оплаты');
            resolve({ success: false, failed: true });
          }
        });
      });
    } catch (error) {
      console.error('❌ Ошибка покупки:', error);
      this.showAlert(`Ошибка: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  
  // ==================== УВЕДОМЛЕНИЯ ====================
  
  showAlert(message) {
    if (this.tg) this.tg.showAlert(message);
    else alert(message);
  },
  
  getPlayerName() {
    return this.tg?.initDataUnsafe?.user?.first_name || 'Игрок';
  }
};