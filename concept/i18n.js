'use strict';
(() => {
 const dictionary=window.IBR_TRANSLATIONS||{};
 const normalize=s=>String(s).replace(/\s+/g,' ').trim();
 const stored=()=>{try{return localStorage.getItem('ibr-concept-language')}catch{return null}};
 let language=new URLSearchParams(location.search).get('lang')||stored()||'ru';
 if(!['ru','kk'].includes(language))language='ru';
 const textSources=new WeakMap(),attributeSources=new WeakMap();
 const attributes=['alt','aria-label','placeholder','title','content'];
 const ignore='script,style,svg,.language-switch,[data-no-translate]';
 function translate(value,depth=0){
  const text=normalize(value);if(language==='ru'||!text)return text;
  if(dictionary[text])return dictionary[text];
  if(/^(Дом|Баня) [SML]$/.test(text))return text.replace(/^Дом /,'Үй ').replace(/^Баня /,'Монша ');
  if(/^\d+ этап$/.test(text))return text.replace('этап','кезең');
  if(/^\d+ на выбор$/.test(text))return text.replace('на выбор','нұсқа');
  if(/^Вопрос \d+ из 5$/.test(text))return text.replace(/^Вопрос (\d+) из 5$/,'5 сұрақтың $1-сі');
  if(/^\d+ \/ \d+ ПРЕИМУЩЕСТВ$/.test(text))return text.replace('ПРЕИМУЩЕСТВ','АРТЫҚШЫЛЫҚ');
  if(/^\d+ \/ /.test(text))return text.replace(/^(\d+ \/ )(.*)$/,(_,n,label)=>n+translate(label,depth+1));
  if(/^Дом с фасадом /.test(text))return `Қасбет түсі: ${translate(text.slice(14),depth+1)}`;
  if(depth<4){
   const arrow=text.match(/^([←↑↗↻+−]\s*)?(.*?)(\s*[←↑↗↻+−])?$/);
   if(arrow&&(arrow[1]||arrow[3]))return `${arrow[1]||''}${translate(arrow[2],depth+1)}${arrow[3]||''}`;
   for(const separator of [' — ',' · ',': ',':',', вид сверху']){
    if(text.includes(separator))return text.split(separator).map(part=>translate(part,depth+1)).join(separator===', вид сверху'?', үстінен көрініс':separator);
   }
  }
  return text;
 }
 function updateText(node){
  if(!node.parentElement||node.parentElement.closest(ignore))return;
  const current=node.nodeValue;if(!current.trim())return;
  let saved=textSources.get(node);
  if(!saved||current!==saved.rendered)saved={source:current};
  let source=saved.source;
  if(node.parentElement.closest('h1,h2,h3,h4,h5,h6'))source=source.replace(/\.(\s*)$/,'$1');
  let result=source.replace(/\S(?:[\s\S]*\S)?/,value=>translate(value));
  if(language==='kk'&&node.parentElement.id==='construction-title'&&normalize(source)==='Технические преимущества')result='Үйдің техникалық';
  saved.rendered=result;textSources.set(node,saved);
  if(current!==result)node.nodeValue=result;
 }
 function updateAttributes(el){
  if(el.closest(ignore))return;
  let saved=attributeSources.get(el);if(!saved){saved={};attributeSources.set(el,saved);}
  attributes.forEach(name=>{
   if(!el.hasAttribute(name))return;
   const current=el.getAttribute(name);let entry=saved[name];
   if(!entry||current!==entry.rendered)entry={source:current};
   entry.rendered=translate(entry.source);saved[name]=entry;
   if(current!==entry.rendered)el.setAttribute(name,entry.rendered);
  });
 }
 function apply(root){
  if(root.nodeType===Node.TEXT_NODE){updateText(root);return;}
  if(root.nodeType!==Node.ELEMENT_NODE||root.matches(ignore))return;
  updateAttributes(root);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  while(walker.nextNode()){
   const node=walker.currentNode;if(node.nodeType===Node.TEXT_NODE)updateText(node);else updateAttributes(node);
  }
 }
 const observer=new MutationObserver(records=>{
  observer.disconnect();
  try{records.forEach(record=>{
   if(record.type==='characterData')updateText(record.target);
   else if(record.type==='attributes')updateAttributes(record.target);
   else record.addedNodes.forEach(apply);
  });}finally{observe();}
 });
 function observe(){observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});}
 function select(next,persist=true){
  if(!['ru','kk'].includes(next))return;
  language=next;observer.disconnect();document.documentElement.lang=next;
  document.querySelector('.language-switch')?.setAttribute('aria-label',next==='kk'?'Тілді таңдау':'Выбор языка');
  apply(document.body);apply(document.head);
  document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===next)));
  if(persist){
   try{localStorage.setItem('ibr-concept-language',next)}catch{}
   const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);
  }
  observe();dispatchEvent(new Event('ibr:language'));dispatchEvent(new Event('resize'));
 }
 window.IBRI18N={t:translate,get language(){return language},select};
 document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>select(button.dataset.language)));
  select(language,false);
 });
})();
