'use strict';
(()=>{
 const ns='http://www.w3.org/2000/svg';
 const paths={'↗':'M5 19 19 5M5 5h14v14','↘':'M5 5 19 19M5 19h14V5','→':'M4 12h16m-6-6 6 6-6 6'};
 function icon(path,kind='ui-arrow'){
  const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');svg.setAttribute('class',kind);
  const p=document.createElementNS(ns,'path');p.setAttribute('d',path);svg.append(p);return svg;
 }
 function decorate(root){
  if(root.nodeType===1&&root.closest('svg,script,style,textarea,option'))return;
  const nodes=[];
  if(root.nodeType===3)nodes.push(root);
  else{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(w.nextNode())nodes.push(w.currentNode);}
  for(const node of nodes){if(!/[↗↘→]/.test(node.data)||node.parentElement?.closest('svg,script,style,textarea,option'))continue;
   const fragment=document.createDocumentFragment();for(const part of node.data.split(/([↗↘→])/)){fragment.append(paths[part]?icon(paths[part]):document.createTextNode(part));}node.replaceWith(fragment);
  }
 }
 const technical=[
 'm3 8 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 18l9 5 9-5',
 'M10 5a2 2 0 0 1 4 0v9a5 5 0 1 1-4 0V5Zm2 4v9m6-12h3m-3 4h3',
 'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Zm-4 9 3 3 5-6',
 'M4 4h6v6H4V4Zm10 10h6v6h-6v-6ZM7 10v7h7m3-3V7h-7',
 'M3 12 12 4l9 8M6 10v10h12V10M10 20v-6h4v6',
 'M3 7h11v11H3V7Zm11 4h4l3 4v3h-7M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'
 ];
 document.querySelectorAll('.tech-feature-meta>span').forEach((e,i)=>e.replaceChildren(icon(technical[i%technical.length],'ui-tech-icon')));
 const clt={
  layers:technical[0],
  structure:'M3 5h18v4H3V5Zm0 10h18v4H3v-4ZM7 3v8m10-8v8M7 13v8m10-8v8',
  experience:technical[2],
  strength:technical[2],
  geometry:'M4 4h16v16H4V4Zm4 4h8v8H8V8ZM2 8V2h6m8 0h6v6M2 16v6h6m8 0h6v-6',
  speed:'M12 8v5l3 2M9 2h6m-3 0v3m7 0 2 2M21 13a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  precision:'m3 16 13-13 5 5L8 21l-5-5Zm10-10 3 3m-6 0 2 2m-5 1 3 3m-6 0 2 2',
  wood:'M20 3C9 2 3 7 4 14c1 5 6 7 10 4 5-3 6-9 6-15ZM3 21 15 9m-6 6v-5m0 5h5',
  comfort:technical[1]
 };
 document.querySelectorAll('[data-clt-icon]').forEach(el=>el.replaceChildren(icon(clt[el.dataset.cltIcon],'clt-icon')));
 decorate(document.body);
 new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1||n.nodeType===3)decorate(n);}).observe(document.body,{childList:true,subtree:true});
})();
