export class SoundManager {
  private ctx: AudioContext | null = null;
  private isStarted: boolean = false;

  public init(): void {
    if (this.isStarted) return;

    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioCtx();
    this.isStarted = true;

    this.startBackgroundDrone();
    this.scheduleRandomCreepySound();
  }

  // --- NOVO: GERADOR PROCEDURAL DE PASSOS ---
  public playFootstep(surface: "grass" | "wood"): void {
    if (!this.ctx || this.ctx.state !== "running") return;

    const now = this.ctx.currentTime;

    if (surface === "grass") {
      // Passo na Grama: Ruído suave abafado + micro variação de frequência
      const duration = 0.07;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      // Varia a frequência do filtro a cada passo para não ficar repetitivo
      filter.frequency.setValueAtTime(500 + Math.random() * 250, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05 + Math.random() * 0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } else {
      // Passo na Madeira: Impacto oco com queda de frequência rápida (thump)
      const duration = 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      // Frequência base de madeira oca com pequena variação
      const startFreq = 150 + Math.random() * 25;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + duration);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    }
  }

  // Zumbido grave e tenso em segundo plano
  private startBackgroundDrone(): void {
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(45, this.ctx.currentTime);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(48, this.ctx.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(100, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
  }

  // Sorteia sons estranhos periodicamente entre 4 e 10 segundos
  private scheduleRandomCreepySound(): void {
    const nextTime = Math.random() * 6000 + 4000;
    setTimeout(() => {
      if (this.isStarted) {
        this.playRandomCreepySound();
      }
      this.scheduleRandomCreepySound();
    }, nextTime);
  }

  private playRandomCreepySound(): void {
    if (!this.ctx) return;

    const type = Math.floor(Math.random() * 3);
    const now = this.ctx.currentTime;

    if (type === 0) {
      // Vento sussurrante
      const bufferSize = this.ctx.sampleRate * 2.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(150, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + 1.2);
      filter.frequency.exponentialRampToValueAtTime(120, now + 2.5);
      filter.Q.value = 4;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 1.2);
      gain.gain.linearRampToValueAtTime(0.001, now + 2.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } else if (type === 1) {
      // Estrondo sub-grave
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 1.8);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    } else {
      // Ressonância estranha
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.linearRampToValueAtTime(240, now + 1.2);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.4);
    }
  }
}