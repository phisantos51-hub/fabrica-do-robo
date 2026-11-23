/* =========================================================================
   SALA 1 – LINHA DE MONTAGEM
   1º e 2º ano: montar o robô do pedido.
   3º ano: descobrir o robô pelas pistas e, no fim, criar pistas.
   ========================================================================= */
(function () {
  const SALA = "montagem";
  const cache = {};

  /* ---------- Conferência dos desafios do arquivo desafios.js ---------- */
  function normalizarRobo(r, n) {
    const novo = { cor: r.cor || "azul" };
    PECAS.forEach(function (p) {
      let v = r[p.campo];
      if (typeof v === "string") v = Robo.normalizar(v);
      if (v === "gravata-borboleta") v = "gravata";
      if (p.campo === "bracos" || p.campo === "antenas") v = Number(v);
      if (p.valores.indexOf(v) < 0) throw new Error("Robô " + n + ": valor inválido em " + p.campo);
      novo[p.campo] = v;
    });
    return novo;
  }
  function todosOsRobos() {
    const lista = [];
    PECAS[0].valores.forEach(function (a) { PECAS[1].valores.forEach(function (b) { PECAS[2].valores.forEach(function (c) {
      PECAS[3].valores.forEach(function (d) { PECAS[4].valores.forEach(function (e) { PECAS[5].valores.forEach(function (f) {
        lista.push({ cabeca: a, corpo: b, bracos: c, locomocao: d, antenas: e, acessorio: f });
      }); }); });
    }); }); });
    return lista;
  }
  function cumpreTodas(r, regras) { return regras.every(function (g) { return Robo.cumpre(r, g); }); }

  function lista(ano) {
    if (cache[ano]) return cache[ano];
    const brutos = (DESAFIOS.montagem && DESAFIOS.montagem["ano" + ano]) || [];
    const ok = [];
    brutos.forEach(function (d, i) {
      try {
        if (ano < 3 || (!d.tipo && d.regras)) {
          const regras = d.regras.map(Robo.lerRegra);
          if (!todosOsRobos().some(function (r) { return cumpreTodas(r, regras); })) throw new Error("nenhum robô consegue atender ao pedido");
          ok.push({ tipo: "montar", regras: regras, texto: d.texto || Robo.textoPedido(regras) });
        } else if (d.tipo === "criar") {
          const robos = d.robos.map(normalizarRobo);
          const alvo = Number(d.alvo) - 1;
          if (!robos[alvo]) throw new Error("alvo fora da lista");
          const iguais = robos.filter(function (r) { return PECAS.every(function (p) { return r[p.campo] === robos[alvo][p.campo]; }); });
          if (iguais.length > 1) throw new Error("há outro robô igual ao alvo");
          ok.push({ tipo: "criar", robos: robos, alvo: alvo });
        } else {
          const robos = d.robos.map(normalizarRobo);
          const pistas = d.pistas.map(Robo.lerRegra);
          const servem = robos.map(function (r, k) { return cumpreTodas(r, pistas) ? k : -1; }).filter(function (k) { return k >= 0; });
          if (servem.length !== 1) throw new Error("as pistas servem para " + servem.length + " robôs (precisa ser 1)");
          ok.push({ tipo: "descobrir", robos: robos, pistas: pistas, resposta: servem[0] });
        }
      } catch (erro) {
        console.warn("Linha de Montagem, " + ano + "º ano, desafio " + (i + 1) + " foi pulado: " + erro.message);
      }
    });
    cache[ano] = ok;
    return ok;
  }

  function estrelasPorErros(erros) { return erros === 0 ? 3 : erros === 1 ? 2 : 1; }

  /* ---------- Pictogramas das regras (para quem ainda não lê) ---------- */
  const BASE = { cabeca: "redonda", corpo: "grande", bracos: 2, locomocao: "rodas", antenas: 1, acessorio: "nenhum", cor: "cinza" };
  function chip(g, comTexto) {
    const li = el("span", { class: "chip" });
    if (g.outroCampo) {
      const a = Object.assign({}, BASE, { bracos: 4, antenas: 1 });
      li.innerHTML = '<span class="chip-desenho comparar" aria-hidden="true">' + Robo.desenhar(Object.assign({}, a, { antenas: 0 }), { destaque: g.campo, rotulo: "" }) +
        '<b>' + (g.op === ">" ? "&gt;" : g.op === "<" ? "&lt;" : "=") + "</b>" +
        Robo.desenhar(Object.assign({}, a, { bracos: 0, antenas: 2 }), { destaque: g.outroCampo, rotulo: "" }) + "</span>";
    } else if (typeof g.valor === "number" && g.op !== "=" && g.op !== "!=") {
      li.innerHTML = '<span class="chip-desenho" aria-hidden="true">' + Robo.desenhar(Object.assign({}, BASE, (function () { const o = {}; o[g.campo] = 4; return o; })()), { destaque: g.campo, rotulo: "" }) + "</span>";
    } else {
      const r = Object.assign({}, BASE);
      r[g.campo] = g.valor;
      const nao = g.op === "!=";
      li.innerHTML = '<span class="chip-desenho' + (nao ? " nao" : "") + '" aria-hidden="true">' + Robo.desenhar(r, { destaque: g.campo, rotulo: "" }) +
        (nao ? '<svg class="xis" viewBox="0 0 100 100"><path d="M15 15 L85 85 M85 15 L15 85"/></svg>' : "") + "</span>";
    }
    if (comTexto !== false) li.append(el("span", { class: "chip-texto", texto: Robo.trechoPedido(g).replace(/^com /, "") }));
    return li;
  }

  /* =======================================================================
     1º e 2º ano: MONTAR O ROBÔ DO PEDIDO
     ======================================================================= */
  function abrirMontar(ano, indice) {
    const d = lista(ano)[indice];
    let robo = Robo.novo();
    let erros = 0;
    let aberta = "cabeca";
    let c;
    const CATEGORIAS = PECAS.concat([{ campo: "cor", nome: "Cor (enfeite)", valores: CORES.map(function (x) { return x.id; }) }]);

    function falarRobo() {
      const passos = [{ texto: "O seu robô." }];
      PECAS.forEach(function (p) {
        passos.push({ som: Robo.somDa(p.campo, robo[p.campo]), pausa: 300 });
        passos.push({ texto: p.nome + ": " + Robo.valorCurto(p.campo, robo[p.campo]) + "." });
      });
      Voz.sequencia(passos);
    }
    function falarPedido() { Voz.anunciar("Pedido do cliente: " + d.texto); }

    telaDesafio(SALA, ano, indice, {
      ajuda: "Monte o robô do pedido. Nas peças, use as setas e aperte Enter para abrir um menu de opções. Escolha uma opção com Enter. Tecla L: ouvir o seu robô. Tecla P: ouvir o pedido. No fim, vá até Entregar o robô e aperte Enter.",
      fala: Config.get("modoAudio")
        ? "Fase " + (indice + 1) + ". Pedido do cliente: " + d.texto + " Use as setas para escolher as peças. Aperte L para ouvir o seu robô e P para ouvir o pedido."
        : "Pedido do cliente: " + d.texto,
      foco: function () { return c.querySelector('.menu-pecas [data-campo="cabeca"]'); },
      tecla: function (e) {
        const k = e.key.toLowerCase();
        if (k === "l") { falarRobo(); return true; }
        if (k === "p") { falarPedido(); return true; }
        return false;
      },
      voltar: function () {
        const ativo = document.activeElement;
        if (ativo && ativo.closest(".painel-opcoes")) {
          App.focar(c.querySelector('.menu-pecas [data-campo="' + aberta + '"]'), true);
          Voz.anunciar("Voltei para as peças. " + nomeCategoria(aberta) + ".");
          return;
        }
        telaFases(SALA, indice);
      },
      montar: function (conteudo) {
        c = conteudo;
        // Pedido
        const pedido = el("section", { class: "pedido", "aria-labelledby": "t-pedido" });
        pedido.append(el("h2", { id: "t-pedido", texto: "Pedido do cliente" }));
        pedido.append(el("p", { class: "pedido-texto", texto: d.texto }));
        const chips = el("div", { class: "chips", "aria-hidden": "true" });
        d.regras.forEach(function (g, i) { const ch = chip(g); ch.setAttribute("data-regra", i); chips.append(ch); });
        pedido.append(chips);
        pedido.append(el("button", { type: "button", class: "botao so-com-som", "data-sem-seta": "", html: ICONES.ouvir + "<span>Ouvir o pedido</span>", onclick: falarPedido }));

        // Oficina
        const oficina = el("div", { class: "oficina" });
        const fig = el("figure", { class: "robo-montado" });
        const area = el("div", { class: "robo-area" });
        fig.append(area, el("figcaption", { texto: "O seu robô" }));
        const menu = el("div", { class: "menu-pecas", "data-grupo": "pecas", role: "group", "aria-label": "Peças do robô" });
        const painel = el("div", { class: "painel-opcoes", "data-grupo": "opcoes", id: "painel-opcoes", role: "group" });
        CATEGORIAS.forEach(function (p) {
          const b = el("button", { type: "button", class: "botao-categoria", "data-campo": p.campo, "aria-controls": "painel-opcoes" });
          b.addEventListener("click", function () { abrirCategoria(p.campo, true); });
          menu.append(b);
        });
        menu.append(el("button", { type: "button", class: "botao so-com-som ouvir-robo", html: ICONES.ouvir + "<span>Ouvir o meu robô (L)</span>", onclick: falarRobo }));
        menu.append(el("button", { type: "button", class: "botao principal entregar", html: ICONES.certo + "<span>Entregar o robô</span>", onclick: entregar }));
        oficina.append(fig, menu, painel);
        c.append(pedido, oficina, el("p", { class: "mensagem", "aria-hidden": "true" }));
        pintar();
        abrirCategoria("cabeca", false);
      }
    });

    function nomeCategoria(campo) { return CATEGORIAS.find(function (p) { return p.campo === campo; }).nome; }

    function pintar() {
      c.querySelector(".robo-area").innerHTML = Robo.desenhar(robo);
      c.querySelectorAll(".botao-categoria").forEach(function (b) {
        const campo = b.getAttribute("data-campo");
        const p = CATEGORIAS.find(function (x) { return x.campo === campo; });
        let valor;
        if (campo === "cor") valor = robo.cor;
        else valor = Robo.valorCurto(campo, robo[campo]);
        const falta = campo !== "cor" && robo[campo] === null;
        b.classList.toggle("falta", falta);
        b.classList.toggle("ativa", campo === aberta);
        b.setAttribute("aria-expanded", String(campo === aberta));
        b.innerHTML = '<span class="cat-nome">' + p.nome + '</span><span class="cat-valor">' + (falta ? "escolha" : valor) + "</span>";
        b.setAttribute("data-fala", p.nome + ": " + valor + ". Aperte Enter para escolher.");
        b.setAttribute("aria-label", p.nome + ": " + (falta ? "falta escolher" : valor));
      });
    }

    function abrirCategoria(campo, pelaCrianca) {
      aberta = campo;
      const painel = c.querySelector(".painel-opcoes");
      const p = CATEGORIAS.find(function (x) { return x.campo === campo; });
      painel.innerHTML = "";
      painel.setAttribute("aria-label", "Opções de " + p.nome);
      painel.append(el("h3", { texto: "Escolha: " + p.nome }));
      const grade = el("div", { class: "opcoes-lista" });
      p.valores.forEach(function (v) {
        const atual = robo[campo] === v;
        let nome, desenho, som;
        if (campo === "cor") {
          const cor = CORES.find(function (x) { return x.id === v; });
          nome = "Cor " + cor.nome;
          desenho = '<span class="amostra-cor" style="background:' + cor.hex + '"></span>';
          som = "cor";
        } else {
          const prev = Object.assign({}, robo); prev[campo] = v;
          ["cabeca", "corpo", "locomocao"].forEach(function (k) { if (prev[k] === null) prev[k] = k === "cabeca" ? "redonda" : k === "corpo" ? "grande" : "pernas"; });
          nome = Robo.nomeValor(campo, v);
          nome = nome.charAt(0).toUpperCase() + nome.slice(1);
          desenho = Robo.desenhar(prev, { destaque: campo, rotulo: "" });
          som = Robo.somDa(campo, v);
        }
        const b = el("button", {
          type: "button", class: "botao-opcao", "aria-pressed": String(atual), "data-som": som,
          "data-fala": nome + (atual ? ", escolhido" : "") + (campo === "cor" ? ". A cor é só um enfeite." : ""),
          html: '<span class="opcao-desenho" aria-hidden="true">' + desenho + '</span><span class="opcao-nome">' + nome + "</span>"
        });
        b.addEventListener("click", function () { escolher(campo, v, nome); });
        grade.append(b);
      });
      painel.append(grade);
      pintar();
      if (pelaCrianca) {
        Sons.tocar("clique");
        if (Config.get("modoAudio") || document.activeElement && document.activeElement.matches(":focus-visible")) {
          const alvo = grade.querySelector('[aria-pressed="true"]') || grade.querySelector("button");
          App.focar(alvo, true);
          const nomes = p.valores.map(function (v) { return campo === "cor" ? v : Robo.valorCurto(campo, v); });
          Voz.anunciar(p.nome + ". Opções: " + Robo.juntar(nomes) + ". Agora em: " + alvo.getAttribute("data-fala") + ".");
        }
      }
    }

    function escolher(campo, v, nome) {
      robo[campo] = v;
      const vindoDoTeclado = document.activeElement && document.activeElement.closest(".painel-opcoes");
      const usandoTeclado = Config.get("modoAudio") || (vindoDoTeclado && document.activeElement.matches(":focus-visible"));
      abrirCategoria(campo, false);
      c.querySelector(".mensagem").textContent = "";
      const som = campo === "cor" ? "cor" : Robo.somDa(campo, v);
      if (usandoTeclado) {
        const i = CATEGORIAS.findIndex(function (p) { return p.campo === campo; });
        const prox = CATEGORIAS[i + 1] && CATEGORIAS[i + 1].campo !== "cor" ? c.querySelector('.menu-pecas [data-campo="' + CATEGORIAS[i + 1].campo + '"]') : c.querySelector(".menu-pecas .entregar");
        App.focar(prox, true);
        Voz.anunciar(nome + ". Pronto. Agora: " + (prox.getAttribute("data-fala") || "Entregar o robô.").replace(/ Aperte Enter para escolher\./, ""), som);
      } else {
        // No mouse, o painel fica parado (sem pular para outra peça), para evitar cliques sem querer.
        const alvo = c.querySelector('.painel-opcoes [aria-pressed="true"]');
        if (alvo && vindoDoTeclado) App.focar(alvo, true);
        Voz.anunciar(nome + ".", som);
      }
    }

    function entregar() {
      c.querySelectorAll(".chip").forEach(function (x) { x.classList.remove("olhe"); });
      const faltam = PECAS.filter(function (p) { return robo[p.campo] === null; }).map(function (p) { return p.nome.toLowerCase(); });
      if (faltam.length) {
        avisar(c, "Ainda falta escolher: " + Robo.juntar(faltam) + ".", "neutra", "tenteDeNovo");
        const p = PECAS.find(function (x) { return robo[x.campo] === null; });
        abrirCategoria(p.campo, false);
        App.focar(c.querySelector('.menu-pecas [data-campo="' + p.campo + '"]'), true);
        return;
      }
      const i = d.regras.findIndex(function (g) { return !Robo.cumpre(robo, g); });
      if (i >= 0) {
        erros++;
        const g = d.regras[i];
        const chipErrado = c.querySelector('.chip[data-regra="' + i + '"]');
        if (chipErrado) chipErrado.classList.add("olhe");
        avisar(c, Msg.quase() + " O pedido diz: " + Robo.trechoPedido(g) + ". " + Robo.oQueTem(robo, g), "dica", "tenteDeNovo");
        return;
      }
      concluirDesafio({
        sala: SALA, ano: ano, indice: indice, estrelas: estrelasPorErros(erros),
        detalhe: "O robô ficou assim: " + Robo.descrever(robo) + ".",
        repetir: function () { abrir(ano, indice); },
        proximo: proximoOuFases(SALA, ano, indice),
        fases: function () { telaFases(SALA, indice + 1 < lista(ano).length ? indice + 1 : indice); }
      });
    }
  }

  /* =======================================================================
     3º ano: DESCOBRIR O ROBÔ PELAS PISTAS
     ======================================================================= */
  function cartaoRobo(r, n, op) {
    op = op || {};
    const caixa = el("div", { class: "cartao-robo" + (op.alvo ? " alvo" : "") });
    const desc = "Robô " + n + (op.alvo ? ", o robô do cliente" : "") + ": " + Robo.descrever(r) + ".";
    const b = el("button", {
      type: "button", class: "robo-escolher", "data-robo": n - 1, "data-fala": desc,
      "aria-label": desc,
      html: '<span class="numero-robo" aria-hidden="true">' + n + "</span>" + (op.alvo ? '<span class="selo-alvo" aria-hidden="true">Cliente</span>' : "") + Robo.desenhar(r, { rotulo: "" })
    });
    caixa.append(b);
    if (op.riscar) {
      const x = el("button", { type: "button", class: "riscar", "data-sem-seta": "", "aria-pressed": "false", "aria-label": "Riscar o robô " + n, texto: "Riscar" });
      x.addEventListener("click", function () { alternarRisco(caixa, n); });
      caixa.append(x);
    }
    return caixa;
  }
  function alternarRisco(caixa, n, forcar) {
    const riscado = forcar !== undefined ? forcar : !caixa.classList.contains("riscado");
    caixa.classList.toggle("riscado", riscado);
    const x = caixa.querySelector(".riscar");
    if (x) { x.setAttribute("aria-pressed", String(riscado)); x.textContent = riscado ? "Desriscar" : "Riscar"; }
    const b = caixa.querySelector(".robo-escolher");
    const base = b.getAttribute("aria-label").replace(/^Riscado\. /, "");
    b.setAttribute("aria-label", (riscado ? "Riscado. " : "") + base);
    b.setAttribute("data-fala", (riscado ? "Riscado. " : "") + base);
    return riscado;
  }

  function abrirDescobrir(ano, indice) {
    const d = lista(ano)[indice];
    let erros = 0, c;
    const nRobos = d.robos.length;
    const textoPistas = d.pistas.map(function (g, i) { return "Pista " + (i + 1) + ": " + Robo.textoPista(g); }).join(" ");

    telaDesafio(SALA, ano, indice, {
      comoJogar: "montagem3",
      ajuda: "Descubra o robô do cliente. Use as setas para ouvir as pistas e os robôs. No robô certo, aperte Enter. As teclas 1 a " + nRobos + " levam direto a um robô. A tecla R risca o robô em que você está. A tecla P repete as pistas.",
      fala: Config.get("modoAudio")
        ? "Fase " + (indice + 1) + ". Descubra o robô do cliente. São " + nRobos + " robôs e " + d.pistas.length + " pistas. " + textoPistas + " Use as setas para ouvir as pistas e os robôs. No robô certo, aperte Enter."
        : "Descubra o robô do cliente. " + textoPistas,
      foco: function () { return c.querySelector(".pista"); },
      tecla: function (e) {
        const k = e.key.toLowerCase();
        if (k === "p") { Voz.anunciar(textoPistas); return true; }
        if (/^[1-9]$/.test(k) && Number(k) <= nRobos) { App.focar(c.querySelector('[data-robo="' + (Number(k) - 1) + '"]')); return true; }
        if (k === "r") {
          const at = document.activeElement && document.activeElement.closest(".cartao-robo");
          if (at) { const n = Number(at.querySelector(".robo-escolher").getAttribute("data-robo")) + 1; Voz.anunciar(alternarRisco(at, n) ? "Robô " + n + " riscado." : "Robô " + n + " sem risco."); }
          return true;
        }
        return false;
      },
      montar: function (conteudo) {
        c = conteudo;
        const g = el("div", { class: "area-pistas", "data-grupo": "desafio" });
        const secP = el("section", { class: "pistas", "aria-labelledby": "t-pistas" });
        secP.append(el("h2", { id: "t-pistas", texto: "Pistas do cliente" }));
        const ol = el("ol", { class: "lista-pistas" });
        d.pistas.forEach(function (p, i) {
          const t = Robo.textoPista(p);
          const b = el("button", { type: "button", class: "pista", "data-fala": "Pista " + (i + 1) + ": " + t });
          b.append(chip(p, false), el("span", { class: "pista-texto", texto: t }));
          b.addEventListener("click", function () { Voz.anunciar("Pista " + (i + 1) + ": " + t); });
          ol.append(el("li", {}, b));
        });
        secP.append(ol);
        const secR = el("section", { class: "robos", "aria-labelledby": "t-robos" });
        secR.append(el("h2", { id: "t-robos", texto: "Qual é o robô do cliente? Clique nele." }));
        const grade = el("div", { class: "grade-robos" });
        d.robos.forEach(function (r, i) {
          const card = cartaoRobo(r, i + 1, { riscar: true });
          card.querySelector(".robo-escolher").addEventListener("click", function () { escolher(i); });
          grade.append(card);
        });
        secR.append(grade);
        g.append(secP, secR);
        c.append(g, el("p", { class: "mensagem", "aria-hidden": "true" }));
      }
    });

    function escolher(i) {
      if (i === d.resposta) {
        concluirDesafio({
          sala: SALA, ano: ano, indice: indice, estrelas: estrelasPorErros(erros),
          detalhe: "O robô " + (i + 1) + " é o robô do cliente.",
          repetir: function () { abrir(ano, indice); },
          proximo: proximoOuFases(SALA, ano, indice),
          fases: function () { telaFases(SALA, indice); }
        });
        return;
      }
      erros++;
      const r = d.robos[i];
      const g = d.pistas.find(function (p) { return !Robo.cumpre(r, p); });
      const card = c.querySelectorAll(".cartao-robo")[i];
      alternarRisco(card, i + 1, true);
      avisar(c, Msg.quase() + " O robô " + (i + 1) + " não serve. A pista diz: " + Robo.textoPista(g) + " " + Robo.oQueTem(r, g, "O robô " + (i + 1)), "dica", "tenteDeNovo");
    }
  }

  /* =======================================================================
     3º ano (fases finais): CRIAR PISTAS para um robô
     ======================================================================= */
  function gerarPistas(robos, alvo) {
    const t = robos[alvo];
    const outros = robos.filter(function (_, i) { return i !== alvo; });
    const iguais = [], negacoes = [], falsas = [];
    PECAS.forEach(function (p) {
      iguais.push(p.campo + " = " + t[p.campo]);
      const valoresOutros = [];
      outros.forEach(function (r) { if (r[p.campo] !== t[p.campo] && valoresOutros.indexOf(r[p.campo]) < 0) valoresOutros.push(r[p.campo]); });
      if (p.campo !== "corpo") valoresOutros.forEach(function (w) { if (w !== 1) negacoes.push(p.campo + " != " + w); });
      valoresOutros.forEach(function (w) { falsas.push(p.campo + " = " + w); });
      if (valoresOutros.length) falsas.push(p.campo + " != " + t[p.campo]);
    });
    const comp = t.bracos > t.antenas ? "bracos > antenas" : t.bracos < t.antenas ? "bracos < antenas" : "bracos = antenas";
    const verdadeiras = iguais.concat([comp], embaralhar(negacoes).slice(0, 3));
    const escolhidas = embaralhar(falsas).slice(0, 2);
    return embaralhar(verdadeiras.map(function (s) { return { regra: Robo.lerRegra(s), certa: true }; })
      .concat(escolhidas.map(function (s) { return { regra: Robo.lerRegra(s), certa: false }; })));
  }
  function menorNumero(robos, alvo, candidatas) {
    const v = candidatas.filter(function (x) { return x.certa; }).map(function (x) { return x.regra; });
    let melhor = v.length;
    for (let m = 1; m < (1 << v.length); m++) {
      const sub = v.filter(function (_, i) { return m & (1 << i); });
      if (sub.length >= melhor) continue;
      const servem = robos.filter(function (r) { return cumpreTodas(r, sub); });
      if (servem.length === 1) melhor = sub.length;
    }
    return melhor;
  }

  function abrirCriar(ano, indice) {
    const d = lista(ano)[indice];
    const candidatas = gerarPistas(d.robos, d.alvo);
    const minimo = menorNumero(d.robos, d.alvo, candidatas);
    const nAlvo = d.alvo + 1;
    let erros = 0, c;

    telaDesafio(SALA, ano, indice, {
      comoJogar: "montagem3criar",
      ajuda: "Agora você cria as pistas. O cliente quer o robô " + nAlvo + ". Escolha pistas que sirvam só para ele: ande com as setas e aperte Enter para marcar ou desmarcar uma pista. Depois, vá até Conferir as pistas.",
      fala: (Config.get("modoAudio") ? "Fase " + (indice + 1) + ". " : "") + "Agora você cria as pistas. O cliente quer o robô " + nAlvo + ": " + Robo.descrever(d.robos[d.alvo]) +
        ". Escolha pistas que sirvam só para o robô " + nAlvo + ". Use poucas pistas.",
      foco: function () { return c.querySelector(".robo-escolher"); },
      tecla: function (e) {
        const k = e.key.toLowerCase();
        if (/^[1-9]$/.test(k) && Number(k) <= d.robos.length) { App.focar(c.querySelector('[data-robo="' + (Number(k) - 1) + '"]')); return true; }
        return false;
      },
      montar: function (conteudo) {
        c = conteudo;
        const g = el("div", { class: "area-criar", "data-grupo": "desafio" });
        g.append(el("p", { class: "instrucao", texto: "O cliente quer o robô " + nAlvo + ". Escolha pistas que sirvam só para ele. Quanto menos pistas, melhor!" }));
        const grade = el("div", { class: "grade-robos" });
        d.robos.forEach(function (r, i) {
          const card = cartaoRobo(r, i + 1, { alvo: i === d.alvo });
          card.querySelector(".robo-escolher").addEventListener("click", function () {
            Voz.anunciar(card.querySelector(".robo-escolher").getAttribute("data-fala"));
          });
          grade.append(card);
        });
        g.append(grade);
        g.append(el("h2", { texto: "Pistas que você pode usar" }));
        const lst = el("div", { class: "pistas-opcoes" });
        candidatas.forEach(function (x, i) {
          const t = Robo.textoPista(x.regra);
          const b = el("button", { type: "button", class: "pista alternavel", "aria-pressed": "false", "data-pista": i, "data-fala": t + " Não marcada." });
          b.append(chip(x.regra, false), el("span", { class: "pista-texto", texto: t }), el("span", { class: "marca", "aria-hidden": "true" }));
          b.addEventListener("click", function () {
            const on = b.getAttribute("aria-pressed") !== "true";
            b.setAttribute("aria-pressed", String(on));
            b.setAttribute("data-fala", t + (on ? " Marcada." : " Não marcada."));
            const n = c.querySelectorAll('.pista[aria-pressed="true"]').length;
            c.querySelector(".contador").textContent = "Pistas marcadas: " + n;
            Voz.anunciar((on ? "Marcada: " : "Desmarcada: ") + t + " Pistas marcadas: " + n + ".", "clique");
          });
          lst.append(b);
        });
        g.append(lst);
        g.append(el("p", { class: "contador", texto: "Pistas marcadas: 0" }));
        g.append(el("button", { type: "button", class: "botao principal", html: ICONES.certo + "<span>Conferir as pistas</span>", onclick: conferir }));
        c.append(g, el("p", { class: "mensagem", "aria-hidden": "true" }));
      }
    });

    function conferir() {
      c.querySelectorAll(".olhe, .sobra").forEach(function (x) { x.classList.remove("olhe", "sobra"); });
      const marcadas = Array.prototype.map.call(c.querySelectorAll('.pista[aria-pressed="true"]'), function (b) { return candidatas[Number(b.getAttribute("data-pista"))]; });
      if (!marcadas.length) { avisar(c, "Marque pelo menos uma pista.", "neutra"); return; }
      const alvo = d.robos[d.alvo];
      const falsa = marcadas.find(function (x) { return !Robo.cumpre(alvo, x.regra); });
      if (falsa) {
        erros++;
        const idx = candidatas.indexOf(falsa);
        c.querySelector('.pista[data-pista="' + idx + '"]').classList.add("olhe");
        avisar(c, Msg.quase() + " A pista " + Robo.textoPista(falsa.regra) + " não vale para o robô " + nAlvo + ". " + Robo.oQueTem(alvo, falsa.regra, "O robô " + nAlvo), "dica", "tenteDeNovo");
        return;
      }
      const regras = marcadas.map(function (x) { return x.regra; });
      const servem = [];
      d.robos.forEach(function (r, i) { if (cumpreTodas(r, regras)) servem.push(i + 1); });
      if (servem.length > 1) {
        erros++;
        servem.forEach(function (n) { if (n !== nAlvo) c.querySelectorAll(".cartao-robo")[n - 1].classList.add("sobra"); });
        avisar(c, Msg.quase() + " Com essas pistas, ainda servem os robôs " + Robo.juntar(servem.map(String)) + ". Marque mais uma pista para separar o robô " + nAlvo + ".", "dica", "tenteDeNovo");
        return;
      }
      const n = marcadas.length;
      let est = n <= minimo ? 3 : n === minimo + 1 ? 2 : 1;
      if (erros >= 2 && est > 1) est--;
      concluirDesafio({
        sala: SALA, ano: ano, indice: indice, estrelas: est,
        detalhe: "As suas pistas levam só ao robô " + nAlvo + ". Você usou " + n + (n === 1 ? " pista" : " pistas") + "." +
          (n <= minimo ? " É o menor número possível!" : " Dá para conseguir com " + minimo + ". Quer tentar?"),
        repetir: function () { abrir(ano, indice); },
        proximo: proximoOuFases(SALA, ano, indice),
        fases: function () { telaFases(SALA, indice); }
      });
    }
  }

  function abrir(ano, indice) {
    const d = lista(ano)[indice];
    if (!d) { telaFases(SALA); return; }
    if (d.tipo === "descobrir") abrirDescobrir(ano, indice);
    else if (d.tipo === "criar") abrirCriar(ano, indice);
    else abrirMontar(ano, indice);
  }

  /* ---------- Como jogar ---------- */
  const mini = function (r) { return '<span class="passo-desenho">' + Robo.desenhar(Object.assign({}, BASE, r), { rotulo: "" }) + "</span>"; };
  COMO_JOGAR.montagem = {
    titulo: "Como jogar na Linha de Montagem",
    passos: [
      { icone: "olhar", texto: "Leia o pedido do cliente. Os desenhos mostram as peças pedidas." },
      { desenho: mini({ cabeca: "quadrada" }), texto: "Clique numa peça (cabeça, corpo, braços...) e depois clique na opção que você quer." },
      { desenho: mini({ antenas: 2, locomocao: "esteira" }), texto: "Confira o seu robô no desenho grande." },
      { icone: "certo", texto: "Clique em Entregar o robô. Se faltar algo, o jogo dá uma dica." }
    ],
    teclas: "L: ouvir o seu robô. P: ouvir o pedido."
  };
  COMO_JOGAR.montagem3 = {
    titulo: "Como descobrir o robô",
    passos: [
      { icone: "lista", texto: "Leia as pistas do cliente." },
      { icone: "lupa", texto: "Olhe cada robô e veja se ele combina com todas as pistas." },
      { desenho: '<span class="passo-desenho riscado-exemplo">' + Robo.desenhar(BASE, { rotulo: "" }) + "</span>", texto: "Use o botão Riscar nos robôs que não servem." },
      { icone: "mao", texto: "Clique no robô que combina com todas as pistas." }
    ],
    teclas: "P: ouvir as pistas. Números 1 a 6: ir até um robô. R: riscar o robô."
  };
  COMO_JOGAR.montagem3criar = {
    titulo: "Como criar pistas",
    passos: [
      { icone: "olhar", texto: "Veja qual robô o cliente quer. Ele tem o selo Cliente." },
      { icone: "mao", texto: "Clique nas pistas que valem para esse robô." },
      { icone: "lupa", texto: "As pistas precisam servir só para ele, e para nenhum outro." },
      { icone: "certo", texto: "Clique em Conferir as pistas. Quanto menos pistas, mais estrelas." }
    ]
  };

  Salas.montagem = {
    nome: "Linha de Montagem",
    frase: "Monte robôs para os clientes!",
    desenho: function () { return Robo.desenhar({ cabeca: "redonda", corpo: "grande", bracos: 2, locomocao: "rodas", antenas: 2, acessorio: "gravata", cor: "laranja" }, { rotulo: "" }); },
    lista: lista,
    abrir: abrir,
    rotuloFase: function (d) { return d.tipo === "descobrir" ? "Descobrir" : d.tipo === "criar" ? "Criar pistas" : ""; },
    passos: function (d) {
      if (d.tipo === "descobrir") return [{ icone: "lista", texto: "Leia as pistas." }, { icone: "lupa", texto: "Olhe os robôs." }, { icone: "mao", texto: "Clique no robô certo." }];
      if (d.tipo === "criar") return [{ icone: "olhar", texto: "Veja o robô do cliente." }, { icone: "mao", texto: "Marque as pistas." }, { icone: "certo", texto: "Clique em Conferir." }];
      return [{ icone: "olhar", texto: "Leia o pedido." }, { icone: "mao", texto: "Escolha as peças." }, { icone: "certo", texto: "Clique em Entregar o robô." }];
    }
  };
})();
