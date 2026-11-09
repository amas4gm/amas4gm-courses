import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {extractSupportPaths} from './support-toolpaths.mjs';

const [source,output]=process.argv.slice(2);
if(!source||!output)throw new Error('Usage: node scripts/extract-supports.mjs input.gcode output.bin');
const input=await readFile(source),{segments,counts}=extractSupportPaths(input.toString());
await writeFile(output,Buffer.from(segments.buffer));
const metadata={source:'Benchy.3mf sliced with its saved settings in Bambu Studio 02.08.02.61',gcodeSha256:createHash('sha256').update(input).digest('hex'),format:'Little-endian Float32 records: start XYZ, end XYZ, width, height (8 floats). Simulator Y-up, millimeters, plate center 128/128.',arcChordErrorMm:.015,segments:segments.length/8,counts,bytes:segments.byteLength,printer:'Bambu Lab X2D',layerHeight:.08,layers:599,grams:12.72,estimatedTime:'1h 50m 24s'};
await writeFile(output.replace(/\.bin$/,'.json'),JSON.stringify(metadata,null,2)+'\n');
console.log(metadata);
