export interface Position {
  x: number;
  y: number;
}

export interface SpriteOptions {
  position: Position;
  imageSrc: string;
  scale?: number;
  framesMax?: number;
}

export class Sprite {
  position: Position;
  image: HTMLImageElement;
  scale: number;
  framesMax: number;
  framesCurrent: number;
  framesElapsed: number;
  framesHold: number;

  constructor({ position, imageSrc, scale = 1, framesMax = 1 }: SpriteOptions) {
    this.position = position;
    this.image = new Image();
    this.image.src = imageSrc;
    this.scale = scale;
    this.framesMax = framesMax;
    this.framesCurrent = 0;
    this.framesElapsed = 0;
    this.framesHold = 10;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.image.complete) return;

    const frameWidth = this.image.width / this.framesMax;
    ctx.drawImage(
      this.image,
      this.framesCurrent * frameWidth,
      0,
      frameWidth,
      this.image.height,
      this.position.x,
      this.position.y,
      frameWidth * this.scale,
      this.image.height * this.scale
    );
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
    this.framesElapsed++;
    if (this.framesElapsed % this.framesHold === 0) {
      if (this.framesCurrent < this.framesMax - 1) {
        this.framesCurrent++;
      } else {
        this.framesCurrent = 0;
      }
    }
  }
}