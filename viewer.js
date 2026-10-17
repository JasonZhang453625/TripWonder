/* Photo coordinates and note anchors share one plane. No source-image edits. */
window.PhotoViewer = class {
  constructor(root, photo) {
    this.root=root;this.plane=root.querySelector('.photo-plane');this.photo=photo;
    this.zoom=1.15;this.x=0;this.y=0;this.pointers=new Map();this.abort=new AbortController();
    const on=(el,name,fn,options={})=>el.addEventListener(name,fn,{...options,signal:this.abort.signal});
    on(root,'pointerdown',e=>this.down(e));on(root,'pointermove',e=>this.move(e));
    for(const name of ['pointerup','pointercancel','lostpointercapture'])on(root,name,e=>this.up(e));
    on(root,'wheel',e=>{e.preventDefault();const p=this.local(e);this.scaleTo(this.zoom*Math.exp(-e.deltaY*.0015),p.x,p.y)},{passive:false});
    on(root,'dblclick',e=>{if(e.target.closest('button'))return;const p=this.local(e);this.scaleTo(this.zoom>1.5?1.15:2,p.x,p.y)});
    on(root,'keydown',e=>{if(e.target!==root)return;const k=e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','0'].includes(k)){e.preventDefault();if(k==='+'||k==='=')this.scaleTo(this.zoom*1.2);else if(k==='-')this.scaleTo(this.zoom/1.2);else if(k==='0')this.reset();else{this.x+=k==='ArrowLeft'?35:k==='ArrowRight'?-35:0;this.y+=k==='ArrowUp'?35:k==='ArrowDown'?-35:0;this.paint()}}});
    this.observer=new ResizeObserver(()=>this.measure());this.observer.observe(root);this.measure();
  }
  local(e){const r=this.root.getBoundingClientRect();return{x:e.clientX-r.left-r.width/2,y:e.clientY-r.top-r.height/2}}
  measure(){this.w=this.root.clientWidth;this.h=this.root.clientHeight;const fit=Math.max(this.w/this.photo.width,this.h/this.photo.height);this.bw=this.photo.width*fit;this.bh=this.photo.height*fit;this.plane.style.width=this.bw+'px';this.plane.style.height=this.bh+'px';this.paint()}
  paint(){const bx=Math.max(0,(this.bw*this.zoom-this.w)/2),by=Math.max(0,(this.bh*this.zoom-this.h)/2);this.x=Math.max(-bx,Math.min(bx,this.x));this.y=Math.max(-by,Math.min(by,this.y));this.plane.style.transform=`translate(calc(-50% + ${this.x}px),calc(-50% + ${this.y}px)) scale(${this.zoom})`;this.plane.style.setProperty('--inverse-zoom',1/this.zoom);this.root.dataset.zoom=this.zoom.toFixed(3);this.root.dataset.pan=`${this.x.toFixed(1)},${this.y.toFixed(1)}`;const label=document.querySelector('[data-action="zoom-reset"]');if(label)label.textContent=Math.round(this.zoom*100)+'%'}
  scaleTo(z,fx=0,fy=0){const next=Math.max(1,Math.min(3.5,z)),ratio=next/this.zoom;this.x=fx-(fx-this.x)*ratio;this.y=fy-(fy-this.y)*ratio;this.zoom=next;this.paint()}
  reset(){this.zoom=1.15;this.x=0;this.y=0;this.paint()}
  baseline(){const ps=[...this.pointers.values()];this.gesture={x:this.x,y:this.y,zoom:this.zoom};if(ps.length===1)this.gesture.point=ps[0];if(ps.length>=2){this.gesture.mid={x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2};this.gesture.distance=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y)}}
  down(e){if(e.target.closest('button')||e.button>0)return;e.preventDefault();this.root.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,this.local(e));this.baseline();this.root.classList.add('dragging')}
  move(e){if(!this.pointers.has(e.pointerId))return;this.pointers.set(e.pointerId,this.local(e));const ps=[...this.pointers.values()],g=this.gesture;if(ps.length===1){this.x=g.x+ps[0].x-g.point.x;this.y=g.y+ps[0].y-g.point.y}else{const mid={x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2},dist=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);this.zoom=Math.max(1,Math.min(3.5,g.zoom*dist/Math.max(g.distance,1)));const ratio=this.zoom/g.zoom;this.x=mid.x-(g.mid.x-g.x)*ratio;this.y=mid.y-(g.mid.y-g.y)*ratio}this.schedulePaint()}
  up(e){if(this.frame){cancelAnimationFrame(this.frame);this.frame=0;this.paint()}this.pointers.delete(e.pointerId);this.baseline();if(!this.pointers.size)this.root.classList.remove('dragging')}
  schedulePaint(){if(!this.frame)this.frame=requestAnimationFrame(()=>{this.frame=0;this.paint()})}
  destroy(){this.abort.abort();this.observer.disconnect();cancelAnimationFrame(this.frame)}
};
