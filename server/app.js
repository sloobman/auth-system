const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Разрешаем запросы с фронтенда
  credentials: true // Разрешаем передачу кук
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// In-memory user storage (в реальном приложении используйте БД)
const users = [];

// Роуты
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Проверка существования пользователя
    if (users.some(user => user.username === username)) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Хэширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Сохранение пользователя
    users.push({ username, password: hashedPassword });
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Создание сессии
    req.session.user = { username };
    req.session.save();
    
    res.json({ message: 'Login successful' });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  res.json({ 
    message: `Welcome, ${req.session.user.username}`,
    user: req.session.user
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});

// Кэширование данных
const CACHE_DIR = path.join(__dirname, 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'data.json');
const CACHE_DURATION = 60 * 1000; // 1 минута

// Создаем директорию для кэша, если ее нет
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

app.get('/data', (req, res) => {
  try {
    // Проверяем наличие и актуальность кэша
    if (fs.existsSync(CACHE_FILE)) {
      const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE));
      const now = new Date().getTime();
      
      if (now - cacheData.timestamp < CACHE_DURATION) {
        return res.json(cacheData.data);
      }
    }
    
    // Генерируем новые данные
    const newData = {
      timestamp: new Date().getTime(),
      data: {
        items: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          value: Math.random().toString(36).substring(7)
        })),
        generatedAt: new Date().toISOString()
      }
    };
    
    // Сохраняем в кэш
    fs.writeFileSync(CACHE_FILE, JSON.stringify(newData));
    
    res.json(newData.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get data' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});