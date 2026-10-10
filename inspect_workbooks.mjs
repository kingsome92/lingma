import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const paths = [
  'E:/养娃乐/贝瓦儿歌/全新-贝瓦音乐.xlsx',
  'C:/Users/kings/Desktop/中文常见儿歌200首.xlsx',
];

for (const path of paths) {
  try {
    const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
    console.log('FILE', path);
    const result = await wb.inspect({
      kind: 'workbook,sheet,table',
      maxChars: 20000,
      tableMaxRows: 12,
      tableMaxCols: 12,
      tableMaxCellChars: 120,
    });
    console.log('INSPECT', JSON.stringify(result));
  } catch (err) {
    console.error('ERROR', path, err?.stack || err);
  }
}
