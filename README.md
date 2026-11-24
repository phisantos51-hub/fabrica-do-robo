# Fábrica do Robô

Jogo de raciocínio lógico para o Ciclo de Alfabetização (1º, 2º e 3º ano).
A criança trabalha numa fábrica de robôs com três salas. Cada desafio
terminado dá uma peça para montar o **Robô Campeão**.

Endereço do jogo: <https://phisantos51-hub.github.io/fabrica-do-robo/>

## As salas

- **Linha de Montagem**: montar robôs que atendam aos pedidos dos clientes
  (1º e 2º ano) e descobrir o robô certo a partir de pistas (3º ano). No fim
  do 3º ano, a criança cria as próprias pistas.
- **Sala da Torre**: passar os discos de um pino para outro, um por vez, sem
  colocar um disco maior sobre um menor.
- **Sala dos Padrões**: descobrir o que vem depois, achar o erro de uma
  sequência e criar sequências para um colega adivinhar ("Crie você").

Não existe "fim de jogo": quando a criança erra, ela recebe uma dica e tenta
de novo. Cada desafio vale até 3 estrelas.

## Acessibilidade

- **Modo Áudio** (botão na tela inicial ou tecla **F1**): o jogo fala sozinho
  em português e funciona só pelo teclado. É uma versão mais curta e mais
  dinâmica, pensada para um estudante cego do 1º ano:
  - Menu com só 4 opções: **Esteira Rápida**, **Linha de Montagem**, **Torre**
    e **Padrões**. O ano e a velocidade da voz ficam na Área do professor.
  - Falas curtas. A instrução completa aparece só na primeira vez.
  - Qualquer tecla de navegação corta a fala e vai direto para a próxima.
  - Um som de acerto e um som de "tente de novo" no lugar de frases longas.
  - Rodadas de 3 desafios. No fim, a sala comemora com um som próprio, o
    estudante ganha uma peça do Robô Campeão e escolhe "Continuar" ou
    "Trocar de sala".
  - **Esteira Rápida**: robôs passam da esquerda para a direita (use fones);
    aperte Enter quando passar o robô do pedido. Errar não tira nada.
  - **Linha de Montagem**: 1 característica por pedido no começo, depois 2;
    só cabeça, antenas e locomoção, cada uma com 3 opções e um som próprio.
  - **Torre**: 2 discos; 3 discos só se o estudante pedir no fim da rodada.
    Cada pino avisa com um som se o disco pode ou não ir para lá.
  - **Padrões**: até 4 sons antes da pergunta; 2 opções no começo, depois 3.
  - Teclas: setas, Enter, Esc, barra de espaço (repetir), H (ajuda),
    números 1 a 3 (escolher), P (repetir o pedido ou os sons), L (ouvir o
    robô), T (ouvir a torre).
  - Quem usa NVDA ou Narrador pode desligar a "Voz do próprio jogo" em
    Ajustes, para não ouvir duas vozes ao mesmo tempo.
- **Modo Calmo**: cores suaves, frases diretas, passos numerados, sons suaves
  e mensagens sempre iguais. Há também a opção de desligar as animações.
- **Letras e botões maiores** e **Alto contraste**, em Ajustes.
- Botão **Pausa** sempre visível.
- Fora do Modo Áudio, o som começa desligado e tudo tem resposta visual.

## Área do professor

Botão discreto no rodapé, protegido por uma conta de somar. Tem as opções
"Liberar todas as fases", "Apagar progresso" (pede confirmação) e os ajustes
de acessibilidade, o **ano do estudante** e a **velocidade da voz** do Modo
Áudio (normal, rápida ou mais rápida). O progresso fica guardado só no navegador de cada
computador. O jogo não usa internet depois de aberto, não tem anúncios,
não tem links externos e não coleta dados.

## Como acrescentar desafios

Todos os pedidos, pistas, torres e sequências ficam no arquivo
[`js/desafios.js`](js/desafios.js). O começo do arquivo explica, com
exemplos, como escrever cada tipo de desafio. Depois de salvar, abra o jogo
e aperte F5. Os desafios do Modo Áudio ficam no fim do mesmo arquivo, na parte
`modoAudio`. Se algum desafio estiver escrito errado, ele é pulado e os
outros continuam funcionando.

## Arquivos

- `index.html`: a página do jogo
- `css/estilo.css`: cores e tamanhos
- `js/desafios.js`: **os desafios (o arquivo para editar)**
- `js/robo.js`: peças, desenho e descrições do robô
- `js/sons.js`: sons e voz
- `js/nucleo.js`: telas, teclado, ajustes, progresso e Robô Campeão
- `js/sala-montagem.js`, `js/sala-torre.js`, `js/sala-padroes.js`: as três salas
- `js/modo-audio.js`: o Modo Áudio simplificado e a Esteira Rápida
