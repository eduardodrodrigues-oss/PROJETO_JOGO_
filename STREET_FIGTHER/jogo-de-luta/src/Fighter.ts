import { Sprite, type Position } from './Sprite';

export interface Velocity {
  x: number;
  y: number;
}

export interface HitBox {
  position: Position;
  offset: Position;
  width: number;
  height: number;
}

export interface SpriteState {
  imageSrc: string;
  framesMax: number;
}

export interface FighterOptions {
  position: Position;
  velocity: Velocity;
  color?: string;
  imageSrc: string;
  scale?: number;
  framesMax?: number;
  attackOffset?: Position;
  sprites?: {
    [key: string]: SpriteState | undefined;
  };
}

export class Fighter extends Sprite {
  velocity: Velocity;
  width: number = 60;
  height: number = 150;
  isAttacking: boolean = false;
  isTakingHit: boolean = false;
  isDefending: boolean = false;
  attackBox: HitBox;
  health: number = 100;
  color: string;
  isGrounded: boolean = false;
  sprites?: { [key: string]: SpriteState & { image: HTMLImageElement } };
  currentSpriteName: string = 'idle';

  constructor({
    position,
    velocity,
    color = 'red',
    imageSrc,
    scale = 1,
    framesMax = 1,
    attackOffset = { x: 0, y: 0 },
    sprites
  }: FighterOptions) {
    super({ position, imageSrc, scale, framesMax });
    this.velocity = velocity;
    this.color = color;
    this.attackBox = {
      position: { x: this.position.x, y: this.position.y },
      offset: attackOffset,
      width: 120,
      height: 50
    };

    if (sprites) {
      this.sprites = {};
      for (const key in sprites) {
        const spriteState = sprites[key];
        if (spriteState) {
          const img = new Image();
          img.src = spriteState.imageSrc;
          this.sprites[key] = {
            ...spriteState,
            image: img
          };
        }
      }
    }
  }

  switchSprite(spriteName: string) {
    if (this.currentSpriteName === 'takeHit' && this.isTakingHit) return;
    if (this.isAttacking && this.currentSpriteName !== spriteName) return;

    if (this.sprites && this.sprites[spriteName]) {
      if (this.image !== this.sprites[spriteName].image) {
        this.image = this.sprites[spriteName].image;
        this.framesMax = this.sprites[spriteName].framesMax;
        this.framesCurrent = 0;
        this.currentSpriteName = spriteName;
      }
    }
  }

  // Lógica da Inteligência Artificial (Bot - Player 1)
  updateBot(target: Fighter) {
    if (this.isTakingHit || this.isAttacking) return;

    const distance = target.position.x - this.position.x;

    // Persegue o Player 2
    if (Math.abs(distance) > 90) {
      this.velocity.x = distance > 0 ? 3 : -3;
    } else {
      this.velocity.x = 0;
      // Ataca aleatoriamente quando estiver perto
      if (Math.random() < 0.04) {
        this.executeAttack('attack', 300);
      }
    }

    // Pulo aleatório
    if (this.isGrounded && Math.random() < 0.005) {
      this.velocity.y = -16;
    }
  }

  executeAttack(spriteName: string, durationMs: number = 300) {
    if (this.isAttacking || this.isTakingHit || this.isDefending) return;
    this.isAttacking = true;
    this.switchSprite(spriteName);

    setTimeout(() => {
      this.isAttacking = false;
    }, durationMs);
  }

  takeHit(damage: number = 10) {
    if (this.isDefending) {
      damage = Math.floor(damage * 0.2); // Reduz 80% do dano na defesa
    } else {
      this.isTakingHit = true;
      this.switchSprite('takeHit');
      setTimeout(() => {
        this.isTakingHit = false;
      }, 400);
    }
    this.health = Math.max(0, this.health - damage);
  }

  override update(ctx: CanvasRenderingContext2D, gravity: number = 0.7, canvasHeight: number = 576) {
    this.draw(ctx);

    if (this.framesMax > 1) {
      this.animateFrames();
    } else {
      this.framesCurrent = 0;
    }

    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    if (this.isAttacking) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height
      );
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    const floorHeight = canvasHeight - 90;
    if (this.position.y + this.height + this.velocity.y >= floorHeight) {
      this.velocity.y = 0;
      this.position.y = floorHeight - this.height;
      this.isGrounded = true;
    } else {
      this.velocity.y += gravity;
      this.isGrounded = false;
    }
  }
}