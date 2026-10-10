import fs from 'node:fs/promises';

const data = JSON.parse(await fs.readFile('song_matches.json', 'utf8'));
const exclusions = new Map([
  [49, '同名成人情歌，歌词与目标儿歌不符'],
]);

async function check(row) {
  if (!row.match || exclusions.has(Number(row.number))) {
    return { ...row, accepted: false, validation: exclusions.get(Number(row.number)) || '未找到可靠匹配' };
  }
  try {
    const response = await fetch(row.match.url, {
      headers: { Range: 'bytes=0-1023', 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(20000),
    });
    const type = response.headers.get('content-type') || '';
    const bytes = new Uint8Array(await response.arrayBuffer());
    const ok = response.ok && bytes.length > 0 && !/text\/html/i.test(type);
    return {
      ...row,
      accepted: ok,
      validation: ok ? `HTTP ${response.status}; ${type}; ${bytes.length} bytes` : `链接不可用：HTTP ${response.status}; ${type}; ${bytes.length} bytes`,
      finalUrl: response.url,
    };
  } catch (error) {
    return { ...row, accepted: false, validation: `链接检测失败：${error.message}` };
  }
}

const rows = data.results;
const output = new Array(rows.length);
let cursor = 0;
async function worker() {
  while (cursor < rows.length) {
    const index = cursor++;
    output[index] = await check(rows[index]);
    console.log(`${index + 1}/${rows.length}\t${rows[index].target}\t${output[index].accepted ? 'OK' : 'REJECT'}\t${output[index].validation}`);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
await fs.writeFile('validated_song_matches.json', JSON.stringify(output, null, 2), 'utf8');
console.log(`DONE accepted=${output.filter((row) => row.accepted).length} rejected=${output.filter((row) => !row.accepted).length}`);
