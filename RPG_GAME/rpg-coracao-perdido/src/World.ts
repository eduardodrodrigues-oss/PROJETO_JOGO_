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
      { id: "prologue_1", src: "/assets/Aldeia Corrompida Sob o Castelo.png" },
      { id: "prologue_2", src: "/assets/Catedral Gótica ao Luar.png" },
      { id: "prologue_hunting", src: "/assets/Clareira Sombria em Floresta Pixel Art.png" },
      // Interior da Catedral com o Coração Sagrado
      { id: "prologue_3", src: "/assets/Coração Sagrado na Catedral Sombria.png" }
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

    this.triggers.push({
      id: "cathedral_door",
      mapKey: "prologue_2",
      x: 500,
      y: 260,
      title: "Entrar na Catedral",
      type: "door_enter"
    });

    // --- CORAÇÃO SAGRADO NO ALTAR DA CATEDRAL (prologue_3) ---
    this.triggers.push({
      id: "heart_cathedral_altar",
      mapKey: "prologue_3",
      x: 400,
      y: 220,
      title: "Pegar Coração Sagrado",
      type: "item",
      collected: false
    });

    // --- CARNES ESPALHADAS NA CLAREIRA DE CAÇA (prologue_hunting) ---
    this.triggers.push(
      { id: "carne_cabra_1", mapKey: "prologue_hunting", x: 180, y: 220, title: "Carne de Cabra", type: "item", collected: false },
      { id: "carne_cabra_2", mapKey: "prologue_hunting", x: 550, y: 180, title: "Carne de Cabra", type: "item", collected: false },
      { id: "carne_raposa_1", mapKey: "prologue_hunting", x: 280, y: 480, title: "Carne de Raposa", type: "item", collected: false },
      { id: "carne_raposa_2", mapKey: "prologue_hunting", x: 620, y: 350, title: "Carne de Raposa", type: "item", collected: false },
      { id: "carne_lobo_1", mapKey: "prologue_hunting", x: 420, y: 280, title: "Carne de Lobo", type: "item", collected: false },
      { id: "carne_lobo_2", mapKey: "prologue_hunting", x: 150, y: 620, title: "Carne de Lobo", type: "item", collected: false },
      { id: "carne_humano_1", mapKey: "prologue_hunting", x: 680, y: 600, title: "Carne Humana", type: "item", collected: false },
      { id: "carne_humano_2", mapKey: "prologue_hunting", x: 350, y: 680, title: "Carne Humana", type: "item", collected: false }
    );
  }

  public getObstacles(mapKey: string): Rect[] {
    if (mapKey === "0,2") {
      return [
        { x: 260, y: 220, width: 115, height: 150 },
        { x: 455, y: 220, width: 105, height: 150 },
        { x: 375, y: 220, width: 80, height: 110 },
        { x: 650, y: 285, width: 58, height: 90 },
        { x: 140, y: 520, width: 70, height: 50 },
        { x: 180, y: 405, width: 70, height: 25 },
        { x: 0, y: 0, width: 100, height: 600 },
        { x: 700, y: 0, width: 100, height: 600 }
      ];
    }

    if (mapKey === "0,3") {
      return [
        { x: 0, y: 100, width: 100, height: 700 },
        { x: 700, y: 100, width: 100, height: 700 },
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

    if (mapKey === "prologue_1") {
      return [
        { x: 680, y: 0, width: 120, height: 800 },
        { x: 60, y: 100, width: 180, height: 130 },
        { x: 380, y: 20, width: 140, height: 130 },
        { x: 0, y: 340, width: 60, height: 120 },
        { x: 130, y: 440, width: 150, height: 130 },
        { x: 50, y: 640, width: 170, height: 140 },
        { x: 420, y: 650, width: 160, height: 130 },
        { x: 430, y: 430, width: 80, height: 60 }
      ];
    }

    if (mapKey === "prologue_2") {
      return [
        { x: 250, y: 0, width: 500, height: 260 },
        { x: 0, y: 0, width: 250, height: 180 },
        { x: 750, y: 0, width: 250, height: 180 }
      ];
    }

    if (mapKey === "prologue_hunting") {
      return [
        { x: 0, y: 0, width: 80, height: 800 },
        { x: 720, y: 0, width: 80, height: 800 },
        { x: 0, y: 0, width: 300, height: 60 },
        { x: 500, y: 0, width: 300, height: 60 },
        { x: 0, y: 740, width: 800, height: 60 },
        { x: 650, y: 60, width: 100, height: 90 },
        { x: 60, y: 680, width: 120, height: 100 }
      ];
    }

    // --- OBSTÁCULOS DO INTERIOR DA CATEDRAL (prologue_3) ---
    if (mapKey === "prologue_3") {
      return [
        { x: 0, y: 0, width: 800, height: 180 },     // Altar e vitrais
        { x: 0, y: 0, width: 80, height: 800 },       // Parede esquerda
        { x: 720, y: 0, width: 80, height: 800 },     // Parede direita
        { x: 120, y: 350, width: 220, height: 350 }, // Bancos esquerdos
        { x: 460, y: 350, width: 220, height: 350 }, // Bancos direitos
        { x: 0, y: 750, width: 330, height: 50 },      // Parede inferior esquerda
        { x: 470, y: 750, width: 330, height: 50 }      // Parede inferior direita
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

    if (
      mapKey === "prologue_1" ||
      mapKey === "prologue_2" ||
      mapKey === "prologue_hunting" ||
      mapKey === "prologue_3"
    ) {
      const particleCount = 12;
      for (let i = 0; i < particleCount; i++) {
        const speed = 0.02 + (i % 4) * 0.01;
        const pX = ((time * speed + i * 137) % (width + 100)) - 50;
        const pY = (i * 93 + Math.sin(time * 0.002 + i) * 20) % height;
        const size = 1 + (i % 2);

        ctx.fillStyle = i % 2 === 0 ? "rgba(255, 200, 120, 0.3)" : "rgba(200, 200, 255, 0.2)";
        ctx.beginPath();
        ctx.arc(pX, pY, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      return;
    }

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
        } else if (trigger.id.startsWith("carne_")) {
          ctx.shadowColor = "#d4af37";
          ctx.shadowBlur = 8 + Math.sin(animTime) * 4;

          ctx.fillStyle = "#8b0000";
          ctx.beginPath();
          ctx.ellipse(x, y, 10, 7, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ff6347";
          ctx.beginPath();
          ctx.ellipse(x - 2, y - 2, 4, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
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