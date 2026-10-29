import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07111f);
scene.fog = new THREE.Fog(0x07111f, 48, 125);
const camera = new THREE.PerspectiveCamera(66, innerWidth / innerHeight, .1, 220);
camera.position.set(0, 9, 15);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
$('game').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9fcfff, 0x172338, 2.0));
const keyLight = new THREE.DirectionalLight(0xe4f3ff, 3.1);
keyLight.position.set(-12, 26, 12); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048,2048); keyLight.shadow.camera.left=-35; keyLight.shadow.camera.right=35; keyLight.shadow.camera.top=35; keyLight.shadow.camera.bottom=-35;
scene.add(keyLight);
for (const [x,z,color] of [[-25,0,0x168aff],[25,0,0xff7c2e]]) {
  const light = new THREE.PointLight(color, 180, 42, 2); light.position.set(x,8,z); scene.add(light);
}

const mat = (color, roughness=.65, metalness=.05, extra={}) => new THREE.MeshStandardMaterial({color,roughness,metalness,...extra});
const turfMat = mat(0x0c352f,.92);
const darkMat = mat(0x101b2b,.7);
const whiteMat = mat(0xdcecff,.5,0,{emissive:0x243b51,emissiveIntensity:.3});
const blueMat = mat(0x087be8,.28,.48,{metalness:.55,emissive:0x00336b,emissiveIntensity:.55});
const orangeMat = mat(0xff7629,.3,.4,{emissive:0x5b1a00,emissiveIntensity:.5});
const rubberMat = mat(0x10141c,.8);
const glassMat = mat(0x10243a,.18,.25,{metalness:.35,emissive:0x071a2d,emissiveIntensity:.4});
const glowBlue = new THREE.MeshBasicMaterial({color:0x3bc7ff});
const glowOrange = new THREE.MeshBasicMaterial({color:0xff8b3b});

const arena = new THREE.Group(); scene.add(arena);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(62,88),turfMat);
ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; ground.position.y=-.1; arena.add(ground);
const field = new THREE.Group(); arena.add(field);
function line(points, material=whiteMat, radius=.045) {
  const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(24,points.length*5),radius,6,false),material);
  mesh.position.y=.015; field.add(mesh); return mesh;
}
function box(w,h,d,material,x,y,z,parent=arena) {
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
// Stadium floor markings
line([[-29,0,-38],[29,0,-38],[29,0,38],[-29,0,38],[-29,0,-38]],whiteMat,.065);
line([[0,0,-38],[0,0,38]],whiteMat,.035);
const centerRing = new THREE.Mesh(new THREE.TorusGeometry(6,.055,6,80),whiteMat); centerRing.rotation.x=Math.PI/2; centerRing.position.y=.025; field.add(centerRing);
const centerDot = new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,.04,24),whiteMat); centerDot.position.y=.02; field.add(centerDot);
for (const z of [-27,27]) {
  line([[-12,0,z-5],[12,0,z-5],[12,0,z+5],[-12,0,z+5],[-12,0,z-5]],whiteMat,.05);
}
// Enclosed low sidewalls and endwalls
box(62,3,1.2,darkMat,0,1.4,-44);
box(62,3,1.2,darkMat,0,1.4,44);
box(1.2,3,88,darkMat,-31,1.4,0);
box(1.2,3,88,darkMat,31,1.4,0);
for (const x of [-30.25,30.25]) {
  for (let z=-40;z<=40;z+=4) box(.16,2.6,.13,x,2.8,z,x===-30.25?arena:arena).material=mat(x<0?0x197ac0:0xc86a31,.4,.2,{emissive:x<0?0x06365e:0x572300,emissiveIntensity:.5});
}
// Goal mouths: goal at +/-Z, opening width 15, height 6
function makeGoal(z, color) {
  const g = new THREE.Group(); g.position.z=z; scene.add(g);
  const gm = new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.9,metalness:.25,roughness:.25});
  box(15,.25,.35,gm,0,.25,0,g); box(.25,6,.35,gm,-7.5,3,0,g); box(.25,6,.35,gm,7.5,3,0,g);
  const netMat=mat(color,.9,.0,{transparent:true,opacity:.15,wireframe:true});
  const net=new THREE.Mesh(new THREE.BoxGeometry(15,6,5),netMat); net.position.set(0,3,z<0?-2.5:2.5); g.add(net);
  const halo = new THREE.PointLight(color,90,25); halo.position.set(0,4,z<0?-2:2); g.add(halo);
}
makeGoal(-43,0x28aaff); makeGoal(43,0xff813b);
// Stadium stands, glowing strips and floodlight towers
for (let side of [-1,1]) {
  for (let z=-36;z<=36;z+=3) {
    const h=1.5+(Math.abs(z)%9)*.12;
    const seat=box(2.5,h,2.5,mat((Math.floor((z+36)/3)%4===0)?0x173e60:0x101f33,.8),side*34,1+h/2,z);
    seat.castShadow=false;
  }
  const strip = box(.25,.12,76,side<0?glowBlue:glowOrange,side*31.8,3.3,0); strip.castShadow=false;
}
for (const x of [-28,28]) for (const z of [-38,38]) {
  box(.45,12,.45,whiteMat,x,6,z);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(4,.2,1.2),new THREE.MeshBasicMaterial({color:0xd9f2ff})); lamp.position.set(x,12,z); scene.add(lamp);
  const pl=new THREE.PointLight(0x8acfff,100,38);pl.position.set(x,11,z);scene.add(pl);
}
// Decorative floating crowd lights
for(let i=0;i<150;i++){
  const angle=Math.random()*Math.PI*2, r=36+Math.random()*5;
  const p=new THREE.Mesh(new THREE.SphereGeometry(.07+Math.random()*.06,6,6),new THREE.MeshBasicMaterial({color:Math.random()>.5?0x258dff:0xff873d}));
  p.position.set(Math.cos(angle)*r,2+Math.random()*6,Math.sin(angle)*r);scene.add(p);
}

function makeCar(colorMat, glowMat, isPlayer=false) {
  const root=new THREE.Group();
  const chassis=new THREE.Group(); root.add(chassis);
  // low sporty body
  const lower=new THREE.Mesh(new THREE.BoxGeometry(2.15,.48,3.45),colorMat); lower.position.y=.58; lower.castShadow=true;lower.receiveShadow=true;chassis.add(lower);
  const nose=new THREE.Mesh(new THREE.BoxGeometry(1.88,.27,1.0),colorMat);nose.position.set(0,.68,-1.9);nose.rotation.x=-.08;nose.castShadow=true;chassis.add(nose);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.42,.67,1.45),glassMat);cabin.position.set(0,1.03,.05);cabin.rotation.x=-.06;cabin.castShadow=true;chassis.add(cabin);
  const roof=new THREE.Mesh(new THREE.BoxGeometry(1.12,.08,.9),colorMat);roof.position.set(0,1.39,.05);chassis.add(roof);
  const frontBumper=new THREE.Mesh(new THREE.BoxGeometry(1.9,.16,.22),glowMat);frontBumper.position.set(0,.43,-2.02);chassis.add(frontBumper);
  const rearBumper=new THREE.Mesh(new THREE.BoxGeometry(1.9,.16,.22),colorMat);rearBumper.position.set(0,.43,1.77);chassis.add(rearBumper);
  const wheels=[];
  for(const x of [-1.08,1.08])for(const z of [-1.12,1.15]){
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.28,18),rubberMat);
    wheel.rotation.z=Math.PI/2;wheel.position.set(x,.4,z);wheel.castShadow=true;chassis.add(wheel);wheels.push(wheel);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.3,12),glowMat);hub.rotation.z=Math.PI/2;hub.position.copy(wheel.position);chassis.add(hub);
  }
  const headlightMat=new THREE.MeshBasicMaterial({color:0xd8f6ff});
  for(const x of [-.66,.66]){
    const head=new THREE.Mesh(new THREE.BoxGeometry(.4,.12,.06),headlightMat);head.position.set(x,.72,-2.04);chassis.add(head);
  }
  const boost=new THREE.Group();boost.position.set(0,.53,1.83);chassis.add(boost);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.28,.95,12),new THREE.MeshBasicMaterial({color:0x55dfff,transparent:true,opacity:.85}));flame.rotation.x=-Math.PI/2;flame.position.z=.45;boost.add(flame);boost.visible=false;
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.6,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.24,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.02;root.add(shadow);
  root.userData={chassis,wheels,boost,flame,shadow,isPlayer};
  return root;
}
const player=makeCar(blueMat,glowBlue,true); player.position.set(0,.08,19);scene.add(player);
const bot=makeCar(orangeMat,glowOrange);bot.position.set(0,.08,-19);bot.rotation.y=Math.PI;scene.add(bot);

// Ball with metallic panel pattern
const ballGroup=new THREE.Group();scene.add(ballGroup);
const ballMesh=new THREE.Mesh(new THREE.SphereGeometry(1.35,32,24),mat(0xdfe7f2,.28,.48,{metalness:.5}));ballMesh.castShadow=true;ballMesh.receiveShadow=true;ballGroup.add(ballMesh);
const ballWire=new THREE.Mesh(new THREE.IcosahedronGeometry(1.355,1),new THREE.MeshStandardMaterial({color:0x243b56,roughness:.35,metalness:.3,wireframe:true,transparent:true,opacity:.58}));ballGroup.add(ballWire);
const ballGlow=new THREE.Mesh(new THREE.SphereGeometry(1.39,24,16),new THREE.MeshBasicMaterial({color:0x65cfff,wireframe:true,transparent:true,opacity:.12}));ballGroup.add(ballGlow);
const ballLight=new THREE.PointLight(0x54aaff,2,9);ballGroup.add(ballLight);
const ball={pos:new THREE.Vector3(0,1.4,0),vel:new THREE.Vector3(),radius:1.35};
ballGroup.position.copy(ball.pos);

const keys={}; const touch={left:false,right:false,forward:false,back:false,jump:false,boost:false};
let boostAmount=100, jumpWasDown=false, paused=true, matchStarted=false, matchTime=300, blueScore=0, orangeScore=0;
let toastTimer=0, soundOn=true, audioCtx=null, lastTime=performance.now();
const carState={pos:player.position,vel:new THREE.Vector3(),yaw:0,vertical:0,vy:0,grounded:true,airTime:0,flipTime:0};
const botState={pos:bot.position,vel:new THREE.Vector3(),yaw:Math.PI,vertical:0,vy:0,grounded:true};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const tmpV=new THREE.Vector3();
function showToast(text,duration=1.35){$('toast').textContent=text;$('toast').classList.add('show');toastTimer=duration;}
function beep(freq=500,duration=.09,type='sine',gain=.035){if(!soundOn)return;try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.value=gain;o.connect(g);g.connect(audioCtx.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.stop(audioCtx.currentTime+duration)}catch{}}
function resetKickoff(){
  player.position.set(0,.08,19); carState.vel.set(0,0,0);carState.yaw=0;carState.vertical=0;carState.vy=0;carState.grounded=true;carState.airTime=0;
  bot.position.set(0,.08,-19);botState.vel.set(0,0,0);botState.yaw=Math.PI;botState.vertical=0;botState.vy=0;botState.grounded=true;
  ball.pos.set((Math.random()-.5)*1.2,1.4,0);ball.vel.set(0,0,0);ballGroup.position.copy(ball.pos);
  boostAmount=100;updateBoost();showToast('KICKOFF!');beep(660,.14,'triangle');
}
function updateBoost(){$('boost-value').textContent=Math.round(boostAmount);$('boost-fill').style.width=boostAmount+'%';}
function score(team){
  if(team==='blue'){blueScore++;$('blue-score').textContent=blueScore;showToast('BLUE SCORES!');beep(820,.22,'triangle',.06);setTimeout(()=>beep(1100,.28,'triangle',.05),120)}
  else{orangeScore++;$('orange-score').textContent=orangeScore;showToast('ORANGE SCORES!');beep(260,.2,'sawtooth',.04)}
  resetKickoff();
}
function isDown(k){return !!keys[k]}
function driveCar(root,state,dt,isPlayer){
  const forward= new THREE.Vector3(Math.sin(state.yaw),0,-Math.cos(state.yaw));
  const right=new THREE.Vector3(Math.cos(state.yaw),0,Math.sin(state.yaw));
  let throttle=0,steer=0,boosting=false,jump=false;
  if(isPlayer){
    throttle=(isDown('KeyW')||isDown('ArrowUp')||touch.forward?1:0)-(isDown('KeyS')||isDown('ArrowDown')||touch.back?1:0);
    steer=(isDown('KeyD')||isDown('ArrowRight')||touch.right?1:0)-(isDown('KeyA')||isDown('ArrowLeft')||touch.left?1:0);
    boosting=(isDown('ShiftLeft')||isDown('ShiftRight')||touch.boost)&&boostAmount>0;
    jump=isDown('Space')||touch.jump;
  }else{
    const toBall=new THREE.Vector3(ball.pos.x-root.position.x,0,ball.pos.z-root.position.z);
    const targetYaw=Math.atan2(toBall.x,-toBall.z);
    let angle=((targetYaw-state.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;
    steer=clamp(angle*1.6,-1,1); throttle=.92;
    boosting=toBall.length()>12&&Math.random()<.6&&boostAmount>15;
  }
  const speed=state.vel.dot(forward);
  const turnFactor=clamp(Math.abs(speed)/5,.2,1);
  state.yaw+=steer*(1.9*turnFactor)*dt*(speed<-.5?-1:1);
  const newForward=new THREE.Vector3(Math.sin(state.yaw),0,-Math.cos(state.yaw));
  const maxSpeed=boosting?33:21;
  state.vel.addScaledVector(newForward,throttle*(boosting?34:18)*dt);
  state.vel.multiplyScalar(Math.pow(throttle===0?.985:.994,dt*60));
  const vForward=state.vel.dot(newForward);
  if(vForward>maxSpeed)state.vel.addScaledVector(newForward,maxSpeed-vForward);
  if(vForward< -10)state.vel.addScaledVector(newForward,-10-vForward);
  // reduce sideways slip without fully locking the car
  const sideSpeed=state.vel.dot(new THREE.Vector3(Math.cos(state.yaw),0,Math.sin(state.yaw)));
  state.vel.addScaledVector(new THREE.Vector3(Math.cos(state.yaw),0,Math.sin(state.yaw)),-sideSpeed*Math.min(1,dt*4.4));
  if(isPlayer&&boosting){boostAmount=Math.max(0,boostAmount-29*dt);state.vel.addScaledVector(newForward,9*dt)}
  else if(isPlayer)boostAmount=Math.min(100,boostAmount+7*dt);
  if(isPlayer)updateBoost();
  if(jump&&!jumpWasDown&&state.grounded){state.vy=9.2;state.grounded=false;state.airTime=0;beep(350,.07,'triangle')}
  if(isPlayer)jumpWasDown=jump;
  if(!state.grounded){
    state.airTime+=dt;state.vy-=20*dt;state.vertical+=state.vy*dt;
    if(isPlayer){
      const airRoll=(isDown('KeyQ')?-1:0)+(isDown('KeyE')?1:0);
      root.userData.chassis.rotation.z=THREE.MathUtils.damp(root.userData.chassis.rotation.z,airRoll*.55,4,dt);
      if(isDown('KeyA')||isDown('ArrowLeft'))state.yaw-=.65*dt;
      if(isDown('KeyD')||isDown('ArrowRight'))state.yaw+=.65*dt;
    }
    if(state.vertical<=0){state.vertical=0;state.vy=0;state.grounded=true;state.airTime=0;root.userData.chassis.rotation.z=0}
  }
  state.pos.x+=state.vel.x*dt;state.pos.z+=state.vel.z*dt;
  // Side walls
  if(state.pos.x < -28){state.pos.x=-28;state.vel.x=Math.abs(state.vel.x)*.55}
  if(state.pos.x > 28){state.pos.x=28;state.vel.x=-Math.abs(state.vel.x)*.55}
  // End walls except goal opening
  const insideGoal=Math.abs(state.pos.x)<7.7&&state.vertical<5.5;
  if(state.pos.z < -42 && !insideGoal){state.pos.z=-42;state.vel.z=Math.abs(state.vel.z)*.55}
  if(state.pos.z > 42 && !insideGoal){state.pos.z=42;state.vel.z=-Math.abs(state.vel.z)*.55}
  root.position.set(state.pos.x,state.vertical+.08,state.pos.z);
  root.rotation.y=state.yaw;
  root.userData.wheels.forEach((w,i)=>{w.rotation.x+=vForward*dt*1.7});
  root.userData.boost.visible=!!boosting;
  if(boosting){root.userData.flame.scale.setScalar(.7+Math.random()*.65);root.userData.flame.material.color.setHSL(.52+Math.random()*.08,.95,.6)}
  root.userData.shadow.position.x=state.pos.x;root.userData.shadow.position.z=state.pos.z;root.userData.shadow.scale.setScalar(Math.max(.55,1-state.vertical*.055));root.userData.shadow.material.opacity=Math.max(.05,.24-state.vertical*.02);
  return newForward;
}
function collideBallCar(root,state,dt){
  const carCenter=new THREE.Vector3(state.pos.x,state.vertical+.85,state.pos.z);
  const delta=ball.pos.clone().sub(carCenter);
  const dist=delta.length(), minDist=ball.radius+1.2;
  if(dist<minDist){
    if(dist<.001)delta.set(0,1,0);else delta.normalize();
    ball.pos.copy(carCenter).addScaledVector(delta,minDist+.015);
    const carVelocity=state.vel.clone();carVelocity.y=state.vy||0;
    const relative=ball.vel.clone().sub(carVelocity);
    const impact=Math.max(0,-relative.dot(delta));
    ball.vel.addScaledVector(delta,Math.max(5,impact*1.25+7));
    ball.vel.addScaledVector(state.vel,.26);
    if(state.vertical>1)ball.vel.y+=2.8;
    const speed=state.vel.length();
    if(speed>13)ball.vel.addScaledVector(delta,Math.min(12,(speed-13)*.55));
    if(isFinite(ball.vel.length())){beep(170+Math.min(400,speed*8),.04,'square',.012)}
  }
}
function updateBall(dt){
  ball.vel.y-=17*dt;ball.pos.addScaledVector(ball.vel,dt);
  // arena side walls
  if(ball.pos.x < -29.1){ball.pos.x=-29.1;ball.vel.x=Math.abs(ball.vel.x)*.78}
  if(ball.pos.x > 29.1){ball.pos.x=29.1;ball.vel.x=-Math.abs(ball.vel.x)*.78}
  // end wall allows goal mouth
  const inMouth=Math.abs(ball.pos.x)<7.2&&ball.pos.y<6.3;
  if(ball.pos.z < -42.8&&!inMouth){ball.pos.z=-42.8;ball.vel.z=Math.abs(ball.vel.z)*.78}
  if(ball.pos.z > 42.8&&!inMouth){ball.pos.z=42.8;ball.vel.z=-Math.abs(ball.vel.z)*.78}
  if(ball.pos.y<ball.radius){ball.pos.y=ball.radius;if(ball.vel.y<0)ball.vel.y=-ball.vel.y*.72;ball.vel.x*=.985;ball.vel.z*=.985;if(Math.abs(ball.vel.y)<.7)ball.vel.y=0}
  ball.vel.multiplyScalar(Math.pow(.998,dt*60));
  const horizontal=Math.hypot(ball.vel.x,ball.vel.z);if(horizontal>36){ball.vel.x*=36/horizontal;ball.vel.z*=36/horizontal}
  ballGroup.position.copy(ball.pos);ballGroup.rotation.x+=ball.vel.z*dt*.35;ballGroup.rotation.z-=ball.vel.x*dt*.35;
  ballWire.rotation.copy(ballGroup.rotation);ballGlow.rotation.y+=dt*.45;
  if(ball.pos.z < -44.2 && Math.abs(ball.pos.x)<7.2 && ball.pos.y<6.1)score('blue');
  else if(ball.pos.z > 44.2 && Math.abs(ball.pos.x)<7.2 && ball.pos.y<6.1)score('orange');
}
function updateBot(dt){
  // Bot steers toward ball, but repositions behind it when far away
  const target=new THREE.Vector3(ball.pos.x,0,ball.pos.z);
  if(Math.abs(ball.pos.z)<8)target.z=ball.pos.z- (ball.pos.z>0?8:-8);
  const to=target.clone().sub(bot.position);const targetYaw=Math.atan2(to.x,-to.z);
  let delta=((targetYaw-botState.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;
  botState.yaw+=clamp(delta,-1.8*dt,1.8*dt);
  const f=new THREE.Vector3(Math.sin(botState.yaw),0,-Math.cos(botState.yaw));
  botState.vel.addScaledVector(f,14*dt);botState.vel.multiplyScalar(.992);
  if(botState.vel.length()>17)botState.vel.setLength(17);
  bot.position.x+=botState.vel.x*dt;bot.position.z+=botState.vel.z*dt;
  if(bot.position.x<-28||bot.position.x>28){bot.position.x=clamp(bot.position.x,-28,28);botState.vel.x*=-.5}
  if(bot.position.z<-42||bot.position.z>42){bot.position.z=clamp(bot.position.z,-42,42);botState.vel.z*=-.5}
  bot.rotation.y=botState.yaw;botState.pos=bot.position;botState.vertical=0;
  bot.userData.wheels.forEach(w=>w.rotation.x+=botState.vel.dot(f)*dt*1.5);
}
function updateCamera(dt){
  const forward=new THREE.Vector3(Math.sin(carState.yaw),0,-Math.cos(carState.yaw));
  const desired=player.position.clone().addScaledVector(forward,-10.5);desired.y+=5.6;
  camera.position.lerp(desired,1-Math.exp(-3.8*dt));
  const look=player.position.clone().addScaledVector(forward,5);look.y+=1.2;
  camera.lookAt(look);
}
function updateClock(dt){
  if(!matchStarted||paused)return;
  matchTime=Math.max(0,matchTime-dt);
  const m=Math.floor(matchTime/60),s=Math.floor(matchTime%60);
  $('match-time').textContent=`${m}:${String(s).padStart(2,'0')}`;
  if(matchTime<=0){paused=true;showToast(blueScore===orangeScore?'FULL TIME — DRAW':blueScore>orangeScore?'BLUE WINS!':'ORANGE WINS!',4);$('pause-screen').classList.remove('hidden');$('pause-screen').querySelector('h2').innerHTML='FULL<br><span>TIME.</span>'}
}
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min(.033,(now-lastTime)/1000||.016);lastTime=now;
  if(!paused&&matchStarted){
    driveCar(player,carState,dt,true);
    updateBot(dt);
    collideBallCar(player,carState,dt);collideBallCar(bot,botState,dt);
    updateBall(dt);updateClock(dt);updateCamera(dt);
    if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show')}
  } else updateCamera(dt);
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);

$('play-button').addEventListener('click',()=>{
  $('start-screen').classList.add('hidden');paused=false;matchStarted=true;matchTime=300;blueScore=0;orangeScore=0;
  $('blue-score').textContent='0';$('orange-score').textContent='0';$('match-time').textContent='5:00';
  $('connection-label').textContent='PRACTICE MATCH';resetKickoff();renderer.domElement.focus();
});
$('resume-button').addEventListener('click',()=>{$('pause-screen').classList.add('hidden');paused=false;});
$('restart-button').addEventListener('click',()=>{$('pause-screen').classList.add('hidden');matchTime=300;blueScore=0;orangeScore=0;$('blue-score').textContent='0';$('orange-score').textContent='0';$('match-time').textContent='5:00';matchStarted=true;paused=false;resetKickoff()});
$('sound-button').addEventListener('click',()=>{soundOn=!soundOn;$('sound-button').textContent=soundOn?'♫':'♪';if(soundOn)beep(600,.08)});
addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  if(e.code==='Escape'&&matchStarted){
    if($('pause-screen').classList.contains('hidden')){paused=true;$('pause-screen').classList.remove('hidden')}
    else{$('pause-screen').classList.add('hidden');paused=false}
  }
});
addEventListener('keyup',e=>{keys[e.code]=false});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
document.querySelectorAll('[data-control]').forEach(btn=>{
  const c=btn.dataset.control;
  const down=e=>{e.preventDefault();touch[c]=true;};
  const up=e=>{e.preventDefault();touch[c]=false;};
  btn.addEventListener('pointerdown',down);btn.addEventListener('pointerup',up);btn.addEventListener('pointercancel',up);btn.addEventListener('pointerleave',up);
});
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});
$('loading').classList.add('done');setTimeout(()=>$('loading').remove(),700);
