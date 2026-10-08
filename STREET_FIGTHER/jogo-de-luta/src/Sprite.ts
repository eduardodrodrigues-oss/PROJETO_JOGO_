export interface Position {
  x: number;
  y: number;
}

export interface SpriteOptions {
  position: Position;
  imageSrc: string;
  scale?: number;
  framesMax?: number;
  offset?: Position;
}

export class Sprite {
  position: Position;
  image: HTMLImageElement;
  scale: number;
  framesMax: number;
  framesCurrent: number;
  framesElapsed: number;
  framesHold: number;
  offset: Position;

  constructor({
    position,
    imageSrc,
    scale = 1,
    framesMax = 1,
    offset = { x: 0, y: 0 }
  }: SpriteOptions) {
    this.position = position;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 8; // Velocidade da troca de quadros
    this.offset = offset;
  }

  // Ajusta o fundo exatamente ao tamanho do Canvas
  drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.image.complete || this.image.naturalWidth === 0) return;
    ctx.drawImage(this.image, 0, 0, width, height);
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.image.complete || this.image.naturalWidth === 0) return;

    const frameWidth = this.image.width / this.framesMax;
    ctx.drawImage(
      this.image,
      this.framesCurrent * frameWidth,
      0,
      frameWidth,
      this.image.height,
      this.position.x - this.offset.x,
      this.position.y - this.offset.y,
      frameWidth * this.scale,
      this.image.height * this.scale
    );
  }

  animateFrames() {
    this.framesElapsed++;
    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    this.animateFrames();
  }
}