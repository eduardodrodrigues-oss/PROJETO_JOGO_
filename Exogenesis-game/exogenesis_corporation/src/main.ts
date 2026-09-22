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
import bancadaImgUrl from './assets/console_hud.png';
import bancadaLigadaImgUrl from './assets/console_hud_active.png';
import titleBgUrl from './assets/title_screen.png';
import papelCodigoImgUrl from './assets/papel_codigo.png'; // Caminho para a imagem do papel

import pass1Img from './assets/bancada_1.png';      // Tela com *
import pass2Img from './assets/bancada_2.png';      // Tela com **
import pass3Img from './assets/bancada_3.png';      // Tela com ***
import pass4Img from './assets/bancada_4.png';      // Tela com ****
import pass5Img from './assets/bancada_5.png';      // Tela com *****
import pass6Img from './assets/bancada_6.png';      // Tela com ******

const BANCADA_IMAGES = [bancadaImgUrl, pass1Img, pass2Img, pass3Img, pass4Img, pass5Img, pass6Img];
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
                label: 'Observar planeta SAPX-2090',
                top: '12%', left: '18%', width: '36%', height: '22%',
                action: () => game.setText("A visão da janela revela SAPX-2090. Um planeta desértico envolto em poeira. A Base-E01 está situada no setor norte.")
            },
            {
                id: 'door_to_hallway', 
                label: 'Ir para o Corredor Principal',
                top: '28%', left: '82%', width: '12%', height: '58%',
                action: () => game.changeRoom('hallway')
            },
            
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
                label: 'Caminhar para Ponte de Comando',
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
                label: 'Caminhar para o Salão Central',
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
                label: 'Caminhar para Corredor Principal',
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
                label: 'Caminhar para Salão Central (Lounge)',
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
            id: 'pe_de_cabra_hotspot',
            label: '🔧 Pé de Cabra',
            top: '65%', left: '40%', width: '12%', height: '15%', // Ajuste a posição onde ele fica visível
            action: () => game.interactPeDeCabra()
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
                label: 'Caminhar para Corredor Técnico',
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
                label: 'Caminhar para Corredor Técnico',
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
                label: 'Caminhar para Corredor Principal',
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
                label: 'Caminhar para Escritório',
                top: '18%', left: '40%', width: '30%', height: '82%',
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
            },
            {
            id: 'armario_dormitorio',
            label: '🔒 Armário do Dormitório',
            top: '20%', left: '2%', width: '18%', height: '65%', // Extrema esquerda
            action: () => game.interactArmarioDormitorio()
            },
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
    private currentRoomId: string = 'quarto13';

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
    private consoleCodeInput: string = '';  
    constructor() {
        this.setupPlayerHand();
        this.setupInventoryUI();
        this.initCameraControls();
        this.initTooltipFollow();
        new ParticleSystem('ambient-particles');
        this.render();
        // Exemplo no final do constructor() ou método init():
        
        this.render(); 

        // 2. Chama a Tela Inicial no FINAL para ficar por cima de tudo:
        this.startTitleScreen();
        // Deteta cliques no item 'papel_codigo' dentro do inventário
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
    
    // Se o elemento clicado (ou o elemento pai) tiver o texto/id do papel do código
        if (target && (target.innerText?.includes('Papel com Código') || target.getAttribute('data-item-id') === 'papel_codigo' || target.closest('[data-item-id="papel_codigo"]'))) {
        this.showItemInspector(papelCodigoImgUrl, "Código anotado: 482761");
        }
        });
    }
    

/**
 * Lógica de processamento do Teclado Numérico da Bancada.
 */
private handleKeypadInput(key: string, displayEl: HTMLElement) {
    if (!this.getFlag('alavanca_puxada')) {
        this.setText("BANCADA DE COMANDOS: O teclado está sem energia. Puxe a alavanca primeiro!");
        return;
    }

    if (this.getFlag('pouso_autorizado')) {
        this.setText("BANCADA DE COMANDOS: Sequência de pouso já foi autorizada e travada no sistema.");
        return;
    }

    if (key === 'C') {
        this.consoleCodeInput = '';
        displayEl.innerText = '------';
        return;
    }

    if (key === '↵') {
        this.validateConsoleCode(displayEl);
        return;
    }

    if (this.consoleCodeInput.length < 6) {
        this.consoleCodeInput += key;
        displayEl.innerText = this.consoleCodeInput.padEnd(6, '-');
    }
}

/**
 * Validação da senha de 6 dígitos no Console (Código correto: 482761).
 */
private validateConsoleCode(displayEl: HTMLElement) {
    const TARGET_CODE = '482761';

    if (this.consoleCodeInput === TARGET_CODE) {
        this.setFlag('pouso_autorizado', true);
        displayEl.style.color = '#00ff66';
        displayEl.innerText = 'ACEITO';
        sounds.playClick();

        this.setText("CÓDIGO ACEITO! Protocolo de Pouso Desbloqueado. Iniciando Reentrada Atmosférica...");
        this.triggerLandingSequence();

        setTimeout(() => {
            this.closeConsoleOverlay();
        }, 1500);
    } else {
        displayEl.style.color = '#ff3333';
        displayEl.innerText = 'ERRO';
        sounds.playClick();
        this.setText("CÓDIGO INCORRETO! Acesso negado pela matriz de controle.");

        setTimeout(() => {
            this.consoleCodeInput = '';
            displayEl.style.color = '#00ffaa';
            displayEl.innerText = '------';
        }, 1200);
    }
}
    public showItemInspector(imageUrl: string, description?: string) {
    const existing = document.getElementById('item-inspector');
    if (existing) existing.remove();

    // Modal escuro em ecrã inteiro com efeito de desfoque (Inspector)
    const overlay = document.createElement('div');
    overlay.id = 'item-inspector';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.88);
        backdrop-filter: blur(5px);
        z-index: 100000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
    `;

    // Imagem do papel centralizada com sombra projetada
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = `
        max-width: 85vw;
        max-height: 65vh;
        object-fit: contain;
        filter: drop-shadow(0px 15px 30px rgba(0, 0, 0, 0.9));
        transition: transform 0.2s ease;
    `;

    // Legenda/Texto descritivo
    const desc = document.createElement('div');
    desc.style.cssText = `
        margin-top: 20px;
        color: #ffffff;
        font-family: 'VT323', monospace;
        font-size: 24px;
        letter-spacing: 2px;
        background: rgba(0, 0, 0, 0.7);
        padding: 8px 24px;
        border: 1px solid #00ffaa;
        border-radius: 4px;
        box-shadow: 0 0 15px rgba(0, 255, 170, 0.2);
    `;
    desc.innerText = description || "Código de Acesso: 482761";

    const hint = document.createElement('span');
    hint.style.cssText = `
        margin-top: 12px;
        color: #888888;
        font-family: 'VT323', monospace;
        font-size: 18px;
        letter-spacing: 1px;
    `;
    hint.innerText = "[ Clique para fechar ]";

    overlay.appendChild(img);
    overlay.appendChild(desc);
    overlay.appendChild(hint);

    // Clicar em qualquer parte fecha a visualização
    overlay.onclick = () => {
        try { sounds.playClick(); } catch (e) {}
        overlay.remove();
    };

    document.body.appendChild(overlay);
}
    public startTitleScreen() {
    const createOverlay = () => {
        const existing = document.getElementById('title-screen');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'title-screen';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: #000000 url('${titleBgUrl}') center/cover no-repeat;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            padding-bottom: 60px;
            box-sizing: border-box;
        `;

        const startBtn = document.createElement('button');
        startBtn.innerText = 'INICIAR JORNADA';
        startBtn.style.cssText = `
            background: rgba(0, 0, 0, 0.6);
            color: #ffffff;
            border: none;
            outline: none;
            padding: 10px 28px;
            font-family: 'VT323', monospace;
            font-size: 22px;
            letter-spacing: 3px;
            cursor: pointer;
            transition: all 0.25s ease;
            text-transform: uppercase;
            border-radius: 4px;
        `;

        startBtn.onmouseenter = () => {
            startBtn.style.color = '#00ffaa';
            startBtn.style.background = 'rgba(0, 0, 0, 0.85)';
            startBtn.style.textShadow = '0 0 10px rgba(0, 255, 170, 0.8)';
        };

        startBtn.onmouseleave = () => {
            startBtn.style.color = '#ffffff';
            startBtn.style.background = 'rgba(0, 0, 0, 0.6)';
            startBtn.style.textShadow = 'none';
        };

        // Ao clicar: remove o menu e exibe a tela de brilho (a cutscene NÃO é chamada aqui)
        startBtn.onclick = () => {
            try { sounds.playClick(); } catch (e) {}
            overlay.remove();
            this.showBrightnessSettings(() => {
                this.startIntroCutscene(); // Cutscene só inicia APÓS confirmar o brilho
            });
        };

        overlay.appendChild(startBtn);
        document.body.appendChild(overlay);
    };

    if (document.body) {
        createOverlay();
    } else {
        window.addEventListener('DOMContentLoaded', createOverlay);
    }
}

public showBrightnessSettings(onConfirm: () => void) {
    const existing = document.getElementById('brightness-screen');
    if (existing) existing.remove();

    // Aplica o brilho inicial em 200%
    document.body.style.filter = 'brightness(200%)';

    const overlay = document.createElement('div');
    overlay.id = 'brightness-screen';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.95);
        z-index: 100000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;
        font-family: 'VT323', monospace;
        color: #ffffff;
    `;

    const title = document.createElement('h2');
    title.innerText = 'AJUSTE DE BRILHO';
    title.style.cssText = `
        font-size: 32px;
        letter-spacing: 3px;
        margin: 0;
        color: #00ffaa;
    `;

    const desc = document.createElement('p');
    desc.innerText = 'Ajuste a intensidade do brilho para a melhor experiência:';
    desc.style.cssText = `
        font-size: 20px;
        color: #cccccc;
        margin: 0;
    `;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '50';
    slider.max = '200';
    slider.value = '200';
    slider.style.cssText = `
        width: 280px;
        cursor: pointer;
        accent-color: #00ffaa;
    `;

    const valueDisplay = document.createElement('span');
    valueDisplay.innerText = '200%';
    valueDisplay.style.cssText = 'font-size: 24px; letter-spacing: 2px;';

    slider.oninput = () => {
        const val = slider.value;
        valueDisplay.innerText = `${val}%`;
        document.body.style.filter = `brightness(${val}%)`;
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.innerText = 'CONFIRMAR';
    confirmBtn.style.cssText = `
        background: rgba(0, 0, 0, 0.6);
        color: #ffffff;
        border: 1px solid #00ffaa;
        padding: 8px 28px;
        font-family: 'VT323', monospace;
        font-size: 22px;
        letter-spacing: 2px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s ease;
        margin-top: 10px;
    `;

    confirmBtn.onmouseenter = () => {
        confirmBtn.style.background = '#00ffaa';
        confirmBtn.style.color = '#000000';
    };

    confirmBtn.onmouseleave = () => {
        confirmBtn.style.background = 'rgba(0, 0, 0, 0.6)';
        confirmBtn.style.color = '#ffffff';
    };

    confirmBtn.onclick = () => {
        try { sounds.playClick(); } catch (e) {}
        overlay.remove();
        onConfirm(); // Inicia a cutscene apenas agora
    };

    overlay.appendChild(title);
    overlay.appendChild(desc);
    overlay.appendChild(slider);
    overlay.appendChild(valueDisplay);
    overlay.appendChild(confirmBtn);

    document.body.appendChild(overlay);
}
// Guardar o código digitado
private currentCode: string = "";

// ⚙️ Ação ao clicar na alavanca da bancada (canto inferior esquerdo)
public interactAlavancaBancada() {
    try { sounds.playClick(); } catch (e) {}

    this.setFlag('alavanca_puxada', true);
    this.setText("Você puxou a alavanca para baixo! O teclado do terminal foi energizado.");
}

// 🔢 Ação ao clicar nos números da bancada
public pressBenchKeypad(digit: string) {
    // 1. Trava: Se a alavanca AINDA NÃO foi puxada
    if (!this.getFlag('alavanca_puxada')) {
        this.showThought("Lembro que preciso puxar a alavanca para conseguir mexer no código de acesso...");
        return;
    }

    try { sounds.playClick(); } catch (e) {}

    if (this.currentCode.length >= 6) return;

    this.currentCode += digit;
    const count = this.currentCode.length;

    // Atualiza a imagem da tela da bancada com a versão correspondente de asteriscos (*, **, ***, etc.)
    this.updateBenchImage(BANCADA_IMAGES[count]);

    // 2. Quando completar os 6 dígitos:
    if (this.currentCode.length === 6) {
        setTimeout(() => {
            if (this.currentCode === '482761') {
                this.setFlag('sistema_desbloqueado', true);
                this.setText("ACESSO CONCEDIDO! Sistema de navegação liberado.");
            } else {
                this.setText("CÓDIGO INCORRETO! Reiniciando terminal...");
                this.currentCode = "";
                this.updateBenchImage(BANCADA_IMAGES[0]); // Volta para a tela inicial sem asteriscos
            }
        }, 500);
    }
}

// Auxiliar para trocar a imagem da bancada atual
private updateBenchImage(imgUrl: string) {
    // Atualize o fundo da sala/modal da bancada com a nova imagem
    const benchContainer = document.getElementById('bench-view-container'); // Use o ID do seu elemento da bancada
    if (benchContainer) {
        benchContainer.style.backgroundImage = `url('${imgUrl}')`;
    }
}

// Auxiliar para trocar a imagem da tela/bancada
public updateConsoleBgImage(imgUrl: string) {
    const benchContainer = document.getElementById('bancada-view');
    if (benchContainer) {
        benchContainer.style.backgroundImage = `url('${imgUrl}')`;
    }
}

public interactPeDeCabra() {
    // Se o jogador já pegou o pé de cabra, não faz nada
    if (this.hasItem('pe_de_cabra')) {
        this.setText("Não há mais nada por aqui.");
        return;
    }

    try { sounds.playClick(); } catch (e) {}

    // Adiciona o pé de cabra ao inventário
    this.addItem({
        id: 'pe_de_cabra',
        name: 'Pé de Cabra',
        iconSymbol: '🔨',
        description: 'Uma ferramenta pesada de ferro. Perfeita para forçar fechaduras ou armários.'
    });

    this.setText("Você pegou o pé de cabra!");

    // Atualiza a tela para remover o hotspot do chão/bancada
    this.render();
}

    public showThought(text: string) {
    // Remove qualquer pensamento anterior ativo
    const existingThought = document.getElementById('thought-overlay');
    if (existingThought) existingThought.remove();

    // Faixa com gradiente escuro de sombra no rodapé
    const thoughtOverlay = document.createElement('div');
    thoughtOverlay.id = 'thought-overlay';
    thoughtOverlay.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        height: 140px;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.75) 60%, transparent 100%);
        z-index: 500;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding-bottom: 30px;
        box-sizing: border-box;
        cursor: pointer;
        transition: opacity 0.5s ease;
    `;

    // Texto com tom itálico/melancólico para pensamento
    const textEl = document.createElement('p');
    textEl.style.cssText = `
        color: #d2d8e0;
        font-family: 'VT323', monospace;
        font-size: 26px;
        font-style: italic;
        letter-spacing: 2px;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
        margin: 0;
        text-align: center;
        padding: 0 20px;
        pointer-events: none;
    `;
    textEl.innerText = `💭 "${text}"`;

    thoughtOverlay.appendChild(textEl);
    document.body.appendChild(thoughtOverlay);

    // Some ao clicar na sombra ou na tela
    thoughtOverlay.onclick = () => {
        thoughtOverlay.style.opacity = '0';
        setTimeout(() => thoughtOverlay.remove(), 500);
    };
}

    public startIntroCutscene() {
    // Carrega a fonte estilo terminal
    if (!document.getElementById('retro-font-link')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'retro-font-link';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=VT323&display=swap';
        document.head.appendChild(fontLink);
    }

    // Tela inteira preta
    const overlay = document.createElement('div');
    overlay.id = 'intro-cutscene';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: #000000;
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
        box-sizing: border-box;
    `;

    // Elemento para o texto com preservação obrigatória de espaços (white-space: pre-wrap)
    const textEl = document.createElement('div');
    textEl.style.cssText = `
        max-width: 900px;
        color: #ffffff;
        font-family: 'VT323', monospace;
        font-size: 32px;
        letter-spacing: 2px;
        line-height: 1.8;
        text-align: center;
        white-space: pre-wrap;
        word-break: break-word;
    `;

    overlay.appendChild(textEl);
    document.body.appendChild(overlay);

    const text1 = "... Estamos em 2118... a tripulação, a minha tripulação está viajando pelo espaço vasto, escuro, a famosa caixa de areia, solitária nos leva para o planeta onde o fundador foi visto pela última vez. Há mais de 5 meses que não recebemos retorno de suas mensagens...";
    const text2 = "só não sabíamos onde ele tinha se metido!";

    // Efeito de máquina de escrever usando textContent (preserva espaços perfeitamente)
    const typeWriter = (text: string, element: HTMLElement, speed: number = 35): Promise<void> => {
        return new Promise((resolve) => {
            element.textContent = '';
            let i = 0;
            const timer = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, speed);
        });
    };

    // Sequência da animação
    const runCutscene = async () => {
        // 1. Digita o primeiro texto
        await typeWriter(text1, textEl, 35);

        // 2. Aguarda 5 segundos na tela
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // 3. Limpa o texto instantaneamente
        textEl.textContent = '';

        // 4. Digita a frase final
        await typeWriter(text2, textEl, 45);

        // 5. Aguarda 2.5 segundos
        await new Promise((resolve) => setTimeout(resolve, 2500));

        
        // 6. CORTE BRUSCO direto para o jogo com o pensamento
        overlay.remove();
        this.currentRoomId = 'dormitorio';
        this.render();

        // Exibe a sombra de pensamento no rodapé
        this.showThought("Últimas horas de viagem... como será que estão as coisas essas horas?");
    };

    runCutscene();
}

    public openConsoleOverlay() {
    // Evita abrir múltiplos modais simultâneos
    if (document.getElementById('console-modal')) return;

    // Overlay escuro de fundo
    const overlay = document.createElement('div');
    overlay.id = 'console-modal';
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(4px);
    `;

    // Moldura Responsiva com Aspect Ratio fixo (16:9)
    const aspectWrapper = document.createElement('div');
    aspectWrapper.style.cssText = `
        position: relative;
        width: 90%;
        max-width: 960px;
        aspect-ratio: 16 / 9;
        box-shadow: 0 0 25px rgba(0, 255, 170, 0.4);
        border: 2px solid #00ffaa;
        border-radius: 8px;
        overflow: hidden;
        background-color: #050b10;
    `;

    const isLeverPowered = this.getFlag('alavanca_puxada');

    // Container do Fundo da Bancada (Alterna dinamicamente a arte)
    const benchView = document.createElement('div');
    benchView.id = 'bancada-view';
    benchView.style.cssText = `
        width: 100%;
        height: 100%;
        background-image: url('${isLeverPowered ? bancadaLigadaImgUrl : bancadaImgUrl}');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;
    `;

    // --- DISPLAY DE TEXTO DA SENHA (Centralizado na caixa do monitor) ---
    const display = document.createElement('div');
    display.id = 'console-code-display';
    display.style.cssText = `
        position: absolute;
        top: 27.5%;
        left: 41.5%;
        width: 17%;
        height: 4%;
        color: ${isLeverPowered ? '#00ffaa' : 'transparent'};
        font-family: monospace;
        font-size: 16px;
        font-weight: bold;
        letter-spacing: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        text-shadow: ${isLeverPowered ? '0 0 8px #00ffaa' : 'none'};
    `;
    display.innerText = isLeverPowered ? (this.consoleCodeInput || '------') : '';
    benchView.appendChild(display);

    // --- HOTSPOT 1: Alavanca Principal (Invisível) ---
    const btnLever = document.createElement('div');
    btnLever.style.cssText = `
        position: absolute;
        top: 52%;
        left: 2%;
        width: 14%;
        height: 38%;
        cursor: pointer;
        border: none;
        background: transparent;
    `;
    btnLever.title = 'Alavanca de Energização';

    btnLever.onclick = () => {
        sounds.playClick();
        if (!this.getFlag('alavanca_puxada')) {
            this.setFlag('alavanca_puxada', true);
            
            // Ativa a arte iluminada da bancada (console_hud_active.png)
            benchView.style.backgroundImage = `url('${bancadaLigadaImgUrl}')`;
            display.style.color = '#00ffaa';
            display.style.textShadow = '0 0 8px #00ffaa';
            display.innerText = this.consoleCodeInput || '------';
            
            this.setText("BANCADA DE COMANDOS: Sistema energizado! O painel de controle foi ativado.");
        } else {
            this.setText("BANCADA DE COMANDOS: Alavanca principal já se encontra na posição ATIVA.");
        }
    };
    benchView.appendChild(btnLever);

    // --- HOTSPOT 2: Mapeamento Tecla por Tecla do Teclado do Monitor ---
    const keyboardContainer = document.createElement('div');
    keyboardContainer.style.cssText = `
        position: absolute;
        top: 36%;
        left: 33.2%;
        width: 33.6%;
        height: 28%;
        display: flex;
        flex-direction: column;
        gap: 2px;
        border: none;
        background: transparent;
    `;

    // Função auxiliar para criar hotspots de teclas transparentes
    const createKey = (keyLabel: string, flexValue: string = '1') => {
        const keyEl = document.createElement('div');
        keyEl.style.cssText = `
            flex: ${flexValue};
            height: 100%;
            cursor: pointer;
            background: transparent;
            border: none;
            border-radius: 2px;
            transition: background 0.1s ease;
        `;
        
        // Efeito sutil ao passar o mouse quando energizado
        keyEl.onmouseenter = () => {
            if (this.getFlag('alavanca_puxada')) {
                keyEl.style.background = 'rgba(0, 255, 170, 0.2)';
                sounds.playHover();
            }
        };
        keyEl.onmouseleave = () => {
            keyEl.style.background = 'transparent';
        };

        keyEl.onclick = () => {
            sounds.playClick();
            // Se a alavanca NÃO foi puxada, exibe o pensamento
            if (!this.getFlag('alavanca_puxada')) {
                this.showThought("Lembro que sempre puxei primeiro a alavanca...");
                return;
            }
            // Se energizado, envia a digitação da tecla
            this.handleKeypadInput(keyLabel, display);
        };
        return keyEl;
    };

    // Fileira 1: Teclas Numéricas (1 a 0) + Apagar (C)
    const row1 = document.createElement('div');
    row1.style.cssText = 'display: flex; height: 20%; gap: 2px;';
    ['1','2','3','4','5','6','7','8','9','0','C'].forEach(k => row1.appendChild(createKey(k)));
    keyboardContainer.appendChild(row1);

    // Fileira 2: Q W E R T Y U I O P
    const row2 = document.createElement('div');
    row2.style.cssText = 'display: flex; height: 20%; gap: 2px; padding: 0 1%;';
    ['Q','W','E','R','T','Y','U','I','O','P'].forEach(k => row2.appendChild(createKey(k)));
    keyboardContainer.appendChild(row2);

    // Fileira 3: A S D F G H J K L + Enter (↵)
    const row3 = document.createElement('div');
    row3.style.cssText = 'display: flex; height: 20%; gap: 2px; padding: 0 2%;';
    ['A','S','D','F','G','H','J','K','L'].forEach(k => row3.appendChild(createKey(k)));
    row3.appendChild(createKey('↵', '1.5'));
    keyboardContainer.appendChild(row3);

    // Fileira 4: Z X C V B N M
    const row4 = document.createElement('div');
    row4.style.cssText = 'display: flex; height: 20%; gap: 2px; padding: 0 8%;';
    ['Z','X','C','V','B','N','M'].forEach(k => row4.appendChild(createKey(k)));
    keyboardContainer.appendChild(row4);

    // Fileira 5: Tecla SPACE e Botão ENTRAR
    const row5 = document.createElement('div');
    row5.style.cssText = 'display: flex; height: 20%; gap: 4px; padding: 0 15%;';
    row5.appendChild(createKey('SPACE', '2'));
    row5.appendChild(createKey('↵', '2'));
    keyboardContainer.appendChild(row5);

    benchView.appendChild(keyboardContainer);

    // --- Botão de Fechar Overlay (X) ---
    const closeBtn = document.createElement('button');
    closeBtn.innerText = '✕ SAIR DA BANCADA';
    closeBtn.style.cssText = `
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(180, 0, 0, 0.8);
        color: #ffffff;
        border: 1px solid #ff4444;
        padding: 6px 12px;
        font-family: monospace;
        font-size: 11px;
        font-weight: bold;
        cursor: pointer;
        border-radius: 4px;
        z-index: 10;
    `;
    closeBtn.onclick = () => {
        sounds.playClick();
        this.closeConsoleOverlay();
    };
    benchView.appendChild(closeBtn);

    aspectWrapper.appendChild(benchView);
    overlay.appendChild(aspectWrapper);
    document.body.appendChild(overlay);
}

/**
 * Fecha o Overlay da Bancada de Comandos.
 */

public closeConsoleOverlay() {
    const modal = document.getElementById('console-modal');
    if (modal) {
        modal.remove();
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

        this.setText(" [POUSO CONCLUÍDO]: A nave Exo-Voyager realizou o touchdown com sucesso no solo do planeta! Os motores desligaram e a eclusa principal está liberada.");
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
        sounds.playClick();
        this.setText("PORTA SELADA: Acesso bloqueado. Sistema requer autorização de segurança Nível 2.");
        this.showThought("Onde foi parar esse cartão de acesso? Ana deve ter escondido...");
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
    public interactArmarioDormitorio() {
    if (!this.getFlag('pensamento_codigo_visto')) {
        this.setText("Um armário pessoal trancado.");
        return;
    }

    if (this.hasItem('pe_de_cabra')) {
        if (!this.hasItem('papel_codigo')) {
            try { sounds.playClick(); } catch (e) {}

            this.addItem({
                id: 'papel_codigo',
                name: 'Papel com Código',
                iconSymbol: '📄',
                description: 'Papel amassado com o código 482761.'
            });

            this.setText("Você usou o pé de cabra para arrombar o armário e encontrou um papel amassado!");
            this.showItemInspector(papelCodigoImgUrl, "Código anotado: 482761");
        } else {
            this.setText("O armário já está aberto e vazio.");
        }
    } else {
        try { sounds.playClick(); } catch (e) {}
        this.showThought("Acho que perdi a chave... aquele pé de cabra, ainda tá no setor medico?");
    }
}
    public changeRoom(roomId: string) {
        sounds.playClick();
        this.stopLucianoTalking();
        this.currentRoomId = roomId;
        this.currentPanX = 0;
        this.panoramaTrack.style.transform = `translateX(0px)`;
        this.render();
        if (roomId === 'bridge') {
        const temCartao = this.hasItem('cartao_acesso_lvl2'); // Ajuste com o ID real do seu cartão
        const temArma = this.hasItem
        ('arma_laser_exogenesis');                 // Ajuste com o ID real da sua arma
            
        const jaPensou = this.getFlag('pensamento_codigo_visto');

        if (temCartao && temArma && !jaPensou) {
            this.setFlag('pensamento_codigo_visto', true);
            this.showThought("Escrevi esse código de acesso em um papel. Acho que deixei no armário dentro do meu dormitório junto com as outras tralhas. Sabia que esqueceria!");
        }
    }
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

    // Hotspot exclusivo da bancada durante o procedimento de pouso
    if (this.currentRoomId === 'bridge' && this.getFlag('landing_started')) {
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

    // Adiciona Noralma Costa dinamicamente se a turbulência começou
    console.log('--- DEBUG RENDER ---');
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

    // Renderiza NPCs ativos
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

    // Renderização dos Hotspots com filtro de visibilidade
    room.hotspots.forEach(spot => {
        // Esconde o armário se a flag de pensamento ainda não tiver sido ativada
        if (spot.id === 'armario_dormitorio' && !this.getFlag('pensamento_codigo_visto')) {
            return;
        }

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