export interface DialogueNode {
  speakerName?: string;
  portraitSrc?: string;
  text: string;
  options?: { text: string; nextIndex: number | null; action?: () => void }[];
}

export class DialogueSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private images: Map<string, HTMLImageElement> = new Map();
  
  public isActive: boolean = false;
  private currentDialogues: DialogueNode[] = [];
  private currentIndex: number = 0;
  private selectedOption: number = 0;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  public preloadPortrait(src: string): void {
    if (!this.images.has(src)) {
      const img = new Image();
      img.src = src;
      this.images.set(src, img);
    }
  }

  public startDialogue(dialogues: DialogueNode[]): void {
    this.currentDialogues = dialogues;
    this.currentIndex = 0;
    this.selectedOption = 0;
    this.isActive = true;
  }

  public handleKeyDown(e: KeyboardEvent, onComplete?: () => void): void {
    if (!this.isActive) return;

    const currentNode = this.currentDialogues[this.currentIndex];

    if (currentNode.options && currentNode.options.length > 0) {
      if (e.key === "ArrowUp" || e.key === "w") {
        this.selectedOption = Math.max(0, this.selectedOption - 1);
      } else if (e.key === "ArrowDown" || e.key === "s") {
        this.selectedOption = Math.min(currentNode.options.length - 1, this.selectedOption + 1);
      } else if (e.key === "Enter" || e.key === "e") {
        const choice = currentNode.options[this.selectedOption];
        if (choice.action) choice.action();
        
        if (choice.nextIndex !== null) {
          this.currentIndex = choice.nextIndex;
          this.selectedOption = 0;
        } else {
          this.closeDialogue(onComplete);
        }
      }
    } else {
      if (e.key === "Enter" || e.key === "e" || e.key === " ") {
        this.currentIndex++;
        if (this.currentIndex >= this.currentDialogues.length) {
          this.closeDialogue(onComplete);
        }
      }
    }
  }

  private closeDialogue(onComplete?: () => void): void {
    this.isActive = false;
    if (onComplete) onComplete();
  }

  public render(): void {
    if (!this.isActive || this.currentIndex >= this.currentDialogues.length) return;

    const node = this.currentDialogues[this.currentIndex];
    const boxX = 20;
    const boxY = this.canvas.height - 150;
    const boxWidth = this.canvas.width - 40;
    const boxHeight = 130;

    this.ctx.save();

    // Fundo da caixa de diálogo
    this.ctx.fillStyle = "rgba(15, 12, 20, 0.92)";
    this.ctx.strokeStyle = "#8b6d31"; // Borda dourada/envelhecida
    this.ctx.lineWidth = 3;
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    let textStartX = boxX + 20;

    // Retrato do Personagem (se houver)
    if (node.portraitSrc && this.images.has(node.portraitSrc)) {
      const portraitImg = this.images.get(node.portraitSrc)!;
      const portraitSize = 110;
      const portraitX = boxX + 15;
      const portraitY = boxY + 10;

      // Moldura do Retrato
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(portraitX - 2, portraitY - 2, portraitSize + 4, portraitSize + 4);
      this.ctx.drawImage(portraitImg, portraitX, portraitY, portraitSize, portraitSize);
      this.ctx.strokeStyle = "#5a4521";
      this.ctx.strokeRect(portraitX - 2, portraitY - 2, portraitSize + 4, portraitSize + 4);

      textStartX = portraitX + portraitSize + 20;
    }

    // Nome do Personagem
    if (node.speakerName) {
      this.ctx.fillStyle = "#e0c068";
      this.ctx.font = "bold 16px monospace";
      this.ctx.fillText(node.speakerName, textStartX, boxY + 28);
    }

    // Texto da Fala / Narrativa
    this.ctx.fillStyle = "#e0e0e0";
    this.ctx.font = "14px monospace";
    
    const textY = node.speakerName ? boxY + 52 : boxY + 35;
    this.wrapText(node.text, textStartX, textY, boxWidth - (textStartX - boxX) - 20, 20);

    // Opções de Escolha do Jogador
    if (node.options && node.options.length > 0) {
      let optY = textY + 40;
      node.options.forEach((opt, idx) => {
        if (idx === this.selectedOption) {
          this.ctx.fillStyle = "#ffcc00";
          this.ctx.fillText(`> ${opt.text}`, textStartX, optY);
        } else {
          this.ctx.fillStyle = "#aaaaaa";
          this.ctx.fillText(`  ${opt.text}`, textStartX, optY);
        }
        optY += 22;
      });
    }

    this.ctx.restore();
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(" ");
    let line = "";
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        this.ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, y);
  }
}