(() => {
  const resultados=[],inicial=JSON.parse(JSON.stringify(criacao)),randomOriginal=Math.random;
  const assert=(ok,msg)=>{if(!ok)throw Error(msg);};
  function reset(){
    clearInterval(loopId);limparModais();criacao=JSON.parse(JSON.stringify(inicial));
    criacao.identidadePronta=true;criacao.passo=2;criacao.adultosProntos=true;
    Object.assign(criacao.build,{nome:'Teste',nomeCompleto:'Teste Silva',idade:28,experiencia:0,familiaInicio:'sozinho'});
    renderCriacao();iniciarJogo();clearInterval(loopId);Math.random=()=>.99;
    for(const k of Object.keys(NOMES_REC))S.recursos[k]=50;
    S.player.vidaMax=1000;S.player.vida=1000;
  }
  function teste(nome,fn){try{reset();fn();resultados.push({nome,ok:true});}catch(e){resultados.push({nome,ok:false,erro:e.message,stack:e.stack});}}
  function npc(funcao='ocioso'){const m=novoSobrevivente('Pessoa');adicionarAoGrupo(m,funcao);return m;}
  function escolher(i=0){document.querySelectorAll('#modal .modalOps button')[i].click();}
  function concluir(){
    let limite=100;
    while(S.acao && S.vivo && limite--){while(modalAtivo)escolher();if(S.acao)tick();}
    while(modalAtivo)escolher();
    assert(limite>0,'Ação travou');
  }
  teste('Base inicial pequena e painel do muro acessível',()=>{
    assert(capacidadeBase()===4 && LOCAIS_BASE[S.base.local].slots===3,'Tamanho inicial incorreto');
    render();document.querySelector('.visorMuro').click();assert(modalAtivo.titulo==='Olhar além do muro','Muro não abre');
  });
  teste('Escolha de função aplica scavenger ao NPC existente',()=>{
    const m=npc();abrirFuncoes(0);escolher(Object.keys(FUNCOES_NPC).indexOf('scavenger'));
    assert(m.tarefa==='scavenger' && S.sobreviventes.length===1,'Não atribuiu função');
  });
  teste('Scavenger sai, retorna com recursos e espera nova rodada',()=>{
    const m=npc('scavenger'),comida=S.recursos.comida;atualizarScavengers();
    assert(m.expedicao?.fim===S.tempoTotal+240 && !aptoTrabalho(m),'Saída não iniciada');
    S.tempoTotal=m.expedicao.fim;atualizarScavengers();
    assert(!m.expedicao && S.recursos.comida>comida && m.proximaSaida===S.tempoTotal+120,'Retorno incorreto');
    atualizarScavengers();assert(!m.expedicao,'Não respeitou intervalo');
  });
  teste('Saída em andamento é preservada ao carregar',()=>{
    const m=npc('scavenger');atualizarScavengers();const fim=m.expedicao.fim;
    restaurarJogo(JSON.parse(snapshotJogo()));clearInterval(loopId);
    assert(S.sobreviventes[0].expedicao.fim===fim && !naBase(S.sobreviventes[0]),'Saída perdida');
  });
  teste('NPC fora não muda de função nem defende a base',()=>{
    const m=npc('scavenger');const defesa=calcularDefesa();atualizarScavengers();
    atribuirFuncao(0,'medico');assert(m.tarefa==='scavenger','Mudança fora da base permitida');
    assert(calcularDefesa()<defesa,'NPC defendeu à distância');
  });
  teste('Scavenger pode voltar ferido e suspende expedições',()=>{
    const m=npc('scavenger');atualizarScavengers();S.tempoTotal=m.expedicao.fim;Math.random=()=>0;
    atualizarScavengers();assert(m.ferido && !m.expedicao,'Risco não aplicado');
    S.tempoTotal+=200;atualizarScavengers();assert(!m.expedicao,'Ferido continuou saindo');
  });
  teste('Médico trata o caso mais grave e consome remédio',()=>{
    const doc=npc('medico'),pac=npc();doc.especialidade='Guarda';adoecer(pac);adoecer(membroAtual());pac.doenca.gravidade=70;
    const remedios=S.recursos.remedios;atualizarMedicos();
    assert(pac.doenca.gravidade===52 && membroAtual().doenca.gravidade===25,'Prioridade incorreta');
    assert(S.recursos.remedios===remedios-1,'Remédio não consumido');
    atualizarMedicos();assert(S.recursos.remedios===remedios-1,'Médico ignorou intervalo');
  });
  teste('Sem remédios ou médico saudável não há cura automática',()=>{
    const doc=npc('medico'),pac=npc();adoecer(pac);S.recursos.remedios=0;atualizarMedicos();
    assert(pac.doenca.gravidade===25,'Curou sem remédio');S.recursos.remedios=10;adoecer(doc);atualizarMedicos();
    assert(pac.doenca.gravidade===25,'Médico doente trabalhou');
  });
  teste('Enfermaria melhora a potência do atendimento',()=>{
    const doc=npc('medico'),pac=npc();doc.especialidade='Guarda';adoecer(pac);pac.doenca.gravidade=60;S.base.instalacoes=['enfermaria'];atualizarMedicos();
    assert(pac.doenca.gravidade===28,'Bônus não aplicado');
  });
  teste('Doença não tratada mata um NPC e interrompe trabalho',()=>{
    const pac=npc('scavenger');adoecer(pac);assert(!aptoTrabalho(pac),'Doente apto a trabalhar');
    S.tempoTotal+=26*60;evoluirDoencas();assert(!pac.vivo && pac.diaSaida===S.dia,'Doença não foi fatal');
  });
  teste('Doença fatal do protagonista abre sucessão',()=>{
    npc();adoecer(membroAtual());S.tempoTotal+=26*60;evoluirDoencas();
    assert(!S.vivo && S.player.vida===0 && modalAtivo,'Morte por doença não encerrou liderança');
  });
  teste('Tratamento manual leva tempo e pode curar',()=>{
    const pac=npc();adoecer(pac);const remedios=S.recursos.remedios;iniciarTratamento(pac.id);
    assert(S.acao?.tipo==='tratarDoenca' && S.recursos.remedios===remedios-1,'Atendimento não iniciou');
    concluir();assert(!pac.doenca,'Não curou');
  });
  teste('Médico não cura protagonista em expedição',()=>{
    npc('medico');adoecer(membroAtual());clicarAcao('perto');atualizarMedicos();
    assert(membroAtual().doenca?.gravidade===25,'Atendimento fora da base');
  });
  teste('Incidência aleatória ocorre uma vez por dia',()=>{
    const pac=npc();S.dia=2;Math.random=()=>0;incidenciaDoencas();assert(pac.doenca,'Ninguém adoeceu');
    pac.doenca=null;incidenciaDoencas();assert(!pac.doenca,'Incidência repetiu no mesmo dia');
  });
  teste('Construção gasta recursos e só funciona após concluir',()=>{
    const materiais=S.recursos.materiais;iniciarConstrucao('enfermaria');
    assert(!temInstalacao('enfermaria') && S.recursos.materiais===materiais-8,'Custo ou término antecipado');
    concluir();assert(temInstalacao('enfermaria'),'Construção não terminou');
  });
  teste('Obras sem recursos, duplicadas ou sem espaço são bloqueadas',()=>{
    S.recursos.materiais=0;iniciarConstrucao('horta');assert(!S.acao,'Construção gratuita');
    S.recursos.materiais=50;S.base.instalacoes=['horta'];iniciarConstrucao('horta');assert(!S.acao,'Duplicata');
    S.base.instalacoes=['horta','cisterna','torre'];iniciarConstrucao('enfermaria');assert(!S.acao,'Excedeu espaços');
  });
  teste('Alojamento aumenta capacidade e pode ser desmontado',()=>{
    iniciarConstrucao('alojamento');concluir();assert(capacidadeBase()===6,'Capacidade não aumentou');
    S.player.energia=100;iniciarDemolicao('alojamento');concluir();assert(capacidadeBase()===4,'Desmontagem não liberou instalação');
  });
  teste('Alojamento ocupado não pode ser desmontado',()=>{
    S.base.instalacoes=['alojamento'];while(haVaga())npc();iniciarDemolicao('alojamento');assert(!S.acao,'Desabrigou moradores');
  });
  teste('Agricultor e mecânico dependem de instalações',()=>{
    npc('agricultor');npc('oficina');const comida=S.recursos.comida,mat=S.recursos.materiais;
    consumoBaseDiario();assert(S.recursos.comida===comida-3 && S.recursos.materiais===mat,'Produção sem instalações');
    S.base.instalacoes=['horta','oficina','cisterna'];const antes=S.recursos.materiais;consumoBaseDiario();assert(S.recursos.materiais>=antes+4,'Produção não ativou');
  });
  teste('Busca descobre abrigo e mudança aumenta espaço',()=>{
    procurarBase();concluir();assert(S.base.descobertas.includes('oficina'),'Não descobriu abrigo');
    S.player.energia=100;S.base.instalacoes=['horta'];const mat=S.recursos.materiais;
    iniciarMudanca('oficina');concluir();assert(S.base.local==='oficina' && capacidadeBase()===8 && S.base.instalacoes.length===0,'Mudança incompleta');
    assert(S.recursos.materiais===mat-8+3,'Recuperação de materiais incorreta');
  });
  teste('Mudança espera scavengers e impede novos embarques',()=>{
    const m=npc('scavenger');S.base.descobertas.push('oficina');atualizarScavengers();iniciarMudanca('oficina');assert(!S.acao,'Mudou sem esperar');
    m.expedicao=null;m.proximaSaida=0;iniciarMudanca('oficina');atualizarScavengers();assert(!m.expedicao && S.acao?.tipo==='mudarBase','Saiu durante mudança');
  });
  teste('Abrigo menor não pode receber comunidade grande',()=>{
    S.base=criarBase('oficina');S.base.descobertas.push('casa');for(let i=0;i<4;i++)npc();
    iniciarMudanca('casa');assert(!S.acao,'Mudança excedeu capacidade');
  });
  teste('População, instalações e obra aumentam o ruído',()=>{
    const base=barulhoBase().total;npc('guarda');const povo=barulhoBase().total;S.base.instalacoes=['oficina'];const construido=barulhoBase().total;
    iniciarConstrucao('horta');assert(povo>base && construido>povo && barulhoBase().total>construido,'Fontes de ruído não somaram');
  });
  teste('Ameaça altera a faixa e mantém o mesmo elemento de imagem',()=>{
    S.base.ameaca=5;renderBase();const img=document.getElementById('imagemMuro'),src=img.dataset.origem;
    renderBase();assert(document.getElementById('imagemMuro')===img && img.dataset.origem===src,'Imagem recriada no tick');
    S.base.ameaca=95;renderBase();assert(faixaMuro().id==='horda' && img.dataset.origem.includes('horda') && zumbisFora()===48,'Faixa incorreta');
  });
  teste('Múltiplas imagens da faixa alternam sem alterar o estado',()=>{
    const antes=Date.now,lista=IMAGENS_MURO.calmo;IMAGENS_MURO.calmo=['assets/muro/calmo/01.svg','assets/muro/atencao/01.svg'];
    try{S.base.ameaca=5;Date.now=()=>0;renderBase();const img=document.getElementById('imagemMuro');assert(img.dataset.origem===IMAGENS_MURO.calmo[0],'Primeira imagem incorreta');Date.now=()=>8000;atualizarImagemMuro();assert(img.dataset.origem===IMAGENS_MURO.calmo[1] && S.base.ameaca===5,'Rotação incorreta');}finally{Date.now=antes;IMAGENS_MURO.calmo=lista;}
  });
  teste('Fogos reduzem a aglomeração e atraem atenção humana',()=>{
    S.base.ameaca=70;const atencao=S.base.atencaoHumana,municao=S.recursos.municao;iniciarPlanoMuro('fogos');concluir();
    assert(S.base.ameaca<45 && S.base.atencaoHumana>atencao+10 && S.recursos.municao===municao-1,'Fogos sem efeito ou custo');
  });
  teste('Armadilhas gastam cargas ao reduzir ameaça',()=>{
    S.base.ameaca=40;iniciarPlanoMuro('armadilhas');concluir();const antes=S.base.ameaca;atualizarPressao();
    assert(S.base.armadilhas===2 && S.base.ameaca<antes-5,'Armadilha não funcionou');atualizarPressao();assert(S.base.armadilhas===2,'Armadilhas dispararam sem intervalo');
  });
  teste('Silêncio reduz atração e suspende saídas',()=>{
    const m=npc('scavenger');S.base.ameaca=50;resolverPlanoMuro({plano:'silencio'});atualizarScavengers();
    assert(!m.expedicao && emSilencio() && barulhoBase().porHora<0,'Silêncio não reduziu movimento');
  });
  teste('Abater gera redução com custo de barulho e combate',()=>{
    S.base.ameaca=60;S.player.forca=50;const vida=S.player.vida;resolverPlanoMuro({plano:'abater'});
    assert(S.base.ameaca===44 && S.player.vida<vida,'Combate não teve custo ou redução');
  });
  teste('Horda dispersa parcialmente e respeita intervalo',()=>{
    S.base.ameaca=100;S.player.forca=100;ataqueHorda();assert(S.base.ameaca===35 && S.base.proximaHorda===S.tempoTotal+720,'Horda não atualizou pressão');
    S.base.ameaca=100;clicarAcao('descansar');tick();assert(S.base.ameaca===100,'Atacou antes do intervalo');
  });
  teste('Evento durante refeição pausa e retoma sem duplicar consumo',()=>{
    S.comunidade.ultimoEvento=0;const comida=S.recursos.comida;Math.random=()=>0;clicarAcao('comer');tick();
    assert(modalAtivo?.titulo==='Cheiro estranho na refeição' && S.acao?.tipo==='comer','Evento não interrompeu');
    const tempo=S.tempoTotal;escolher(0);assert(!S.acao && S.tempoTotal===tempo && S.recursos.comida===comida-2,'Retomada duplicou ação ou tempo');
  });
  teste('Evento de sono preserva e pode alongar o descanso',()=>{
    Math.random=()=>0;clicarAcao('descansar');tick();tick();tick();
    assert(modalAtivo?.titulo==='Passos no pátio','Evento de sono não ocorreu');const fim=S.acao.fim;escolher(0);
    assert(S.acao?.fim===fim+40 && S.acao.eventoTentado,'Descanso não foi preservado');Math.random=()=>.99;concluir();
  });
  teste('Save conserva obra, doença, função e pressão',()=>{
    const m=npc('medico');adoecer(membroAtual());S.base.atencaoHumana=33;S.base.armadilhas=2;iniciarConstrucao('horta');tick();
    const json=snapshotJogo();restaurarJogo(JSON.parse(json));clearInterval(loopId);
    assert(S.acao?.obra==='horta' && S.sobreviventes[0].tarefa==='medico' && membroAtual().doenca && S.base.armadilhas===2,'Estado da expansão perdido');
    assert(validarSave(JSON.parse(snapshotJogo())),'Save da expansão inválido');
  });
  teste('Save antigo migra sem remover uma comunidade maior',()=>{
    S.base=criarBase('escola');for(let i=0;i<8;i++)npc();render();const dados=JSON.parse(snapshotJogo());dados.versao=1;
    dados.estado.base={barricadas:5,ameaca:12,moral:70};delete dados.estado.comunidade;
    for(const m of dados.estado.familia.membros){delete m.doenca;delete m.proximoAtendimento;delete m.proximaSaida;delete m.expedicao;}
    restaurarJogo(dados);clearInterval(loopId);assert(moradores()===9 && capacidadeBase()>=9 && S.base.barricadas===5,'Migração perdeu dados');
    assert(JSON.parse(snapshotJogo()).versao===2,'Não gravou versão nova');
  });
  teste('Save inválido de doença, construção ou pressão é rejeitado',()=>{
    for(const alterar of [e=>e.base.local='__proto__',e=>e.base.armadilhas=30,e=>e.base.instalacoes=['horta','horta'],e=>e.familia.membros[0].doenca={tipo:'inexistente',gravidade:20,ultimoAvanco:0,aviso:0}]){
      const dados=JSON.parse(snapshotJogo());alterar(dados.estado);let rejeitou=false;try{validarSave(dados);}catch{rejeitou=true;}assert(rejeitou,'Save inválido aceito');
    }
  });
  clearInterval(loopId);Math.random=randomOriginal;return resultados;
})()
