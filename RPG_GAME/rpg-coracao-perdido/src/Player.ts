import type { Rect } from "./World";

export class Player {
  public x: number;
  public y: number;
  public width: number = 48;
  public height: number = 64;
  public speed: number = 3.5;

  private idleImg: HTMLImageElement;
  private walkImg: HTMLImageElement;
  private isLoaded: boolean = false;

  // Direção no Spritesheet:
  // 0 = Frente (Baixo) | 1 = Direita | 2 = Costas (Cima) | 3 = Esquerda
  private direction: number = 0;
  private isMoving: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.idleImg = new Image();
    this.idleImg.src = "/assets/player_idle.png";

    this.walkImg = new Image();
    this.walkImg.src = "/assets/player_walk.png";

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        this.isLoaded = true;
      }
    };

    this.idleImg.onload = checkLoaded;
    this.walkImg.onload = checkLoaded;
  }

  public move(dx: number, dy: number, obstacles: Rect[]): void {
    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      if (dy > 0) this.direction = 0;      // Baixo / Frente (Frame 0)
      else if (dx > 0) this.direction = 1; // Direita (Frame 1)
      else if (dy < 0) this.direction = 2; // Cima / Costas (Frame 2)
      else if (dx < 0) this.direction = 3; // Esquerda (Frame 3)

      let moveX = dx;
      let moveY = dy;
      if (dx !== 0 && dy !== 0) {
        moveX *= 0.7071;
        moveY *= 0.7071;
      }

      const nextX = this.x + moveX * this.speed;
      if (!this.checkCollision(nextX, this.y, obstacles)) {
        this.x = nextX;
      }

      const nextY = this.y + moveY * this.speed;
      if (!this.checkCollision(this.x, nextY, obstacles)) {
        this.y = nextY;
      }
    }
  }

  public getHitbox(customX = this.x, customY = this.y): Rect {
    // Caixa de colisão retangular na base dos pés do personagem
    return {
      x: customX + 12,
      y: customY + this.height - 18,
      width: this.width - 24,
      height: 16
    };
  }

  private checkCollision(nextX: number, nextY: number, obstacles: Rect[]): boolean {
    const hitbox = this.getHitbox(nextX, nextY);

    for (const obs of obstacles) {
      if (
        hitbox.x < obs.x + obs.width &&
        hitbox.x + hitbox.width > obs.x &&
        hitbox.y < obs.y + obs.height &&
        hitbox.y + hitbox.height > obs.y
      ) {
        return true;
      }
    }
    return false;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.isLoaded) {
      ctx.fillStyle = "#3498db";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    const currentImg = this.isMoving ? this.walkImg : this.idleImg;
    const frameWidth = currentImg.width / 4;
    const frameHeight = currentImg.height;

    const sx = this.direction * frameWidth;
    const sy = 0;

    ctx.drawImage(
      currentImg,
      sx,
      sy,
      frameWidth,
      frameHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }

  public renderDebug(ctx: CanvasRenderingContext2D): void {
    const hb = this.getHitbox();
    ctx.save();
    ctx.fillStyle = "rgba(0, 255, 0, 0.5)";
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.fillRect(hb.x, hb.y, hb.width, hb.height);
    ctx.strokeRect(hb.x, hb.y, hb.width, hb.height);
    ctx.restore();
  }
}