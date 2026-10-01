import { Sprite } from './Sprite';
import { Fighter } from './Fighter';
import backgroundSrc from './assets/background.png';
import player1Src from './assets/player1.png';
import player2Src from './assets/player2.png';

// Ao criar as instâncias, passe os imports:
const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: backgroundSrc
});

const player = new Fighter({
  position: { x: 100, y: 0 },
  velocity: { x: 0, y: 0 },
  imageSrc: player1Src,
  framesMax: 4,
  scale: 2,
  attackOffset: { x: 50, y: 30 }
});

const enemy = new Fighter({
  position: { x: 800, y: 0 },
  velocity: { x: 0, y: 0 },
  color: 'blue',
  imageSrc: player2Src,
  framesMax: 4,
  scale: 2,
  attackOffset: { x: -90, y: 30 }
});

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

canvas.width = 1024;
canvas.height = 576;

const GRAVITY = 0.7;

// Instância do Cenário
const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: '/background.png'
});

// Instâncias dos Jogadores
const player = new Fighter({
  position: { x: 100, y: 0 },
  velocity: { x: 0, y: 0 },
  imageSrc: '/player1.png',
  framesMax: 4, // Altere conforme a quantidade de frames na sua sprite sheet
  scale: 2,
  attackOffset: { x: 50, y: 30 }
});

const enemy = new Fighter({
  position: { x: 800, y: 0 },
  velocity: { x: 0, y: 0 },
  color: 'blue',
  imageSrc: '/player2.png',
  framesMax: 4,
  scale: 2,
  attackOffset: { x: -90, y: 30 }
});

const keys = {
  a: { pressed: false },
  d: { pressed: false },
  ArrowLeft: { pressed: false },
  ArrowRight: { pressed: false }
};

// Detecção de Colisão Retangular (AABB)
function checkCollision(rect1: Fighter, rect2: Fighter): boolean {
  return (
    rect1.attackBox.position.x + rect1.attackBox.width >= rect2.position.x &&
    rect1.attackBox.position.x <= rect2.position.x + rect2.width &&
    rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y &&
    rect1.attackBox.position.y <= rect2.position.y + rect2.height
  );
}

// Timer do Jogo
let timer = 60;
const timerElement = document.getElementById('timer')!;
const timerInterval = setInterval(() => {
  if (timer > 0) {
    timer--;
    timerElement.innerText = timer.toString();
  } else {
    clearInterval(timerInterval);
  }
}, 1000);

// Loop Principal do Jogo
function animate() {
  requestAnimationFrame(animate);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Renderizar Cenário
  background.draw(ctx);

  // Atualizar Jogadores
  player.update(ctx, GRAVITY, canvas.height);
  enemy.update(ctx, GRAVITY, canvas.height);

  // Resetar Velocidade Horizontal
  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // Controles Player 1
  if (keys.a.pressed) player.velocity.x = -5;
  else if (keys.d.pressed) player.velocity.x = 5;

  // Controles Player 2
  if (keys.ArrowLeft.pressed) enemy.velocity.x = -5;
  else if (keys.ArrowRight.pressed) enemy.velocity.x = 5;

  // Checar Golpe do Player 1 no Player 2
  if (player.isAttacking && checkCollision(player, enemy)) {
    player.isAttacking = false;
    enemy.health = Math.max(0, enemy.health - 10);
    const enemyBar = document.getElementById('player2Health');
    if (enemyBar) enemyBar.style.width = `${enemy.health}%`;
  }

  // Checar Golpe do Player 2 no Player 1
  if (enemy.isAttacking && checkCollision(enemy, player)) {
    enemy.isAttacking = false;
    player.health = Math.max(0, player.health - 10);
    const playerBar = document.getElementById('player1Health');
    if (playerBar) playerBar.style.width = `${player.health}%`;
  }
}

animate();

// Eventos de Teclado
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    // Controles Player 1
    case 'd':
    case 'D':
      keys.d.pressed = true;
      break;
    case 'a':
    case 'A':
      keys.a.pressed = true;
      break;
    case 'w':
    case 'W':
      if (player.isGrounded) player.velocity.y = -18;
      break;
    case ' ':
      player.attack();
      break;

    // Controles Player 2
    case 'ArrowRight':
      keys.ArrowRight.pressed = true;
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = true;
      break;
    case 'ArrowUp':
      if (enemy.isGrounded) enemy.velocity.y = -18;
      break;
    case 'Enter':
      enemy.attack();
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
    case 'D':
      keys.d.pressed = false;
      break;
    case 'a':
    case 'A':
      keys.a.pressed = false;
      break;
    case 'ArrowRight':
      keys.ArrowRight.pressed = false;
      break;
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false;
      break;
  }
});