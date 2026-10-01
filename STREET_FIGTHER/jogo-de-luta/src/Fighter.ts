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

export interface FighterOptions {
  position: Position;
  velocity: Velocity;
  color?: string;
  imageSrc: string;
  scale?: number;
  framesMax?: number;
  attackOffset?: Position;
}

export class Fighter extends Sprite {
  velocity: Velocity;
  width: number = 60;
  height: number = 150;
  isAttacking: boolean = false;
  attackBox: HitBox;
  health: number = 100;
  color: string;
  isGrounded: boolean = false;

  constructor({
    position,
    velocity,
    color = 'red',
    imageSrc,
    scale = 1,
    framesMax = 1,
    attackOffset = { x: 0, y: 0 }
  }: FighterOptions) {
    super({ position, imageSrc, scale, framesMax });
    this.velocity = velocity;
    this.color = color;
    this.attackBox = {
      position: { x: this.position.x, y: this.position.y },
      offset: attackOffset,
      width: 100,
      height: 50
    };
  }

  override update(ctx: CanvasRenderingContext2D, gravity: number, canvasHeight: number) {
    this.draw(ctx);

    // Atualiza a posição da caixa de ataque junto com o personagem
    this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
    this.attackBox.position.y = this.position.y + this.attackBox.offset.y;

    // Desenha caixa de ataque para depuração visual (opcional)
    if (this.isAttacking) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(
        this.attackBox.position.x,
        this.attackBox.position.y,
        this.attackBox.width,
        this.attackBox.height
      );
    }

    // Movimentação horizontal e vertical
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Física de Gravidade e Colisão com o Chão
    const floorHeight = canvasHeight - 90; // Ajuste do limite do chão
    if (this.position.y + this.height + this.velocity.y >= floorHeight) {
      this.velocity.y = 0;
      this.position.y = floorHeight - this.height;
      this.isGrounded = true;
    } else {
      this.velocity.y += gravity;
      this.isGrounded = false;
    }
  }

  attack() {
    if (this.isAttacking) return;
    this.isAttacking = true;
    setTimeout(() => {
      this.isAttacking = false;
    }, 200);
  }
}