function palette(name,description,ink,paper,card,muted,line,lime,soft,soft2,accent,dark=false){return {name,description,dark,colors:{ink,paper,card,muted,line,lime,soft,'soft-2':soft2,accent,'on-primary':dark?'#221c32':'#fffef9','primary-hover':dark?'#d6c0f3':ink,'error-bg':dark?'#482731':'#f7e9df','error-text':dark?'#ffc6c6':'#823d2a',red:dark?'#ffb3ba':'#9d3434','chart-1':ink,'chart-2':dark?'#b7a0ef':accent,'chart-3':dark?'#7ec6dc':'#507f98','chart-4':dark?'#f1b57c':'#b26c32','chart-5':dark?'#f29fcd':'#856b9e','chart-6':dark?'#8fd2b1':'#b35970','chart-7':dark?'#e2d198':'#547854'}};}
export const THEMES={
 wald:palette('Wald & Salbei','Ruhig, natürlich, draußen.','#153d37','#f5f4ed','#fffef9','#65746b','#e1e4d9','#e6efb7','#eaeedf','#e5efec','#738a3c'),
 lavendel:palette('Lavendel','Lila mit sanften Fliedertönen.','#542b78','#f3eefb','#fffcff','#776183','#dfd2ed','#dec4ff','#e9ddf6','#eee1f7','#8a52b1'),
 ozean:palette('Ozean','Tiefblau und frische Eisfarben.','#163f63','#edf5fc','#fbfdff','#567086','#cbdde9','#bce9ef','#dcebf7','#d3e7ed','#2e7e98'),
 abendrot:palette('Abendrot','Warme Terrakotta und Pfirsich.','#733a2e','#fff1e9','#fffcf7','#8c6559','#edd4c7','#ffd1a7','#fbe0d2','#ffe8c8','#ad623b'),
 rosenquarz:palette('Rosenquarz','Rosé, Beere und viel Leichtigkeit.','#763d5b','#fbf0f6','#fffcfe','#91667b','#ebd1df','#ffd0e6','#f5dce8','#f1e0ec','#b25786'),
 mitternacht:palette('Mitternacht','Dunkles Violett mit leuchtenden Akzenten.','#eee4ff','#161223','#221c32','#b3a4c8','#40344f','#c4a8ff','#30263f','#312c49','#c5a5ef',true)
};
export function validTheme(id){return typeof id==='string'&&Object.prototype.hasOwnProperty.call(THEMES,id);}
