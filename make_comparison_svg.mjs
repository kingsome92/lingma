import fs from 'node:fs/promises';

const html = await fs.readFile('D:/Codex/养娃乐产品/fuzozo-xiaole-comparison.html', 'utf8');
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const clean = (s) => s.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const rows = [...html.matchAll(/<tr>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>/g)].map(m => m.slice(1).map(clean));
const wrap = (s, max) => {
  const chars = [...s]; const out=[];
  for (let i=0;i<chars.length;i+=max) out.push(chars.slice(i,i+max).join(''));
  return out.length ? out : [''];
};
const text = (x,y,content,size,color,weight='400',anchor='start') => `<text x="${x}" y="${y}" font-family="Arial, Microsoft YaHei, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${esc(content)}</text>`;
const lines = (x,y,content,size,color,max,weight='400',lh=1.35) => wrap(content,max).map((l,i)=>text(x,y+i*size*lh,l,size,color,weight)).join('');
const rect = (x,y,w,h,fill,rx=0,stroke='none') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}"/>`;

let y=40; const W=1500; const parts=[];
parts.push(rect(0,0,W,10000,'#f4f7fa'));
parts.push(rect(40,y,W-80,250,'#182d4c',26));
parts.push(text(80,y+56,'产品路线对照',18,'#f08a43','700'));
parts.push(text(80,y+108,'芙崽 Fuzozo × 小乐',42,'#ffffff','700'));
parts.push(text(80,y+158,'功能对比',42,'#ffffff','700'));
parts.push(text(80,y+194,'产品经理视角｜基于芙崽功能清单与《小乐使用手册总稿 V7》整理',16,'#c6d3e3','400'));
parts.push(text(80,y+226,'同一张地图，看清两条路线：情感潮玩与家庭教育。',19,'#e9f0f7','600'));
parts.push(rect(930,y+40,330,170,'#27466d',20));
parts.push(text(960,y+78,'两条产品路线',15,'#c6d3e3','700'));
parts.push(rect(960,y+94,132,58,'#ffeadc',12)); parts.push(text(976,y+120,'芙崽',16,'#e76f2d','700')); parts.push(text(976,y+141,'情感潮玩',14,'#e76f2d','600'));
parts.push(rect(1104,y+94,132,58,'#dff3ef',12)); parts.push(text(1120,y+120,'小乐',16,'#21847b','700')); parts.push(text(1120,y+141,'家庭教育',14,'#21847b','600'));
parts.push(text(960,y+184,'结论：不是功能替代，而是用户价值的争夺。',13,'#e9f0f7','600'));
y+=280;
const stats=[['31','芙崽功能条目','#fff0e6','#e76f2d'],['8','小乐手册核心模块','#e5f6f2','#21847b'],['4','小乐成长数据类型','#f0edfb','#5d4c98'],['2','主要产品路线','#e8f1fb','#345e8e']];
stats.forEach((s,i)=>{const x=40+i*355;parts.push(rect(x,y,335,92,s[2],16));parts.push(text(x+22,y+42,s[0],32,s[3],'700'));parts.push(text(x+22,y+70,s[1],14,'#657384','600'));});
y+=120;
parts.push(rect(40,y,W-80,150,'#ffffff',18)); parts.push(text(70,y+40,'一句话判断',24,'#202b3b','700'));
parts.push(lines(70,y+76,'芙崽的竞争力来自“拟真情感 + 个性人格 + 设备社交 + 随行潮玩”，小乐的竞争力来自“儿童陪伴 + 家长可视化 + 目标提醒 + 家庭教育服务”。两者不是简单的功能替代关系，而是情感潮玩路线与家庭教育路线的竞争。',16,'#263241',88,'400',1.45));
parts.push(lines(70,y+112,'若争夺同一家庭用户，小乐需要补强即时情绪回应、身体互动、人设记忆和可迁移性；芙崽若进入儿童家庭场景，则需要补齐家长控制、成长目标、作息提醒、内容安全、测评与报告。',16,'#657384',88,'400',1.45));
y+=182;
parts.push(text(40,y,'功能对比',25,'#202b3b','700')); y+=24;
const cols=[170,310,310,170,430]; const headers=['比较维度','芙崽 Fuzozo','小乐','判断','产品经理解读']; const x0=40; const headerH=54;
let x=x0; headers.forEach((h,i)=>{parts.push(rect(x,y,cols[i],headerH,i===1?'#fff1e7':i===2?'#e5f6f2':i===3?'#eef2f7':'#182d4c',0,'#d6dde5'));parts.push(text(x+14,y+34,h,15,i===1?'#b85a20':i===2?'#1b746d':i===3?'#345e8e':'#ffffff','700'));x+=cols[i];});
y+=headerH;
for (let r=0;r<rows.length;r++) {
  const row=rows[r]; const maxLines=Math.max(wrap(row[0],10).length,wrap(row[1],22).length,wrap(row[2],22).length,wrap(row[3],10).length,wrap(row[4],31).length); const h=Math.max(74,24+maxLines*23); let xx=x0;
  const fills=['#f7fafc','#ffffff','#ffffff','#f2f6fa','#ffffff'];
  row.forEach((v,i)=>{parts.push(rect(xx,y,cols[i],h,fills[i],0,'#d6dde5')); const color=i===0?'#243b5a':i===3?(v.includes('小乐')?'#21847b':v.includes('芙崽')?'#d86d2b':'#345e8e'):'#3a4654'; const weight=(i===0||i===3)?'700':'400'; const max=[10,22,22,10,31][i]; parts.push(lines(xx+14,y+28,v,14,color,max,weight,1.4)); xx+=cols[i];});
  y+=h;
}
y+=30; parts.push(text(40,y,'产品策略启示',25,'#202b3b','700')); y+=24;
const recs=[['小乐优先补强','把情绪识别从家长端的“记录/报告”前移到设备端的实时回应；增加触摸、拥抱、震动、温度等低门槛身体互动。'],['小乐数据能力','建立“长期记忆—人格变化—成长报告”的统一数据模型，明确换机、多设备、家庭成员的数据继承规则。'],['芙崽进入儿童场景前','补齐家长控制、内容拦截、风险审计、目标/习惯/作息提醒、儿童分龄内容和家长可读的成长解释。'],['双方共同核验','重点验证声纹识别准确率、情绪识别误报/漏报、记忆删除与导出、陌生人社交保护、未成年人数据合规。']];
recs.forEach((r,i)=>{const h=72;parts.push(rect(40,y,W-80,h,i%2?'#ffffff':'#edf4f8',12));parts.push(text(64,y+30,r[0],15,'#234466','700'));parts.push(lines(270,y+30,r[1],14,'#4b5a6a',92,'400',1.35));y+=h+10;});
y+=18; parts.push(text(40,y,'口径说明：表格中的“手册未提及”不等同于功能不存在，仅表示在当前附件资料中没有找到明确描述。',13,'#7a8795','400'));
y+=36;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" viewBox="0 0 ${W} ${y}">${parts.join('')}</svg>`;
await fs.writeFile('D:/Codex/养娃乐产品/outputs/芙崽Fuzozo×小乐功能对比_可编辑.svg',svg,'utf8');
console.log(JSON.stringify({path:'D:/Codex/养娃乐产品/outputs/芙崽Fuzozo×小乐功能对比_可编辑.svg',rows:rows.length,height:y}));
