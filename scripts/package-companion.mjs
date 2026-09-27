import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
// A standard uncompressed ZIP keeps this source download dependency-free.
// The companion is small; ZIP64 and compression are unnecessary here.
const root = "projects/inventory-desk";
const excluded = new Set(["bin","obj","node_modules","data","backups","test-results","playwright-report",".git"]);
const entries = [];
async function walk(directory, relative = "") {
  for (const entry of await readdir(directory,{withFileTypes:true})) {
    if (excluded.has(entry.name) || entry.name.startsWith(".env")) continue;
    const name = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await walk(join(directory,entry.name),name);
    else if (entry.isFile()) entries.push({ name:`inventory-desk/${name}`, data:await readFile(join(directory,entry.name)) });
  }
}
await walk(root);
const crcTable = Array.from({length:256},(_,index)=>{ let c=index; for(let bit=0;bit<8;bit++) c=(c&1)?0xedb88320^(c>>>1):c>>>1; return c>>>0; });
const crc32 = buffer => {let crc=0xffffffff;for(const byte of buffer)crc=crcTable[(crc^byte)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;};
const local=[]; const central=[]; let offset=0;
for (const entry of entries.sort((a,b)=>a.name.localeCompare(b.name))) {
  const name=Buffer.from(entry.name); const crc=crc32(entry.data);
  const header=Buffer.alloc(30); header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt32LE(crc,14);header.writeUInt32LE(entry.data.length,18);header.writeUInt32LE(entry.data.length,22);header.writeUInt16LE(name.length,26);
  const record=Buffer.alloc(46);record.writeUInt32LE(0x02014b50,0);record.writeUInt16LE(20,4);record.writeUInt16LE(20,6);record.writeUInt16LE(0x800,8);record.writeUInt32LE(crc,16);record.writeUInt32LE(entry.data.length,20);record.writeUInt32LE(entry.data.length,24);record.writeUInt16LE(name.length,28);record.writeUInt32LE(offset,42);
  header.writeUInt16LE(0x21,12);record.writeUInt16LE(0x21,14); // 1980-01-01, valid DOS date.
  local.push(header,name,entry.data);central.push(record,name);offset+=header.length+name.length+entry.data.length;
}
const directory=Buffer.concat(central);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
await mkdir("public/downloads",{recursive:true});await writeFile("public/downloads/inventory-desk.zip",Buffer.concat([...local,directory,end]));
console.log(`Packaged Inventory Desk source (${entries.length} files).`);
