/* =========================================================================
   SONS E VOZ
   - Sons curtos criados pelo próprio navegador (sem arquivos de áudio).
   - Voz em português do Brasil pela síntese de voz do navegador.
   - Tudo depende dos ajustes (Config, em nucleo.js): som desligado = silêncio.
   ========================================================================= */

const Sons = (function () {
  let ctx = null, mestre = null;
  let panAtual = 0;   // posição do som: -1 = esquerda, 0 = meio, 1 = direita (fones de ouvido)

  // Liga o som ao alto-falante, passando pela posição esquerda/direita quando houver.
  function saida(c, no, pan) {
    if (pan && c.createStereoPanner) {
      const p = c.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      no.connect(p); p.connect(mestre);
    } else no.connect(mestre);
  }

  function contexto() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
      mestre = ctx.createGain();
      mestre.gain.value = 0.5;
      mestre.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // Uma nota. No Modo Calmo, todas as notas ficam suaves (onda senoidal e volume baixo).
  function nota(freq, dur, op) {
    op = op || {};
    const c = contexto(); if (!c) return;
    const calmo = Config.get("modoCalmo");
    const t0 = c.currentTime + (op.atraso || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = calmo ? "sine" : (op.tipo || "sine");
    osc.frequency.setValueAtTime(freq, t0);
    if (op.ate) osc.frequency.linearRampToValueAtTime(op.ate, t0 + dur);
    const vol = (op.vol || 0.3) * (calmo ? 0.45 : 1);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); saida(c, g, op.pan !== undefined ? op.pan : panAtual);
    osc.start(t0); osc.stop(t0 + dur + 0.05);
  }

  function ruido(dur, op) {
    op = op || {};
    const c = contexto(); if (!c) return;
    const calmo = Config.get("modoCalmo");
    const t0 = c.currentTime + (op.atraso || 0);
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const filtro = c.createBiquadFilter(); filtro.type = "lowpass"; filtro.frequency.value = op.filtro || 800;
    const g = c.createGain();
    const vol = (op.vol || 0.3) * (calmo ? 0.4 : 1);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filtro); filtro.connect(g); saida(c, g, op.pan !== undefined ? op.pan : panAtual);
    src.start(t0);
  }

  // Duração aproximada de cada som (em segundos), para tocar em sequência.
  const DURACAO = { buzina: 0.5, sino: 0.7, roda: 0.5, esteira: 0.5, acerto: 0.6, pernas: 0.45, apito: 0.4, padrao: 0.45,
    festa_esteira: 1.4, festa_montagem: 1.4, festa_torre: 1.4, festa_padroes: 1.4, pecaNova: 1.1, proximo: 0.4 };

  const CATALOGO = {
    // Peças do robô
    cabeca:   function () { nota(260, 0.25, { ate: 520, tipo: "triangle" }); },
    corpo:    function () { nota(150, 0.3, { tipo: "triangle", vol: 0.4 }); },
    bracos:   function () { nota(700, 0.08, { tipo: "square", vol: 0.15 }); nota(950, 0.08, { tipo: "square", vol: 0.15, atraso: 0.1 }); },
    roda:     function () { for (let i = 0; i < 6; i++) nota(i % 2 ? 140 : 110, 0.08, { tipo: "triangle", vol: 0.35, atraso: i * 0.07 }); },   // "rola"
    antena:   function () { nota(1400, 0.12, { vol: 0.2 }); nota(1800, 0.12, { vol: 0.2, atraso: 0.14 }); },                                  // "apita"
    esteira:  function () { for (let i = 0; i < 3; i++) nota(300, 0.13, { ate: 430, tipo: "sawtooth", vol: 0.12, atraso: i * 0.15 }); },        // "range"
    pernas:   function () { nota(95, 0.14, { vol: 0.5 }); nota(95, 0.14, { vol: 0.5, atraso: 0.24 }); },                                       // "tum, tum"
    acessorio:function () { [1000, 1250, 1500].forEach(function (f, i) { nota(f, 0.12, { vol: 0.15, atraso: i * 0.08 }); }); },
    cor:      function () { nota(660, 0.2, { vol: 0.15 }); },
    // Sala dos Padrões (sons)
    bip:      function () { nota(880, 0.18, { tipo: "square", vol: 0.15 }); },
    buzina:   function () { nota(330, 0.45, { tipo: "sawtooth", vol: 0.14 }); nota(415, 0.45, { tipo: "sawtooth", vol: 0.1 }); },
    tambor:   function () { nota(90, 0.25, { ate: 50, vol: 0.6 }); ruido(0.12, { filtro: 1200, vol: 0.2 }); },
    sino:     function () { nota(1320, 0.7, { vol: 0.2 }); nota(2640, 0.4, { vol: 0.05 }); },
    apito:    function () { nota(2000, 0.35, { ate: 2500, vol: 0.12 }); },
    // Formas têm um som próprio também (para a versão sonora)
    circulo:  function () { nota(523, 0.3, { vol: 0.25 }); },
    quadrado: function () { nota(392, 0.3, { tipo: "square", vol: 0.1 }); },
    triangulo:function () { nota(784, 0.3, { tipo: "triangle", vol: 0.25 }); },
    estrela:  function () { nota(1047, 0.15, { vol: 0.15 }); nota(1319, 0.2, { vol: 0.15, atraso: 0.12 }); },
    losango:  function () { nota(587, 0.3, { tipo: "triangle", vol: 0.25 }); },
    numero:   function () { nota(600, 0.1, { vol: 0.12 }); },
    // Torre: quanto maior o disco, mais grave
    disco:    function (tamanho) { const f = { pequeno: 660, "médio": 494, grande: 370, gigante: 247 }[tamanho] || 440; nota(f, 0.3, { tipo: "triangle", vol: 0.3 }); },
    // Sinais do jogo
    acerto:   function () { [523, 659, 784].forEach(function (f, i) { nota(f, 0.2, { vol: 0.2, atraso: i * 0.12 }); }); },
    tenteDeNovo: function () { nota(440, 0.18, { vol: 0.15 }); nota(392, 0.25, { vol: 0.15, atraso: 0.18 }); },
    limite:   function () { nota(200, 0.08, { vol: 0.15 }); },
    clique:   function () { nota(520, 0.05, { vol: 0.1 }); },
    pegar:    function () { nota(500, 0.12, { ate: 700, vol: 0.15 }); },
    soltar:   function () { nota(700, 0.12, { ate: 450, vol: 0.15 }); },

    /* ----- Modo Áudio: um som diferente para cada opção, para reconhecer sem esperar a fala ----- */
    cab_redonda:    function () { nota(300, 0.3, { ate: 620, vol: 0.3 }); },                                                    // "blup" redondo
    cab_quadrada:   function () { nota(330, 0.09, { tipo: "square", vol: 0.12 }); nota(330, 0.09, { tipo: "square", vol: 0.12, atraso: 0.16 }); }, // "toc, toc"
    cab_triangular: function () { [880, 1175, 1568].forEach(function (f, i) { nota(f, 0.1, { tipo: "triangle", vol: 0.22, atraso: i * 0.08 }); }); }, // "tim-tim-tim"
    ant_0:          function () { nota(180, 0.2, { ate: 110, vol: 0.3 }); },                                                    // "puf" (nenhuma)
    ant_1:          function () { nota(1500, 0.14, { vol: 0.2 }); },                                                            // um apito
    ant_2:          function () { nota(1500, 0.12, { vol: 0.2 }); nota(1500, 0.12, { vol: 0.2, atraso: 0.18 }); },              // dois apitos
    pode:           function () { nota(660, 0.1, { vol: 0.2 }); nota(880, 0.14, { vol: 0.2, atraso: 0.09 }); },
    naoPode:        function () { nota(140, 0.16, { tipo: "triangle", vol: 0.35 }); },
    proximo:        function () { nota(300, 0.3, { ate: 900, vol: 0.12 }); ruido(0.25, { filtro: 2500, vol: 0.06 }); },
    pecaNova:       function () { [784, 988, 1175, 1568, 1976].forEach(function (f, i) { nota(f, 0.14, { vol: 0.16, atraso: i * 0.07 }); }); nota(1568, 0.6, { vol: 0.12, atraso: 0.4 }); nota(2093, 0.6, { vol: 0.08, atraso: 0.4 }); },
    // Sinal de cada sala no menu
    salaEsteira:    function () { nota(90, 0.4, { tipo: "sawtooth", vol: 0.1, pan: -0.8 }); nota(90, 0.4, { tipo: "sawtooth", vol: 0.1, pan: 0.8, atraso: 0.25 }); },
    salaMontagem:   function () { nota(700, 0.07, { tipo: "square", vol: 0.12 }); nota(950, 0.07, { tipo: "square", vol: 0.12, atraso: 0.1 }); nota(1200, 0.1, { tipo: "square", vol: 0.1, atraso: 0.2 }); },
    salaTorre:      function () { [247, 370, 660].forEach(function (f, i) { nota(f, 0.18, { tipo: "triangle", vol: 0.28, atraso: i * 0.15 }); }); },
    salaPadroes:    function () { nota(880, 0.12, { tipo: "square", vol: 0.12 }); nota(330, 0.25, { tipo: "sawtooth", vol: 0.1, atraso: 0.18 }); nota(880, 0.12, { tipo: "square", vol: 0.12, atraso: 0.5 }); },
    // Comemoração diferente para cada sala
    festa_esteira:  function () { for (let i = 0; i < 6; i++) nota(400 + i * 120, 0.12, { vol: 0.16, pan: -1 + i * 0.4, atraso: i * 0.1 }); nota(1047, 0.5, { vol: 0.15, atraso: 0.65 }); },
    festa_montagem: function () { [0, 0.15, 0.3].forEach(function (t) { nota(800, 0.06, { tipo: "square", vol: 0.1, atraso: t }); }); [523, 659, 784, 1047].forEach(function (f, i) { nota(f, 0.25, { vol: 0.17, atraso: 0.5 + i * 0.12 }); }); },
    festa_torre:    function () { [262, 330, 392, 523, 659, 784].forEach(function (f, i) { nota(f, 0.18, { tipo: "triangle", vol: 0.22, atraso: i * 0.12 }); }); },
    festa_padroes:  function () { nota(880, 0.12, { tipo: "square", vol: 0.12 }); nota(440, 0.12, { tipo: "square", vol: 0.12, atraso: 0.18 }); nota(880, 0.12, { tipo: "square", vol: 0.12, atraso: 0.36 }); nota(440, 0.12, { tipo: "square", vol: 0.12, atraso: 0.54 }); [784, 1047].forEach(function (f, i) { nota(f, 0.35, { vol: 0.16, atraso: 0.8 + i * 0.18 }); }); }
  };

  function tocar(nome, arg, pan) {
    if (!Config.efeitosLigados()) return;
    const f = CATALOGO[nome]; if (!f) return;
    panAtual = pan || 0;
    try { f(arg); } catch (e) { /* sem som neste computador */ }
    panAtual = 0;
  }

  /* Esteira Rápida: um motor que "entra" pela esquerda e "sai" pela direita em durMs. */
  function passar(durMs) {
    const nada = { parar: function () {} };
    if (!Config.efeitosLigados()) return nada;
    const c = contexto(); if (!c) return nada;
    try {
      const t0 = c.currentTime, dur = durMs / 1000;
      const osc = c.createOscillator(); osc.type = "sawtooth"; osc.frequency.value = 70;
      const filtro = c.createBiquadFilter(); filtro.type = "lowpass"; filtro.frequency.value = 320;
      const g = c.createGain();
      const vol = Config.get("modoCalmo") ? 0.06 : 0.12;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(vol, t0 + 0.4);
      g.gain.setValueAtTime(vol, Math.max(t0 + 0.4, t0 + dur - 0.5));
      g.gain.linearRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(filtro); filtro.connect(g);
      if (c.createStereoPanner) {
        const p = c.createStereoPanner();
        p.pan.setValueAtTime(-1, t0); p.pan.linearRampToValueAtTime(1, t0 + dur);
        g.connect(p); p.connect(mestre);
      } else g.connect(mestre);
      osc.start(t0); osc.stop(t0 + dur + 0.05);
      return {
        parar: function () {
          try { const t = c.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0.0001, t + 0.1); osc.stop(t + 0.15); } catch (e) { /* já parou */ }
        }
      };
    } catch (e) { return nada; }
  }

  function duracao(nome) { return (DURACAO[nome] || 0.35) * 1000; }

  // Destrava o áudio no primeiro toque ou tecla (exigência dos navegadores).
  function destravar() { if (Config.somLigado()) contexto(); }

  return { tocar: tocar, passar: passar, duracao: duracao, destravar: destravar, existe: function (n) { return !!CATALOGO[n]; } };
})();


const Voz = (function () {
  const temVoz = "speechSynthesis" in window;
  let vozPt = null, ultima = "", fila = 0, jaFalou = false;
  // Com uma janela aberta, o resto da página fica inativo para o leitor de tela:
  // por isso o aviso vai para a região de aviso da própria janela.
  const anuncio = function () {
    const dlg = document.querySelector("dialog[open]");
    return (dlg && dlg.querySelector(".anuncio-janela")) || document.getElementById("anuncio");
  };

  function escolherVoz() {
    if (!temVoz) return;
    const vs = speechSynthesis.getVoices();
    vozPt = vs.find(function (v) { return /pt[-_]BR/i.test(v.lang); }) ||
            vs.find(function (v) { return /^pt/i.test(v.lang); }) || null;
  }
  if (temVoz) {
    escolherVoz();
    speechSynthesis.onvoiceschanged = escolherVoz;
  }

  function esperar(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }
  const VELOCIDADES = { normal: 1, rapida: 1.3, maisRapida: 1.6 };

  // Fala um texto e espera terminar (com um limite de tempo, por segurança).
  function dizer(texto, id, forcar) {
    return new Promise(function (ok) {
      const pode = forcar ? Config.get("vozPropria") : Config.vozLigada();
      if (!temVoz || !pode || id !== fila) { ok(); return; }
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR";
      if (vozPt) u.voice = vozPt;
      // No Modo Áudio, a velocidade é escolhida na Área do professor; fora dele, fica como sempre foi.
      u.rate = Config.get("modoAudio") ? (VELOCIDADES[Config.get("velocidadeVoz")] || 1) : (Config.get("modoCalmo") ? 0.9 : 0.95);
      let feito = false;
      function fim() { if (!feito) { feito = true; ok(); } }
      u.onstart = function () { jaFalou = true; };
      u.onend = fim; u.onerror = fim;
      setTimeout(fim, 2500 + texto.length * 110);
      speechSynthesis.speak(u);
    });
  }

  function parar() {
    fila++;
    if (temVoz) speechSynthesis.cancel();
  }

  // Escreve na região "aria-live" (para o NVDA e o Narrador).
  function escreverAnuncio(texto) {
    const a = anuncio(); if (!a) return;
    a.textContent = "";
    setTimeout(function () { a.textContent = texto; }, 60);
  }

  /* Sequência de passos: [{som: "roda"}, {texto: "Rodas"}, ...]
     opcoes.anunciar = false: não escreve na região aria-live (usado no foco,
     que o leitor de tela já lê sozinho). */
  function sequencia(passos, opcoes) {
    opcoes = opcoes || {};
    parar();
    const id = fila;
    const texto = passos.filter(function (p) { return p.texto; }).map(function (p) { return p.texto; }).join(" ");
    if (texto) ultima = texto;
    if (texto && opcoes.anunciar !== false) escreverAnuncio(texto);
    const falarAgora = Config.vozLigada();
    return (async function () {
      await esperar(40);
      for (const p of passos) {
        if (id !== fila) return;
        if (p.som) {
          if (p.som !== "nada") Sons.tocar(p.som, p.arg, p.pan);
          if (typeof p.aoTocar === "function") p.aoTocar();
          await esperar(p.pausa !== undefined ? p.pausa : Sons.duracao(p.som) + 120);
        }
        if (p.texto && falarAgora) await dizer(p.texto, id);
        if (p.espera) await esperar(p.espera);
      }
    })();
  }

  // Anúncio: aparece para o leitor de tela e é falado pela voz do jogo (se ligada).
  function anunciar(texto, som) {
    return sequencia(som ? [{ som: som, pausa: 350 }, { texto: texto }] : [{ texto: texto }]);
  }

  // Fala do foco (só no Modo Áudio, só pela voz própria do jogo).
  function falarFoco(texto, som, arg, pan) {
    if (!Config.get("modoAudio")) { if (som) Sons.tocar(som, arg, pan); return; }
    ultima = texto;
    sequencia(som ? [{ som: som, arg: arg, pan: pan, pausa: 300 }, { texto: texto }] : [{ texto: texto }], { anunciar: false });
  }

  function repetir() {
    if (!ultima) return;
    sequencia([{ texto: ultima }], { anunciar: true });
  }

  return {
    anunciar: anunciar, falarFoco: falarFoco, sequencia: sequencia, repetir: repetir, parar: parar,
    disponivel: function () { return temVoz; },
    // Fala sem escrever no aria-live (usado no aviso de abertura).
    dizerSolto: function (texto, forcar) { parar(); ultima = texto; return dizer(texto, fila, forcar); },
    jaFalou: function () { return jaFalou || !temVoz || !Config.get("vozPropria"); }
  };
})();
