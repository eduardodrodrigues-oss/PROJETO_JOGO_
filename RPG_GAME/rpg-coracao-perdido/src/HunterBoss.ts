export class HunterBoss {
  public x: number;
  public y: number;
  public width: number = 135;
  public height: number = 135;

  public health: number = 3000;
  public maxHealth: number = 3000;

  public isHostile: boolean = false;
  public isSurrendered: boolean = false;
  public isMoving: boolean = false;
  
  // Estados da missão:
  // 0: Inicial / Não conversou
  // 1: Missão aceita (coletar carnes)
  // 2: Carnes entregues
  // 3: Em combate
  // 4: Derrotado / Rendido
  public questState: number = 0;

  // Imagens do Caçador
  public portraitImg: HTMLImageElement;
  private paradoImg: HTMLImageElement;
  private rendidoImg: HTMLImageElement;
  private andandoBaixoImg: HTMLImageElement;
  private andandoEsqImg: HTMLImageElement;
  private andandoDirImg: HTMLImageElement;
  private ataque1Img: HTMLImageElement;
  private ataque2Img: HTMLImageElement;
  private cimaImg: HTMLImageElement;
  private danoImg: HTMLImageElement;

  private facingDirection: "down" | "left" | "right" | "up" = "down";
  private isAttacking: boolean = false;
  private attackTimer: number = 0;
  private attackCooldown: number = 0;
  private isTakingDamage: boolean = false;
  private damageTimer: number = 0;
  private animFrameTimer: number = 0;
  private currentFrameIndex: number = 0;

  constructor(x: number = 280, y: number = 250) {
    this.x = x;
    this.y = y;

    this.portraitImg = new Image();
    this.portraitImg.src = "/assets/Folha de Retratos do Doutor da Peste.png";

    this.paradoImg = new Image();
    this.paradoImg.src = "/assets/caçador_parado.png";

    this.rendidoImg = new Image();
    this.rendidoImg.src = "/assets/caçador_rendido.png";

    this.andandoBaixoImg = new Image();
    this.andandoBaixoImg.src = "/assets/caçador_andando_para_baixo.png";

    this.andandoEsqImg = new Image();
    this.andandoEsqImg.src = "/assets/caçador_andando_lado_esquerdo.png";

    this.andandoDirImg = new Image();
    this.andandoDirImg.src = "/assets/caçador_andando_lado_direito.png";

    this.ataque1Img = new Image();
    this.ataque1Img.src = "/assets/caçador_Ataque1.png";

    this.ataque2Img = new Image();
    this.ataque2Img.src = "/assets/caçador_ataque2.png";

    this.cimaImg = new Image();
    this.cimaImg.src = "/assets/caçador_cima.png";

    this.danoImg = new Image();
    this.danoImg.src = "/assets/caçador_tomando_dano.png";
  }

  public takeDamage(amount: number): void {
    if (this.isSurrendered || !this.isHostile) return;

    this.health = Math.max(0, this.health - amount);
    this.isTakingDamage = true;
    this.damageTimer = 300;

    if (this.health <= 0) {
      this.isHostile = false;
      this.isSurrendered = true;
      this.questState = 4;
    }
  }

  public update(playerX: number, playerY: number, deltaTime: number): void {
    this.animFrameTimer += deltaTime;
    if (this.animFrameTimer > 180) {
      this.currentFrameIndex++;
      this.animFrameTimer = 0;
    }

    if (this.damageTimer > 0) {
      this.damageTimer -= deltaTime;
      if (this.damageTimer <= 0) this.isTakingDamage = false;
    }

    if (!this.isHostile || this.isSurrendered) {
      this.isMoving = false;
      return;
    }

    if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    if (Math.abs(dx) > Math.abs(dy)) {
      this.facingDirection = dx > 0 ? "right" : "left";
    } else {
      this.facingDirection = dy > 0 ? "down" : "up";
    }

    if (dist > 45 && !this.isAttacking) {
      const speed = 1.9;
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;
      this.isMoving = true;
    } else {
      this.isMoving = false;
      if (dist <= 45 && this.attackCooldown <= 0 && !this.isAttacking) {
        this.isAttacking = true;
        this.attackTimer = 500;
        this.attackCooldown = 1400;
      }
    }

    if (this.isAttacking) {
      this.attackTimer -= deltaTime;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }
  }

  public checkAttackImpact(playerX: number, playerY: number, playerW: number, playerH: number): number {
    if (!this.isHostile || this.isSurrendered || !this.isAttacking || this.attackTimer < 200) return 0;

    const dist = Math.hypot(
      (this.x + this.width / 2) - (playerX + playerW / 2),
      (this.y + this.height / 2) - (playerY + playerH / 2)
    );

    if (dist < 55) {
      return 18;
    }
    return 0;
  }

  private drawSpriteFrame(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    frameIndex: number = 0
  ): boolean {
    if (!img.complete || img.naturalWidth === 0) return false;

    // Detecta se a imagem é uma folha de sprites horizontal e recorta o frame quadrado
    const frameSize = img.naturalHeight > 0 ? img.naturalHeight : 64;
    const totalFrames = Math.max(1, Math.floor(img.naturalWidth / frameSize));
    const currentFrame = frameIndex % totalFrames;

    ctx.drawImage(
      img,
      currentFrame * frameSize, 0, frameSize, frameSize,
      x, y, w, h
    );
    return true;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Rendido / Derrotado
    if (this.isSurrendered) {
      if (!this.drawSpriteFrame(ctx, this.rendidoImg, this.x - 10, this.y - 10, this.width + 20, this.height + 20, 0)) {
        ctx.fillStyle = "#555555";
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
      ctx.restore();
      return;
    }

    // Sofrendo dano
    if (this.isTakingDamage) {
      if (this.drawSpriteFrame(ctx, this.danoImg, this.x, this.y, this.width, this.height, 0)) {
        ctx.restore();
        return;
      }
    }

    // Atacando
    if (this.isAttacking) {
      const spriteAtaque = (Math.floor(Date.now() / 250) % 2 === 0) ? this.ataque1Img : this.ataque2Img;
      if (this.drawSpriteFrame(ctx, spriteAtaque, this.x - 15, this.y - 15, this.width + 30, this.height + 30, 0)) {
        ctx.restore();
        return;
      }
    }

    // Movimentação vs Parado
    let currentImg = this.paradoImg;
    if (this.isMoving) {
      if (this.facingDirection === "down") currentImg = this.andandoBaixoImg;
      else if (this.facingDirection === "left") currentImg = this.andandoEsqImg;
      else if (this.facingDirection === "right") currentImg = this.andandoDirImg;
      else if (this.facingDirection === "up") currentImg = this.cimaImg;
    }

    const drawn = this.drawSpriteFrame(ctx, currentImg, this.x, this.y, this.width, this.height, this.isMoving ? this.currentFrameIndex : 0);
    
    // Se a imagem selecionada não carregou, tenta a imagem parada padrão
    if (!drawn && currentImg !== this.paradoImg) {
      this.drawSpriteFrame(ctx, this.paradoImg, this.x, this.y, this.width, this.height, 0);
    }

    // Barra de Vida quando Hostil
    if (this.isHostile && !this.isSurrendered) {
      const barW = 60;
      const barH = 6;
      const barX = this.x + (this.width - barW) / 2;
      const barY = this.y - 14;

      ctx.fillStyle = "rgba(0,0,0,0.85)";
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

      const fillW = (this.health / this.maxHealth) * barW;
      ctx.fillStyle = "#d62828";
      ctx.fillRect(barX, barY, fillW, barH);
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);
    }

    ctx.restore();
  }
}