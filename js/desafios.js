/* =========================================================================
   DESAFIOS DA FÁBRICA DO ROBÔ
   =========================================================================
   Este é o único arquivo que você precisa mudar para criar desafios novos.
   Ele pode ser aberto no Bloco de Notas ou direto no site do GitHub
   (clique no arquivo e depois no lápis "Edit this file").

   REGRAS GERAIS
   - Cada desafio fica entre { e }, seguido de uma vírgula.
   - Os textos ficam entre aspas: "assim".
   - Acentos são opcionais: "cabeça" e "cabeca" funcionam do mesmo jeito.
   - A ordem da lista é a ordem das fases no jogo.
   - Depois de salvar, abra o jogo e aperte F5 para ver a mudança.
     Se algum desafio estiver escrito errado, ele é pulado e o jogo
     continua funcionando com os outros.

   AS PEÇAS DO ROBÔ E SEUS VALORES
     cabeca     redonda, quadrada, triangular
     corpo      grande, pequeno
     bracos     0, 2, 4
     locomocao  pernas, rodas, esteira
     antenas    0, 1, 2
     acessorio  nenhum, chapeu, oculos, gravata

   COMO ESCREVER UMA REGRA (usada nos pedidos e nas pistas)
     "cabeca = redonda"     a cabeça é redonda
     "locomocao != rodas"   NÃO tem rodas   ( != quer dizer "diferente de")
     "antenas = 0"          sem antenas
     "bracos > antenas"     mais braços que antenas
     "antenas < bracos"     menos antenas que braços
     "bracos = antenas"     o mesmo número de braços e de antenas
     "bracos > 2"           mais de dois braços
   O jogo escreve e fala sozinho a frase para a criança, a partir da regra.
   ========================================================================= */

const DESAFIOS = {

  /* -----------------------------------------------------------------------
     SALA 1 – LINHA DE MONTAGEM
     1º e 2º ano: um pedido = uma lista de regras.
       Para acrescentar, copie uma linha como esta e troque as regras:
       { regras: ["cabeca = redonda", "antenas = 2"] },
       (Opcional) texto: "..." troca a frase que o jogo cria sozinho.
     ----------------------------------------------------------------------- */
  montagem: {
    ano1: [
      { regras: ["cabeca = redonda"] },
      { regras: ["locomocao = rodas"] },
      { regras: ["antenas = 2"] },
      { regras: ["cabeca = quadrada", "bracos = 2"] },
      { regras: ["corpo = pequeno", "locomocao = pernas"] },
      { regras: ["cabeca = triangular", "antenas = 1"] },
      { regras: ["bracos = 4", "acessorio = chapeu"] },
      { regras: ["locomocao = esteira", "acessorio = oculos"] }
    ],

    ano2: [
      { regras: ["cabeca = redonda", "corpo = pequeno", "antenas = 2"] },
      { regras: ["locomocao = rodas", "antenas = 0", "bracos > antenas"] },
      { regras: ["cabeca != quadrada", "locomocao = pernas", "bracos = 2"] },
      { regras: ["corpo = grande", "locomocao != rodas", "acessorio = gravata"] },
      { regras: ["cabeca = triangular", "antenas = 1", "bracos > antenas"] },
      { regras: ["locomocao = esteira", "bracos = 0", "antenas > bracos"] },
      { regras: ["cabeca != redonda", "corpo = pequeno", "bracos = antenas"] },
      { regras: ["acessorio = oculos", "locomocao != esteira", "antenas < bracos"] }
    ],

    /* 3º ano: DESCOBRIR o robô pelas pistas.
       - robos: de 4 a 6 robôs prontos (o primeiro é o robô 1, e assim por diante).
       - pistas: regras que valem para UM SÓ robô da lista.
       O jogo confere sozinho qual é a resposta. Se as pistas servirem para
       mais de um robô (ou para nenhum), o desafio é pulado.

       No fim, os desafios do tipo "criar": a criança escolhe pistas para
       o robô "alvo" (o número dele na lista) e o jogo confere se as pistas
       levam a uma resposta única. */
    ano3: [
      { tipo: "descobrir",
        robos: [
          { cabeca: "redonda",    corpo: "grande",  bracos: 2, locomocao: "rodas",   antenas: 1, acessorio: "nenhum", cor: "azul" },
          { cabeca: "quadrada",   corpo: "pequeno", bracos: 2, locomocao: "pernas",  antenas: 2, acessorio: "nenhum", cor: "verde" },
          { cabeca: "redonda",    corpo: "pequeno", bracos: 4, locomocao: "pernas",  antenas: 0, acessorio: "nenhum", cor: "laranja" },
          { cabeca: "triangular", corpo: "grande",  bracos: 0, locomocao: "rodas",   antenas: 1, acessorio: "nenhum", cor: "roxo" }
        ],
        pistas: ["locomocao != rodas", "cabeca != quadrada"] },

      { tipo: "descobrir",
        robos: [
          { cabeca: "quadrada",   corpo: "grande",  bracos: 4, locomocao: "esteira", antenas: 2, acessorio: "chapeu",  cor: "amarelo" },
          { cabeca: "quadrada",   corpo: "pequeno", bracos: 2, locomocao: "rodas",   antenas: 0, acessorio: "oculos",  cor: "azul" },
          { cabeca: "triangular", corpo: "grande",  bracos: 2, locomocao: "esteira", antenas: 1, acessorio: "oculos",  cor: "verde" },
          { cabeca: "redonda",    corpo: "pequeno", bracos: 4, locomocao: "esteira", antenas: 1, acessorio: "gravata", cor: "laranja" }
        ],
        pistas: ["locomocao = esteira", "cabeca != redonda", "acessorio != chapeu"] },

      { tipo: "descobrir",
        robos: [
          { cabeca: "redonda",    corpo: "grande",  bracos: 2, locomocao: "pernas", antenas: 0, acessorio: "gravata", cor: "cinza" },
          { cabeca: "triangular", corpo: "pequeno", bracos: 4, locomocao: "rodas",  antenas: 2, acessorio: "nenhum",  cor: "roxo" },
          { cabeca: "redonda",    corpo: "pequeno", bracos: 2, locomocao: "rodas",  antenas: 2, acessorio: "chapeu",  cor: "azul" },
          { cabeca: "quadrada",   corpo: "grande",  bracos: 0, locomocao: "rodas",  antenas: 1, acessorio: "oculos",  cor: "amarelo" },
          { cabeca: "redonda",    corpo: "pequeno", bracos: 4, locomocao: "rodas",  antenas: 1, acessorio: "nenhum",  cor: "verde" }
        ],
        pistas: ["locomocao = rodas", "bracos > antenas", "cabeca != triangular"] },

      { tipo: "descobrir",
        robos: [
          { cabeca: "quadrada",   corpo: "grande",  bracos: 2, locomocao: "esteira", antenas: 2, acessorio: "nenhum",  cor: "laranja" },
          { cabeca: "quadrada",   corpo: "pequeno", bracos: 0, locomocao: "pernas",  antenas: 1, acessorio: "chapeu",  cor: "azul" },
          { cabeca: "triangular", corpo: "pequeno", bracos: 2, locomocao: "pernas",  antenas: 2, acessorio: "oculos",  cor: "verde" },
          { cabeca: "quadrada",   corpo: "pequeno", bracos: 4, locomocao: "pernas",  antenas: 2, acessorio: "gravata", cor: "roxo" },
          { cabeca: "redonda",    corpo: "grande",  bracos: 4, locomocao: "esteira", antenas: 0, acessorio: "oculos",  cor: "amarelo" }
        ],
        pistas: ["corpo != grande", "antenas = 2", "cabeca != triangular"] },

      { tipo: "descobrir",
        robos: [
          { cabeca: "redonda",    corpo: "grande",  bracos: 2, locomocao: "rodas",   antenas: 2, acessorio: "nenhum",  cor: "azul" },
          { cabeca: "triangular", corpo: "grande",  bracos: 4, locomocao: "pernas",  antenas: 1, acessorio: "chapeu",  cor: "verde" },
          { cabeca: "quadrada",   corpo: "pequeno", bracos: 2, locomocao: "esteira", antenas: 1, acessorio: "gravata", cor: "laranja" },
          { cabeca: "redonda",    corpo: "pequeno", bracos: 0, locomocao: "pernas",  antenas: 2, acessorio: "oculos",  cor: "roxo" },
          { cabeca: "triangular", corpo: "pequeno", bracos: 4, locomocao: "rodas",   antenas: 0, acessorio: "oculos",  cor: "amarelo" },
          { cabeca: "quadrada",   corpo: "grande",  bracos: 2, locomocao: "pernas",  antenas: 2, acessorio: "nenhum",  cor: "cinza" }
        ],
        pistas: ["antenas < bracos", "locomocao != esteira", "acessorio != chapeu"] },

      { tipo: "descobrir",
        robos: [
          { cabeca: "quadrada",   corpo: "pequeno", bracos: 2, locomocao: "rodas",   antenas: 1, acessorio: "chapeu",  cor: "amarelo" },
          { cabeca: "redonda",    corpo: "grande",  bracos: 2, locomocao: "esteira", antenas: 2, acessorio: "gravata", cor: "azul" },
          { cabeca: "triangular", corpo: "grande",  bracos: 4, locomocao: "rodas",   antenas: 2, acessorio: "nenhum",  cor: "verde" },
          { cabeca: "redonda",    corpo: "pequeno", bracos: 0, locomocao: "esteira", antenas: 0, acessorio: "oculos",  cor: "laranja" },
          { cabeca: "quadrada",   corpo: "grande",  bracos: 4, locomocao: "pernas",  antenas: 1, acessorio: "gravata", cor: "roxo" },
          { cabeca: "redonda",    corpo: "grande",  bracos: 2, locomocao: "rodas",   antenas: 2, acessorio: "oculos",  cor: "cinza" }
        ],
        pistas: ["corpo = grande", "locomocao != pernas", "bracos = antenas", "acessorio != gravata"] },

      // Agora a criança CRIA as pistas para o robô "alvo".
      { tipo: "criar", alvo: 2,
        robos: [
          { cabeca: "redonda",  corpo: "grande",  bracos: 2, locomocao: "rodas",  antenas: 0, acessorio: "nenhum", cor: "azul" },
          { cabeca: "quadrada", corpo: "grande",  bracos: 2, locomocao: "pernas", antenas: 1, acessorio: "oculos", cor: "verde" },
          { cabeca: "quadrada", corpo: "pequeno", bracos: 4, locomocao: "pernas", antenas: 1, acessorio: "oculos", cor: "laranja" },
          { cabeca: "redonda",  corpo: "pequeno", bracos: 0, locomocao: "rodas",  antenas: 2, acessorio: "chapeu", cor: "roxo" }
        ] },

      { tipo: "criar", alvo: 4,
        robos: [
          { cabeca: "triangular", corpo: "pequeno", bracos: 2, locomocao: "esteira", antenas: 1, acessorio: "gravata", cor: "amarelo" },
          { cabeca: "redonda",    corpo: "grande",  bracos: 4, locomocao: "esteira", antenas: 2, acessorio: "nenhum",  cor: "azul" },
          { cabeca: "triangular", corpo: "grande",  bracos: 2, locomocao: "rodas",   antenas: 1, acessorio: "chapeu",  cor: "verde" },
          { cabeca: "triangular", corpo: "grande",  bracos: 4, locomocao: "esteira", antenas: 1, acessorio: "gravata", cor: "laranja" },
          { cabeca: "quadrada",   corpo: "grande",  bracos: 4, locomocao: "pernas",  antenas: 0, acessorio: "gravata", cor: "roxo" }
        ] },

      { tipo: "criar", alvo: 1,
        robos: [
          { cabeca: "redonda",    corpo: "pequeno", bracos: 2, locomocao: "pernas",  antenas: 2, acessorio: "chapeu",  cor: "verde" },
          { cabeca: "redonda",    corpo: "grande",  bracos: 2, locomocao: "pernas",  antenas: 2, acessorio: "oculos",  cor: "azul" },
          { cabeca: "quadrada",   corpo: "pequeno", bracos: 2, locomocao: "pernas",  antenas: 1, acessorio: "chapeu",  cor: "laranja" },
          { cabeca: "redonda",    corpo: "pequeno", bracos: 4, locomocao: "rodas",   antenas: 2, acessorio: "chapeu",  cor: "roxo" },
          { cabeca: "redonda",    corpo: "pequeno", bracos: 2, locomocao: "esteira", antenas: 0, acessorio: "chapeu",  cor: "amarelo" },
          { cabeca: "triangular", corpo: "pequeno", bracos: 2, locomocao: "pernas",  antenas: 2, acessorio: "gravata", cor: "cinza" }
        ] }
    ]
  },

  /* -----------------------------------------------------------------------
     SALA 2 – SALA DA TORRE
     discos: quantos discos (de 2 a 4).
     de / para: "esquerda", "meio" ou "direita".
     menorNumero: true  = desafio de usar o menor número de movimentos
                          (as 3 estrelas só vêm com o menor número).
     ----------------------------------------------------------------------- */
  torre: {
    ano1: [
      { discos: 2, de: "esquerda", para: "direita" },
      { discos: 2, de: "esquerda", para: "meio" },
      { discos: 2, de: "direita",  para: "esquerda" }
    ],
    ano2: [
      { discos: 3, de: "esquerda", para: "direita" },
      { discos: 3, de: "esquerda", para: "meio" },
      { discos: 3, de: "direita",  para: "esquerda" }
    ],
    ano3: [
      { discos: 3, de: "esquerda", para: "direita", menorNumero: true },
      { discos: 4, de: "esquerda", para: "direita" },
      { discos: 4, de: "esquerda", para: "meio", menorNumero: true }
    ]
  },

  /* -----------------------------------------------------------------------
     SALA 3 – SALA DOS PADRÕES
     As peças da sequência ficam separadas por espaço, numa linha só.

       Formas:  circulo, quadrado, triangulo, estrela, losango
       Sons:    bip, buzina, tambor, sino, apito
       Números: qualquer número, como 2 4 6 8

     COMPLETAR: coloque ? no lugar da resposta e escreva a resposta.
       { sequencia: "bip buzina bip buzina ?", resposta: "bip" },
       (Opcional) opcoes: "bip buzina tambor"  escolhe as 3 opções.
       Sem "opcoes", o jogo escolhe sozinho duas opções erradas.

     ACHAR O ERRO: escreva a sequência com um erro e diga a posição dele
     (1 = primeira peça, 2 = segunda, ...).
       { tipo: "erro", sequencia: "2 4 6 7 10", erro: 4 },

     (Opcional em qualquer um) dica: "..." troca a dica que o jogo cria.
     ----------------------------------------------------------------------- */
  padroes: {
    ano1: [
      { sequencia: "circulo quadrado circulo quadrado ?", resposta: "circulo" },
      { sequencia: "bip buzina bip buzina ?", resposta: "bip" },
      { sequencia: "estrela triangulo estrela triangulo estrela ?", resposta: "triangulo" },
      { sequencia: "tambor sino tambor sino ?", resposta: "tambor" },
      { sequencia: "1 2 1 2 ?", resposta: "1" },
      { sequencia: "quadrado estrela quadrado estrela quadrado ?", resposta: "estrela" },
      { sequencia: "apito bip apito bip apito ?", resposta: "bip" },
      { sequencia: "3 7 3 7 ?", resposta: "3" }
    ],
    ano2: [
      { sequencia: "circulo quadrado triangulo circulo quadrado ?", resposta: "triangulo" },
      { sequencia: "bip buzina tambor bip buzina ?", resposta: "tambor" },
      { sequencia: "1 2 3 ?", resposta: "4" },
      { sequencia: "estrela losango circulo estrela losango circulo estrela ?", resposta: "losango" },
      { sequencia: "2 3 4 5 ?", resposta: "6" },
      { sequencia: "sino apito bip sino apito ?", resposta: "bip" },
      { sequencia: "5 6 7 ?", resposta: "8" },
      { sequencia: "quadrado circulo estrela quadrado circulo ?", resposta: "estrela" }
    ],
    ano3: [
      { sequencia: "circulo circulo quadrado circulo circulo quadrado circulo ?", resposta: "circulo" },
      { sequencia: "bip bip buzina bip bip ?", resposta: "buzina" },
      { sequencia: "2 4 6 8 ?", resposta: "10" },
      { sequencia: "5 10 15 20 ?", resposta: "25" },
      { sequencia: "10 20 30 40 ?", resposta: "50" },
      { tipo: "erro", sequencia: "2 4 6 7 10", erro: 4 },
      { sequencia: "estrela triangulo triangulo estrela triangulo triangulo estrela ?", resposta: "triangulo" },
      { tipo: "erro", sequencia: "circulo quadrado circulo quadrado triangulo quadrado", erro: 5 },
      { sequencia: "1 3 5 7 ?", resposta: "9" },
      { tipo: "erro", sequencia: "10 20 30 40 45 60", erro: 5 },
      { sequencia: "sino sino apito apito sino sino apito ?", resposta: "apito" },
      { tipo: "erro", sequencia: "5 10 15 21 25", erro: 4 }
    ]
  },

  /* -----------------------------------------------------------------------
     MODO ÁUDIO (só para quem joga com o Modo Áudio ligado)
     Desafios curtos, pensados para um estudante cego do 1º ano.
     A cada 3 desafios o jogo comemora e pergunta se quer continuar.

     montagem: cada pedido é uma lista com 1 ou 2 regras.
       Só valem as peças cabeca, antenas e locomocao, sempre com "=".
       Exemplo: ["cabeca = redonda"]  ou  ["antenas = 2", "locomocao = rodas"]
       Coloque primeiro os pedidos de 1 regra e depois os de 2 regras.

     padroes: só sons (bip, buzina, tambor, sino, apito), no máximo
       4 sons antes do "?". opcoes: 2 ou 3 (quantas respostas o jogo oferece).
     ----------------------------------------------------------------------- */
  modoAudio: {
    montagem: [
      ["cabeca = redonda"],
      ["locomocao = rodas"],
      ["antenas = 2"],
      ["cabeca = triangular"],
      ["locomocao = esteira"],
      ["antenas = 1"],
      ["cabeca = quadrada"],
      ["locomocao = pernas"],
      ["antenas = 0"],
      ["cabeca = redonda", "antenas = 2"],
      ["locomocao = rodas", "cabeca = quadrada"],
      ["antenas = 1", "locomocao = esteira"],
      ["cabeca = triangular", "locomocao = pernas"],
      ["antenas = 0", "cabeca = redonda"],
      ["locomocao = esteira", "antenas = 2"]
    ],
    padroes: [
      { sequencia: "bip buzina bip ?", resposta: "buzina", opcoes: 2 },
      { sequencia: "tambor sino tambor ?", resposta: "sino", opcoes: 2 },
      { sequencia: "apito bip apito ?", resposta: "bip", opcoes: 2 },
      { sequencia: "sino tambor sino tambor ?", resposta: "sino", opcoes: 2 },
      { sequencia: "buzina apito buzina ?", resposta: "apito", opcoes: 2 },
      { sequencia: "bip tambor bip tambor ?", resposta: "bip", opcoes: 2 },
      { sequencia: "sino bip sino ?", resposta: "bip", opcoes: 3 },
      { sequencia: "tambor apito tambor apito ?", resposta: "tambor", opcoes: 3 },
      { sequencia: "buzina sino buzina ?", resposta: "sino", opcoes: 3 },
      { sequencia: "sino apito sino ?", resposta: "apito", opcoes: 3 },
      { sequencia: "bip buzina bip buzina ?", resposta: "bip", opcoes: 3 },
      { sequencia: "bip sino bip sino ?", resposta: "bip", opcoes: 3 }
    ]
  }
};
