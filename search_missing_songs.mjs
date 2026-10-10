import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const inputPath = 'G:/WXWork/1688855186823616/Cache/File/2026-09/儿歌试听页内容表.xlsx';
const endpoint = 'https://music.itzo.cn/a.php';
const platforms = ['netease', 'qq', 'kugou', 'kuwo', 'migu', 'baidu', '1ting', '5singfc'];
const childArtistHints = ['儿歌', '贝瓦', '宝宝巴士', '儿童', '童声', '小蓓蕾', '少儿', '童谣', '幼儿'];
const unwanted = /(?:\bDJ\b|串烧|伴奏|纯音乐|广场舞|Remix|Live|现场版|抖音版|加速版|慢速版|铃声)/i;

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[\s·•・,，.。!！?？:：;；'"“”‘’《》<>\[\]【】\-_—/\\]/g, '');
}

function variants(target) {
  const values = [target];
  const main = target.replace(/[（(].*?[）)]/g, '').trim();
  if (main) values.push(main);
  for (const match of target.matchAll(/[（(](.*?)[）)]/g)) {
    values.push(...match[1].split(/[\/、,，]/).map((v) => v.trim()));
  }
  return [...new Set(values.filter(Boolean))];
}

function scoreCandidate(target, candidate) {
  const title = String(candidate.title || '');
  const author = String(candidate.author || '');
  if (!candidate.url || unwanted.test(title)) return -100;
  const keys = variants(target).map(normalize).filter(Boolean);
  const nt = normalize(title);
  let score = -100;
  for (const key of keys) {
    if (nt === key) score = Math.max(score, 100);
    else if (nt.startsWith(key) && nt.length <= key.length + 5) score = Math.max(score, 82);
    else if (key.startsWith(nt) && key.length <= nt.length + 3) score = Math.max(score, 75);
  }
  if (score < 0) return score;
  if (childArtistHints.some((hint) => author.includes(hint))) score += 8;
  if (/主题曲/.test(title) && !/主题曲/.test(target)) score -= 3;
  return score;
}

async function createSession() {
  const first = await fetch(endpoint, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const cookie = first.headers.get('set-cookie')?.split(';')[0] || '';
  await first.text();
  return cookie;
}

async function query(cookie, input, type, page = 1) {
  const body = new URLSearchParams({ input, filter: 'name', type, page: String(page) });
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'X-Requested-With': 'XMLHttpRequest',
          Referer: endpoint,
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: cookie,
        },
        body,
        signal: AbortSignal.timeout(30000),
      });
      const text = await response.text();
      return JSON.parse(text).data || [];
    } catch (error) {
      if (attempt === 1) return [];
    }
  }
  return [];
}

async function findBest(cookie, target) {
  let best = null;
  const baseQueries = variants(target);
  const queries = [...new Set([
    ...baseQueries,
    ...baseQueries.map((value) => `${value} 儿歌`),
    ...baseQueries.map((value) => `${value} 儿童歌曲`),
  ])];
  for (const platform of platforms) {
    for (const search of queries) {
      for (const page of [1, 2]) {
        const results = await query(cookie, search, platform, page);
        for (const result of results) {
          const score = scoreCandidate(target, result);
          if (!best || score > best.score) best = { ...result, platform, score, search, page };
        }
        if (best?.score >= 108) return best;
      }
    }
  }
  return best?.score >= 82 ? best : null;
}

async function mapLimit(items, limit, fn) {
  const output = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await fn(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return output;
}

const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sheet = wb.worksheets.getItem('试听页内容');
const rows = sheet.getRange('A2:I201').values;
const missing = rows
  .map((row, index) => ({ excelRow: index + 2, number: row[0], target: row[1], status: row[3], reason: row[7] }))
  .filter((row) => row.status === '无合适匹配');

let prior = null;
try {
  prior = JSON.parse(await fs.readFile('song_matches.json', 'utf8'));
} catch {}

const targets = prior
  ? prior.results.filter((row) => !row.match || row.match.score < 108)
  : missing;

const cookie = await createSession();
const startedAt = new Date().toISOString();
const refreshed = await mapLimit(targets, 5, async (row, index) => {
  const match = await findBest(cookie, row.target);
  console.log(`${index + 1}/${targets.length}\t${row.target}\t${match ? `${match.title} - ${match.author}` : 'NO MATCH'}`);
  return { ...row, match };
});

const refreshByRow = new Map(refreshed.map((row) => [row.excelRow, row]));
const results = prior
  ? prior.results.map((row) => {
      const next = refreshByRow.get(row.excelRow);
      if (!next?.match) return row;
      if (!row.match || next.match.score > row.match.score) return next;
      return row;
    })
  : refreshed;

await fs.writeFile('song_matches.json', JSON.stringify({ startedAt, completedAt: new Date().toISOString(), results }, null, 2), 'utf8');
console.log(`DONE matched=${results.filter((row) => row.match).length} unmatched=${results.filter((row) => !row.match).length}`);
