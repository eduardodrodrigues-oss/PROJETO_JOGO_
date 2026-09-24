export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface InteractiveTrigger {
  id: string;
  mapKey: string;
  x: number;
  y: number;
  title: string;
  type: "item" | "door_enter";
  collected?: boolean;
}

export class World {
  private mapImages: Map<string, HTMLImageElement> = new Map();
  public triggers: InteractiveTrigger[] = [];
  public isLoaded: boolean = false;

  constructor() {
    const mapsToLoad = [
      { id: "0,0", src: "/assets/map1.png" },
      { id: "0,1", src: "/assets/map2.png" },
      { id: "0,2", src: "/assets/map3.png" },
      { id: "0,3", src: "/assets/map4.png" },
      { id: "house_interior", src: "/assets/house_interior.png" }
    ];

    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === mapsToLoad.length) {
        this.isLoaded = true;
      }
    };

    mapsToLoad.forEach((mapInfo) => {
      const img = new Image();
      img.src = mapInfo.src;
      img.onload = checkAllLoaded;
      img.onerror = () => {
        console.warn(`Erro ao carregar a imagem do mapa: ${mapInfo.src}`);
        checkAllLoaded();
      };
      this.mapImages.set(mapInfo.id, img);
    });

    this.initTriggers();
  }

  private initTriggers(): void {
    // 1. Coração na pedra (map2)
    this.triggers.push({
      id: "heart_map2",
      mapKey: "0,1",
      x: 205,
      y: 175,
      title: "Pegar Coração",
      type: "item",
      collected: false
    });

    // 2. Trigger na porta de entrada da Casa (map3 / "0,2")
    this.triggers.push({
      id: "house_door_enter",
      mapKey: "0,2",
      x: 415,
      y: 370,
      title: "Entrar na Casa",
      type: "door_enter"
    });

    // 3. Pedaço de Coração na Cama (house_interior)
    this.triggers.push({
      id: "heart_house_bed",
      mapKey: "house_interior",
      x: 200,
      y: 220,
      title: "Pegar Pedaço de Coração",
      type: "item",
      collected: false
    });
  }

  public getObstacles(mapKey: string): Rect[] {
    if (mapKey === "0,2") {
      return [
        // --- CASA ---
        { x: 260, y: 220, width: 115, height: 150 },
        { x: 455, y: 220, width: 105, height: 150 },
        { x: 375, y: 220, width: 80, height: 110 },

        // --- POÇO ---
        { x: 650, y: 285, width: 58, height: 90 },

        // --- OBSTÁCULOS SECUNDÁRIOS (Ajustados para liberar passagem nas laterais) ---
        { x: 140, y: 520, width: 70, height: 50 },  // Arbusto/pedra inferior esquerda
        { x: 180, y: 405, width: 70, height: 25 },  // Cerca/rocha esquerda
        { x: 600, y: 580, width: 180, height: 170 }, // Floresta densa inferior direita

        // Floresta (Paredes Laterais)
        { x: 0, y: 0, width: 130, height: 800 }     // Parede da esquerda mais recuada
      ];
    }

    if (mapKey === "0,3") {
      return [
        // Paredes de árvores densas laterais
        { x: 0, y: 0, width: 140, height: 800 },    // Floresta Esquerda
        { x: 660, y: 0, width: 140, height: 800 },  // Floresta Direita

        // Pedras e troncos do map4
        { x: 175, y: 145, width: 75, height: 70 },  // Pedra Superior Esquerda
        { x: 525, y: 220, width: 70, height: 65 },  // Pedra Direita Superior
        { x: 545, y: 110, width: 100, height: 55 }, // Tronco Caído Superior Direito
        { x: 230, y: 470, width: 70, height: 60 },  // Pedra Inferior Esquerda
        { x: 570, y: 670, width: 65, height: 55 }   // Pedra Inferior Direita
      ];
    }

    if (mapKey === "house_interior") {
      return [
        { x: 0, y: 0, width: 800, height: 115 },       // Parede Superior
        { x: 0, y: 0, width: 90, height: 800 },        // Parede Esquerda
        { x: 710, y: 0, width: 90, height: 800 },      // Parede Direita
        { x: 0, y: 710, width: 330, height: 90 },      // Parede Inferior Esquerda
        { x: 470, y: 710, width: 330, height: 90 },    // Parede Inferior Direita
        { x: 310, y: 270, width: 180, height: 200 }    // Mesa central
      ];
    }

    return [];
  }

  public getTriggersForMap(mapKey: string): InteractiveTrigger[] {
    return this.triggers.filter((t) => t.mapKey === mapKey && !t.collected);
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mapKey: string,
    time: number = Date.now()
  ): void {
    const currentMap = this.mapImages.get(mapKey);

    if (currentMap) {
      ctx.drawImage(currentMap, 0, 0, width, height);
    } else {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);
    }

    if (mapKey !== "house_interior") {
      this.renderForestAtmosphere(ctx, width, height, mapKey, time);
    }

    this.renderTriggers(ctx, mapKey, time);
  }

  private renderForestAtmosphere(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    mapKey: string,
    time: number
  ): void {
    ctx.save();

    const swayX = Math.sin(time * 0.0015) * 8;
    const swayY = Math.cos(time * 0.0012) * 4;

    ctx.fillStyle = "rgba(5, 12, 8, 0.35)";
    ctx.beginPath();
    ctx.arc(100 + swayX, -20 + swayY, 140, 0, Math.PI * 2);
    ctx.arc(350 - swayX, -40 + swayY, 180, 0, Math.PI * 2);
    ctx.arc(650 + swayX, -30 - swayY, 160, 0, Math.PI * 2);
    ctx.fill();

    const particleCount = 18;
    for (let i = 0; i < particleCount; i++) {
      const speed = 0.03 + (i % 5) * 0.01;
      const pX = (time * speed + i * 137) % (width + 100) - 50;
      const pY = ((i * 83) + Math.sin(time * 0.002 + i) * 30) % height;
      const size = 1.5 + (i % 3);

      ctx.fillStyle = i % 2 === 0 ? "rgba(255, 255, 200, 0.25)" : "rgba(10, 25, 18, 0.4)";
      ctx.beginPath();
      ctx.arc(pX, pY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const fogX = Math.sin(time * 0.0005) * 40;
    const fogGradient = ctx.createLinearGradient(0, height - 120, 0, height);
    fogGradient.addColorStop(0, "rgba(10, 18, 14, 0)");
    fogGradient.addColorStop(1, "rgba(5, 10, 8, 0.25)");

    ctx.fillStyle = fogGradient;
    ctx.fillRect(0 + fogX, height - 120, width, 120);

    ctx.restore();
  }

  private renderTriggers(ctx: CanvasRenderingContext2D, mapKey: string, time: number): void {
    const activeTriggers = this.getTriggersForMap(mapKey);
    const animTime = time / 250;

    for (const trigger of activeTriggers) {
      if (trigger.type === "item") {
        ctx.save();

        const x = trigger.x;
        const floatOffsetY = Math.sin(animTime) * 4;
        const y = trigger.y + floatOffsetY;

        ctx.shadowColor = "#ff2a55";
        ctx.shadowBlur = 12 + Math.sin(animTime) * 6;

        const size = 12;
        ctx.fillStyle = "#ff1a4a";
        ctx.beginPath();
        ctx.arc(x - size / 2, y - size / 2, size / 2, Math.PI, 0, false);
        ctx.arc(x + size / 2, y - size / 2, size / 4, Math.PI, 0, false);
        ctx.lineTo(x, y + size);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x - size / 3, y - size / 2, size / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }
  }

  public renderDebug(ctx: CanvasRenderingContext2D, mapKey: string): void {
    const obstacles = this.getObstacles(mapKey);
    ctx.save();
    ctx.fillStyle = "rgba(255, 0, 0, 0.4)";
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;

    for (const obs of obstacles) {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    }
    ctx.restore();
  }
}