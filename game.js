// Получаем ссылку на холст и его контекст
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Объект игрока
const player = {
  x: 600,
  y: 400,
  radius: 10,
  color: 'blue',
  speed: 5,
  dx: 0,
  dy: 0
};

// Массив ботов и еды
const bots = [];
const food = [];

// Объект для камеры
const camera = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  scale: 1
};

// Создаем случайных ботов и помещаем их в массив
for (let i = 0; i < 10; i++) {
  bots.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: 5,
    color: 'red',
    speed: 2 * Math.random() + 1
  });
}

// Функция для отрисовки игрока
function drawPlayer() {
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.stroke();
}

// Функция для отрисовки ботов
function drawBots() {
  bots.forEach(bot => {
    ctx.beginPath();
    ctx.arc(bot.x, bot.y, bot.radius, 0, 2 * Math.PI);
    ctx.fillStyle = bot.color;
    ctx.fill();
    ctx.stroke();
  });
}

// Функция для отрисовки еды
function drawFood() {
  food.forEach(f => {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, 2 * Math.PI);
    ctx.fillStyle = f.color;
    ctx.fill();
    ctx.stroke();
  });
}

// Функция для перемещения игрока
function movePlayer() {
  player.x += player.dx;
  player.y += player.dy;
}

// Функция для поиска ближайшего объекта к заданному
function findNearestObject(bot, objects) {
  let nearestObject = null;
  let minDistance = Infinity;

  objects.forEach(object => {
    const distance = Math.sqrt((bot.x - object.x)**2 + (bot.y - object.y)**2);
    if (distance < minDistance) {
      minDistance = distance;
      nearestObject = object;
    }
  });

  return nearestObject;
}

// Функция для перемещения бота
function moveBot(bot) {
  const nearestPlayer = findNearestObject(bot, [player, ...bots]);
  const nearestFood = findNearestObject(bot, food);
  const nearestSmallerBot = bots.find(otherBot => otherBot.radius < bot.radius);
  const nearestBiggerBot = bots.find(otherBot => otherBot.radius > bot.radius);

  if (nearestPlayer && bot.radius < nearestPlayer.radius) {
    // Бот меньше ближайшего игрока или бота - убегает
    const angle = Math.atan2(bot.y - nearestPlayer.y, bot.x - nearestPlayer.x);
    bot.x += Math.cos(angle) * bot.speed;
    bot.y += Math.sin(angle) * bot.speed;
  } else if (nearestPlayer && bot.radius > nearestPlayer.radius) {
    // Бот больше ближайшего игрока или бота - преследует
    const angle = Math.atan2(nearestPlayer.y - bot.y, nearestPlayer.x - bot.x);
    bot.x += Math.cos(angle) * bot.speed;
    bot.y += Math.sin(angle) * bot.speed;
  } else if (nearestSmallerBot) {
    // Перемещение к ближайшему меньшему боту
    const angle = Math.atan2(nearestSmallerBot.y - bot.y, nearestSmallerBot.x - bot.x);
    bot.x += Math.cos(angle) * bot.speed;
    bot.y += Math.sin(angle) * bot.speed;
  } else if (nearestBiggerBot) {
    // Перемещение к ближайшему большему боту
    const angle = Math.atan2(nearestBiggerBot.y - bot.y, nearestBiggerBot.x - bot.x);
    bot.x += Math.cos(angle) * bot.speed;
    bot.y += Math.sin(angle) * bot.speed;
  } else if (nearestFood) {
    // Перемещение к ближайшей еде
    const angle = Math.atan2(nearestFood.y - bot.y, nearestFood.x - bot.x);
    bot.x += Math.cos(angle) * bot.speed;
    bot.y += Math.sin(angle) * bot.speed;
  }
}

// Функция для перемещения всех ботов
function moveBots() {
  bots.forEach(bot => {
    moveBot(bot);

    food.forEach((f, index) => {
      const distance = Math.sqrt((bot.x - f.x)**2 + (bot.y - f.y)**2);
      if (distance < bot.radius + f.radius) {
        food.splice(index, 1);
        bot.radius += 2;
      }
    });

    bots.forEach((otherBot, index) => {
      if (otherBot !== bot && bot.radius > otherBot.radius) {
        const distance = Math.sqrt((bot.x - otherBot.x)**2 + (bot.y - otherBot.y)**2);
        if (distance < bot.radius + otherBot.radius) {
          // Бот съедает другого бота
          bots.splice(index, 1);
          bot.radius += otherBot.radius / 2;
        }
      }
    });

    // Столкновение игрока с ботами
    const distanceToPlayer = Math.sqrt((bot.x - player.x)**2 + (bot.y - player.y)**2);
    if (distanceToPlayer < bot.radius + player.radius && player.radius > bot.radius) {
      // Игрок съедает бота
      bots.splice(bots.indexOf(bot), 1);
      player.radius += bot.radius / 2;
    } else if (distanceToPlayer < bot.radius + player.radius && player.radius < bot.radius) {
      // Бот съедает игрока
      player.radius -= bot.radius / 2;
    }
  });
}

// Функция для проверки столкновений
function checkCollision() {
  food.forEach((f, index) => {
    const distance = Math.sqrt((player.x - f.x)**2 + (player.y - f.y)**2);
    if (distance < player.radius + f.radius) {
      food.splice(index, 1);
      player.radius += 5;
    }
  });
}

// Функция для генерации еды
function generateFood() {
  if (Math.random() < 0.02) {
    food.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 5,
      color: 'green'
    });
  }
}

// Функция для обновления камеры
function updateCamera() {
  const targetX = player.x;
  const targetY = player.y;

  camera.x += (targetX - camera.x) * 0.05;
  camera.y += (targetY - camera.y) * 0.05;
}

// Функция для сброса камеры
function resetCamera() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// Главный цикл игры
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  moveBots();
  checkCollision();
  generateFood();
  movePlayer();

  updateCamera();
  drawFood();
  drawPlayer();
  drawBots();
  resetCamera();

  requestAnimationFrame(gameLoop);
}

// Обработка событий клавиатуры
document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowUp':
      player.dy = -player.speed;
      break;
    case 'ArrowDown':
      player.dy = player.speed;
      break;
    case 'ArrowLeft':
      player.dx = -player.speed;
      break;
    case 'ArrowRight':
      player.dx = player.speed;
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'ArrowUp':
    case 'ArrowDown':
      player.dy = 0;
      break;
    case 'ArrowLeft':
    case 'ArrowRight':
      player.dx = 0;
      break;
  }
});

// Запуск игрового цикла
gameLoop();
