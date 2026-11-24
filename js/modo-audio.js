/* =========================================================================
   MODO ÁUDIO SIMPLIFICADO
   Só é usado com o Modo Áudio ligado. O jogo normal (com mouse) não muda.

   - Menu com 4 opções: Esteira Rápida, Linha de Montagem, Torre e Padrões.
   - Falas curtas: as instruções completas só aparecem na primeira vez.
   - Mais sons e menos palavras: som de acerto e som de "tente de novo".
   - Rodadas de 3 desafios; no fim, comemoração da sala e peça nova
     do Robô Campeão. Depois, "Continuar" ou "Trocar de sala".
   - O ano e a velocidade da voz ficam na Área do professor.
   ========================================================================= */
const ModoAudio = (function () {
  const CHAVE = "fabricaDoRobo.audio";
  const POR_RODADA = 3;
  const PAN = [-0.8, 0, 0.8];   // esquerda, meio, direita
  const SONS_PADRAO = { bip: "bip", buzina: "buzina", tambor: "tambor", sino: "sino", apito: "apito" };

  let est = carregar();
  function carregar() { return Object.assign({ visto: {}, pos: {}, rodadas: {}, torreDiscos: 2 }, Guardar.ler(CHAVE) || {}); }
  function salvar() { Guardar.gravar(CHAVE, est); }
  // Devolve true só na primeira vez (para dar a instrução completa uma vez só).
  function primeiraVez(id) { if (est.visto[id]) return false; est.visto[id] = true; salvar(); return true; }

  function maiuscula(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  // Fala uma lista de frases curtas e sons: ["Frase.", { som: "acerto" }, ...]
  function dizer(lista) {
    return Voz.sequencia(lista.map(function (x) { return typeof x === "string" ? { texto: x } : x; }));
  }
  function minhaTela(def) { return App.tela() === def; }

  const SALAS = [
    { id: "esteira",  nome: "Esteira Rápida",    som: "salaEsteira",  abrir: function () { esteira(); } },
    { id: "montagem", nome: "Linha de Montagem", som: "salaMontagem", abrir: function () { montagem(); } },
    { id: "torre",    nome: "Torre",             som: "salaTorre",    abrir: function () { torre(); } },
    { id: "padroes",  nome: "Padrões",           som: "salaPadroes",  abrir: function () { padroes(); } }
  ];
  function sala(id) { return SALAS.find(function (s) { return s.id === id; }); }

  function abrirTela(def) {
    def.voltar = def.voltar || function () { inicio(); };
    App.abrir(def);
    return def;
  }

  /* =======================================================================
     MENU INICIAL DO MODO ÁUDIO
     ======================================================================= */
  function inicio(op) {
    let c;
    abrirTela({
      id: "inicio-audio",
      titulo: "Fábrica do Robô – Modo Áudio",
      ajuda: ["Setas: escolher.", "Enter: entrar."],
      voltar: function () { Sons.tocar("limite"); },
      recarregar: function () { inicio(); },
      foco: function () { return c.querySelector("[data-sala-audio]"); },
      montar: function (cc) {
        c = cc;
        const g = el("div", { class: "menu-audio", "data-grupo": "menu-audio" });
        SALAS.forEach(function (s) {
          g.append(el("button", { type: "button", class: "botao-audio-sala", "data-sala-audio": s.id, "data-fala": s.nome, "data-som": s.som,
            texto: s.nome, onclick: s.abrir }));
        });
        const n = Campeao.quantas();
        c.append(
          el("p", { class: "instrucao", texto: "Setas para escolher. Enter para entrar. F1 sai do Modo Áudio." }),
          g,
          el("div", { class: "campeao-audio", html: Campeao.desenhar() + "<p>Robô Campeão: " + n + " de " + Campeao.PECAS.length + " peças</p>" }),
          el("button", { type: "button", class: "botao", "data-sem-seta": "", texto: "Sair do Modo Áudio (F1)", onclick: App.alternarModoAudio })
        );
      }
    });
    const fala = [];
    if (op && op.ligou === true) fala.push({ som: "acerto", pausa: 500 }, "Modo Áudio.");
    if (primeiraVez("inicio")) fala.push("Fábrica do Robô!", "Use as setas e aperte Enter.");
    fala.push({ som: "salaEsteira", pausa: 450 }, "Esteira Rápida.");
    dizer(fala);
  }

  /* =======================================================================
     FIM DA RODADA: comemoração da sala, peça nova e "continuar?"
     ======================================================================= */
  function fimRodada(salaId, continuar, extras) {
    est.rodadas[salaId] = (est.rodadas[salaId] || 0) + 1;
    salvar();
    const nova = Progresso.registrar("audio-" + salaId, 0, est.rodadas[salaId], 3);
    const n = Campeao.quantas();
    const peca = nova ? Campeao.PECAS[n - 1] : null;
    let c;
    abrirTela({
      id: "fim-audio",
      titulo: "Rodada completa!",
      ajuda: ["Continuar ou trocar de sala?"],
      foco: function () { return c.querySelector(".fim-audio button"); },
      montar: function (cc) {
        c = cc;
        c.append(el("p", { class: "instrucao", texto: peca ? "Peça nova para o Robô Campeão: " + peca.nome + "!" : "Rodada completa!" }));
        c.append(el("div", { class: "campeao-audio", html: Campeao.desenhar(n, peca ? peca.id : null) }));
        const g = el("div", { class: "menu-audio fim-audio", "data-grupo": "fim-audio" });
        g.append(el("button", { type: "button", class: "botao-audio-sala", "data-fala": "Continuar", "data-som": "pode", texto: "Continuar", onclick: continuar }));
        (extras || []).forEach(function (x) {
          g.append(el("button", { type: "button", class: "botao-audio-sala", "data-fala": x.nome, "data-som": x.som || "clique", texto: x.nome, onclick: x.acao }));
        });
        g.append(el("button", { type: "button", class: "botao-audio-sala", "data-fala": "Trocar de sala", "data-som": "proximo", texto: "Trocar de sala", onclick: function () { inicio(); } }));
        c.append(g);
      }
    });
    const fala = [{ som: "festa_" + salaId, pausa: 1500 }];
    if (peca) {
      fala.push({ som: "pecaNova", pausa: 1000 }, "Uau! Peça nova!", maiuscula(peca.nome) + "!");
      if (n === Campeao.PECAS.length) fala.push("O Robô Campeão está completo!");
    } else fala.push("Muito bem!");
    fala.push("Continuar ou trocar de sala?");
    dizer(fala);
  }

  // Escolhe os 3 desafios da rodada, seguindo de onde o estudante parou.
  function rodada(total, chave, inicioDuplo) {
    let pos = est.pos[chave];
    if (pos === undefined) pos = Config.get("ano") > 1 ? inicioDuplo : 0;
    const indices = [];
    for (let k = 0; k < POR_RODADA; k++) {
      let i = pos + k;
      if (i >= total) i = inicioDuplo + Math.floor(Math.random() * Math.max(1, total - inicioDuplo));
      indices.push(Math.min(i, total - 1));
    }
    return { indices: indices, terminar: function () { est.pos[chave] = Math.min(pos + POR_RODADA, total); salvar(); } };
  }

  /* ---------- Peças usadas no Modo Áudio: só 3 tipos, cada um com 3 opções ---------- */
  const CAMPOS = ["cabeca", "antenas", "locomocao"];
  function valores(campo) { return Robo.peca(campo).valores; }
  function somOpcao(campo, v) {
    if (campo === "cabeca") return "cab_" + v;
    if (campo === "antenas") return "ant_" + v;
    return Robo.somDa("locomocao", v);
  }
  function nomeOpcao(campo, v) {
    if (campo === "antenas") return ["Sem antena", "Uma antena", "Duas antenas"][v];
    return maiuscula(v);
  }
  function trecho(g) {
    if (g.campo === "cabeca") return "cabeça " + g.valor;
    if (g.campo === "antenas") return g.valor === 0 ? "sem antenas" : Robo.quantidade("antenas", g.valor);
    return g.valor;
  }
  function textoPedido(regras) {
    if (regras.length === 1) {
      const g = regras[0];
      if (g.campo === "cabeca") return "Escolha uma cabeça " + g.valor + ".";
      if (g.campo === "antenas") return g.valor === 0 ? "Escolha: sem antenas." : "Escolha " + Robo.quantidade("antenas", g.valor) + ".";
      return "Escolha " + g.valor + ".";
    }
    return "Monte: " + regras.map(trecho).join(" e ") + ".";
  }
  function roboAutomatico(k) {
    return { cabeca: "quadrada", corpo: "grande", bracos: 2, locomocao: "pernas", antenas: 1, acessorio: "nenhum", cor: CORES[k % CORES.length].id };
  }

  /* =======================================================================
     LINHA DE MONTAGEM (Modo Áudio)
     ======================================================================= */
  let pedidosCache = null;
  function pedidos() {
    if (pedidosCache) return pedidosCache;
    const brutos = (DESAFIOS.modoAudio && DESAFIOS.modoAudio.montagem) || [];
    pedidosCache = [];
    brutos.forEach(function (p, i) {
      try {
        const regras = (Array.isArray(p) ? p : [p]).map(Robo.lerRegra);
        if (!regras.length || regras.length > 2) throw new Error("use 1 ou 2 regras");
        regras.forEach(function (g) {
          if (CAMPOS.indexOf(g.campo) < 0 || g.op !== "=" || g.outroCampo) throw new Error("use só cabeca, antenas ou locomocao, com =");
        });
        if (regras.length === 2 && regras[0].campo === regras[1].campo) throw new Error("as duas regras falam da mesma peça");
        pedidosCache.push(regras);
      } catch (erro) { console.warn("Modo Áudio, Linha de Montagem, pedido " + (i + 1) + " foi pulado: " + erro.message); }
    });
    if (!pedidosCache.length) pedidosCache = [[Robo.lerRegra("cabeca = redonda")], [Robo.lerRegra("locomocao = rodas")], [Robo.lerRegra("antenas = 2")]];
    return pedidosCache;
  }

  function montagem() {
    const lista = pedidos();
    let inicioDuplo = lista.findIndex(function (r) { return r.length > 1; });
    if (inicioDuplo < 0) inicioDuplo = 0;
    const rod = rodada(lista.length, "montagem", inicioDuplo);
    const intro = primeiraVez("montagem");
    let k = 0;
    desafio();

    function desafio() {
      const regras = lista[rod.indices[k]];
      const robo = roboAutomatico(k);
      regras.forEach(function (g) { robo[g.campo] = null; });
      let passo = 0, c, def;
      const pedido = textoPedido(regras);

      def = abrirTela({
        id: "audio-montagem",
        titulo: "Linha de Montagem – robô " + (k + 1) + " de " + POR_RODADA,
        progresso: { atual: k, total: POR_RODADA, texto: "Robô " + (k + 1) + " de " + POR_RODADA },
        ajuda: [pedido, "Setas: ouvir as peças.", "Enter: escolher."],
        foco: function () { return c.querySelector(".botao-opcao"); },
        tecla: function (e) {
          const t = e.key.toLowerCase();
          if (t === "p") { dizer([pedido]); return true; }
          if (t === "l") { dizer([descrever()]); return true; }
          if (/^[1-3]$/.test(t)) { const b = c.querySelectorAll(".botao-opcao")[Number(t) - 1]; if (b) b.click(); return true; }
          return false;
        },
        montar: function (cc) {
          c = cc;
          c.append(el("p", { class: "pedido-texto", texto: pedido }),
            el("div", { class: "robo-montado robo-audio" }),
            el("div", { class: "opcoes-lista opcoes-audio", "data-grupo": "opcoes-audio" }));
          menu();
        }
      });

      function descrever() {
        return regras.map(function (g) { return robo[g.campo] === null ? "falta " + (g.campo === "cabeca" ? "cabeça" : g.campo === "antenas" ? "antenas" : "rodas, pernas ou esteira") : trecho({ campo: g.campo, valor: robo[g.campo] }); }).join(", ") + ".";
      }

      function pintarRobo() {
        const r = Object.assign({}, robo);
        c.querySelector(".robo-audio").innerHTML = Robo.desenhar(r);
      }

      function menu() {
        const g = regras[passo];
        const caixa = c.querySelector(".opcoes-audio");
        caixa.innerHTML = "";
        valores(g.campo).forEach(function (v, i) {
          const prev = Object.assign({}, robo); prev[g.campo] = v;
          ["cabeca", "locomocao"].forEach(function (x) { if (prev[x] === null) prev[x] = x === "cabeca" ? "redonda" : "pernas"; });
          if (prev.antenas === null) prev.antenas = 0;
          const b = el("button", { type: "button", class: "botao-opcao", "data-som": somOpcao(g.campo, v), "data-fala": nomeOpcao(g.campo, v),
            html: '<span class="opcao-desenho" aria-hidden="true">' + Robo.desenhar(prev, { destaque: g.campo, rotulo: "" }) + '</span><span class="opcao-nome">' + (i + 1) + ". " + nomeOpcao(g.campo, v) + "</span>" });
          b.addEventListener("click", function () { escolher(g, v); });
          caixa.append(b);
        });
        pintarRobo();
      }
      function primeiraOpcao() {
        const b = c.querySelector(".botao-opcao");
        App.focar(b, true);
        return [{ som: b.getAttribute("data-som"), pausa: 350 }, b.getAttribute("data-fala") + "."];
      }

      function escolher(g, v) {
        if (v !== g.valor) {
          dizer([{ som: "tenteDeNovo", pausa: 450 }, "Pedido: " + trecho(g) + "."]);
          return;
        }
        robo[g.campo] = v;
        passo++;
        if (passo < regras.length) {
          menu();
          dizer([{ som: somOpcao(g.campo, v), pausa: 300 }, { som: "acerto", pausa: 500 }, "Agora: " + trecho(regras[passo]) + "."].concat(primeiraOpcao()));
          return;
        }
        pintarRobo();
        c.querySelector(".opcoes-audio").innerHTML = "";
        dizer([{ som: somOpcao(g.campo, v), pausa: 300 }, { som: "acerto", pausa: 700 }]).then(function () {
          if (!minhaTela(def)) return;
          k++;
          if (k < POR_RODADA) { Sons.tocar("proximo"); setTimeout(function () { if (minhaTela(def)) desafio(); }, 350); }
          else { rod.terminar(); fimRodada("montagem", montagem); }
        });
      }

      // Fala inicial: instrução completa só na primeira vez.
      const fala = [];
      if (intro && k === 0) fala.push("Vamos montar robôs!", "Setas: ouvir as peças.", "Enter: escolher a certa.");
      fala.push(pedido);
      dizer(fala.concat(primeiraOpcao()));
    }
  }

  /* =======================================================================
     TORRE (Modo Áudio): 2 discos; 3 discos só se o estudante pedir
     ======================================================================= */
  const NOME_PINO = ["Esquerda", "Meio", "Direita"];
  function lugar(i) { return i === 1 ? "o meio" : i === 0 ? "a esquerda" : "a direita"; }

  function torre() {
    const n = est.torreDiscos === 3 ? 3 : 2;
    const alvos = n === 3 ? [2] : [2, 1, 2];   // com 3 discos, a rodada tem 1 torre (para durar pouco)
    const intro = primeiraVez("torre");
    let k = 0;
    jogar();

    function jogar() {
      const para = alvos[k];
      const nomes = n === 2 ? ["pequeno", "grande"] : ["pequeno", "médio", "grande"];
      const pinos = [[], [], []];
      for (let s = n; s >= 1; s--) pinos[0].push(s);
      let seg = null, fim = false, c, def;

      function topo(i) { return pinos[i][pinos[i].length - 1]; }
      function nome(s) { return nomes[s - 1]; }
      function pode(s, i) { return topo(i) === undefined || topo(i) > s; }
      function movivel(i) { return pinos[i].length > 0 && [0, 1, 2].some(function (j) { return j !== i && pode(topo(i), j); }); }
      function descreverTorre() {
        return [0, 1, 2].map(function (i) {
          return NOME_PINO[i] + ": " + (pinos[i].length ? pinos[i].slice().reverse().map(nome).join(", ") : "vazio") + ".";
        }).join(" ");
      }

      def = abrirTela({
        id: "audio-torre",
        titulo: "Torre – " + (k + 1) + " de " + alvos.length,
        progresso: { atual: k, total: alvos.length, texto: "Torre " + (k + 1) + " de " + alvos.length },
        ajuda: ["Leve os discos para " + lugar(para) + ".", "Setas: pinos. Enter: pegar e colocar.", "T: ouvir a torre."],
        foco: function () { return c.querySelectorAll(".pino")[0]; },
        tecla: function (e) {
          const t = e.key.toLowerCase();
          if (t === "t") { dizer([descreverTorre()]); return true; }
          if (t === "1" || t === "2" || t === "3") { App.focar(c.querySelectorAll(".pino")[Number(t) - 1]); return true; }
          return false;
        },
        montar: function (cc) {
          c = cc;
          c.append(el("p", { class: "objetivo", texto: "Leve os discos para " + lugar(para) + "." }));
          const t = el("div", { class: "torre", "data-grupo": "pinos-audio" });
          [0, 1, 2].forEach(function (i) {
            const b = el("button", { type: "button", class: "pino" + (i === para ? " chegada" : ""), "data-pino": i, "data-pan": PAN[i] });
            b.addEventListener("click", function () { tocarPino(i); });
            t.append(b);
          });
          c.append(t);
          pintar();
        }
      });

      // Cada pino diz pouco e "soa" diferente: disco que pode sair = som do disco; não pode = som grave.
      function pintar() {
        c.querySelectorAll(".pino").forEach(function (b, i) {
          let discos = "";
          pinos[i].forEach(function (s, x) {
            const larg = 32 + (s - 1) * (58 / (n - 1));
            discos += '<span class="disco d' + s + (x === pinos[i].length - 1 && seg === i ? " levantado" : "") + '" style="width:' + larg + '%"><span class="disco-nome">' + nome(s) + "</span></span>";
          });
          b.innerHTML = '<span class="area-pino" aria-hidden="true"><span class="haste"></span><span class="pilha">' + discos + "</span></span>" +
            '<span class="nome-pino">' + NOME_PINO[i] + (i === para ? ' <span class="bandeira">🏁 Chegada</span>' : "") + "</span>";
          b.classList.toggle("segurando", seg === i);
          let fala, som, arg = "";
          if (seg === null) {
            fala = NOME_PINO[i] + ": " + (pinos[i].length ? pinos[i].slice().reverse().map(nome).join(", ") : "vazio") + ".";
            if (movivel(i)) { som = "disco"; arg = nome(topo(i)); } else som = "naoPode";
          } else if (seg === i) { fala = NOME_PINO[i] + ": devolver."; som = "soltar"; }
          else if (pode(topo(seg), i)) { fala = NOME_PINO[i] + ": pode."; som = "pode"; }
          else { fala = NOME_PINO[i] + ": não pode."; som = "naoPode"; }
          b.setAttribute("data-fala", fala);
          b.setAttribute("aria-label", fala);
          b.setAttribute("data-som", som);
          b.setAttribute("data-som-arg", arg);
        });
      }

      function tocarPino(i) {
        if (fim) return;
        const pan = PAN[i];
        if (seg === null) {
          if (!pinos[i].length) { dizer([{ som: "naoPode", pan: pan, pausa: 250 }, "Vazio."]); return; }
          if (!movivel(i)) { dizer([{ som: "naoPode", pan: pan, pausa: 250 }, "Esse não pode sair agora."]); return; }
          seg = i; pintar();
          dizer([{ som: "pegar", pan: pan, pausa: 150 }, { som: "disco", arg: nome(topo(i)), pan: pan, pausa: 300 }, "Pegou o " + nome(topo(i)) + "."]);
          return;
        }
        if (seg === i) { seg = null; pintar(); dizer([{ som: "soltar", pan: pan, pausa: 200 }, "Devolveu."]); return; }
        const s = topo(seg);
        if (!pode(s, i)) { dizer([{ som: "naoPode", pan: pan, pausa: 250 }, "Não pode."]); return; }
        pinos[i].push(pinos[seg].pop());
        seg = null;
        pintar();
        if (pinos[para].length === n) {
          fim = true;
          dizer([{ som: "disco", arg: nome(s), pan: pan, pausa: 300 }, { som: "acerto", pausa: 700 }]).then(function () {
            if (!minhaTela(def)) return;
            k++;
            if (k < alvos.length) { Sons.tocar("proximo"); setTimeout(function () { if (minhaTela(def)) jogar(); }, 350); }
            else fimRodada("torre", torre, [n === 2
              ? { nome: "Quero três discos", som: "salaTorre", acao: function () { est.torreDiscos = 3; salvar(); torre(); } }
              : { nome: "Voltar para dois discos", som: "salaTorre", acao: function () { est.torreDiscos = 2; salvar(); torre(); } }]);
          });
          return;
        }
        dizer([{ som: "disco", arg: nome(s), pan: pan, pausa: 250 }, NOME_PINO[i] + "."]);
      }

      const fala = [];
      if (intro && k === 0) fala.push("Torre!", "Leve os discos para a direita.", "O grande nunca fica em cima do pequeno.", "Setas: pinos. Enter: pegar e colocar.");
      else fala.push("Leve para " + lugar(para) + ".");
      dizer(fala);
    }
  }

  /* =======================================================================
     PADRÕES (Modo Áudio): até 4 sons antes da pergunta; 2 opções no começo
     ======================================================================= */
  let padroesCache = null;
  function listaPadroes() {
    if (padroesCache) return padroesCache;
    padroesCache = [];
    ((DESAFIOS.modoAudio && DESAFIOS.modoAudio.padroes) || []).forEach(function (d, i) {
      try {
        const seq = String(d.sequencia).trim().split(/\s+/).map(Robo.normalizar);
        const resp = Robo.normalizar(d.resposta || "");
        if (seq[seq.length - 1] !== "?" || seq.indexOf("?") !== seq.length - 1) throw new Error('o "?" precisa ser o último');
        if (seq.length - 1 > 4 || seq.length < 3) throw new Error("use de 2 a 4 sons antes do ?");
        seq.slice(0, -1).concat([resp]).forEach(function (t) { if (!SONS_PADRAO[t]) throw new Error('som desconhecido "' + t + '"'); });
        padroesCache.push({ seq: seq.slice(0, -1), resposta: resp, opcoes: Number(d.opcoes) === 3 ? 3 : 2 });
      } catch (erro) { console.warn("Modo Áudio, Padrões, desafio " + (i + 1) + " foi pulado: " + erro.message); }
    });
    if (!padroesCache.length) padroesCache = [{ seq: ["bip", "buzina", "bip"], resposta: "buzina", opcoes: 2 }];
    return padroesCache;
  }

  function padroes() {
    const lista = listaPadroes();
    let inicio3 = lista.findIndex(function (d) { return d.opcoes === 3; });
    if (inicio3 < 0) inicio3 = 0;
    const rod = rodada(lista.length, "padroes", inicio3);
    const intro = primeiraVez("padroes");
    let k = 0;
    desafio();

    function desafio() {
      const d = lista[rod.indices[k]];
      const ops = [d.resposta];
      d.seq.forEach(function (t) { if (ops.length < d.opcoes && ops.indexOf(t) < 0) ops.push(t); });
      Object.keys(SONS_PADRAO).forEach(function (t) { if (ops.length < d.opcoes && ops.indexOf(t) < 0) ops.push(t); });
      const opcoes = embaralhar(ops);
      const NUM = ["Um.", "Dois.", "Três."];
      let fim = false, c, def;

      def = abrirTela({
        id: "audio-padroes",
        titulo: "Padrões – " + (k + 1) + " de " + POR_RODADA,
        progresso: { atual: k, total: POR_RODADA, texto: "Sequência " + (k + 1) + " de " + POR_RODADA },
        ajuda: ["Escute os sons.", "Escolha o que vem depois.", "Aperte " + (opcoes.length === 2 ? "1 ou 2." : "1, 2 ou 3."), "P: ouvir de novo."],
        foco: function () { return c.querySelector(".opcao-padrao"); },
        tecla: function (e) {
          const t = e.key.toLowerCase();
          if (t === "p") { dizer(sequencia(true)); return true; }
          if (/^[1-3]$/.test(t) && Number(t) <= opcoes.length) { responder(Number(t) - 1); return true; }
          return false;
        },
        montar: function (cc) {
          c = cc;
          const s = el("div", { class: "sequencia", "aria-hidden": "true" });
          s.innerHTML = d.seq.map(function (t) { return '<span class="peca peca-som"><span class="peca-nome">' + t + "</span></span>"; }).join("") +
            '<span class="peca"><span class="peca-desenho interrogacao">?</span></span>';
          const g = el("div", { class: "opcoes-padrao", "data-grupo": "opcoes-audio" });
          opcoes.forEach(function (t, i) {
            const b = el("button", { type: "button", class: "opcao-padrao", "data-som": t, "data-fala": (i + 1) + ": " + t,
              html: '<span class="numero-opcao" aria-hidden="true">' + (i + 1) + '</span><span class="peca-nome">' + t + "</span>" });
            b.addEventListener("click", function () { responder(i); });
            g.append(b);
          });
          c.append(el("p", { class: "instrucao", texto: "O que vem depois?" }), s, g);
        }
      });

      // Só os sons, sem dizer os nomes; depois "E agora?" e as opções (número + som).
      function sequencia(comOpcoes) {
        const passos = [];
        const pecas = c.querySelectorAll(".sequencia .peca");
        d.seq.forEach(function (t, i) {
          passos.push({ som: t, pausa: Sons.duracao(t) + 250, aoTocar: function () {
            pecas.forEach(function (p) { p.classList.remove("tocando"); }); if (pecas[i]) pecas[i].classList.add("tocando");
          } });
        });
        passos.push({ som: "nada", pausa: 0, aoTocar: function () { pecas.forEach(function (p) { p.classList.remove("tocando"); }); } });
        passos.push("E agora?");
        if (comOpcoes) opcoes.forEach(function (t, i) { passos.push(NUM[i], { som: t, pausa: Sons.duracao(t) + 200 }); });
        return passos;
      }

      function responder(i) {
        if (fim) return;
        const t = opcoes[i];
        if (t !== d.resposta) {
          dizer([{ som: "tenteDeNovo", pausa: 500 }].concat(sequencia(false)));
          return;
        }
        fim = true;
        dizer([{ som: t, pausa: Sons.duracao(t) + 150 }, { som: "acerto", pausa: 700 }]).then(function () {
          if (!minhaTela(def)) return;
          k++;
          if (k < POR_RODADA) { Sons.tocar("proximo"); setTimeout(function () { if (minhaTela(def)) desafio(); }, 350); }
          else { rod.terminar(); fimRodada("padroes", padroes); }
        });
      }

      const fala = [];
      if (intro && k === 0) fala.push("Escute os sons.", "Depois, escolha o que vem.");
      dizer(fala.concat(sequencia(true)));
    }
  }

  /* =======================================================================
     ESTEIRA RÁPIDA (só no Modo Áudio)
     Robôs passam um de cada vez, da esquerda para a direita.
     O estudante aperta Enter quando passar o robô do pedido.
     ======================================================================= */
  function descricao(campo, v) {
    if (campo === "locomocao") return "Robô de " + v;
    if (campo === "antenas") return v === 0 ? "Robô sem antenas" : v === 1 ? "Robô de uma antena" : "Robô de duas antenas";
    return "Robô de cabeça " + v;
  }

  function esteira() {
    const r = est.rodadas.esteira || 0;
    const campo = CAMPOS[[2, 1, 0][r % 3]];          // rodadas: rodas/pernas/esteira, depois antenas, depois cabeça
    const vals = valores(campo);
    const alvo = vals[Math.floor(Math.random() * vals.length)];
    const pedido = "Pegue o " + descricao(campo, alvo).replace("Robô", "robô") + "!";
    const intro = primeiraVez("esteira");
    let pegos = 0, dur = Math.max(3400, 5200 - r * 300);   // começa devagar
    let atual = null, motor = null, inicioPassagem = 0, timerPassagem = null, desdeAlvo = 0, ativo = true;
    const timers = [];
    let c, def;

    function agendar(f, ms) { timers.push(setTimeout(function () { if (ativo) f(); }, ms)); }
    function parar() {
      ativo = false;
      timers.forEach(clearTimeout);
      clearTimeout(timerPassagem);
      if (motor) motor.parar();
    }

    def = abrirTela({
      id: "audio-esteira",
      titulo: "Esteira Rápida",
      ajuda: [pedido, "Aperte Enter quando ele passar."],
      foco: function () { return c.querySelector(".botao-pegar"); },
      sair: parar,
      tecla: function (e) {
        if (e.key === "Enter") { pegar(); return true; }
        if (e.key.toLowerCase() === "p") { dizer([pedido]); return true; }
        return false;
      },
      montar: function (cc) {
        c = cc;
        c.append(
          el("p", { class: "pedido-texto", texto: pedido }),
          el("div", { class: "esteira-pista", "aria-hidden": "true" }, el("div", { class: "esteira-robo" })),
          el("div", { "data-grupo": "esteira" }, el("button", { type: "button", class: "botao principal botao-pegar", "data-fala": "Pegar", texto: "Pegar! (Enter)", onclick: pegar })),
          el("p", { class: "contador", texto: "Pegos: 0 de " + POR_RODADA })
        );
      }
    });

    function proximoRobo() {
      // Com uma janela aberta (por exemplo, a Pausa), a esteira espera.
      if (document.querySelector("dialog[open]")) { agendar(proximoRobo, 400); return; }
      desdeAlvo++;
      const ehAlvo = desdeAlvo >= 3 || Math.random() < 0.45;
      let v = alvo;
      if (ehAlvo) desdeAlvo = 0;
      else { const outros = vals.filter(function (x) { return x !== alvo; }); v = outros[Math.floor(Math.random() * outros.length)]; }
      const robo = roboAutomatico(Math.floor(Math.random() * 6));
      robo[campo] = v;
      robo.cabeca = campo === "cabeca" ? v : ["redonda", "quadrada", "triangular"][Math.floor(Math.random() * 3)];
      atual = { robo: robo, valor: v, pego: false };
      inicioPassagem = Date.now();

      // Desenho atravessando a esteira
      const pista = c.querySelector(".esteira-pista");
      const caixa = c.querySelector(".esteira-robo");
      caixa.style.transition = "none";
      caixa.style.transform = "translateX(-10rem)";
      caixa.classList.remove("pego");
      caixa.innerHTML = Robo.desenhar(robo, { rotulo: "" });
      void caixa.offsetWidth;
      caixa.style.transition = "transform " + dur + "ms linear";
      caixa.style.transform = "translateX(" + pista.clientWidth + "px)";

      motor = Sons.passar(dur);
      Voz.sequencia([{ som: somOpcao(campo, v), pan: -0.6, pausa: 380 }, { texto: descricao(campo, v) + "." }]);
      timerPassagem = setTimeout(function () {
        if (!ativo) return;
        atual = null; motor = null;
        agendar(proximoRobo, 600);
      }, dur);
    }

    function pegar() {
      if (!atual || atual.pego) return;   // sem robô passando: nada acontece
      const pan = Math.max(-1, Math.min(1, -1 + 2 * (Date.now() - inicioPassagem) / dur));
      if (atual.valor !== alvo) { Sons.tocar("clique", null, pan); return; }   // errar não tira nada: a esteira continua
      atual.pego = true;
      clearTimeout(timerPassagem);
      if (motor) motor.parar();
      Voz.parar();
      Sons.tocar("acerto", null, pan);
      pegos++;
      c.querySelector(".esteira-robo").classList.add("pego");
      c.querySelector(".contador").textContent = "Pegos: " + pegos + " de " + POR_RODADA;
      atual = null; motor = null;
      dur = Math.max(2000, Math.round(dur * 0.85));   // acelera um pouco a cada acerto
      if (pegos >= POR_RODADA) { ativo = false; setTimeout(function () { if (minhaTela(def)) fimRodada("esteira", esteira); }, 900); return; }
      agendar(proximoRobo, 1100);
    }

    const fala = [];
    if (intro) fala.push("Esteira Rápida!", "Robôs vão passar, um de cada vez.", "Aperte Enter quando passar o robô certo.");
    fala.push(pedido);
    dizer(fala).then(function () { if (minhaTela(def) && ativo) agendar(proximoRobo, 500); });
  }

  return {
    inicio: inicio,
    apagar: function () { Guardar.apagar(CHAVE); est = carregar(); }
  };
})();
