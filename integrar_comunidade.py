from pathlib import Path
import re
p=Path('deepseek_html_20260912_271fcb.html')
s=p.read_text(encoding='utf-8')
backup=Path('save/antes-da-expansao-base.html.bak')
if not backup.exists():backup.write_text(s,encoding='utf-8')
def troca(a,b):
    global s
    if a not in s:raise ValueError(a[:100])
    s=s.replace(a,b)
def func(nome,novo):
    global s
    s,n=re.subn(r'function '+nome+r'\([^\n]*\)\{.*?^\}',lambda _:novo.strip(),s,count=1,flags=re.S|re.M)
    if n!=1:raise ValueError(nome)

troca('</body>','<script src="assets/muro/config.js"></script>\n<script src="js/comunidade.js"></script>\n</body>')
troca('</style>','''
.visorMuro{display:block;width:100%;padding:0;border:1px solid var(--borda);border-radius:6px;overflow:hidden;background:#080d0a;color:var(--txt);cursor:pointer;margin:10px 0;text-align:left}
.visorMuro img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
.visorMuro span{display:block;padding:7px 9px;font-size:11px;line-height:1.5}
.baseComandos{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}
.baseComandos button{padding:8px 5px;border:1px solid var(--borda);border-radius:4px;background:var(--painel2);color:var(--txt);cursor:pointer;font:inherit;font-size:11px}
.saudeRuim{color:#df895d}.catalogoBase{border-top:1px solid var(--borda);padding-top:10px}.catalogoBase p{font-size:12px;line-height:1.6}
.notaBase{font-size:11px;color:var(--txt2);line-height:1.5;margin:8px 0}
</style>''')
troca("const LIMITE_GRUPO = 8;",'// A capacidade agora depende do abrigo e do alojamento construído.')
func('haVaga','''function haVaga(){
  let capacidade=capacidadeBase();
  if(S.acao?.tipo==='mudarBase') capacidade=Math.min(capacidade,LOCAIS_BASE[S.acao.destino].capacidade);
  return moradores()+(S.familia.gravidez?1:0)<capacidade;
}''')
troca("    rotina:'guarda',\n    emTurno:true,", "    rotina:'guarda',\n    doenca:null,expedicao:null,proximaSaida:S.tempoTotal,proximoAtendimento:0,\n    emTurno:true,")
troca("    base:{ barricadas:2, ameaca:8, moral:b.moral },", "    base:criarBase('casa',{moral:b.moral}),\n    comunidade:{ultimoDiaDoenca:1,ultimoEvento:0},")
troca('Encontrou um sobrado com portas reforçadas. É o mais perto de "casa" que existe agora.', 'Encontrou uma casa cercada: quatro lugares e três espaços para instalações. É o começo da comunidade.')
troca("      { texto:'", "      { texto:'")
troca("  masculino:[", "  masculino:[\n    { especialidade:'Scavenger', skills:{forca:3,agilidade:5,inteligencia:4,carisma:2,resistencia:4} },\n    { especialidade:'Médico', skills:{forca:2,agilidade:3,inteligencia:5,carisma:4,resistencia:3} },\n    { especialidade:'Agricultor', skills:{forca:3,agilidade:3,inteligencia:3,carisma:2,resistencia:5} },")
troca("  feminino:[", "  feminino:[\n    { especialidade:'Scavenger', skills:{forca:3,agilidade:5,inteligencia:4,carisma:2,resistencia:4} },\n    { especialidade:'Mecânica', skills:{forca:4,agilidade:3,inteligencia:5,carisma:2,resistencia:3} },\n    { especialidade:'Agricultora', skills:{forca:3,agilidade:3,inteligencia:3,carisma:2,resistencia:5} },")
func('tick','''function tick(){
  if(!S || !verificarEstado() || S.pausado || !S.acao) return;
  S.tempoTotal+=20;
  const p=S.player;
  const dia=Math.floor(S.tempoTotal/1440)+1;
  if(dia!==S.dia){
    S.dia=dia;construirAcoes();rotacionarGuardas();
    log(`— DIA ${S.dia} —`,'sistema');incidenciaDoencas();
    if(Math.random()<.25)agendarEvento(400);
  }
  atualizarScavengers();atualizarMedicos();evoluirDoencas();
  if(!S.vivo)return;
  atualizarPressao();
  p.fome=clamp(p.fome+.28,0,100);p.sede=clamp(p.sede+.4,0,100);
  if(p.fome>=70 || p.sede>=70)p.vida-=.7;
  else if(p.fome<30 && p.sede<30 && p.vida<p.vidaMax)p.vida+=.28;
  if(!verificarEstado())return;
  if(S.tempoTotal>=S.proxRefeicao){
    while(S.tempoTotal>=S.proxRefeicao)S.proxRefeicao+=1440;
    consumoBaseDiario();
  }
  sincronizarEstado();
  if(S.familia.gravidez)atualizarGestacao();
  if(!S.pausado)tentarEventoDuranteAcao();
  if(S.pausado){render();return;}
  if(S.acao && S.tempoTotal>=S.acao.fim)resolverAcao();
  if(!verificarEstado())return;
  if(!S.pausado && S.base.ameaca>=100 && S.tempoTotal>=S.base.proximaHorda)ataqueHorda();
  if(!verificarEstado())return;
  render();
}''')
troca("  let pc=0, pa=0, pm=0;", "  let pc=temInstalacao('horta')?2:0, pa=temInstalacao('cisterna')?3:0, pm=temInstalacao('oficina') && !emSilencio()?1:0;")
troca("    if(s.tarefa === 'coletor'){ pc += 1; pa += 1; }\n    else if(s.tarefa === 'oficina'){ pm += 1.5; }", "    if(!aptoTrabalho(s))return;\n    if(s.tarefa==='coletor')pa+=2;\n    if(s.tarefa==='agricultor' && temInstalacao('horta'))pc+=3+(/Agricultor/.test(s.especialidade)?1:0);\n    if(s.tarefa==='oficina' && temInstalacao('oficina') && !emSilencio())pm+=3+(/Mecân/.test(s.especialidade)?1:0);")
troca("  { id:'ajudar',", "  { id:'construcoes',nome:'Construções e abrigos',desc:'Instalações, espaços e mudança de base' },\n  { id:'muro',nome:'Observar o muro',desc:'Ver a rua e planejar a redução de ameaça' },\n  { id:'saude',nome:'Saúde da comunidade',desc:'Doenças, ferimentos e tratamento' },\n  { id:'ajudar',")
troca("  if(idade < 12) return ACOES.filter(a=>['comer','beber','descansar','familia','ajudar'].includes(a.id));", "  if(idade < 12) return ACOES.filter(a=>['comer','beber','descansar','familia','ajudar','saude'].includes(a.id));")
troca("  if(id === 'comer')", "  if(id === 'construcoes')return abrirConstrucoes();\n  if(id === 'muro')return abrirMuro();\n  if(id === 'saude')return abrirSaude();\n  if(id === 'comer')")
troca("    case 'gerador': resolverGerador(); break;", "    case 'gerador': resolverGerador(); break;\n    case 'construir': resolverConstrucao(a); break;\n    case 'procurarBase': resolverBuscaBase(); break;\n    case 'mudarBase': resolverMudanca(a); break;\n    case 'planoMuro': resolverPlanoMuro(a); break;\n    case 'tratarDoenca': resolverTratamento(a); break;")
troca("  S.base.ameaca += 8;\n  S.acao = {tipo:'gerador'", "  S.base.ameaca=clamp(S.base.ameaca+8,0,100);\n  S.base.geradorAte=S.tempoTotal+360;\n  S.acao = {tipo:'gerador'")
troca("  S.base.moral = clamp(S.base.moral+5,0,100);\n  S.player.energia = clamp(S.player.energia+10,0,100);", "  S.base.moral = clamp(S.base.moral+(temInstalacao('gerador')?10:5),0,100);\n  S.player.energia = clamp(S.player.energia+(temInstalacao('gerador')?20:10),0,100);")
troca('  let d = S.base.barricadas * 2.5;', "  let d = S.base.barricadas * 2.5 + (temInstalacao('torre')?8:0);")
troca("  S.sobreviventes.filter(s=>s.vivo).forEach(s=>{\n    d +=", "  S.sobreviventes.filter(s=>aptoTrabalho(s)).forEach(s=>{\n    d +=")
troca('  const n = Math.round(4 + Math.sqrt(S.dia)*2.5 + rnd(0,5));', "  const n = Math.max(4,Math.round(zumbisFora()*.6));\n  S.base.proximaHorda=S.tempoTotal+720;")
troca("  const p = S.player;\n\n  if(defesa >= poder){", "  const p = S.player;\n  S.base.ameaca=clamp(S.base.ameaca-(defesa>=poder?65:40),0,100);\n\n  if(defesa >= poder){")
troca("    const vivos = S.sobreviventes.filter(s=>s.vivo);\n    if(vivos.length && Math.random() < 0.65)", "    const vivos = S.sobreviventes.filter(naBase);\n    if(vivos.length && Math.random() < 0.65)")
func('ciclarTarefa', '''function ciclarTarefa(i){ abrirFuncoes(i); }''')
func('alternarRotina', '''function alternarRotina(i){ abrirFuncoes(i); }''')
troca("const ROTULOS_TAREFA = { guarda:'Guarda', coletor:'Coletor', oficina:'Oficina', ocioso:'Sem função' };", "const ROTULOS_TAREFA = {guarda:'Guarda',scavenger:'Scavenger',medico:'Médico',agricultor:'Agricultor',oficina:'Mecânico',coletor:'Coletor de água',ocioso:'Sem função'};")
troca("const grupos = ['guarda','coletor','oficina','ocioso'].map", 'const grupos = Object.keys(ROTULOS_TAREFA).map')
troca("${s.emTurno ? 'em turno' : 'folga'} · ânimo ${Math.round(s.moral ?? 70)}", "${situacaoNPC(s)} · ânimo ${Math.round(s.moral ?? 70)}")
troca("opcoes.push({texto:'Alterar rotina',fn:()=>alternarRotina(i)});", "if(pessoa.doenca)opcoes.push({texto:'Tratar doença · 1 remédio · 1h',fn:()=>iniciarTratamento(pessoa.id)});\n  opcoes.push({texto:'Escolher função',fn:()=>abrirFuncoes(i)});")
troca('<p>Ânimo: <b>${Math.round(pessoa.moral ?? 70)}</b> · Rotina: <b>${ROTULOS_TAREFA[pessoa.tarefa]}</b></p>', '<p>Ânimo: <b>${Math.round(pessoa.moral ?? 70)}</b> · Função: <b>${ROTULOS_TAREFA[pessoa.tarefa]}</b><br>${situacaoNPC(pessoa)}</p>')
troca("  if(tipo === 'bebe') return tentarBebeComPessoa(pessoa);", "  if(!naBase(pessoa)){log('Essa pessoa está fora da base. Espere ela voltar.','info');return;}\n  if(tipo === 'bebe') return tentarBebeComPessoa(pessoa);")
troca("  if(!pessoa || !pessoa.vivo) return;\n  const rel = pessoa.relacao", "  if(!pessoa || !pessoa.vivo) return;\n  const rel = pessoa.relacao")
troca("  if(S.familia.gravidez) return 'Já há uma gestação em andamento.';", "  if(!naBase(pessoa) || pessoa.doenca || atual.doenca) return 'Os dois parceiros precisam estar saudáveis e na base.';\n  if(S.familia.gravidez) return 'Já há uma gestação em andamento.';")
troca("  if(/Caçador|Batedor/.test", "  if(/Caçador|Batedor|Scavenger/.test")
troca("  const guardas = S.sobreviventes.filter(s=>s.vivo && s.tarefa === 'guarda');", "  const guardas = S.sobreviventes.filter(s=>aptoTrabalho(s) && s.tarefa === 'guarda');")
troca('  const evs = [evSobrevivente, evComerciante, evManada, evDoenca, evSaqueadores, evBriga, evAjudaMedica, evGuardaCansado];', "  const evs = [evSobrevivente, evComerciante, evManada, evDoenca, evBriga, evAjudaMedica, evGuardaCansado];\n  for(let i=0;i<Math.floor(S.base.atencaoHumana/25);i++)evs.push(evSaqueadores);")
func('evDoenca','''function evDoenca(){
  const pessoa=pick(S.familia.membros.filter(m=>naBase(m) && !m.doenca));
  if(!pessoa)return;
  adoecer(pessoa,pessoa.ferido?'infeccao':'febre');
  abrirModal('Alguém adoeceu',`${esc(pessoa.nome)} precisa de cuidados. Designe um médico e mantenha remédios no estoque, ou faça o atendimento pela tela de saúde.`,[{texto:'Entendido',fn:()=>{}}]);
}''')
troca("      verificarEstado();\n      if(!modalAtivo && filaModais.length)", "      verificarEstado();\n      retomarAcaoVencida();\n      verificarEstado();\n      if(!modalAtivo && filaModais.length)")
# Mantém ameaças e saves dentro da escala visual, mesmo após eventos grandes.
troca('  S.base.moral = clamp(S.base.moral,0,100);', '  S.base.moral = clamp(S.base.moral,0,100);\n  S.base.ameaca = clamp(S.base.ameaca,0,100);')
troca('    <div class="statLinha"><span>Experiência</span><b>${p.experiencia || 0}</b></div>', '    <div class="notaBase">${membroAtual?.doenca ? situacaoNPC(membroAtual) : \'Saudável\'}</div>\n    <div class="statLinha"><span>Experiência</span><b>${p.experiencia || 0}</b></div>')
func('renderBase','''function renderBase(){
  const el=document.getElementById('painelBase');
  if(!document.getElementById('dadosBase'))el.innerHTML=`
    <h3>Base e arredores</h3><div id="dadosBase"></div>
    <div class="statLinha"><span>☠ Ameaça</span><b id="porcentagemMuro"></b></div>
    <div class="barraMini"><div id="barraMuro"></div></div>
    <button class="visorMuro" onclick="abrirMuro()" aria-label="Observar o muro e planejar a defesa"><img id="imagemMuro" alt="Arredores da base"><span id="legendaMuro"></span></button>
    <div id="ruidoBase" class="notaBase"></div>
    <div class="baseComandos"><button onclick="abrirConstrucoes()">Construir</button><button onclick="abrirLocaisBase()">Novos abrigos</button><button onclick="abrirMuro()">Planos do muro</button><button onclick="abrirSaude()">Saúde</button></div>`;
  const local=LOCAIS_BASE[S.base.local],faixa=faixaMuro(),ruido=barulhoBase();
  document.getElementById('dadosBase').innerHTML=`<p class="notaBase"><b>${local.nome}</b> · ${S.base.instalacoes.length}/${local.slots} instalações</p>
    <div class="statLinha"><span>🧱 Barricadas</span><b>${S.base.barricadas}</b></div>
    <div class="statLinha"><span>🛡 Defesa</span><b>${Math.round(calcularDefesa())}</b></div>
    <div class="statLinha"><span>👥 Moradores</span><b>${moradores()}/${capacidadeBase()}</b></div>
    <div class="statLinha"><span>🎭 Moral</span><b>${Math.round(S.base.moral)}</b></div>`;
  document.getElementById('porcentagemMuro').textContent=Math.round(S.base.ameaca)+'%';
  const barra=document.getElementById('barraMuro');barra.style.width=S.base.ameaca+'%';barra.style.background=faixa.cor;
  document.getElementById('legendaMuro').textContent=`${faixa.nome} · cerca de ${zumbisFora()} zumbis. Clique para observar.`;
  document.getElementById('ruidoBase').textContent=`Ruído: ${ruido.total.toFixed(1)} · ameaça ${ruido.porHora>=0?'+':''}${ruido.porHora.toFixed(1)}/h${emSilencio()?' · silêncio ativo':''}`;
  atualizarImagemMuro();
}''')
func('renderSobreviventes','''function renderSobreviventes(){
  const vivos=S.sobreviventes.filter(s=>s.vivo);
  document.getElementById('painelSobreviventes').innerHTML=`<div class="painelResumoAcao"><h3>Grupo (${vivos.length})</h3><button class="botaoVisualizar" onclick="abrirGrupo()">Visualizar</button></div>
    <div class="statLinha"><span>Em guarda</span><b>${vivos.filter(s=>s.tarefa==='guarda' && s.emTurno && aptoTrabalho(s)).length}</b></div>
    <div class="statLinha"><span>Scavengers fora</span><b>${vivos.filter(s=>s.expedicao).length}</b></div>
    <div class="statLinha"><span>Médicos disponíveis</span><b>${vivos.filter(s=>s.tarefa==='medico' && aptoTrabalho(s)).length}</b></div>
    <div class="statLinha"><span>Doentes</span><b>${S.familia.membros.filter(s=>s.vivo && s.doenca).length}</b></div>`;
}''')
# Migração automática: mantém saves antigos, mas grava o novo formato.
troca('JSON.stringify({versao:1,estado:S})','JSON.stringify({versao:2,estado:S})')
troca("  if(dados?.versao !== 1 || !e ||", "  if(![1,2].includes(dados?.versao) || !e ||")
troca("  if(e.familia.membros.length > 10000", "  if(dados.versao===1)migrarComunidade(e);\n  validarComunidade(e);\n  if(e.familia.membros.length > 10000")
troca("!['guarda','coletor','oficina','ocioso'].includes(m.tarefa)", '!Object.keys(FUNCOES_NPC).includes(m.tarefa)')
troca("grupo.filter(m=>m.vivo).length + (e.familia.gravidez ? 1 : 0) > LIMITE_GRUPO", "1+grupo.filter(m=>m.vivo).length + (e.familia.gravidez ? 1 : 0) > capacidadeBase(e)")
troca("'interacao','bebe','gerador'].includes(e.acao.tipo)", "'interacao','bebe','gerador','construir','procurarBase','mudarBase','planoMuro','tratarDoenca'].includes(e.acao.tipo)")
p.write_text(s,encoding='utf-8')
print('Expansão integrada.')
