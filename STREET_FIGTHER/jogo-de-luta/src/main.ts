import { Sprite } from './Sprite';
import { Fighter } from './Fighter';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

canvas.width = 1024;
canvas.height = 576;

const GRAVITY = 0.7;

const background = new Sprite({
  position: { x: 0, y: 0 },
  imageSrc: '/assets/background.png'
});

// Player 1 (BOT)[cite: 14, 15, 17]
const bot = new Fighter({
  position: { x: 100, y: 100 },
  velocity: { x: 0, y: 0 },
  imageSrc: '/assets/player1_parado.png',
  framesMax: 1,
  scale: 0.8,
  attackOffset: { x: 50, y: 30 },
  sprites: {
    idle: { imageSrc: '/assets/player1_parado.png', framesMax: 1 },
    attack: { imageSrc: '/assets/player1_ataque.png', framesMax: 1 },
    takeHit: { imageSrc: '/assets/player1_tomou_dano.png', framesMax: 1 }
  }
});

// Player 2 (JOGADOR)[cite: 8, 9, 11, 12, 13, 16]
const player = new Fighter({
  position: { x: 800, y: 100 },
  velocity: { x: 0, y: 0 },
  color: 'blue',
  imageSrc: '/assets/player2_parado.png',
  framesMax: 1,
  scale: 0.8,
  attackOffset: { x: -100, y: 30 },
  sprites: {
    idle: { imageSrc: '/assets/player2_parado.png', framesMax: 1 },
    attack: { imageSrc: '/assets/player2_ataque.png', framesMax: 2 },
    shieldAttack: { imageSrc: '/assets/player2_ataque_escudo.png', framesMax: 1 },
    special: { imageSrc: '/assets/player2_especial.jpg', framesMax: 2 },
    defense: { imageSrc: '/assets/player2_defesa.png', framesMax: 1 },
    takeHit: { imageSrc: '/assets/player2_tomou_dano.png', framesMax: 1 }
  }
});

const keys = {
  left: { pressed: false },
  right: { pressed: false }
};

function checkCollision(rect1: Fighter, rect2: Fighter): boolean {
  return (
    rect1.attackBox.position.x + rect1.attackBox.width >= rect2.position.x &&
    rect1.attackBox.position.x <= rect2.position.x + rect2.width &&
    rect1.attackBox.position.y + rect1.attackBox.height >= rect2.position.y &&
    rect1.attackBox.position.y <= rect2.position.y + rect2.height
  );
}

// Relógio do Jogo
let timer = 60;
const timerElement = document.getElementById('timer');
if (timerElement) {
  const timerInterval = setInterval(() => {
    if (timer > 0) {
      timer--;
      timerElement.innerText = timer.toString();
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

function animate() {
  requestAnimationFrame(animate);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  background.drawBackground(ctx, canvas.width, canvas.height);

  // Executa Inteligência do Bot
  bot.updateBot(player);

  // Movimento do Player 2
  player.velocity.x = 0;
  if (keys.left.pressed) player.velocity.x = -5;
  else if (keys.right.pressed) player.velocity.x = 5;

  // Animação do Bot
  if (bot.isAttacking) bot.switchSprite('attack');
  else if (bot.isTakingHit) bot.switchSprite('takeHit');
  else bot.switchSprite('idle');

  // Animação do Player 2
  if (player.isAttacking) {
    // Mantém o sprite atual do ataque
  } else if (player.isDefending) {
    player.switchSprite('defense');
  } else if (player.isTakingHit) {
    player.switchSprite('takeHit');
  } else {
    player.switchSprite('idle');
  }

  bot.update(ctx, GRAVITY, canvas.height);
  player.update(ctx, GRAVITY, canvas.height);

  // Colisão: Bot atacando o Player
  if (bot.isAttacking && checkCollision(bot, player)) {
    bot.isAttacking = false;
    player.takeHit(10);
    const playerBar = document.getElementById('player2Health');
    if (playerBar) playerBar.style.width = `${player.health}%`;
  }

  // Colisão: Player atacando o Bot
  if (player.isAttacking && checkCollision(player, bot)) {
    player.isAttacking = false;
    bot.takeHit(15);
    const botBar = document.getElementById('player1Health');
    if (botBar) botBar.style.width = `${bot.health}%`;
  }
}

animate();

// --- CONTROLES DE TECLADO ---
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      keys.left.pressed = true;
      break;
    case 'ArrowRight':
      keys.right.pressed = true;
      break;
    case 'ArrowUp':
      if (player.isGrounded) player.velocity.y = -18;
      break;
    case 'z':
    case 'Z':
      player.executeAttack('attack', 300);
      break;
    case 'x':
    case 'X':
      player.executeAttack('shieldAttack', 400);
      break;
    case 'c':
    case 'C':
      player.executeAttack('special', 600);
      break;
    case 'v':
    case 'V':
      player.isDefending = true;
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'ArrowLeft':
      keys.left.pressed = false;
      break;
    case 'ArrowRight':
      keys.right.pressed = false;
      break;
    case 'v':
    case 'V':
      player.isDefending = false;
      break;
  }
});

// --- CONTROLES DOS BOTÕES NA TELA ---
const bindButton = (id: string, onPress: () => void, onRelease?: () => void) => {
  const btn = document.getElementById(id);
  if (!btn) return;

  btn.addEventListener('mousedown', onPress);
  btn.addEventListener('touchstart', (e) => { e.preventDefault(); onPress(); });

  if (onRelease) {
    btn.addEventListener('mouseup', onRelease);
    btn.addEventListener('mouseleave', onRelease);
    btn.addEventListener('touchend', onRelease);
  }
};

bindButton('btnLeft', () => { keys.left.pressed = true; }, () => { keys.left.pressed = false; });
bindButton('btnRight', () => { keys.right.pressed = true; }, () => { keys.right.pressed = false; });
bindButton('btnJump', () => { if (player.isGrounded) player.velocity.y = -18; });
bindButton('btnAttack', () => player.executeAttack('attack', 300));
bindButton('btnShield', () => player.executeAttack('shieldAttack', 400));
bindButton('btnSpecial', () => player.executeAttack('special', 600));
bindButton('btnDefend', () => { player.isDefending = true; }, () => { player.isDefending = false; });