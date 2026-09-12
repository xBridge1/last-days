# Últimos Dias — Sobrevivência

Abra `deepseek_html_20260912_271fcb.html` no navegador para jogar.

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

O HTML original está preservado em `save/antes-das-correcoes.html.bak`.

## Verificação

Foram executadas 39 verificações no Edge headless, com interface e armazenamento reais, incluindo uma simulação de dez dias.

Para repetir em Windows com Python e Microsoft Edge instalados:

```powershell
python tests/verificar_navegador.py
```

O teste usa servidor local e perfil temporário, sem acessar sua sessão normal do navegador. Os cenários estão em `tests/regressoes.js`.
