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

  constructor() {
    const mapsToLoad = [
      { id: "0,0", src: "/assets/map1.png" },
      { id: "0,1", src: "/assets/map2.png" },
      { id: "0,2", src: "/assets/map3.png" },
      { id: "0,3", src: "/assets/map4.png" },
      { id: "house_interior", src: "/assets/house_interior.png" },
      // Novo mapa do Prólogo (Aldeia Corrompida Sob o Castelo)
      { id: "prologue_1", src: "/assets/Aldeia Corrompida Sob o Castelo.png" }
    ];

    mapsToLoad.forEach((mapInfo) => {
      const img = new Image();
      img.src = mapInfo.src;
      this.mapImages.set(mapInfo.id, img);
    });

    this.initTriggers();
  }

  public getPrologueMapImage(): HTMLImageElement {
    return this.mapImages.get("prologue_1")!;
  }

  public getMapImage(id: string): HTMLImageElement | undefined {
    return this.mapImages.get(id);
  }

  private initTriggers(): void {
    // --- ESPADA NO MAPA INICIAL (0,0) ---
    this.triggers.push({
      id: "espada_item",
      mapKey: "0,0",
      x: 450,
      y: 350,
      title: "Espada Antiga",
      type: "item",
      collected: false
    });

    this.triggers.push({
      id: "heart_map2",
      mapKey: "0,1",
      x: 205,
      y: 175,
      title: "Pegar Coração",
      type: "item",
      collected: false
    });

    this.triggers.push({
      id: "house_door_enter",
      mapKey: "0,2",
      x: 415,
      y: 370,
      title: "Entrar na Casa",
      type: "door_enter"
    });

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

        // --- OBSTÁCULOS SECUNDÁRIOS ---
        { x: 140, y: 520, width: 70, height: 50 },
        { x: 180, y: 405, width: 70, height: 25 },

        // Paredes laterais de árvores
        { x: 0, y: 0, width: 100, height: 600 },
        { x: 700, y: 0, width: 100, height: 600 }
      ];
    }

    if (mapKey === "0,3") {
      return [
        // Paredes laterais recuadas no topo
        { x: 0, y: 100, width: 100, height: 700 },
        { x: 700, y: 100, width: 100, height: 700 },

        // Pedras e troncos do meio para o fim do mapa
        { x: 525, y: 300, width: 70, height: 65 },
        { x: 230, y: 470, width: 70, height: 60 },
        { x: 570, y: 670, width: 65, height: 55 }
      ];
    }

    if (mapKey === "house_interior") {
      return [
        { x: 0, y: 0, width: 800, height: 115 },
        { x: 0, y: 0, width: 90, height: 800 },
        { x: 710, y: 0, width: 90, height: 800 },
        { x: 0, y: 710, width: 330, height: 90 },
        { x: 470, y: 710, width: 330, height: 90 },
        { x: 310, y: 270, width: 180, height: 200 }
      ];
    }

    // --- PRIMEIRO MAPA DO PRÓLOGO (Aldeia Corrompida Sob o Castelo) ---
    if (mapKey === "prologue_1") {
      return [
        // Muralha e Portão do Castelo à direita
        { x: 680, y: 0, width: 120, height: 800 },

        // Ruínas / Casa superior esquerda
        { x: 60, y: 100, width: 180, height: 130 },

        // Ruínas / Casa superior centro
        { x: 380, y: 20, width: 140, height: 130 },

        // Poço / Cercas do lado esquerdo
        { x: 0, y: 340, width: 110, height: 120 },

        // Casa do meio esquerda
        { x: 130, y: 440, width: 150, height: 130 },

        // Casa inferior esquerda
        { x: 50, y: 640, width: 170, height: 140 },

        // Casa inferior centro
        { x: 420, y: 650, width: 160, height: 130 },

        // Restos de fogueira / corrupção no centro
        { x: 430, y: 430, width: 80, height: 60 }
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

    if (currentMap && currentMap.complete && currentMap.naturalWidth > 0) {
      ctx.drawImage(currentMap, 0, 0, width, height);
    } else {
      ctx.fillStyle = "#121d15";
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
      const pX = ((time * speed + i * 137) % (width + 100)) - 50;
      const pY = (i * 83 + Math.sin(time * 0.002 + i) * 30) % height;
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

        if (trigger.id === "espada_item") {
          // --- VISUAL DE ESPADA NO MAPA ---
          ctx.shadowColor = "#ffd700";
          ctx.shadowBlur = 10 + Math.sin(animTime) * 5;

          ctx.strokeStyle = "#e0e0e0";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, y + 10);
          ctx.lineTo(x, y - 10);
          ctx.stroke();

          ctx.strokeStyle = "#d4af37";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x - 6, y + 3);
          ctx.lineTo(x + 6, y + 3);
          ctx.stroke();
        } else {
          // --- VISUAL DE CORAÇÃO ---
          ctx.shadowColor = "#ff2a55";
          ctx.shadowBlur = 12 + Math.sin(animTime) * 6;

          const size = 12;
          ctx.fillStyle = "#ff1a4a";
          ctx.beginPath();
          ctx.arc(x - size / 2, y - size / 2, size / 2, Math.PI, 0, false);
          ctx.arc(x + size / 2, y - size / 2, size / 2, Math.PI, 0, false);
          ctx.lineTo(x, y + size);
          ctx.closePath();
          ctx.fill();

          ctx.shadowBlur = 0;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(x - size / 3, y - size / 2, size / 4, 0, Math.PI * 2);
          ctx.fill();
        }

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