/* =========================================================================
   SALA 2 – SALA DA TORRE (Torre de Hanói)
   Passar todos os discos de um pino para outro, um disco por vez,
   sem nunca colocar um disco maior sobre um menor.
   ========================================================================= */
(function () {
  const SALA = "torre";
  const PINOS = ["esquerda", "meio", "direita"];
  const NOME_PINO = { esquerda: "pino da esquerda", meio: "pino do meio", direita: "pino da direita" };
  const TITULO_PINO = { esquerda: "Esquerda", meio: "Meio", direita: "Direita" };
  const cache = {};

  function nomesDiscos(n) {
    if (n === 2) return ["pequeno", "grande"];
    if (n === 3) return ["pequeno", "médio", "grande"];
    return ["pequeno", "médio", "grande", "gigante"];
  }

  function lista(ano) {
    if (cache[ano]) return cache[ano];
    const ok = [];
    ((DESAFIOS.torre && DESAFIOS.torre["ano" + ano]) || []).forEach(function (d, i) {
      const n = Number(d.discos);
      const de = PINOS.indexOf(Robo.normalizar(d.de || "esquerda"));
      const para = PINOS.indexOf(Robo.normalizar(d.para || "direita"));
      if (!(n >= 2 && n <= 4) || de < 0 || para < 0 || de === para) {
        console.warn("Sala da Torre, " + ano + "º ano, desafio " + (i + 1) + " foi pulado: confira discos (2 a 4), de e para.");
        return;
      }
      ok.push({ discos: n, de: de, para: para, menorNumero: !!d.menorNumero });
    });
    cache[ano] = ok;
    return ok;
  }

  function abrir(ano, indice) {
    const d = lista(ano)[indice];
    if (!d) { telaFases(SALA); return; }
    const n = d.discos;
    const nomes = nomesDiscos(n);
    const minimo = Math.pow(2, n) - 1;
    let pinos, levantado, movimentos, c;

    function reiniciar() {
      pinos = [[], [], []];
      for (let s = n; s >= 1; s--) pinos[d.de].push(s);   // de baixo para cima: maior primeiro
      levantado = null;
      movimentos = 0;
    }
    reiniciar();

    function nomeDisco(s) { return nomes[s - 1]; }
    function topo(i) { return pinos[i][pinos[i].length - 1]; }

    function descreverPino(i) {
      const p = pinos[i];
      let t = NOME_PINO[PINOS[i]].replace(/^p/, "P") + (i === d.para ? ", a chegada" : "") + ": ";
      if (!p.length) t += "vazio.";
      else if (p.length === 1) t += "um disco, o " + nomeDisco(p[0]) + ".";
      else t += p.length + " discos. De baixo para cima: " + Robo.juntar(p.map(nomeDisco)) + ". Em cima está o " + nomeDisco(topo(i)) + ".";
      return t;
    }
    function descreverTorre() {
      return [0, 1, 2].map(descreverPino).join(" ") + " Movimentos: " + movimentos + "." +
        (levantado !== null ? " Você está segurando o disco " + nomeDisco(topo(levantado)) + "." : "");
    }

    const objetivo = "Leve " + (n === 2 ? "os dois" : n === 3 ? "os três" : "os quatro") + " discos do " + NOME_PINO[PINOS[d.de]] + " para o " + NOME_PINO[PINOS[d.para]] + ".";

    telaDesafio(SALA, ano, indice, {
      ajuda: "Leve todos os discos para o " + NOME_PINO[PINOS[d.para]] + ". Use as setas para escolher um pino. Aperte Enter para pegar o disco de cima, depois escolha outro pino e aperte Enter para colocar. Um disco maior nunca fica sobre um menor. Tecla T: ouvir a torre inteira.",
      fala: (Config.get("modoAudio") ? "Fase " + (indice + 1) + ". " : "") + objetivo + " Mova um disco por vez. Um disco maior nunca fica sobre um menor." +
        (d.menorNumero ? " Desafio: use o menor número de movimentos." : "") +
        (Config.get("modoAudio") ? " Use as setas para escolher um pino e Enter para pegar ou colocar. Aperte T para ouvir a torre. " + descreverTorre() : ""),
      foco: function () { return c.querySelectorAll(".pino")[d.de]; },
      tecla: function (e) {
        const k = e.key.toLowerCase();
        if (k === "t") { Voz.anunciar(descreverTorre()); return true; }
        if (k === "1" || k === "2" || k === "3") { App.focar(c.querySelectorAll(".pino")[Number(k) - 1]); return true; }
        return false;
      },
      montar: function (conteudo) {
        c = conteudo;
        const obj = el("p", { class: "objetivo", html: "Leve todos os discos para o <strong>" + NOME_PINO[PINOS[d.para]] + "</strong>. " +
          "Um disco maior nunca fica sobre um menor." + (d.menorNumero ? " <strong>Desafio:</strong> use só " + minimo + " movimentos!" : "") });
        const torre = el("div", { class: "torre", "data-grupo": "pinos", role: "group", "aria-label": "Torre com três pinos" });
        PINOS.forEach(function (p, i) {
          const b = el("button", { type: "button", class: "pino" + (i === d.para ? " chegada" : ""), "data-pino": i });
          b.addEventListener("click", function () { tocarPino(i); });
          torre.append(b);
        });
        const info = el("div", { class: "info-torre" });
        info.append(
          el("p", { class: "contagem", "aria-hidden": "true" }),
          el("button", { type: "button", class: "botao", "data-sem-seta": "", html: ICONES.recomecar + "<span>Recomeçar</span>", onclick: function () {
            reiniciar(); pintar(); avisar(c, "A torre voltou ao começo. Movimentos: 0.", "neutra");
          } }),
          el("button", { type: "button", class: "botao so-com-som", "data-sem-seta": "", html: ICONES.ouvir + "<span>Ouvir a torre (T)</span>", onclick: function () { Voz.anunciar(descreverTorre()); } })
        );
        c.append(obj, torre, info, el("p", { class: "mensagem", "aria-hidden": "true" }));
        pintar();
      }
    });

    function pintar() {
      c.querySelectorAll(".pino").forEach(function (b, i) {
        let discos = "";
        pinos[i].forEach(function (s, k) {
          const largura = n === 1 ? 60 : 32 + (s - 1) * (58 / (n - 1));
          const cima = k === pinos[i].length - 1;
          discos += '<span class="disco d' + s + " t" + n + (cima && levantado === i ? " levantado" : "") + '" style="width:' + largura + '%">' +
            '<span class="disco-nome">' + nomeDisco(s) + "</span></span>";
        });
        b.innerHTML = '<span class="area-pino" aria-hidden="true"><span class="haste"></span><span class="pilha">' + discos + "</span></span>" +
          '<span class="nome-pino">' + TITULO_PINO[PINOS[i]] + (i === d.para ? ' <span class="bandeira">🏁 Chegada</span>' : "") + "</span>";
        b.classList.toggle("segurando", levantado === i);
        b.classList.toggle("destino", levantado !== null && levantado !== i);
        let fala = descreverPino(i);
        if (levantado === i) fala += " Você está segurando o disco de cima deste pino. Aperte Enter para devolver.";
        else if (levantado !== null) fala += " Aperte Enter para colocar o disco " + nomeDisco(topo(levantado)) + " aqui.";
        else if (pinos[i].length) fala += " Aperte Enter para pegar o disco de cima.";
        b.setAttribute("aria-label", fala);
        b.setAttribute("data-fala", fala);
      });
      c.querySelector(".contagem").textContent = "Movimentos: " + movimentos + (d.menorNumero ? "   •   Meta: " + minimo : "");
    }

    function tocarPino(i) {
      if (levantado === null) {
        if (!pinos[i].length) {
          avisar(c, "O " + NOME_PINO[PINOS[i]] + " está vazio. Escolha um pino que tenha disco.", "neutra");
          return;
        }
        levantado = i;
        pintar();
        const s = topo(i);
        Voz.sequencia([{ som: "pegar", pausa: 150 }, { som: "disco", arg: nomeDisco(s), pausa: 300 },
          { texto: "Você pegou o disco " + nomeDisco(s) + " do " + NOME_PINO[PINOS[i]] + ". Agora escolha onde colocar." }]);
        limparMensagem();
        return;
      }
      if (levantado === i) {
        const s = topo(i);
        levantado = null;
        pintar();
        Voz.anunciar("Você devolveu o disco " + nomeDisco(s) + " ao " + NOME_PINO[PINOS[i]] + ".", "soltar");
        return;
      }
      const s = topo(levantado), t = topo(i);
      if (t !== undefined && t < s) {
        avisar(c, "O disco " + nomeDisco(s) + " não pode ficar em cima do disco " + nomeDisco(t) + ", porque um disco maior nunca fica sobre um menor. Escolha outro pino.", "dica", "tenteDeNovo");
        return;
      }
      pinos[i].push(pinos[levantado].pop());
      levantado = null;
      movimentos++;
      pintar();
      limparMensagem();
      const fim = pinos[d.para].length === n;
      Voz.sequencia([{ som: "disco", arg: nomeDisco(s), pausa: 300 },
        { texto: "Disco " + nomeDisco(s) + " no " + NOME_PINO[PINOS[i]] + ". Movimentos: " + movimentos + "." }]);
      if (fim) setTimeout(terminar, Config.get("modoAudio") ? 1800 : 500);
    }

    function limparMensagem() { const m = c.querySelector(".mensagem"); if (m) m.textContent = ""; }

    function terminar() {
      let est;
      if (d.menorNumero) est = movimentos === minimo ? 3 : movimentos <= Math.ceil(minimo * 1.5) ? 2 : 1;
      else est = movimentos <= minimo * 2 ? 3 : movimentos <= minimo * 3 ? 2 : 1;
      const detalhe = "Você usou " + movimentos + " movimentos. O menor número possível é " + minimo + "." +
        (movimentos === minimo ? " Você conseguiu com o menor número possível!" : " Que tal tentar de novo e chegar a " + minimo + "?");
      concluirDesafio({
        sala: SALA, ano: ano, indice: indice, estrelas: est, detalhe: detalhe,
        repetir: function () { abrir(ano, indice); },
        proximo: proximoOuFases(SALA, ano, indice),
        fases: function () { telaFases(SALA, indice); }
      });
    }
  }

  /* ---------- Desenho do cartão da sala e Como jogar ---------- */
  function desenhoTorre(discosNoMeio) {
    const cores = ["#f87171", "#60a5fa", "#4ade80", "#facc15"];
    let s = '<svg viewBox="0 0 120 100" aria-hidden="true" focusable="false"><rect x="5" y="86" width="110" height="8" rx="3" fill="#94a3b8"/>';
    [20, 60, 100].forEach(function (x) { s += '<rect x="' + (x - 2.5) + '" y="30" width="5" height="57" rx="2" fill="#64748b"/>'; });
    const x0 = discosNoMeio ? 60 : 20;
    [34, 26, 18].forEach(function (w, i) {
      s += '<rect x="' + (x0 - w / 2) + '" y="' + (76 - i * 11) + '" width="' + w + '" height="10" rx="4" fill="' + cores[i] + '" stroke="#2d3748" stroke-width="1.5"/>';
    });
    return s + "</svg>";
  }
  function passoDesenho(svg) { return '<span class="passo-desenho largo">' + svg + "</span>"; }

  COMO_JOGAR.torre = {
    titulo: "Como jogar na Sala da Torre",
    passos: [
      { desenho: passoDesenho(desenhoTorre(false)), texto: "Os discos começam num pino. Leve todos para o pino de chegada (🏁)." },
      { icone: "mao", texto: "Clique num pino para pegar o disco de cima. Depois clique em outro pino para colocar." },
      { icone: "torre", texto: "Mova um disco por vez. Um disco maior nunca fica sobre um menor." },
      { icone: "estrela", texto: "Tente usar poucos movimentos. No fim, o jogo mostra o menor número possível." }
    ],
    teclas: "T: ouvir a torre inteira. 1, 2 e 3: ir direto para um pino."
  };

  Salas.torre = {
    nome: "Sala da Torre",
    frase: "Mude a torre de lugar, um disco por vez!",
    desenho: function () { return desenhoTorre(false); },
    lista: lista,
    abrir: abrir,
    rotuloFase: function (d) { return d.discos + " discos" + (d.menorNumero ? " • desafio" : ""); },
    passos: function () {
      return [{ icone: "mao", texto: "Clique num pino para pegar o disco." }, { icone: "seta", texto: "Clique em outro pino para colocar." },
        { icone: "torre", texto: "Leve todos os discos para a Chegada." }];
    }
  };
})();
