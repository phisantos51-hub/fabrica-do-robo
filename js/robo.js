/* =========================================================================
   ROBÔ: peças, desenho, descrições faladas e regras dos pedidos.
   Os pedidos usam só FORMA, TAMANHO e QUANTIDADE. A cor é apenas enfeite.
   ========================================================================= */

// As peças que a criança escolhe, na ordem em que aparecem no menu.
const PECAS = [
  { campo: "cabeca",    nome: "Cabeça",    valores: ["redonda", "quadrada", "triangular"] },
  { campo: "corpo",     nome: "Corpo",     valores: ["grande", "pequeno"] },
  { campo: "bracos",    nome: "Braços",    valores: [0, 2, 4] },
  { campo: "locomocao", nome: "Locomoção", valores: ["pernas", "rodas", "esteira"] },
  { campo: "antenas",   nome: "Antenas",   valores: [0, 1, 2] },
  { campo: "acessorio", nome: "Acessório", valores: ["nenhum", "chapeu", "oculos", "gravata"] }
];

// Cores de enfeite (nunca usadas como critério).
const CORES = [
  { id: "azul",    nome: "azul",    hex: "#8ab8e6" },
  { id: "verde",   nome: "verde",   hex: "#9fd39a" },
  { id: "laranja", nome: "laranja", hex: "#f7bf86" },
  { id: "roxo",    nome: "roxo",    hex: "#c3b5e8" },
  { id: "amarelo", nome: "amarelo", hex: "#f5dc7a" },
  { id: "cinza",   nome: "cinza",   hex: "#b9c2cc" }
];

const Robo = (function () {
  const NUM_M = ["nenhum", "um", "dois", "três", "quatro", "cinco"];
  const NUM_F = ["nenhuma", "uma", "duas", "três", "quatro", "cinco"];
  const NOMES_ACESSORIO = { nenhum: "nenhum acessório", chapeu: "chapéu", oculos: "óculos", gravata: "gravata-borboleta" };

  function normalizar(texto) {
    return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  }

  function peca(campo) { return PECAS.find(function (p) { return p.campo === campo; }); }

  // "dois braços", "uma antena", "nenhuma antena"
  function quantidade(campo, n) {
    if (campo === "bracos") return NUM_M[n] + (n === 1 || n === 0 ? " braço" : " braços");
    return NUM_F[n] + (n === 1 || n === 0 ? " antena" : " antenas");
  }

  // Nome curto de um valor, para botões e falas: "cabeça redonda", "rodas", "óculos".
  function nomeValor(campo, valor) {
    if (valor === null || valor === undefined) return "ainda não escolhido";
    switch (campo) {
      case "cabeca": return "cabeça " + valor;
      case "corpo": return "corpo " + valor;
      case "bracos": case "antenas": return quantidade(campo, valor);
      case "locomocao": return valor;
      case "acessorio": return valor === "nenhum" ? "sem acessório" : NOMES_ACESSORIO[valor];
    }
    return String(valor);
  }

  // Valor sozinho, para o menu: "Cabeça: redonda", "Braços: dois".
  function valorCurto(campo, valor) {
    if (valor === null || valor === undefined) return "falta escolher";
    if (campo === "bracos") return NUM_M[valor];
    if (campo === "antenas") return NUM_F[valor];
    if (campo === "acessorio") return valor === "nenhum" ? "nenhum" : NOMES_ACESSORIO[valor];
    return String(valor);
  }

  // Som próprio de cada peça (ver sons.js).
  function somDa(campo, valor) {
    if (campo === "locomocao") return valor === "rodas" ? "roda" : valor === "esteira" ? "esteira" : "pernas";
    if (campo === "antenas") return "antena";
    if (campo === "bracos") return "bracos";
    if (campo === "cabeca") return "cabeca";
    if (campo === "corpo") return "corpo";
    if (campo === "acessorio") return "acessorio";
    return "clique";
  }

  function novo() {
    return { cabeca: null, corpo: null, bracos: 0, locomocao: null, antenas: 0, acessorio: "nenhum", cor: "azul" };
  }

  // Descrição completa em uma frase.
  function descrever(r) {
    const partes = [
      r.cabeca ? "cabeça " + r.cabeca : "sem cabeça",
      r.corpo ? "corpo " + r.corpo : "sem corpo",
      quantidade("bracos", r.bracos),
      r.locomocao ? (r.locomocao === "esteira" ? "anda com esteira" : "anda com " + r.locomocao) : "sem pernas, rodas ou esteira",
      quantidade("antenas", r.antenas),
      r.acessorio === "nenhum" ? "nenhum acessório" : "usa " + NOMES_ACESSORIO[r.acessorio]
    ];
    return juntar(partes);
  }

  function juntar(lista) {
    if (lista.length <= 1) return lista.join("");
    return lista.slice(0, -1).join(", ") + " e " + lista[lista.length - 1];
  }

  /* ------------------------------------------------------------------
     REGRAS: textos como "cabeca = redonda", "antenas != 0", "bracos > antenas".
     ------------------------------------------------------------------ */
  const APELIDOS = {
    cabeca: "cabeca", corpo: "corpo", braco: "bracos", bracos: "bracos", locomocao: "locomocao",
    antena: "antenas", antenas: "antenas", acessorio: "acessorio",
    roda: "rodas", perna: "pernas", "gravata-borboleta": "gravata", nenhuma: "nenhum", sem: "nenhum"
  };

  function lerRegra(texto) {
    const t = normalizar(texto);
    const m = t.match(/^([a-z-]+)\s*(!=|>=|<=|=|>|<)\s*([a-z0-9-]+)$/);
    if (!m) throw new Error('Regra que não entendi: "' + texto + '"');
    const campo = APELIDOS[m[1]] || m[1];
    if (!peca(campo)) throw new Error('Peça desconhecida em "' + texto + '"');
    let valor = APELIDOS[m[3]] || m[3];
    const regra = { campo: campo, op: m[2], texto: String(texto) };
    if (peca(valor)) {
      regra.outroCampo = valor;
    } else if (/^\d+$/.test(valor)) {
      regra.valor = Number(valor);
    } else {
      regra.valor = valor;
      if (peca(campo).valores.indexOf(valor) < 0) throw new Error('Valor "' + valor + '" não existe para ' + campo + ' em "' + texto + '"');
    }
    return regra;
  }

  function cumpre(r, regra) {
    const a = r[regra.campo];
    const b = regra.outroCampo ? r[regra.outroCampo] : regra.valor;
    if (a === null || a === undefined) return false;
    switch (regra.op) {
      case "=": return a === b;
      case "!=": return a !== b;
      case ">": return a > b;
      case "<": return a < b;
      case ">=": return a >= b;
      case "<=": return a <= b;
    }
    return false;
  }

  const NOME_PLURAL = { bracos: "braços", antenas: "antenas" };

  // Trecho do pedido: "com cabeça redonda", "sem antenas", "com mais braços que antenas".
  function trechoPedido(g) {
    const c = g.campo, v = g.valor, op = g.op;
    if (g.outroCampo) {
      if (op === ">") return "com mais " + NOME_PLURAL[c] + " que " + NOME_PLURAL[g.outroCampo];
      if (op === "<") return "com menos " + NOME_PLURAL[c] + " que " + NOME_PLURAL[g.outroCampo];
      if (op === "=") return "com o mesmo número de " + NOME_PLURAL[c] + " e de " + NOME_PLURAL[g.outroCampo];
      return "com " + NOME_PLURAL[c] + " " + op + " " + NOME_PLURAL[g.outroCampo];
    }
    if (c === "cabeca" || c === "corpo") {
      const nome = c === "cabeca" ? "cabeça" : "corpo";
      return op === "=" ? "com " + nome + " " + v : "com " + nome + " que não é " + v;
    }
    if (c === "bracos" || c === "antenas") {
      if (op === "=") return v === 0 ? "sem " + NOME_PLURAL[c] : "com " + quantidade(c, v);
      if (op === "!=") return v === 0 ? "com " + NOME_PLURAL[c] : "sem ter " + (v === 1 ? "exatamente " : "") + quantidade(c, v);
      if (op === ">") return v === 0 ? "com " + NOME_PLURAL[c] : "com mais de " + quantidade(c, v);
      if (op === "<") return "com menos de " + quantidade(c, v);
      if (op === ">=") return "com " + quantidade(c, v) + " ou mais";
      if (op === "<=") return "com " + quantidade(c, v) + " ou menos";
    }
    if (c === "locomocao") return op === "=" ? "com " + v : "sem " + v;
    if (c === "acessorio") {
      if (v === "nenhum") return op === "=" ? "sem acessório" : "com um acessório";
      return op === "=" ? "com " + NOMES_ACESSORIO[v] : "sem " + NOMES_ACESSORIO[v];
    }
    return g.texto;
  }

  // "com cabeça redonda, corpo pequeno e duas antenas" (o "com" não se repete em seguida).
  function textoPedido(regras) {
    const trechos = regras.map(trechoPedido);
    for (let i = trechos.length - 1; i > 0; i--) {
      if (trechos[i].indexOf("com ") === 0 && trechos[i - 1].indexOf("com ") === 0 && trechos[i].indexOf("com mais") !== 0 &&
          trechos[i].indexOf("com menos") !== 0 && trechos[i].indexOf("com o mesmo") !== 0) trechos[i] = trechos[i].slice(4);
    }
    return "Monte um robô " + juntar(trechos) + ".";
  }

  // Pista em frase completa: "Ele não tem rodas.", "A cabeça dele não é quadrada."
  function textoPista(g) {
    const c = g.campo, v = g.valor, op = g.op;
    if (g.outroCampo) {
      if (op === ">") return "Ele tem mais " + NOME_PLURAL[c] + " que " + NOME_PLURAL[g.outroCampo] + ".";
      if (op === "<") return "Ele tem menos " + NOME_PLURAL[c] + " que " + NOME_PLURAL[g.outroCampo] + ".";
      if (op === "=") return "Ele tem o mesmo número de " + NOME_PLURAL[c] + " e de " + NOME_PLURAL[g.outroCampo] + ".";
    }
    if (c === "cabeca") return op === "=" ? "A cabeça dele é " + v + "." : "A cabeça dele não é " + v + ".";
    if (c === "corpo") return op === "=" ? "O corpo dele é " + v + "." : "O corpo dele não é " + v + ".";
    if (c === "bracos" || c === "antenas") {
      if (op === "=") return v === 0 ? "Ele não tem " + NOME_PLURAL[c] + "." : "Ele tem " + quantidade(c, v) + ".";
      if (op === "!=") return v === 0 ? "Ele tem " + NOME_PLURAL[c] + "." : "Ele não tem " + (v === 1 ? "exatamente " : "") + quantidade(c, v) + ".";
      if (op === ">") return v === 0 ? "Ele tem " + NOME_PLURAL[c] + "." : "Ele tem mais de " + quantidade(c, v) + ".";
      if (op === "<") return "Ele tem menos de " + quantidade(c, v) + ".";
      if (op === ">=") return "Ele tem " + quantidade(c, v) + " ou mais.";
      if (op === "<=") return "Ele tem " + quantidade(c, v) + " ou menos.";
    }
    if (c === "locomocao") return op === "=" ? "Ele anda com " + v + "." : "Ele não tem " + v + ".";
    if (c === "acessorio") {
      if (v === "nenhum") return op === "=" ? "Ele não usa acessório." : "Ele usa um acessório.";
      const a = NOMES_ACESSORIO[v];
      return op === "=" ? "Ele usa " + a + "." : "Ele não usa " + a + ".";
    }
    return g.texto;
  }

  // O que o robô tem, em relação a uma regra: "Seu robô tem uma antena."
  function oQueTem(r, g, sujeito) {
    sujeito = sujeito || "O seu robô";
    if (g.outroCampo) {
      return sujeito + " tem " + quantidade(g.campo, r[g.campo]) + " e " + quantidade(g.outroCampo, r[g.outroCampo]) + ".";
    }
    const c = g.campo, v = r[c];
    if (c === "cabeca") return sujeito + " tem cabeça " + v + ".";
    if (c === "corpo") return sujeito + " tem corpo " + v + ".";
    if (c === "bracos" || c === "antenas") return sujeito + " tem " + quantidade(c, v) + ".";
    if (c === "locomocao") return sujeito + " anda com " + v + ".";
    if (c === "acessorio") return v === "nenhum" ? sujeito + " não usa acessório." : sujeito + " usa " + NOMES_ACESSORIO[v] + ".";
    return "";
  }

  /* ------------------------------------------------------------------
     DESENHO (SVG feito pelo próprio jogo)
     opcoes.destaque = campo: as outras peças ficam clarinhas.
     ------------------------------------------------------------------ */
  const TRACO = "#2d3748";

  function desenhar(r, opcoes) {
    opcoes = opcoes || {};
    const cor = (CORES.find(function (c) { return c.id === r.cor; }) || CORES[0]).hex;
    const corpoGrande = r.corpo !== "pequeno";
    const corpo = corpoGrande ? { x: 45, y: 130, w: 110, h: 92 } : { x: 65, y: 155, w: 70, h: 67 };
    const baseCabeca = corpo.y - 6;
    const cabeca = r.cabeca || "redonda";
    const topoCabeca = cabeca === "redonda" ? baseCabeca - 64 : cabeca === "quadrada" ? baseCabeca - 58 : baseCabeca - 66;

    function grupo(campo, conteudo) {
      let op = 1;
      if (opcoes.destaque && opcoes.destaque !== campo) op = 0.22;
      return '<g data-peca="' + campo + '" opacity="' + op + '">' + conteudo + "</g>";
    }
    function fantasma(conteudo) {
      return '<g fill="none" stroke="#94a3b8" stroke-width="3" stroke-dasharray="7 6">' + conteudo + "</g>";
    }
    const cheio = 'fill="' + cor + '" stroke="' + TRACO + '" stroke-width="3"';
    let s = "";

    // Locomoção
    let loc = "";
    if (r.locomocao === "pernas") {
      loc = '<rect x="78" y="220" width="14" height="40" ' + cheio + '/><rect x="108" y="220" width="14" height="40" ' + cheio + "/>" +
        '<rect x="68" y="256" width="28" height="14" rx="5" fill="#4a5568" stroke="' + TRACO + '" stroke-width="3"/>' +
        '<rect x="104" y="256" width="28" height="14" rx="5" fill="#4a5568" stroke="' + TRACO + '" stroke-width="3"/>';
    } else if (r.locomocao === "rodas") {
      [72, 128].forEach(function (x) {
        loc += '<circle cx="' + x + '" cy="248" r="24" fill="#4a5568" stroke="' + TRACO + '" stroke-width="3"/>' +
          '<circle cx="' + x + '" cy="248" r="9" fill="#e2e8f0" stroke="' + TRACO + '" stroke-width="2"/>' +
          '<path d="M' + (x - 18) + ' 248 H' + (x + 18) + ' M' + x + ' 230 V266" stroke="#e2e8f0" stroke-width="3"/>';
      });
    } else if (r.locomocao === "esteira") {
      loc = '<rect x="42" y="226" width="116" height="44" rx="22" fill="#4a5568" stroke="' + TRACO + '" stroke-width="3"/>';
      [66, 100, 134].forEach(function (x) {
        loc += '<circle cx="' + x + '" cy="248" r="11" fill="#cbd5e0" stroke="' + TRACO + '" stroke-width="2"/>';
      });
      loc += '<path d="M56 228 v-4 M72 228 v-4 M88 228 v-4 M104 228 v-4 M120 228 v-4 M136 228 v-4" stroke="' + TRACO + '" stroke-width="3"/>';
    } else {
      loc = fantasma('<rect x="50" y="228" width="100" height="40" rx="12"/>');
    }
    s += grupo("locomocao", loc);

    // Braços (atrás do corpo)
    let br = "";
    const ladoE = corpo.x + 4, ladoD = corpo.x + corpo.w - 4;
    function braco(x, y, dx, dy) {
      return '<path d="M' + x + " " + y + " L" + (x + dx) + " " + (y + dy) + '" stroke="' + TRACO + '" stroke-width="13" stroke-linecap="round"/>' +
        '<path d="M' + x + " " + y + " L" + (x + dx) + " " + (y + dy) + '" stroke="' + cor + '" stroke-width="7" stroke-linecap="round"/>' +
        '<circle cx="' + (x + dx) + '" cy="' + (y + dy) + '" r="8" fill="#4a5568" stroke="' + TRACO + '" stroke-width="2"/>';
    }
    if (r.bracos === 2) {
      const y = corpo.y + 24;
      br = braco(ladoE, y, -34, 26) + braco(ladoD, y, 34, 26);
    } else if (r.bracos === 4) {
      const y1 = corpo.y + 16, y2 = corpo.y + corpo.h - 22;
      br = braco(ladoE, y1, -34, -16) + braco(ladoD, y1, 34, -16) + braco(ladoE, y2, -34, 20) + braco(ladoD, y2, 34, 20);
    }
    s += grupo("bracos", br);

    // Corpo
    let co = "";
    if (r.corpo) {
      co = '<rect x="' + corpo.x + '" y="' + corpo.y + '" width="' + corpo.w + '" height="' + corpo.h + '" rx="12" ' + cheio + "/>" +
        '<rect x="' + (100 - corpo.w / 4) + '" y="' + (corpo.y + corpo.h / 3) + '" width="' + corpo.w / 2 + '" height="' + corpo.h / 3 + '" rx="5" fill="#f7fafc" stroke="' + TRACO + '" stroke-width="2"/>' +
        '<circle cx="' + (100 - corpo.w / 8) + '" cy="' + (corpo.y + corpo.h / 2) + '" r="4" fill="' + TRACO + '"/>' +
        '<circle cx="' + (100 + corpo.w / 8) + '" cy="' + (corpo.y + corpo.h / 2) + '" r="4" fill="' + TRACO + '"/>';
    } else {
      co = fantasma('<rect x="50" y="135" width="100" height="85" rx="12"/>');
    }
    // Pescoço
    co += '<rect x="92" y="' + (baseCabeca - 2) + '" width="16" height="10" fill="#a0aec0" stroke="' + TRACO + '" stroke-width="2"/>';
    s += grupo("corpo", co);

    // Cabeça
    let ca = "", olhoY, olhoDx = 13, olhoR = 6;
    if (cabeca === "redonda") {
      ca = '<circle cx="100" cy="' + (baseCabeca - 32) + '" r="32" ' + (r.cabeca ? cheio : "") + "/>";
      olhoY = baseCabeca - 36;
    } else if (cabeca === "quadrada") {
      ca = '<rect x="68" y="' + topoCabeca + '" width="64" height="58" rx="6" ' + (r.cabeca ? cheio : "") + "/>";
      olhoY = baseCabeca - 34;
    } else {
      ca = '<path d="M100 ' + topoCabeca + " L136 " + baseCabeca + " L64 " + baseCabeca + ' Z" ' + (r.cabeca ? cheio : "") + ' stroke-linejoin="round"/>';
      olhoY = baseCabeca - 20; olhoDx = 10; olhoR = 5;
    }
    if (r.cabeca) {
      ca += '<circle cx="' + (100 - olhoDx) + '" cy="' + olhoY + '" r="' + olhoR + '" fill="' + TRACO + '"/>' +
        '<circle cx="' + (100 + olhoDx) + '" cy="' + olhoY + '" r="' + olhoR + '" fill="' + TRACO + '"/>' +
        '<path d="M' + (100 - olhoDx) + " " + (olhoY + 13) + " Q100 " + (olhoY + 20) + " " + (100 + olhoDx) + " " + (olhoY + 13) + '" fill="none" stroke="' + TRACO + '" stroke-width="3" stroke-linecap="round"/>';
      s += grupo("cabeca", ca);
    } else {
      s += grupo("cabeca", fantasma('<circle cx="100" cy="' + (baseCabeca - 32) + '" r="30"/>'));
    }

    // Acessório
    let ac = "";
    const baseChapeu = cabeca === "redonda" ? topoCabeca + 8 : cabeca === "quadrada" ? topoCabeca + 2 : topoCabeca + 18;
    if (r.acessorio === "chapeu") {
      ac = '<rect x="70" y="' + (baseChapeu - 6) + '" width="60" height="8" rx="3" fill="#2d3748"/>' +
        '<rect x="82" y="' + (baseChapeu - 32) + '" width="36" height="28" rx="3" fill="#2d3748"/>' +
        '<rect x="82" y="' + (baseChapeu - 14) + '" width="36" height="6" fill="#e2e8f0"/>';
    } else if (r.acessorio === "oculos" && r.cabeca) {
      const ro = cabeca === "triangular" ? 8 : 10;
      ac = '<circle cx="' + (100 - olhoDx) + '" cy="' + olhoY + '" r="' + ro + '" fill="rgba(255,255,255,0.35)" stroke="#1a202c" stroke-width="3"/>' +
        '<circle cx="' + (100 + olhoDx) + '" cy="' + olhoY + '" r="' + ro + '" fill="rgba(255,255,255,0.35)" stroke="#1a202c" stroke-width="3"/>' +
        '<path d="M' + (100 - olhoDx + ro) + " " + olhoY + " H" + (100 + olhoDx - ro) + '" stroke="#1a202c" stroke-width="3"/>';
    } else if (r.acessorio === "gravata") {
      const y = corpo.y + 8;
      ac = '<path d="M100 ' + y + " L84 " + (y - 9) + " L84 " + (y + 9) + ' Z" fill="#2d3748"/>' +
        '<path d="M100 ' + y + " L116 " + (y - 9) + " L116 " + (y + 9) + ' Z" fill="#2d3748"/>' +
        '<circle cx="100" cy="' + y + '" r="5" fill="#2d3748" stroke="#f7fafc" stroke-width="1.5"/>';
    }
    s += grupo("acessorio", ac);

    // Antenas (por cima do chapéu, se houver)
    let an = "";
    const topo = r.acessorio === "chapeu" ? baseChapeu - 32 : topoCabeca;
    function antena(x, y, dx) {
      return '<path d="M' + x + " " + y + " L" + (x + dx) + " " + (y - 26) + '" stroke="' + TRACO + '" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="' + (x + dx) + '" cy="' + (y - 28) + '" r="6" fill="#f6e05e" stroke="' + TRACO + '" stroke-width="2.5"/>';
    }
    if (r.antenas === 1) an = antena(100, topo + 2, 0);
    else if (r.antenas === 2) {
      if (r.acessorio === "chapeu") an = antena(90, topo + 2, -8) + antena(110, topo + 2, 8);
      else if (cabeca === "redonda") an = antena(84, topo + 9, -10) + antena(116, topo + 9, 10);
      else if (cabeca === "quadrada") an = antena(80, topo + 2, -8) + antena(120, topo + 2, 8);
      else an = antena(93, topo + 14, -10) + antena(107, topo + 14, 10);
    }
    s += grupo("antenas", an);

    const rotulo = opcoes.rotulo === undefined ? "Robô: " + descrever(r) : opcoes.rotulo;
    const aria = rotulo ? 'role="img" aria-label="' + rotulo.replace(/"/g, "'") + '"' : 'aria-hidden="true" focusable="false"';
    return '<svg class="robo-svg" viewBox="0 -4 200 280" ' + aria + ">" + s + "</svg>";
  }

  return {
    normalizar: normalizar, peca: peca, quantidade: quantidade, nomeValor: nomeValor, valorCurto: valorCurto,
    somDa: somDa, novo: novo, descrever: descrever, juntar: juntar,
    lerRegra: lerRegra, cumpre: cumpre, trechoPedido: trechoPedido, textoPedido: textoPedido,
    textoPista: textoPista, oQueTem: oQueTem, desenhar: desenhar
  };
})();
