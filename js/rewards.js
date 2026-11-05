/* rewards.js — PROFIT 3.0 */

(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const STORAGE_KEY='profit_rewards_v34';
  const GOAL_KEY='profit_goal_mode_v33';
  const thresholds=[1,3,7,14,30];
  const milestones=[
    {days:1,title:'Primeiro passo',icon:'🌱',short:'1 dia'},
    {days:3,title:'Pegando ritmo',icon:'🔥',short:'3 dias'},
    {days:7,title:'Uma semana',icon:'🏆',short:'7 dias'},
    {days:14,title:'Constância',icon:'👑',short:'14 dias'},
    {days:30,title:'Marco PROFIT',icon:'💎',short:'30 dias'}
  ];
  const palettes={
    perder:[['#061b16','#0b6b4b','#d9b66d'],['#091522','#087e8b','#63e6be'],['#10101d','#5b2c83','#f6c6ea'],['#15211b','#7a5a24','#f6dc91']],
    ganhar:[['#080d2b','#244ed8','#7ce7ff'],['#1a092e','#7c2bd1','#ff79c8'],['#071c35','#006d9c','#a5f3fc']],
    manter:[['#13221b','#527d62','#e6d6a5'],['#1c2533','#607d8b','#d9e7e7'],['#31251d','#b47b56','#f8e5c3']]
  };
  const frases={
    perder:[
      'Constância é cuidar de mim, não me cobrar perfeição. 💚','Um passo consciente de cada vez. Minha jornada, meu ritmo. 🌱','Não preciso fazer tudo perfeito para continuar evoluindo. ✨','Meu foco é construir hábitos que façam sentido na vida real.','Hoje escolhi consistência, equilíbrio e cuidado comigo. 🏆','O progresso não precisa ser extremo para ser importante.','Menos cobrança, mais consciência. Estou no meu caminho. 💚','Meu objetivo é saúde e constância — não perfeição.','Tô cuidando de mim sem transformar comida em inimiga. 😌','O glow up começa no cuidado que ninguém vê. ✨','Pequenas escolhas, feitas com equilíbrio, também contam.','Não é sobre comer o mínimo. É sobre cuidar melhor de mim.'
    ],
    ganhar:[
      'Construindo minha evolução, uma refeição de cada vez. 💪','Meu progresso está sendo construído no dia a dia. 🔥','Mais consistência, mais cuidado, mais evolução.','Não é mágica: são hábitos repetidos com paciência. 🚀','Meu objetivo é crescer com equilíbrio e constância.','Cada etapa importa. Estou construindo a minha. 🏆','Um passo por refeição, um dia de cada vez.','Projeto evolução: em andamento. 💪✨','Comer o suficiente também é parte do cuidado. 💚','Minha jornada não precisa ser igual à de ninguém.','Consistência no prato, paciência no processo.','Sem atalhos malucos: evolução sustentável é a meta.'
    ],
    manter:[
      'Equilíbrio também é uma conquista. ⚖️','Cuidar de mim é um compromisso contínuo. 🌿','Não é sobre controlar tudo. É sobre encontrar equilíbrio.','Minha rotina, meu ritmo, minhas escolhas conscientes.','A constância mora nas pequenas decisões. ✨','O objetivo é uma vida que funcione, não uma planilha perfeita.','Equilíbrio não é perfeição. É voltar ao que me faz bem.','Continuo cuidando de mim sem precisar de extremos. 💚','Um dia de cada vez, sem drama e sem comparação.','Saúde também é flexibilidade. 🌱','Tô buscando equilíbrio, não uma vida sem pizza. 🍕😅','Manter o ritmo também merece comemoração.'
    ],
    humor:[
      'Meu planejamento e eu estamos finalmente conversando. 😂','Hoje teve organização. Quem é essa pessoa e o que fez com meu eu antigo? 😅','O plot twist foi eu realmente registrar as refeições. 📱','Uma conquista de cada vez, porque virar outra pessoa até sexta é complicado. 😂','O importante é seguir. O glamour a gente coloca no Story. ✨','A consistência veio. Agora só falta ela pagar um boleto. 😭😂','POV: você cuidando de si sem fazer disso uma novela mexicana. 🎬','Hoje eu e minhas metas estamos em bons termos. 🤝','Não foi sorte, foi rotina. E um pouquinho de teimosia. 😎','Status: cuidando de mim e tentando não complicar o simples. 💚','A meta foi acompanhada. A autoestima abriu o aplicativo também. 😂','Não sou influencer fitness, mas olha esse desenvolvimento de personagem. 🔥'
    ]
  };
  const backgroundNames=['Esmeralda','Aurora azul','Neon violeta','Dourado premium','Oceano elétrico','Coral vibrante','Sálvia minimalista','Cosmos','Pôr do sol','Noite de gala'];
  let state={validDays:[],unlocked:[],claimed:[],seenMessages:[],lastBg:-1,lastMilestone:1};
  let selectedMilestone=1, currentMessage='', currentBg=0;
  try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');state=Object.assign(state,saved||{});}catch(e){}
  ['validDays','unlocked','claimed','seenMessages'].forEach(k=>{if(!Array.isArray(state[k]))state[k]=[];});
  function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){toast('Não foi possível salvar as conquistas. Verifique o espaço disponível no aparelho.');}}
  function dateToday(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function safeItems(date){try{return typeof historico!=='undefined'&&Array.isArray(historico[date])?historico[date]:[];}catch(e){return [];}}
  function getGoal(){let target=Number($('meta')?.value||localStorage.getItem('nutri_meta')||0);let mode=localStorage.getItem(GOAL_KEY)||'perder';if(!['perder','ganhar','manter'].includes(mode))mode='perder';return {target,mode};}
  function evaluate(date){
    const {target}=getGoal();const items=safeItems(date);
    if(!target||target<=0||items.length<3)return false;
    const meals=new Set(items.map(i=>i.refeicao).filter(Boolean));if(meals.size<2)return false;
    const kcal=items.reduce((sum,i)=>sum+Math.max(0,Number(i.kcal)||0),0);
    if(kcal<=0)return false;
    return kcal>=target*.9-0.001&&kcal<=target*1.1+0.001;
  }
  function validCount(){return Array.isArray(state.validDays)?state.validDays.length:0;}
  function unlockedDays(){return Array.isArray(state.unlocked)?state.unlocked:[];}
  function refresh(){
    const allDates=typeof historico!=='undefined'?Object.keys(historico).sort():[];
    // Preserve existing accumulated progress; update today's entry only. Older saved days are not re-scored if already recorded.
    const today=dateToday();const idx=state.validDays.indexOf(today);const validToday=evaluate(today);
    if(validToday&&idx<0)state.validDays.push(today);
    if(!validToday&&idx>=0)state.validDays.splice(idx,1);
    state.validDays=[...new Set(state.validDays)].sort();
    const count=validCount();
    // First-time setup: existing history is evaluated once so users don't lose prior effort.
    if(!state.initialized){
      const existing=allDates.filter(d=>evaluate(d));
      state.validDays=[...new Set([...state.validDays,...existing])].sort();
      const historicalCount=validCount();
      state.unlocked=thresholds.filter(n=>historicalCount>=n);
      state.initialized=true;
    }else{
      const n=validCount();thresholds.forEach(t=>{if(n>=t&&!state.unlocked.includes(t))state.unlocked.push(t);});
    }
    state.unlocked.sort((a,b)=>a-b);persist();renderRewards();
  }
  function renderRewards(){
    const count=validCount(),next=thresholds.find(n=>n>count);
    const label=$('rewardProgressLabel'),nextLabel=$('rewardNextLabel'),fill=$('rewardProgressFill'),steps=$('rewardMilestones'),status=$('rewardStatus'),open=$('rewardOpenBtn');
    if(label)label.textContent=count+' '+(count===1?'dia válido acumulado':'dias válidos acumulados');
    if(nextLabel)nextLabel.textContent=next?'Próxima: '+next+' dias':'Todas as metas alcançadas!';
    const previous=thresholds.filter(n=>n<=count).pop()||0;const goal=next||30;const pct=next?Math.max(0,Math.min(100,(count-previous)/(goal-previous||1)*100)):100;
    if(fill)fill.style.width=pct+'%';
    if(steps)steps.innerHTML=milestones.map(m=>{const unlocked=state.unlocked.includes(m.days),claimed=state.claimed.includes(m.days);return '<div class="reward-step '+(unlocked?'unlocked ':'')+(claimed?'claimed':'')+'"><span class="step-icon">'+(claimed?'✅':m.icon)+'</span><strong>'+m.short+'</strong><small>'+(claimed?'Resgatada':unlocked?'Desbloqueada':m.title)+'</small></div>';}).join('');
    if(status){status.className='rewards-status'+(state.unlocked.some(n=>!state.claimed.includes(n))?' good':'');const ready=state.unlocked.filter(n=>!state.claimed.includes(n));status.textContent=ready.length?'🎉 Você tem '+ready.length+' '+(ready.length===1?'recompensa disponível':'recompensas disponíveis')+'! Gere seu Story e compartilhe quando quiser.':next?'Seu próximo marco é '+next+' dias válidos acumulados. Cada dia precisa de registros suficientes e consumo dentro de ±10%.':'Você já desbloqueou todos os marcos atuais. Continue registrando seu progresso!';}
    if(open){const ready=state.unlocked.some(n=>!state.claimed.includes(n));open.disabled=!state.unlocked.length;open.textContent=ready?'🎁 Abrir minhas recompensas':'🖼️ Ver minhas conquistas';}
  }
  function chooseMessage(mode){
    const pool=(frases[mode]||frases.manter).concat(frases.humor);
    const recent=Array.isArray(state.seenMessages)?state.seenMessages:[];
    let options=pool.filter(t=>!recent.includes(t));if(!options.length){state.seenMessages=[];options=pool.slice();}
    const msg=options[Math.floor(Math.random()*options.length)];state.seenMessages.push(msg);state.seenMessages=state.seenMessages.slice(-35);persist();return msg;
  }
  function palette(){const mode=getGoal().mode;return palettes[mode]||palettes.manter;}
  function drawStory(){
    const canvas=$('profitStoryCanvas');if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
    const W=1080,H=1920;const pal=palette()[currentBg%palette().length];
    const allPalettes=[...palettes.perder,...palettes.ganhar,...palettes.manter];const colors=allPalettes[currentBg%allPalettes.length]||pal;
    const bgSet=[
      ['#041b16','#0b7655','#e4c77b'],['#06152e','#087ca7','#85efff'],['#180b2e','#6c2db7','#ff75c8'],['#191715','#9b6b28','#f7df9a'],['#031d36','#047fa2','#73e4ff'],['#32112a','#e34d74','#ffcf91'],['#18261f','#789b78','#f0e7c5'],['#090c22','#343a9a','#b9a2ff'],['#35172b','#d75e48','#ffd18c'],['#080b13','#343c4c','#e8c878']
    ];const c=bgSet[currentBg%bgSet.length];
    const grad=ctx.createLinearGradient(0,0,W,H);grad.addColorStop(0,c[0]);grad.addColorStop(.52,c[1]);grad.addColorStop(1,c[2]);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
    // 10 distinct built-in artwork compositions, generated locally without network assets.
    ctx.save();ctx.globalAlpha=.26;
    for(let i=0;i<12;i++){
      const x=((i*173+currentBg*83)%1300)-110,y=((i*257+currentBg*131)%2100)-90,r=70+(i*37)%190;
      const rg=ctx.createRadialGradient(x,y,2,x,y,r);rg.addColorStop(0,c[2]+'aa');rg.addColorStop(1,c[2]+'00');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=.20;ctx.strokeStyle=c[2];ctx.lineWidth=3;
    if(currentBg%10===0||currentBg%10===3){for(let i=0;i<18;i++){ctx.beginPath();ctx.arc(W*.5,H*.34,120+i*32,Math.PI*.12,Math.PI*1.88);ctx.stroke();}}
    else if(currentBg%10===1||currentBg%10===4){for(let i=0;i<16;i++){ctx.beginPath();ctx.moveTo(-80,i*150+currentBg*11);ctx.bezierCurveTo(300,i*150-90,700,i*150+120,1160,i*150-30);ctx.stroke();}}
    else if(currentBg%10===2||currentBg%10===7){for(let i=0;i<35;i++){let x=(i*137)%W,y=(i*283)%H;ctx.beginPath();ctx.arc(x,y,2+(i%5)*2,0,Math.PI*2);ctx.fillStyle=c[2];ctx.fill();}}
    else if(currentBg%10===5||currentBg%10===8){for(let i=0;i<8;i++){ctx.beginPath();ctx.ellipse(W*.5,H*.5,160+i*68,360+i*72,i*.18,0,Math.PI*2);ctx.stroke();}}
    else {for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(i*100-100,0);ctx.lineTo(i*100+500,H);ctx.stroke();}}
    ctx.restore();
    const overlay=ctx.createLinearGradient(0,0,0,H);overlay.addColorStop(0,'#00000077');overlay.addColorStop(.3,'#00000022');overlay.addColorStop(.66,'#00000044');overlay.addColorStop(1,'#000000aa');ctx.fillStyle=overlay;ctx.fillRect(0,0,W,H);
    // frame + header
    ctx.strokeStyle=c[2]+'cc';ctx.lineWidth=3;ctx.strokeRect(48,48,W-96,H-96);
    ctx.textAlign='center';ctx.fillStyle='#ffffff';ctx.font='700 46px Arial';ctx.fillText('PROFIT',W/2,145);
    ctx.fillStyle=c[2];ctx.font='700 23px Arial';ctx.letterSpacing='7px';ctx.fillText('MINHA JORNADA • MINHA CONQUISTA',W/2,198);ctx.letterSpacing='0px';
    const m=milestones.find(x=>x.days===selectedMilestone)||milestones[0];
    ctx.fillStyle=c[2];ctx.font='110px Arial';ctx.fillText(m.icon,W/2,475);
    ctx.fillStyle='#ffffff';ctx.font='700 72px Arial';wrapText(ctx,m.days+' '+(m.days===1?'DIA DE EVOLUÇÃO':'DIAS DE EVOLUÇÃO'),W/2,590,900,90);
    ctx.fillStyle=c[2];ctx.fillRect(270,715,540,5);
    ctx.fillStyle='#ffffff';ctx.font='500 47px Arial';wrapText(ctx,currentMessage,W/2,835,830,68);
    ctx.fillStyle='#ffffffdd';ctx.font='500 30px Arial';ctx.fillText(getGoal().mode==='perder'?'FOCO • EQUILÍBRIO • CONSTÂNCIA':getGoal().mode==='ganhar'?'NUTRIÇÃO • FORÇA • CONSTÂNCIA':'EQUILÍBRIO • CUIDADO • CONSTÂNCIA',W/2,1420);
    ctx.fillStyle=c[2];ctx.font='700 30px Arial';ctx.fillText('UM DIA DE CADA VEZ.',W/2,1510);
    ctx.fillStyle='#ffffffaa';ctx.font='500 26px Arial';ctx.fillText('MEU PROGRESSO NÃO PRECISA SER PERFEITO.',W/2,1590);
    ctx.fillStyle='#ffffff';ctx.font='700 34px Arial';ctx.fillText('PROFIT  ·  CUIDE DO SEU PROCESSO',W/2,1740);
    ctx.fillStyle='#ffffff99';ctx.font='22px Arial';ctx.fillText('Compartilhe sua conquista do seu jeito.',W/2,1790);
  }
  function wrapText(ctx,text,x,y,maxWidth,lineHeight){
    const words=String(text||'').split(/\s+/);let line='',lines=[];
    words.forEach(word=>{const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;});if(line)lines.push(line);
    const start=y-((lines.length-1)*lineHeight)/2;lines.forEach((l,i)=>ctx.fillText(l,x,start+i*lineHeight));
  }
  function renderRewardChoices(){
    const row=$('rewardSelectRow');if(!row)return;const unlocked=state.unlocked.length?state.unlocked:thresholds.filter(n=>n<=validCount());
    row.innerHTML=unlocked.map(n=>{const m=milestones.find(x=>x.days===n);return '<button type="button" class="reward-select '+(n===selectedMilestone?'active':'')+'" data-reward-milestone="'+n+'">'+m.icon+' '+n+' dia'+(n===1?'':'s')+(state.claimed.includes(n)?' ✓':'')+'</button>';}).join('');
    row.querySelectorAll('[data-reward-milestone]').forEach(b=>b.addEventListener('click',()=>{selectedMilestone=Number(b.dataset.rewardMilestone);currentMessage=chooseMessage(getGoal().mode);currentBg=(currentBg+1)%10;renderRewardChoices();drawStory();}));
  }
  function openRewards(){
    if(!state.unlocked.length){toast('Continue registrando seus dias para desbloquear uma conquista.');return;}
    const ready=state.unlocked.filter(n=>!state.claimed.includes(n));selectedMilestone=ready[0]||state.unlocked[state.unlocked.length-1];
    currentMessage=chooseMessage(getGoal().mode);currentBg=(currentBg+1)%10;
    renderRewardChoices();drawStory();$('profitRewardModal').classList.add('open');document.body.style.overflow='hidden';
    const m=milestones.find(x=>x.days===selectedMilestone);$('rewardModalSub').textContent=m.title+' · '+selectedMilestone+' dia'+(selectedMilestone===1?'':'s')+' válidos acumulados';
  }
  function closeRewards(){$('profitRewardModal').classList.remove('open');document.body.style.overflow='';}
  function markClaimed(){if(!state.claimed.includes(selectedMilestone))state.claimed.push(selectedMilestone);persist();renderRewards();renderRewardChoices();}
  function storyBlob(){return new Promise(resolve=>$('profitStoryCanvas').toBlob(resolve,'image/png',1));}
  async function saveStory(){const blob=await storyBlob();if(!blob){toast('Não foi possível gerar a imagem neste navegador.');return;}const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='PROFIT-conquista-'+selectedMilestone+'-dias.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);markClaimed();toast('Story salvo! Agora é só publicar. 🎉');}
  async function shareStory(){const blob=await storyBlob();if(!blob){toast('Não foi possível gerar a imagem neste navegador.');return;}try{if(typeof File==='function'){const file=new File([blob],'PROFIT-conquista-'+selectedMilestone+'-dias.png',{type:'image/png'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){try{await navigator.share({files:[file],title:'Minha conquista PROFIT',text:'Mais um passo na minha jornada! 💚'});markClaimed();toast('Conquista pronta para compartilhar!');return;}catch(e){if(e&&e.name==='AbortError')return;}}}}catch(e){}
    await saveStory();toast('O compartilhamento direto não está disponível aqui; a imagem foi salva para você publicar.');}
  $('rewardOpenBtn')?.addEventListener('click',openRewards);
  $('rewardCloseBtn')?.addEventListener('click',closeRewards);
  $('profitRewardModal')?.addEventListener('click',e=>{if(e.target===$('profitRewardModal'))closeRewards();});
  $('rewardNewMessageBtn')?.addEventListener('click',()=>{currentMessage=chooseMessage(getGoal().mode);drawStory();});
  $('rewardNewBackgroundBtn')?.addEventListener('click',()=>{currentBg=(currentBg+1)%10;drawStory();});
  $('rewardSaveBtn')?.addEventListener('click',saveStory);
  $('rewardShareBtn')?.addEventListener('click',shareStory);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('profitRewardModal')?.classList.contains('open'))closeRewards();});
  // Expose refresh only to the app's existing update flow; no global namespace replacement.
  window.profitRefreshRewards=refresh;
  const originalUpdate=window.atualizarTudo;
  if(typeof originalUpdate==='function')window.atualizarTudo=function(){const result=originalUpdate.apply(this,arguments);setTimeout(refresh,30);return result;};
  const originalSave=window.salvarStorage;
  if(typeof originalSave==='function')window.salvarStorage=function(){const result=originalSave.apply(this,arguments);setTimeout(refresh,30);return result;};
  $('meta')?.addEventListener('change',()=>setTimeout(refresh,50));
  $('salvarMetaKcalBtn')?.addEventListener('click',()=>setTimeout(refresh,100));
  document.querySelectorAll('[data-goal-mode]').forEach(b=>b.addEventListener('click',()=>setTimeout(refresh,80)));
  refresh();
})();
