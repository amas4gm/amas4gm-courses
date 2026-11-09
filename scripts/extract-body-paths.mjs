import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {extractToolpaths} from './support-toolpaths.mjs';

const [source,output]=process.argv.slice(2);
if(!source||!output)throw new Error('Usage: node scripts/extract-body-paths.mjs input.gcode output.bin.gz');
const input=await readFile(source),{segments,counts}=extractToolpaths(input.toString());
// Height order lets the renderer omit every segment above the selected layer.
const order=Array.from({length:segments.length/8},(_,i)=>i).sort((a,b)=>Math.max(segments[a*8+1],segments[a*8+4])-Math.max(segments[b*8+1],segments[b*8+4]));
const sorted=new Float32Array(segments.length);
order.forEach((index,i)=>sorted.set(segments.subarray(index*8,index*8+8),i*8));
const compressed=gzipSync(Buffer.from(sorted.buffer),{level:9});await writeFile(output,compressed);
const metadata={source:'Benchy.3mf sliced with Bambu Studio 02.08.02.61',gcodeSha256:createHash('sha256').update(input).digest('hex'),format:'Gzip-compressed little-endian Float32 records: start XYZ, end XYZ, width, height (8 floats). Simulator Y-up, mm, plate center 128/128. Sorted by maximum endpoint height.',arcChordErrorMm:.015,segments:sorted.length/8,counts,compressedBytes:compressed.byteLength,decodedBytes:sorted.byteLength,header:input.toString().split('; HEADER_BLOCK_END')[0].trim()};
await writeFile(output.replace(/\.bin\.gz$/,'.json'),JSON.stringify(metadata,null,2)+'\n');console.log(metadata);
