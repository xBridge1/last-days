(() => {
  const resultados = [];
  const inicial = JSON.parse(JSON.stringify(criacao));
  const randomOriginal = Math.random;
  const assert = (v, mensagem) => { if(!v) throw Error(mensagem); };
  function reset(){
    clearInterval(loopId);
    limparModais();
    criacao = JSON.parse(JSON.stringify(inicial));
    criacao.identidadePronta = true;
    criacao.passo = 2;
    criacao.adultosProntos = true;
    Object.assign(criacao.build,{nome:'Teste',sobrenome:'Silva',nomeCompleto:'Teste Silva',idade:23,experiencia:0});
    renderCriacao();
    iniciarJogo();
    clearInterval(loopId);
    Math.random = () => 0.99;
  }
  function teste(nome, fn){
    try{ reset(); fn(); resultados.push({nome,ok:true}); }
    catch(e){resultados.push({nome,ok:false,erro:e.message,stack:e.stack});}
  }
  const botaoModal = (i=0) => document.querySelectorAll('#modal .modalOps button')[i].click();
  function parceiro(){
    const m=novoMembroFamilia('Bruno','Parceiro(a)',25,[],0,'masculino');
    m.parceiro=membroAtual().id;membroAtual().parceiro=m.id;
    adicionarAoGrupo(m);return m;
  }
  function finalizarAcao(){
    let limite=100;
    while(S.acao && S.vivo && !S.pausado && limite--) tick();
    assert(limite>0,'Ação não terminou');
  }
  teste('Decisão familiar e perk mantêm a ordem',()=>{
    parceiro();S.player.experiencia=9;S.acao={tipo:'familia'};resolverAcao();
    assert(modalAtivo.titulo==='Uma decisão íntima','Decisão substituída');
    assert(filaModais.length===1,'Perk não entrou na fila');
    botaoModal();assert(modalAtivo.titulo==='Você subiu de nível','Perk não apresentado');
    botaoModal();assert(!modalAtivo && S.player.perks.length===1,'Fila não encerrou');
  });
  teste('Morte em evento é imediata e não permite descanso',()=>{
    abrirModal('Dano','Teste',[{texto:'Continuar',fn:()=>S.player.vida=0}]);
    botaoModal();assert(!S.vivo,'Morte não processada');
    clicarAcao('descansar');assert(!S.acao && S.player.vida===0,'Personagem morto agiu');
  });
  teste('Dano por necessidade é fatal antes da cura de descanso',()=>{
    S.player.vida=.2;S.player.fome=90;clicarAcao('descansar');S.acao.fim=S.tempoTotal+20;tick();
    assert(!S.vivo && S.player.vida===0,'Descanso reviveu o protagonista');
  });
  teste('Bebê nasce com zero anos em campanha antiga',()=>{
    S.dia=731;const bebe=novoMembroFamilia('Bebê','Filho(a)',0);
    assert(idadeMembro(bebe)===0,'Nascimento envelhecido');S.dia+=365;assert(idadeMembro(bebe)===1,'Aniversário incorreto');
  });
  teste('Painel acompanha aniversários',()=>{
    S.dia=366;render();assert(S.player.idade===24,'Idade interna congelada');
    assert(document.getElementById('statusJogador').textContent.includes('24 anos'),'Painel incorreto');
  });
  teste('Criança adulta pode formar família',()=>{
    const jovem=novoMembroFamilia('Jovem','Filho(a)',8);adicionarAoGrupo(jovem);
    assumirDescendente(jovem.id);clearInterval(loopId);S.dia+=365*10;
    resolverFamilia();assert(jovem.parceiro,'Regra usou idade de entrada');
  });
  teste('Familiares menores não recebem romance',()=>{
    const m=novoMembroFamilia('Filha','Filha',8,[membroAtual().id]);adicionarAoGrupo(m);
    m.relacao.amizade=80;resolverInteracao({pessoaId:0,interacao:'divertir'});
    assert(m.relacao.romance===0,'Romance indevido');
    S.dia+=365*20;assert(!podeRomance(m),'Parentesco ignorado após maioridade');
  });
  teste('Parceiro de antigo líder não é parceiro do sucessor',()=>{
    const p=parceiro();const filho=novoMembroFamilia('Filho','Filho(a)',20,[membroAtual().id,p.id],null,'masculino');
    adicionarAoGrupo(filho);assumirDescendente(filho.id);clearInterval(loopId);
    assert(!!impedimentoBebe(p),'Parceiro antigo aceito');abrirInteracoes(S.sobreviventes.indexOf(p));
    assert(!document.getElementById('modal').textContent.includes('Tentar ter um bebê'),'Botão indevido');
  });
  teste('Parceiro morto não participa da tentativa',()=>{
    const p=parceiro();p.vivo=false;const comida=S.recursos.comida;
    resolverTentativaBebe(p);assert(S.recursos.comida===comida && !S.familia.gravidez,'Tentativa com falecido');
  });
  teste('Gestação termina com morte da gestante',()=>{
    const p=parceiro();S.familia.gravidez={maeId:p.id,paiId:membroAtual().id,inicio:0,ultimoRisco:0};
    p.vivo=false;sincronizarEstado();assert(!S.familia.gravidez,'Gestação persistiu');
  });
  teste('Tentativa pelo grupo usa tempo, energia e limite de filhos',()=>{
    const p=parceiro();tentarBebeComPessoa(p);
    assert(S.acao?.dur===360 && S.player.energia===90,'Custos diferentes');
    S.acao=null;membroAtual().filhos=[9,10,11];tentarBebeComPessoa(p);assert(!S.acao,'Limite ignorado');
  });
  teste('Nascimento respeita vaga reservada e compartilha atributos',()=>{
    const p=parceiro();Math.random=()=>0;resolverTentativaBebe(p);botaoModal();
    while(haVaga()) adicionarAoGrupo(novoSobrevivente('NPC'));
    assert(S.sobreviventes.length===capacidadeBase()-2,'Vaga não reservada');S.dia=281;concluirGestacao(true);
    const bebe=S.sobreviventes.at(-1);assert(moradores()===capacidadeBase() && idadeMembro(bebe)===0,'Nascimento inválido');
    assert(bebe.forca===1 && bebe.skills.forca===1 && bebe.stats.forca===1,'Prematuridade inconsistente');
  });
  teste('Recrutamento e família respeitam capacidade',()=>{
    while(haVaga()) adicionarAoGrupo(novoSobrevivente('NPC'));
    evSobrevivente();botaoModal();resolverFamilia();
    assert(moradores()===capacidadeBase() && !membroAtual().parceiro,'Capacidade excedida');
  });
  teste('Eleição preserva idade e família do líder',()=>{
    const p=parceiro();assumirMembroComunidade(p);clearInterval(loopId);
    assert(membroAtual()===p && idadeAtual()===25 && S.player.idade===25,'Vínculo perdido');
  });
  teste('Progressão do NPC é preservada na sucessão',()=>{
    const p=parceiro();const anterior=p.forca;ganharExperienciaPessoa(p,30);
    const skill=skillDaEspecialidade(p.especialidade),valor=p[skill];
    assumirMembroComunidade(p);clearInterval(loopId);
    assert(S.player[skill]===valor && S.player.perks.length===3 && S.player.nivel===4,'Progressão perdida');
    assert(membroAtual().stats[skill]===valor,'Espelho de atributos divergiu');
  });
  teste('XP inicial concede todos os perks devidos',()=>{
    S.player.experiencia=35;ganharExperiencia(0);
    assert(S.player.nivel===4 && filaModais.length===2,'Níveis não enfileirados');
    botaoModal();botaoModal();botaoModal();assert(S.player.perks.length===3,'Perks perdidos');
  });
  teste('Empatia é removida do comportamento',()=>{
    criacao.build.comportamento.empatia=3;aplicarEfeitosEvento(EVENTOS_ADULTOS[4]);
    assert(criacao.build.comportamento.empatia===2,'Empatia não mudou');
  });
  teste('Ânimo zero e limite das relações são respeitados',()=>{
    const p=parceiro();p.moral=0;S.player.moral=0;p.relacao.amizade=100;
    render();assert(document.getElementById('statusJogador').textContent.includes('Ânimo0'),'Zero substituído');
    resolverInteracao({pessoaId:0,interacao:'divertir'});
    assert(p.moral===8 && S.player.moral===6 && p.relacao.amizade===100,'Limites incorretos');
  });
  teste('Treino custa energia e só ocorre uma vez por dia',()=>{
    const p=parceiro();const forca=S.player.forca;iniciarInteracao(0,'treinar');
    assert(S.player.energia===85,'Sem custo');finalizarAcao();iniciarInteracao(0,'treinar');
    assert(!S.acao && S.player.forca===forca,'Treino ilimitado ou atributo gratuito');
  });
  teste('Comer, beber e necessidades evoluem durante ações',()=>{
    S.player.fome=50;S.player.sede=50;clicarAcao('comer');finalizarAcao();assert(S.player.fome<10,'Refeição falhou');
    clicarAcao('beber');finalizarAcao();assert(S.player.sede<10,'Água falhou');
    const fome=S.player.fome,sede=S.player.sede;clicarAcao('perto');finalizarAcao();assert(S.player.fome>fome && S.player.sede>sede,'Esforço sem necessidades');
  });
  teste('Revólver usa munição e aumenta ameaça',()=>{
    S.player.arma='Revólver';S.player.armaBonus=3;S.recursos.municao=2;const ameaca=S.base.ameaca;
    combate(1);assert(S.recursos.municao===1 && S.base.ameaca===ameaca+5,'Arma sem munição ou ruído');
  });
  teste('Combustível alimenta o gerador',()=>{
    S.recursos.combustivel=1;S.player.energia=50;const moral=S.base.moral;clicarAcao('gerador');finalizarAcao();
    assert(S.recursos.combustivel===0 && S.player.energia===60 && S.base.moral===moral+5,'Gerador não funciona');
  });
  teste('Passado criminoso tem consequência única',()=>{
    const p=parceiro();S.player.passadoCriminoso=true;const moral=S.base.moral;evPassado();botaoModal(1);
    assert(S.base.moral===moral-10 && p.relacao.respeito===42,'Sem consequência');evPassado();assert(!modalAtivo,'Evento repetido');
  });
  teste('Acontecimentos adultos não podem ser repetidos',()=>{
    escolherEventoAdulto(0);const xp=criacao.build.experiencia;escolherEventoAdulto(0);
    assert(criacao.build.experiencia===xp && criacao.build.eventosAdultos.length===1,'Acontecimento repetido');
  });
  teste('Gênero e aparência preservam nome digitado',()=>{
    criacao=JSON.parse(JSON.stringify(inicial));renderCriacao();
    document.getElementById('nomeInicial').value='Joana';document.getElementById('sobrenomeInicial').value='Costa';
    document.querySelector('[data-genero="masculino"]').click();
    selecionarAparencia('padrao-2');assert(document.getElementById('nomeInicial').value==='Joana' && document.getElementById('sobrenomeInicial').value==='Costa','Nome apagado');
    assert(document.querySelector('[data-genero="masculino"]').style.borderColor,'Seleção invisível');
  });
  teste('Retrato escolhido aparece no perfil',()=>{
    S.player.imagem='data:image/png;base64,iVBORw0KGgo=';abrirPerfilPrincipal();
    assert(document.querySelector('#modal img').getAttribute('src')===S.player.imagem,'Imagem ignorada');
  });
  teste('Clique no familiar mantém o perfil aberto',()=>{
    parceiro();render();document.querySelector('#painelFamilia .noFamilia').click();
    assert(modalAtivo.titulo.startsWith('Perfil de'),'Propagação substituiu o perfil');
  });
  teste('Salvar e carregar reconectam grupo e família',()=>{
    const p=parceiro();S.player.energia=66;render();const json=snapshotJogo();
    restaurarJogo(JSON.parse(json));clearInterval(loopId);
    assert(S.player.energia===66 && S.sobreviventes[0]===S.familia.membros.find(m=>m.id===p.id),'Save divergiu');
    assert(validarSave(JSON.parse(snapshotJogo())),'Save gerado inválido');
  });
  teste('Save durante ação retoma o progresso',()=>{
    clicarAcao('perto');tick();const restante=S.acao.fim-S.tempoTotal;
    restaurarJogo(JSON.parse(snapshotJogo()));clearInterval(loopId);
    assert(S.acao.fim-S.tempoTotal===restante,'Progresso perdido');finalizarAcao();assert(!S.acao,'Ação não retomou');
  });
  teste('Decisões pendentes não sobrescrevem checkpoint',()=>{
    salvarJogo();const antes=localStorage.getItem(SAVE_KEY);abrirModal('Decisão','Teste',[{texto:'OK',fn:()=>{}}]);
    S.recursos.comida+=20;assert(!salvarJogo(true) && localStorage.getItem(SAVE_KEY)===antes,'Checkpoint sobrescrito');
  });
  teste('Save de morte reabre sucessão',()=>{
    parceiro();S.player.vida=0;verificarEstado();const json=snapshotJogo();
    restaurarJogo(JSON.parse(json));clearInterval(loopId);
    assert(!S.vivo && modalAtivo,'Sucessão não retomada');
  });
  teste('Arquivo inválido não substitui partida',()=>{
    const antes=S;let falhou=false;try{restaurarJogo({versao:1,estado:{}});}catch{falhou=true;}
    assert(falhou && S===antes,'Importação danificou partida');
  });
  teste('Painel não substitui decisão obrigatória',()=>{
    abrirModal('Decisão','Teste',[{texto:'OK',fn:()=>{}}]);abrirPerfilPrincipal();
    assert(modalAtivo.titulo==='Decisão','Decisão perdida por navegação');
  });
  teste('Comunidade passa por eleição, não por herança',()=>{
    parceiro();S.player.vida=0;verificarEstado();
    assert(modalAtivo.titulo==='O acampamento decide','NPC tratado como descendente');
    botaoModal();clearInterval(loopId);assert(S.vivo && idadeAtual()===25,'Eleição não restaurou a campanha');
    assert(validarSave(JSON.parse(snapshotJogo())),'Save após eleição inválido');
  });
  teste('Descendente verdadeiro recebe opção de herança',()=>{
    const filho=novoMembroFamilia('Herdeira','Filha',22,[membroAtual().id]);adicionarAoGrupo(filho);
    SKILLS.forEach(k=>filho[k]=5);S.player.vida=0;verificarEstado();
    assert(modalAtivo.titulo==='FIM DE LINHA' && modalAtivo.opcoes[0].texto.includes('Herdeira'),'Herança não oferecida');
  });
  teste('Arquivos com relações ou ações malformadas são rejeitados',()=>{
    parceiro();render();const original=snapshotJogo();
    for(const alterar of [d=>d.estado.familia.membros[0].relacao='inválido',d=>d.estado.acao={tipo:'interacao',dur:20,fim:400,nome:'Teste',interacao:'desconhecida',pessoaId:0},d=>d.estado.familia.membros[0].pais=[2]]){
      const dados=JSON.parse(original);alterar(dados);let rejeitado=false;
      try{validarSave(dados);}catch{rejeitado=true;}assert(rejeitado,'Save malformado aceito');
    }
  });
  teste('Nomes com marcação aparecem apenas como texto',()=>{
    const p=parceiro();p.nome='<img src=x onerror=alert(1)>';const q=novoSobrevivente('Outra pessoa');adicionarAoGrupo(q);
    evBriga();assert(!document.querySelector('#modal img'),'Nome interpretado como HTML');
  });
  teste('Arquivo conserva gestação e vaga reservada',()=>{
    const p=parceiro();Math.random=()=>0;resolverTentativaBebe(p);botaoModal();
    const json=snapshotJogo();restaurarJogo(JSON.parse(json));clearInterval(loopId);
    assert(S.familia.gravidez?.paiId===p.id && dadosGravidez().dias===0,'Gestação perdida no save');
  });
  teste('Campanha de dez dias mantém atributos e salvamento válidos',()=>{
    S.player.forca=50;S.player.vidaMax=1000;S.player.vida=1000;
    let limite=1000;
    while(S.dia<10 && S.vivo && limite--){
      while(modalAtivo) botaoModal();
      if(!S.acao) clicarAcao(S.player.energia<20 ? 'descansar' : 'perto');
      tick();
    }
    while(modalAtivo) botaoModal();
    assert(S.dia>=10 && S.vivo,'Campanha interrompida');
    assert(validarSave(JSON.parse(snapshotJogo())),'Estado acumulado inválido');
  });
  clearInterval(loopId);Math.random=randomOriginal;
  return resultados;
})()
