# Últimos Dias — Sobrevivência

Abra `last_days.html` no navegador para jogar.

## Changelog

### 15/09/2026

- Scavengers agora ficam fora por um período aleatório de 3 a 6 horas e descansam de 2 a 5 horas antes da próxima saída.
- Rádio pode receber o upgrade **Mural de horários**, que permite escalar cada NPC para horário livre, madrugada, manhã, tarde ou noite. O turno controla guardas, médicos, Scavengers e demais funções.
- Ferimentos mantêm o personagem em repouso mesmo depois do tratamento. O atendimento reduz o tempo de recuperação e elimina o risco associado, mas não remove o ferimento imediatamente.
- Adicionado o minigame de lockpick com rotação da gazua, aplicação de tensão, desgaste, barulho e recompensa. Os assets ficam em `assets/UI/lockpick/`.
- Adicionados conhecimentos do apocalipse nos dias 3, 5 e 10: ataque na cabeça, sensibilidade dos zumbis ao som e disfarce do cheiro com sangue e vísceras.
- O evento do dia 5 agora mostra os zumbis cegos atravessando a rua sem perceber o personagem imóvel; a descoberta registrada continua sendo apenas sobre o som.
- O evento do dia 10 ocorre durante uma caminhada pela cidade, com uma horda distante e um sobrevivente passando despercebido depois de se cobrir com restos de um zumbi.
- O modo debug ganhou o comando `debugJogo.lockpick()` para testar a fechadura diretamente no console do navegador.

## Comunidade, base e ameaça

- NPCs podem receber as funções Guarda, Scavenger, Médico, Agricultor, Mecânico, Coletor de água ou Sem função. Scavengers fazem saídas automáticas de 3 a 6 horas, descansam de 2 a 5 horas entre saídas e médicos tratam o caso mais grave usando remédios.
- Gripe, virose, intoxicação, peste roxa e infecção de ferimentos surgem durante a campanha. A gravidade aumenta com o tempo; sem tratamento, chega a 100% e mata a pessoa. A enfermaria reduz o risco e aumenta a força do tratamento.
- A casa inicial tem quatro vagas e três espaços. É possível construir enfermaria, horta, cisterna, oficina, alojamento, torre de vigia, central de energia e rádio. Locais maiores podem ser descobertos e ocupados pela comunidade.
- O botão Construções administra instalações e desmontagem. Novos abrigos permitem procurar e mudar de local, recuperando parte dos materiais das instalações antigas.
- A ameaça mede a aglomeração estimada de zumbis fora do muro. Ela cresce com população, saídas, trabalhos, construções, obras, geradores e ações barulhentas. O painel também mostra a atenção humana, que pode trazer saqueadores.
- O visor do muro usa cinco faixas de imagem: rua quase vazia, movimento, zumbis se reunindo, muro sob pressão e horda. Cada faixa aceita vários GIFs ou imagens em `assets/muro/config.js`; a cena troca a cada oito segundos. As SVGs incluídas são placeholders editáveis.
- Planos do muro: atrair zumbis para longe, soltar fogos, montar armadilhas, abater zumbis e reduzir o movimento. Cada plano tem custo, duração, ruído e consequência próprios.
- Refeições, descanso, obras, expedições e deslocamentos podem abrir eventos no meio da ação. A decisão pausa a ação; depois dela, o progresso é retomado sem duplicar o consumo de tempo.
- Ações também podem gerar acontecimentos cotidianos sem escolha, como organizar a cozinha, captar chuva, terminar uma ronda, ouvir barulhos distantes, improvisar reparos ou encontrar uma rua vazia. Eles aparecem no diário e não interrompem o progresso.
- A saúde agora diferencia ferimentos e doenças. Cortes normais e profundos, ralados, hematomas, ossos quebrados e mordidas mostram local do corpo, intensidade leve/média/grave e prazo de recuperação. A tela de Saúde exibe um mapa corporal com a área machucada.
- Gripe, virose, intoxicação e a peste roxa são sistêmicas: afetam o corpo todo, evoluem ao longo do tempo e exigem tratamento e repouso. Ferimentos graves também podem causar infecção.
- Água continua sendo um recurso diário. Eletricidade é um recurso separado: alimenta instalações e tratamentos, recarrega enquanto a rede funciona e pode cair aleatoriamente durante os primeiros 30 dias. Combustível e a central de energia permitem restabelecer ou manter serviços.

## Correções aplicadas

- Decisões entram em uma fila; consultar perfis não apaga eventos ou escolhas de nível.
- Dano fatal encerra a vida antes de outra ação ou cura. A campanha pode continuar por herança ou eleição.
- Grupo e família compartilham os dados de cada pessoa. A sucessão conserva atributos, experiência, perks, imagem e idade.
- Idades consideram a data de entrada ou nascimento. O painel acompanha aniversários e a idade dos falecidos fica registrada.
- Romance exige adultos sem parentesco. Tentativas de gravidez exigem parceria recíproca, pessoas vivas e as mesmas condições em ambos os caminhos.
- Gestação reserva uma vaga; morte da gestante encerra a gravidez. Nascimentos e prematuridade atualizam todos os atributos.
- Cada nível concede uma recompensa, inclusive os níveis provenientes da biografia inicial. Empatia, ânimo zero e limites das relações foram corrigidos.
- Seleção de gênero e aparência preserva o nome digitado. Fotos próprias continuam no perfil. Silhuetas vetoriais embutidas substituem os retratos ausentes.
- Cliques e teclado nos perfis familiares não abrem outra tela por propagação do evento.

## Regras de balanceamento

- Até seis acontecimentos adultos diferentes; cada um acrescenta cinco anos. Não podem ser repetidos.
- Até oito integrantes além do protagonista, incluindo a vaga reservada para uma gestação.
- Maioridade aos 18 anos para romance, gestação, tarefas do grupo e liderança independente.
- Tentativas de gravidez: seis horas, dez de energia, duas comidas e duas águas; até três filhos por pessoa.
- Treino: uma vez por dia, quinze de energia e experiência; atributos melhoram ao subir de nível.
- Fome e sede crescem durante todas as ações. A refeição diária reduz ambas quando há suprimentos.
- Revólver consome munição e aumenta a ameaça. Gerador consome combustível para recuperar energia e moral, também fazendo ruído.
- O passado criminoso pode ser revelado e afetar a confiança do grupo. Outros textos de biografia descrevem os efeitos efetivamente implementados.
- Crescimento das hordas e probabilidades diárias da gestação foram moderados para campanhas prolongadas. O equilíbrio fino pode ser ajustado conforme as partidas.

## Salvamento

O jogo salva automaticamente no armazenamento do navegador, inclusive durante ações. Use **Continuar partida** na abertura. A chave é `ultimos-dias-save-v1`.

Decisões pendentes mantêm o último ponto salvo; conclua a escolha antes de salvar ou exportar. Uma morte salva reabre o fluxo de sucessão ao carregar. O diário visual não é preservado.

**Exportar partida** baixa um arquivo JSON. **Carregar partida** valida esse arquivo antes de substituir o estado atual. Os arquivos são baixados pelo navegador; a pasta `save` não recebe os saves automaticamente. A exportação permite guardar partidas mesmo quando o armazenamento do navegador estiver indisponível.

O HTML original está preservado em `save/antes-das-correcoes.html.bak`. A versão anterior à expansão está em `save/antes-da-expansao-base.html.bak`.

## Verificação

Foram executadas 39 verificações no Edge headless, com interface e armazenamento reais, incluindo uma simulação de dez dias.

Para repetir em Windows com Python e Microsoft Edge instalados:

```powershell
python tests/verificar_navegador.py
```

O teste usa servidor local e perfil temporário, sem acessar sua sessão normal do navegador. Os cenários estão em `tests/regressoes.js`.

- Eventos aceitam mídia opcional em assets/eventos/. Os nomes esperados são refeicao.gif, panela.gif, sono.gif, rua.gif, manada.gif, saqueadores.gif e combate.gif. Se o arquivo não existir, o modal mostra apenas o texto.

- O evento do horror do surto usa opcionalmente assets/eventos/horror-surto.gif.

- Modo debug persistente: no console, use window.debugJogo.ativar(), window.debugJogo.listar() e window.debugJogo.evento('horror') para testar eventos. Os acontecimentos cotidianos também podem ser testados por rotinaCozinha, chuvaFraca, rondaTranquila, barulhoDistante, reparoImprovisado e ruaVazia.

GIFs do prólogo:
- Masculino: assets/eventos/prologo/masculino/trajeto.gif, reuniao.gif, panico-predio.gif, chefe-escada.gif, chefe-ataque.gif, corpo-chefe.gif, resgate-lobby.gif, estacionamento.gif, fuga-carro.gif.
- Feminino: assets/eventos/prologo/feminino/trajeto.gif, reuniao.gif, panico-predio.gif, chefe-escada.gif, chefe-ataque.gif, corpo-chefe.gif, resgate-lobby.gif, estacionamento.gif, fuga-carro.gif.

- Cenas de consequência opcionais do prólogo: chefe-fuga.gif, resgate-sucesso.gif e partida-carro.gif, dentro da pasta de cada gênero.
