/* Comunidade, instalações, saúde e pressão ao redor da base. Tempo em minutos de jogo. */
const LOCAIS_BASE = {
  casa:{nome:'Casa cercada',capacidade:4,slots:3,vagasVeiculo:1,ruido:.15,materiais:0,combustivel:0},
  oficina:{nome:'Oficina de bairro',capacidade:8,slots:4,vagasVeiculo:2,ruido:.3,materiais:8,combustivel:2},
  escola:{nome:'Escola abandonada',capacidade:12,slots:6,vagasVeiculo:3,ruido:.5,materiais:16,combustivel:4},
  deposito:{nome:'Depósito industrial',capacidade:16,slots:8,vagasVeiculo:4,ruido:.75,materiais:24,combustivel:6}
};
const INSTALACOES = {
  enfermaria:{nome:'Enfermaria',materiais:8,remedios:2,dur:240,ruido:.1,desc:'Médicos tratam melhor e a incidência de doenças cai.'},
  horta:{nome:'Horta',materiais:6,agua:2,dur:180,ruido:.1,desc:'+2 comida por dia; cada agricultor produz mais 3.'},
  cisterna:{nome:'Cisterna e filtro',materiais:6,dur:180,ruido:.1,desc:'+3 água por dia e menor incidência de doenças.'},
  oficina:{nome:'Oficina de manutenção',materiais:10,dur:240,ruido:.7,desc:'+1 material por dia; cada mecânico produz mais 3.'},
  alojamento:{nome:'Alojamento',materiais:8,dur:240,ruido:.15,desc:'Espaço para mais 2 moradores.'},
  torre:{nome:'Torre de vigia',materiais:10,dur:240,ruido:.2,desc:'+8 defesa. Os guardas ajudam a proteger o muro.'},
  gerador:{nome:'Central de energia',materiais:12,combustivel:2,dur:240,ruido:.1,desc:'Ligar o gerador recupera mais energia e moral. O motor atrai atenção por 6 horas.'},
  radio:{nome:'Rádio de comunicação',materiais:8,dur:180,ruido:.08,desc:'Permite conversar com outros acampamentos, emitir ordens e coordenar excursões de longa duração.'}
};
const FUNCOES_NPC = {
  guarda:{nome:'Guarda',desc:'Protege o muro em turnos. Precisa estar saudável e na base.'},
  scavenger:{nome:'Scavenger',desc:'Sai por 4 horas em busca de comida, água e materiais; descansa 2 horas entre saídas. Pode voltar ferido.'},
  medico:{nome:'Médico',desc:'Usa 1 remédio a cada 2 horas para cuidar do caso mais grave. A enfermaria melhora o tratamento.'},
  agricultor:{nome:'Agricultor',desc:'Produz 3 comidas por dia. Requer uma horta construída.'},
  oficina:{nome:'Mecânico',desc:'Produz 3 materiais por dia. Requer uma oficina construída.'},
  coletor:{nome:'Coletor de água',desc:'Busca 2 águas por dia nas proximidades.'},
  ocioso:{nome:'Sem função',desc:'Permanece na base e descansa.'}
};
const DOENCAS = {
  febre:{nome:'Gripe',porHora:1.2,recuperacao:1200,sistemica:true},
  gripe:{nome:'Gripe',porHora:1.2,recuperacao:1200,sistemica:true},
  virose:{nome:'Virose',porHora:1.8,recuperacao:960,sistemica:true},
  pesteRoxa:{nome:'Peste roxa',porHora:2.8,recuperacao:1800,sistemica:true},
  intoxicacao:{nome:'Intoxicação alimentar',porHora:2.2,recuperacao:720,sistemica:true},
  infeccao:{nome:'Infecção de ferimento',porHora:2.6,recuperacao:960,sistemica:true}
};
const TIPOS_FERIMENTO={
  corte:{nome:'Corte normal',gravidade:'leve',dano:2,recuperacao:240},
  corteProfundo:{nome:'Corte profundo',gravidade:'grave',dano:5,recuperacao:720},
  ralado:{nome:'Ralado',gravidade:'leve',dano:1,recuperacao:160},
  hematoma:{nome:'Hematoma',gravidade:'leve',dano:1,recuperacao:200},
  osso:{nome:'Osso quebrado',gravidade:'grave',dano:4,recuperacao:1440},
  mordida:{nome:'Mordida',gravidade:'grave',dano:8,recuperacao:960}
};
const LOCAIS_CORPO={cabeca:'Cabeça',torax:'Tórax',braco:'Braço',mao:'Mão',perna:'Perna',pe:'Pé'};
function statusGravidade(v){return v>=70?'grave':v>=35?'médio':'leve';}
function imagemCorpo(m){
  return m?.genero==='feminino'?'assets/UI/body_feminino.png':'assets/UI/body_masculino.png';
}
function criarFerimento(m,tipo='corte',local='braco',gravidade=null){
  const base=TIPOS_FERIMENTO[tipo]||TIPOS_FERIMENTO.corte;
  const f={tipo,local,gravidade:gravidade||base.gravidade,intensidade:gravidade==='grave'?75:25,inicio:S.tempoTotal,ultimoAvanco:S.tempoTotal,recuperacao:base.recuperacao,fim:S.tempoTotal+base.recuperacao};
  m.ferimentos=m.ferimentos||[];m.ferimentos.push(f);m.ferido=true;return f;
}
function piorFerimento(m){return (m.ferimentos||[]).sort((a,b)=>b.intensidade-a.intensidade)[0];}
const PLANOS_MURO = {
  distrair:{nome:'Atrair para longe',dur:120,energia:20,materiais:2,combustivel:1,desc:'Desvia 28 pontos de ameaça; a movimentação devolve 3. Risco de ferimentos.'},
  fogos:{nome:'Soltar fogos à distância',dur:80,energia:12,materiais:2,municao:1,desc:'Desvia 40 pontos. Há 25% de chance de atrair 15 de volta; chama a atenção de pessoas.'},
  armadilhas:{nome:'Montar armadilhas',dur:180,energia:15,materiais:4,desc:'Instala 3 cargas (máximo 9). Cada carga retira 6 pontos por hora, sem tiros.'},
  abater:{nome:'Abater zumbis junto ao muro',dur:60,energia:20,desc:'Enfrenta 2–5 zumbis e remove 24 pontos. O confronto gera 8 de ameaça; tiros geram mais 5.'},
  silencio:{nome:'Reduzir o movimento',dur:60,energia:5,desc:'Dispersa 6 pontos e mantém silêncio por 6 horas. Suspende novas saídas e produção da oficina.'}
};
const FAIXAS_MURO = [
  {id:'calmo',max:20,nome:'Rua quase vazia',cor:'#6a9c5a'},
  {id:'atencao',max:40,nome:'Movimento na rua',cor:'#a2a04f'},
  {id:'perigo',max:70,nome:'Zumbis se reunindo',cor:'#c98a37'},
  {id:'cerco',max:90,nome:'Muro sob pressão',cor:'#c2583b'},
  {id:'horda',max:101,nome:'Horda à porta',cor:'#cb3434'}
];

function criarBase(local='casa', anterior={}){
  return {barricadas:2,ameaca:8,moral:60,...anterior,local,instalacoes:[],descobertas:[local],atencaoHumana:0,
    eletricidadeLigada:true,corteEletricoDia:null,aguaLigada:true,corteAguaDia:null,
    energiaCidadeRestaurada:false,aguaCidadeRestaurada:false,
    vagasVeiculo:LOCAIS_BASE[local]?.vagasVeiculo || 1,veiculos:anterior.veiculos || [],proximoVeiculoId:anterior.proximoVeiculoId || 1,ordemRadio:anterior.ordemRadio ?? null,excursao:anterior.excursao ?? null,
    silencioAte:0,geradorAte:0,armadilhas:0,proximaArmadilha:0,proximaHorda:0};
}
function atualizarEletricidade(){
  const b=S.base;
  b.aguaLigada ??= true;
  b.corteAguaDia ??= null;
  b.energiaCidadeRestaurada ??= false;
  b.aguaCidadeRestaurada ??= false;
  if(b.eletricidadeLigada && !b.energiaCidadeRestaurada && S.dia<=30 && !b.corteEletricoDia && Math.random()<.006){
    b.eletricidadeLigada=false;b.corteEletricoDia=S.dia;
    log('A rede elétrica caiu. A comunidade terá de racionar energia e procurar combustível.','ruim');
  }
  if(b.aguaLigada && !b.aguaCidadeRestaurada && S.dia<=30 && !b.corteAguaDia && Math.random()<.004){
    b.aguaLigada=false;b.corteAguaDia=S.dia;
    log('A rede de água foi cortada. A comunidade terá de racionar os reservatórios.','ruim');
  }
  if(b.eletricidadeLigada)S.recursos.eletricidade=clamp(S.recursos.eletricidade+.3,0,100);
  else S.recursos.eletricidade=Math.max(0,S.recursos.eletricidade-.6);
}
function energiaDisponivel(custo=1){
  if(!S.base.eletricidadeLigada || S.recursos.eletricidade<custo){log('A eletricidade está cortada ou insuficiente para esta ação.','ruim');return false;}
  S.recursos.eletricidade-=custo;return true;
}
function aguaDisponivel(custo=1){
  if(!S.base.aguaLigada || S.recursos.agua<custo){log('A água está cortada ou insuficiente para esta ação.','ruim');return false;}
  S.recursos.agua-=custo;return true;
}

function nivelMecanica(m){
  if(!m) return 0;
  const habilidade=Number(m.mecanica ?? m.inteligencia ?? 0);
  const experiencia=/mecân|mecan|oficin/i.test(m.especialidade || '') ? 5 : 0;
  return Math.max(Number.isFinite(habilidade)?habilidade:0,experiencia);
}
function mecanicosDisponiveis(){
  return S.sobreviventes.filter(m=>m.vivo && naBase(m) && nivelMecanica(m)>=5);
}
function servicosParaRestaurar(){
  const b=S.base;
  return [
    !b.eletricidadeLigada && !b.energiaCidadeRestaurada ? 'eletricidade' : null,
    !b.aguaLigada && !b.aguaCidadeRestaurada ? 'agua' : null
  ].filter(Boolean);
}
function abrirServicosBase(){
  const mecanicos=mecanicosDisponiveis();
  const nomes={eletricidade:'usina hidrelétrica',agua:'estação de água'};
  const alvos=servicosParaRestaurar();
  const descricao=mecanicos.length
    ? `<p>${mecanicos.map(m=>`<b>${esc(m.nome)}</b> (${nivelMecanica(m)} mecânica)`).join(', ')} pode conduzir reparos fora da base.</p>`
    : '<p>É preciso um NPC vivo, na base, com pelo menos 5 pontos de mecânica ou experiência como mecânico.</p>';
  const opcoes=alvos.map(tipo=>({
    texto:`Enviar mecânico para a ${nomes[tipo]} · 6h`,
    fn:()=>iniciarRestauracaoServico(tipo)
  }));
  abrirPainel('Serviços da cidade',`${descricao}${alvos.length
    ? '<p>O reparo consome materiais, demora seis horas e aumenta o risco de chamar atenção. Se for concluído, o serviço volta a funcionar de forma permanente.</p>'
    : '<p>As redes estão funcionando ou já foram restauradas. Aguarde um corte para receber uma nova oportunidade.</p>'}`,[
    ...(mecanicos.length?opcoes:[]),{texto:'Fechar',fn:()=>{}}
  ]);
}
function iniciarRestauracaoServico(tipo){
  if(!['eletricidade','agua'].includes(tipo) || !servicosParaRestaurar().includes(tipo))return;
  const mecanico=mecanicosDisponiveis()[0];
  if(!mecanico){log('Nenhum mecânico qualificado está disponível na base.','info');return;}
  const custo=tipo==='eletricidade'?{materiais:10,combustivel:2}:{materiais:8,agua:4};
  iniciarAcaoBase('restaurarServico',`Acessar ${tipo==='eletricidade'?'a usina hidrelétrica':'a estação de água'}`,360,15,custo,{servico:tipo,mecanicoId:mecanico.id});
}
function resolverRestauracaoServico(a){
  const b=S.base;
  if(!['eletricidade','agua'].includes(a.servico) || !servicosParaRestaurar().includes(a.servico))return;
  const mecanico=S.sobreviventes.find(m=>m.id===a.mecanicoId);
  if(!mecanico?.vivo || nivelMecanica(mecanico)<5){log('O NPC mecânico não conseguiu concluir o reparo.','ruim');return;}
  ganharExperienciaPessoa(mecanico,2);
  if(a.servico==='eletricidade'){
    b.eletricidadeLigada=true;b.corteEletricoDia=null;b.energiaCidadeRestaurada=true;S.recursos.eletricidade=clamp((S.recursos.eletricidade||0)+25,0,100);
  }else{
    b.aguaLigada=true;b.corteAguaDia=null;b.aguaCidadeRestaurada=true;S.recursos.agua=clamp((S.recursos.agua||0)+20,0,100);
  }
  b.ameaca=clamp(b.ameaca+8,0,100);b.moral=clamp(b.moral+4,0,100);
  const nome=a.servico==='eletricidade'?'usina hidrelétrica':'estação de água';
  log(`O reparo foi concluído. O ${nome} voltou a funcionar. +8 ameaça.`, 'bom');
  abrirModal('Serviço restabelecido',`O NPC mecânico conseguiu reativar o ${nome}. A rede voltou a funcionar, mas o trabalho deixou sinais e elevou a ameaça da região.`,[{texto:'Continuar',fn:()=>{}}]);
}
function capacidadeBase(estado=S){
  return LOCAIS_BASE[estado.base.local].capacidade + (estado.base.instalacoes.includes('alojamento') ? 2 : 0);
}
function moradores(estado=S){ return 1+estado.sobreviventes.filter(m=>m.vivo).length; }
function temInstalacao(id){ return S.base.instalacoes.includes(id); }
function emSilencio(){ return S.tempoTotal < S.base.silencioAte; }
function naBase(m){
  if(!m?.vivo || m.expedicao || S.acao?.tipo==='mudarBase')return false;
  if(m.id===S.familia.atual && S.player?.emExcursao)return false;
  const fora=['perto','expedicao','cacar','procurar','procurarBase'];
  if(m.id===S.familia.atual && (fora.includes(S.acao?.tipo) || (S.acao?.tipo==='planoMuro' && ['distrair','fogos','abater'].includes(S.acao.plano))))return false;
  return true;
}
function aptoTrabalho(m){ return naBase(m) && !m.doenca && !m.ferido && idadeMembro(m)>=IDADE_ADULTA; }
const COMPONENTES_MATERIAIS={pregos:10,tabuas:5,ferramentas:1};
function detalharMateriais(qtd){
  const n=Math.max(0,Math.floor(Number(qtd)||0));
  return `${n} material${n===1?'':'is'} (aprox. ${n*COMPONENTES_MATERIAIS.pregos} pregos, ${n*COMPONENTES_MATERIAIS.tabuas} tábuas e ${n*COMPONENTES_MATERIAIS.ferramentas} ferramenta${n===1?'':'s'})`;
}
function custoTexto(item){
  return Object.keys(NOMES_REC).filter(k=>item[k]).map(k=>k==='materiais'?detalharMateriais(item[k]):`${item[k]} ${NOMES_REC[k]}`).join(' · ') || 'sem recursos';
}
function pagarCusto(item){
  for(const k of Object.keys(NOMES_REC)) if((item[k] || 0)>S.recursos[k]){ log(`Faltam recursos: ${custoTexto(item)}.`,'ruim'); return false; }
  for(const k of Object.keys(NOMES_REC)) S.recursos[k]-=item[k] || 0;
  return true;
}
function iniciarAcaoBase(tipo,nome,dur,energia,custo={},extra={}){
  if(!podeAgir(energia)) return false;
  if(idadeAtual()<IDADE_ADULTA && !['tratarDoenca'].includes(tipo)){log('Um adulto precisa conduzir esta ação.','info');return false;}
  if(['construir','demolir','tratarDoenca','customizarVeiculo'].includes(tipo) && !energiaDisponivel(1)) return false;
  if(!pagarCusto(custo)) return false;
  S.player.energia-=energia;
  S.acao={tipo,nome,dur,fim:S.tempoTotal+dur,...extra};
  log(`${nome}: ${dur} minutos de trabalho.`,'info');render();return true;
}

function abrirConstrucoes(){
  const local=LOCAIS_BASE[S.base.local];
  const instaladas=S.base.instalacoes.map(id=>`<li><b>${INSTALACOES[id].nome}</b> — ${INSTALACOES[id].desc}</li>`).join('');
  const opcoes=Object.entries(INSTALACOES).filter(([id])=>!temInstalacao(id)).map(([id,i])=>({
    texto:`Construir ${i.nome} · ${custoTexto(i)} · ${i.dur/60}h`,fn:()=>iniciarConstrucao(id)
  }));
  abrirPainel('Construções da base',`<p>${local.nome}: <b>${S.base.instalacoes.length}/${local.slots} espaços usados</b>. Cada instalação ocupa um espaço e aumenta um pouco o movimento.</p><p class="materiaisDetalhes"><b>Estoque:</b> ${detalharMateriais(S.recursos.materiais)}. Os componentes são uma estimativa de planejamento; a contagem do jogo continua agrupada em materiais.</p><ul>${instaladas || '<li>Nenhuma instalação construída.</li>'}</ul><div class="catalogoBase">${Object.entries(INSTALACOES).filter(([id])=>!temInstalacao(id)).map(([,i])=>`<p><b>${i.nome}</b><br>${i.desc}</p>`).join('')}</div>`,[
    ...opcoes,...S.base.instalacoes.map(id=>({texto:`Desmontar ${INSTALACOES[id].nome} · 2h · recupera ${Math.floor(INSTALACOES[id].materiais/2)} materiais`,fn:()=>iniciarDemolicao(id)})),{texto:'Procurar locais e mudar de base',fn:abrirLocaisBase},{texto:'Fechar',fn:()=>{}}
  ]);
}
function iniciarConstrucao(id){
  const obra=INSTALACOES[id];if(!obra) return;
  if(temInstalacao(id)){log('Essa instalação já existe.','info');return;}
  if(S.base.instalacoes.length>=LOCAIS_BASE[S.base.local].slots){log('A base não tem espaço livre. Procure um local maior.','info');return;}
  iniciarAcaoBase('construir',`Construir ${obra.nome}`,obra.dur,20,obra,{obra:id,localOrigem:S.base.local});
}
function resolverConstrucao(a){
  if(a.localOrigem!==S.base.local || temInstalacao(a.obra)) return;
  S.base.instalacoes.push(a.obra);
  log(`${INSTALACOES[a.obra].nome} concluída. ${INSTALACOES[a.obra].desc}`,'bom');
}
function iniciarDemolicao(id){
  if(!temInstalacao(id))return;
  if(id==='oficina' && S.acao?.tipo==='customizarVeiculo'){log('A oficina está ocupada com uma customização em andamento.','info');return;}
  if(id==='radio' && (S.base.ordemRadio || S.base.excursao)){log('O rádio está sendo usado para coordenar a comunidade e a excursão.','info');return;}
  if(id==='alojamento' && moradores()+(S.familia.gravidez?1:0)>capacidadeBase()-2){log('O alojamento ainda é necessário para abrigar a comunidade.','info');return;}
  iniciarAcaoBase('demolir',`Desmontar ${INSTALACOES[id].nome}`,120,10,{}, {obra:id});
}
function resolverDemolicao(a){
  if(!temInstalacao(a.obra))return;
  S.base.instalacoes=S.base.instalacoes.filter(id=>id!==a.obra);
  const ganho=Math.floor(INSTALACOES[a.obra].materiais/2);S.recursos.materiais+=ganho;
  log(`${INSTALACOES[a.obra].nome} desmontada. +${ganho} materiais; um espaço livre.`,'info');
}
function abrirLocaisBase(){
  abrirPainel('Novos abrigos',`<p>Você está em <b>${LOCAIS_BASE[S.base.local].nome}</b>. Procure locais para descobrir abrigos maiores.</p><p>A mudança leva 6 horas. A comunidade e os suprimentos vão juntos; as instalações ficam no local antigo. Metade dos materiais usados nelas é recuperada.</p><div class="catalogoBase">${S.base.descobertas.map(id=>{const l=LOCAIS_BASE[id];return `<p><b>${l.nome}</b> · ${l.capacidade} pessoas · ${l.slots} espaços · ${l.vagasVeiculo} vagas de veículo<br>${id===S.base.local ? 'Base atual' : `Mudança: ${custoTexto(l)}`}</p>`;}).join('')}</div>`,[
    {texto:'Procurar um novo local · 4h · 20 energia',fn:procurarBase},
    ...S.base.descobertas.filter(id=>id!==S.base.local).map(id=>({texto:`Mudar para ${LOCAIS_BASE[id].nome}`,fn:()=>iniciarMudanca(id)})),
    {texto:'Voltar às construções',fn:abrirConstrucoes},{texto:'Fechar',fn:()=>{}}
  ]);
}
function procurarBase(){
  if(S.base.descobertas.length===Object.keys(LOCAIS_BASE).length){log('Todos os abrigos da região já foram mapeados.','info');return;}
  iniciarAcaoBase('procurarBase','Procurar novos abrigos',240,20);
}
function resolverBuscaBase(){
  const id=Object.keys(LOCAIS_BASE).find(id=>!S.base.descobertas.includes(id));if(!id)return;
  S.base.descobertas.push(id);
  const l=LOCAIS_BASE[id];
  abrirModal('Novo abrigo encontrado',`Você mapeou <b>${l.nome}</b>: espaço para ${l.capacidade} pessoas e ${l.slots} instalações. A mudança exige ${custoTexto(l)}.`,[{texto:'Anotar a localização',fn:()=>{}}]);
}
function iniciarMudanca(id){
  const l=LOCAIS_BASE[id];if(!l || !S.base.descobertas.includes(id) || id===S.base.local)return;
  if(moradores()+(S.familia.gravidez?1:0)>l.capacidade){log('Esse abrigo não comporta a comunidade e a gestação em andamento.','ruim');return;}
  if(S.sobreviventes.some(m=>m.vivo && m.expedicao)){log('Espere os scavengers voltarem antes da mudança.','info');return;}
  if(S.base.excursao){log('Espere a excursão retornar antes de mudar a comunidade.','info');return;}
  iniciarAcaoBase('mudarBase',`Mudar para ${l.nome}`,360,25,l,{destino:id});
}
function resolverMudanca(a){
  const materiais=S.base.instalacoes.reduce((n,id)=>n+INSTALACOES[id].materiais,0);
  const descobertas=[...S.base.descobertas], moral=S.base.moral,veiculos=(S.base.veiculos||[]).slice(0,LOCAIS_BASE[a.destino].vagasVeiculo).map(v=>({...v,estado:'pronto'}));
  S.recursos.materiais+=Math.floor(materiais/2);
  S.base=criarBase(a.destino,{moral,ameaca:15,veiculos,proximoVeiculoId:(S.base.proximoVeiculoId||1)});S.base.descobertas=descobertas;
  for(const m of S.sobreviventes) m.proximaSaida=S.tempoTotal+120;
  log(`A comunidade se instalou em ${LOCAIS_BASE[a.destino].nome}. Recuperou ${Math.floor(materiais/2)} materiais das antigas instalações.`,'bom');
}

function abrirFuncoes(i){
  const m=S.sobreviventes[i];if(!m?.vivo)return;
  abrirPainel(`Função de ${esc(m.nome)}`,`<p>Profissão de origem: <b>${esc(m.especialidade)}</b>. A função pode ser escolhida livremente; a experiência anterior melhora a eficiência.</p><p>${situacaoNPC(m)}</p><div class="catalogoBase">${Object.values(FUNCOES_NPC).map(f=>`<p><b>${f.nome}</b><br>${f.desc}</p>`).join('')}</div>`,[
    ...Object.entries(FUNCOES_NPC).map(([id,f])=>({texto:`${m.tarefa===id?'✓ ':''}${f.nome}`,fn:()=>atribuirFuncao(i,id)})),
    {texto:'Voltar ao perfil',fn:()=>abrirInteracoes(i)}
  ]);
}
function atribuirFuncao(i,tarefa){
  const m=S.sobreviventes[i];if(!m?.vivo || !FUNCOES_NPC[tarefa])return;
  if(idadeMembro(m)<IDADE_ADULTA){log('Menores de idade ficam sob os cuidados da comunidade.','info');return;}
  if(m.expedicao){log('Espere essa pessoa voltar da expedição.','info');return;}
  m.tarefa=tarefa;m.rotina=tarefa;m.emTurno=true;
  m.proximaSaida=Math.max(m.proximaSaida || 0,S.tempoTotal);
  log(`${esc(m.nome)} assumiu a função de ${FUNCOES_NPC[tarefa].nome}.`,'bom');render();
}
function situacaoNPC(m){
  const ferimento=piorFerimento(m);
  if(m.doenca) return `<span class="saudeRuim">${DOENCAS[m.doenca.tipo].nome} · corpo todo afetado · gravidade ${Math.ceil(m.doenca.gravidade)}% · recuperação ${Math.max(0,Math.ceil((m.doenca.fim-S.tempoTotal)/60))}h</span>`;
  if(ferimento) return `<span class="saudeRuim">${TIPOS_FERIMENTO[ferimento.tipo].nome} · ${LOCAIS_CORPO[ferimento.local]} · ${ferimento.gravidade} · recuperação ${Math.max(0,Math.ceil((ferimento.fim-S.tempoTotal)/60))}h</span>`;
  if(m.expedicao)return `Fora da base · volta em ${Math.max(0,m.expedicao.fim-S.tempoTotal)} min`;
  if(m.ferido)return '<span class="saudeRuim">Ferido · aguardando cuidados</span>';
  if(m.tarefa==='agricultor' && !temInstalacao('horta'))return 'Aguardando a construção de uma horta';
  if(m.tarefa==='oficina' && !temInstalacao('oficina'))return 'Aguardando a construção de uma oficina';
  return 'Saudável · '+(m.tarefa==='guarda' ? (m.emTurno?'em guarda':'fora do turno') : 'na base');
}
function atualizarScavengers(){
  for(const m of S.sobreviventes){
    if(!m.vivo){m.expedicao=null;continue;}
    if(m.expedicao?.tipo==='excursao')continue;
    if(m.expedicao?.tipo==='resgate'){
      if(S.tempoTotal>=m.expedicao.fim){
        const resgate=m.expedicao;m.expedicao=null;m.proximaSaida=S.tempoTotal+120;
        if(typeof resolverResgateNPC==='function')resolverResgateNPC(m,resgate);
      }
      continue;
    }
    if(m.expedicao && S.tempoTotal>=m.expedicao.fim){
      m.expedicao=null;m.proximaSaida=S.tempoTotal+120;
      const bonus=/Scavenger|Batedor|Caçador/.test(m.especialidade)?1:0;
      const feriu=Math.random()<.12+S.base.ameaca*.001;
      const ganhos={comida:rnd(2,4)+bonus,agua:rnd(1,3)+bonus,materiais:rnd(1,3),remedios:rnd(0,1)};
      if(feriu){criarFerimento(m,pick(['corte','hematoma','osso']),pick(Object.keys(LOCAIS_CORPO)));ganhos.materiais=0;}
      aplicarGanhos(ganhos);ganharExperienciaPessoa(m,2);
      S.base.ameaca=clamp(S.base.ameaca+2,0,100);
      log(`${esc(m.nome)} voltou da busca automática${feriu?' com ferimentos. Precisa de cuidados antes de sair de novo.':'. Descansará por duas horas.'}`,feriu?'ruim':'bom');
    }
    if(m.tarefa==='scavenger' && aptoTrabalho(m) && !emSilencio() && S.acao?.tipo!=='mudarBase' && S.tempoTotal>=(m.proximaSaida || 0)){
      m.expedicao={inicio:S.tempoTotal,fim:S.tempoTotal+240};
      log(`${esc(m.nome)} saiu para buscar suprimentos. Volta em quatro horas.`,'info');
    }
  }
}
function adoecer(m,tipo='febre'){
  if(tipo==='febre')tipo='gripe';
  if(!m?.vivo || m.doenca || !DOENCAS[tipo])return false;
  m.doenca={tipo,gravidade:25,ultimoAvanco:S.tempoTotal,aviso:0,fim:S.tempoTotal+DOENCAS[tipo].recuperacao};
  log(`${esc(m.nome)} está com ${DOENCAS[tipo].nome.toLowerCase()}. Sem tratamento, a doença pode ser fatal.`,'ruim');
  return true;
}
function tratarPaciente(m,potencia){
  if(!m?.vivo || !naBase(m))return false;
  if(m.doenca){
    m.doenca.gravidade=Math.max(0,m.doenca.gravidade-potencia);
    if(m.doenca.gravidade===0){m.doenca=null;log(`${esc(m.nome)} se recuperou da doença.`,'bom');}
    else log(`${esc(m.nome)} recebeu tratamento. Gravidade: ${Math.ceil(m.doenca.gravidade)}%.`,'bom');
  }else if(m.ferimentos?.length){
    const f=piorFerimento(m);f.intensidade=Math.max(0,f.intensidade-potencia);
    if(f.intensidade===0)log(`${esc(m.nome)} se recuperou de ${TIPOS_FERIMENTO[f.tipo].nome.toLowerCase()}.`,'bom');
    m.ferimentos=m.ferimentos.filter(x=>x.intensidade>0);m.ferido=m.ferimentos.length>0;
  }else if(m.ferido){m.ferido=false;log(`Os ferimentos de ${esc(m.nome)} foram tratados.`,'bom');}
  else return false;
  return true;
}
function atualizarMedicos(){
  for(const medico of S.sobreviventes.filter(m=>m.tarefa==='medico' && aptoTrabalho(m))){
    if(S.tempoTotal<(medico.proximoAtendimento || 0) || S.recursos.remedios<1)continue;
    const pacientes=S.familia.membros.filter(m=>naBase(m) && (m.doenca || m.ferido));
    pacientes.sort((a,b)=>(b.doenca?.gravidade || piorFerimento(b)?.intensidade || 1)-(a.doenca?.gravidade || piorFerimento(a)?.intensidade || 1));
    if(!pacientes.length)continue;
    S.recursos.remedios--;
    tratarPaciente(pacientes[0],18+(temInstalacao('enfermaria')?14:0)+(/Médic/.test(medico.especialidade)?8:0));
    medico.proximoAtendimento=S.tempoTotal+120;
    ganharExperienciaPessoa(medico,1);
    log(`${esc(medico.nome)} usou 1 remédio no atendimento automático.`,'info');
  }
}
function evoluirDoencas(){
  for(const m of S.familia.membros){
    if(!m.vivo || !m.doenca)continue;
    const d=m.doenca, horas=Math.max(0,S.tempoTotal-d.ultimoAvanco)/60;
    d.gravidade=clamp(d.gravidade+DOENCAS[d.tipo].porHora*horas,0,100);d.ultimoAvanco=S.tempoTotal;
    if(d.gravidade>=100){
      log(`${esc(m.nome)} morreu de ${DOENCAS[d.tipo].nome.toLowerCase()} sem conseguir se recuperar.`,'sangue');
      if(m.id===S.familia.atual){S.player.vida=0;gameOver('A doença foi fatal.');return;}
      m.vivo=false;m.diaSaida=S.dia;m.expedicao=null;S.base.moral=Math.max(0,S.base.moral-10);
    }else if(d.gravidade>=75 && d.aviso<75){
      d.aviso=75;log(`${esc(m.nome)} está em estado crítico. Precisa de tratamento urgente.`,'sangue');
    }
  }
  for(const m of S.familia.membros){
    for(const f of (m.ferimentos||[])){f.intensidade=Math.max(0,f.intensidade-.5);f.fim=f.inicio+f.recuperacao;}
    m.ferimentos=(m.ferimentos||[]).filter(f=>f.intensidade>0);m.ferido=m.ferimentos.length>0;
  }
}
function incidenciaDoencas(){
  if(S.comunidade.ultimoDiaDoenca>=S.dia)return;
  S.comunidade.ultimoDiaDoenca=S.dia;
  const risco=clamp(.07+(moradores()/capacidadeBase()>.85?.03:0)-(temInstalacao('enfermaria')?.02:0)-(temInstalacao('cisterna')?.02:0),.01,.2);
  for(const m of S.familia.membros.filter(m=>naBase(m) && !m.doenca)){
    if(Math.random()<risco+(m.ferido ? .05 : 0)){
      const tipo=Math.random()<.08?'pesteRoxa':(Math.random()<.35?'virose':'gripe');
      adoecer(m,tipo);
    }
  }
}
function iniciarTratamento(id){
  const m=S.familia.membros.find(m=>m.id===id);
  if(!naBase(m) || (!m.doenca && !m.ferido)){log('Essa pessoa não precisa de atendimento ou está fora da base.','info');return;}
  iniciarAcaoBase('tratarDoenca',`Tratar ${m.nome}`,60,8,{remedios:1},{pacienteId:id});
}
function resolverTratamento(a){
  const m=S.familia.membros.find(m=>m.id===a.pacienteId);
  if(!tratarPaciente(m,40+(temInstalacao('enfermaria')?15:0))){S.recursos.remedios++;log('O atendimento não era mais necessário. O remédio foi devolvido.','info');}
}
function abrirSaude(){
  const pacientes=S.familia.membros.filter(m=>naBase(m) && (m.doenca || m.ferido));
  const medicos=S.sobreviventes.filter(m=>m.tarefa==='medico' && aptoTrabalho(m)).length;
  abrirPainel('Saúde da comunidade',`<p><b>${medicos} médico(s) disponível(is)</b> · ${S.recursos.remedios} remédios · ${temInstalacao('enfermaria')?'enfermaria pronta':'sem enfermaria'}</p><p>Doenças sistêmicas afetam o corpo todo. Ferimentos mostram o local atingido e têm recuperação própria.</p>${pacientes.map(m=>`<div class="cartaoSaude"><img src="${imagemCorpo(m)}" alt="Mapa corporal de ${esc(m.nome)}"><p><b>${esc(m.nome)}</b><br>${situacaoNPC(m)}</p></div>`).join('') || '<p>Ninguém precisa de cuidados agora.</p>'}`,[
    ...pacientes.map(m=>({texto:`Tratar ${m.nome} · 1 remédio · 1h`,fn:()=>iniciarTratamento(m.id)})),
    {texto:'Ver funções do grupo',fn:abrirGrupo},{texto:'Fechar',fn:()=>{}}
  ]);
}

function barulhoBase(){
  const b=S.base;
  const populacao=moradores()*.18;
  const movimento=S.sobreviventes.filter(m=>m.vivo && (m.expedicao || (aptoTrabalho(m) && m.tarefa!=='ocioso'))).length*.22;
  const construcoes=b.instalacoes.reduce((n,id)=>n+INSTALACOES[id].ruido,0);
  const tabela={construir:3,fortificar:2.5,gerador:2,restaurarServico:4,localizarVeiculo:1.2,customizarVeiculo:1.8,comer:.15,descansar:.05,dormir:.02,perto:.5,expedicao:.6,mudarBase:3};
  const acao=S.acao ? (tabela[S.acao.tipo] ?? .3) : 0;
  const motor=S.tempoTotal<b.geradorAte?2:0;
  const total=(LOCAIS_BASE[b.local].ruido+populacao+movimento+construcoes+acao+motor)*(emSilencio()?.15:1);
  return {populacao,movimento,construcoes,acao,motor,total,porHora:total*.35-(emSilencio()?.55:0)};
}
function atualizarPressao(){
  const r=barulhoBase();
  S.base.ameaca=clamp(S.base.ameaca+r.porHora/3,0,100);
  S.base.atencaoHumana=clamp(S.base.atencaoHumana+(r.total*.12-.08)/3,0,100);
  if(S.base.armadilhas>0 && S.base.ameaca>=6 && S.tempoTotal>=S.base.proximaArmadilha){
    S.base.armadilhas--;S.base.ameaca-=6;S.base.proximaArmadilha=S.tempoTotal+60;
    log('Uma armadilha eliminou zumbis junto à cerca. -6 ameaça.','bom');
  }
}
function faixaMuro(){return FAIXAS_MURO.find(f=>S.base.ameaca<f.max) || FAIXAS_MURO.at(-1);}
function zumbisFora(){return Math.round(clamp(S.base.ameaca,0,100)/2);}
function atualizarImagemMuro(){
  const img=document.getElementById('imagemMuro');if(!S || !img)return;
  const faixa=faixaMuro();
  const lista=IMAGENS_MURO[faixa.id] || [];
  const caminho=lista.length ? lista[Math.floor(Date.now()/8000)%lista.length] : `assets/muro/${faixa.id}/01.svg`;
  // Não recria a imagem a cada tick: GIFs podem completar sua animação.
  if(img.dataset.origem!==caminho){
    img.dataset.origem=caminho;img.onerror=()=>{img.onerror=null;img.src=`assets/muro/${faixa.id}/01.svg`;};img.src=caminho;
  }
  img.alt=`${faixa.nome}: cerca de ${zumbisFora()} zumbis do lado de fora`;
}
function abrirMuro(){
  const r=barulhoBase();
  abrirPainel('Olhar além do muro',`<p><b>${faixaMuro().nome}</b> · ameaça ${Math.round(S.base.ameaca)}% · cerca de ${zumbisFora()} zumbis.</p><p>Barricadas: ${S.base.barricadas} · defesa ${Math.round(calcularDefesa())} · ${S.base.armadilhas} armadilhas prontas.</p><p>A aglomeração cresce com o ruído. População: ${r.populacao.toFixed(1)}; movimento: ${r.movimento.toFixed(1)}; instalações: ${r.construcoes.toFixed(1)}; ação: ${r.acao.toFixed(1)}; motor: ${r.motor.toFixed(1)}. Variação atual: <b>${r.porHora>=0?'+':''}${r.porHora.toFixed(1)} pontos/h</b>.</p><p>Atenção de saqueadores: ${Math.round(S.base.atencaoHumana)}%. Aos 100% de ameaça, uma horda pode atacar. Depois de um ataque há um intervalo mínimo de 12 horas.</p><div class="catalogoBase">${Object.values(PLANOS_MURO).map(p=>`<p><b>${p.nome}</b><br>${p.desc}<br>${custoTexto(p)} · ${p.dur} min · ${p.energia} energia</p>`).join('')}</div>`,[
    ...Object.entries(PLANOS_MURO).map(([id,p])=>({texto:p.nome,fn:()=>iniciarPlanoMuro(id)})),
    {texto:'Reforçar barricadas · 4 materiais',fn:acaoFortificar},{texto:'Fechar',fn:()=>{}}
  ]);
}
function iniciarPlanoMuro(id){
  const plano=PLANOS_MURO[id];if(!plano)return;
  if(id==='abater' && zumbisFora()===0){log('Não há zumbis junto ao muro para abater.','info');return;}
  if(id==='armadilhas' && S.base.armadilhas>6){log('Já há armadilhas suficientes junto ao muro.','info');return;}
  iniciarAcaoBase('planoMuro',plano.nome,plano.dur,plano.energia,plano,{plano:id});
}
function resolverPlanoMuro(a){
  let reducao=0,barulho=0;
  if(a.plano==='distrair'){reducao=28;barulho=3;if(Math.random()<.2){S.player.vida-=8;log('Você se feriu ao atrair os zumbis. -8 vida.','ruim');}}
  if(a.plano==='fogos'){reducao=40;barulho=Math.random()<.25?15:0;S.base.atencaoHumana=clamp(S.base.atencaoHumana+12,0,100);}
  if(a.plano==='armadilhas'){S.base.armadilhas=Math.min(9,S.base.armadilhas+3);log('Três armadilhas foram instaladas.','bom');return;}
  if(a.plano==='abater'){
    const quantidade=Math.min(rnd(2,5),zumbisFora());
    if(!quantidade){log('Os zumbis já se dispersaram.','info');return;}
    combate(quantidade);reducao=24;barulho=8;S.base.atencaoHumana=clamp(S.base.atencaoHumana+5,0,100);
  }
  if(a.plano==='silencio'){reducao=6;S.base.silencioAte=S.tempoTotal+360;}
  S.base.ameaca=clamp(S.base.ameaca-reducao+barulho,0,100);
  log(`${PLANOS_MURO[a.plano].nome}: -${reducao} ameaça${barulho?`, +${barulho} pela atenção atraída`:''}.`,'bom');
}

function atrasarAcao(minutos){if(S.acao){S.acao.fim+=minutos;S.acao.dur+=minutos;}}
function eventoRefeicao(){
  abrirModal('Cheiro estranho na refeição','Uma porção parece estragada. Comer pode deixar você doente.',[
    {texto:'Descartar uma porção',fn:()=>{S.recursos.comida=Math.max(0,S.recursos.comida-1);log('A porção suspeita foi descartada.','info');}},
    {texto:'Arriscar a refeição',fn:()=>{if(Math.random()<.6)adoecer(membroAtual(),'intoxicacao');else log('A refeição não causou problemas.','info');}}
  ]);
}
function eventoPanela(){
  abrirModal('Um estrondo na cozinha','Uma panela caiu e os zumbis na rua viraram a cabeça.',[
    {texto:'Apagar as luzes e esperar · +20 min',fn:()=>{atrasarAcao(20);S.base.ameaca=clamp(S.base.ameaca+2,0,100);}},
    {texto:'Continuar normalmente · +8 ameaça',fn:()=>S.base.ameaca=clamp(S.base.ameaca+8,0,100)}
  ]);
}
function eventoSono(){
  abrirModal('Passos no pátio','Você acorda com passos perto da cerca. Pode ser alguém do grupo ou uma invasão.',[
    {texto:'Levantar e verificar · 8 energia · +40 min',fn:()=>{S.player.energia=clamp(S.player.energia-8,0,100);atrasarAcao(40);S.base.ameaca=Math.max(0,S.base.ameaca-3);log('Você verificou o pátio e fechou uma passagem na cerca.','info');}},
    {texto:'Tentar voltar a dormir',fn:()=>{if(Math.random()<.45){S.base.ameaca=clamp(S.base.ameaca+12,0,100);log('Mais zumbis se reuniram do lado de fora.','ruim');}}}
  ]);
}
function eventoPesadelo(){
  abrirModal('Uma noite inquieta','As lembranças do começo do surto interrompem seu descanso.',[
    {texto:'Beber água e respirar',fn:()=>{if(S.recursos.agua>=1){S.recursos.agua--;S.player.moral=clamp(S.player.moral+3,0,100);}else log('Não há água. Você tenta se acalmar.','info');}},
    {texto:'Permanecer deitado',fn:()=>{S.player.moral=Math.max(0,S.player.moral-3);log('Você volta a dormir, mas a lembrança continua.','info');}}
  ]);
}
const EVENTOS_DEBUG={
  horror:eventoPesadelo,
  refeicao:eventoRefeicao,
  panela:eventoPanela,
  sono:eventoSono,
  cerca:eventoCerca,
  rua:eventoRua,
  alarme:eventoAlarme,
  saqueadores:evSaqueadores,
  manada:evManada,
  resgate:evPedidoResgateRadio,
  refeicaoCompartilhada:evRefeicaoCompartilhada,
  chuva:evChuvaNoTelhado,
  lembranca:evObjetoEncontrado,
  silencio:evSilencioCorredor,
  relacionamentoSaudade:evParceiraSenteFalta,
  relacionamentoPesadelo:evPesadeloParceira,
  relacionamentoMedo:evMedoAntesDeSair,
  pesadeloSono:eventoPesadeloSono,
  barulhoSono:eventoInterrupcaoSono,
  rotinaCozinha:eventoRotinaCozinha,
  chuvaFraca:eventoChuvaFraca,
  rondaTranquila:eventoRondaTranquila,
  barulhoDistante:eventoBarulhoDistante,
  reparoImprovisado:eventoReparoImprovisado,
  ruaVazia:eventoRuaVazia
};
function executarEventoDebug(nome){
  if(!S?.vivo)return false;
  const evento=EVENTOS_DEBUG[String(nome).toLowerCase()];
  if(!evento)return false;
  evento();return true;
}
window.debugJogo={
  ativar(){localStorage.setItem('lastDaysDebug','1');return 'debug ativado';},
  desativar(){localStorage.removeItem('lastDaysDebug');return 'debug desativado';},
  listar(){return Object.keys(EVENTOS_DEBUG);},
  evento(nome){return executarEventoDebug(nome)}
};
window.forcarEventoHorror=()=>executarEventoDebug('horror');
function eventoObra(){
  abrirModal('O martelo chamou atenção','O som da obra está atraindo movimento para o muro.',[
    {texto:'Trabalhar devagar · +60 min',fn:()=>{atrasarAcao(60);S.base.silencioAte=Math.max(S.base.silencioAte,S.tempoTotal+120);}},
    {texto:'Manter o ritmo · +12 ameaça',fn:()=>S.base.ameaca=clamp(S.base.ameaca+12,0,100)}
  ]);
}
function eventoViga(){
  abrirModal('Uma peça cedeu','Uma peça danificada comprometeu parte do trabalho.',[
    {texto:'Substituir · 2 materiais',fn:()=>{if(S.recursos.materiais>=2)S.recursos.materiais-=2;else{atrasarAcao(60);log('Sem materiais, você precisou improvisar. +1 hora.','info');}}},
    {texto:'Improvisar com cuidado · +60 min',fn:()=>atrasarAcao(60)}
  ]);
}
function eventoPortao(){
  abrirModal('Batidas no portão','Uma pessoa faminta pede comida e promete seguir viagem.',[
    {texto:'Oferecer 2 comidas',fn:()=>{if(S.recursos.comida>=2){S.recursos.comida-=2;S.base.moral=clamp(S.base.moral+5,0,100);}else log('Não há comida suficiente para oferecer.','info');}},
    {texto:'Pedir silêncio e mandar embora',fn:()=>{S.base.ameaca=Math.max(0,S.base.ameaca-2);log('A pessoa seguiu viagem.','info');}}
  ]);
}
function eventoCerca(){
  abrirModal('A cerca está cedendo','Alguns zumbis pressionam uma parte frágil do muro.',[
    {texto:'Reforçar por dentro · 2 materiais',fn:()=>{if(S.recursos.materiais>=2){S.recursos.materiais-=2;S.base.barricadas++;}else S.base.barricadas=Math.max(0,S.base.barricadas-1);}},
    {texto:'Desviar com barulho do outro lado',fn:()=>{S.base.ameaca=clamp(S.base.ameaca+5,0,100);log('O muro resistiu, mas o barulho atraiu mais atenção.','ruim');}}
  ]);
}
function eventoRua(){
  abrirModal('A rua está bloqueada','Carros abandonados e zumbis fecharam o caminho.',[
    {texto:'Dar a volta · +60 min',fn:()=>atrasarAcao(60)},
    {texto:'Abrir caminho lutando',fn:()=>combate(3)}
  ]);
}
function eventoAlarme(){
  abrirModal('Um alarme começou a tocar','Um carro próximo dispara o alarme e quebra o silêncio.',[
    {texto:'Sair de perto · +8 ameaça',fn:()=>S.base.ameaca=clamp(S.base.ameaca+8,0,100)},
    {texto:'Tentar desligar · +20 min',fn:()=>{atrasarAcao(20);if(S.player.inteligencia>=4)log('Você silenciou o alarme.','bom');else{S.player.vida-=4;S.base.ameaca=clamp(S.base.ameaca+5,0,100);log('Você se cortou tentando desligar o alarme.','ruim');}}}
  ]);
}

/* Acontecimentos cotidianos: aparecem como relatos curtos e não interrompem a ação. */
function eventoRotinaCozinha(){
  const pessoa=pick(S.sobreviventes.filter(m=>m.vivo && naBase(m)));
  if(!pessoa)return;
  S.base.moral=clamp(S.base.moral+1,0,100);
  log(`${esc(pessoa.nome)} organizou a cozinha e deixou a próxima refeição encaminhada. A rotina ajuda a manter a calma.`,'info');
}
function eventoChuvaFraca(){
  const captou=temInstalacao('cisterna');
  if(captou)S.recursos.agua=clamp(S.recursos.agua+1,0,100);
  log(captou?'Uma chuva leve encheu parte da cisterna. +1 água.':'Uma chuva leve caiu sobre a base e parou antes de molhar os estoques.','info');
}
function eventoRondaTranquila(){
  const guarda=pick(S.sobreviventes.filter(m=>m.vivo && m.tarefa==='guarda'));
  if(!guarda)return;
  log(`${esc(guarda.nome)} terminou a ronda sem encontrar nada além de pegadas antigas.`,'info');
}
function eventoBarulhoDistante(){
  log('Um caminhão passou ao longe e o som desapareceu entre os prédios. Por alguns minutos, a base ficou em silêncio.','info');
}
function eventoReparoImprovisado(){
  const pessoa=pick(S.sobreviventes.filter(m=>m.vivo && naBase(m)));
  if(!pessoa)return;
  S.base.moral=clamp(S.base.moral+1,0,100);
  log(`${esc(pessoa.nome)} reforçou uma janela com o que encontrou no depósito.`,'info');
}
function eventoRuaVazia(){
  log('A rua estava vazia durante alguns minutos. Você ouviu apenas o vento e o rangido de uma placa solta.','info');
}
function eventoServicos(){
  const alvos=servicosParaRestaurar();
  if(!alvos.length || !mecanicosDisponiveis().length)return;
  const nome=alvos.includes('eletricidade')&&alvos.includes('agua')?'energia e água':alvos[0]==='eletricidade'?'energia':'água';
  abrirModal('Um sinal vindo da cidade',`O rádio capta uma mensagem curta: técnicos ainda podem alcançar a usina e a estação de água. Um mecânico qualificado da comunidade poderia tentar restaurar o ${nome}.`,[
    {texto:'Analisar a oportunidade',fn:abrirServicosBase},
    {texto:'Manter o grupo escondido',fn:()=>log('A comunidade decidiu não arriscar uma missão fora da base.','info')}
  ]);
}
function eventosParaAcao(tipo){
  const parceiro=typeof parceiroDoJogador==='function' ? parceiroDoJogador() : null;
  const relacao=parceiro && naBase(parceiro);
  if(['comer','beber'].includes(tipo))return [eventoRefeicao,eventoPanela,eventoPortao,eventoServicos,eventoRotinaCozinha,eventoChuvaFraca,evRefeicaoCompartilhada,...(relacao?[evParceiraSenteFalta]:[])];
  if(tipo==='descansar')return [eventoSono,eventoPesadelo,eventoCerca,eventoRondaTranquila,eventoBarulhoDistante,evChuvaNoTelhado,...(relacao?[evPesadeloParceira]:[])];
  if(tipo==='dormir')return [eventoPesadeloSono,eventoInterrupcaoSono,eventoPortao,eventoCerca,eventoBarulhoDistante];
  if(['construir','fortificar','gerador'].includes(tipo))return [eventoObra,eventoViga,eventoCerca,eventoReparoImprovisado,eventoServicos,evSilencioCorredor];
  if(['perto','expedicao','procurar','cacar','procurarBase','mudarBase','planoMuro'].includes(tipo))return [eventoRua,eventoRuaVazia,eventoAlarme,eventoServicos,evObjetoEncontrado,...(relacao?[evMedoAntesDeSair]:[])];
  return [eventoPortao,eventoCerca,eventoRondaTranquila,evAjudaMedica,evObjetoEncontrado];
}
function tentarEventoDuranteAcao(){
  const a=S.acao;if(!a || S.pausado)return;
  if(a.tipo==='dormir'){
    if(S.tempoTotal<(a.proximoEvento||a.fim-a.dur+120))return;
    a.proximoEvento=S.tempoTotal+120;
    if(S.tempoTotal-S.comunidade.ultimoEvento<80 || Math.random()>=.24)return;
    S.comunidade.ultimoEvento=S.tempoTotal;
    pick(eventosParaAcao('dormir'))();
    return;
  }
  if(a.eventoTentado)return;
  const decorrido=S.tempoTotal-(a.fim-a.dur);
  if(decorrido<Math.min(60,a.dur/2))return;
  a.eventoTentado=true;
  if(S.tempoTotal-S.comunidade.ultimoEvento<120 || Math.random()>=.24)return;
  S.comunidade.ultimoEvento=S.tempoTotal;
  if(S.base.atencaoHumana>=70 && Math.random()<.3){S.base.atencaoHumana-=25;evSaqueadores();return;}
  pick(eventosParaAcao(a.tipo))();
}
function retomarAcaoVencida(){
  if(S?.vivo && !modalAtivo && !filaModais.length && S.acao && S.tempoTotal>=S.acao.fim)resolverAcao();
}

function migrarComunidade(estado){
  const total=1+estado.sobreviventes.filter(m=>m.vivo).length+(estado.familia.gravidez?1:0);
  const local=Object.keys(LOCAIS_BASE).find(id=>LOCAIS_BASE[id].capacidade>=total) || 'deposito';
  estado.base=criarBase(local,{...estado.base,eletricidadeLigada:true,corteEletricoDia:null,aguaLigada:true,corteAguaDia:null,energiaCidadeRestaurada:false,aguaCidadeRestaurada:false,veiculos:[],ordemRadio:null,excursao:null});
  estado.recursos.eletricidade=estado.recursos.eletricidade ?? 20;
  estado.comunidade={ultimoDiaDoenca:estado.dia,ultimoEvento:estado.tempoTotal};
  for(const m of estado.familia.membros){m.doenca=null;m.ferimentos=[];m.expedicao=null;m.proximaSaida=estado.tempoTotal;m.proximoAtendimento=0;}
}
function validarComunidade(e){
  const numero=v=>typeof v==='number' && Number.isFinite(v) && v>=0 && v<=1e9;
  const b=e.base;
  if(!Object.keys(LOCAIS_BASE).includes(b.local) || !Array.isArray(b.instalacoes) || b.instalacoes.some(id=>!Object.keys(INSTALACOES).includes(id)) || new Set(b.instalacoes).size!==b.instalacoes.length || b.instalacoes.length>LOCAIS_BASE[b.local].slots)throw Error('Instalações da base inválidas.');
  if(!Array.isArray(b.descobertas) || !b.descobertas.includes(b.local) || b.descobertas.some(id=>!Object.keys(LOCAIS_BASE).includes(id)) || new Set(b.descobertas).size!==b.descobertas.length)throw Error('Locais da base inválidos.');
  if(!Array.isArray(b.veiculos) || !Number.isInteger(b.vagasVeiculo) || b.vagasVeiculo<1 || b.veiculos.length>b.vagasVeiculo || !Number.isInteger(b.proximoVeiculoId) || b.veiculos.some(v=>!v || typeof v.id!=='string' || typeof v.nome!=='string' || !['suv','caminhonete','quatroPortas','duasPortas'].includes(v.tipo) || !numero(v.capacidade) || v.capacidade<1 || !numero(v.combustivel) || !numero(v.carga) || !numero(v.velocidade) || !Array.isArray(v.customizacoes) || v.customizacoes.some(c=>!['portaMalas','suspensao','blindagem','tanque'].includes(c)) || !['pronto','em excursão'].includes(v.estado)))throw Error('Garagem da base inválida.');
  if(b.ordemRadio && (!ORDENS_RADIO[b.ordemRadio.tipo] || !Number.isInteger(b.ordemRadio.inicio) || !Number.isInteger(b.ordemRadio.fim) || !Number.isInteger(b.ordemRadio.ultimoDia)))throw Error('Ordem de rádio inválida.');
  if(b.excursao && (!['a caminho','no local','retornando'].includes(b.excursao.status) || typeof b.excursao.alvoId!=='string' || !Array.isArray(b.excursao.participantes) || !Array.isArray(b.excursao.veiculos) || !numero(b.excursao.chegada) || !numero(b.excursao.localFim) || !numero(b.excursao.retorno)))throw Error('Excursão inválida.');
  if(!['atencaoHumana','silencioAte','geradorAte','armadilhas','proximaArmadilha','proximaHorda'].every(k=>numero(b[k])) || typeof b.eletricidadeLigada!=='boolean' || typeof b.aguaLigada!=='boolean' || typeof b.energiaCidadeRestaurada!=='boolean' || typeof b.aguaCidadeRestaurada!=='boolean' || (b.corteEletricoDia!==null && !Number.isInteger(b.corteEletricoDia)) || (b.corteAguaDia!==null && !Number.isInteger(b.corteAguaDia)) || b.armadilhas>9 || b.atencaoHumana>100 || b.ameaca>100)throw Error('Pressão da base inválida.');
  if(!e.comunidade || !numero(e.comunidade.ultimoDiaDoenca) || !numero(e.comunidade.ultimoEvento))throw Error('Rotina da comunidade inválida.');
  for(const m of e.familia.membros){
    if(!Array.isArray(m.ferimentos))m.ferimentos=[];
    if(!numero(m.proximaSaida) || !numero(m.proximoAtendimento))throw Error('Horários de trabalho inválidos.');
    const d=m.doenca,x=m.expedicao;
    if(d && (!DOENCAS[d.tipo] || !numero(d.gravidade) || d.gravidade>100 || !numero(d.ultimoAvanco) || !numero(d.aviso) || !numero(d.fim)))throw Error('Doença inválida.');
    if(!Array.isArray(m.ferimentos) || m.ferimentos.some(f=>!TIPOS_FERIMENTO[f.tipo] || !LOCAIS_CORPO[f.local] || !['leve','médio','grave'].includes(f.gravidade) || !numero(f.intensidade) || f.intensidade>100 || !numero(f.inicio) || !numero(f.fim)))throw Error('Ferimento inválido.');
    if(x && (!numero(x.inicio) || !numero(x.fim) || x.fim<x.inicio || (x.tipo==='resgate' ? typeof x.alvoNome!=='string' : m.tarefa!=='scavenger')))throw Error('Saída de scavenger inválida.');
  }
  const a=e.acao;
  if(a?.tipo==='construir' && (!INSTALACOES[a.obra] || a.localOrigem!==b.local || b.instalacoes.includes(a.obra) || b.instalacoes.length>=LOCAIS_BASE[b.local].slots))throw Error('Construção em andamento inválida.');
  if(a?.tipo==='demolir' && (!b.instalacoes.includes(a.obra) || (a.obra==='alojamento' && moradores(e)+(e.familia.gravidez?1:0)>capacidadeBase(e)-2)))throw Error('Desmontagem inválida.');
  if(a?.tipo==='mudarBase' && (!LOCAIS_BASE[a.destino] || !b.descobertas.includes(a.destino) || moradores(e)+(e.familia.gravidez?1:0)>LOCAIS_BASE[a.destino].capacidade))throw Error('Mudança inválida.');
  if(a?.tipo==='planoMuro' && !PLANOS_MURO[a.plano])throw Error('Plano do muro inválido.');
  if(a?.tipo==='tratarDoenca' && !e.familia.membros.some(m=>m.id===a.pacienteId))throw Error('Paciente inválido.');
  if(a?.tipo==='restaurarServico' && (!['eletricidade','agua'].includes(a.servico) || !Number.isInteger(a.mecanicoId)))throw Error('Reparo de serviço inválido.');
  if(a?.tipo==='localizarVeiculo' && (!numero(a.fim) || a.dur<=0))throw Error('Busca de veículo inválida.');
  if(a?.tipo==='customizarVeiculo' && (typeof a.veiculoId!=='string' || !['portaMalas','suspensao','blindagem','tanque'].includes(a.customizacao) || !b.veiculos.some(v=>v.id===a.veiculoId)))throw Error('Customização de veículo inválida.');
}

setInterval(atualizarImagemMuro,8000);
