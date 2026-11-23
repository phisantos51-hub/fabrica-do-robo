/* =========================================================================
   SALA 3 – SALA DOS PADRÕES
   Descobrir o que vem a seguir, achar o erro e criar sequências.
   Toda sequência tem versão visual (desenhos) e sonora (sons e fala).
   ========================================================================= */
(function () {
  const SALA = "padroes";
  const FORMAS = { circulo: "círculo", quadrado: "quadrado", triangulo: "triângulo", estrela: "estrela", losango: "losango" };
  const SONS = { bip: "bip", buzina: "buzina", tambor: "tambor", sino: "sino", apito: "apito" };
  const cache = {};

  function familia(t) {
    if (FORMAS[t]) return "forma";
    if (SONS[t]) return "som";
    if (/^\d+$/.test(t)) return "numero";
    return null;
  }
  function nome(t) { return FORMAS[t] || SONS[t] || t; }
  function somDe(t) { return familia(t) === "numero" ? "numero" : t; }

  /* ---------- Desenhos das peças ---------- */
  const T = 'stroke="#1f2937" stroke-width="4" stroke-linejoin="round"';
  const DESENHOS = {
    circulo:   '<circle cx="40" cy="40" r="30" fill="#fca5a5" ' + T + "/>",
    quadrado:  '<rect x="12" y="12" width="56" height="56" rx="3" fill="#93c5fd" ' + T + "/>",
    triangulo: '<path d="M40 8 L74 70 L6 70 Z" fill="#86efac" ' + T + "/>",
    estrela:   '<path d="M40 6 L49 30 L75 31 L54 47 L62 73 L40 58 L18 73 L26 47 L5 31 L31 30 Z" fill="#fde047" ' + T + "/>",
    losango:   '<path d="M40 5 L72 40 L40 75 L8 40 Z" fill="#c4b5fd" ' + T + "/>",
    bip:       '<rect x="16" y="22" width="30" height="36" rx="6" fill="#e2e8f0" ' + T + '/><circle cx="31" cy="40" r="7" fill="#1f2937"/><path d="M54 30 q8 10 0 20 M62 24 q13 16 0 32" fill="none" ' + T + "/>",
    buzina:    '<path d="M10 32 h14 l34 -18 v52 l-34 -18 h-14 z" fill="#fdba74" ' + T + '/><rect x="58" y="34" width="12" height="12" rx="3" fill="#1f2937"/>',
    tambor:    '<ellipse cx="40" cy="28" rx="28" ry="10" fill="#fef3c7" ' + T + '/><path d="M12 28 v28 q28 16 56 0 v-28" fill="#f87171" ' + T + '/><path d="M58 6 L44 24 M22 6 L36 24" ' + T + "/>",
    sino:      '<path d="M40 8 q-22 4 -22 32 v12 l-8 10 h60 l-8 -10 v-12 q0 -28 -22 -32 z" fill="#fde047" ' + T + '/><circle cx="40" cy="68" r="6" fill="#1f2937"/>',
    apito:     '<path d="M8 32 h44 a18 18 0 1 1 -10 30 l-6 -14 h-28 z" fill="#a5b4fc" ' + T + '/><circle cx="50" cy="48" r="6" fill="#1f2937"/>'
  };
  function desenho(t) {
    if (t === "?") return '<span class="peca-desenho interrogacao" aria-hidden="true">?</span>';
    if (familia(t) === "numero") return '<span class="peca-desenho numero" aria-hidden="true">' + t + "</span>";
    return '<span class="peca-desenho" aria-hidden="true"><svg viewBox="0 0 80 80" focusable="false">' + DESENHOS[t] + "</svg></span>";
  }
  function peca(t, extra) {
    const legenda = familia(t) === "som" ? '<span class="peca-nome">' + nome(t) + "</span>" : "";
    return '<span class="peca' + (familia(t) === "som" ? " peca-som" : "") + (extra ? " " + extra : "") + '">' + desenho(t) + legenda + "</span>";
  }

  /* ---------- Conferência dos desafios ---------- */
  function tokens(texto) { return String(texto).trim().split(/\s+/).map(Robo.normalizar); }

  function opcoesAutomaticas(seq, resp) {
    const ops = [resp];
    if (familia(resp) === "numero") {
      const r = Number(resp);
      const nums = seq.filter(function (t) { return familia(t) === "numero"; }).map(Number);
      const passo = nums.length > 1 ? Math.abs(nums[nums.length - 1] - nums[nums.length - 2]) || 1 : 1;
      (passo > 1 ? [r + passo, r - 1, r + 1, r - passo] : [r + 1, r - 1, r + 2, nums[nums.length - 1]]).forEach(function (n) {
        if (ops.length < 3 && n >= 0 && ops.indexOf(String(n)) < 0) ops.push(String(n));
      });
    } else {
      seq.forEach(function (t) { if (t !== "?" && ops.length < 3 && ops.indexOf(t) < 0) ops.push(t); });
      const fam = familia(resp) === "forma" ? Object.keys(FORMAS) : Object.keys(SONS);
      fam.forEach(function (t) { if (ops.length < 3 && ops.indexOf(t) < 0) ops.push(t); });
    }
    return ops;
  }

  // Dica automática: "Os números aumentam de 2 em 2." ou "O padrão é: círculo, quadrado."
  function dicaPara(seq, ignorar) {
    const pos = [];
    seq.forEach(function (t, i) { if (t !== "?" && i !== ignorar) pos.push(i); });
    const numeros = pos.every(function (i) { return familia(seq[i]) === "numero"; });
    if (numeros && pos.length >= 2) {
      // passo constante?
      let passo = null, ok = true;
      for (let k = 1; k < pos.length; k++) {
        const d = (Number(seq[pos[k]]) - Number(seq[pos[k - 1]])) / (pos[k] - pos[k - 1]);
        if (passo === null) passo = d; else if (d !== passo) ok = false;
      }
      if (ok && passo > 0) return "Os números aumentam de " + passo + " em " + passo + ".";
      if (ok && passo < 0) return "Os números diminuem de " + (-passo) + " em " + (-passo) + ".";
    }
    for (let p = 1; p <= Math.floor(seq.length / 2); p++) {
      let ok = true;
      for (let i = p; i < seq.length; i++) {
        if (seq[i] === "?" || seq[i - p] === "?" || i === ignorar || i - p === ignorar) continue;
        if (seq[i] !== seq[i - p]) { ok = false; break; }
      }
      if (ok) return "O padrão é: " + seq.slice(0, p).map(nome).join(", ") + ". Depois ele se repete.";
    }
    return "Olhe de novo, uma peça de cada vez.";
  }

  function lista(ano) {
    if (cache[ano]) return cache[ano];
    const ok = [];
    ((DESAFIOS.padroes && DESAFIOS.padroes["ano" + ano]) || []).forEach(function (d, i) {
      try {
        const seq = tokens(d.sequencia);
        seq.forEach(function (t) { if (t !== "?" && !familia(t)) throw new Error('peça desconhecida "' + t + '"'); });
        if (d.tipo === "erro") {
          const erro = Number(d.erro) - 1;
          if (!(erro >= 0 && erro < seq.length) || seq.indexOf("?") >= 0) throw new Error("confira a posição do erro");
          ok.push({ tipo: "erro", seq: seq, erro: erro, dica: d.dica || dicaPara(seq, erro) });
        } else {
          const vaga = seq.indexOf("?");
          const resp = Robo.normalizar(d.resposta || "");
          if (vaga < 0 || !familia(resp)) throw new Error("falta o ? ou a resposta");
          let ops = d.opcoes ? tokens(d.opcoes) : opcoesAutomaticas(seq, resp);
          if (ops.indexOf(resp) < 0) ops[0] = resp;
          ops = ops.slice(0, 3);
          ok.push({ tipo: "completar", seq: seq, vaga: vaga, resposta: resp, opcoes: ops, dica: d.dica || dicaPara(seq) });
        }
      } catch (erro) {
        console.warn("Sala dos Padrões, " + ano + "º ano, desafio " + (i + 1) + " foi pulado: " + erro.message);
      }
    });
    cache[ano] = ok;
    return ok;
  }

  /* ---------- Tocar e mostrar uma sequência (som, fala e destaque) ---------- */
  function tocar(seq, caixa, final, inicio) {
    const elementos = caixa ? caixa.querySelectorAll(".peca") : [];
    const passos = inicio ? [{ texto: inicio }] : [];
    seq.forEach(function (t, i) {
      const destacar = function () {
        elementos.forEach(function (e) { e.classList.remove("tocando"); });
        if (elementos[i]) elementos[i].classList.add("tocando");
      };
      // Sem som, cada peça fica destacada por mais tempo (a sequência é "mostrada").
      const semSom = !Config.somLigado();
      if (t === "?") passos.push({ som: "limite", aoTocar: destacar, pausa: semSom ? 800 : 250 }, { texto: "e depois?" });
      else passos.push({ som: somDe(t), aoTocar: destacar, pausa: semSom ? 800 : familia(t) === "som" ? Sons.duracao(t) + 150 : 250 }, { texto: nome(t) + "," });
    });
    if (final) passos.push({ texto: final });
    passos.push({ som: "nada", aoTocar: function () { elementos.forEach(function (e) { e.classList.remove("tocando"); }); }, pausa: 0 });
    return Voz.sequencia(passos);
  }

  function estrelasPorErros(erros) { return erros === 0 ? 3 : erros === 1 ? 2 : 1; }

  /* =======================================================================
     COMPLETAR: o que vem depois?
     ======================================================================= */
  function abrirCompletar(ano, indice, d, colega) {
    let erros = 0, c, terminado = false;
    const ops = colega ? d.opcoes : embaralhar(d.opcoes);
    const textoOpcoes = ops.map(function (t, i) { return "Opção " + (i + 1) + ": " + nome(t) + "."; }).join(" ");

    const def = {
      comoJogar: SALA,
      ajuda: "Escute a sequência e descubra o que vem depois. Aperte 1, 2 ou 3 para escolher uma opção, ou use as setas e Enter. A tecla P toca a sequência de novo.",
      foco: function () { return c.querySelector(".opcao-padrao"); },
      tecla: function (e) {
        const k = e.key.toLowerCase();
        if (k === "p") { tocar(d.seq, c.querySelector(".sequencia"), "Qual vem depois?"); return true; }
        if (/^[1-9]$/.test(k) && Number(k) <= ops.length) { responder(Number(k) - 1); return true; }
        return false;
      },
      montar: function (conteudo) {
        c = conteudo;
        c.append(el("p", { class: "instrucao", texto: "O que vem no lugar do ponto de interrogação?" }));
        const s = el("div", { class: "sequencia", role: "img", "aria-label": "Sequência: " + d.seq.map(function (t) { return t === "?" ? "um espaço vazio" : nome(t); }).join(", ") });
        s.innerHTML = d.seq.map(function (t, i) { return peca(t, i === d.vaga ? "vaga" : ""); }).join("");
        c.append(s);
        c.append(el("button", { type: "button", class: "botao", "data-sem-seta": "", html: ICONES.ouvir + "<span>Tocar e mostrar a sequência (P)</span>",
          onclick: function () { tocar(d.seq, s, "Qual vem depois?"); } }));
        const g = el("div", { class: "opcoes-padrao", "data-grupo": "opcoes", role: "group", "aria-label": "Opções" });
        ops.forEach(function (t, i) {
          const b = el("button", { type: "button", class: "opcao-padrao", "data-som": somDe(t), "data-fala": "Opção " + (i + 1) + ": " + nome(t),
            "aria-label": "Opção " + (i + 1) + ": " + nome(t),
            html: '<span class="numero-opcao" aria-hidden="true">' + (i + 1) + "</span>" + peca(t) + (familia(t) === "forma" ? '<span class="peca-nome">' + nome(t) + "</span>" : "") });
          b.addEventListener("click", function () { responder(i); });
          g.append(b);
        });
        c.append(g);
        if (colega) c.append(colega.botoes());
        c.append(el("p", { class: "mensagem", "aria-hidden": "true" }));
      }
    };

    if (colega) {
      def.id = "colega";
      def.titulo = "Desafio para um colega";
      def.voltar = colega.voltar;
      def.fala = "Desafio do colega. " + (Config.get("modoAudio") ? "Escute. " : "");
      App.abrir(def);
    } else {
      def.fala = (Config.get("modoAudio") ? "Fase " + (indice + 1) + ". " : "") + "O que vem depois?";
      telaDesafio(SALA, ano, indice, def);
    }
    // Toca a sequência no começo (com som ligado) e depois lê as opções.
    setTimeout(function () {
      if (Config.somLigado()) tocar(d.seq, c.querySelector(".sequencia"), "Qual vem depois? " + textoOpcoes + (Config.get("modoAudio") ? " Aperte 1, 2 ou 3." : ""));
    }, 900);

    function responder(i) {
      if (terminado) return;
      const t = ops[i];
      const b = c.querySelectorAll(".opcao-padrao")[i];
      if (t === d.resposta) {
        terminado = true;
        c.querySelectorAll(".opcao-padrao").forEach(function (x) { x.disabled = x !== b; });
        const vaga = c.querySelectorAll(".sequencia .peca")[d.vaga];
        vaga.outerHTML = peca(t, "vaga preenchida");
        const seqCompleta = d.seq.map(function (x) { return x === "?" ? t : x; });
        if (colega) {
          avisar(c, "Acertou! A resposta é " + nome(t) + ".", "certo", "acerto");
          return;
        }
        Sons.tocar("acerto");
        c.querySelector(".mensagem").className = "mensagem certo";
        c.querySelector(".mensagem").textContent = (Config.get("modoCalmo") ? "Certo. " : "Isso mesmo! ") + nome(t).charAt(0).toUpperCase() + nome(t).slice(1) + ".";
        tocar(seqCompleta, c.querySelector(".sequencia"), null, (Config.get("modoCalmo") ? "Certo. " : "Isso mesmo! ") + nome(t) + ". Escute a sequência completa.");
        setTimeout(function () {
          concluirDesafio({
            sala: SALA, ano: ano, indice: indice, estrelas: estrelasPorErros(erros),
            detalhe: "A sequência completa é: " + seqCompleta.map(nome).join(", ") + ".",
            repetir: function () { abrir(ano, indice); },
            proximo: proximoOuFases(SALA, ano, indice),
            fases: function () { telaFases(SALA, indice); }
          });
        }, Config.somLigado() ? (Config.vozLigada() ? 3000 + seqCompleta.length * 900 : 900 + seqCompleta.length * 600) : 900 + seqCompleta.length * 800);
        return;
      }
      erros++;
      b.classList.add("tentada");
      b.setAttribute("data-fala", b.getAttribute("aria-label") + ". Você já tentou esta.");
      avisar(c, Msg.quase() + " " + (colega ? "Tente outra opção." : nome(t).charAt(0).toUpperCase() + nome(t).slice(1) + " não é a resposta. " + d.dica), "dica", "tenteDeNovo");
    }
  }

  /* =======================================================================
     ACHAR O ERRO
     ======================================================================= */
  function abrirErro(ano, indice, d) {
    let erros = 0, c, terminado = false;
    const n = d.seq.length;
    telaDesafio(SALA, ano, indice, {
      ajuda: "Uma peça da sequência está errada. Use as setas para ouvir cada peça e aperte Enter na peça errada. Você também pode apertar o número da posição, de 1 a " + n + ". A tecla P toca a sequência de novo.",
      fala: (Config.get("modoAudio") ? "Fase " + (indice + 1) + ". " : "") + "Uma peça está errada. Qual é?",
      foco: function () { return c.querySelector(".peca-botao"); },
      tecla: function (e) {
        const k = e.key.toLowerCase();
        if (k === "p") { tocar(d.seq, c.querySelector(".sequencia"), "Qual está errada?"); return true; }
        if (/^[1-9]$/.test(k) && Number(k) <= n) { responder(Number(k) - 1); return true; }
        return false;
      },
      montar: function (conteudo) {
        c = conteudo;
        c.append(el("p", { class: "instrucao", texto: "Uma peça está errada. Clique nela." }));
        const s = el("div", { class: "sequencia botoes", "data-grupo": "pecas", role: "group", "aria-label": "Sequência" });
        d.seq.forEach(function (t, i) {
          const b = el("button", { type: "button", class: "peca-botao", "data-som": somDe(t), "data-fala": "Peça " + (i + 1) + ": " + nome(t),
            "aria-label": "Peça " + (i + 1) + ": " + nome(t), html: '<span class="numero-opcao" aria-hidden="true">' + (i + 1) + "</span>" + peca(t) });
          b.addEventListener("click", function () { responder(i); });
          s.append(b);
        });
        c.append(s);
        c.append(el("button", { type: "button", class: "botao", "data-sem-seta": "", html: ICONES.ouvir + "<span>Tocar e mostrar a sequência (P)</span>",
          onclick: function () { tocar(d.seq, s, "Qual está errada?"); } }));
        c.append(el("p", { class: "mensagem", "aria-hidden": "true" }));
      }
    });
    setTimeout(function () {
      if (Config.somLigado()) tocar(d.seq, c.querySelector(".sequencia"), "Qual está errada?" + (Config.get("modoAudio") ? " Aperte o número da posição, de 1 a " + n + ", ou use as setas." : ""));
    }, 900);

    function responder(i) {
      if (terminado) return;
      const b = c.querySelectorAll(".peca-botao")[i];
      if (i === d.erro) {
        terminado = true;
        b.classList.add("achou");
        concluirDesafio({
          sala: SALA, ano: ano, indice: indice, estrelas: estrelasPorErros(erros),
          detalhe: "A peça " + (i + 1) + " (" + nome(d.seq[i]) + ") estava errada. " + d.dica,
          repetir: function () { abrir(ano, indice); },
          proximo: proximoOuFases(SALA, ano, indice),
          fases: function () { telaFases(SALA, indice); }
        });
        return;
      }
      erros++;
      b.classList.add("tentada");
      avisar(c, Msg.quase() + " A peça " + (i + 1) + " (" + nome(d.seq[i]) + ") está certa. " + d.dica + " Procure a peça que não combina.", "dica", "tenteDeNovo");
    }
  }

  function abrir(ano, indice) {
    const d = lista(ano)[indice];
    if (!d) { telaFases(SALA); return; }
    if (d.tipo === "erro") abrirErro(ano, indice, d);
    else abrirCompletar(ano, indice, d);
  }

  /* =======================================================================
     CRIE VOCÊ: a criança monta uma sequência e desafia um colega
     ======================================================================= */
  let criada = [];
  const MAXIMO = 10;

  function telaCriar() {
    let c;
    App.abrir({
      id: "criar",
      titulo: "Crie você: monte uma sequência",
      comoJogar: "padroesCriar",
      ajuda: "Monte uma sequência. Use as setas para ouvir as peças e Enter para colocar uma peça na sequência. Depois, vá até Tocar e mostrar, ou Desafiar um colega. A tecla P toca a sua sequência.",
      fala: "Crie você. Escolha peças para montar a sua sequência." + (criada.length ? " A sua sequência tem " + criada.length + " peças." : ""),
      voltar: function () { telaFases(SALA); },
      foco: ".paleta button",
      tecla: function (e) { if (e.key.toLowerCase() === "p") { tocarCriada(); return true; } return false; },
      passos: Config.get("modoCalmo") ? [{ icone: "mao", texto: "Escolha as peças." }, { icone: "ouvir", texto: "Toque e mostre." }, { icone: "padrao", texto: "Desafie um colega." }] : null,
      montar: function (conteudo) {
        c = conteudo;
        const g = el("div", { class: "area-criar-padrao", "data-grupo": "criar" });
        g.append(el("h2", { texto: "Peças" }));
        const paleta = el("div", { class: "paleta" });
        Object.keys(FORMAS).concat(Object.keys(SONS)).forEach(function (t) {
          const b = el("button", { type: "button", class: "peca-botao", "data-som": somDe(t), "data-fala": nome(t) + ". Aperte Enter para colocar.",
            "aria-label": "Colocar " + nome(t), html: peca(t) + (familia(t) === "forma" ? '<span class="peca-nome">' + nome(t) + "</span>" : "") });
          b.addEventListener("click", function () {
            if (criada.length >= MAXIMO) { avisar(c, "A sequência já tem " + MAXIMO + " peças. Apague uma para colocar outra.", "neutra"); return; }
            criada.push(t);
            pintar();
            Voz.anunciar(nome(t) + " colocado. A sequência tem " + criada.length + (criada.length === 1 ? " peça." : " peças."), somDe(t));
          });
          paleta.append(b);
        });
        g.append(paleta);
        g.append(el("h2", { texto: "A sua sequência" }));
        g.append(el("div", { class: "sequencia criada", "aria-live": "off" }));
        const acoes = el("div", { class: "acoes-criar" });
        acoes.append(
          el("button", { type: "button", class: "botao", html: ICONES.seta.replace("M8 24h30M28 14l10 10-10 10", "M40 24H10M20 14L10 24l10 10") + "<span>Apagar a última</span>", onclick: function () {
            if (!criada.length) { avisar(c, "A sequência está vazia.", "neutra"); return; }
            criada.pop(); pintar(); Voz.anunciar("Apaguei a última peça. A sequência tem " + criada.length + (criada.length === 1 ? " peça." : " peças."));
          } }),
          el("button", { type: "button", class: "botao", html: ICONES.recomecar + "<span>Limpar tudo</span>", onclick: function () {
            criada = []; pintar(); Voz.anunciar("A sequência está vazia.");
          } }),
          el("button", { type: "button", class: "botao", html: ICONES.ouvir + "<span>Tocar e mostrar</span>", onclick: tocarCriada }),
          el("button", { type: "button", class: "botao principal", html: ICONES.padrao + "<span>Desafiar um colega</span>", onclick: desafiar })
        );
        g.append(acoes);
        c.append(g, el("p", { class: "mensagem", "aria-hidden": "true" }));
        pintar();
      }
    });

    function pintar() {
      const s = c.querySelector(".sequencia.criada");
      s.innerHTML = criada.length ? criada.map(function (t) { return peca(t); }).join("") : '<span class="vazia-texto">Clique nas peças acima para montar a sua sequência.</span>';
      s.setAttribute("role", "img");
      s.setAttribute("aria-label", criada.length ? "A sua sequência: " + criada.map(nome).join(", ") : "A sua sequência está vazia.");
    }
    function tocarCriada() {
      if (!criada.length) { avisar(c, "A sequência está vazia. Escolha algumas peças primeiro.", "neutra"); return; }
      tocar(criada, c.querySelector(".sequencia.criada"));
    }
    function desafiar() {
      if (criada.length < 4) { avisar(c, "Coloque pelo menos 4 peças para desafiar um colega.", "neutra"); return; }
      const resp = criada[criada.length - 1];
      const seq = criada.slice(0, -1).concat(["?"]);
      const ops = embaralhar(opcoesAutomaticas(seq, resp).slice(0, 3));
      abrirCompletar(null, null, { seq: seq, vaga: seq.length - 1, resposta: resp, opcoes: ops }, {
        voltar: telaCriar,
        botoes: function () {
          const b = el("div", { class: "acoes-criar" });
          b.append(
            el("button", { type: "button", class: "botao", "data-sem-seta": "", texto: "Mostrar a resposta", onclick: function (ev) {
              const m = ev.target.closest(".conteudo");
              avisar(m, "A resposta é " + nome(resp) + ".", "neutra");
            } }),
            el("button", { type: "button", class: "botao", "data-sem-seta": "", texto: "Voltar a criar", onclick: telaCriar })
          );
          return b;
        }
      });
    }
  }

  /* ---------- Como jogar ---------- */
  function passoPecas(lista) { return '<span class="passo-pecas">' + lista.map(function (t) { return peca(t); }).join("") + "</span>"; }
  COMO_JOGAR.padroes = {
    titulo: "Como jogar na Sala dos Padrões",
    passos: [
      { desenho: passoPecas(["circulo", "quadrado", "circulo", "?"]), texto: "Olhe a sequência. Ela tem um padrão que se repete ou que aumenta." },
      { icone: "ouvir", texto: "Com o som ligado, clique em Tocar e mostrar para ouvir a sequência." },
      { icone: "mao", texto: "Clique na opção que vem no lugar do ponto de interrogação (?)." },
      { icone: "lupa", texto: "Nas fases de achar o erro, clique na peça que não combina." }
    ],
    teclas: "1, 2 ou 3: escolher uma opção. P: tocar a sequência de novo."
  };
  COMO_JOGAR.padroesCriar = {
    titulo: "Como criar uma sequência",
    passos: [
      { icone: "mao", texto: "Clique nas peças para montar a sua sequência, com um padrão." },
      { icone: "ouvir", texto: "Clique em Tocar e mostrar para ver e ouvir a sequência." },
      { icone: "padrao", texto: "Clique em Desafiar um colega. O jogo esconde a última peça." },
      { icone: "certo", texto: "O colega escolhe a peça que falta." }
    ]
  };

  Salas.padroes = {
    nome: "Sala dos Padrões",
    frase: "Descubra o que vem depois!",
    desenho: function () {
      return '<svg viewBox="0 0 120 100" focusable="false" aria-hidden="true"><g transform="translate(2 30) scale(0.45)">' + DESENHOS.circulo + '</g><g transform="translate(42 30) scale(0.45)">' + DESENHOS.quadrado +
        '</g><g transform="translate(82 30) scale(0.45)">' + DESENHOS.circulo + '</g><text x="60" y="95" font-size="22" text-anchor="middle" font-weight="bold" fill="#1f2937">?</text></svg>';
    },
    lista: lista,
    abrir: abrir,
    rotuloFase: function (d) { return d.tipo === "erro" ? "Achar o erro" : ""; },
    extra: function () {
      return el("button", { type: "button", class: "botao-fase extra", "data-fala": "Crie você: monte uma sequência e desafie um colega.",
        html: '<span class="fase-num">Crie você</span><span class="fase-tipo">Monte e desafie um colega</span>', onclick: telaCriar });
    },
    passos: function (d) {
      if (d.tipo === "erro") return [{ icone: "olhar", texto: "Olhe a sequência." }, { icone: "lupa", texto: "Procure a peça que não combina." }, { icone: "mao", texto: "Clique nela." }];
      return [{ icone: "olhar", texto: "Olhe a sequência." }, { icone: "lupa", texto: "Descubra o padrão." }, { icone: "mao", texto: "Clique na peça que falta." }];
    }
  };
})();
