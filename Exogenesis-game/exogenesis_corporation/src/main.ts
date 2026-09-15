import './style.css';

import bridgeImgUrl from './assets/bridge.png';
import hallwayImgUrl from './assets/hallway.png';
import comodo1ImgUrl from './assets/comodo1.png';
import alaAImgUrl from './assets/ala_a.png';
import quarto13ImgUrl from './assets/quarto13.png';
import loungeImgUrl from './assets/lounge.png';
import handImgUrl from './assets/player_hand.png';
import lucianoImgUrl from './assets/luciano.png';
import lucianoFalandoImgUrl from './assets/luciano_falando.png';
import corredorTecnicoImgUrl from './assets/corredor_tecnico.png';
import setorMedicoImgUrl from './assets/setor_medico.png';
import areaCientificaImgUrl from './assets/area_cientifica.png';
import handCardLvl2ImgUrl from './assets/hand_card_lvl2.png';
import armariaImgUrl from './assets/armaria.png';
import handLaserGunImgUrl from './assets/hand_laser_gun.png';
import anaMoniqueImgUrl from './assets/ana_monique.png';
import anaMoniqueFalandoImgUrl from './assets/ana_monique_falando.png';
import noralmaImgUrl from './assets/noralma_costa.png';
import noralmaFalandoImgUrl from './assets/noralma_falando.png';
import consoleImgUrl from './assets/console_hud.png';
import consoleActiveImgUrl from './assets/console_hud_active.png';
// --- INTERFACES ---

interface Item {
    id: string;
    name: string;
    description: string;
    iconSymbol?: string;
}

interface Hotspot {
    id: string;
    label: string;
    top: string;
    left: string;
    width: string;
    height: string;
    action: () => void;
}

interface NPC {
    id: string;
    name: string;
    image: string;
    top: string;
    left: string;
    width: string;
    height: string;
    action: () => void;
}

interface Room {
    id: string;
    name: string;
    themeClass: string;
    bgImage: string;
    description: string;
    hotspots: Hotspot[];
    npcs?: NPC[];
}

// --- CLASSE 1: AUDIO ENGINE ---

class SoundEngine {
    private ctx: AudioContext | null = null;

    private initCtx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    public playHover() {
        this.initCtx();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
    }

    public playClick() {
        this.initCtx();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(500, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }
}

const sounds = new SoundEngine();

// --- MAPA DE SALAS DO JOGO ---

const rooms: Record<string, Room> = {
    'bridge': {
        id: 'bridge',
        name: 'Ponte de Comando - Exo-Voyager',
        themeClass: 'theme-bridge',
        bgImage: `url(${bridgeImgUrl})`,
        description: "Você está na Ponte de Comando da Exo-Voyager. Como Capitão, o controle da embarcação está em suas mãos. O brilho de Glisere22A5 ilumina o ambiente.",
        hotspots: [
            {
                id: 'mission_control', 
                label: 'Tentar comunicação com o Comandante de Missões',
                top: '38%', left: '30%', width: '12%', height: '35%',
                action: () => game.startMissionControlDialogue()
            },
            {
                id: 'window', 
                label: 'Observar planeta Glisere22A5',
                top: '12%', left: '18%', width: '36%', height: '22%',
                action: () => game.setText("A visão da janela revela Glisere22A5. Um planeta desértico envolto em poeira. A Base-E01 está situada no setor norte.")
            },
            {
                id: 'door_to_hallway', 
                label: 'Ir para o Corredor Principal',
                top: '28%', left: '82%', width: '12%', height: '58%',
                action: () => game.changeRoom('hallway')
            }
        ]
    },

    'hallway': {
        id: 'hallway',
        name: 'Corredor Principal - Hub de Acesso',
        themeClass: 'theme-hallway',
        bgImage: `url(${hallwayImgUrl})`,
        description: "O Corredor Principal está silencioso. Luzes subterrâneas emitem um zumbido constante ao longo das paredes de liga metálica.",
        hotspots: [
            {
                id: 'door_to_bridge', 
                label: 'Retornar à Ponte de Comando',
                top: '25%', left: '8%', width: '14%', height: '60%',
                action: () => game.changeRoom('bridge')
            },
            {
                id: 'door_to_comodo1', 
                label: 'Entrar no Cômodo 1 (Alojamento/Escritório)',
                top: '28%', left: '28%', width: '15%', height: '50%',
                action: () => game.changeRoom('comodo1')
            },
            {
                id: 'door_to_lounge', 
                label: 'Avançar para o Salão Central (Lounge da Tripulação)',
                top: '30%', left: '50%', width: '18%', height: '45%',
                action: () => game.changeRoom('lounge')
            }
        ]
    },

    'lounge': {
        id: 'lounge',
        name: 'Salão Central - Lounge de Convivência',
        themeClass: 'theme-bridge',
        bgImage: `url(${loungeImgUrl})`,
        description: "Salão de Convivência da Exo-Voyager. A iluminação esverdeada e o pilar botânico central criam um ambiente calmo para descanso da tripulação.",
        npcs: [
            {
                id: 'luciano_brien',
                name: 'Luciano Brien',
                image: lucianoImgUrl,
                top: '20%', left: '2%', width: '26%', height: '75%',
                action: () => game.startLucianoDialogue()
            }
        ],
        hotspots: [
            {
                id: 'poster_motto',
                label: 'Ler cartaz promocional',
                top: '32%', left: '29%', width: '7%', height: '20%',
                action: () => game.setText("CARTAZ: 'JUNTOS ATÉ O NOVO MUNDO' — Lema da expedição Exo-Voyager.")
            },
            {
                id: 'hydroponic_plants',
                label: 'Examinar estufa central de plantas',
                top: '46%', left: '42%', width: '16%', height: '18%',
                action: () => game.setText("ESTUFA BOTÂNICA: Amostras vegetais de apoio biológico em perfeito estado.")
            },
            {
                id: 'galley_area',
                label: 'Inspecionar balcão de refeições e café',
                top: '42%', left: '72%', width: '16%', height: '20%',
                action: () => game.setText("MÁQUINAS DE REFEIÇÃO: Módulos de sintetização alimentar funcionando normalmente.")
            },
            {
                id: 'door_to_corredor_tecnico',
                label: 'Avançar para o Corredor Técnico (Porta ao Fundo)',
                top: '32%', left: '58%', width: '10%', height: '28%',
                action: () => game.changeRoom('corredor_tecnico')
            },
            {
                id: 'center_door_hallway',
                label: 'Voltar ao Corredor Principal',
                top: '38%', left: '38%', width: '8%', height: '25%',
                action: () => game.changeRoom('hallway')
            }
        ]
    },

    'corredor_tecnico': {
        id: 'corredor_tecnico',
        name: 'Corredor Técnico - Acesso Unidades B e C',
        themeClass: 'theme-bridge',
        bgImage: `url(${corredorTecnicoImgUrl})`,
        description: "Corredor industrial de apoio técnico. A iluminação verde sinaliza os acessos às Unidades B, C, Sala de Equipamentos e o Portão Principal de desembarque.",
        hotspots: [
            {
                id: 'unidade_b_door',
                label: 'Entrar na Unidade B (Setor Médico)',
                top: '22%', left: '4%', width: '18%', height: '58%',
                action: () => game.changeRoom('unidade_b_medicina')
            },
            {
                id: 'main_gate',
                label: 'Examinar Portão Principal (Fundo)',
                top: '38%', left: '42%', width: '16%', height: '28%',
                action: () => game.setText("PORTÃO PRINCIPAL: Eclusa blindada de desembarque para a superfície de Glisere22A5. Acesso bloqueado até a autorização de Pouso.")
            },
            {
                id: 'unidade_c_door',
                label: 'Entrar na Unidade C (Área Científica)',
                top: '22%', left: '72%', width: '15%', height: '55%',
                action: () => game.changeRoom('unidade_c_cientifica')
            },
            {
                id: 'tech_equipment_room',
                label: 'Sala de Equipamentos Técnicos (Extrema Direita)',
                top: '30%', left: '91%', width: '9%', height: '40%',
                action: () => game.setText("EQUIPAMENTOS TÉCNICOS: Contém geradores auxiliares. O painel requer a chave física de manutenção do Luciano.")
            },
            {
                id: 'crate_left',
                label: 'Inspecionar caixas táticas (Esquerda)',
                top: '68%', left: '0%', width: '14%', height: '28%',
                action: () => game.setText("CAIXAS TÁTICAS: Módulos com trajes espaciais de reserva e kits de reparo de fuselagem.")
            },
            {
                id: 'back_to_lounge',
                label: 'Retornar ao Salão Central (Lounge)',
                top: '82%', left: '30%', width: '40%', height: '18%',
                action: () => game.changeRoom('lounge')
            }
        ]
    },

    'unidade_b_medicina': {
        id: 'unidade_b_medicina',
        name: 'Unidade B - Setor Médico',
        themeClass: 'theme-bridge',
        bgImage: `url(${setorMedicoImgUrl})`,
        description: "Ala médica de emergência da Exo-Voyager. O local está equipado com leitos de UTI, monitores vitais e suprimentos de primeiros socorros.",
        hotspots: [
            {
                id: 'med_sign',
                label: 'Placa Setor Médico',
                top: '25%', left: '2%', width: '10%', height: '30%',
                action: () => game.setText("SINALIZAÇÃO: Indica o setor de triagem e tratamento intensivo da Unidade B.")
            },
            {
                id: 'poster_health',
                label: 'Ler cartaz "CUIDE DE VOCÊ"',
                top: '41%', left: '71%', width: '6%', height: '14%',
                action: () => game.setText("CARTAZ DE PROTOCOLO: 'CUIDE DE VOCÊ - Relate qualquer sintoma de contaminação imediatamente.'")
            },
            {
                id: 'med_supplies',
                label: 'Inspecionar carrinho de medicamentos',
                top: '52%', left: '36%', width: '10%', height: '25%',
                action: () => game.setText("ARMÁRIO DE MEDICAMENTOS: Contém anestésicos, estojos de sutura e estimulantes cardíacos.")
            },
            {
                id: 'vital_monitors',
                label: 'Examinar leitos e monitores vitais',
                top: '42%', left: '72%', width: '22%', height: '40%',
                action: () => game.setText("LEITOS DE TRATAMENTO: Os monitores estão ligados em modo de espera. Nenhum paciente registrado.")
            },
            {
                id: 'curtain_area',
                label: 'Checar cabine de isolamento',
                top: '32%', left: '45%', width: '11%', height: '35%',
                action: () => game.setText("CABINE DE ISOLAMENTO: A cortina esconde um leito reservado para quarentena bacteriológica.")
            },
            {
                id: 'back_to_corredor_tecnico',
                label: 'Sair para o Corredor Técnico',
                top: '80%', left: '25%', width: '50%', height: '20%',
                action: () => game.changeRoom('corredor_tecnico')
            }
        ]
    },

    'unidade_c_cientifica': {
        id: 'unidade_c_cientifica',
        name: 'Unidade C - Área Científica',
        themeClass: 'theme-bridge',
        bgImage: `url(${areaCientificaImgUrl})`,
        description: "Você está no laboratório científico principal da Exo-Voyager. A Unidade C é dedicada a análises biológicas e de amostras do planeta.",
        npcs: [
            {
                id: 'ana_monique',
                name: 'Dra. Ana Monique',
                image: anaMoniqueImgUrl,
                top: '25%',
                left: '65%',
                width: '30%',
                height: '70%',
                action: () => game.interactAnaMonique()
            }
        ],
        hotspots: [
            {
                id: 'painel_area_cientifica',
                label: 'Painel de Identificação - Unidade Científica',
                top: '15%', left: '2%', width: '12%', height: '35%',
                action: () => game.setText("PAINEL DE IDENTIFICAÇÃO: Unidade C - Laboratório de Bio-Análise e Exobiologia.")
            },
            {
                id: 'monitores_bio_analise',
                label: 'Analisar dados biológicos nos monitores',
                top: '42%', left: '25%', width: '18%', height: '18%',
                action: () => game.setText("MONITORES DE BIO-ANÁLISE: Sequenciamento de DNA de amostras coletadas.")
            },
            {
                id: 'quadro_branco_diagramas',
                label: 'Estudar diagramas no quadro branco',
                top: '40%', left: '38%', width: '10%', height: '15%',
                action: () => game.setText("QUADRO BRANCO: Diagramas complexos da flora local.")
            },
            {
                id: 'terrario_flora_amostras',
                label: 'Inspecionar terrário de amostras de flora',
                top: '35%', left: '82%', width: '12%', height: '25%',
                action: () => game.setText("TERRÁRIO DE OBSERVAÇÃO: Amostras de plantas nativas sob ambiente controlado.")
            },
            {
                id: 'carrinho_suprimentos_cie',
                label: 'Inspecionar carrinho de suprimentos',
                top: '55%', left: '45%', width: '6%', height: '18%',
                action: () => game.inspectSuppliesCart()
            },
            {
                id: 'estante_equipamentos_cie',
                label: 'Procurar suprimentos na estante',
                top: '35%', left: '92%', width: '8%', height: '40%',
                action: () => game.setText("ESTANTE DE EQUIPAMENTOS: Vários recipientes de laboratório.")
            },
            {
                id: 'voltar_corredor_tecnico_cie',
                label: 'Retornar ao Corredor Técnico',
                top: '80%', left: '2%', width: '20%', height: '18%',
                action: () => game.changeRoom('corredor_tecnico')
            }
        ]
    },

    'comodo1': {
        id: 'comodo1',
        name: 'Cômodo 1 - Escritório Técnico Exo-Voyager',
        themeClass: 'theme-bridge',
        bgImage: `url(${comodo1ImgUrl})`,
        description: "Cômodo 1 — Escritório e estação de controle técnico. O brilho esverdeado dos monitores ilumina a sala.",
        hotspots: [
            {
                id: 'desk_computer', 
                label: 'Acessar computador de bordo',
                top: '46%', left: '11%', width: '18%', height: '28%',
                action: () => game.setText("COMPUTADOR: 'Registro de segurança #402. O acesso ao setor confidencial exige autorização de Nível 2.'")
            },
            {
                id: 'schematic_display', 
                label: 'Analisar diagrama da nave Exo-Voyager',
                top: '22%', left: '9%', width: '14%', height: '22%',
                action: () => game.setText("DIAGRAMA: Planta estrutural da Exo-Voyager.")
            },
            {
                id: 'bookshelf', 
                label: 'Procurar documentos na estante',
                top: '30%', left: '46%', width: '9%', height: '32%',
                action: () => game.setText("ESTANTE: Manuais técnicos. Há uma anotação: 'O cartão Nível 2 ficou na Área Científica'.")
            },
            {
                id: 'sofa_area', 
                label: 'Examinar mesa de centro e sofá',
                top: '58%', left: '68%', width: '22%', height: '32%',
                action: () => game.setText("MESA DE CENTRO: Uma xícara de café frio e um terminal pessoal desligado.")
            },
            {
                id: 'door_left', 
                label: 'Entrar na Ala A (Porta Aberta)',
                top: '28%', left: '33%', width: '9%', height: '38%',
                action: () => game.changeRoom('ala_a')
            },
            {
                id: 'door_right_locked', 
                label: 'Tentar abrir Porta Direita',
                top: '28%', left: '59%', width: '9%', height: '38%',
                action: () => game.interactRightDoorComodo1()
            },
            {
                id: 'door_back_hallway', 
                label: 'Voltar ao Corredor Principal',
                top: '80%', left: '35%', width: '30%', height: '20%',
                action: () => game.changeRoom('hallway')
            }
        ]
    },
    'setor_confidencial': {
        id: 'setor_confidencial',
        name: 'Setor Confidencial - Armaria Exogenesis',
        themeClass: 'theme-bridge',
        bgImage: `url(${armariaImgUrl})`,
        description: "Você acessou o Setor Confidencial. A sala contém trajes espaciais de alta proteção e o arsenal tático das indústrias Exogenesis Corporation.",
        hotspots: [
            {
                id: 'suits_display',
                label: 'Examinar Trajes Espaciais',
                top: '20%', left: '2%', width: '20%', height: '55%',
                action: () => game.setText("TRAJES ESPACIAIS: Módulos de proteção EVA pressurizados de última geração da Exogenesis.")
            },
            {
                id: 'laser_weapon_rack',
                label: 'Inspecionar Painel de Armamento',
                top: '22%', left: '24%', width: '16%', height: '40%',
                action: () => game.inspectLaserWeapon()
            },
            {
                id: 'cargo_door_t07',
                label: 'Examinar Portão T-07 (Nave)',
                top: '32%', left: '59%', width: '25%', height: '45%',
                action: () => game.setText("PORTÃO T-07: Eclusa de carga blindada da nave. O acesso direto requer protocolo de voo ativo.")
            },
            {
                id: 'back_to_comodo1',
                label: 'Sair para o Escritório (Cômodo 1)',
                top: '82%', left: '30%', width: '40%', height: '18%',
                action: () => game.changeRoom('comodo1')
            }
        ]
    },
    

    'ala_a': {
        id: 'ala_a',
        name: 'Ala A - Corredor de Habitáculos',
        themeClass: 'theme-bridge',
        bgImage: `url(${alaAImgUrl})`,
        description: "Ala A — Setor residencial da tripulação.",
        hotspots: [
            {
                id: 'door_01', 
                label: 'Habitáculo 01 (Trancado)',
                top: '25%', left: '3%', width: '12%', height: '55%',
                action: () => game.setText("HABITÁCULO 01 [TRANCADO]: Pertence ao Dr. Aris.")
            },
            {
                id: 'door_13', 
                label: 'Entrar no Habitáculo 13 (Seu Quarto de Capitão)',
                top: '23%', left: '79%', width: '9%', height: '52%',
                action: () => game.changeRoom('quarto13')
            },
            {
                id: 'door_back_comodo1', 
                label: 'Retornar ao Escritório (Cômodo 1)',
                top: '82%', left: '30%', width: '40%', height: '18%',
                action: () => game.changeRoom('comodo1')
            }
        ]
    },

    'quarto13': {
        id: 'quarto13',
        name: 'Habitáculo 13 - Quarto do Capitão',
        themeClass: 'theme-bridge',
        bgImage: `url(${quarto13ImgUrl})`,
        description: "Habitáculo 13 — Seus aposentos privados como Capitão da Exo-Voyager.",
        hotspots: [
            {
                id: 'bunk_bed', 
                label: 'Examinar beliche e bolsa de viagem',
                top: '20%', left: '8%', width: '28%', height: '70%',
                action: () => game.setText("SUA BELICHE: A bolsa de viagem contém suas vestes de comando.")
            },
            {
                id: 'room_door_13', 
                label: 'Sair para o Corredor da Ala A (Porta 13)',
                top: '20%', left: '50%', width: '17%', height: '55%',
                action: () => game.changeRoom('ala_a')
            }
        ]
    }
};

// --- CLASSE 2: PARTÍCULAS DE POEIRA ESPACIAL ---

class ParticleSystem {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private particles: Array<{ x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }> = [];

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.resize();
        this.initParticles();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    private resize() {
        this.canvas.width = this.canvas.parentElement?.clientWidth || 800;
        this.canvas.height = this.canvas.parentElement?.clientHeight || 500;
    }

    private initParticles() {
        this.particles = [];
        for (let i = 0; i < 35; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 1.5 + 0.4,
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }

    private animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            this.ctx.fillStyle = `rgba(0, 255, 170, ${p.opacity})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// --- CLASSE 3: ENGINE PRINCIPAL DO JOGO ---

class PointAndClickEngine {
    private currentRoomId: string = 'bridge';

    // Estado do jogo e inventário
    private inventory: Item[] = [];
    private selectedItemId: string | null = null;
    private flags: Record<string, boolean> = {};

    // Elementos da Interface
    private viewport = document.getElementById('viewport')!;
    private panoramaTrack = document.getElementById('panorama-track')!;
    private hotspotLayer = document.getElementById('hotspot-layer')!;
    private gameText = document.getElementById('game-text')!;
    private locationDisplay = document.getElementById('current-location')!;
    private navCoordsContainer = document.getElementById('navigation-coords')!;
    private optionsContainer = document.getElementById('options-container')!;
    private tooltip = document.getElementById('hover-tooltip')!;
    private handElement!: HTMLImageElement;
    private inventoryBar!: HTMLDivElement;

    private isDragging: boolean = false;
    private startX: number = 0;
    private currentPanX: number = 0;
    private dragDistance: number = 0;

    private lucianoTalkInterval: number | null = null;
    private lucianoTalkTimeout: number | null = null;
    private landingTimers: number[] = [];
    private anaTalkInterval: number | null = null;
    private anaTalkTimeout: number | null = null;
    private noralmaTalkInterval: number | null = null;
    private noralmaTalkTimeout: number | null = null;
    private hullHealth: number = 100;
    private retroRocketsActive: boolean = false;
    private shieldsAligned: boolean = false;
    private consoleOverlayEl: HTMLElement | null = null;
    constructor() {
        this.setupPlayerHand();
        this.setupInventoryUI();
        this.initCameraControls();
        this.initTooltipFollow();
        new ParticleSystem('ambient-particles');
        this.render();
    }
    public openConsoleOverlay() {
    if (this.consoleOverlayEl) return;

    // Overlay modal escuro
    const overlay = document.createElement('div');
    overlay.id = 'console-modal';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.92);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `;

    // Container do Cockpit HD (carrega a imagem base ou a ativada dependendo do estado)
    const container = document.createElement('div');
    const updateConsoleBackground = () => {
        container.style.backgroundImage = `url('${this.retroRocketsActive ? consoleActiveImgUrl : consoleImgUrl}')`;
    };

    container.style.cssText = `
        position: relative;
        width: 90vw;
        height: 80vh;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        border: 2px solid #00ffaa;
        box-shadow: 0 0 25px rgba(0, 255, 170, 0.3);
    `;
    updateConsoleBackground();

    // Indicador de Status na tela da bancada
    const statusDisplay = document.createElement('div');
    statusDisplay.style.cssText = `
        position: absolute; top: 15px; left: 20px;
        color: #00ffaa; font-family: monospace; font-size: 15px;
        background: rgba(0,0,0,0.8); padding: 8px 15px; border: 1px solid #00ffaa;
        border-radius: 4px; pointer-events: none; z-index: 1002;
    `;
    
    const updateHUD = () => {
        statusDisplay.innerText = `CASCO: ${this.hullHealth}% | ESCUDOS: ${this.shieldsAligned ? 'OK' : 'DESALINHADOS'} | RETROS: ${this.retroRocketsActive ? 'LIGADOS' : 'DESLIGADOS'}`;
    };
    updateHUD();

    // Botão Fechar / Sair
    const btnExit = document.createElement('button');
    btnExit.innerText = '✖ LEVANTAR DA BANCADA';
    btnExit.className = 'action-btn';
    btnExit.style.cssText = 'position: absolute; top: 15px; right: 15px; z-index: 1002;';
    btnExit.onclick = () => this.closeConsoleOverlay();

    // Hotspot 1: Alavanca da Esquerda (Invisível)
    const btnLever = document.createElement('button');
    btnLever.title = 'Alavanca de Propulsão / Retrofoguetes';
    btnLever.style.cssText = `
        position: absolute; top: 58%; left: 3%; width: 15%; height: 25%;
        background: transparent; border: none; outline: none; cursor: pointer;
    `;
    btnLever.onclick = () => {
        sounds.playClick();
        this.retroRocketsActive = !this.retroRocketsActive;
        updateConsoleBackground(); // Troca a imagem do cockpit instantaneamente
        updateHUD();
        this.checkLandingSafety();
    };

    // Hotspot 2: Painel Central (Invisível)
    const btnCenterMatrix = document.createElement('button');
    btnCenterMatrix.title = 'Estabilizar Matriz de Escudos';
    btnCenterMatrix.style.cssText = `
        position: absolute; top: 60%; left: 36%; width: 28%; height: 22%;
        background: transparent; border: none; outline: none; cursor: pointer;
    `;
    btnCenterMatrix.onclick = () => {
        sounds.playClick();
        this.shieldsAligned = true;
        updateHUD();
        this.checkLandingSafety();
    };

    container.appendChild(statusDisplay);
    container.appendChild(btnLever);
    container.appendChild(btnCenterMatrix);
    container.appendChild(btnExit);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    this.consoleOverlayEl = overlay;
}

public closeConsoleOverlay() {
    if (this.consoleOverlayEl) {
        this.consoleOverlayEl.remove();
        this.consoleOverlayEl = null;
    }
}
    public startNoralmaTalking(durationMs: number = 4000) {
    this.stopNoralmaTalking();

    const noralmaEl = document.querySelector<HTMLImageElement>('[data-npc-id="noralma_costa"]');
    if (!noralmaEl) return;

    let isFrameTalking = false;

    this.noralmaTalkInterval = window.setInterval(() => {
        isFrameTalking = !isFrameTalking;
        noralmaEl.src = isFrameTalking ? noralmaFalandoImgUrl : noralmaImgUrl;
    }, 220);

    this.noralmaTalkTimeout = window.setTimeout(() => {
        this.stopNoralmaTalking();
    }, durationMs);
}

public stopNoralmaTalking() {
    if (this.noralmaTalkInterval !== null) {
        clearInterval(this.noralmaTalkInterval);
        this.noralmaTalkInterval = null;
    }
    if (this.noralmaTalkTimeout !== null) {
        clearTimeout(this.noralmaTalkTimeout);
        this.noralmaTalkTimeout = null;
    }

    const noralmaEl = document.querySelector<HTMLImageElement>('[data-npc-id="noralma_costa"]');
    if (noralmaEl) {
        noralmaEl.src = noralmaImgUrl;
    }
}   
    // Verifica se as duas condições (Luciano + Arma) foram atingidas para iniciar o pouso

    public interactNoralmaCosta() {
    this.stopLucianoTalking();
    this.stopAnaMoniqueTalking();
    this.stopNoralmaTalking();
    this.clearOptions();

    this.setText("Noralma Costa: 'Capitão! A turbulência começou de repente! Os sensores de reentrada estão oscilando muito. Precisa de ajuda nos painéis de navegação?'");
    this.startNoralmaTalking(5000);

    const btn1 = document.createElement('button');
    btn1.className = 'action-btn';
    btn1.innerText = '🚨 "Mantenha a calma e monitore os transmissores!"';
    btn1.onclick = () => {
        sounds.playClick();
        this.showNoralmaResponse("Noralma Costa: 'Entendido! Estou acompanhando a pressão atmosférica e a integridade do casco daqui.'");
    };

    const btn2 = document.createElement('button');
    btn2.className = 'action-btn';
    btn2.innerText = '🛡️ "Esta estrutura vai aguentar a descida."';
    btn2.onclick = () => {
        sounds.playClick();
        this.showNoralmaResponse("Noralma Costa: 'Confio no seu comando, Capitão! Vou garantir que os sistemas auxiliares não entrem em curto.'");
    };

    const btnVoltar = document.createElement('button');
    btnVoltar.className = 'action-btn';
    btnVoltar.innerText = '⬅️ "Voltar ao comando da nave"';
    btnVoltar.onclick = () => {
        sounds.playClick();
        this.render();
    };

    this.optionsContainer.appendChild(btn1);
    this.optionsContainer.appendChild(btn2);
    this.optionsContainer.appendChild(btnVoltar);
    this.updateUIState();
}

private showNoralmaResponse(text: string) {
    this.stopNoralmaTalking();
    this.clearOptions();
    this.setText(text);
    this.startNoralmaTalking(4500);

    const btnVoltar = document.createElement('button');
    btnVoltar.className = 'action-btn';
    btnVoltar.innerText = '⬅️ "Voltar ao comando da nave"';
    btnVoltar.onclick = () => {
        sounds.playClick();
        this.render();
    };

    this.optionsContainer.appendChild(btnVoltar);
    this.updateUIState();
}
        public startAnaMoniqueTalking(durationMs: number = 4000) {
        this.stopAnaMoniqueTalking();

        const anaEl = document.querySelector<HTMLImageElement>('    [data-npc-id="ana_monique"]');
        if (!anaEl) return;

        let isFrameTalking = false;

        this.anaTalkInterval = window.setInterval(() => {
            isFrameTalking = !isFrameTalking;
            anaEl.src = isFrameTalking ? anaMoniqueFalandoImgUrl :  anaMoniqueImgUrl;
        }, 220);

        this.anaTalkTimeout = window.setTimeout(() => {
            this.stopAnaMoniqueTalking();
        }, durationMs);
    }

    public stopAnaMoniqueTalking() {
        if (this.anaTalkInterval !== null) {
            clearInterval(this.anaTalkInterval);
            this.anaTalkInterval = null;
        }
        if (this.anaTalkTimeout !== null) {
            clearTimeout(this.anaTalkTimeout);
            this.anaTalkTimeout = null;
        }

        const anaEl = document.querySelector<HTMLImageElement>('            [data-npc-id="ana_monique"]');
        if (anaEl) {
            anaEl.src = anaMoniqueImgUrl;
        }
    }
    public interactAnaMonique() {
    this.stopLucianoTalking();
    this.stopAnaMoniqueTalking();
    this.clearOptions();

    this.setText("Dra. Ana Monique: 'Cuidado por onde anda! Você tem noção do preço que paguei pela importação deste jaleco tático sob medida da Exogenesis? Francamente, a poeira desta nave está arruinando meu tecido.'");
    this.startAnaMoniqueTalking(5000);

    const btnCartao = document.createElement('button');
    btnCartao.className = 'action-btn';
    btnCartao.innerText = '💳 "Você viu o cartão de acesso Nível 2?"';
    btnCartao.onclick = () => {
        sounds.playClick();
        this.clearOptions();
        this.setText("Dra. Ana Monique: 'Aquele pedaço de plástico vulgar? Deixei em algum canto do terminal de pesquisas. Não sou paga para guardar tranqueiras de segurança, sou a cientista chefe aqui.'");
        this.startAnaMoniqueTalking(4500);
    };

    const btnPouso = document.createElement('button');
    btnPouso.className = 'action-btn';
    btnPouso.innerText = '🚨 "A nave está em procedimento de pouso!"';
    btnPouso.onclick = () => {
        sounds.playClick();
        this.clearOptions();
        this.setText("Dra. Ana Monique: 'Pouso? Nessa trepidação insuportável? O mínimo que exijo quando descermos é uma suíte descontaminada com controle térmico ajustado em 19.5°C.'");
        this.startAnaMoniqueTalking(4500);
    };

    this.optionsContainer.appendChild(btnCartao);
    this.optionsContainer.appendChild(btnPouso);
    this.updateUIState();
    }

public checkLandingTrigger() {
    const talkedToLuciano = this.getFlag('luciano_talked');
    const hasLaserGun = this.getFlag('laser_gun_collected') || this.hasItem('arma_laser_exogenesis');
    const alreadyLanding = this.getFlag('ship_landing_started');

    if (talkedToLuciano && hasLaserGun && !alreadyLanding) {
        this.setFlag('ship_landing_started', true);
        this.triggerLandingSequence();
    }
}

// Executa o alerta sonoro, visual e a caixa de diálogo de aproximação de solo
    // Aplica o nível de tremor no container do jogo (0 = sem tremor, 1 a 4 = intensidades)
    private applyShakeLevel(level: number) {
        const container = document.getElementById('game-container') || this.viewport;
        if (!container) return;

        // Remove todas as classes de tremor anteriores
        container.classList.remove('shake-lvl-1', 'shake-lvl-2', 'shake-lvl-3', 'shake-lvl-4');

        if (level > 0) {
        container.classList.add(`shake-lvl-${level}`);
        }
    }

    // Inicia o cronômetro do pouso com tremor progressivo de 3m 40s
    private triggerLandingSequence() {
        this.setFlag('landing_started', true);

    // 2. FORÇA o jogo a desenhar a sala novamente com a Noralma
        this.render()
    // Dispara a re-renderização caso o jogador já esteja na Ponte de Comando
    if (this.currentRoomId === 'bridge') {
        this.render();
    }
        sounds.playClick();

        this.setText("🚨 [ALERTA DO SISTEMA DE BORDO]: Entrando na atmosfera! Retrofoguetes acionados. Sequência de pouso automático iniciada (Tempo estimado: 3m 40s).");

        const container = document.getElementById('game-container') || this.viewport;

        // Injeta os estilos CSS de tremor e alerta piscante na página
        if (!document.getElementById('landing-shake-styles')) {
            const style = document.createElement('style');
            style.id = 'landing-shake-styles';
            style.innerHTML = `
                @keyframes pulseAlert {
                    0% { opacity: 0.1; }
                    100% { opacity: 0.5; }
                }
                @keyframes shakeLvl1 {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(-2px, 1px); }
                    50% { transform: translate(2px, -1px); }
                    75% { transform: translate(-1px, -2px); }
                }
                @keyframes shakeLvl2 {
                    0%, 100% { transform: translate(0, 0); }
                    20% { transform: translate(-4px, 3px); }
                    40% { transform: translate(4px, -3px); }
                    60% { transform: translate(-3px, -4px); }
                    80% { transform: translate(3px, 4px); }
                }
                @keyframes shakeLvl3 {
                    0%, 100% { transform: translate(0, 0); }
                    15% { transform: translate(-7px, 5px) rotate(-0.5deg); }
                    30% { transform: translate(7px, -5px) rotate(0.5deg); }
                    45% { transform: translate(-6px, -6px) rotate(-0.5deg); }
                    60% { transform: translate(6px, 6px) rotate(0.5deg); }
                    75% { transform: translate(-5px, 4px); }
                }
                @keyframes shakeLvl4 {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-12px, 9px) rotate(-1.5deg); }
                    20% { transform: translate(12px, -9px) rotate(1.5deg); }
                    30% { transform: translate(-10px, -10px) rotate(-1deg); }
                    40% { transform: translate(10px, 10px) rotate(1deg); }
                    50% { transform: translate(-14px, 7px) rotate(-2deg); }
                    60% { transform: translate(14px, -7px) rotate(2deg); }
                    70% { transform: translate(-9px, 11px) rotate(-1deg); }
                    80% { transform: translate(9px, -11px) rotate(1deg); }
                }

                .shake-lvl-1 { animation: shakeLvl1 0.4s infinite; }
                .shake-lvl-2 { animation: shakeLvl2 0.3s infinite; }
                .shake-lvl-3 { animation: shakeLvl3 0.2s infinite; }
                .shake-lvl-4 { animation: shakeLvl4 0.1s infinite; }
        `   ;
            document.head.appendChild(style);
        }

    // Cria a luz de alerta vermelho piscante na tela
        if (container && !document.getElementById('landing-alert-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'landing-alert-overlay';
            overlay.style.cssText = `
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255, 0, 0, 0.25);
                pointer-events: none;
                z-index: 999;
                animation: pulseAlert 1.2s infinite alternate;
        `   ;
            container.appendChild(overlay);
        }

    // Cancela timers anteriores se houver
        this.landingTimers.forEach(t => clearTimeout(t));
        this.landingTimers = [];

    // T = 0s: Inicia com tremor leve
        this.applyShakeLevel(1);

    // T = 1 minuto (60.000 ms): Tremor Nível 2
    const t1 = window.setTimeout(() => {
        this.applyShakeLevel(2);
        this.setText("🚨 [SISTEMA DE BORDO]: Entrando na atmosfera superior. Turbulência moderada detectada.");
    }, 60000);

    // T = 2 minutos (120.000 ms): Tremor Nível 3
    const t2 = window.setTimeout(() => {
        this.applyShakeLevel(3);
        this.setText("🚨 [SISTEMA DE BORDO]: Turbulência severa! Fogo de atrito atmosférico detectado (Nível 3).");
    }, 120000);

    // T = 3 minutos (180.000 ms): Tremor Nível 4 (Muito Forte)
    const t3 = window.setTimeout(() => {
        this.applyShakeLevel(4);
        this.setText("🚨 [SISTEMA DE BORDO]: ALERTA MÁXIMO! Desaceleração extrema dos retrofoguetes! Mantenha-se firme!");
    }, 180000);

    // T = 3 minutos e 40 segundos (220.000 ms): TOUCHDOWN - POUSO CONCLUÍDO!
    const t4 = window.setTimeout(() => {
        this.applyShakeLevel(0);
        this.setFlag('ship_landed', true);

        const overlay = document.getElementById('landing-alert-overlay');
        if (overlay) {
            overlay.style.animation = 'none';
            overlay.style.background = 'rgba(0, 255, 170, 0.08)';
        }

        this.setText("🛬 [POUSO CONCLUÍDO]: A nave Exo-Voyager realizou o touchdown com sucesso no solo do planeta! Os motores desligaram e a eclusa principal está liberada.");
    }, 220000);

        this.landingTimers.push(t1, t2, t3, t4);
    }
    public inspectLaserWeapon() {
    this.stopLucianoTalking();
    this.clearOptions();

    if (!this.hasItem('arma_laser_exogenesis') && !this.getFlag('laser_gun_collected')) {
        this.setText("PAINEL DE ARMAMENTO: No centro do suporte tático, destaca-se uma Arma Laser experimental desenvolvida pelas indústrias Exogenesis Corporation.");
        
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerText = '🔫 Coletar Arma Laser Exogenesis';
        btn.onclick = () => {
            sounds.playClick();
            this.triggerHandGrab();
            this.addItem({
                id: 'arma_laser_exogenesis',
                name: 'Arma Laser Exogenesis',
                iconSymbol: '🔫',
                description: 'Armamento de energia concentrada de alta precisão fabricado pelas indústrias Exogenesis Corporation.'
            });
            this.setFlag('laser_gun_collected', true);
            this.clearOptions();

            // Checa se o pouso deve ser iniciado
            if (this.getFlag('luciano_talked')) {
                this.checkLandingTrigger();
            } else {
                this.setText("Você pegou a Arma Laser das indústrias Exogenesis Corporation!");
            }
        };
        this.optionsContainer.appendChild(btn);
        this.updateUIState();
    } else {
        this.setText("PAINEL DE ARMAMENTO: O encaixe da arma laser está vazio.");
    }
    }
    private setupPlayerHand() {
        this.handElement = document.createElement('img');
        this.handElement.id = 'player-hand';
        this.handElement.src = handImgUrl;
        this.handElement.alt = 'Mão do Capitão';
        this.viewport.appendChild(this.handElement);
    }
    private updateHandSprite() {
        if (this.selectedItemId === 'cartao_acesso_lvl2') {
            this.handElement.src = handCardLvl2ImgUrl;
        } else if (this.selectedItemId === 'arma_laser_exogenesis') {
            this.handElement.src = handLaserGunImgUrl;
        } else {
            this.handElement.src = handImgUrl;
        }
    }

    // --- CORREÇÃO DO SISTEMA DE INVENTÁRIO NA UI ---

    // --- PAINEL LATERAL DIREITO DO INVENTÁRIO (COMPACTO) ---

private setupInventoryUI() {
    let invContainer = document.getElementById('inventory-bar') as HTMLDivElement;
    if (!invContainer) {
        invContainer = document.createElement('div');
        invContainer.id = 'inventory-bar';
        // Anexa ao container principal para evitar corte pelo overflow do viewport
        const parent = document.getElementById('game-container') || this.viewport;
        parent.appendChild(invContainer);
    }
    invContainer.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
        background: rgba(4, 18, 22, 0.92);
        border: 1px solid #00ffaa;
        padding: 8px;
        border-radius: 6px;
        z-index: 99999;
        box-shadow: 0 0 12px rgba(0, 255, 170, 0.35);
        min-width: 130px;
        max-width: 160px;
        pointer-events: auto;
        backdrop-filter: blur(4px);
    `;
    this.inventoryBar = invContainer;
    this.renderInventory();

    

}

public renderInventory() {
    if (!this.inventoryBar) return;
    this.inventoryBar.innerHTML = '<span style="color:#00ffaa; font-size: 10px; font-weight: bold; font-family: monospace; letter-spacing: 1px; text-align: center; display: block; border-bottom: 1px solid rgba(0, 255, 170, 0.3); padding-bottom: 4px; margin-bottom: 2px;">INVENTÁRIO</span>';

    if (this.inventory.length === 0) {
        const emptyMsg = document.createElement('span');
        emptyMsg.style.cssText = 'color: #668877; font-size: 10px; font-style: italic; font-family: monospace; text-align: center; display: block; padding: 4px 0;';
        emptyMsg.innerText = '[ Vazio ]';
        this.inventoryBar.appendChild(emptyMsg);
        this.updateHandSprite();
        return;
    }

    this.inventory.forEach(item => {
        const itemBtn = document.createElement('button');
        const isSelected = this.selectedItemId === item.id;
        itemBtn.style.cssText = `
            width: 100%;
            text-align: left;
            background: ${isSelected ? '#00ffaa' : 'rgba(0, 30, 20, 0.85)'};
            color: ${isSelected ? '#000000' : '#00ffaa'};
            border: 1px solid #00ffaa;
            border-radius: 4px;
            padding: 5px 8px;
            font-size: 10px;
            font-family: monospace;
            cursor: pointer;
            transition: all 0.2s ease;
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        itemBtn.innerText = `${item.iconSymbol || '📦'} ${item.name}`;
        itemBtn.title = item.description;

        itemBtn.onclick = () => {
            sounds.playClick();
            if (this.selectedItemId === item.id) {
                this.selectedItemId = null;
                this.setText(`Item desmarcado.`);
            } else {
                this.selectedItemId = item.id;
                this.setText(`ITEM SELECIONADO: ${item.name} — ${item.description}`);
            }
            this.updateHandSprite();
            this.renderInventory();
        };

        this.inventoryBar.appendChild(itemBtn);
    });

    this.updateHandSprite();
    }
    public addItem(item: Item) {
        if (!this.hasItem(item.id)) {
            this.inventory.push(item);
            this.renderInventory();
        }
    }

   public removeItem(itemId: string) {
    this.inventory = this.inventory.filter(i => i.id !== itemId);
    if (this.selectedItemId === itemId) {
        this.selectedItemId = null;
    }
    this.updateHandSprite();
    this.renderInventory();
    }

    public hasItem(itemId: string): boolean {
        return this.inventory.some(i => i.id === itemId);
    }

    public setFlag(flag: string, value: boolean) {
        this.flags[flag] = value;
    }

    public getFlag(flag: string): boolean {
        return !!this.flags[flag];
    }

    // --- INTERAÇÕES DE ITENS ---

    public inspectSuppliesCart() {
        this.stopLucianoTalking();
        this.clearOptions();

        if (!this.hasItem('cartao_acesso_lvl2') && !this.getFlag('card_lvl2_collected')) {
            this.setText("CARRINHO DE SUPRIMENTOS: Procurando entre os frascos de bio-análise, você encontra um Cartão de Acesso Nível 2!");
            
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.innerText = '💳 Pegar Cartão de Acesso Nível 2';
            btn.onclick = () => {
                sounds.playClick();
                this.triggerHandGrab();
                this.addItem({
                    id: 'cartao_acesso_lvl2',
                    name: 'Cartão Nível 2',
                    iconSymbol: '💳',
                    description: 'Cartão de segurança militar para desbloqueio de setores restritos Nível 2.'
                });
                this.setFlag('card_lvl2_collected', true);
                this.clearOptions();
                this.setText("Você pegou o Cartão de Acesso Nível 2! Ele foi parar direto no seu Inventário (veja no canto superior direito).");
            };
            this.optionsContainer.appendChild(btn);
            this.updateUIState();
        } else {
            this.setText("CARRINHO DE SUPRIMENTOS: Apenas tubos de ensaio e frascos de cultura vazios.");
        }
    }

    public interactRightDoorComodo1() {
        this.stopLucianoTalking();
        this.clearOptions();

        if (this.getFlag('comodo1_right_door_unlocked')) {
            this.changeRoom('setor_confidencial');
            return;
        }

        if (this.hasItem('cartao_acesso_lvl2')) {
            this.setText("PORTA SELADA: O leitor biométrico pisca em vermelho. Requer autorização de segurança.");
        
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.innerText = '💳 Usar Cartão de Acesso Nível 2';
            btn.onclick = () => {
            sounds.playClick();
                this.triggerHandGrab();
                this.setFlag('comodo1_right_door_unlocked', true);
                this.clearOptions();
                this.setText("[BIP! BIP!] Autorização Nível 2 Aceita! Trava liberada. Clique novamente na porta para entrar.");
            };
            this.optionsContainer.appendChild(btn);
            this.updateUIState();
        } else {
            this.setText("PORTA SELADA: [ALARME SILENCIOSO] Acesso bloqueado. Sistema requer autorização de segurança nível 2.");
        }
    }
    // --- CONTROLES DE MOUSE E CÂMERA ---

    private initCameraControls() {
        this.viewport.addEventListener('mousedown', (e: MouseEvent) => {
            this.isDragging = true;
            this.startX = e.clientX - this.currentPanX;
            this.dragDistance = 0;
            this.viewport.classList.add('grabbing');
        });

        window.addEventListener('mousemove', (e: MouseEvent) => {
            if (!this.isDragging) return;
            
            const newX = e.clientX - this.startX;
            this.dragDistance += Math.abs(e.movementX);

            const maxPan = -(this.panoramaTrack.offsetWidth - this.viewport.offsetWidth);
            this.currentPanX = Math.min(0, Math.max(maxPan, newX));

            this.panoramaTrack.style.transform = `translateX(${this.currentPanX}px)`;
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.viewport.classList.remove('grabbing');
        });
    }

    private initTooltipFollow() {
        this.viewport.addEventListener('mousemove', (e: MouseEvent) => {
            const rect = this.viewport.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.tooltip.style.left = `${x + 15}px`;
            this.tooltip.style.top = `${y + 15}px`;
        });
    }

    private updateUIState() {
        if (this.optionsContainer.children.length > 0) {
            this.navCoordsContainer.classList.add('hidden');
        } else {
            this.navCoordsContainer.classList.remove('hidden');
        }
    }

    public clearOptions() {
        this.optionsContainer.innerHTML = '';
        this.updateUIState();
    }

    public changeRoom(roomId: string) {
        sounds.playClick();
        this.stopLucianoTalking();
        this.currentRoomId = roomId;
        this.currentPanX = 0;
        this.panoramaTrack.style.transform = `translateX(0px)`;
        this.render();
    }

    public setText(text: string) {
        this.gameText.innerText = text;
    }

    public triggerHandGrab() {
        this.handElement.classList.add('hand-grab');
        setTimeout(() => {
            this.handElement.classList.remove('hand-grab');
        }, 300);
    }
    

    public startLucianoTalking(durationMs: number = 3800) {
        this.stopLucianoTalking();

        const lucianoEl = document.querySelector<HTMLImageElement>('[data-npc-id="luciano_brien"]');
        if (!lucianoEl) return;

        let isFrameTalking = false;

        this.lucianoTalkInterval = window.setInterval(() => {
            isFrameTalking = !isFrameTalking;
            lucianoEl.src = isFrameTalking ? lucianoFalandoImgUrl : lucianoImgUrl;
        }, 220);

        this.lucianoTalkTimeout = window.setTimeout(() => {
            this.stopLucianoTalking();
        }, durationMs);
    }

    public stopLucianoTalking() {
        if (this.lucianoTalkInterval !== null) {
            clearInterval(this.lucianoTalkInterval);
            this.lucianoTalkInterval = null;
        }
        if (this.lucianoTalkTimeout !== null) {
            clearTimeout(this.lucianoTalkTimeout);
            this.lucianoTalkTimeout = null;
        }

        const lucianoEl = document.querySelector<HTMLImageElement>('[data-npc-id="luciano_brien"]');
        if (lucianoEl) {
            lucianoEl.src = lucianoImgUrl;
        }
        this.setFlag('luciano_talked', true);
        this.checkLandingTrigger();
    }

    public render() {
    this.stopLucianoTalking();
    this.stopAnaMoniqueTalking();
    this.stopNoralmaTalking();
    
    const room = rooms[this.currentRoomId];
    if (!room) return;

    this.viewport.className = room.themeClass;
    this.locationDisplay.innerText = `LOCAL: ${room.name.toUpperCase()}`;
    this.gameText.innerText = room.description;

    this.panoramaTrack.style.backgroundImage = room.bgImage;
    this.clearOptions();
    this.hotspotLayer.innerHTML = '';
     if (this.currentRoomId === 'bridge' && this.getFlag('landing_started')) {
    // Hotspot para a bancada de controles
    const consoleSpot = document.createElement('div');
    consoleSpot.className = 'hotspot console-trigger';
    consoleSpot.style.top = '65%';
    consoleSpot.style.left = '25%';
    consoleSpot.style.width = '50%';
    consoleSpot.style.height = '30%';

    consoleSpot.addEventListener('mouseenter', () => {
        sounds.playHover();
        this.tooltip.innerText = '🖥️ ASSUMIR CONTROLE DA BANCADA DE COMANDOS';
        this.tooltip.style.display = 'block';
        this.handElement.classList.add('hand-reach');
    });

    consoleSpot.addEventListener('mouseleave', () => {
        this.tooltip.style.display = 'none';
        this.handElement.classList.remove('hand-reach');
    });

    consoleSpot.addEventListener('click', (e: MouseEvent) => {
        e.stopPropagation();
        if (this.dragDistance > 6) return;
        sounds.playClick();
        this.openConsoleOverlay();
    });

    this.hotspotLayer.appendChild(consoleSpot);
}   
    // Copia a lista base de NPCs da sala
    const activeNpcs = room.npcs ? [...room.npcs] : [];

    // Adiciona Noralma Costa dinamicamente na Ponte de Comando se a turbulência começouconsole.log('--- DEBUG RENDER ---');
        console.log('Sala Atual:', this.currentRoomId);
        console.log('Turbulência Ativa?:', this.getFlag('landing_started'));
    if (this.currentRoomId === 'bridge' && this.getFlag('landing_started')) {
        activeNpcs.push({
            id: 'noralma_costa',
            name: 'Noralma Costa',
            image: noralmaImgUrl,
            top: '10%',
            left: '10%',
            width: '25%',
            height: '100%',
            action: () => this.interactNoralmaCosta()
        });
    }

    // Renderiza a lista combinada de NPCs
    activeNpcs.forEach(npc => {
        const npcEl = document.createElement('img');
        npcEl.src = npc.image;
        npcEl.className = 'npc-sprite';
        npcEl.dataset.npcId = npc.id;
        npcEl.style.top = npc.top;
        npcEl.style.left = npc.left;
        npcEl.style.width = npc.width;
        npcEl.style.height = npc.height;
        npcEl.style.objectFit = 'contain';

        npcEl.addEventListener('mouseenter', () => {
            sounds.playHover();
            this.tooltip.innerText = `Conversar com ${npc.name}`;
            this.tooltip.style.display = 'block';
            this.handElement.classList.add('hand-reach');
        });

        npcEl.addEventListener('mouseleave', () => {
            this.tooltip.style.display = 'none';
            this.handElement.classList.remove('hand-reach');
        });

        npcEl.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            if (this.dragDistance > 6) return;
            sounds.playClick();
            this.triggerHandGrab();
            this.tooltip.style.display = 'none';
            npc.action();
        });

        this.hotspotLayer.appendChild(npcEl);
    });

    // Renderização dos Hotspots
    room.hotspots.forEach(spot => {
        const el = document.createElement('div');
        el.className = 'hotspot';
        el.style.top = spot.top;
        el.style.left = spot.left;
        el.style.width = spot.width;
        el.style.height = spot.height;

        el.addEventListener('mouseenter', () => {
            sounds.playHover();
            this.tooltip.innerText = spot.label;
            this.tooltip.style.display = 'block';
            this.handElement.classList.add('hand-reach');
        });

        el.addEventListener('mouseleave', () => {
            this.tooltip.style.display = 'none';
            this.handElement.classList.remove('hand-reach');
        });

        el.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            if (this.dragDistance > 6) return;
            sounds.playClick();
            this.triggerHandGrab();
            this.tooltip.style.display = 'none';
            spot.action();
        });

        this.hotspotLayer.appendChild(el);
    });
}
    public startMissionControlDialogue() {
        this.stopLucianoTalking();
        this.setText('COMUNICADOR DE BORDO: "Capitão, aqui é o Comandante de Missões. Aguardamos a sua inspeção no Módulo 1 antes de autorizar o procedimento de pouso na Base-E01."');
        
        this.clearOptions();

        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerText = 'Ciente, Comando. Procedendo com a inspeção.';
        btn.onclick = () => {
            sounds.playClick();
            this.triggerHandGrab();
            this.clearOptions();
            this.setText(rooms[this.currentRoomId].description);
        };
        this.optionsContainer.appendChild(btn);
        this.updateUIState();
    }

    public startLucianoDialogue() {
        const initialSpeech = 'LUCIANO BRIEN: "Fala, Capitão! Preparado para o procedimento em Glisere22A5?"';
        this.setText(initialSpeech);
        this.startLucianoTalking(4000);

        this.clearOptions();

        const btn1 = document.createElement('button');
        btn1.className = 'action-btn';
        btn1.innerText = '"Como estão os sistemas do salão, Luciano?"';
        btn1.onclick = () => {
            sounds.playClick();
            this.triggerHandGrab();
            this.setText('LUCIANO BRIEN: "Tudo nos trinques por aqui!"');
            this.startLucianoTalking(5000);
        };

        const btn2 = document.createElement('button');
        btn2.className = 'action-btn';
        btn2.innerText = '"Mantenha a atenção. Volto em breve."';
        btn2.onclick = () => {
            sounds.playClick();
            this.triggerHandGrab();
            this.stopLucianoTalking();
            this.clearOptions();
            this.setText(rooms[this.currentRoomId].description);
        };

        this.optionsContainer.appendChild(btn1);
        this.optionsContainer.appendChild(btn2);
        this.updateUIState();
    }
}

// --- INICIALIZAÇÃO ---

let game: PointAndClickEngine;
window.addEventListener('load', () => {
    game = new PointAndClickEngine();
});