/* ============================================================
   Pilates na Parede · Programa de 21 dias
   Fonte: Pilates_21_dias_lista_simples.pdf
   - Aquecimento e alongamento final são iguais todos os dias
   - Dias 15–21 repetem os dias 1–7
   - Cada exercício referencia o vídeo (slug) hospedado no CDN
     (window.APP_CONFIG.videosBase + '/' + video)
   ============================================================ */
(function () {
  'use strict';

  // Catálogo de exercícios únicos (14 vídeos + 1 sem vídeo)
  const EX = {
    miniagachamento: {
      name: 'Miniagachamento na parede',
      focus: 'Coxas e glúteos',
      video: 'miniagachamento-na-parede.mp4',
      dur: '1 min', reps: '10–12 repetições'
    },
    calcanhares: {
      name: 'Elevação de calcanhares',
      focus: 'Panturrilhas e tornozelos',
      video: 'elevacao-de-calcanhares.mp4',
      dur: '1 min', reps: '12–15 repetições'
    },
    elevacaoLateral: {
      name: 'Elevação lateral da perna',
      focus: 'Glúteos laterais e estabilidade do quadril',
      video: 'elevacao-lateral-da-perna.mp4',
      dur: '1 min', reps: '8–10 cada lado'
    },
    ponteCurta: {
      name: 'Ponte curta com pés na parede',
      focus: 'Glúteos, posteriores das coxas e abdômen',
      video: 'ponte-curta-com-pes-na-parede.mp4',
      dur: '1 min', reps: '10–12 repetições'
    },
    inclinacaoBacia: {
      name: 'Inclinação suave da bacia',
      focus: 'Abdômen e consciência da região lombopélvica',
      video: 'inclinacao-suave-da-bacia.mp4',
      dur: '1 min', reps: '8–10 repetições'
    },
    deslizamentoBracos: {
      name: 'Deslizamento de braços na parede',
      focus: 'Ombros, parte alta das costas e mobilidade',
      video: 'deslizamento-de-bracos-na-parede.mp4',
      dur: '1 min', reps: '8–10 repetições'
    },
    flexaoBracos: {
      name: 'Flexão de braços na parede',
      focus: 'Peito, tríceps e ombros',
      video: 'flexao-de-bracos-na-parede.mp4',
      dur: '1 min', reps: '8–12 repetições'
    },
    pranchaInclinada: {
      name: 'Prancha inclinada na parede',
      focus: 'Abdômen e estabilizadores dos ombros',
      video: 'prancha-inclinada-na-parede.mp4',
      dur: '45 seg', reps: 'Mantenha a posição'
    },
    deslizamentoPe: {
      name: 'Deslizamento do pé na parede',
      focus: 'Abdômen, quadris e controle da bacia',
      video: 'deslizamento-do-pe-na-parede.mp4',
      dur: '1 min', reps: '8–10 cada lado'
    },
    alcanceAlternado: {
      name: 'Alcance alternado dos braços',
      focus: 'Abdômen, ombros e estabilidade do tronco',
      video: 'alcance-alternado-dos-bracos.mp4',
      dur: '1 min', reps: '10 cada braço'
    },
    marcha: {
      name: 'Marcha com apoio na parede',
      focus: 'Quadris, pernas e coordenação',
      video: 'marcha-com-apoio-na-parede.mp4',
      dur: '1 min', reps: '20 passos no lugar'
    },
    extensaoQuadril: {
      name: 'Extensão de quadril em pé',
      focus: 'Glúteos e parte posterior das coxas',
      video: 'extensao-de-quadril-em-pe.mp4',
      dur: '1 min', reps: '10–12 cada lado'
    },
    alongPanturrilha: {
      name: 'Alongamento de panturrilha',
      focus: 'Panturrilhas e mobilidade dos tornozelos',
      video: 'alongamento-de-panturrilha.mp4',
      dur: '45 seg'
    },
    alongLateral: {
      name: 'Alongamento lateral com apoio',
      focus: 'Laterais do tronco e ombros',
      video: 'alongamento-lateral-com-apoio.mp4',
      dur: '45 seg'
    },
    alongPeitoral: {
      name: 'Alongamento de peitoral na parede',
      focus: 'Peito e parte anterior dos ombros',
      video: null,
      dur: '45 seg'
    }
  };

  // Igual em todos os dias (45 seg cada, sem contagem de repetições)
  const WARMUP = [
    { ...EX.marcha, dur: '45 seg', reps: undefined },
    { ...EX.deslizamentoBracos, dur: '45 seg', reps: undefined },
    { ...EX.alongPanturrilha },
    { ...EX.alongLateral }
  ];
  const COOLDOWN = [
    { ...EX.alongPeitoral },
    { ...EX.alongPanturrilha }
  ];

  function day(n, title, focus, difficulty, duration, intro, exercises) {
    return {
      day: n, title, focus, difficulty, duration, intro,
      warmup: WARMUP.map(e => ({ ...e })),
      exercises: exercises.map(e => ({ ...e })),
      cooldown: COOLDOWN.map(e => ({ ...e }))
    };
  }

  // Sequências dos dias 1–7 (reutilizadas nos dias 15–21)
  const SEQ = {
    1: [EX.miniagachamento, EX.calcanhares, EX.elevacaoLateral, EX.ponteCurta, EX.inclinacaoBacia],
    2: [EX.deslizamentoBracos, EX.flexaoBracos, EX.pranchaInclinada, EX.deslizamentoPe, EX.alcanceAlternado],
    3: [EX.marcha, EX.elevacaoLateral, EX.extensaoQuadril, EX.ponteCurta, EX.deslizamentoPe],
    4: [EX.marcha, EX.deslizamentoBracos, EX.alongLateral, EX.deslizamentoPe, EX.inclinacaoBacia],
    5: [EX.miniagachamento, EX.flexaoBracos, EX.calcanhares, EX.ponteCurta, EX.alcanceAlternado],
    6: [EX.marcha, EX.calcanhares, EX.elevacaoLateral, EX.pranchaInclinada, EX.inclinacaoBacia],
    7: [EX.marcha, EX.deslizamentoBracos, EX.alongLateral, EX.alongPanturrilha, EX.inclinacaoBacia]
  };

  const META = {
    1: { title: 'Base e Alinhamento',   focus: 'Pernas e glúteos',   intro: 'Primeiro passo: ative pernas e glúteos com movimentos suaves apoiados na parede.' },
    2: { title: 'Força Superior',       focus: 'Braços e abdômen',   intro: 'Peito, braços e abdômen entram em cena com o apoio seguro da parede.' },
    3: { title: 'Glúteos em Ação',      focus: 'Glúteos e quadril',  intro: 'Sequência focada em glúteos e estabilidade do quadril.' },
    4: { title: 'Controle e Mobilidade',focus: 'Corpo todo',         intro: 'Movimentos de controle e mobilidade para refinar a consciência corporal.' },
    5: { title: 'Força Total',          focus: 'Corpo todo',         intro: 'Pernas e braços juntos em uma sequência completa de força.' },
    6: { title: 'Estabilidade',         focus: 'Corpo todo',         intro: 'Equilíbrio e estabilidade: desafie o corpo com apoio da parede.' },
    7: { title: 'Fluxo Suave',          focus: 'Mobilidade',         intro: 'Feche a primeira semana com um fluxo leve de mobilidade e alongamento.' }
  };

  window.WORKOUTS = [
    // ---- Semana 1 ----
    day(1, META[1].title, META[1].focus, 'Iniciante', 10, META[1].intro, SEQ[1]),
    day(2, META[2].title, META[2].focus, 'Iniciante', 10, META[2].intro, SEQ[2]),
    day(3, META[3].title, META[3].focus, 'Iniciante', 10, META[3].intro, SEQ[3]),
    day(4, META[4].title, META[4].focus, 'Iniciante', 10, META[4].intro, SEQ[4]),
    day(5, META[5].title, META[5].focus, 'Iniciante', 10, META[5].intro, SEQ[5]),
    day(6, META[6].title, META[6].focus, 'Iniciante', 10, META[6].intro, SEQ[6]),
    day(7, META[7].title, META[7].focus, 'Iniciante', 9,  META[7].intro, SEQ[7]),

    // ---- Semana 2 (sequências próprias) ----
    day(8, 'Pernas de Aço', 'Pernas e glúteos', 'Intermediário', 10,
      'Semana 2: mais força para coxas, glúteos e panturrilhas.',
      [EX.miniagachamento, EX.extensaoQuadril, EX.calcanhares, EX.ponteCurta, EX.inclinacaoBacia]),
    day(9, 'Superiores II', 'Braços e abdômen', 'Intermediário', 10,
      'Braços, peito e abdômen com mais repetições e controle.',
      [EX.flexaoBracos, EX.deslizamentoBracos, EX.pranchaInclinada, EX.inclinacaoBacia, EX.alcanceAlternado]),
    day(10, 'Quadril Forte', 'Glúteos e quadril', 'Intermediário', 10,
      'Sequência intensa para glúteos e estabilidade do quadril.',
      [EX.elevacaoLateral, EX.extensaoQuadril, EX.marcha, EX.ponteCurta, EX.deslizamentoPe]),
    day(11, 'Ritmo e Respiração', 'Mobilidade', 'Intermediário', 10,
      'Um dia mais leve: ritmo, respiração e mobilidade consciente.',
      [EX.marcha, EX.alongPanturrilha, EX.deslizamentoBracos, EX.inclinacaoBacia, EX.alcanceAlternado]),
    day(12, 'Força e Controle', 'Corpo todo', 'Intermediário', 10,
      'Força e precisão: cada movimento conta.',
      [EX.miniagachamento, EX.flexaoBracos, EX.elevacaoLateral, EX.deslizamentoPe, EX.alcanceAlternado]),
    day(13, 'Resistência', 'Corpo todo', 'Intermediário', 10,
      'Resistência muscular do início ao fim.',
      [EX.calcanhares, EX.extensaoQuadril, EX.deslizamentoBracos, EX.pranchaInclinada, EX.deslizamentoPe]),
    day(14, 'Mobilidade Profunda', 'Mobilidade', 'Intermediário', 9,
      'Feche a segunda semana soltando tronco, ombros e peito.',
      [EX.marcha, EX.alongLateral, EX.alongPeitoral, EX.deslizamentoBracos, EX.alcanceAlternado]),

    // ---- Semana 3 (repete os dias 1–7) ----
    day(15, META[1].title, META[1].focus, 'Intermediário', 10, 'Semana 3: repita o treino do Dia 1 com mais controle e consciência.', SEQ[1]),
    day(16, META[2].title, META[2].focus, 'Intermediário', 10, 'Repita o treino do Dia 2 — perceba como você está mais forte.', SEQ[2]),
    day(17, META[3].title, META[3].focus, 'Intermediário', 10, 'Repita o treino do Dia 3 caprichando na execução.', SEQ[3]),
    day(18, META[4].title, META[4].focus, 'Intermediário', 10, 'Repita o treino do Dia 4 com movimentos mais amplos e precisos.', SEQ[4]),
    day(19, META[5].title, META[5].focus, 'Intermediário', 10, 'Repita o treino do Dia 5 — força total, ritmo seu.', SEQ[5]),
    day(20, META[6].title, META[6].focus, 'Intermediário', 10, 'Penúltimo dia! Repita o treino do Dia 6 com confiança.', SEQ[6]),
    day(21, META[7].title, META[7].focus, 'Intermediário', 9,  'Último dia! Celebre os 21 dias com um fluxo suave e orgulho do caminho.', SEQ[7])
  ];
})();
