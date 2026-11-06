import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,dirname,relative,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {software} from '../shared/catalog-data.js';
const root=fileURLToPath(new URL('../',import.meta.url));
async function walk(dir){let files=[];for(const item of await readdir(dir,{withFileTypes:true})){if(item.name.startsWith('.')||item.name==='node_modules')continue;const p=resolve(dir,item.name);files.push(...(item.isDirectory()?await walk(p):[p]));}return files;}
const files=await walk(root),errors=[],hashes=new Map();let total=0;
async function check(ref,source){if(/^(https?:|data:|#|mailto:)/.test(ref)||ref.includes('${'))return;let target=resolve(dirname(source),ref.split(/[?#]/)[0]);try{if((await stat(target)).isDirectory())target=resolve(target,'index.html');await stat(target);}catch{errors.push(`${relative(root,source)}: missing ${ref}`);}}
for(const file of files){
 const data=await readFile(file);total+=data.length;
 if(['.stl','.png','.svg'].includes(extname(file))){const hash=createHash('sha256').update(data).digest('hex');if(hashes.has(hash))errors.push(`Duplicate asset: ${relative(root,file)} and ${hashes.get(hash)}`);hashes.set(hash,relative(root,file));}
 if(['.js','.mjs'].includes(extname(file)))execFileSync(process.execPath,['--check',file]);
 if(extname(file)==='.html'){for(const match of data.toString().matchAll(/(?:src|href)="([^"]+)"/g))await check(match[1],file);}
 if(['.js','.mjs'].includes(extname(file))){for(const match of data.toString().matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g))await check(match[1],file);for(const match of data.toString().matchAll(/new URL\(['"](\.[^'"]+)['"],import\.meta\.url\)/g))await check(match[1],file);}
}
for(const app of software)for(const tutorial of app.tutorials)await check(`./${app.id}/${tutorial.id}/index.html`,resolve(root,'index.html'));
const catalog=await readFile(resolve(root,'shared/catalog.js'),'utf8');if(/three|STLLoader|\.stl|simulator\.js/.test(catalog))errors.push('Catalog must not load simulator assets');
if(total>100*1024*1024)errors.push('Site exceeded the 100 MB review budget; inspect asset growth before publishing');
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`Checked ${files.length} files; local paths and modules resolve; no duplicate media. Site source: ${(total/1e6).toFixed(2)} MB (excluding .git).`);
