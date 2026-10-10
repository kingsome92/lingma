import fs from 'node:fs/promises';

const endpoint = 'https://music.itzo.cn/a.php';
const platforms = ['netease', 'qq', 'kugou', 'kuwo', 'migu'];
const childHints = ['儿歌', '贝瓦', '贝乐虎', '宝宝巴士', '儿童', '童声', '小蓓蕾', '少儿', '童谣', '幼儿', '火火兔'];
const unwanted = /(?:\bDJ\b|串烧|伴奏|纯音乐|广场舞|Remix|Live|现场版|抖音版|加速版|慢速版|铃声)/i;
const hardReject = new Set([49]);

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[（(].*?[）)]/g, '').replace(/[\s·•・,，.。!！?？:：;；'"“”‘’《》<>\[\]【】\-_—/\\]/g, '');
}
function keys(target) {
  const all = [target, target.replace(/[（(].*?[）)]/g, '').trim()];
  for (const match of target.matchAll(/[（(](.*?)[）)]/g)) all.push(...match[1].split(/[\/、,，]/));
  return [...new Set(all.map(normalize).filter(Boolean))];
}
function score(target, result, platform) {
  if (!result?.url || unwanted.test(result.title || '')) return -100;
  const nt = normalize(result.title);
  let value = -100;
  for (const key of keys(target)) {
    if (nt === key) value = Math.max(value, 100);
    else if (nt.startsWith(key) && nt.length <= key.length + 6) value = Math.max(value, 82);
    else if (key.startsWith(nt) && key.length <= nt.length + 3) value = Math.max(value, 75);
  }
  if (value < 0) return value;
  if (childHints.some((hint) => String(result.author || '').includes(hint))) value += 8;
  if (platform === 'netease') value += 4;
  return value;
}
async function sessionCookie() {
  const response = await fetch(endpoint, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const cookie = response.headers.get('set-cookie')?.split(';')[0] || '';
  await response.text();
  return cookie;
}
async function query(cookie, input, type, page) {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0', 'X-Requested-With': 'XMLHttpRequest', Referer: endpoint,
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', Cookie: cookie,
      },
      body: new URLSearchParams({ input, filter: 'name', type, page: String(page) }),
      signal: AbortSignal.timeout(30000),
    });
    const parsed = JSON.parse(await response.text());
    return parsed.data || [];
  } catch { return []; }
}
async function validUrl(url) {
  try {
    const response = await fetch(url, { headers: { Range: 'bytes=0-1023', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(20000) });
    const type = response.headers.get('content-type') || '';
    const bytes = new Uint8Array(await response.arrayBuffer());
    return response.ok && bytes.length > 0 && !/text\/html/i.test(type);
  } catch { return false; }
}
async function recover(cookie, row) {
  if (hardReject.has(Number(row.number))) return { ...row, accepted: false, validation: '同名成人歌曲，未找到可靠儿歌版本' };
  const searches = [...new Set([row.target, `${row.target} 儿歌`, `${row.target} 儿童歌曲`])];
  const candidates = [];
  for (const platform of platforms) {
    for (const search of searches) {
      for (const page of [1, 2]) {
        const results = await query(cookie, search, platform, page);
        for (const result of results) {
          const ranked = score(row.target, result, platform);
          if (ranked >= 82) candidates.push({ ...result, platform, score: ranked, search, page });
        }
      }
    }
  }
  const unique = [...new Map(candidates.map((item) => [`${item.platform}:${item.songid}:${item.url}`, item])).values()]
    .sort((a, b) => b.score - a.score);
  for (const candidate of unique.slice(0, 30)) {
    if (await validUrl(candidate.url)) {
      return { ...row, match: candidate, accepted: true, validation: '已通过音频响应检测', finalUrl: candidate.url };
    }
  }
  return { ...row, accepted: false, validation: unique.length ? '候选链接均不可播放' : '未找到可靠匹配' };
}

const rows = JSON.parse(await fs.readFile('validated_song_matches.json', 'utf8'));
const targets = rows.filter((row) => !row.accepted);
const cookie = await sessionCookie();
const recovered = new Array(targets.length);
let cursor = 0;
async function worker() {
  while (cursor < targets.length) {
    const index = cursor++;
    recovered[index] = await recover(cookie, targets[index]);
    const match = recovered[index].match;
    console.log(`${index + 1}/${targets.length}\t${targets[index].target}\t${recovered[index].accepted ? `${match.title} - ${match.author} (${match.platform})` : 'NO MATCH'}`);
  }
}
await Promise.all(Array.from({ length: 3 }, worker));
const byRow = new Map(recovered.map((row) => [row.excelRow, row]));
const merged = rows.map((row) => byRow.get(row.excelRow) || row);
await fs.writeFile('final_song_matches.json', JSON.stringify(merged, null, 2), 'utf8');
console.log(`DONE accepted=${merged.filter((row) => row.accepted).length} rejected=${merged.filter((row) => !row.accepted).length}`);
