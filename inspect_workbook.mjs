import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const inputPath = 'G:/WXWork/1688855186823616/Cache/File/2026-09/儿歌试听页内容表.xlsx';
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sh = wb.worksheets.getItem('试听页内容');
const used = sh.getUsedRange();
console.log(JSON.stringify({values: used.values, formulas: used.formulas}, null, 2));
const preview = await wb.render({sheetName:'试听页内容', range:'A1:I30', scale:1.5, format:'png'});
await fs.writeFile('试听页_before.png', new Uint8Array(await preview.arrayBuffer()));
