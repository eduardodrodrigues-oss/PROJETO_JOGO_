import type { Rect } from "./World";

export class Player {
  public x: number;
  public y: number;
  public width: number = 48;
  public height: number = 64;
  public speed: number = 3.5;

  private idleImg: HTMLImageElement;
  private walkImg: HTMLImageElement;
  private hurtImg: HTMLImageElement;
  private die1Img: HTMLImageElement;
  private die2Img: HTMLImageElement;
  private attackImg: HTMLImageElement;
  private isLoaded: boolean = false;

  // Direção no Spritesheet:
  // 0 = Frente (Baixo) | 1 = Direita | 2 = Costas (Cima) | 3 = Esquerda
  private direction: number = 0;
  private isMoving: boolean = false;

  // Controle de Espada e Ataque
  public hasSword: boolean = false;
  public isAttacking: boolean = false;
  private attackTimer: number = 0;
  private attackDuration: number = 250; // Duração do ataque em ms

  // Controle do estado de Dano
  public isHurt: boolean = false;
  private hurtFrame: number = 0;
  private hurtTimer: number = 0;
  private hurtFrameSpeed: number = 100;

  // Controle do estado de Morte
  private isDying: boolean = false;
  private isDead: boolean = false;
  private deathFrame: number = 0;
  private deathTimer: number = 0;
  private deathFrameSpeed: number = 100;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.idleImg = new Image();
    this.idleImg.src = "/assets/player_idle.png";

    this.walkImg = new Image();
    this.walkImg.src = "/assets/player_walk.png";

    this.hurtImg = new Image();
    this.hurtImg.src = "/assets/tomando_dano.png";

    this.die1Img = new Image();
    this.die1Img.src = "/assets/morrendo1.png";

    this.die2Img = new Image();
    this.die2Img.src = "/assets/morrendo_morrendo2.png";

    this.attackImg = new Image();
    this.attackImg.src = "/assets/ataque_player.png";

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 6) {
        this.isLoaded = true;
      }
    };

    this.idleImg.onload = checkLoaded;
    this.walkImg.onload = checkLoaded;
    this.hurtImg.onload = checkLoaded;
    this.die1Img.onload = checkLoaded;
    this.die2Img.onload = checkLoaded;
    this.attackImg.onload = checkLoaded;
  }

  // Realiza o ataque se possuir a espada
  public attack(): void {
    if (!this.hasSword || this.isAttacking || this.isHurt || this.isDying || this.isDead) return;
    this.isAttacking = true;
    this.attackTimer = 0;
  }

  // Ativa a animação de morte
  public triggerDeath(): void {
    if (this.isDying || this.isDead) return;
    this.isDying = true;
    this.isDead = false;
    this.deathFrame = 0;
    this.deathTimer = 0;
  }

  // Reinicia os estados do jogador
  public reset(): void {
    this.isDying = false;
    this.isDead = false;
    this.isHurt = false;
    this.isAttacking = false;
    this.deathFrame = 0;
    this.deathTimer = 0;
    this.hurtFrame = 0;
    this.hurtTimer = 0;
  }

  public getIsDying(): boolean {
    return this.isDying;
  }

  public getIsDead(): boolean {
    return this.isDead;
  }

  public takeDamage(): void {
    if (this.isHurt || this.isDying || this.isDead) return;
    this.isHurt = true;
    this.hurtFrame = 0;
    this.hurtTimer = 0;
  }

  public update(deltaTime: number): void {
    // Atualização da animação de Morte
    if (this.isDying) {
      this.deathTimer += deltaTime;
      if (this.deathTimer >= this.deathFrameSpeed) {
        this.deathTimer = 0;
        this.deathFrame++;

        if (this.deathFrame >= 14) {
          this.deathFrame = 13;
          this.isDying = false;
          this.isDead = true;
        }
      }
      return;
    }

    // Atualização do Ataque
    if (this.isAttacking) {
      this.attackTimer += deltaTime;
      if (this.attackTimer >= this.attackDuration) {
        this.isAttacking = false;
        this.attackTimer = 0;
      }
      return;
    }

    // Atualização de Dano
    if (this.isHurt) {
      this.hurtTimer += deltaTime;
      if (this.hurtTimer >= this.hurtFrameSpeed) {
        this.hurtTimer = 0;
        this.hurtFrame++;

        if (this.hurtFrame >= 3) {
          this.isHurt = false;
          this.hurtFrame = 0;
        }
      }
    }
  }

  public move(dx: number, dy: number, obstacles: Rect[]): void {
    if (this.isHurt || this.isDying || this.isDead || this.isAttacking) {
      this.isMoving = false;
      return;
    }

    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      if (dy > 0) this.direction = 0;
      else if (dx > 0) this.direction = 1;
      else if (dy < 0) this.direction = 2;
      else if (dx < 0) this.direction = 3;

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
    return {
      x: customX + 12,
      y: customY + this.height - 18,
      width: this.width - 24,
      height: 16
    };
  }

  // Hitbox de alcance do Ataque
  public getAttackHitbox(): Rect {
    const attackWidth = 60;
    const attackHeight = 60;

    if (this.direction === 1) { // Direita
      return { x: this.x + this.width, y: this.y, width: attackWidth, height: attackHeight };
    } else if (this.direction === 3) { // Esquerda
      return { x: this.x - attackWidth, y: this.y, width: attackWidth, height: attackHeight };
    } else if (this.direction === 2) { // Cima
      return { x: this.x, y: this.y - attackHeight, width: attackWidth, height: attackHeight };
    } else { // Baixo
      return { x: this.x, y: this.y + this.height, width: attackWidth, height: attackHeight };
    }
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

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // 1. Morte
    if (this.isDying || this.isDead) {
      let currentImg: HTMLImageElement;
      let localFrameIndex: number;

      if (this.deathFrame < 7) {
        currentImg = this.die1Img;
        localFrameIndex = this.deathFrame;
      } else {
        currentImg = this.die2Img;
        localFrameIndex = this.deathFrame - 7;
      }

      const frameWidth = currentImg.width / 7;
      const frameHeight = currentImg.height;
      const sx = localFrameIndex * frameWidth;

      if (this.direction === 3) {
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(currentImg, sx, 0, frameWidth, frameHeight, 0, 0, this.width, this.height);
      } else {
        ctx.drawImage(currentImg, sx, 0, frameWidth, frameHeight, this.x, this.y, this.width, this.height);
      }

      ctx.restore();
      return;
    }

    // 2. Ataque
    if (this.isAttacking) {
      const attackSize = 120;
      const offsetX = (attackSize - this.width) / 2;
      const offsetY = (attackSize - this.height) / 2;

      if (this.direction === 3) {
        ctx.translate(this.x + this.width + offsetX, this.y - offsetY);
        ctx.scale(-1, 1);
        ctx.drawImage(this.attackImg, 0, 0, attackSize, attackSize);
      } else {
        ctx.drawImage(this.attackImg, this.x - offsetX, this.y - offsetY, attackSize, attackSize);
      }

      ctx.restore();
      return;
    }

    // 3. Dano
    if (this.isHurt) {
      const frameWidth = this.hurtImg.width / 3;
      const frameHeight = this.hurtImg.height;
      const sx = this.hurtFrame * frameWidth;

      if (this.direction === 3) {
        ctx.translate(this.x + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.hurtImg, sx, 0, frameWidth, frameHeight, 0, 0, this.width, this.height);
      } else {
        ctx.drawImage(this.hurtImg, sx, 0, frameWidth, frameHeight, this.x, this.y, this.width, this.height);
      }

      ctx.restore();
      return;
    }

    // 4. Idle / Walk
    const currentImg = this.isMoving ? this.walkImg : this.idleImg;
    const frameWidth = currentImg.width / 4;
    const frameHeight = currentImg.height;

    const sx = this.direction * frameWidth;

    ctx.drawImage(currentImg, sx, 0, frameWidth, frameHeight, this.x, this.y, this.width, this.height);

    ctx.restore();
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