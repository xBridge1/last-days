/* Minigames de exploração e manutenção. Os assets são opcionais para a lógica,
   mas deixam cada painel mais legível e ajudam a manter a direção visual. */
const MINIGAME_ASSETS = Object.freeze({
  radio:'assets/UI/minigames/radio/',
  stealth:'assets/UI/minigames/stealth/',
  door:'assets/UI/minigames/door/',
  refuel:'assets/UI/minigames/refuel/',
  hotwire:'assets/UI/minigames/hotwire/',
  traps:'assets/UI/minigames/traps/'
});

/* Habilidades de minigame. O progresso fica no perfil do jogador e acompanha
   o save: quanto mais o jogador pratica, mais contexto e auxílios aparecem. */
const MINIGAME_SKILLS = Object.freeze({
  lockpick:{nome:'Lockpick',atributo:'inteligencia',dicas:[
    'A fechadura responde melhor a movimentos pequenos e controlados.',
    'Você começa a sentir a resistência antes de forçar a gazua.',
    'O desgaste revela quando o ângulo está próximo do ponto de tensão.',
    'Você reconhece o ponto de tensão com menos tentativas.'
  ]},
  radio:{nome:'Sintonia de rádio',atributo:'inteligencia',dicas:[
    'A estática ainda encobre os padrões da transmissão.',
    'Compare o ruído entre pequenos ajustes do dial.',
    'Você já consegue separar interferência de uma voz distante.',
    'Seu ouvido treinado reconhece intervalos mais estáveis.'
  ]},
  furtividade:{nome:'Furtividade',atributo:'agilidade',dicas:[
    'Movimentos bruscos e objetos soltos são seus maiores riscos.',
    'Você começa a ler o terreno antes de pisar.',
    'O silêncio do ambiente ajuda a escolher o próximo abrigo.',
    'Você identifica rotas com menos ruído antes de avançar.'
  ]},
  arrombamento:{nome:'Arrombamento',atributo:'forca',dicas:[
    'Procure pontos de pressão antes de gastar força.',
    'A madeira e o batente mostram onde cederão primeiro.',
    'Você já reconhece quais ferramentas fazem menos barulho.',
    'Seu método reduz o esforço desperdiçado na fechadura.'
  ]},
  abastecimento:{nome:'Abastecimento',atributo:'resistencia',dicas:[
    'Mantenha o bico firme e observe o nível do tanque.',
    'Você aprendeu a interromper o fluxo antes do transbordamento.',
    'O som do tanque ajuda a perceber quando ele está quase cheio.',
    'Seu controle reduz o desperdício durante transferências longas.'
  ]},
  hotwire:{nome:'Ligação direta',atributo:'inteligencia',dicas:[
    'Você ainda não reconhece os padrões do circuito.',
    'Observe a espessura, o desgaste e a posição dos conectores.',
    'Marcas de manutenção próximas ao painel começam a fazer sentido.',
    'Você identifica a lógica de alimentação e retorno sem depender de uma resposta pronta.'
  ]},
  armadilhas:{nome:'Armadilhas',atributo:'inteligencia',dicas:[
    'Uma armadilha estável começa com uma base bem presa.',
    'Você percebe quais peças podem fazer barulho ao cair.',
    'A tensão do arame e o peso das latas ficam mais fáceis de calcular.',
    'Você monta mecanismos mais discretos e confiáveis.'
  ]}
});

function garantirSkillsMinigame(){
  const jogador=typeof S!=='undefined'?S?.player:null;
  if(!jogador)return {};
  jogador.minigameSkills ||= {};
  for(const id of Object.keys(MINIGAME_SKILLS)){
    jogador.minigameSkills[id]=clamp(Number(jogador.minigameSkills[id])||0,0,10);
  }
  return jogador.minigameSkills;
}
function nivelMinigame(id){return garantirSkillsMinigame()[id]||0;}
function registrarPratica(id,valor=1){
  const skills=garantirSkillsMinigame();
  if(!Object.prototype.hasOwnProperty.call(MINIGAME_SKILLS,id))return 0;
  const antes=skills[id]||0;
  skills[id]=clamp(antes+(Number(valor)||0),0,10);
  const depois=skills[id];
  if(depois>antes && depois%2===0){
    log(`A prática melhorou sua habilidade de ${MINIGAME_SKILLS[id].nome}. Um novo auxílio está disponível.`,'bom');
  }
  return depois;
}
function auxilioMinigame(id){
  const skill=MINIGAME_SKILLS[id];
  if(!skill)return '';
  const nivel=nivelMinigame(id),indice=Math.min(skill.dicas.length-1,Math.floor(nivel/2));
  return `<p class="minigameAuxilio" style="padding:8px 10px;border-left:3px solid #c58d91;background:#1b1515;color:#e0b1b1;font-size:12px"><b>Auxílio (${esc(skill.nome)} · nível ${nivel}):</b> ${esc(skill.dicas[indice])}</p>`;
}

function minigameImagem(caminho,alt=''){
  return `<img class="modalMidia" src="${caminho}" alt="${esc(alt)}" onerror="this.hidden=true">`;
}
function minigameObjeto(caminho,alt=''){
  return `<img src="${caminho}" alt="${esc(alt)}" title="${esc(alt)}" style="width:76px;height:76px;object-fit:contain;vertical-align:middle;margin:2px" onerror="this.hidden=true">`;
}
function minigameBarra(valor,cor='#a83232'){
  const v=clamp(Number(valor)||0,0,100);
  return `<div style="height:9px;background:#282d2a;border:1px solid var(--borda);border-radius:6px;overflow:hidden;margin:8px 0 14px"><i style="display:block;width:${v}%;height:100%;background:${cor};transition:width .2s"></i></div>`;
}
function minigameFechar(){return {texto:'Fechar',fn:()=>{}};}
function minigameFalha(titulo,texto,midia=null){
  abrirModal(titulo,texto,[{texto:'Continuar',fn:()=>{}}],false,midia);
}

function abrirMinigameRadio(){
  if(!radioInstalado()){log('Construa um rádio antes de tentar sintonizar uma transmissão.','info');return;}
  const estado={pos:50,alvo:rnd(12,88),tentativas:0};
  const distancia=()=>Math.abs(estado.pos-estado.alvo);
  const desenhar=()=>{
    const tolerancia=7+Math.floor(nivelMinigame('radio')/3),d=distancia(),cor=d<=tolerancia?'#70c98a':d<=18?'#e5c56b':'#a83232';
    const texto=`${minigameImagem(MINIGAME_ASSETS.radio+'radio-console.png','Rádio de emergência')}<p>${minigameObjeto(MINIGAME_ASSETS.radio+'radio-dial.png','Dial de sintonia')}${minigameObjeto(MINIGAME_ASSETS.radio+'radio-signal.png','Sinal de rádio')}</p><p>Ajuste o dial até encontrar uma transmissão. O sinal fica mais claro quando você se aproxima da frequência correta.</p><p><b>Frequência aproximada:</b> ${estado.pos}% · <b>Tentativas:</b> ${estado.tentativas}</p>${minigameBarra(Math.max(0,100-d*2),cor)}<p style="color:${cor}">${d<=7?'O sinal está quase limpo.':'Apenas estática e vozes distantes.'}</p>`;
    abrirPainel('Sintonizar transmissão',texto,[
      {texto:'Girar o dial para a esquerda · 5',fn:()=>ajustar(-5)},
      {texto:'Girar o dial para a direita · 5',fn:()=>ajustar(5)},
      {texto:'Tentar ouvir a frequência',fn:tentar},
      minigameFechar()
    ]);
  };
  function ajustar(delta){estado.pos=clamp(estado.pos+delta,0,100);estado.tentativas++;if(estado.tentativas>=12&&distancia()>7){S.base.ameaca=clamp(S.base.ameaca+2,0,100);log('A estática chamou atenção antes de você encontrar uma frequência limpa.','ruim');}desenhar();}
  function tentar(){
    estado.tentativas++;
    if(distancia()<=7){S.base.moral=clamp(S.base.moral+2,0,100);S.base.atencaoHumana=clamp(S.base.atencaoHumana-2,0,100);log('Você encontrou uma transmissão. A mensagem traz coordenadas e melhora o ânimo da base.','bom');fecharModal();render();return;}
    if(estado.tentativas>=14){S.base.ameaca=clamp(S.base.ameaca+3,0,100);log('A transmissão se perdeu no ruído. O tempo gasto também chamou atenção.','ruim');fecharModal();render();return;}
    desenhar();
  }
  desenhar();
}

function abrirMinigameFurtividade(){
  if(!podeAgir(5))return;
  const estado={passos:0,ruido:0};
  const desenhar=()=>{
    const perigo=estado.ruido>=70?'#a83232':estado.ruido>=40?'#e5c56b':'#70c98a';
    const texto=`${minigameImagem(MINIGAME_ASSETS.stealth+'stealth-alley.png','Beco tomado por zumbis')}<p>${minigameObjeto(MINIGAME_ASSETS.stealth+'zombie-silhouette.png','Silhueta de zumbi')}${minigameObjeto(MINIGAME_ASSETS.stealth+'noise-ring.png','Ondas de ruído')}${minigameObjeto(MINIGAME_ASSETS.stealth+'stealth-footstep.png','Pegada')}</p><p>Você precisa atravessar o beco sem produzir um som alto. Os zumbis não enxergam, mas escutam qualquer movimento brusco.</p><p><b>Progresso:</b> ${estado.passos}/3 · <b>Ruído:</b> ${estado.ruido}%</p>${minigameBarra(estado.ruido,perigo)}<p style="color:${perigo}">${estado.ruido>=70?'Eles começaram a virar a cabeça.':'O grupo ainda não percebeu você.'}</p>`;
    abrirPainel('Atravessar em silêncio',texto,[
      {texto:'Dar um passo cuidadoso',fn:()=>mover(8,1)},
      {texto:'Esperar o vento cobrir o som',fn:()=>mover(-6,0)},
      {texto:'Correr até a próxima cobertura',fn:()=>mover(27,1)},
      minigameFechar()
    ]);
  };
  function mover(ruido,passos){
    registrarPratica('furtividade');
    estado.ruido=clamp(estado.ruido+ruido,0,100);estado.passos+=passos;
    if(estado.ruido>=100){S.base.ameaca=clamp(S.base.ameaca+5,0,100);S.player.energia=Math.max(0,S.player.energia-5);minigameFalha('O som ecoou pelo beco','Você pisa em uma lata e os zumbis avançam na sua direção. Você foge, mas o barulho aumenta a ameaça.');return;}
    if(estado.passos>=3){S.player.energia=Math.max(0,S.player.energia-5);S.base.ameaca=clamp(S.base.ameaca-2,0,100);log('Você atravessou o beco sem ser percebido.','bom');fecharModal();render();return;}
    desenhar();
  }
  desenhar();
}

function abrirMinigameArrombamento(){
  if(!podeAgir(8))return;
  const estado={dano:0,ruido:0};
  const desenhar=()=>{
    const porta=estado.dano>=55?'door-damaged.png':'door-closed.png';
    const texto=`${minigameImagem(MINIGAME_ASSETS.door+porta,'Porta trancada')}<p>${minigameObjeto(MINIGAME_ASSETS.door+'door-lock.png','Fechadura')}${minigameObjeto(MINIGAME_ASSETS.door+'crowbar.png','Pé de cabra')}</p><p>A porta está trancada. Você pode procurar o ponto fraco ou forçar a fechadura. Quanto mais barulho fizer, maior a chance de atrair zumbis.</p><p><b>Dano na fechadura:</b> ${estado.dano}% · <b>Ruído:</b> ${estado.ruido}%</p>${minigameBarra(estado.dano,'#c58d91')}`;
    abrirPainel('Arrombar porta',texto,[
      {texto:'Procurar o ponto fraco · inteligência',fn:()=>acao('busca')},
      {texto:'Forçar com o corpo · força',fn:()=>acao('forca')},
      {texto:'Usar materiais como alavanca',fn:()=>acao('ferramenta')},
      minigameFechar()
    ]);
  };
  function acao(tipo){
    registrarPratica('arrombamento');
    const inteligencia=Number(S.player.inteligencia)||0,forca=Number(S.player.forca)||0;
    if(tipo==='busca'){estado.dano+=8+inteligencia*3;estado.ruido+=4;}
    if(tipo==='forca'){estado.dano+=12+forca*4;estado.ruido+=18;}
    if(tipo==='ferramenta'){
      if((S.recursos.materiais||0)<1){log('Você precisa de pelo menos 1 material para improvisar uma alavanca.','info');return;}
      S.recursos.materiais--;estado.dano+=30;estado.ruido+=12;
    }
    if(estado.ruido>=100){S.base.ameaca=clamp(S.base.ameaca+6,0,100);minigameFalha('A porta resistiu','O barulho ficou alto demais e você abandonou a tentativa antes que os zumbis chegassem.',MINIGAME_ASSETS.door+'door-damaged.png');return;}
    if(estado.dano>=100){S.base.ameaca=clamp(S.base.ameaca+Math.floor(estado.ruido/20),0,100);S.player.energia=Math.max(0,S.player.energia-8);log('A porta cedeu. Você encontrou um pequeno esconderijo para saquear.','bom');lootItens(S.player,'rua');fecharModal();render();return;}
    desenhar();
  }
  desenhar();
}

function abrirMinigameAbastecimento(id){
  const veiculo=veiculoPorId(id)||S.base.veiculos?.find(v=>v.estado==='pronto');
  if(!veiculo){log('Localize um veículo antes de abastecê-lo.','info');return;}
  const estado={transferido:0,derramado:0};
  const desenhar=()=>{
    const texto=`${minigameImagem(MINIGAME_ASSETS.refuel+'fuel-station-view.png','Abastecendo um veículo')}<p>${minigameObjeto(MINIGAME_ASSETS.refuel+'fuel-nozzle.png','Bico de combustível')}${minigameObjeto(MINIGAME_ASSETS.refuel+'fuel-can.png','Galão de combustível')}${minigameObjeto(MINIGAME_ASSETS.refuel+'fuel-gauge.png','Medidor de combustível')}</p><p>Transfira combustível para o veículo sem derramar. Cada unidade transferida consome combustível armazenado na base.</p><p><b>Veículo:</b> ${esc(veiculo.nome)} · <b>Tanque:</b> ${veiculo.combustivel} · <b>Transferido:</b> ${estado.transferido} · <b>Derramado:</b> ${estado.derramado}</p>${minigameBarra(Math.min(100,estado.transferido*20),'#d6a84d')}`;
    abrirPainel('Abastecer veículo',texto,[
      {texto:'Transferir 1 unidade',fn:()=>transferir(1)},
      {texto:'Transferir 3 unidades com cuidado',fn:()=>transferir(3)},
      {texto:'Parar o abastecimento',fn:()=>{log(`O ${veiculo.nome} recebeu ${estado.transferido} unidade(s) de combustível.`,'bom');fecharModal();render();}},
      minigameFechar()
    ]);
  };
  function transferir(qtd){
    registrarPratica('abastecimento');
    if((S.recursos.combustivel||0)<qtd){log('Não há combustível suficiente na base.','info');return;}
    S.recursos.combustivel-=qtd;const capacidade=40-(Number(veiculo.combustivel)||0);const aceito=Math.min(qtd,Math.max(0,capacidade));veiculo.combustivel+=aceito;estado.transferido+=aceito;if(aceito<qtd){estado.derramado+=qtd-aceito;S.base.ameaca=clamp(S.base.ameaca+2,0,100);log('O tanque estava cheio e parte do combustível foi derramada.','ruim');}desenhar();
  }
  desenhar();
}

function abrirMinigameHotwireLegado(id){
  return abrirMinigameHotwire(id);
  const veiculo=veiculoPorId(id)||S.base.veiculos?.find(v=>v.estado==='pronto');
  if(!veiculo){log('Localize um veículo antes de tentar fazer ligação direta.','info');return;}
  const sequencia=['vermelho','amarelo','preto','azul'].sort(()=>Math.random()-.5),estado={indice:0,erros:0};
  const nomes={vermelho:'Vermelho',amarelo:'Amarelo',preto:'Preto',azul:'Azul'};
  const desenhar=()=>{
    const atual=sequencia[estado.indice],texto=`${minigameImagem(MINIGAME_ASSETS.hotwire+'car-dashboard.png','Painel de veículo')}<p>${minigameObjeto(MINIGAME_ASSETS.hotwire+'ignition-panel.png','Painel da ignição')}${minigameObjeto(MINIGAME_ASSETS.hotwire+'wire-red.png','Fio vermelho')}${minigameObjeto(MINIGAME_ASSETS.hotwire+'wire-yellow.png','Fio amarelo')}${minigameObjeto(MINIGAME_ASSETS.hotwire+'wire-black.png','Fio preto')}${minigameObjeto(MINIGAME_ASSETS.hotwire+'wire-blue.png','Fio azul')}</p><p>Conecte os fios na sequência correta. Um erro produz faíscas e pode chamar atenção.</p><p><b>Próximo fio:</b> ${nomes[atual]||'finalização'} · <b>Erros:</b> ${estado.erros}</p>${minigameBarra((estado.indice/4)*100,'#70a4c9')}`;
    const botoes=['vermelho','amarelo','preto','azul'].map(cor=>({texto:`Conectar fio ${nomes[cor]}`,fn:()=>conectar(cor)}));
    abrirPainel('Ligação direta',texto,[...botoes,minigameFechar()]);
  };
  function conectar(cor){
    if(cor!==sequencia[estado.indice]){estado.erros++;S.base.ameaca=clamp(S.base.ameaca+1,0,100);if(estado.erros>=3){minigameFalha('A ligação falhou','Uma faísca queimou o circuito. O veículo continua parado e o barulho chamou atenção.',MINIGAME_ASSETS.hotwire+'wire-spark.png');return;}desenhar();return;}
    estado.indice++;if(estado.indice>=sequencia.length){veiculo.estado='pronto';veiculo.combustivel=Math.max(1,Number(veiculo.combustivel)||0);log(`A ligação direta do ${veiculo.nome} funcionou. O veículo está pronto para uso.`,'bom');fecharModal();render();return;}desenhar();
  }
  desenhar();
}

function abrirMinigameArmadilhas(){
  if((S.recursos.materiais||0)<4){log('São necessários 4 materiais para montar uma armadilha.','info');return;}
  const ordem=['arame','lata','estacas'],nomes={arame:'Arame',lata:'Lata com pedras',estacas:'Estacas'};const estado={indice:0};
  const desenhar=()=>{
    const texto=`${minigameImagem(MINIGAME_ASSETS.traps+'trap-workbench.png','Bancada de armadilhas')}<p>${minigameObjeto(MINIGAME_ASSETS.traps+'trap-parts.png','Peças de armadilha')}${minigameObjeto(MINIGAME_ASSETS.traps+'trap-wire.png','Arame')}${minigameObjeto(MINIGAME_ASSETS.traps+'trap-can.png','Lata com pedras')}${minigameObjeto(MINIGAME_ASSETS.traps+'trap-stakes.png','Estacas')}</p><p>Monte uma armadilha silenciosa para a cerca. Escolha os componentes na ordem correta para não desperdiçar materiais.</p><p><b>Próximo componente:</b> ${nomes[ordem[estado.indice]]||'concluído'}</p>${minigameBarra((estado.indice/3)*100,'#c58d91')}`;
    abrirPainel('Montar armadilha',texto,[
      ...ordem.map(id=>({texto:`Instalar ${nomes[id]}`,fn:()=>instalar(id)})),
      minigameFechar()
    ]);
  };
  function instalar(id){
    registrarPratica('armadilhas');
    if(id!==ordem[estado.indice]){S.base.ameaca=clamp(S.base.ameaca+1,0,100);log('A peça caiu no chão e fez barulho.','ruim');return;}
    estado.indice++;if(estado.indice>=ordem.length){S.recursos.materiais-=4;S.base.armadilhas=Math.min(9,(S.base.armadilhas||0)+1);log('Uma armadilha foi montada e posicionada junto ao muro.','bom');fecharModal();render();return;}desenhar();
  }
  desenhar();
}

window.abrirMinigameRadio=abrirMinigameRadio;
window.abrirMinigameFurtividade=abrirMinigameFurtividade;
window.abrirMinigameArrombamento=abrirMinigameArrombamento;
window.abrirMinigameAbastecimento=abrirMinigameAbastecimento;
window.abrirMinigameHotwire=abrirMinigameHotwireLegado;
window.abrirMinigameArmadilhas=abrirMinigameArmadilhas;
if(window.debugJogo){
  window.debugJogo.minigameRadio=()=>{if(!S?.vivo)return false;abrirMinigameRadio();return true;};
  window.debugJogo.minigameFurtividade=()=>{if(!S?.vivo)return false;abrirMinigameFurtividade();return true;};
  window.debugJogo.minigameArrombamento=()=>{if(!S?.vivo)return false;abrirMinigameArrombamento();return true;};
  window.debugJogo.minigameAbastecimento=()=>{if(!S?.vivo)return false;abrirMinigameAbastecimento();return true;};
  window.debugJogo.minigameHotwire=()=>{if(!S?.vivo)return false;abrirMinigameHotwire();return true;};
  window.debugJogo.minigameArmadilhas=()=>{if(!S?.vivo)return false;abrirMinigameArmadilhas();return true;};
}

/* Versão revisada da ligação direta: a ordem não é exibida ao jogador.
   O circuito oferece cinco tentativas; cada erro consome uma chance e gera
   uma faísca, enquanto a prática desenvolve a habilidade de hotwire. */
function abrirMinigameHotwire(id){
  const veiculo=veiculoPorId(id)||S.base.veiculos?.find(v=>v.estado==='pronto');
  if(!veiculo){log('Localize um veículo antes de tentar fazer ligação direta.','info');return;}
  const sequencia=['vermelho','amarelo','preto','azul'].sort(()=>Math.random()-.5);
  const nomes={vermelho:'Vermelho',amarelo:'Amarelo',preto:'Preto',azul:'Azul'};
  const estado={indice:0,chances:5,erros:0,conectados:[]};
  const desenhar=()=>{
    const progresso=(estado.indice/sequencia.length)*100;
    const conectados=estado.conectados.length?estado.conectados.map(cor=>nomes[cor]).join(', '):'nenhum';
    const texto=`${minigameImagem(MINIGAME_ASSETS.hotwire+'car-dashboard.png','Painel de veículo')}<p>${minigameObjeto(MINIGAME_ASSETS.hotwire+'ignition-panel.png','Painel da ignição')}${minigameObjeto(MINIGAME_ASSETS.hotwire+'wire-red.png','Fio vermelho')}${minigameObjeto(MINIGAME_ASSETS.hotwire+'wire-yellow.png','Fio amarelo')}${minigameObjeto(MINIGAME_ASSETS.hotwire+'wire-black.png','Fio preto')}${minigameObjeto(MINIGAME_ASSETS.hotwire+'wire-blue.png','Fio azul')}</p><p>Conecte os fios sem um esquema pronto. Um erro produz faíscas e pode chamar atenção; fios conectados corretamente permanecem presos no painel.</p><p><b>Chances restantes:</b> ${estado.chances} · <b>Conexões:</b> ${estado.indice}/${sequencia.length}<br><b>Já conectados:</b> ${conectados}</p>${minigameBarra(progresso,'#70a4c9')}${auxilioMinigame('hotwire')}`;
    const botoes=['vermelho','amarelo','preto','azul'].map(cor=>({texto:`Conectar fio ${nomes[cor]}`,disabled:estado.conectados.includes(cor),fn:()=>conectar(cor)}));
    abrirPainel('Ligação direta',texto,[...botoes,minigameFechar()]);
  };
  function conectar(cor){
    registrarPratica('hotwire');
    if(cor!==sequencia[estado.indice]){
      estado.erros++;estado.chances--;S.base.ameaca=clamp(S.base.ameaca+1,0,100);
      if(estado.chances<=0){minigameFalha('A ligação falhou','As cinco tentativas acabaram. Uma sequência de faíscas queimou o circuito; o veículo continua parado e o barulho chamou atenção.',MINIGAME_ASSETS.hotwire+'wire-spark.png');return;}
      desenhar();return;
    }
    estado.conectados.push(cor);estado.indice++;
    if(estado.indice>=sequencia.length){
      veiculo.estado='pronto';veiculo.combustivel=Math.max(1,Number(veiculo.combustivel)||0);
      log(`A ligação direta do ${veiculo.nome} funcionou. O veículo está pronto para uso.`,'bom');fecharModal();render();return;
    }
    desenhar();
  }
  desenhar();
}

/* Mantém a prática das demais atividades registrada mesmo quando o painel
   antigo é usado. As dicas específicas aparecem no log e o hotwire exibe a
   dica diretamente no modal. */
const minigamesOriginais={
  radio:window.abrirMinigameRadio,
  furtividade:window.abrirMinigameFurtividade,
  arrombamento:window.abrirMinigameArrombamento,
  abastecimento:window.abrirMinigameAbastecimento,
  armadilhas:window.abrirMinigameArmadilhas
};
function abrirMinigameComPratica(id,...args){
  registrarPratica(id);
  const nivel=nivelMinigame(id),skill=MINIGAME_SKILLS[id];
  if(skill)log(`Auxílio de ${skill.nome} (nível ${nivel}): ${skill.dicas[Math.min(skill.dicas.length-1,Math.floor(nivel/2))]}`,'info');
  const painelOriginal=window.abrirPainel;
  if(typeof painelOriginal==='function'){
    window.abrirPainel=(titulo,texto,...rest)=>painelOriginal(titulo,`${texto}${auxilioMinigame(id)}`,...rest);
  }
  try{return minigamesOriginais[id]?.(...args);}finally{window.abrirPainel=painelOriginal;}
}
window.abrirMinigameRadio=(...args)=>abrirMinigameComPratica('radio',...args);
window.abrirMinigameFurtividade=(...args)=>abrirMinigameComPratica('furtividade',...args);
window.abrirMinigameArrombamento=(...args)=>abrirMinigameComPratica('arrombamento',...args);
window.abrirMinigameAbastecimento=(...args)=>abrirMinigameComPratica('abastecimento',...args);
window.abrirMinigameArmadilhas=(...args)=>abrirMinigameComPratica('armadilhas',...args);
window.abrirMinigameHotwire=abrirMinigameHotwire;
