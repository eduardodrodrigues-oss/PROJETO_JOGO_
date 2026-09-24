import { Player } from "./Player";
import { World, type InteractiveTrigger } from "./World";
import { SoundManager } from "./SoundManager";

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private world: World;
  private soundManager: SoundManager;
  private keys: { [key: string]: boolean } = {};
  private emotionLevel: number = 0;

  private gameState: "INTRO" | "INTRO_DIALOGUE" | "PLAYING" | "STORY_DIALOGUE" = "INTRO";
  private canStartFromIntro: boolean = false;

  // Controle da Narrativa
  private hasCollectedFirstHeart: boolean = false;
  private hasSeenMap3Dialogue: boolean = false;
  private storyQueue: string[] = [];
  private storyIndex: number = 0;

  private currentMapKey: string = "0,0";
  private activeTriggerNear: InteractiveTrigger | null = null;
  private isDialogueOpen: boolean = false;
  private dialogueOptionIndex: number = 0;
  private keyCooldown: boolean = false;

  private debugMode: boolean = false;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) throw new Error("Container não encontrado");

    this.canvas = document.createElement("canvas");
    this.canvas.width = 800;
    this.canvas.height = 800;
    container.appendChild(this.canvas);

    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Não foi possível obter o contexto 2D");
    this.ctx = context;

    this.world = new World();
    this.soundManager = new SoundManager();
    this.player = new Player(388, 388);

    this.initControls();
    this.updateEmotionUI();

    setTimeout(() => {
      this.canStartFromIntro = true;
    }, 1500);
  }

  private initControls(): void {
    const startAudio = () => {
      this.soundManager.init();
    };

    window.addEventListener("keydown", (e) => {
      startAudio();

      if (this.gameState === "INTRO") {
        if (this.canStartFromIntro) {
          this.gameState = "INTRO_DIALOGUE";
        }
        return;
      }

      if (this.gameState === "INTRO_DIALOGUE") {
        if (e.key === " " || e.key === "Enter" || e.toLowerCase() === "e") {
          this.gameState = "PLAYING";
        }
        return;
      }

      if (this.gameState === "STORY_DIALOGUE") {
        if ((e.key === " " || e.key === "Enter" || e.toLowerCase() === "e") && !this.keyCooldown) {
          this.storyIndex++;
          this.keyCooldown = true;

          if (this.storyIndex >= this.storyQueue.length) {
            this.gameState = "PLAYING";
            this.storyQueue = [];
            this.storyIndex = 0;
          }
        }
        return;
      }

      if (e.key === "F2") {
        this.debugMode = !this.debugMode;
      }
      this.keys[e.key] = true;
      this.handleDialogueControls(e.key);
    });

    window.addEventListener("click", startAudio);

    window.addEventListener("keyup", (e) => {
      this.keys[e.key] = false;
      this.keyCooldown = false;
    });
  }

  private handleDialogueControls(key: string): void {
    if (this.keyCooldown) return;

    if (this.isDialogueOpen) {
      if (
        key === "ArrowUp" || key === "w" || key === "W" ||
        key === "ArrowLeft" || key === "a" || key === "A"
      ) {
        this.dialogueOptionIndex = 0;
        this.keyCooldown = true;
      } else if (
        key === "ArrowDown" || key === "s" || key === "S" ||
        key === "ArrowRight" || key === "d" || key === "D"
      ) {
        this.dialogueOptionIndex = 1;
        this.keyCooldown = true;
      } else if (key === "Enter" || key === "e" || key === "E" || key === " ") {
        this.confirmDialogueOption();
        this.keyCooldown = true;
      }
    } else if (this.activeTriggerNear && (key.toLowerCase() === "e" || key === "Enter")) {
      this.isDialogueOpen = true;
      this.dialogueOptionIndex = 0;
      this.keyCooldown = true;
    }
  }

  private confirmDialogueOption(): void {
    if (!this.activeTriggerNear) {
      this.isDialogueOpen = false;
      return;
    }

    const trigger = this.activeTriggerNear;

    if (this.dialogueOptionIndex === 0) {
      if (trigger.type === "item") {
        this.addEmotion(25);
        trigger.collected = true;

        if (!this.hasCollectedFirstHeart) {
          this.hasCollectedFirstHeart = true;
          this.storyQueue = [
            "O conhecido órgão gelatinoso branco pulsa em seus dedos, ele cintila como se quisesse ser devorado, você sente a maior dor em seu peito.",
            "Decididamente tira a mascara, e morde o coração, engolindo inteiro, rapidamente a sensação é doce e amarga, a mistura do físico com o inteligível. Uma lagrima sai de seus olhos.",
            "Tudo isso foi rápido. Você retornou a mascara."
          ];
        } else {
          this.storyQueue = [
            "O conhecido órgão gelatinoso branco pulsa em seus dedos, ele cintila como se quisesse ser devorado, você sente a maior dor em seu peito.",
            "Você engole o coração. Retorna a mascara e sente algo."
          ];
        }

        this.storyIndex = 0;
        this.gameState = "STORY_DIALOGUE";

      } else if (trigger.type === "door_enter") {
        this.currentMapKey = "house_interior";
        this.player.x = 376;
        this.player.y = 620;
      }
    }

    this.activeTriggerNear = null;
    this.isDialogueOpen = false;
  }

  public addEmotion(amount: number): void {
    this.emotionLevel = Math.min(100, this.emotionLevel + amount);
    this.updateEmotionUI();
  }

  private updateEmotionUI(): void {
    document.documentElement.style.setProperty("--emotion-level", `${this.emotionLevel}%`);

    const darknessOpacity = Math.max(0, 1 - this.emotionLevel / 100);
    document.documentElement.style.setProperty("--darkness-opacity", `${darknessOpacity}`);

    const barFill = document.querySelector<HTMLElement>(".heart-fill");
    if (barFill) {
      barFill.style.width = `${this.emotionLevel}%`;
    }

    const statusText = document.getElementById("emotion-value");
    if (statusText) {
      statusText.innerText = `${this.emotionLevel}%`;
    }
  }

  private handleInput(): void {
    if (this.gameState !== "PLAYING" || this.isDialogueOpen) return;

    let dx = 0;
    let dy = 0;

    if (this.keys["ArrowUp"] || this.keys["w"] || this.keys["W"]) dy -= 1;
    if (this.keys["ArrowDown"] || this.keys["s"] || this.keys["S"]) dy += 1;
    if (this.keys["ArrowLeft"] || this.keys["a"] || this.keys["A"]) dx -= 1;
    if (this.keys["ArrowRight"] || this.keys["d"] || this.keys["D"]) dx += 1;

    const obstacles = this.world.getObstacles(this.currentMapKey);
    this.player.move(dx, dy, obstacles);

    this.checkProximityTriggers();
    this.checkMapBoundaries();
  }

  private checkProximityTriggers(): void {
    const triggers = this.world.getTriggersForMap(this.currentMapKey);
    let foundNear: InteractiveTrigger | null = null;

    const playerCenterX = this.player.x + (this.player.width || 32) / 2;
    const playerCenterY = this.player.y + (this.player.height || 32) / 2;

    for (const trigger of triggers) {
      const dist = Math.hypot(playerCenterX - trigger.x, playerCenterY - trigger.y);
      if (dist < 55) {
        foundNear = trigger;
        break;
      }
    }

    this.activeTriggerNear = foundNear;
    if (!foundNear && this.isDialogueOpen) {
      this.isDialogueOpen = false;
    }
  }

  private checkMapBoundaries(): void {
    if (this.currentMapKey === "house_interior") {
      if (this.player.y > 670) {
        this.currentMapKey = "0,2";
        this.player.x = 415;
        this.player.y = 410;
      }
      return;
    }

    const playerHeight = this.player.height || 32;

    // Transição para CIMA (dispara assim que encosta no topo y <= 0)
    if (this.player.y <= 0) {
      if (this.currentMapKey === "0,0") {
        this.currentMapKey = "0,1";
        this.player.y = this.canvas.height - playerHeight - 15;
      } else if (this.currentMapKey === "0,1") {
        this.currentMapKey = "0,2";
        this.player.y = this.canvas.height - playerHeight - 15;

        if (!this.hasSeenMap3Dialogue) {
          this.triggerMap3Dialogue();
        }
      } else if (this.currentMapKey === "0,2") {
        this.currentMapKey = "0,3";
        this.player.y = this.canvas.height - playerHeight - 15;
      } else {
        this.player.y = 0;
      }
    }

    // Transição para BAIXO (dispara na borda inferior)
    if (this.player.y >= this.canvas.height - playerHeight) {
      if (this.currentMapKey === "0,3") {
        this.currentMapKey = "0,2";
        this.player.y = 15;
      } else if (this.currentMapKey === "0,2") {
        this.currentMapKey = "0,1";
        this.player.y = 15;
      } else if (this.currentMapKey === "0,1") {
        this.currentMapKey = "0,0";
        this.player.y = 15;
      } else {
        this.player.y = this.canvas.height - playerHeight;
      }
    }
  }

  private triggerMap3Dialogue(): void {
    this.hasSeenMap3Dialogue = true;
    this.storyQueue = ["Pessoas. Continuar"];
    this.storyIndex = 0;
    this.gameState = "STORY_DIALOGUE";
  }

  public start(): void {
    const loop = () => {
      this.handleInput();
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  private render(): void {
    const time = Date.now();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.gameState === "INTRO") {
      this.renderIntroScreen();
      return;
    }

    this.world.render(
      this.ctx,
      this.canvas.width,
      this.canvas.height,
      this.currentMapKey,
      time
    );

    this.renderTriggers();
    this.player.render(this.ctx);
    this.renderDarknessOverlay();

    if (this.debugMode) {
      this.world.renderDebug(this.ctx, this.currentMapKey);
      this.player.renderDebug(this.ctx);
    }

    if (this.gameState === "INTRO_DIALOGUE") {
      this.renderPlayerIntroDialogue();
      return;
    }

    if (this.gameState === "STORY_DIALOGUE") {
      this.renderStoryDialogueBox();
      return;
    }

    if (this.isDialogueOpen) {
      this.renderDialogueBox();
    } else if (this.activeTriggerNear) {
      this.renderInteractionPrompt();
    }
  }

  private renderIntroScreen(): void {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.player.render(this.ctx);

    this.ctx.save();
    this.ctx.fillStyle = "rgba(235, 235, 235, 0.92)";
    this.ctx.font = "italic 16px Georgia, serif";
    this.ctx.textAlign = "center";

    const lines = [
      '"Morte, não te orgulhes, embora te chamem',
      'poderosa e terrível, pois não és assim;',
      'após um breve sono, despertaremos eternamente,',
      'e a morte não mais existirá; Morte, tu morrerás."'
    ];

    let startY = 180;
    lines.forEach((line) => {
      this.ctx.fillText(line, this.canvas.width / 2, startY);
      startY += 30;
    });

    this.ctx.fillStyle = "#d4af37";
    this.ctx.font = "bold 14px Georgia, serif";
    this.ctx.fillText("- John Donne (século XVII)", this.canvas.width / 2, startY + 10);

    if (this.canStartFromIntro) {
      const time = Date.now() / 350;
      const alpha = 0.5 + Math.sin(time) * 0.5;

      this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
      this.ctx.font = "bold 14px sans-serif";
      this.ctx.fillText("— Pressione qualquer tecla para continuar —", this.canvas.width / 2, 670);
    }

    this.ctx.restore();
  }

  private renderPlayerIntroDialogue(): void {
    const boxWidth = 420;
    const boxHeight = 110;
    const boxX = (this.canvas.width - boxWidth) / 2;
    const boxY = 160;

    this.ctx.save();

    this.ctx.fillStyle = "rgba(10, 15, 12, 0.94)";
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.ctx.strokeStyle = "#d4af37";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    this.ctx.fillStyle = "#ffd700";
    this.ctx.font = "bold 15px Georgia, serif";
    this.ctx.textAlign = "left";
    this.ctx.fillText("Pensamento", boxX + 20, boxY + 30);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "16px Georgia, serif";
    this.ctx.fillText("Ainda vivo. Continuar.", boxX + 20, boxY + 60);

    const time = Date.now() / 350;
    const alpha = 0.5 + Math.sin(time) * 0.5;
    this.ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
    this.ctx.font = "bold 12px sans-serif";
    this.ctx.textAlign = "right";
    this.ctx.fillText("[Espaço] Continuar", boxX + boxWidth - 20, boxY + boxHeight - 15);

    this.ctx.restore();
  }

  private renderStoryDialogueBox(): void {
    const currentText = this.storyQueue[this.storyIndex];
    if (!currentText) return;

    const boxWidth = 500;
    const boxHeight = 150;
    const boxX = (this.canvas.width - boxWidth) / 2;
    const boxY = 140;

    this.ctx.save();

    this.ctx.fillStyle = "rgba(12, 10, 15, 0.95)";
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.ctx.strokeStyle = "#d4af37";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    this.ctx.fillStyle = "#f0e6d2";
    this.ctx.font = "15px Georgia, serif";
    this.ctx.textAlign = "left";

    const lines = this.wrapText(this.ctx, currentText, boxWidth - 40);
    let startY = boxY + 35;
    lines.forEach((line) => {
      this.ctx.fillText(line, boxX + 20, startY);
      startY += 24;
    });

    const time = Date.now() / 350;
    const alpha = 0.5 + Math.sin(time) * 0.5;
    this.ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
    this.ctx.font = "bold 12px sans-serif";
    this.ctx.textAlign = "right";
    this.ctx.fillText(`[Espaço] Avançar (${this.storyIndex + 1}/${this.storyQueue.length})`, boxX + boxWidth - 20, boxY + boxHeight - 15);

    this.ctx.restore();
  }

  private wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
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

  private renderDarknessOverlay(): void {
    const darknessFactor = 1 - this.emotionLevel / 100;
    const maxAlpha = 0.85 * darknessFactor;

    if (maxAlpha <= 0.01) return;

    const playerCenterX = this.player.x + (this.player.width || 32) / 2;
    const playerCenterY = this.player.y + (this.player.height || 32) / 2;

    const innerRadius = 60 + (this.emotionLevel / 100) * 120;
    const outerRadius = 220 + (this.emotionLevel / 100) * 400;

    this.ctx.save();
    const gradient = this.ctx.createRadialGradient(
      playerCenterX,
      playerCenterY,
      innerRadius,
      playerCenterX,
      playerCenterY,
      outerRadius
    );

    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.5, `rgba(5, 10, 8, ${maxAlpha * 0.4})`);
    gradient.addColorStop(1, `rgba(5, 10, 8, ${maxAlpha})`);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  private renderTriggers(): void {
    const triggers = this.world.getTriggersForMap(this.currentMapKey);
    const time = Date.now() / 300;

    triggers.forEach((trigger) => {
      if (trigger.type === "item") {
        const pulseRadius = 8 + Math.sin(time) * 3;
        const opacity = 0.6 + Math.sin(time) * 0.3;

        this.ctx.save();
        const gradient = this.ctx.createRadialGradient(
          trigger.x, trigger.y, 0,
          trigger.x, trigger.y, pulseRadius * 2.5
        );
        gradient.addColorStop(0, `rgba(255, 255, 220, ${opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 215, 0, ${opacity * 0.5})`);
        gradient.addColorStop(1, "rgba(255, 215, 0, 0)");

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(trigger.x, trigger.y, pulseRadius * 2.5, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = "#ffffff";
        this.ctx.beginPath();
        this.ctx.arc(trigger.x, trigger.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    });
  }

  private renderInteractionPrompt(): void {
    if (!this.activeTriggerNear) return;

    this.ctx.save();
    this.ctx.font = "bold 13px sans-serif";
    this.ctx.textAlign = "center";

    const promptText = `[E] ${this.activeTriggerNear.title}`;
    const textWidth = this.ctx.measureText(promptText).width;
    const boxWidth = textWidth + 24;

    const x = this.activeTriggerNear.x;
    const y = this.activeTriggerNear.y - 30;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    this.ctx.fillRect(x - boxWidth / 2, y - 14, boxWidth, 24);
    this.ctx.strokeStyle = "#ffd700";
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(x - boxWidth / 2, y - 14, boxWidth, 24);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillText(promptText, x, y + 3);
    this.ctx.restore();
  }

  private renderDialogueBox(): void {
    if (!this.activeTriggerNear) return;

    const boxWidth = 320;
    const boxHeight = 150;
    const boxX = (this.canvas.width - boxWidth) / 2;
    const boxY = (this.canvas.height - boxHeight) / 2;

    this.ctx.save();

    this.ctx.fillStyle = "rgba(15, 20, 18, 0.94)";
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.ctx.strokeStyle = "#d4af37";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    this.ctx.fillStyle = "#ffd700";
    this.ctx.font = "bold 20px Georgia, serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.activeTriggerNear.title, this.canvas.width / 2, boxY + 38);

    this.ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
    this.ctx.beginPath();
    this.ctx.moveTo(boxX + 30, boxY + 50);
    this.ctx.lineTo(boxX + boxWidth - 30, boxY + 50);
    this.ctx.stroke();

    let options = ["Entrar", "Cancelar"];
    if (this.activeTriggerNear.type === "item") {
      options = ["Pegar", "Não Pegar"];
    }

    this.ctx.font = "16px sans-serif";
    options.forEach((opt, idx) => {
      const optY = boxY + 85 + idx * 30;
      const isSelected = this.dialogueOptionIndex === idx;

      if (isSelected) {
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillText(`> ${opt} <`, this.canvas.width / 2, optY);
      } else {
        this.ctx.fillStyle = "#888888";
        this.ctx.fillText(opt, this.canvas.width / 2, optY);
      }
    });

    this.ctx.restore();
  }
}