// Prologue.ts

export class Prologue {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mapImage: HTMLImageElement;
  private onComplete: () => void;

  private state: "NARRATIVE" | "TITLE_CARD" | "DONE" = "NARRATIVE";

  // Textos da narrativa inicial do prólogo
  private storyTexts: string[] = [
    "O silêncio que se seguiu à queda do monstro foi mais pesado que o combate...",
    "A carne enxertada estremeceu uma última vez e começou a se desfazer em cinzas cinzentas.",
    "Com a criatura derrotada, a névoa que bloqueava a passagem ao norte começou a se dissipar.",
    "Um vento frio soprou das terras esquecidas sob a sombra do castelo..."
  ];

  private currentIndex: number = 0;
  private currentDisplayedText: string = "";
  private charIndex: number = 0;
  private typeSpeed: number = 40;
  private lastCharTime: number = 0;

  // Variáveis da tela do título "Prólogo: Coração"
  private titleAlpha: number = 0;
  private titleState: "FADE_IN" | "WAIT" | "FADE_OUT" = "FADE_IN";
  private titleTimer: number = 0;

  private keyListener: (e: KeyboardEvent) => void;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, mapImage: HTMLImageElement, onComplete: () => void) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.mapImage = mapImage;
    this.onComplete = onComplete;

    this.keyListener = this.handleKeyDown.bind(this);
    window.addEventListener("keydown", this.keyListener);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    if (key === " " || key === "enter" || key === "e") {

      // Se estiver na fase de texto
      if (this.state === "NARRATIVE") {
        const fullText = this.storyTexts[this.currentIndex];
        if (this.currentDisplayedText.length < fullText.length) {
          this.currentDisplayedText = fullText;
          this.charIndex = fullText.length;
          return;
        }

        this.currentIndex++;
        this.charIndex = 0;
        this.currentDisplayedText = "";

        // Quando terminam as frases da narrativa, passa para o Cartão de Título
        if (this.currentIndex >= this.storyTexts.length) {
          this.state = "TITLE_CARD";
        }
      } 
      // Se estiver no título cinemático, permite pular apertando tecla
      else if (this.state === "TITLE_CARD") {
        this.finish();
      }
    }
  }

  public update(deltaTime: number): void {
    if (this.state === "NARRATIVE") {
      const fullText = this.storyTexts[this.currentIndex];
      const now = Date.now();

      if (this.charIndex < fullText.length && now - this.lastCharTime > this.typeSpeed) {
        this.currentDisplayedText += fullText[this.charIndex];
        this.charIndex++;
        this.lastCharTime = now;
      }
    } else if (this.state === "TITLE_CARD") {
      // Animação de Fade do Título "Prólogo: Coração"
      if (this.titleState === "FADE_IN") {
        this.titleAlpha += deltaTime / 1000;
        if (this.titleAlpha >= 1) {
          this.titleAlpha = 1;
          this.titleState = "WAIT";
          this.titleTimer = 0;
        }
      } else if (this.titleState === "WAIT") {
        this.titleTimer += deltaTime;
        if (this.titleTimer >= 2200) { // Fica visível por 2.2 segundos
          this.titleState = "FADE_OUT";
        }
      } else if (this.titleState === "FADE_OUT") {
        this.titleAlpha -= deltaTime / 1000;
        if (this.titleAlpha <= 0) {
          this.titleAlpha = 0;
          this.finish();
        }
      }
    }
  }

  public render(): void {
    this.ctx.save();

    if (this.state === "NARRATIVE") {
      // Fundo preto puro para a narrativa falada
      this.ctx.fillStyle = "#000000";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = "#f0e6d2";
      this.ctx.font = "italic 18px Georgia, serif";
      this.ctx.textAlign = "center";

      const lines = this.wrapText(this.currentDisplayedText, 600);
      let startY = 360 - (lines.length * 15);

      lines.forEach((line) => {
        this.ctx.fillText(line, this.canvas.width / 2, startY);
        startY += 32;
      });

      const isTextComplete = this.currentDisplayedText.length === this.storyTexts[this.currentIndex].length;
      if (isTextComplete) {
        const pulse = 0.4 + Math.sin(Date.now() / 300) * 0.4;
        this.ctx.fillStyle = `rgba(212, 175, 55, ${pulse})`;
        this.ctx.font = "bold 13px sans-serif";
        this.ctx.fillText("[Espaço / Enter / E] Avançar", this.canvas.width / 2, 720);
      }
    } else if (this.state === "TITLE_CARD") {
      // Desenha o mapa do prólogo no fundo
      if (this.mapImage.complete) {
        this.ctx.drawImage(this.mapImage, 0, 0, this.canvas.width, this.canvas.height);
      } else {
        this.ctx.fillStyle = "#050805";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }

      // Máscara escura suave por cima do mapa
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Texto do Título "Prólogo: Coração"
      this.ctx.globalAlpha = this.titleAlpha;
      
      // Subtítulo PRÓLOGO
      this.ctx.fillStyle = "#d4af37";
      this.ctx.font = "bold 16px Georgia, serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("— PRÓLOGO —", this.canvas.width / 2, 360);

      // Título principal Coração
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 42px Georgia, serif";
      this.ctx.fillText("Coração", this.canvas.width / 2, 415);

      // Linha decorativa
      this.ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(this.canvas.width / 2 - 80, 435);
      this.ctx.lineTo(this.canvas.width / 2 + 80, 435);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private finish(): void {
    if (this.state === "DONE") return;
    this.state = "DONE";
    this.destroy();
    this.onComplete();
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0] || "";

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = this.ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  public destroy(): void {
    window.removeEventListener("keydown", this.keyListener);
  }
}