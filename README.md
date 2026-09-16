# Últimos Dias

`Últimos Dias` é um jogo de sobrevivência narrativa em um apocalipse zumbi. O mundo está começando a ruir, e cada decisão muda a saúde, o moral, os recursos e as relações da comunidade.

## Como jogar

O jogo é uma aplicação HTML/JavaScript sem etapa de compilação. Para executar localmente, abra `last_days.html` no navegador ou inicie um servidor estático na pasta do projeto:

```powershell
python -m http.server 8000
```

Depois, acesse `http://localhost:8000/last_days.html`.

## Changelog

### 16/09/2026

- Adicionados slots separados para armas corpo a corpo e armas de fogo, com catalogo de pistolas, revolveres, submetralhadoras e rifles.
- Armas civis agora aparecem com baixa chance em saques comuns; armas de uso militar ficam restritas a bloqueios e bases militares encontrados em expedicoes longas.
- Municao passou a ser organizada por calibre, tem peso no inventario e e consumida durante o combate. A oficina permite fabricar municao e guardar o resultado no inventario da base.
- O inventario da base aceita transferencias do jogador, acumula itens iguais e permite retirar ou desconstruir unidades para obter materiais da comunidade.
- Saques proximos agora possuem estoque finito: buscas repetidas podem nao render itens, a duracao das saidas dos Scavengers aumenta quando a regiao e esvaziada e mudar de base renova o estoque local.
- O modal de inventario exibe silhueta, slots de equipamento, mochila e transferencias de municao, mantendo os equipamentos separados do inventario compartilhado.


### 15/09/2026

- Scavengers passaram a ter ciclos variáveis: ficam fora de 3 a 6 horas e descansam de 2 a 5 horas antes da próxima saída.
- O rádio pode receber o upgrade **Mural de horários**, permitindo escalar cada NPC para horário livre, madrugada, manhã, tarde ou noite. Os turnos controlam guardas, médicos, Scavengers e demais funções.
- O sistema de ferimentos agora mantém a pessoa em repouso mesmo após o tratamento. O atendimento reduz o tempo de recuperação e elimina o risco associado, mas não remove o ferimento imediatamente.
- Adicionado minigame de lockpick inspirado em Skyrim e Fallout, com rotação da gazua, aplicação de tensão, desgaste, barulho e recompensa. Os arquivos ficam em `assets/UI/lockpick/`.
- Adicionados conhecimentos do apocalipse nos dias 3, 5 e 10: ataque na cabeça, sensibilidade dos zumbis ao som e disfarce do cheiro com sangue e vísceras.
- O evento do dia 5 mostra os zumbis cegos atravessando a rua sem perceber o personagem imóvel; a descoberta registrada continua sendo apenas sobre o som.
- O evento do dia 10 acontece durante uma caminhada pela cidade, com uma horda distante e um sobrevivente passando despercebido depois de se cobrir com restos de um zumbi.
- O modo debug ganhou `debugJogo.lockpick()` para testar a fechadura diretamente no console do navegador.

## Fluxo inicial

- Criação do personagem com nome, sobrenome, aparência predefinida ou imagem própria.
- O personagem jogável é masculino nesta versão; as estruturas para personagens femininas continuam preservadas para futuras gerações.
- Sorteio de nome e sobrenome por gênero.
- Histórico de infância, adolescência e até seis acontecimentos da vida adulta.
- Idade, experiência, atributos, comportamento, perks, arma inicial e recursos são derivados das escolhas.
- Prólogo narrativo com os caminhos a pé, ônibus ou metrô.
- Chegada ao escritório, início do surto Z1N3, fuga pelo prédio, resgate obrigatório da sobrevivente e fuga de carro.
- As escolhas do prólogo têm consequências narrativas, incluindo ferimentos, mortes e a companhia de uma NPC salva.

## Comunidade e base

- Base inicial pequena, com mudança para locais maiores: casa cercada, oficina de bairro, escola abandonada e depósito industrial.
- Limite de moradores, espaços de construção, vagas de veículos, barulho e ameaça.
- Recursos: comida, água, remédios, materiais, munição, combustível e eletricidade.
- Inventário separado da base para equipamentos e itens compartilhados, como gerador portátil, ferramentas, baterias, lampião, kits médicos e peças mecânicas.
- Ligar o gerador exige um gerador armazenado na base e combustível; o equipamento pode ser reutilizado.
- Status separado para água e energia, com cortes aleatórios durante os primeiros 30 dias.
- NPCs mecânicos experientes podem reativar a rede elétrica na usina hidrelétrica e a água na estação de tratamento.
- Construções: enfermaria, horta, cisterna, oficina, alojamento, torre de vigia, gerador e rádio.
- Moral da base, defesa, barricadas e pressão humana/zumbi são atualizados pelas decisões e atividades.

## NPCs e funções

Os sobreviventes podem assumir funções que rodam em segundo plano:

- **Guarda:** protege o muro em turnos.
- **Scavenger:** procura comida, água e materiais em saídas aleatórias de 3 a 6 horas, descansando de 2 a 5 horas entre elas.
- **Médico:** trata doenças e ferimentos usando remédios.
- **Agricultor:** produz comida quando há horta.
- **Mecânico:** produz materiais quando há oficina.
- **Coletor de água:** busca água nas proximidades.
- **Sem função:** permanece na base e descansa.

## Saúde

- Doenças sistêmicas: gripe, virose, peste roxa, intoxicação e infecção.
- Ferimentos: cortes normais e profundos, ralados, hematomas, ossos quebrados e mordidas.
- Gravidade leve, média e grave, com dano e tempo de recuperação próprios.
- Mapa corporal com silhuetas masculina e feminina e decalques de ferimentos/doenças.
- Tratamento pelo próprio personagem, pela enfermaria ou por NPCs médicos.
- Doenças e ferimentos não tratados pioram e podem matar.

## Ameaça e muro

A ameaça representa a quantidade de zumbis e a pressão do lado de fora. Ela aumenta com movimento, construções, produção, tiros, excursões e barulho. O painel do muro mostra imagens por faixa de ameaça:

1. Rua quase vazia
2. Movimento na rua
3. Zumbis se reunindo
4. Muro sob pressão
5. Horda à porta

É possível atrair zumbis para longe, soltar fogos, montar armadilhas, abater grupos ou reduzir o movimento da base.

## Exploração, rádio e veículos

- Saque de casas próximas e expedições para supermercado, farmácia, posto, depósito de construção, delegacia e hospital.
- Rádio desbloqueia ordens internas, contato com outros acampamentos, excursões de longa duração e o upgrade Mural de horários.
- Ordens de rádio podem focar em ameaça, medicina, mecânica ou suprimentos e melhoram habilidades ao longo dos dias.
- O Mural de horários permite definir turnos individuais para os moradores e limita o trabalho ao horário escolhido.
- Scavengers podem procurar alvos grandes, como hospitais, bases abandonadas e centros de logística.
- Excursões têm estados de caminho, local e retorno, além de risco, carga, ferimentos e loot.
- Veículos: SUV, caminhonete, carro de quatro portas e carro de duas portas.
- Cada veículo possui lugares, carga, combustível e velocidade próprios.
- A oficina mecânica permite instalar porta-malas reforçado, suspensão, blindagem e tanque auxiliar.

## Combate

Eventos de rua, expedições e algumas decisões podem iniciar o combate por turnos. A cada rodada, o jogador pode atacar, defender ou fugir. O resultado considera força, agilidade, arma equipada, dano, energia e quantidade de zumbis. O combate gera barulho e pode aumentar a ameaça.

Durante saques, gazuas podem abrir contêineres trancados em um lockpick de rotação e tensão; erros desgastam a ferramenta e aumentam a ameaça.

## Relações e família

- Interações amigáveis: conversar, abraçar e conversa profunda.
- Interações românticas: flertar, beijar e expressar amor.
- Relacionamentos podem evoluir para namoro e casamento conforme amizade e romance.
- Eventos de relacionamento acontecem durante refeições, descanso, sono e saídas.
- A árvore genealógica mostra somente vínculos familiares; moradores comuns continuam no painel da comunidade.
- Gravidez, filhos e sucessão da liderança fazem parte da linhagem.

## Eventos

Há eventos com escolhas e eventos corriqueiros sem escolha, incluindo refeições, obras, chuva, rondas, barulhos distantes, alarmes, encontros, doenças, brigas, pesadelos, resgates, conhecimentos do apocalipse e acontecimentos de relacionamento. Eventos de combate usam o mesmo sistema de turnos do restante do jogo.

Para testes, o modo debug fica disponível no console do navegador:

```js
debugJogo.ativar()
debugJogo.listar()
debugJogo.evento('alarme')
forcarEventoHorror()
debugJogo.desativar()
```

## Áudio e mídia

- Engrenagem de configurações fixa em todas as telas, inclusive durante modais.
- Volume geral, silenciar/reativar e preferência persistida no navegador.
- Mini player para escolher, tocar, pausar e alternar entre as músicas tema.
- Ambiências do prólogo, música do jogo, áudio de expedição, alarme de carro e som de horda.
- Imagens e animações de eventos e prólogo são carregadas de `assets/eventos`.

## Salvamento

- **Salvar:** grava a partida no `localStorage` do navegador.
- **Continuar partida:** recupera o último save local.
- **Exportar partida:** baixa um arquivo JSON.
- **Carregar partida:** importa um JSON pela tela inicial ou dentro do jogo.
- Arquivos importados passam por validação de versão, atributos, inventário, relações, família, recursos e imagens, com migração de saves antigos quando possível.

## Estrutura de mídia

- `assets/UI/icons`: ícones de recursos, saúde e funções.
- `assets/UI/body_*`: silhuetas corporais.
- `assets/UI/decalques` e `assets/UI/regioes`: sobreposições de saúde.
- `assets/UI/lockpick`: fechadura, gazua e chave de fenda do minigame.
- `assets/eventos`: GIFs e imagens de acontecimentos.
- `assets/snd`: músicas, ambiências e efeitos.
- `assets/muro`: imagens e configuração das faixas de ameaça.
- `js/comunidade.js`: base, NPCs, saúde, eventos, rádio, excursões e veículos.
- `last_days.html`: interface, criação, prólogo, ações, relações, inventário, combate e salvamento.
