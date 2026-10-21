import {build} from 'esbuild';
import fs from 'node:fs';
await build({entryPoints:['assets/web/surface-raycast-entry.js'],outfile:'assets/web/surface-raycast.min.js',bundle:true,minify:true,format:'esm',target:'es2022',legalComments:'eof',plugins:[{name:'shared-three',setup(b){b.onResolve({filter:/^three$/},()=>({path:'../vendor/three/showroom-core-finish.min.js',external:true}))}}]});
const s=fs.readFileSync('assets/web/surface-raycast.min.js','utf8');const wanted=new Set();
for(const m of s.matchAll(/import\s*\{([^}]+)\}\s*from\s*["'][^"']+showroom-core-finish\.min\.js["']/g))for(const item of m[1].split(','))wanted.add(item.trim().split(/\s+as\s+/)[0]);
const entry=fs.readFileSync('assets/vendor/three/showroom-entry.js','utf8');for(const n of entry.match(/export \{([^}]+)\}/)[1].split(','))wanted.add(n.trim());
fs.writeFileSync('assets/vendor/three/showroom-finish-entry.js','export { '+[...wanted].sort().join(', ')+" } from './three-bundle.min.js';\n");
await build({entryPoints:['assets/vendor/three/showroom-finish-entry.js'],outfile:'assets/vendor/three/showroom-core-finish.min.js',bundle:true,minify:true,format:'esm',target:'es2022',legalComments:'eof'});
