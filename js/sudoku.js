window.SudokuGen = {
  // Seeded PRNG (Mulberry32) — для одинаковых уровней у всех игроков
  createSeededRandom(seed) {
    let s = seed | 0;
    return () => {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      let t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  },

  // Проверка: можно ли поставить num в ячейку (row, col)
  isValid(board, row, col, num) {
    // 1. Проверка строки
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }
    // 2. Проверка столбца
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }
    // 3. Проверка квадрата 3x3
    const startX = Math.floor(col / 3) * 3;
    const startY = Math.floor(row / 3) * 3;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (board[startY + y][startX + x] === num) return false;
      }
    }
    return true;
  },

  // Решатель судоку (бэктрекинг)
  solve(board, rand) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          // Перемешиваем числа для случайности (если передан генератор)
          if (rand) {
            for (let i = nums.length - 1; i > 0; i--) {
              const j = Math.floor(rand() * (i + 1));
              [nums[i], nums[j]] = [nums[j], nums[i]];
            }
          }
          
          for (const num of nums) {
            if (this.isValid(board, row, col, num)) {
              board[row][col] = num;
              if (this.solve(board, rand)) return true;
              board[row][col] = 0; // Откат
            }
          }
          return false;
        }
      }
    }
    return true;
  },

  // Подсчёт количества решений (ВАЖНО: работает с копией доски!)
  countSolutions(board, limit = 2) {
    // Создаём глубокую копию, чтобы не сломать основную игру
    const b = board.map(row => [...row]);
    let count = 0;
    
    const find = () => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (b[r][c] === 0) {
            for (let num = 1; num <= 9; num++) {
              if (this.isValid(b, r, c, num)) {
                b[r][c] = num;
                find();
                if (count >= limit) return;
                b[r][c] = 0; // Откат в копии
              }
            }
            return;
          }
        }
      }
      count++;
    };
    
    find();
    return count;
  },

  // Генерация уровня
    // Генерация уровня с плавным усложнением
  generatePuzzle(levelIndex) {
    // 1. Формула плавной сложности
    // Старт: 35 удаленных ячеек (легко).
    // Рост: +1 удаленная ячейка каждые 3 уровня.
    // Потолок: 55 удаленных ячеек (эксперт, остается 26 цифр).
    const removeTarget = Math.min(55, 35 + Math.floor(levelIndex / 3));
    
    // Название сложности (для информации, можно использовать в UI)
    let difficultyName = 'Легкий';
    if (removeTarget > 42) difficultyName = 'Средний';
    if (removeTarget > 50) difficultyName = 'Сложный';
    
    // 2. Настройка Seed (чтобы уровни были одинаковыми у всех)
    const seed = levelIndex * 7919 + 104729;
    const rand = this.createSeededRandom(seed);
    
    // Пустая доска 9x9
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));

    // 3. Заполнение диагональных блоков (они независимы друг от друга)
    for (let i = 0; i < 9; i += 3) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const idx = Math.floor(rand() * nums.length);
          board[i + r][i + c] = nums.splice(idx, 1)[0];
        }
      }
    }

    // 4. Решение остальной доски (получаем полную валидную сетку)
    this.solve(board, rand);
    const solution = board.map(row => [...row]); // Сохраняем готовое решение

    // 5. Подготовка списка ячеек для удаления
    const cells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        cells.push({r, c});
      }
    }
    
    // Перемешиваем ячейки, чтобы удалять в случайном порядке
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    // 6. Процесс удаления с гарантией единственного решения
    let removed = 0;
    for (const {r, c} of cells) {
      if (removed >= removeTarget) break; // Цель достигнута
      
      const backup = board[r][c];
      board[r][c] = 0; // Временно удаляем
      
      // Если решений стало != 1, возвращаем цифру назад
      if (this.countSolutions(board, 2) !== 1) {
        board[r][c] = backup;
      } else {
        removed++;
      }
    }

    return { puzzle: board, solution, difficulty: difficultyName };
  }
};