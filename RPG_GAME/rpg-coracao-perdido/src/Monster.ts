export type MonsterState = "IDLE" | "WALK" | "RUN" | "ATTACK_MELEE" | "ATTACK_TENTACLE";

interface FrameConfig {
  cols: number;        // Número de colunas na imagem
  rows: number;        // Número de linhas na imagem
  totalFrames: number; // Quantidade total de quadros de animação
}

export class Monster {
  public x: number;
  public y: number;
  public width: number = 128;
  public height: number = 128;

  // --- SISTEMA DE VIDA E DANO ---
  public hp: number = 100;
  public maxHp: number = 100;
  private hurtTimer: number = 0; // Tempo que fica piscando ao levar dano

  private state: MonsterState = "IDLE";
  private facingLeft: boolean = false;

  private speedWalk: number = 1.2;
  private speedRun: number = 2.4;

  private sprites: Map<MonsterState, HTMLImageElement> = new Map();

  private frameConfigs: Record<MonsterState, FrameConfig> = {
    IDLE: { cols: 7, rows: 1, totalFrames: 7 },
    WALK: { cols: 7, rows: 1, totalFrames: 7 },
    RUN: { cols: 6, rows: 1, totalFrames: 6 },
    ATTACK_MELEE: { cols: 4, rows: 1, totalFrames: 4 },
    ATTACK_TENTACLE: { cols: 6, rows: 1, totalFrames: 6 }
  };

  private currentFrame: number = 0;
  private animTimer: number = 0;
  private frameSpeed: number = 140;

  private isAttacking: boolean = false;
  private attackCooldown: number = 0;
  private attackDamage: number = 0;
  public hasDealtDamageThisAttack: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.loadSprites();
  }

  private loadSprites(): void {
    const sources: { state: MonsterState; src: string }[] = [
      { state: "IDLE", src: "/assets/parado_monstro.png" },
      { state: "WALK", src: "/assets/andando_monstro.png" },
      { state: "RUN", src: "/assets/correr monstro.png" },
      { state: "ATTACK_MELEE", src: "/assets/ataque monstro.png" },
      { state: "ATTACK_TENTACLE", src: "/assets/atque tentaculo.png" }
    ];

    sources.forEach(({ state, src }) => {
      const img = new Image();
      img.src = src;
      this.sprites.set(state, img);
    });
  }

  // --- MÉTODOS DE DANO E HITBOX ---

  /** Aplica dano ao monstro e aciona o efeito de flash */
  public takeDamage(amount: number): void {
    if (this.isDead()) return;

    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;

    this.hurtTimer = 250; // Pisca vermelho por 250ms
  }

  /** Retorna true se o monstro zerou a vida */
  public isDead(): boolean {
    return this.hp <= 0;
  }

  /** Retorna a caixa de colisão para a espada do jogador acertar */
  public getHitbox(): { x: number; y: number; width: number; height: number } {
    const paddingX = 36;
    const paddingY = 28;
    return {
      x: this.x + paddingX,
      y: this.y + paddingY,
      width: this.width - paddingX * 2,
      height: this.height - paddingY * 2
    };
  }

  public update(playerX: number, playerY: number, deltaTime: number): void {
    // Se o monstro estiver morto, interrompe a IA
    if (this.isDead()) return;

    if (this.hurtTimer > 0) {
      this.hurtTimer -= deltaTime;
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    const monsterCenterX = this.x + this.width / 2;
    const monsterCenterY = this.y + this.height / 2;
    const dist = Math.hypot(playerX - monsterCenterX, playerY - monsterCenterY);

    this.facingLeft = playerX < monsterCenterX;

    if (!this.isAttacking) {
      if (dist <= 90 && this.attackCooldown <= 0) {
        const useTentacle = Math.random() > 0.5;
        this.startAttack(useTentacle ? "ATTACK_TENTACLE" : "ATTACK_MELEE");
      } else if (dist <= 300) {
        this.setState("RUN");
        this.moveTowards(playerX, playerY, this.speedRun);
      } else if (dist <= 480) {
        this.setState("WALK");
        this.moveTowards(playerX, playerY, this.speedWalk);
      } else {
        this.setState("IDLE");
      }
    }

    this.updateAnimation(deltaTime);
  }

  private moveTowards(targetX: number, targetY: number, speed: number): void {
    const monsterCenterX = this.x + this.width / 2;
    const monsterCenterY = this.y + this.height / 2;
    const angle = Math.atan2(targetY - monsterCenterY, targetX - monsterCenterX);

    this.x += Math.cos(angle) * speed;
    this.y += Math.sin(angle) * speed;
  }

  private startAttack(attackType: "ATTACK_MELEE" | "ATTACK_TENTACLE"): void {
    this.isAttacking = true;
    this.hasDealtDamageThisAttack = false;
    this.setState(attackType);
    this.currentFrame = 0;
    this.animTimer = 0;
    this.attackDamage = attackType === "ATTACK_MELEE" ? 12 : 20;
  }

  private setState(newState: MonsterState): void {
    if (this.state !== newState) {
      this.state = newState;
      if (!this.isAttacking) {
        this.currentFrame = 0;
        this.animTimer = 0;
      }
    }
  }

  private updateAnimation(deltaTime: number): void {
    this.animTimer += deltaTime;

    const config = this.frameConfigs[this.state];
    const totalFrames = config ? config.totalFrames : 1;
    const speed = this.isAttacking ? 100 : this.frameSpeed;

    if (this.animTimer >= speed) {
      this.animTimer = 0;
      this.currentFrame++;

      if (this.currentFrame >= totalFrames) {
        if (this.isAttacking) {
          this.isAttacking = false;
          this.attackCooldown = 1200;
          this.setState("IDLE");
        } else {
          this.currentFrame = 0;
        }
      }
    }
  }

  public checkAttackImpact(playerX: number, playerY: number, playerW: number, playerH: number): number {
    if (this.isDead() || !this.isAttacking || this.hasDealtDamageThisAttack) return 0;

    const activeFrame = this.state === "ATTACK_MELEE" ? 2 : 3;

    if (this.currentFrame === activeFrame) {
      const reach = this.state === "ATTACK_TENTACLE" ? 110 : 85;
      const monsterCenterX = this.x + this.width / 2;
      const monsterCenterY = this.y + this.height / 2;
      const dist = Math.hypot(playerX + playerW / 2 - monsterCenterX, playerY + playerH / 2 - monsterCenterY);

      if (dist <= reach) {
        this.hasDealtDamageThisAttack = true;
        return this.attackDamage;
      }
    }

    return 0;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.isDead()) return; // Não desenha se estiver morto

    const img = this.sprites.get(this.state);
    const config = this.frameConfigs[this.state];

    if (!img || !img.complete || img.naturalWidth === 0 || !config) {
      ctx.fillStyle = "#2d5a27";
      ctx.fillRect(this.x, this.y, this.width, this.height);
      return;
    }

    const { cols, rows } = config;
    const frameIndex = this.currentFrame;

    const col = frameIndex % cols;
    const row = Math.floor(frameIndex / cols);

    const frameWidth = img.naturalWidth / cols;
    const frameHeight = img.naturalHeight / rows;

    const sx = Math.floor(col * frameWidth);
    const sy = Math.floor(row * frameHeight);
    const sw = Math.floor(frameWidth);
    const sh = Math.floor(frameHeight);

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Efeito de piscar em vermelho ao receber dano
    if (this.hurtTimer > 0) {
      ctx.filter = "brightness(1.5) sepia(1) hue-rotate(-50deg) saturate(6)";
    }

    if (this.facingLeft) {
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, this.width, this.height);
    } else {
      ctx.drawImage(img, sx, sy, sw, sh, this.x, this.y, this.width, this.height);
    }

    ctx.restore();

    // Desenha a Barra de Vida Flutuante em cima do monstro
    this.renderHealthBar(ctx);
  }

  private renderHealthBar(ctx: CanvasRenderingContext2D): void {
    if (this.hp < this.maxHp) {
      const barWidth = 60;
      const barHeight = 6;
      const barX = this.x + (this.width - barWidth) / 2;
      const barY = this.y - 12;

      ctx.save();
      // Fundo escuro da barra
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

      // Preenchimento da vida
      const hpRatio = this.hp / this.maxHp;
      ctx.fillStyle = hpRatio > 0.4 ? "#ff2a55" : "#d91438";
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
      ctx.restore();
    }
  }
}