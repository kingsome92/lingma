import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const sourcePath = 'G:/WXWork/1688855186823616/Cache/File/2026-09/儿歌试听页内容表.xlsx';
const outputPath = 'D:/Codex/养娃乐产品/outputs/song-url-completion/儿歌试听页内容表_已补充资源URL.xlsx';
const source = await SpreadsheetFile.importXlsx(await FileBlob.load(sourcePath));
const output = await SpreadsheetFile.importXlsx(await FileBlob.load(outputPath));
const matches = JSON.parse(await fs.readFile('final_song_matches.json', 'utf8')).filter((row) => row.accepted);
const changedRows = new Set(matches.map((row) => row.excelRow));
const sourceValues = source.worksheets.getItem('试听页内容').getRange('A1:I201').values;
const outputValues = output.worksheets.getItem('试听页内容').getRange('A1:J201').values;
const allowedCols = new Set([3, 4, 5, 7]);
const unexpected = [];
for (let r = 0; r < sourceValues.length; r += 1) {
  for (let c = 0; c < 9; c += 1) {
    if (changedRows.has(r + 1) && allowedCols.has(c)) continue;
    if (JSON.stringify(sourceValues[r][c]) !== JSON.stringify(outputValues[r][c])) {
      unexpected.push({ row: r + 1, col: c + 1, before: sourceValues[r][c], after: outputValues[r][c] });
    }
  }
}
const sourceFormulas = source.worksheets.getItem('试听页内容').getRange('A1:I201').formulas;
const outputFormulas = output.worksheets.getItem('试听页内容').getRange('A1:I201').formulas;
const formulasPreserved = JSON.stringify(sourceFormulas) === JSON.stringify(outputFormulas);
const overviewPreview = await output.render({ sheetName: '概览', range: 'A1:B6', scale: 2, format: 'png' });
const previewPath = 'D:/Codex/养娃乐产品/outputs/song-url-completion/概览_预览.png';
await fs.writeFile(previewPath, new Uint8Array(await overviewPreview.arrayBuffer()));
const report = {
  sheets: output.worksheets.items.map((sheet) => sheet.name),
  addedUrls: outputValues.slice(1).filter((row) => String(row[9] || '').startsWith('http')).length,
  changedRows: changedRows.size,
  unexpectedChanges: unexpected,
  formulasPreserved,
  previewPath,
};
console.log(JSON.stringify(report, null, 2));
if (unexpected.length || !formulasPreserved || report.addedUrls !== matches.length) process.exitCode = 1;
