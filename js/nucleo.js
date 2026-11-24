/* =========================================================================
   NÚCLEO DO JOGO: ajustes, progresso, telas, teclado, janelas e Robô Campeão.
   ========================================================================= */

/* ---------- Guardar no navegador (só neste computador) ---------- */
const Guardar = {
  ler: function (chave) { try { return JSON.parse(localStorage.getItem(chave)); } catch (e) { return null; } },
  gravar: function (chave, valor) { try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) { /* sem armazenamento */ } },
  apagar: function (chave) { try { localStorage.removeItem(chave); } catch (e) { /* nada */ } }
};

/* ---------- Ajustes ---------- */
const Config = (function () {
  const CHAVE = "fabricaDoRobo.ajustes";
  const PADRAO = {
    modoAudio: false,     // jogo todo pelo teclado, com fala e sons
    vozPropria: true,     // a voz do próprio jogo (desligue se usar NVDA ou Narrador)
    som: false,           // sons e voz fora do Modo Áudio (começa desligado)
    modoCalmo: false,
    semAnimacoes: false,
    letrasGrandes: false,
    altoContraste: false,
    velocidadeVoz: "normal",   // só no Modo Áudio: normal, rapida ou maisRapida
    ano: 1
  };
  let dados = Object.assign({}, PADRAO, Guardar.ler(CHAVE) || {});
  const ouvintes = [];

  function aplicar() {
    const b = document.body.classList;
    b.toggle("modo-audio", dados.modoAudio);
    b.toggle("calmo", dados.modoCalmo);
    b.toggle("sem-animacoes", dados.semAnimacoes);
    b.toggle("letras-grandes", dados.letrasGrandes);
    b.toggle("contraste", dados.altoContraste);
    b.toggle("com-som", somLigado());
    // No Modo Áudio, o NVDA e o Narrador passam as setas direto para o jogo.
    const main = document.getElementById("tela");
    if (main) {
      if (dados.modoAudio) { main.setAttribute("role", "application"); main.setAttribute("aria-label", "Fábrica do Robô"); }
      else { main.removeAttribute("role"); main.removeAttribute("aria-label"); }
    }
    ouvintes.forEach(function (f) { f(); });
  }
  function somLigado() { return dados.modoAudio || dados.som; }

  return {
    get: function (k) { return dados[k]; },
    set: function (k, v) { dados[k] = v; Guardar.gravar(CHAVE, dados); aplicar(); },
    somLigado: somLigado,
    vozLigada: function () { return dados.vozPropria && somLigado(); },
    aplicar: aplicar,
    aoMudar: function (f) { ouvintes.push(f); }
  };
})();

/* ---------- Progresso (estrelas de cada desafio) ---------- */
const Progresso = (function () {
  const CHAVE = "fabricaDoRobo.progresso";
  let dados = Object.assign({ estrelas: {}, liberarTudo: false }, Guardar.ler(CHAVE) || {});
  function salvar() { Guardar.gravar(CHAVE, dados); }
  function chave(sala, ano, i) { return sala + "-" + ano + "-" + i; }
  function concluidos() { return Object.keys(dados.estrelas).filter(function (k) { return dados.estrelas[k] > 0; }).length; }
  return {
    estrelas: function (sala, ano, i) { return dados.estrelas[chave(sala, ano, i)] || 0; },
    // Devolve true se ganhou uma peça nova do Robô Campeão.
    registrar: function (sala, ano, i, n) {
      const k = chave(sala, ano, i);
      const antes = concluidos();
      dados.estrelas[k] = Math.max(dados.estrelas[k] || 0, n);
      salvar();
      return concluidos() > antes && concluidos() <= Campeao.PECAS.length;
    },
    liberado: function (sala, ano, i) {
      return dados.liberarTudo || i === 0 || (dados.estrelas[chave(sala, ano, i - 1)] || 0) > 0;
    },
    concluidos: concluidos,
    liberarTudo: function (v) { if (v !== undefined) { dados.liberarTudo = v; salvar(); } return dados.liberarTudo; },
    apagar: function () {
      dados = { estrelas: {}, liberarTudo: false }; salvar();
      if (typeof ModoAudio !== "undefined") ModoAudio.apagar();
    }
  };
})();

/* ---------- Pictogramas (desenhos simples usados nas instruções) ---------- */
const ICONES = (function () {
  function svg(c) { return '<svg class="icone" viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">' + c + "</svg>"; }
  return {
    ouvir: svg('<path d="M8 19h8l10-8v26l-10-8H8z" fill="currentColor"/><path d="M32 17a10 10 0 0 1 0 14M36 12a16 16 0 0 1 0 24"/>'),
    mudo: svg('<path d="M8 19h8l10-8v26l-10-8H8z" fill="currentColor"/><path d="M33 19l10 10M43 19L33 29"/>'),
    olhar: svg('<path d="M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24z"/><circle cx="24" cy="24" r="5" fill="currentColor"/>'),
    mao: svg('<path d="M18 26V10a3 3 0 0 1 6 0v12M24 20a3 3 0 0 1 6 0v4M30 22a3 3 0 0 1 6 0v6c0 8-5 14-12 14s-11-4-13-9l-3-7a3 3 0 0 1 5-3l3 4"/>'),
    certo: svg('<circle cx="24" cy="24" r="19"/><path d="M15 25l6 6 12-13"/>'),
    estrela: svg('<path d="M24 5l5.6 12 13 1.4-9.8 8.8 2.8 12.8L24 33.4 12.4 40l2.8-12.8-9.8-8.8 13-1.4z" fill="currentColor"/>'),
    torre: svg('<path d="M24 8v32M8 40h32"/><rect x="16" y="32" width="16" height="6" rx="2" fill="currentColor"/><rect x="19" y="25" width="10" height="6" rx="2" fill="currentColor"/>'),
    padrao: svg('<circle cx="9" cy="24" r="5" fill="currentColor"/><rect x="19" y="19" width="10" height="10" fill="currentColor"/><circle cx="39" cy="24" r="5"/>'),
    pausa: svg('<rect x="13" y="10" width="7" height="28" rx="2" fill="currentColor"/><rect x="28" y="10" width="7" height="28" rx="2" fill="currentColor"/>'),
    casa: svg('<path d="M6 24L24 8l18 16M11 20v20h26V20"/><path d="M20 40V29h8v11"/>'),
    ajuda: svg('<circle cx="24" cy="24" r="19"/><path d="M18 19a6 6 0 1 1 8 5.6c-1.3.5-2 1.6-2 3V30"/><circle cx="24" cy="36" r="1.5" fill="currentColor"/>'),
    lupa: svg('<circle cx="20" cy="20" r="12"/><path d="M29 29l12 12"/>'),
    lapis: svg('<path d="M10 38l4-12L32 8l8 8-18 18z"/><path d="M28 12l8 8"/>'),
    robo: svg('<rect x="12" y="16" width="24" height="18" rx="4"/><path d="M24 16v-6"/><circle cx="24" cy="8" r="2.5" fill="currentColor"/><circle cx="19" cy="24" r="2" fill="currentColor"/><circle cx="29" cy="24" r="2" fill="currentColor"/><path d="M16 34v6M32 34v6"/>'),
    recomecar: svg('<path d="M10 24a14 14 0 1 0 4-10"/><path d="M8 8v8h8"/>'),
    seta: svg('<path d="M8 24h30M28 14l10 10-10 10"/>'),
    lista: svg('<path d="M16 12h24M16 24h24M16 36h24"/><circle cx="8" cy="12" r="2" fill="currentColor"/><circle cx="8" cy="24" r="2" fill="currentColor"/><circle cx="8" cy="36" r="2" fill="currentColor"/>'),
    calmo: svg('<path d="M30 8a16 16 0 1 0 10 26A14 14 0 0 1 30 8z" fill="currentColor"/>'),
    ajustes: svg('<circle cx="24" cy="24" r="6"/><path d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M10 38l4-4M34 14l4-4"/>'),
    engrenagem: svg('<circle cx="24" cy="24" r="7"/><path d="M24 5v7M24 36v7M5 24h7M36 24h7M10.5 10.5l5 5M32.5 32.5l5 5M10.5 37.5l5-5M32.5 15.5l5-5"/>')
  };
})();

/* ---------- Robô Campeão: cada desafio concluído dá uma peça ---------- */
const Campeao = (function () {
  const PECAS = [
    { id: "pes",     nome: "botas de foguete" },
    { id: "corpo",   nome: "corpo dourado" },
    { id: "painel",  nome: "painel de luzes" },
    { id: "cinto",   nome: "cinto de engrenagens" },
    { id: "bracoE",  nome: "braço de mola esquerdo" },
    { id: "bracoD",  nome: "braço de mola direito" },
    { id: "cabeca",  nome: "cabeça de campeão" },
    { id: "olhos",   nome: "olhos de estrela" },
    { id: "sorriso", nome: "sorriso" },
    { id: "antena",  nome: "antena de raio" },
    { id: "capa",    nome: "capa de herói" },
    { id: "coroa",   nome: "coroa" }
  ];
  const T = 'stroke="#2d3748" stroke-width="3" stroke-linejoin="round"';
  const DESENHO = {
    capa:    '<path d="M62 118 L36 236 L164 236 L138 118 Z" class="cc-capa" ' + T + "/>",
    pes:     '<rect x="76" y="212" width="14" height="16" class="cc-metal" ' + T + '/><rect x="110" y="212" width="14" height="16" class="cc-metal" ' + T + '/><rect x="64" y="226" width="34" height="20" rx="6" class="cc-bota" ' + T + '/><rect x="102" y="226" width="34" height="20" rx="6" class="cc-bota" ' + T + "/>",
    bracoE:  '<path d="M60 132 l-10 8 l10 8 l-10 8 l10 8 l-10 8" fill="none" ' + T + '/><circle cx="46" cy="178" r="10" class="cc-metal" ' + T + "/>",
    bracoD:  '<path d="M140 132 l10 8 l-10 8 l10 8 l-10 8 l10 8" fill="none" ' + T + '/><circle cx="154" cy="178" r="10" class="cc-metal" ' + T + "/>",
    corpo:   '<rect x="60" y="118" width="80" height="96" rx="14" class="cc-ouro" ' + T + "/>",
    painel:  '<rect x="80" y="134" width="40" height="28" rx="4" class="cc-tela" ' + T + '/><circle cx="90" cy="148" r="4" class="cc-luz1"/><circle cx="100" cy="148" r="4" class="cc-luz2"/><circle cx="110" cy="148" r="4" class="cc-luz3"/>',
    cinto:   '<rect x="60" y="184" width="80" height="12" class="cc-metal" ' + T + '/><circle cx="100" cy="190" r="9" class="cc-ouro" ' + T + "/>",
    cabeca:  '<rect x="64" y="48" width="72" height="64" rx="16" class="cc-ouro" ' + T + '/><rect x="92" y="110" width="16" height="10" class="cc-metal" ' + T + "/>",
    olhos:   '<path d="M86 68 l3 6 6 1 -4.5 4 1 6 -5.5-3 -5.5 3 1-6 -4.5-4 6-1z" class="cc-estrela" ' + T + '/><path d="M114 68 l3 6 6 1 -4.5 4 1 6 -5.5-3 -5.5 3 1-6 -4.5-4 6-1z" class="cc-estrela" ' + T + "/>",
    sorriso: '<path d="M84 94 Q100 108 116 94" fill="none" stroke="#2d3748" stroke-width="4" stroke-linecap="round"/>',
    antena:  '<path d="M124 50 L140 24" fill="none" ' + T + '/><path d="M140 10 L132 26 L140 26 L134 40 L150 20 L142 20 L148 10 Z" class="cc-estrela" ' + T + "/>",
    coroa:   '<path d="M74 50 L74 26 L87 38 L100 20 L113 38 L126 26 L126 50 Z" class="cc-estrela" ' + T + "/>"
  };
  const ORDEM = ["capa", "pes", "bracoE", "bracoD", "corpo", "painel", "cinto", "cabeca", "olhos", "sorriso", "antena", "coroa"];

  function quantas() { return Math.min(Progresso.concluidos(), PECAS.length); }
  function tem(id, n) { return PECAS.findIndex(function (p) { return p.id === id; }) < n; }

  function desenhar(n, destaque) {
    if (n === undefined) n = quantas();
    let s = "";
    ORDEM.forEach(function (id) {
      const ja = tem(id, n);
      const cls = ja ? (destaque === id ? "cc-nova" : "") : "cc-fantasma";
      s += '<g class="' + cls + '">' + DESENHO[id] + "</g>";
    });
    return '<svg class="campeao-svg" viewBox="0 0 200 250" aria-hidden="true" focusable="false">' + s + "</svg>";
  }

  function descrever(n) {
    if (n === undefined) n = quantas();
    if (n === 0) return "O Robô Campeão ainda não tem peças. Termine um desafio para ganhar a primeira peça.";
    const tem = PECAS.slice(0, n).map(function (p) { return p.nome; });
    if (n >= PECAS.length) return "O Robô Campeão está completo! Ele tem " + Robo.juntar(tem) + ".";
    return "O Robô Campeão tem " + n + " de " + PECAS.length + " peças: " + Robo.juntar(tem) + ".";
  }

  return { PECAS: PECAS, quantas: quantas, desenhar: desenhar, descrever: descrever };
})();

/* ---------- Pequenas ajudas ---------- */
function el(tag, atributos, conteudo) {
  const e = document.createElement(tag);
  if (atributos) Object.keys(atributos).forEach(function (k) {
    if (k === "class") e.className = atributos[k];
    else if (k === "html") e.innerHTML = atributos[k];
    else if (k === "texto") e.textContent = atributos[k];
    else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), atributos[k]);
    else if (atributos[k] !== null && atributos[k] !== undefined && atributos[k] !== false) e.setAttribute(k, atributos[k]);
  });
  if (conteudo) (Array.isArray(conteudo) ? conteudo : [conteudo]).forEach(function (c) { if (c) e.append(c); });
  return e;
}
function estrelasHTML(n, total) {
  total = total || 3;
  let s = '<span class="estrelas" aria-hidden="true">';
  for (let i = 0; i < total; i++) s += i < n ? '<span class="cheia">★</span>' : '<span class="vazia">☆</span>';
  return s + "</span>";
}
function estrelasTexto(n) { return n === 0 ? "sem estrelas ainda" : n === 1 ? "1 estrela" : n + " estrelas"; }
function embaralhar(lista) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
const ANOS = { 1: "1º ano", 2: "2º ano", 3: "3º ano" };

/* Mensagens: no Modo Calmo, frases literais e sempre iguais. */
const Msg = {
  quase: function () { return Config.get("modoCalmo") ? "Vamos tentar de novo." : "Quase!"; },
  parabens: function () { return Config.get("modoCalmo") ? "Você terminou o desafio." : embaralhar(["Muito bem!", "Você conseguiu!", "Parabéns!", "Excelente!"])[0]; }
};

/* =========================================================================
   APP: telas, teclado e janelas
   ========================================================================= */
const Salas = {};   // preenchido pelos arquivos sala-*.js

const App = (function () {
  let tela = null;
  let focoSilencioso = false;
  const $ = function (id) { return document.getElementById(id); };

  /* ----- Telas ----- */
  function abrir(def) {
    Voz.parar();
    if (tela && tela.sair) tela.sair();   // ex.: para a Esteira Rápida ao trocar de tela
    tela = def;
    const main = $("tela");
    main.innerHTML = "";
    const h1 = el("h1", { id: "titulo", tabindex: "-1", texto: def.titulo });
    main.append(h1);
    if (def.passos && def.passos.length) {
      const ol = el("ol", { class: "passos", "aria-label": "Passos" });
      def.passos.forEach(function (p) {
        ol.append(el("li", { html: (ICONES[p.icone] || "") + "<span>" + p.texto + "</span>" }));
      });
      main.append(ol);
    }
    const conteudo = el("div", { class: "conteudo" });
    main.append(conteudo);
    def.montar(conteudo);
    document.title = def.titulo + " – Fábrica do Robô";
    $("btn-inicio").hidden = def.id === "inicio" || def.id === "inicio-audio";
    progresso(def.progresso);
    // Foco: no Modo Áudio vai direto ao primeiro item; senão, ao título (o leitor de tela lê o título).
    const alvo = def.foco ? (typeof def.foco === "function" ? def.foco() : main.querySelector(def.foco)) : null;
    if (Config.get("modoAudio")) focar(alvo || primeiroItem(main) || h1, true);
    else focar(h1, true);
    if (def.fala) setTimeout(function () { if (tela === def) Voz.anunciar(def.fala); }, 80);
  }

  function progresso(p) {
    const caixa = $("progresso");
    if (!p) { caixa.hidden = true; return; }
    caixa.hidden = false;
    const pct = p.total ? Math.round(100 * p.atual / p.total) : 0;
    caixa.querySelector(".barra-cheia").style.width = pct + "%";
    caixa.querySelector(".progresso-texto").textContent = p.texto;
    caixa.setAttribute("aria-valuenow", p.atual);
    caixa.setAttribute("aria-valuemax", p.total);
    caixa.setAttribute("aria-valuetext", p.texto);
  }

  function focar(alvo, silencioso) {
    if (!alvo) return;
    focoSilencioso = !!silencioso;
    alvo.focus({ preventScroll: false });
    focoSilencioso = false;
  }

  /* ----- Navegação pelas setas, dentro do grupo ([data-grupo]) ----- */
  function visivel(e) { return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length); }
  function itens(grupo) {
    return Array.prototype.filter.call(
      grupo.querySelectorAll("button, [data-nav], input, select, summary"),
      function (e) { return !e.disabled && !e.hasAttribute("data-sem-seta") && e.closest("[data-grupo]") === grupo && visivel(e); }
    );
  }
  function primeiroItem(raiz) {
    const g = raiz.matches("[data-grupo]") ? raiz : raiz.querySelector("[data-grupo]");
    return g ? itens(g)[0] : null;
  }
  function navegar(passo) {
    const dlg = document.querySelector("dialog[open]");
    const raiz = dlg || $("tela");
    let atual = document.activeElement;
    let grupo = atual && raiz.contains(atual) ? atual.closest("[data-grupo]") : null;
    if (!grupo || !raiz.contains(grupo)) {
      // Fora de um grupo: vai para o primeiro item da tela (ou da janela aberta).
      const p = primeiroItem(raiz);
      if (p) focar(p); else Sons.tocar("limite");
      return;
    }
    const lista = itens(grupo);
    let i = lista.indexOf(atual);
    if (i < 0) { if (lista[0]) focar(lista[0]); return; }
    const j = i + passo;
    if (j < 0 || j >= lista.length) {
      Sons.tocar("limite");   // só o som, sem palavras
      return;
    }
    focar(lista[j]);
  }

  // Texto falado quando um item recebe o foco (Modo Áudio).
  function rotulo(e) {
    let t = e.getAttribute("data-fala") || e.getAttribute("aria-label") || e.textContent || "";
    t = t.replace(/\s+/g, " ").trim();
    if (!e.hasAttribute("data-fala")) {
      if (e.getAttribute("aria-pressed") === "true") t += ", escolhido";
      if (e.getAttribute("aria-disabled") === "true") t += ", trancado";
    }
    return t;
  }

  document.addEventListener("focusin", function (ev) {
    const e = ev.target;
    if (focoSilencioso || !e || e === document.body || e.id === "titulo") return;
    if (!e.matches("button, [data-nav], input, select, summary")) return;
    const pan = e.hasAttribute("data-pan") ? Number(e.getAttribute("data-pan")) : undefined;
    Voz.falarFoco(rotulo(e), e.getAttribute("data-som") || null, e.getAttribute("data-som-arg") || undefined, pan);
  });

  /* ----- Teclado ----- */
  let primeiraTecla = true;
  document.addEventListener("keydown", function (e) {
    Sons.destravar();
    if (e.key === "F1") { e.preventDefault(); alternarModoAudio(); primeiraTecla = false; return; }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    // Se o navegador não deixou falar o aviso na abertura, fala agora, na primeira tecla.
    if (primeiraTecla) {
      primeiraTecla = false;
      if (!Voz.jaFalou() && e.key !== "Tab") {
        e.preventDefault();
        if (Config.get("modoAudio")) Voz.repetir();
        else Voz.dizerSolto(AVISO_ABERTURA, true);
        return;
      }
    }
    // Modo Áudio: qualquer tecla de navegação corta a fala em andamento.
    if (Config.get("modoAudio") && /^(Arrow|Enter$|Escape$|Tab$|Home$|End$| $|[0-9]$)/.test(e.key)) Voz.parar();
    const dlg = document.querySelector("dialog[open]");
    const digitando = e.target.matches && e.target.matches("input, select, textarea");
    const k = e.key;

    if (digitando) return;
    if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); navegar(1); return; }
    if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); navegar(-1); return; }
    if (k === " " && Config.get("modoAudio")) { e.preventDefault(); Voz.repetir(); return; }
    if (dlg) return;   // Esc fecha a janela (o navegador faz isso sozinho)
    if (k === "Escape") { e.preventDefault(); if (tela && tela.voltar) tela.voltar(); return; }
    if (k === "h" || k === "H") { e.preventDefault(); ajudaFalada(); return; }
    if (tela && tela.tecla && tela.tecla(e)) e.preventDefault();
  });

  document.addEventListener("pointerdown", function () { Sons.destravar(); primeiraTecla = false; }, { once: true });

  function ajudaFalada() {
    if (Config.get("modoAudio")) {
      // Frases curtas, uma de cada vez.
      const a = tela && tela.ajuda ? (Array.isArray(tela.ajuda) ? tela.ajuda : [tela.ajuda]) : ["Setas: escolher.", "Enter: confirmar."];
      Voz.sequencia(a.concat(["Esc: voltar.", "Espaço: repetir."]).map(function (t) { return { texto: t }; }));
      return;
    }
    const geral = " Teclas: setas para escolher, Enter para confirmar, Esc para voltar, barra de espaço para repetir, F1 liga e desliga o Modo Áudio.";
    Voz.anunciar((tela && tela.ajuda ? tela.ajuda : "Use as setas para escolher e Enter para confirmar.") + geral);
  }

  function alternarModoAudio() {
    const ligar = !Config.get("modoAudio");
    Config.set("modoAudio", ligar);
    Voz.parar();
    const dlg = document.querySelector("dialog[open]");
    if (dlg && dlg.id !== "dlg-professor" && dlg.id !== "dlg-ajustes") dlg.close();
    if (ligar) {
      Sons.destravar();
      // O Modo Áudio tem o seu próprio menu simples (ver modo-audio.js).
      if (!dlg || (dlg.id !== "dlg-professor" && dlg.id !== "dlg-ajustes")) telaInicio({ ligou: true });
    } else {
      if (!dlg || (dlg.id !== "dlg-professor" && dlg.id !== "dlg-ajustes")) telaInicio();
      const a = document.getElementById("anuncio"); a.textContent = "";
      setTimeout(function () { a.textContent = "Modo Áudio desligado."; }, 60);
    }
  }

  /* ----- Janelas (dialog) ----- */
  let antesDaJanela = null;
  function abrirJanela(dlg, foco) {
    Voz.parar();
    antesDaJanela = document.activeElement;
    if (!dlg.open) dlg.showModal();
    const alvo = foco || primeiroItem(dlg);
    if (alvo) focar(alvo, true);
  }
  document.addEventListener("close", function (ev) {
    if (ev.target.tagName !== "DIALOG") return;
    Voz.parar();
    if ((ev.target.id === "dlg-professor" || ev.target.id === "dlg-ajustes") && tela && tela.recarregar) { tela.recarregar(); return; }
    if (antesDaJanela && document.contains(antesDaJanela)) focar(antesDaJanela, true);
    else focar($("titulo"), true);
  }, true);

  return {
    abrir: abrir, focar: focar, itens: itens, primeiroItem: primeiroItem, abrirJanela: abrirJanela,
    alternarModoAudio: alternarModoAudio, tela: function () { return tela; }, ajudaFalada: ajudaFalada
  };
})();

const AVISO_ABERTURA = "Para jogar com som, aperte F1.";

/* =========================================================================
   COMO JOGAR (instruções ilustradas, em passos numerados)
   ========================================================================= */
const COMO_JOGAR = {
  inicio: {
    titulo: "Como jogar",
    passos: [
      { icone: "lista", texto: "Escolha o seu ano: 1º, 2º ou 3º ano." },
      { icone: "mao", texto: "Escolha uma sala: Linha de Montagem, Sala da Torre ou Sala dos Padrões." },
      { icone: "estrela", texto: "Cada desafio vale até 3 estrelas. Se errar, você ganha uma dica e tenta de novo." },
      { icone: "robo", texto: "Cada desafio terminado dá uma peça para o Robô Campeão." }
    ]
  }
};

function abrirComoJogar() {
  const t = App.tela();
  const chave = t && t.comoJogar ? t.comoJogar : "inicio";
  const info = COMO_JOGAR[chave] || COMO_JOGAR.inicio;
  const dlg = document.getElementById("dlg-como");
  const corpo = dlg.querySelector(".janela-corpo");
  corpo.innerHTML = "";
  corpo.append(el("h2", { id: "dlg-como-titulo", texto: info.titulo }));
  const ol = el("ol", { class: "passos passos-grandes" });
  info.passos.forEach(function (p) {
    ol.append(el("li", { html: (p.desenho || ICONES[p.icone] || "") + "<span>" + p.texto + "</span>" }));
  });
  corpo.append(ol);
  const teclas = el("details", { class: "teclas" });
  teclas.append(el("summary", { texto: "Teclas para jogar só com o teclado" }));
  teclas.append(el("p", { texto: "Setas: escolher. Enter: confirmar. Esc: voltar. Barra de espaço: repetir a última fala (no Modo Áudio). H: ajuda falada. F1: liga e desliga o Modo Áudio." + (info.teclas ? " " + info.teclas : "") }));
  corpo.append(teclas);
  App.abrirJanela(dlg, dlg.querySelector(".fechar"));
  Voz.anunciar(info.titulo + ". " + info.passos.map(function (p, i) { return (i + 1) + ": " + p.texto; }).join(" ") + " Para fechar, aperte Esc.");
}

/* =========================================================================
   PAUSA
   ========================================================================= */
function abrirPausa() {
  const dlg = document.getElementById("dlg-pausa");
  App.abrirJanela(dlg, dlg.querySelector(".voltar-jogo"));
  Voz.anunciar("Pausa. O jogo está parado. Quando quiser voltar, aperte Enter.");
}

/* =========================================================================
   AJUSTES (usados na tela inicial e na Área do professor)
   ========================================================================= */
const OPCOES_AJUSTES = [
  { k: "modoAudio", nome: "Modo Áudio (tecla F1)", info: "O jogo fala e funciona só pelo teclado." },
  { k: "vozPropria", nome: "Voz do próprio jogo", info: "Desligue se o estudante usa NVDA ou Narrador, para não ouvir duas vozes." },
  { k: "som", nome: "Sons e voz fora do Modo Áudio", info: "Começa desligado. Use fones de ouvido." },
  { k: "modoCalmo", nome: "Modo Calmo", info: "Tela mais limpa, cores suaves, frases diretas e sons suaves." },
  { k: "semAnimacoes", nome: "Desligar animações", info: "Nada se mexe na tela." },
  { k: "letrasGrandes", nome: "Letras e botões maiores", info: "" },
  { k: "altoContraste", nome: "Alto contraste", info: "Fundo escuro e letras claras." }
];

function painelAjustes() {
  const caixa = el("div", { class: "ajustes", "data-grupo": "ajustes" });
  OPCOES_AJUSTES.forEach(function (o) {
    const b = el("button", { type: "button", class: "alternar", "aria-pressed": String(!!Config.get(o.k)) });
    function pintar() {
      const ligado = !!Config.get(o.k);
      b.setAttribute("aria-pressed", String(ligado));
      b.innerHTML = '<span class="chave" aria-hidden="true"></span><span class="alternar-texto"><strong>' + o.nome + "</strong>" +
        (o.info ? "<small>" + o.info + "</small>" : "") + '</span><span class="estado">' + (ligado ? "Ligado" : "Desligado") + "</span>";
      b.setAttribute("data-fala", o.nome + ": " + (ligado ? "ligado" : "desligado") + ". " + o.info);
    }
    b.addEventListener("click", function () {
      if (o.k === "modoAudio") App.alternarModoAudio();
      else {
        Config.set(o.k, !Config.get(o.k));
        Voz.anunciar(o.nome + (Config.get(o.k) ? " ligado." : " desligado."));
      }
      pintar();
    });
    Config.aoMudar(pintar);
    pintar();
    caixa.append(b);
  });
  return caixa;
}

function abrirAjustes() {
  const dlg = document.getElementById("dlg-ajustes");
  const corpo = dlg.querySelector(".janela-corpo");
  corpo.innerHTML = "";
  corpo.append(el("h2", { texto: "Ajustes" }), painelAjustes());
  App.abrirJanela(dlg);
  Voz.anunciar("Ajustes. Use as setas para escolher e Enter para ligar ou desligar.");
}

/* =========================================================================
   ÁREA DO PROFESSOR
   ========================================================================= */
function abrirProfessor() {
  const dlg = document.getElementById("dlg-professor");
  const corpo = dlg.querySelector(".janela-corpo");
  corpo.innerHTML = "";
  const a = 5 + Math.floor(Math.random() * 5), b = 5 + Math.floor(Math.random() * 5);
  corpo.append(el("h2", { texto: "Área do professor" }));
  const form = el("form", { class: "pergunta-professor" });
  const campo = el("input", { id: "resposta-professor", type: "text", inputmode: "numeric", autocomplete: "off", maxlength: "3" });
  const aviso = el("p", { class: "mensagem", role: "status" });
  form.append(
    el("label", { for: "resposta-professor", texto: "Para entrar, responda: quanto é " + a + " + " + b + "?" }),
    campo,
    el("button", { type: "submit", class: "botao principal", texto: "Entrar" }),
    aviso
  );
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (parseInt(campo.value, 10) === a + b) painelProfessor(corpo);
    else { aviso.textContent = "Resposta diferente. Tente de novo."; campo.select(); }
  });
  corpo.append(form);
  App.abrirJanela(dlg, campo);
}

function painelProfessor(corpo) {
  corpo.innerHTML = "";
  corpo.append(el("h2", { texto: "Área do professor" }));
  const msg = el("p", { class: "mensagem", role: "status" });
  const grupo = el("div", { class: "botoes-professor", "data-grupo": "professor" });

  const liberar = el("button", { type: "button", class: "alternar" });
  function pintarLiberar() {
    const v = Progresso.liberarTudo();
    liberar.setAttribute("aria-pressed", String(v));
    liberar.innerHTML = '<span class="chave" aria-hidden="true"></span><span class="alternar-texto"><strong>Liberar todas as fases</strong><small>As crianças podem escolher qualquer fase.</small></span><span class="estado">' + (v ? "Ligado" : "Desligado") + "</span>";
  }
  liberar.addEventListener("click", function () {
    Progresso.liberarTudo(!Progresso.liberarTudo()); pintarLiberar();
    msg.textContent = Progresso.liberarTudo() ? "Todas as fases estão liberadas." : "As fases voltam a abrir uma de cada vez.";
  });
  pintarLiberar();

  const apagar = el("button", { type: "button", class: "botao perigo", texto: "Apagar progresso" });
  const confirmar = el("div", { class: "confirmar", hidden: true });
  confirmar.append(
    el("p", { texto: "Tem certeza? Todas as estrelas e as peças do Robô Campeão deste computador serão apagadas." }),
    el("button", { type: "button", class: "botao perigo", texto: "Sim, apagar tudo", onclick: function () {
      Progresso.apagar(); confirmar.hidden = true; msg.textContent = "Progresso apagado."; pintarLiberar(); apagar.focus();
    } }),
    el("button", { type: "button", class: "botao", texto: "Não, manter", onclick: function () { confirmar.hidden = true; apagar.focus(); } })
  );
  apagar.addEventListener("click", function () { confirmar.hidden = false; confirmar.querySelector("button").focus(); });

  grupo.append(liberar, apagar);

  // Escolhas em botões (ano do estudante e velocidade da voz do Modo Áudio)
  function escolhas(titulo, chave, opcoes, aviso) {
    const caixa = el("div", { class: "escolhas-professor", role: "group", "aria-label": titulo });
    caixa.append(el("h3", { texto: titulo }));
    const linha = el("div", { class: "anos", "data-grupo": "prof-" + chave });
    opcoes.forEach(function (o) {
      const b = el("button", { type: "button", class: "botao-ano", texto: o.nome });
      function pintar() { const at = Config.get(chave) === o.valor; b.classList.toggle("ativo", at); b.setAttribute("aria-pressed", String(at)); }
      b.addEventListener("click", function () {
        Config.set(chave, o.valor);
        linha.querySelectorAll("button").forEach(function (x) { x.dispatchEvent(new Event("pintar")); });
        msg.textContent = aviso + o.nome + ".";
        if (chave === "velocidadeVoz" && Config.get("modoAudio")) Voz.anunciar("Velocidade " + o.nome.toLowerCase() + ".");
      });
      b.addEventListener("pintar", pintar);
      pintar();
      linha.append(b);
    });
    caixa.append(linha);
    return caixa;
  }
  const anoBox = escolhas("Ano do estudante", "ano", [{ nome: "1º ano", valor: 1 }, { nome: "2º ano", valor: 2 }, { nome: "3º ano", valor: 3 }], "Ano escolhido: ");
  const velBox = escolhas("Velocidade da voz (Modo Áudio)", "velocidadeVoz", [{ nome: "Normal", valor: "normal" }, { nome: "Rápida", valor: "rapida" }, { nome: "Mais rápida", valor: "maisRapida" }], "Velocidade da voz: ");

  corpo.append(grupo, confirmar, msg, anoBox, velBox, el("h3", { texto: "Acessibilidade" }), painelAjustes(),
    el("p", { class: "nota", texto: "O progresso e os ajustes ficam guardados só no navegador deste computador. O jogo não envia nenhum dado para a internet." }));
  App.focar(liberar, true);
}

/* =========================================================================
   FIM DE DESAFIO (estrelas e peça do Robô Campeão)
   ========================================================================= */
function concluirDesafio(info) {
  // info: { sala, ano, indice, estrelas, detalhe, repetir(), proximo() | null, fases() }
  const novaPeca = Progresso.registrar(info.sala, info.ano, info.indice, info.estrelas);
  const n = Campeao.quantas();
  const dlg = document.getElementById("dlg-fim");
  const corpo = dlg.querySelector(".janela-corpo");
  corpo.innerHTML = "";
  const titulo = Msg.parabens();
  corpo.append(el("h2", { texto: titulo }));
  corpo.append(el("p", { class: "fim-estrelas", html: estrelasHTML(info.estrelas) + '<span class="so-leitor">Você ganhou ' + estrelasTexto(info.estrelas) + ".</span>" }));
  if (info.detalhe) corpo.append(el("p", { class: "fim-detalhe", texto: info.detalhe }));
  let falaPeca = "";
  if (novaPeca) {
    const peca = Campeao.PECAS[n - 1];
    falaPeca = "Peça nova para o Robô Campeão: " + peca.nome + "." + (n === Campeao.PECAS.length ? " O Robô Campeão está completo!" : "");
    corpo.append(el("div", { class: "fim-peca", html: Campeao.desenhar(n, peca.id) + "<p>" + falaPeca + "</p>" }));
  }
  const botoes = el("div", { class: "fim-botoes", "data-grupo": "fim" });
  if (info.proximo) botoes.append(el("button", { type: "button", class: "botao principal", texto: "Próximo desafio", onclick: function () { dlg.close(); info.proximo(); } }));
  botoes.append(el("button", { type: "button", class: "botao", texto: "Jogar de novo", onclick: function () { dlg.close(); info.repetir(); } }));
  botoes.append(el("button", { type: "button", class: "botao", texto: "Escolher outra fase", onclick: function () { dlg.close(); info.fases(); } }));
  corpo.append(botoes);
  App.abrirJanela(dlg, botoes.querySelector("button"));
  const fala = titulo + " Você ganhou " + estrelasTexto(info.estrelas) + ". " + (info.detalhe ? info.detalhe + " " : "") + falaPeca +
    (info.proximo ? " Aperte Enter para o próximo desafio." : "");
  Voz.anunciar(fala, "acerto");
}

/* =========================================================================
   TELA INICIAL
   ========================================================================= */
let atualizarBotoesInicio = function () {};

function telaInicio(op) {
  // Com o Modo Áudio ligado, a tela inicial é o menu simples de 4 opções.
  if (Config.get("modoAudio") && typeof ModoAudio !== "undefined") { ModoAudio.inicio(op && op.ligou === true ? op : null); return; }
  const ano = Config.get("ano");
  App.abrir({
    id: "inicio",
    titulo: "Fábrica do Robô",
    comoJogar: "inicio",
    ajuda: "Você está na tela inicial. Escolha o ano e depois a sala.",
    foco: function () { return document.querySelector("[data-ano].ativo"); },
    fala: Config.get("modoAudio") ? "Fábrica do Robô. Escolha o ano com as setas e aperte Enter." : null,
    voltar: function () { Voz.anunciar("Você já está na tela inicial."); },
    recarregar: telaInicio,
    montar: function (c) {
      // Modo Áudio
      const audio = el("div", { class: "faixa-audio" });
      const bAudio = el("button", { type: "button", id: "btn-modo-audio", class: "botao-audio", "data-sem-seta": "" });
      audio.append(bAudio, el("p", { class: "dica-audio", texto: AVISO_ABERTURA }));
      bAudio.addEventListener("click", App.alternarModoAudio);

      // Anos
      const secAno = el("section", { class: "bloco", "aria-labelledby": "t-ano" });
      secAno.append(el("h2", { id: "t-ano", texto: "1. Escolha o seu ano" }));
      const gAnos = el("div", { class: "anos" });

      // Salas
      const secSala = el("section", { class: "bloco", "aria-labelledby": "t-sala" });
      secSala.append(el("h2", { id: "t-sala", texto: "2. Escolha a sala" }));
      const gSalas = el("div", { class: "salas" });

      [1, 2, 3].forEach(function (n) {
        const b = el("button", { type: "button", class: "botao-ano", "data-ano": n, texto: ANOS[n] });
        b.addEventListener("click", function () {
          Config.set("ano", n);
          pintar();
          if (Config.get("modoAudio")) {
            const primeira = gSalas.querySelector("button");
            App.focar(primeira, true);
            Voz.anunciar(ANOS[n] + " escolhido. Agora escolha a sala com as setas. Você está em: " + primeira.getAttribute("data-fala"));
          } else Voz.anunciar(ANOS[n] + " escolhido. Agora escolha a sala.");
        });
        gAnos.append(b);
      });
      secAno.append(gAnos);

      ["montagem", "torre", "padroes"].filter(function (id) { return Salas[id]; }).forEach(function (id) {
        const s = Salas[id];
        const b = el("button", { type: "button", class: "cartao-sala sala-" + id, "data-sala": id });
        b.addEventListener("click", function () { telaFases(id); });
        gSalas.append(b);
      });
      secSala.append(gSalas);
      // Anos, salas e Robô Campeão ficam num só grupo de setas (nessa ordem).
      const grupoUnico = el("div", { "data-grupo": "inicio", class: "grupo-inicio" });
      grupoUnico.append(secAno, secSala);

      // Robô Campeão
      const camp = el("section", { class: "bloco campeao", "aria-labelledby": "t-campeao" });
      camp.append(el("h2", { id: "t-campeao", texto: "Robô Campeão" }));
      const bCamp = el("button", { type: "button", class: "botao-campeao" });
      const textoCamp = el("p", { class: "texto-campeao" });
      bCamp.addEventListener("click", function () { textoCamp.textContent = Campeao.descrever(); Voz.anunciar(Campeao.descrever()); });
      camp.append(bCamp, textoCamp);
      grupoUnico.append(camp);

      // Atalhos de acessibilidade
      const atalhos = el("div", { class: "atalhos" });
      const bCalmo = el("button", { type: "button", class: "botao", "data-sem-seta": "" });
      bCalmo.addEventListener("click", function () {
        Config.set("modoCalmo", !Config.get("modoCalmo"));
        pintar();
        Voz.anunciar(Config.get("modoCalmo") ? "Modo Calmo ligado." : "Modo Calmo desligado.");
      });
      const bAjustes = el("button", { type: "button", class: "botao", "data-sem-seta": "", html: ICONES.ajustes + "<span>Ajustes</span>", onclick: abrirAjustes });
      atalhos.append(bCalmo, bAjustes);

      c.append(audio, grupoUnico, atalhos);

      function pintar() {
        const anoAtual = Config.get("ano");
        bAudio.innerHTML = ICONES.ouvir + "<span>" + (Config.get("modoAudio") ? "Modo Áudio ligado" : "Modo Áudio") + "</span><kbd>F1</kbd>";
        bAudio.setAttribute("aria-pressed", String(Config.get("modoAudio")));
        bCalmo.innerHTML = ICONES.calmo + "<span>Modo Calmo: " + (Config.get("modoCalmo") ? "ligado" : "desligado") + "</span>";
        bCalmo.setAttribute("aria-pressed", String(Config.get("modoCalmo")));
        gAnos.querySelectorAll("[data-ano]").forEach(function (b) {
          const ativo = Number(b.getAttribute("data-ano")) === anoAtual;
          b.classList.toggle("ativo", ativo);
          b.setAttribute("aria-pressed", String(ativo));
        });
        gSalas.querySelectorAll("[data-sala]").forEach(function (b) {
          const id = b.getAttribute("data-sala"), s = Salas[id];
          const lista = s.lista(anoAtual);
          let total = 0, feitas = 0;
          lista.forEach(function (_, i) { const e = Progresso.estrelas(id, anoAtual, i); total += e; if (e) feitas++; });
          b.innerHTML = '<span class="sala-desenho" aria-hidden="true">' + s.desenho() + '</span><span class="sala-nome">' + s.nome + "</span>" +
            '<span class="sala-frase">' + s.frase + "</span>" +
            '<span class="sala-estrelas">' + estrelasHTML(1, 1) + " " + total + " de " + lista.length * 3 + "</span>";
          b.setAttribute("data-fala", s.nome + ". " + s.frase + " Você tem " + total + " de " + lista.length * 3 + " estrelas.");
        });
        const n = Campeao.quantas();
        bCamp.innerHTML = Campeao.desenhar() + '<span class="campeao-conta">' + n + " de " + Campeao.PECAS.length + " peças</span>";
        bCamp.setAttribute("data-fala", Campeao.descrever());
        bCamp.setAttribute("aria-label", "Robô Campeão: " + n + " de " + Campeao.PECAS.length + " peças. Clique para ouvir a descrição.");
      }
      atualizarBotoesInicio = pintar;
      pintar();
    }
  });
}

/* =========================================================================
   LISTA DE FASES DE UMA SALA
   ========================================================================= */
function telaFases(salaId, focarIndice) {
  const s = Salas[salaId];
  const ano = Config.get("ano");
  const lista = s.lista(ano);
  const feitas = lista.filter(function (_, i) { return Progresso.estrelas(salaId, ano, i) > 0; }).length;
  let proxima = lista.findIndex(function (_, i) { return Progresso.estrelas(salaId, ano, i) === 0 && Progresso.liberado(salaId, ano, i); });
  if (focarIndice !== undefined) proxima = focarIndice;
  App.abrir({
    id: "fases",
    titulo: s.nome + " – " + ANOS[ano],
    comoJogar: salaId,
    progresso: { atual: feitas, total: lista.length, texto: "Fases feitas: " + feitas + " de " + lista.length },
    ajuda: "Você está na lista de fases da " + s.nome + ". Escolha uma fase com as setas e aperte Enter. Esc volta para a tela inicial.",
    fala: s.nome + ", " + ANOS[ano] + ". Escolha uma fase.",
    foco: function () { return document.querySelector('[data-fase="' + Math.max(0, proxima) + '"]'); },
    voltar: telaInicio,
    recarregar: function () { telaFases(salaId); },
    montar: function (c) {
      c.append(el("p", { class: "frase-sala", texto: s.frase }));
      const g = el("div", { class: "fases", "data-grupo": "fases" });
      lista.forEach(function (d, i) {
        const est = Progresso.estrelas(salaId, ano, i);
        const livre = Progresso.liberado(salaId, ano, i);
        const rot = s.rotuloFase ? s.rotuloFase(d, i) : "";
        const b = el("button", {
          type: "button", class: "botao-fase" + (livre ? "" : " trancada"), "data-fase": i,
          "aria-disabled": livre ? null : "true",
          html: '<span class="fase-num">Fase ' + (i + 1) + "</span>" + (rot ? '<span class="fase-tipo">' + rot + "</span>" : "") +
            (livre ? estrelasHTML(est) : '<span class="cadeado" aria-hidden="true">🔒</span>'),
          "data-fala": "Fase " + (i + 1) + (rot ? ", " + rot : "") + ". " + (livre ? estrelasTexto(est) : "trancada"),
          "aria-label": "Fase " + (i + 1) + (rot ? ", " + rot : "") + ". " + (livre ? estrelasTexto(est) : "trancada")
        });
        b.addEventListener("click", function () {
          if (!livre) { Voz.anunciar("A fase " + (i + 1) + " abre quando você terminar a fase " + i + "."); mostrarAviso(c, "A fase " + (i + 1) + " abre quando você terminar a fase " + i + "."); return; }
          s.abrir(ano, i);
        });
        g.append(b);
      });
      if (s.extra) g.append(s.extra());
      c.append(g, el("p", { class: "mensagem", "aria-hidden": "true" }));
    }
  });
}

function mostrarAviso(c, texto) {
  const m = c.querySelector(".mensagem");
  if (m) { m.textContent = texto; m.classList.remove("aparece"); void m.offsetWidth; m.classList.add("aparece"); }
}

/* Abre um desafio dentro de uma sala com o cabeçalho e as teclas padrão. */
function telaDesafio(salaId, ano, indice, def) {
  const s = Salas[salaId];
  const lista = s.lista(ano);
  def.id = "desafio";
  def.titulo = def.titulo || (s.nome + " – Fase " + (indice + 1));
  def.comoJogar = def.comoJogar || salaId;
  def.progresso = { atual: indice + 1, total: lista.length, texto: "Fase " + (indice + 1) + " de " + lista.length };
  def.voltar = def.voltar || function () { telaFases(salaId, indice); };
  if (Config.get("modoCalmo") && s.passos) def.passos = s.passos(lista[indice]);
  App.abrir(def);
}

// Mensagem visual dentro do desafio (o texto também vai para o leitor de tela e para a voz).
function avisar(c, texto, tipo, som) {
  const m = c.querySelector(".mensagem");
  if (m) {
    m.textContent = texto;
    m.className = "mensagem " + (tipo || "");
    void m.offsetWidth;
    m.classList.add("aparece");
  }
  Voz.anunciar(texto, som);
}

function proximoOuFases(salaId, ano, indice) {
  const lista = Salas[salaId].lista(ano);
  return indice + 1 < lista.length ? function () { Salas[salaId].abrir(ano, indice + 1); } : null;
}

/* =========================================================================
   INÍCIO
   ========================================================================= */
document.addEventListener("DOMContentLoaded", function () {
  Config.aplicar();
  document.getElementById("btn-inicio").addEventListener("click", telaInicio);
  document.getElementById("btn-como").addEventListener("click", abrirComoJogar);
  document.getElementById("btn-pausa").addEventListener("click", abrirPausa);
  document.getElementById("btn-professor").addEventListener("click", abrirProfessor);
  const bSom = document.getElementById("btn-som");
  function pintarSom() {
    const audio = Config.get("modoAudio"), ligado = Config.somLigado();
    bSom.innerHTML = (ligado ? ICONES.ouvir : ICONES.mudo) + "<span>" + (audio ? "Som: Modo Áudio" : ligado ? "Som ligado" : "Som desligado") + "</span>";
    bSom.setAttribute("aria-pressed", String(ligado));
    bSom.disabled = audio;
  }
  bSom.addEventListener("click", function () {
    Config.set("som", !Config.get("som"));
    if (Config.get("som")) { Sons.destravar(); Voz.anunciar("Som ligado.", "clique"); }
  });
  Config.aoMudar(pintarSom);
  pintarSom();
  document.querySelectorAll(".fechar").forEach(function (b) { b.addEventListener("click", function () { b.closest("dialog").close(); }); });
  document.querySelector("#dlg-pausa .voltar-jogo").addEventListener("click", function () {
    document.getElementById("dlg-pausa").close();
    Voz.anunciar("Vamos voltar ao jogo.");
  });
  telaInicio();
  // Aviso de abertura (alguns navegadores só deixam falar depois da primeira tecla).
  setTimeout(function () {
    if (!Config.get("modoAudio")) Voz.dizerSolto(AVISO_ABERTURA, true);   // no Modo Áudio, o próprio menu já fala
  }, 400);
});
