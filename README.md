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
  em português e funciona só pelo teclado.
  - Setas: escolher · Enter: confirmar · Esc: voltar
  - Barra de espaço: repetir a última fala · H: ajuda falada
  - Linha de Montagem: **L** descreve o robô, **P** repete o pedido ou as pistas,
    números levam a um robô, **R** risca um robô (3º ano)
  - Sala da Torre: **T** descreve a torre inteira
  - Sala dos Padrões: **1**, **2** ou **3** escolhem uma opção, **P** toca a sequência
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
de acessibilidade. O progresso fica guardado só no navegador de cada
computador. O jogo não usa internet depois de aberto, não tem anúncios,
não tem links externos e não coleta dados.

## Como acrescentar desafios

Todos os pedidos, pistas, torres e sequências ficam no arquivo
[`js/desafios.js`](js/desafios.js). O começo do arquivo explica, com
exemplos, como escrever cada tipo de desafio. Depois de salvar, abra o jogo
e aperte F5. Se algum desafio estiver escrito errado, ele é pulado e os
outros continuam funcionando.

## Arquivos

- `index.html`: a página do jogo
- `css/estilo.css`: cores e tamanhos
- `js/desafios.js`: **os desafios (o arquivo para editar)**
- `js/robo.js`: peças, desenho e descrições do robô
- `js/sons.js`: sons e voz
- `js/nucleo.js`: telas, teclado, ajustes, progresso e Robô Campeão
- `js/sala-montagem.js`, `js/sala-torre.js`, `js/sala-padroes.js`: as três salas
