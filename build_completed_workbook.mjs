import fs from 'node:fs/promises';
import path from 'node:path';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const inputPath = 'G:/WXWork/1688855186823616/Cache/File/2026-09/儿歌试听页内容表.xlsx';
const outputDir = 'D:/Codex/养娃乐产品/outputs/song-url-completion';
const outputPath = path.join(outputDir, '儿歌试听页内容表_已补充资源URL.xlsx');
const previewPath = path.join(outputDir, '试听页_预览.png');
const rows = JSON.parse(await fs.readFile('final_song_matches.json', 'utf8'));
const accepted = rows.filter((row) => row.accepted);
const platformNames = { netease: '网易云音乐', qq: 'QQ音乐', kugou: '酷狗音乐', kuwo: '酷我音乐', migu: '咪咕音乐' };

const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sheet = wb.worksheets.getItem('试听页内容');
const overview = wb.worksheets.getItem('概览');

// Preserve existing styling by extending the adjacent final column's formatting.
sheet.getRange('I1:I201').copyTo(sheet.getRange('J1:J201'), 'all');
sheet.getRange('J1:J201').clear({ applyTo: 'contents' });
sheet.getRange('J1').values = [['歌曲资源URL']];
sheet.getRange('J1:J201').format.columnWidth = 48;

for (const row of accepted) {
  const r = row.excelRow;
  const match = row.match;
  sheet.getRange(`D${r}`).values = [['已匹配']];
  sheet.getRange(`E${r}`).values = [[match.title]];
  sheet.getRange(`F${r}`).values = [[String(match.songid ?? '')]];
  sheet.getRange(`H${r}`).values = [[`通过音乐搜索器补充；来源：${platformNames[match.platform] || match.platform}；演唱：${match.author || '未标注'}`]];
  sheet.getRange(`J${r}`).values = [[match.url]];
  sheet.getRange(`A${r}:J${r}`).format.fill = '#E8F8F1';
  sheet.getRange(`A${r}:J${r}`).format.font = { name: 'Calibri', size: 11, color: '#000000' };
}

const detailValues = sheet.getRange('A2:J201').values;
const matchedCount = detailValues.filter((row) => row[3] === '已匹配').length;
const unmatchedCount = detailValues.filter((row) => row[3] === '无合适匹配').length;
const unavailableCount = detailValues.filter((row) => row[3] === '无合适匹配' && String(row[7] || '').includes('曲库无此曲')).length;
overview.getRange('B3:B5').values = [[matchedCount], [unmatchedCount], [unavailableCount]];

wb.recalculate();

const detailCheck = await wb.inspect({
  kind: 'table', sheetId: '试听页内容', range: 'A1:J201', include: 'values,formulas',
  tableMaxRows: 205, tableMaxCols: 10, maxChars: 60000,
});
const errorCheck = await wb.inspect({
  kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options: { useRegex: true, maxResults: 300 }, summary: 'final formula error scan', maxChars: 5000,
});
await fs.mkdir(outputDir, { recursive: true });
const preview = await wb.render({ sheetName: '试听页内容', range: 'A1:J25', scale: 1.3, format: 'png' });
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(outputPath);

const saved = await SpreadsheetFile.importXlsx(await FileBlob.load(outputPath));
const savedValues = saved.worksheets.getItem('试听页内容').getRange('A1:J201').values;
const urlCount = savedValues.slice(1).filter((row) => String(row[9] || '').startsWith('http')).length;
const savedMatched = savedValues.slice(1).filter((row) => row[3] === '已匹配').length;
const savedUnmatched = savedValues.slice(1).filter((row) => row[3] === '无合适匹配').length;
const verification = {
  outputPath, previewPath, addedUrls: accepted.length, urlCount, matchedCount: savedMatched,
  unmatchedCount: savedUnmatched, overview: saved.worksheets.getItem('概览').getRange('A1:B6').values,
  detailInspect: detailCheck.ndjson, errorInspect: errorCheck.ndjson,
};
await fs.writeFile(path.join(outputDir, 'verification.json'), JSON.stringify(verification, null, 2), 'utf8');
console.log(JSON.stringify({ outputPath, previewPath, addedUrls: accepted.length, urlCount, matchedCount: savedMatched, unmatchedCount: savedUnmatched, overview: verification.overview, errorInspect: errorCheck.ndjson }, null, 2));
