const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, 'scene-souvenirs.js'), 'utf8');
function boot(storage = new Map(), blocked = false) {
  const created=[];
  class Element {
    constructor(){this.children=[];this.style={};this.listeners=new Map();this.hidden=false;this.open=false;this.classList={contains:()=>false};this.controls=new Map();}
    append(node){node.parent=this;this.children.push(node);}
    remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}
    setAttribute(){}
    focus(){}
    getBoundingClientRect(){return {left:100,top:200,right:126,bottom:230};}
    querySelector(selector){if(!this.controls.has(selector))this.controls.set(selector,new Element());return this.controls.get(selector);}
    addEventListener(type, fn, options={}){const list=this.listeners.get(type)||[];list.push(fn);this.listeners.set(type,list);options.signal?.addEventListener('abort',()=>this.listeners.set(type,(this.listeners.get(type)||[]).filter(f=>f!==fn)),{once:true});}
    fire(type, e={}){for(const fn of this.listeners.get(type)||[])fn(e);}
    showModal(){this.open=true;}
    close(){this.open=false;this.fire('close');}
  }
  const page=new Element(),plane=new Element(),root=new Element();root.closest=()=>page;root.querySelector=()=>plane;
  const context=vm.createContext({window:{},AbortController,localStorage:{getItem:key=>{if(blocked)throw Error('blocked');return storage.get(key)||null;},setItem:(key,v)=>{if(blocked)throw Error('blocked');storage.set(key,v);}} ,document:{createElement(){const e=new Element();created.push(e);return e;}}});
  vm.runInContext(source,context);
  const other={element:new Element()},viewer={markers:[other],projectMarkers(){}};
  const mount=(id='gl-yulong')=>context.window.SceneSouvenirs.mount({root,viewer,scene:{id}});
  const nodes=name=>created.filter(e=>e.className===name);
  const event=(id=1,x=112,y=215)=>({pointerId:id,clientX:x,clientY:y,button:0});
  const tap=()=>{root.fire('pointerdown',event());root.fire('pointerup',event());};
  return {context,mount,root,page,plane,viewer,other,nodes,tap,event,storage};
}
(async()=>{
  const b=boot();assert.equal(b.context.window.SceneSouvenirs.catalog.length,1);
  assert.equal(b.context.window.SceneSouvenirs.catalog[0].sceneId,'gl-yulong');
  for(const id of ['gl-xingping','gl-longji']){const handle=b.mount(id);assert.equal(b.plane.children.length,0);handle.destroy();}
  const handle=b.mount();assert.equal(b.plane.children.length,1);assert.equal(b.viewer.markers.length,2);
  b.root.fire('pointerdown',b.event());b.root.fire('pointermove',b.event(1,140));b.root.fire('pointerup',b.event());assert.equal(b.nodes('tw-souvenir-dialog').length,0,'out-and-back drag must not discover');
  b.root.fire('pointerdown',b.event());b.root.fire('pointerdown',b.event(2));b.root.fire('pointerup',b.event(2));b.root.fire('pointerup',b.event());assert.equal(b.nodes('tw-souvenir-dialog').length,0,'pinch must not discover');
  b.tap();let d=b.nodes('tw-souvenir-dialog').at(-1);assert.ok(d.open);assert.equal(b.storage.size,0,'discovery is not collection');d.querySelector('.tw-souvenir-primary').onclick();
  assert.equal(b.storage.size,1);assert.equal(b.plane.children.length,0,'collected toy disappears');assert.equal(b.viewer.markers.length,1);assert.equal(b.viewer.markers[0],b.other,'other modules retain their projection markers');
  b.tap();assert.equal(b.nodes('tw-souvenir-dialog').length,1,'former location is inactive');handle.destroy();assert.equal(b.page.children.length,0);assert.equal((b.root.listeners.get('pointerup')||[]).length,0,'listeners removed');
  const restored=boot(b.storage);const h=restored.mount();assert.equal(restored.plane.children.length,0,'reload preserves collected state');h.destroy();
  const failed=boot(new Map(),true);const f=failed.mount();failed.tap();failed.nodes('tw-souvenir-dialog').at(-1).querySelector('.tw-souvenir-primary').onclick();assert.equal(failed.plane.children.length,0);assert.ok(failed.nodes('tw-souvenir-dialog').at(-1).innerHTML.includes('当前无法保存'));f.destroy();
  const pending=boot();let ready;pending.viewer.ready=new Promise(r=>ready=r);const p=pending.mount();p.destroy();ready();await Promise.resolve();assert.equal(pending.viewer.markers.length,1,'ready callback must not resurrect destroyed layers');
  console.log('PASS: one egg per destination, viewer registration, tap vs drag/pinch, collect/remove, persistence, cleanup, storage fallback, async race');
})().catch(error=>{console.error(error);process.exitCode=1;});
