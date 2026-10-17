import * as THREE from 'three';

// One renderer, two actual rounded meshes. DOM buttons retain focus, names and routing.
// Springs move each entire card as a rigid body. The printed face never deforms.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const spring=(value=0)=>({value,velocity:0,target:value});
function step(s,dt,stiffness=190,damping=17){
  s.velocity+=(s.target-s.value)*stiffness*dt;
  s.velocity*=Math.exp(-damping*dt);s.value+=s.velocity*dt;
}
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
function cardShape(w,h,r){
  const s=new THREE.Shape(),x=-w/2,y=-h/2;
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
  s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);s.closePath();return s;
}
function crop(ctx,image,x,y,w,h){
  if(!image?.naturalWidth)return;
  const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight),sw=w/scale,sh=h/scale;
  ctx.drawImage(image,(image.naturalWidth-sw)/2,(image.naturalHeight-sh)/2,sw,sh,x,y,w,h);
}
function lines(ctx,text,x,y,width,lineHeight,max=2){
  let line='',row=0;
  for(const ch of text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*|[^\s]| +/gu)||[]){
    if(ctx.measureText(line+ch).width>width&&line){ctx.fillText(line,x,y);y+=lineHeight;line='';if(++row>=max)return;}
    line+=ch;
  }
  if(line)ctx.fillText(line,x,y);
}
function faceTexture(button,w,h,index,font=getComputedStyle(button).fontFamily){
  const canvas=document.createElement('canvas'),ratio=2;
  canvas.width=Math.ceil(w*ratio);canvas.height=Math.ceil(h*ratio);
  const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);
  const radius=28,compact=w<320;
  // Full-bleed photograph cropped to the card, with the same shading as the DOM fallback.
  ctx.save();rounded(ctx,0,0,w,h,radius);ctx.clip();
  ctx.fillStyle='#26404a';ctx.fillRect(0,0,w,h);
  crop(ctx,button.querySelector('.cm-entry-art img'),0,0,w,h);
  const shade=ctx.createLinearGradient(0,h,0,0);
  shade.addColorStop(0,'#0a1e1ccc');shade.addColorStop(.34,'#0a1e1c66');shade.addColorStop(.66,'#0a1e1c00');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
  const side=ctx.createLinearGradient(0,0,w*.6,0);side.addColorStop(0,'#0a1e1c4d');side.addColorStop(1,'#0a1e1c00');ctx.fillStyle=side;ctx.fillRect(0,0,w,h);
  ctx.restore();
  const kicker=button.querySelector('.cm-entry-kicker').textContent,title=button.querySelector('strong').textContent,subtitle=button.querySelector('small').textContent;
  const x=compact?20:24,titleSize=compact?26:30,subY=h-(compact?18:22)-3,titleY=subY-24,kickerY=titleY-titleSize+2,textW=w-x*2;
  ctx.textBaseline='alphabetic';
  ctx.fillStyle='#ffffffb3';ctx.font=`400 8px ${font}`;ctx.letterSpacing='.8px';ctx.fillText(kicker,x,kickerY);
  ctx.fillStyle='#fff';ctx.font=`400 ${titleSize}px ${font}`;ctx.letterSpacing='1px';ctx.fillText(title,x,titleY);
  ctx.fillStyle='#ffffffa6';ctx.font=`400 11px ${font}`;ctx.letterSpacing='.3px';lines(ctx,subtitle,x,subY,textW,15,1);
  ctx.letterSpacing='0px';
  // Soft glass rim hugging the edge.
  ctx.strokeStyle='#8fb9b2a6';ctx.lineWidth=1.5;rounded(ctx,.75,.75,w-1.5,h-1.5,radius-.75);ctx.stroke();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  return texture;
}
function shadowTexture(){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(64,64,8,64,64,64);
  g.addColorStop(0,'#233b6740');g.addColorStop(.55,'#233b671d');g.addColorStop(1,'#233b6700');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(canvas);
}
function sheen(material,uniforms){
  material.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,uniforms);
    if(material.isMeshBasicMaterial)shader.fragmentShader=shader.fragmentShader
      .replace('#include <common>','#include <common>\nuniform vec2 cardTilt;')
      .replace('#include <map_fragment>',`#include <map_fragment>
        float silk = 1.0 - smoothstep(0.0, 0.16, abs(vMapUv.x + vMapUv.y * 0.55 - 0.7 - cardTilt.y * 2.0 + cardTilt.x * 2.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0), silk * 0.045);`);
  };
  material.customProgramCacheKey=()=> 'rigid-entry-card-v1';
  return material;
}
let current=null;
class HubCards {
  constructor(root,{suspended=false}={}){
    this.root=root;this.buttons=[...root.querySelectorAll('.cm-entry')];this.models=[];this.frame=0;this.destroyed=false;
    this.suspended=suspended;this.initializing=true;
    this.events=new AbortController();this.reduced=matchMedia('(prefers-reduced-motion: reduce)');this.cancelled=new WeakSet();
    this.ready=this.init().catch(error=>{this.fail(error);return false;});
  }
  async init(){
    await Promise.all([...this.root.querySelectorAll('.cm-entry img')].map(image=>image.decode().catch(()=>{})));
    // The card uses the system UI font; unrelated brush-font downloads must not block it.
    if(this.destroyed||!this.root.isConnected)return false;
    this.stage=document.createElement('div');this.stage.className='hub3d-stage';this.stage.setAttribute('aria-hidden','true');this.root.prepend(this.stage);
    this.renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:true});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.1;
    this.renderer.domElement.dataset.renderer='three';this.stage.append(this.renderer.domElement);
    this.renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();if(!this.destroyed)this.fail();},{signal:this.events.signal});
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(40,1,100,2000);this.camera.position.z=1100;
    this.scene.add(new THREE.HemisphereLight(0xf1f6ff,0xb5aac2,2.3));
    const key=new THREE.DirectionalLight(0xffffff,2.1);key.position.set(-240,400,600);this.scene.add(key);
    const rim=new THREE.DirectionalLight(0xc0d5ff,1.3);rim.position.set(350,-100,200);this.scene.add(rim);
    this.shadow=shadowTexture();
    this.resize();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this.root);
    this.compiling=this.renderer.compileAsync(this.scene,this.camera);
    await this.compiling;this.compiling=null;
    if(this.destroyed)return false;
    this.models.forEach(model=>this.renderer.initTexture(model.texture));this.renderer.initTexture(this.shadow);
    this.bind();this.initializing=false;this.draw(performance.now(),true);return true;
  }
  createModel(button,index,w,h){
    const uniforms={cardTilt:{value:new THREE.Vector2()}};
    const font=getComputedStyle(button).fontFamily,texture=faceTexture(button,w,h,index,font);
    const side=new THREE.MeshPhysicalMaterial({color:0x5d8e88,roughness:.4,metalness:.02,clearcoat:.35,clearcoatRoughness:.4});
    // Printed artwork keeps its intended colours; the rolled physical edges catch the light.
    const face=sheen(new THREE.MeshBasicMaterial({map:texture,toneMapped:false}),uniforms);
    // The rim and flat printed face move together under one rigid transform.
    const shape=cardShape(w,h,28);
    const body=new THREE.ExtrudeGeometry(shape,{depth:8,steps:1,bevelEnabled:true,bevelThickness:3,bevelSize:2.5,bevelSegments:6,curveSegments:20});body.translate(0,0,-4);
    // The separate printed face replaces the body's front cap.
    const shell=new THREE.BufferGeometry(),rim=body.groups.find(group=>group.materialIndex===1);
    for(const [name,attribute] of Object.entries(body.attributes))shell.setAttribute(name,new THREE.BufferAttribute(attribute.array.slice(rim.start*attribute.itemSize,(rim.start+rim.count)*attribute.itemSize),attribute.itemSize));
    const geometry=shell;body.dispose();
    const faceGeometry=new THREE.ShapeGeometry(shape,20);
    const pos=faceGeometry.attributes.position,uv=faceGeometry.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/w+.5,pos.getY(i)/h+.5);
    faceGeometry.translate(0,0,7.4);
    faceGeometry.computeBoundingBox();
    const mesh=new THREE.Group();mesh.add(new THREE.Mesh(geometry,side),new THREE.Mesh(faceGeometry,face));this.scene.add(mesh);
    const shadow=new THREE.Sprite(new THREE.SpriteMaterial({map:this.shadow,transparent:true,opacity:.8,depthWrite:false}));shadow.scale.set(w*1.3,h*1.28,1);shadow.position.z=-28;this.scene.add(shadow);
    return {button,index,w,h,font,uniforms,texture,side,face,geometry,faceGeometry,mesh,shadow,x:spring(),y:spring(),press:spring(),lift:spring(),touch:new THREE.Vector2(),held:false};
  }
  resize(){
    if(this.destroyed||!this.renderer||!this.root.isConnected||(this.suspended&&!this.initializing))return;
    const r=this.root.getBoundingClientRect(),w=this.root.clientWidth,h=this.root.clientHeight;if(!w||!h)return;
    if(w!==this.width||h!==this.height){
      this.width=w;this.height=h;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.fov=2*Math.atan(h/2/1100)*180/Math.PI;this.camera.updateProjectionMatrix();
    }
    this.buttons.forEach((button,index)=>{
      const b=button.getBoundingClientRect(),width=b.width-10,height=b.height-12;let model=this.models[index];
      if(!model)model=this.models[index]=this.createModel(button,index,width,height);
      else if(Math.abs(model.w-width)>1||Math.abs(model.h-height)>1){
        const interaction={x:model.x,y:model.y,press:model.press,lift:model.lift,touch:model.touch,held:model.held};
        this.disposeModel(model);Object.assign(model,this.createModel(button,index,width,height),interaction);
      }
      model.cx=b.left+b.width/2-r.left-w/2;model.cy=-(b.top+b.height/2-r.top-h/2);
    });
    this.request();
  }
  bind(){
    const options={signal:this.events.signal};
    for(const model of this.models){
      const button=model.button;
      button.addEventListener('pointermove',event=>{if(!model.held&&event.pointerType!=='mouse')return;this.aim(model,event,model.held);},options);
      button.addEventListener('pointerleave',()=>{if(!model.held)this.relax(model);},options);
      button.addEventListener('pointerdown',event=>{
        if(event.button!==0||!event.isPrimary||window.ChallengeMotion?.busy)return;
        this.release();model.held=true;this.pointer={id:event.pointerId,model,box:button.getBoundingClientRect()};button.setPointerCapture(event.pointerId);this.aim(model,event,true);
      },options);
      button.addEventListener('lostpointercapture',()=>{if(this.pointer?.model===model)this.release();},options);
      button.addEventListener('keydown',event=>{
        if(event.repeat||![' ','Enter'].includes(event.key)||window.ChallengeMotion?.busy)return;
        model.held=true;model.touch.set(0,0);model.press.target=this.reduced.matches?0:.65;model.lift.target=-5;this.request();
      },options);
      button.addEventListener('keyup',event=>{if([' ','Enter'].includes(event.key))this.release();},options);
      button.addEventListener('blur',()=>{if(model.held)this.release();},options);
      button.addEventListener('click',event=>{if(this.cancelled.delete(button)){event.preventDefault();event.stopImmediatePropagation();}}, {...options,capture:true});
    }
    const end=event=>{
      if(!this.pointer||event.pointerId!==this.pointer.id)return;
      const {model,box}=this.pointer;
      if(event.type==='pointercancel'||event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom){this.cancelled.add(model.button);setTimeout(()=>this.cancelled.delete(model.button),200);}
      this.release();
    };
    document.addEventListener('pointerup',end,options);document.addEventListener('pointercancel',end,options);
    window.addEventListener('blur',()=>this.release(),options);
    document.addEventListener('visibilitychange',()=>{this.last=0;if(document.hidden){cancelAnimationFrame(this.frame);this.frame=0;}else this.request();},options);
    this.reduced.addEventListener('change',()=>{this.release();this.request();},options);
  }
  aim(model,event,held){
    const b=model.button.getBoundingClientRect(),x=clamp((event.clientX-b.left)/b.width*2-1,-1,1),y=clamp((event.clientY-b.top)/b.height*2-1,-1,1);
    model.touch.set(x*model.w*.5,-y*model.h*.5);
    model.x.target=this.reduced.matches?0:-y*(held?.105:.035);model.y.target=this.reduced.matches?0:x*(held?.105:.035);
    model.press.target=held&&!this.reduced.matches?1:0;model.lift.target=held?-5:3;this.request();
  }
  relax(model){model.held=false;model.x.target=0;model.y.target=0;model.press.target=0;model.lift.target=0;}
  release(){
    const pointer=this.pointer;this.pointer=null;
    this.models.forEach(model=>this.relax(model));
    if(pointer?.model.button.hasPointerCapture(pointer.id))pointer.model.button.releasePointerCapture(pointer.id);
    this.request();
  }
  activate(button,commit){
    if(this.activating||this.destroyed)return;
    this.activating=true;this.release();
    const model=this.models.find(model=>model.button===button);
    if(model&&!this.reduced.matches){model.press.value=Math.max(.4,model.press.value);model.press.velocity=-4;this.request();}
    // Let even a short tap show its elastic release before the radial navigation.
    this.activation=setTimeout(()=>{if(!this.destroyed)commit();},this.reduced.matches?0:180);
  }
  suspend(){
    clearTimeout(this.activation);this.activating=false;this.release();this.suspended=true;
    cancelAnimationFrame(this.frame);this.frame=0;this.last=0;
    for(const model of this.models)for(const state of [model.x,model.y,model.press,model.lift])state.value=state.velocity=state.target=0;
  }
  async refresh(source){
    const incoming=[...source.querySelectorAll('.cm-entry')];
    this.buttons.forEach((button,index)=>{
      const next=incoming[index];if(!next)return;
      for(const name of ['aria-label','data-done']){
        if(next.hasAttribute(name))button.setAttribute(name,next.getAttribute(name));else button.removeAttribute(name);
      }
    });
    const updates=this.buttons.map((button,index)=>({button,next:incoming[index],model:this.models[index]})).filter(({button,next})=>next&&button.innerHTML!==next.innerHTML);
    if(!updates.length)return;
    await Promise.all(updates.flatMap(({next})=>[...next.querySelectorAll('img')].map(image=>image.decode().catch(()=>{}))));
    if(this.destroyed)return;
    for(const {button,next,model} of updates){
      button.innerHTML=next.innerHTML;
      if(model){const old=model.texture;model.texture=faceTexture(button,model.w,model.h,model.index,model.font);model.face.map=model.texture;this.renderer.initTexture(model.texture);old.dispose();}
    }
    if(this.renderer&&!this.initializing)this.draw(performance.now(),true);
  }
  present(){this.suspended=false;this.last=0;this.resize();if(!this.initializing)this.draw(performance.now(),true);}
  request(){if(!this.frame&&!this.suspended&&!this.destroyed&&!this.initializing&&!document.hidden&&this.renderer)this.frame=requestAnimationFrame(time=>this.draw(time));}
  draw(time,force=false){
    if(force)cancelAnimationFrame(this.frame);
    this.frame=0;if(this.destroyed||document.hidden||!this.renderer||(this.suspended&&!force))return;
    const active=this.models.some(m=>m.held||[m.x,m.y,m.press,m.lift].some(s=>Math.abs(s.value-s.target)>.001||Math.abs(s.velocity)>.008));
    if(!force&&!active&&!this.reduced.matches&&this.lastDraw&&time-this.lastDraw<31){this.request();return;}
    const dt=Math.min(.024,this.last?(time-this.last)/1000:1/60);this.last=time;let unsettled=false;
    for(const model of this.models){
      for(const state of [model.x,model.y,model.press,model.lift]){
        if(this.reduced.matches){state.value=state.target;state.velocity=0;}else step(state,dt,state===model.press?240:185,state===model.press?16:14);
        if(Math.abs(state.value-state.target)>.001||Math.abs(state.velocity)>.008)unsettled=true;
      }
      const idle=this.reduced.matches?0:Math.sin(time*.00135+model.index*2.4),float=this.reduced.matches?0:Math.sin(time*.00165+model.index*2.1)*1.7;
      model.mesh.rotation.set(model.x.value+idle*.009,model.y.value+(model.index?-.017:.017),Math.sin(time*.0008+model.index)*.002*(this.reduced.matches?0:1));
      model.mesh.position.set(model.cx,model.cy+float+model.lift.value,-model.press.value*7);
      model.uniforms.cardTilt.value.set(model.mesh.rotation.x,model.mesh.rotation.y);
      model.shadow.position.x=model.cx;model.shadow.position.y=model.cy-12;model.shadow.material.opacity=.68-model.lift.value*.012;
    }
    this.renderer.render(this.scene,this.camera);this.lastDraw=time;
    this.frames=(this.frames||0)+1;this.root.classList.add('is-three-ready');this.root.dataset.hubRenderer='three';
    if(!this.suspended&&(!this.reduced.matches||unsettled))this.request();
  }
  disposeModel(model){
    this.scene.remove(model.mesh,model.shadow);model.geometry.dispose();model.faceGeometry.dispose();model.side.dispose();model.face.dispose();model.texture.dispose();model.shadow.material.dispose();
  }
  inspect(){return {renderer:'three',suspended:this.suspended,cards:this.models.map(m=>({texture:m.texture.uuid,geometry:m.geometry.uuid,rotation:[m.mesh.rotation.x,m.mesh.rotation.y],press:m.press.value,velocity:m.press.velocity,target:m.press.target,touch:[m.touch.x,m.touch.y],lift:m.lift.value,depth:m.mesh.position.z,scale:m.mesh.scale.toArray(),surfaceDepth:[m.faceGeometry.boundingBox.min.z,m.faceGeometry.boundingBox.max.z]})),frames:this.frames||0,calls:this.renderer?.info.render.calls,triangles:this.renderer?.info.render.triangles,dpr:this.renderer?.getPixelRatio(),reduced:this.reduced.matches};}
  fail(error){
    if(error)console.warn('3D entry cards unavailable; keeping the accessible cards.',error.message);
    this.root.classList.remove('is-three-ready');this.root.dataset.hubRenderer='fallback';this.destroy(false);
  }
  destroy(freeze=true){
    if(this.destroyed)return;this.destroyed=true;clearTimeout(this.activation);cancelAnimationFrame(this.frame);this.frame=0;this.events.abort();this.observer?.disconnect();
    if(freeze&&this.renderer&&this.root.isConnected){
      const still=document.createElement('canvas');still.width=this.renderer.domElement.width;still.height=this.renderer.domElement.height;
      still.getContext('2d').drawImage(this.renderer.domElement,0,0);this.stage.replaceChildren(still);
    }else this.stage?.remove();
    const release=()=>{this.models.forEach(model=>this.disposeModel(model));this.shadow?.dispose();this.renderer?.dispose();this.renderer?.forceContextLoss();};
    // Three.js still polls shader programs while compileAsync is pending.
    // Keep those resources alive until it settles when leaving the home page quickly.
    if(this.compiling)this.compiling.then(release,release);else release();
    if(current===this)current=null;
  }
}
window.HubCards3D=Object.freeze({mount(root,options){current?.destroy();current=new HubCards(root,options);return current;},release(){current?.release();},inspect(){return current?.inspect()||null;}});
