import { Player } from "./Player";
import { World, type InteractiveTrigger } from "./World";
import { SoundManager } from "./SoundManager";
import { Monster } from "./Monster";
import { Prologue } from "./Prologue";

export interface InventoryItem {
  id: string;
  name: string;
  icon: HTMLImageElement;
  description: string;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private world: World;
  private soundManager: SoundManager;
  private monsterMap4: Monster;

  private keys: { [key: string]: boolean } = {};

  // Imagens do Inventário
  private mochilaImg: HTMLImageElement;
  private espadaImg: HTMLImageElement;
  private inventory: InventoryItem[] = [];
  private isInventoryOpen: boolean = false;

  // Status de Vida do Jogador
  private playerHealth: number = 100;
  private maxHealth: number = 100;
  private emotionLevel: number = 0;
  private invincibilityTimer: number = 0;

  private gameState: "INTRO" | "INTRO_DIALOGUE" | "PLAYING" | "DYING" | "STORY_DIALOGUE" | "GAME_OVER" | "GAME_END" = "INTRO";
  private canStartFromIntro: boolean = false;
  private prologue: Prologue | null = null;
  private isPrologueActive: boolean = false;
  private hasCollectedFirstHeart: boolean = false;
  private hasSeenMap3Dialogue: boolean = false;
  private hasSeenMap4Dialogue: boolean = false;
  private hasSeenHouseDialogue: boolean = false;
  private isVictorySequence: boolean = false;
  private storyQueue: string[] = [];
  private storyIndex: number = 0;
  private prologue: Prologue | null = null;
  private isPrologueActive: boolean = false;
  private currentMapKey: string = "0,0";
  private activeTriggerNear: InteractiveTrigger | null = null;
  private isDialogueOpen: boolean = false;
  private dialogueOptionIndex: number = 0;
  private keyCooldown: boolean = false;

  private debugMode: boolean = false;
  private lastTime: number = Date.now();

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
    this.monsterMap4 = new Monster(370, 300);

    // Carregamento de Sprites de UI
    this.mochilaImg = new Image();
    this.mochilaImg.src = "/assets/mochila.png";

    this.espadaImg = new Image();
    this.espadaImg.src = "/assets/espada.png";

    this.initControls();
    this.initMouseControls();
    this.updateEmotionUI();

    setTimeout(() => {
      this.canStartFromIntro = true;
    }, 1500);
  }

  // Método auxiliar para verificar com precisão se o monstro morreu
  private isMonsterDead(): boolean {
    if (!this.monsterMap4) return false;
    const m = this.monsterMap4 as any;

    if (typeof m.isDead === "function") {
      return m.isDead();
    }
    if (typeof m.isDead === "boolean") {
      return m.isDead;
    }
    if (typeof m.health === "number") {
      return m.health <= 0;
    }
    if (typeof m.hp === "number") {
      return m.hp <= 0;
    }
    return false;
  }

  private initMouseControls(): void {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Posição do botão da Mochila
      if (clickX >= 725 && clickX <= 775 && clickY >= 15 && clickY <= 65) {
        if (this.gameState === "PLAYING") {
          this.isInventoryOpen = !this.isInventoryOpen;
        }
        return;
      }

      // Fechar inventário clicando fora
      if (this.isInventoryOpen) {
        const boxX = (this.canvas.width - 360) / 2;
        const boxY = (this.canvas.height - 300) / 2;
        if (clickX < boxX || clickX > boxX + 360 || clickY < boxY || clickY > boxY + 300) {
          this.isInventoryOpen = false;
        }
      }
    });
  }

  private initControls(): void {
    const startAudio = () => {
      this.soundManager.init();
    };

    window.addEventListener("keydown", (e) => {
      startAudio();

      if (this.gameState === "GAME_OVER") {
        if (e.key === " " || e.key === "Enter") {
          this.resetGame();
        }
        return;
      }

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
            if (this.isVictorySequence) {
              this.gameState = "GAME_END"; // Tela preta final
            } else {
              this.gameState = "PLAYING";
            }
            this.storyQueue = [];
            this.storyIndex = 0;
          }
        }
        return;
      }

      // Tecla para abrir/fechar inventário
      if (e.key.toLowerCase() === "i") {
        if (this.gameState === "PLAYING") {
          this.isInventoryOpen = !this.isInventoryOpen;
        }
        return;
      }

      // Tecla de Ataque (Espaço ou F)
      if ((e.key === " " || e.key.toLowerCase() === "f") && this.gameState === "PLAYING" && !this.isDialogueOpen && !this.isInventoryOpen) {
        if (this.player.hasSword) {
          this.player.attack();
          this.handlePlayerAttack();
        }
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

  // Processa o ataque do jogador atingindo o monstro
  private handlePlayerAttack(): void {
    if (this.currentMapKey !== "0,3" || !this.monsterMap4) return;

    const attackRange = 50;
    let attackX = this.player.x;
    let attackY = this.player.y;
    let attackW = this.player.width;
    let attackH = this.player.height;

    const direction = (this.player as any).direction || "down";
    switch (direction) {
      case "up":
        attackY -= attackRange;
        attackH += attackRange;
        break;
      case "down":
        attackH += attackRange;
        break;
      case "left":
        attackX -= attackRange;
        attackW += attackRange;
        break;
      case "right":
        attackW += attackRange;
        break;
    }

    if (typeof (this.monsterMap4 as any).takeDamage === "function") {
      const monsterX = (this.monsterMap4 as any).x ?? 370;
      const monsterY = (this.monsterMap4 as any).y ?? 300;
      const monsterW = (this.monsterMap4 as any).width ?? 48;
      const monsterH = (this.monsterMap4 as any).height ?? 48;

      const isHit =
        attackX < monsterX + monsterW &&
        attackX + attackW > monsterX &&
        attackY < monsterY + monsterH &&
        attackY + attackH > monsterY;

      if (isHit) {
        (this.monsterMap4 as any).takeDamage(25);
        if (this.isMonsterDead()) {
          this.triggerVictory();
        }
      }
    }
  }

  private triggerVictory(): void {
    if (this.isVictorySequence) return;
    this.isVictorySequence = true;
    this.storyQueue = [
      "Você é a esperança ainda viva.",
      "De toda a humanidade."
    ];
    this.storyIndex = 0;
    this.gameState = "STORY_DIALOGUE";
  }

  private resetGame(): void {
    this.playerHealth = 100;
    this.emotionLevel = 25;

    this.currentMapKey = "0,0";
    this.player.x = 388;
    this.player.y = 388;
    this.player.reset();

    this.monsterMap4 = new Monster(370, 300);

    this.hasSeenHouseDialogue = false;
    this.hasSeenMap3Dialogue = false;
    this.hasSeenMap4Dialogue = false;
    this.hasCollectedFirstHeart = false;
    this.isVictorySequence = false;

    this.gameState = "PLAYING";
    this.isInventoryOpen = false;
    this.updateEmotionUI();
  }

  private handleDialogueControls(key: string): void {
    if (this.keyCooldown || this.gameState === "DYING") return;

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
      } else if (key === "Enter" || key === "e" || key === "E") {
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
        if (trigger.id === "espada_item") {
          this.player.hasSword = true;
          this.inventory.push({
            id: "espada",
            name: "Espada de Aço",
            icon: this.espadaImg,
            description: "Permite desferir ataques contra ameaças."
          });
          trigger.collected = true;

          this.storyQueue = [
            "Você encontrou uma espada antiga porém afiada.",
            "Pressione [Espaço] ou [F] para atacar!"
          ];
          this.storyIndex = 0;
          this.gameState = "STORY_DIALOGUE";
        } else {
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
        }
      } else if (trigger.type === "door_enter") {
        this.currentMapKey = "house_interior";
        this.player.x = 376;
        this.player.y = 620;

        if (!this.hasSeenHouseDialogue) {
          this.hasSeenHouseDialogue = true;
          this.storyQueue = [
            "O interior da casa tinha cheiro de mofo, ainda era possível sentir os prazeres que alguém sentiu ali. aqueles prazeres que não são seus....",
            "E agora não são de mais ninguém."
          ];
          this.storyIndex = 0;
          this.gameState = "STORY_DIALOGUE";
        }
      }
    }

    this.activeTriggerNear = null;
    this.isDialogueOpen = false;
  }

  public addEmotion(amount: number): void {
    this.emotionLevel = Math.min(100, this.emotionLevel + amount);
    this.updateEmotionUI();
  }

  public applyDamage(damage: number): void {
    if (this.invincibilityTimer > 0 || this.gameState === "DYING" || this.gameState === "GAME_OVER" || this.gameState === "GAME_END") return;

    this.invincibilityTimer = 1000;
    this.player.takeDamage();

    if (this.playerHealth > 0) {
      this.playerHealth -= damage;
      if (this.playerHealth < 0) {
        const overflow = Math.abs(this.playerHealth);
        this.playerHealth = 0;
        this.emotionLevel = Math.max(0, this.emotionLevel - overflow);
      }
    } else {
      this.emotionLevel = Math.max(0, this.emotionLevel - damage);
    }

    this.updateEmotionUI();

    if (this.emotionLevel <= 0 && this.playerHealth <= 0) {
      this.gameState = "DYING";
      this.player.triggerDeath();
    }
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
    if (this.gameState !== "PLAYING" || this.isDialogueOpen || this.isInventoryOpen) return;

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

    const playerCenterX = this.player.x + this.player.width / 2;
    const playerCenterY = this.player.y + this.player.height / 2;

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

    const topTrigger = 15;
    const bottomTrigger = this.canvas.height - this.player.height - 15;

    const spawnAtBottom = this.canvas.height - this.player.height - 65;
    const spawnAtTop = 65;

    if (this.player.y <= topTrigger) {
      if (this.currentMapKey === "0,0") {
        this.currentMapKey = "0,1";
        this.player.y = spawnAtBottom;
      } else if (this.currentMapKey === "0,1") {
        this.currentMapKey = "0,2";
        this.player.y = spawnAtBottom;

        if (!this.hasSeenMap3Dialogue) {
          this.triggerMap3Dialogue();
        }
      } else if (this.currentMapKey === "0,2") {
        this.currentMapKey = "0,3";
        this.player.y = spawnAtBottom;

        if (!this.hasSeenMap4Dialogue) {
          this.triggerMap4Dialogue();
        }
      } else {
        this.player.y = topTrigger;
      }
    }

    if (this.player.y >= bottomTrigger) {
      if (this.currentMapKey === "0,3") {
        this.currentMapKey = "0,2";
        this.player.y = spawnAtTop;
      } else if (this.currentMapKey === "0,2") {
        this.currentMapKey = "0,1";
        this.player.y = spawnAtTop;
      } else if (this.currentMapKey === "0,1") {
        this.currentMapKey = "0,0";
        this.player.y = spawnAtTop;
      } else {
        this.player.y = bottomTrigger;
      }
    }
  }

  private triggerMap3Dialogue(): void {
    this.hasSeenMap3Dialogue = true;
    this.storyQueue = ["Pessoas. Continuar"];
    this.storyIndex = 0;
    this.gameState = "STORY_DIALOGUE";
  }

  private triggerMap4Dialogue(): void {
    this.hasSeenMap4Dialogue = true;
    this.storyQueue = [
      "A vegetação ardia com o enxerto, quem as pessoas ainda vivas tinham de ter uma mascara preparada, se não tornava-se parte da praga."
    ];
    this.storyIndex = 0;
    this.gameState = "STORY_DIALOGUE";
  }

  public start(): void {
  const loop = () => {
    const now = Date.now();
    const deltaTime = now - this.lastTime;
    this.lastTime = now;

    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= deltaTime;
    }

    // Se estiver no Prólogo, atualiza o Prólogo
    if (this.isPrologueActive && this.prologue) {
      this.prologue.update(deltaTime);
      this.prologue.render();
      requestAnimationFrame(loop);
      return;
    }

    this.player.update(deltaTime);

    if (this.gameState === "DYING" && this.player.getIsDead()) {
      this.gameState = "GAME_OVER";
    }

    this.handleInput();

    if (this.currentMapKey === "0,3" && this.gameState === "PLAYING") {
      this.monsterMap4.update(this.player.x, this.player.y, deltaTime);

      if (this.isMonsterDead()) {
        this.triggerVictory();
      } else {
        const dmg = this.monsterMap4.checkAttackImpact(
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height
        );
        if (dmg > 0) {
          this.applyDamage(dmg);
        }
      }
    }

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

    if (this.gameState === "GAME_OVER") {
      this.renderGameOverScreen();
      return;
    }

    if (this.gameState === "GAME_END") {
      this.renderEndScreen();
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

    if (this.currentMapKey === "0,3" && !this.isMonsterDead()) {
      this.monsterMap4.render(this.ctx);
    }

    if (this.player) {
      if (this.gameState === "DYING" || this.invincibilityTimer <= 0 || Math.floor(time / 80) % 2 === 0) {
        this.player.render(this.ctx);
      }
    }

    this.renderDarknessOverlay();
    this.renderHUD();

    if (this.isInventoryOpen) {
      this.renderInventoryModal();
    }

    if (this.debugMode) {
      this.world.renderDebug(this.currentMapKey);
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

  // No Game.ts

private renderEndScreen(): void {
  this.ctx.save();
  this.ctx.fillStyle = "#000000";
  this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  this.ctx.restore();

  // Inicia a sequência de prólogo
  if (!this.isPrologueActive) {
    this.isPrologueActive = true;
    
    // Pega a imagem do novo mapa carregada no World
    const prologueMapImg = this.world.getPrologueMapImage();

    this.prologue = new Prologue(this.canvas, this.ctx, prologueMapImg, () => {
      // CALLBACK: Executado assim que "Prólogo: Coração" desaparece!
      this.isPrologueActive = false;
      this.prologue = null;

      // Troca o mapa para o novo mapa e posiciona o jogador
      this.currentMapKey = "prologue_1";
      this.player.x = 380; // Centro do mapa/aldeia
      this.player.y = 520;
      this.gameState = "PLAYING"; // Libera a movimentação do jogador!
    });
  }
}
  private renderHUD(): void {
    this.ctx.save();

    const barX = 310;
    const barY = 15;
    const barWidth = 160;
    const barHeight = 22;

    this.ctx.fillStyle = "rgba(10, 10, 10, 0.85)";
    this.ctx.fillRect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);

    const healthFill = Math.max(0, (this.playerHealth / this.maxHealth) * barWidth);
    this.ctx.fillStyle = "#d62828";
    this.ctx.fillRect(barX, barY, healthFill, barHeight);

    this.ctx.strokeStyle = "#8d99ae";
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "bold 12px monospace";
    this.ctx.fillText(`VIDA: ${Math.ceil(this.playerHealth)} / ${this.maxHealth}`, barX + 10, barY + 15);

    const mochilaX = 725;
    const mochilaY = 15;
    const mochilaSize = 50;

    this.ctx.fillStyle = "rgba(10, 10, 10, 0.75)";
    this.ctx.fillRect(mochilaX, mochilaY, mochilaSize, mochilaSize);
    this.ctx.strokeStyle = "#d4af37";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(mochilaX, mochilaY, mochilaSize, mochilaSize);

    if (this.mochilaImg.complete && this.mochilaImg.naturalWidth > 0) {
      this.ctx.drawImage(this.mochilaImg, mochilaX + 5, mochilaY + 5, mochilaSize - 10, mochilaSize - 10);
    } else {
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 10px sans-serif";
      this.ctx.fillText("BAG", mochilaX + 15, mochilaY + 30);
    }

    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "10px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("[I]", mochilaX + mochilaSize / 2, mochilaY + mochilaSize + 12);

    this.ctx.restore();
  }

  private renderInventoryModal(): void {
    const boxWidth = 360;
    const boxHeight = 300;
    const boxX = (this.canvas.width - boxWidth) / 2;
    const boxY = (this.canvas.height - boxHeight) / 2;

    this.ctx.save();

    this.ctx.fillStyle = "rgba(15, 12, 10, 0.95)";
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    this.ctx.strokeStyle = "#d4af37";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

    this.ctx.fillStyle = "#ffd700";
    this.ctx.font = "bold 20px Georgia, serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("INVENTÁRIO", this.canvas.width / 2, boxY + 35);

    this.ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
    this.ctx.beginPath();
    this.ctx.moveTo(boxX + 20, boxY + 48);
    this.ctx.lineTo(boxX + boxWidth - 20, boxY + 48);
    this.ctx.stroke();

    const startX = boxX + 30;
    const startY = boxY + 65;
    const slotSize = 55;
    const gap = 15;

    for (let i = 0; i < 8; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const slotX = startX + col * (slotSize + gap);
      const slotY = startY + row * (slotSize + gap);

      this.ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      this.ctx.fillRect(slotX, slotY, slotSize, slotSize);
      this.ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(slotX, slotY, slotSize, slotSize);

      const item = this.inventory[i];
      if (item) {
        if (item.icon.complete && item.icon.naturalWidth > 0) {
          this.ctx.drawImage(item.icon, slotX + 5, slotY + 5, slotSize - 10, slotSize - 10);
        } else {
          this.ctx.fillStyle = "#ffffff";
          this.ctx.font = "bold 10px sans-serif";
          this.ctx.textAlign = "center";
          this.ctx.fillText(item.name, slotX + slotSize / 2, slotY + slotSize / 2);
        }
      }
    }

    if (this.inventory.length > 0) {
      const activeItem = this.inventory[0];
      this.ctx.fillStyle = "#f0e6d2";
      this.ctx.font = "bold 14px Georgia, serif";
      this.ctx.textAlign = "left";
      this.ctx.fillText(activeItem.name, boxX + 30, boxY + 220);

      this.ctx.fillStyle = "#aaaaaa";
      this.ctx.font = "12px sans-serif";
      this.ctx.fillText(activeItem.description, boxX + 30, boxY + 242);
    } else {
      this.ctx.fillStyle = "#888888";
      this.ctx.font = "italic 13px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.fillText("Nenhum item recolhido.", this.canvas.width / 2, boxY + 230);
    }

    this.ctx.fillStyle = "rgba(212, 175, 55, 0.7)";
    this.ctx.font = "11px sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Pressione [I] ou clique fora para fechar", this.canvas.width / 2, boxY + boxHeight - 12);

    this.ctx.restore();
  }

  private renderGameOverScreen(): void {
    this.ctx.save();
    this.ctx.fillStyle = "#0a0000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#e63946";
    this.ctx.font = "bold 32px Georgia, serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("SUA ALMA SUCUMBIU", this.canvas.width / 2, 360);

    const alpha = 0.5 + Math.sin(Date.now() / 300) * 0.5;
    this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    this.ctx.font = "16px sans-serif";
    this.ctx.fillText("[ Pressione Espaço ou Enter para Tentar Novamente ]", this.canvas.width / 2, 440);

    this.ctx.restore();
  }

  private renderIntroScreen(): void {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.player) {
      this.player.render(this.ctx);
    }

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

    const playerCenterX = (this.player.x || 388) + this.player.width / 2;
    const playerCenterY = (this.player.y || 388) + this.player.height / 2;

    const innerRadius = 60 + (this.emotionLevel / 100) * 120;
    const outerRadius = 220 + (this.emotionLevel / 100) * 400;

    this.ctx.save();
    try {
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
    } catch (err) {}
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