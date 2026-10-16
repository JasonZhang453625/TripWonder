const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');const c=vm.createContext({window:{},localStorage:{getItem:()=>null}});vm.runInContext(fs.readFileSync('scene-bubbles.js','utf8'),c);const group=c.window.SceneBubbles.groupNotes;assert.equal(typeof group,'function','spatial grouping must exist');const notes=[{id:'a',u:.1,v:.2},{id:'b',u:.12,v:.22},{id:'c',u:.8,v:.7}];let groups=group(notes,1.6);assert.equal(groups.length,2);assert.equal(groups[0].notes.length,2);assert.equal(groups[0].u,.1);assert.equal(groups[1].u,.8);assert.equal(notes[1].u,.12,'original coordinates retained');assert.equal(group([{id:'a',u:.1,v:.2},{id:'b',u:.14,v:.2},{id:'c',u:.18,v:.2}],1).length,2,'nearby chains must not swallow distant places');assert.equal(group([{id:'bad',u:NaN,v:.4}],1).length,0);console.log('PASS: merge nearby only, preserve separate locations and source coordinates, avoid chain merging');
// Exercise the module with projected markers and the real local-note store contract.
{
  const documentListeners=new Map(),windowListeners=new Map(),timers=new Map();let timerId=0;
  class El {
    constructor(){this.children=[];this.style={};this.dataset={};this.attrs={};this.listeners=new Map();this.controls=new Map();this.hidden=false;this.offsetWidth=260;this.offsetHeight=220;this.className='';this.classList={contains:name=>this.className.split(' ').includes(name),add:name=>this.className+=' '+name,remove:name=>this.className=this.className.split(' ').filter(n=>n!==name).join(' ')};}
    append(...nodes){for(const n of nodes){n.parent=this;this.children.push(n)}}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this)}
    querySelectorAll(selector){const classes=selector.split(',').map(s=>s.trim().replace(/^\./,''));return this.children.filter(n=>classes.some(c=>n.classList.contains(c)))}
    querySelector(selector){if(selector.startsWith('.tw-pin'))return this.querySelectorAll(selector)[0]||null;if(!this.controls.has(selector))this.controls.set(selector,new El());return this.controls.get(selector)}
    insertAdjacentHTML(){const pin=new El();pin.className='tw-pin';this.append(pin)}
    setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k]}
    addEventListener(type,fn){const list=this.listeners.get(type)||[];this.listeners.set(type,[...list,fn])}
    removeEventListener(type,fn){this.listeners.set(type,(this.listeners.get(type)||[]).filter(f=>f!==fn))}
    fire(type,event){for(const fn of this.listeners.get(type)||[])fn(event)}
    getBoundingClientRect(){return {left:0,top:0,width:1000,height:600,bottom:600,right:1000}}
    contains(target){return target===this||this.children.some(n=>n.contains(target))}focus(){}
  }
  const page=new El(),plane=new El(),root=new El();root.closest=()=>page;root.querySelector=()=>plane;const made=[];const saved={bubbles:{},likes:{}};
  const foreign={element:new El()},viewer={markers:[foreign],projectMarkers(){}};let picked=null;
  const win={I18N:{t:zh=>zh,isEn:()=>false},TWStore:{get:()=>saved,update:fn=>fn(saved)},TW_BUBBLE_SEED:{demo:[{id:'near-a',u:.2,v:.4,name:'甲',text:'目标城市的第一条',kind:'been'},{id:'near-b',u:.205,v:.41,name:'乙',text:'第二条',kind:'want'},{id:'far',u:.8,v:.7,name:'丙',text:'远处的留言',kind:'been'}]},addEventListener:(t,f)=>windowListeners.set(t,f),removeEventListener:t=>windowListeners.delete(t)};
  const doc={activeElement:null,createElement(){const n=new El();made.push(n);return n},addEventListener:(t,f)=>documentListeners.set(t,f),removeEventListener:t=>documentListeners.delete(t)};
  const env=vm.createContext({window:win,document:doc,localStorage:{getItem:()=>null,setItem(){}},setTimeout:fn=>{timers.set(++timerId,fn);return timerId},clearTimeout:id=>timers.delete(id)});vm.runInContext(fs.readFileSync('scene-bubbles.js','utf8'),env);
  const h=win.SceneBubbles.mount({root,viewer,scene:{id:'demo',photo:{width:1600,height:1000}},hiddenNames:['目标城市'],onCompose:p=>picked=p});
  let signs=plane.querySelectorAll('.tw-note-cluster');assert.equal(signs.length,2);assert.equal(signs[0].dataset.u,.2);assert.equal(viewer.markers.length,3);assert.ok(signs[0].innerHTML.includes('<b>2</b>'));
  signs[0].fire('pointerenter',{pointerType:'mouse'});const panel=made.find(n=>n.className==='tw-notes-panel');assert.equal(panel.hidden,false);assert.ok(panel.innerHTML.includes('near-a')&&panel.innerHTML.includes('near-b'));assert.ok(!panel.innerHTML.includes('data-id="far"'),'nearby list excludes distant notes');assert.ok(!panel.innerHTML.includes('目标城市'),'names stay masked');assert.ok(panel.innerHTML.includes('tw-note-detail" hidden'),'full text remains collapsed');
  h.add({u:.206,v:.412,kind:'been',text:'贴近这个地点'});assert.equal(saved.bubbles.demo[0].u,.206);assert.equal(plane.querySelectorAll('.tw-note-cluster').length,2);h.add({u:.5,v:.5,kind:'been',text:'另一个地点'});assert.equal(plane.querySelectorAll('.tw-note-cluster').length,3);
  const target=selector=>({closest:s=>s===selector?{}:null});page.fire('click',{target:target('[data-bubble-new]')});const e={target:target('none'),pointerId:1,clientX:370,clientY:250};page.fire('pointerdown',e);page.fire('pointerup',e);page.fire('click',{target:target('[data-place-ok]')});assert.equal(picked.u,.37,'arbitrary photo coordinate is not shifted');assert.equal(picked.v,250/600);
  picked=null;page.fire('click',{target:target('[data-bubble-new]')});page.fire('pointerdown',e);page.fire('pointerdown',{...e,pointerId:2});page.fire('pointerup',{...e,pointerId:2});page.fire('pointerup',e);page.fire('click',{target:target('[data-place-ok]')});assert.equal(picked,null,'pinch cannot accidentally place a note');
  h.destroy();assert.equal(plane.querySelectorAll('.tw-note-cluster').length,0);assert.equal(viewer.markers.length,1);assert.equal(viewer.markers[0],foreign,'souvenir/foreign markers survive cleanup');assert.equal(documentListeners.size,0);assert.equal(windowListeners.size,0);assert.equal(timers.size,0);console.log('PASS: spatial signs, local lists, coordinate placement, pinch rejection, persistence and projection cleanup');
}
