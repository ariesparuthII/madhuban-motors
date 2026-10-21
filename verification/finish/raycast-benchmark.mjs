import {NodeIO} from '/tmp/mm-performance/node_modules/@gltf-transform/core/dist/index.js';
import {ALL_EXTENSIONS} from '/tmp/mm-performance/node_modules/@gltf-transform/extensions/dist/index.js';
import {MeshoptDecoder} from '/tmp/mm-performance/node_modules/meshoptimizer/index.js';
import * as T from '../../assets/vendor/three/showroom-core-finish.min.js';
import {speedUpSurfaceSampling} from '../../assets/web/surface-raycast.min.js';
import fs from 'node:fs';
await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
const doc=await io.read('assets/3d/concept-car.glb'),meshes=[];
for(const node of doc.getRoot().listNodes())for(const p of node.getMesh()?.listPrimitives()||[]){
 if(!/^Paint/.test(p.getMaterial()?.getName()||''))continue;
 const pos=p.getAttribute('POSITION'),geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos.getArray(),pos.getElementSize(),pos.getNormalized()));
 const indices=p.getIndices();if(indices)geo.setIndex(new T.BufferAttribute(indices.getArray(),1));
 const m=new T.Mesh(geo,new T.MeshBasicMaterial({side:T.DoubleSide}));m.matrixAutoUpdate=false;m.matrix.fromArray(node.getWorldMatrix());m.updateMatrixWorld(true);meshes.push(m);
}
const ray=new T.Raycaster(),points=Array.from({length:420},(_,i)=>[-.85+(i*37%100)/100*1.7,-1.6+(i*61%100)/100*3.9]);
function sample(){return points.map(([x,z])=>{ray.set(new T.Vector3(x,3,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(meshes,false)[0];return h?[h.point.x,h.point.y,h.point.z]:null})}
let at=performance.now();const before=sample(),beforeMs=performance.now()-at;
at=performance.now();speedUpSurfaceSampling(meshes);const buildMs=performance.now()-at;ray.firstHitOnly=true;
at=performance.now();const after=sample(),afterMs=performance.now()-at;
let maxError=0;for(let i=0;i<points.length;i++){if(Boolean(before[i])!==Boolean(after[i]))throw Error('Hit mismatch '+i);if(before[i])maxError=Math.max(maxError,Math.hypot(...before[i].map((v,j)=>v-after[i][j])))}
if(maxError>1e-5)throw Error('Surface mismatch '+maxError);
const results={rays:points.length,meshes:meshes.length,beforeMs,buildMs,afterMs,maxError};fs.writeFileSync('verification/finish/raycast-results.json',JSON.stringify(results,null,2));console.log(results);
