import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const outputDir = 'D:/Codex/养娃乐产品/outputs/fuzozo-xiaole-comparison';
const outputPath = `${outputDir}/芙崽Fuzozo与小乐功能对比表.xlsx`;
const previewPath = `${outputDir}/芙崽Fuzozo与小乐功能对比表_预览.png`;
const detailPreviewPath = `${outputDir}/芙崽Fuzozo与小乐功能明细_预览.png`;
const font = 'Arial';

const comparisonRows = [
  ['产品定位', 'AI 情感潮玩 / 社交型数字生命', 'AI 养娃陪伴 / 家庭教育闭环', '定位不同', '芙崽偏“被养成的伙伴”，小乐偏“帮助孩子成长的工具+伙伴”'],
  ['核心对话', '地球语；另有毛毛语模式', '语音唤醒、连续对话、可打断；支持多语言交互', '重叠', '芙崽强调角色语言与人设，小乐强调稳定可用和家庭场景'],
  ['长期记忆', 'EchoChain 仿生记忆；持续对话自动积累', '聊天记录永久保存；提供摘要、关键词、AI 分析', '各有侧重', '芙崽更像“记住你”，小乐更像“让家长看见孩子”'],
  ['情绪理解', '实时识别情绪并主动安抚、打气或辅助决策', '情绪记录、趋势、月度占比、极端情绪预警和行动建议', '各有侧重', '芙崽强在实时回应，小乐强在事后观察与家长建议'],
  ['多模态硬件互动', '震动、自然体温、撸毛、额头/下巴分区触摸、摇晃反馈', '眼睛屏幕表情；耳朵按键唤醒/打断；语音反馈', '芙崽优势', '芙崽的身体反馈是核心差异，小乐当前手册未提及同类能力'],
  ['声纹与主人识别', '支持录入声纹，多人对话识别主人', '手册未提及声纹识别', '芙崽优势', '适合多人家庭；小乐需核实是否有同类能力或规划'],
  ['人格养成', 'MBTI 初始设定；互动形成二次性格；可迁移性格/记忆', '孩子闪光点勋章、成长报告六维发展观察', '各有侧重', '芙崽是“人格被养成”，小乐是“能力被记录与引导”'],
  ['成长反馈', '心情日记；养成系周报解读性格变化', '日报/周报/月报、成长亮点、重点关注、行动建议，支持分享', '小乐优势', '小乐的报告更完整，且直接服务家长决策'],
  ['目标与习惯', '表格未列独立目标/习惯任务', '一次性/周期性目标、提醒、家长或孩子语音标记完成', '小乐优势', '这是小乐的“养娃”核心闭环，芙崽可考虑轻量任务化'],
  ['日常提醒', '表格未列闹钟、语音留言、睡眠提醒', '闹钟、定时语音留言、21:00-24:00 睡眠提醒、使用时长提醒', '小乐优势', '小乐更适合家庭作息管理'],
  ['内容安全', '资料强调拟真反馈与防滥用，但未列家长内容策略', '家长可配置话题拦截，并查看命中次数和聊天记录', '小乐优势', '儿童产品需补充分龄策略、家长控制和审计机制对比'],
  ['故事/内容', '表格未列内容资源体系', '音乐、故事、睡前故事会、动画/故事内容；音频播放需 WiFi', '小乐优势', '小乐已有内容生态，但家长端暂不支持直接推送故事/儿歌'],
  ['专家与测评', '表格未列', 'AI 家庭教育咨询、专家数字人、AI 场景模拟、六类专业测评', '小乐优势', '小乐从硬件延伸到家庭教育服务'],
  ['家长社区', '芙崽社交围绕崽崽号、附近的崽、碰一碰交友、传纸条', '家长圈支持图文/视频发布、评论、点赞、回复、转发', '场景不同', '芙崽服务年轻用户社交，小乐服务家长经验交流'],
  ['社交门槛', '碰一碰、搜索 ID、LBS 发现附近设备', '家长圈线上互动', '芙崽优势', '芙崽把设备变成社交入口；需重点评估儿童隐私与陌生人风险'],
  ['联网方式', '随行版内置 4G、开机即用；WiFi 版需 2.4G 配网', 'WiFi + 4G；每月 300M 4G，音乐/故事需 WiFi', '芙崽优势', '芙崽随行体验更直接；小乐的 4G 规则更明确'],
  ['续航', '随行版连续对话 5-8h、综合 6-8h、待机 48h+；WiFi 版待机 10 天+', '手册未给出续航时长，提供电量查看和 Type-C 充电', '芙崽优势', '小乐需要补齐可对外比较的续航口径'],
  ['使用限制/商业化', '聊天每分钟消耗 5 点精力；普通版 120 点上限，自动恢复', '手册未提精力值或按时长付费限制', '芙崽模式更明确', '芙崽用资源值控制成本与回访，小乐更偏硬件+内容/服务生态'],
  ['外观与配件', '换装配件自由造型，配件另购', '毛绒玩偶本体；手册未列换装体系', '芙崽优势', '芙崽更适合潮玩收藏和配件复购'],
  ['数据迁移', '同属性芙崽可迁移，换机保留性格/记忆', '支持绑定多台小乐和切换设备；未提成长数据迁移', '芙崽优势', '小乐需明确换机、家庭成员和多设备数据继承规则'],
];

const recommendations = [
  ['小乐优先补强', '把情绪识别从家长端的记录/报告前移到设备端实时回应；增加触摸、拥抱、震动、温度等低门槛身体互动。'],
  ['小乐数据能力', '建立“长期记忆—人格变化—成长报告”的统一数据模型，明确换机、多设备、家庭成员的数据继承规则。'],
  ['芙崽进入儿童场景前', '补齐家长控制、内容拦截、风险审计、目标/习惯/作息提醒、儿童分龄内容和家长可读的成长解释。'],
  ['双方共同核验', '重点验证声纹识别准确率、情绪识别误报/漏报、记忆删除与导出、陌生人社交保护、未成年人数据合规。'],
];

const workbook = Workbook.create();
const summary = workbook.worksheets.add('对比总览');
const detail = workbook.worksheets.add('功能明细');

for (const sheet of [summary, detail]) {
  sheet.showGridLines = false;
  sheet.getRange('A1:K80').format.font = { name: font, size: 10, color: '#1F2937' };
  sheet.getRange('A1:K80').format.verticalAlignment = 'center';
}

summary.getRange('A2').values = [['芙崽 Fuzozo 与小乐功能对比表']];
summary.getRange('A2').format = { font: { name: font, size: 16, bold: true, color: '#17365D' } };
summary.getRange('A3').values = [['产品经理视角｜功能差异、用户价值与产品机会']];
summary.getRange('A3').format = { font: { name: font, size: 10, italic: true, color: '#6B7280' } };
summary.getRange('A5:B9').values = [
  ['核心判断', '芙崽偏拟真情感、人格养成、潮玩社交和随行陪伴；小乐偏儿童陪伴、家长可视化、成长目标和家庭教育服务。'],
  ['产品关系', '两者不是简单替代关系，而是情感潮玩路线与家庭教育路线的竞争。'],
  ['芙崽主要优势', '实时情绪回应、多模态身体互动、声纹主人识别、设备社交、续航与换机迁移。'],
  ['小乐主要优势', '成长报告、目标与习惯、作息提醒、内容安全、专家测评、家庭教育内容和家长社区。'],
  ['资料口径', '“手册未提及”仅表示当前资料没有明确描述，不直接等同于“不支持”。'],
];
summary.getRange('A5:A9').format = { fill: '#D9EAF7', font: { name: font, bold: true, color: '#17365D' } };
summary.getRange('B5:B9').format.wrapText = true;
summary.getRange('A5:B9').format.borders = { preset: 'all', style: 'thin', color: '#D9E2F3' };
summary.getRange('A5:B9').format.rowHeight = 34;

summary.getRange('A12:D12').values = [['关键指标', '数值', '口径', '说明']];
summary.getRange('A13:D16').values = [
  ['芙崽功能条目', 31, '芙崽功能清单', '技术底座、对话、情绪互动、性格养成、社交、联网续航、商业模式'],
  ['小乐手册模块', 8, '小乐手册目录', '成长数据、成长目标、日常提醒、家庭教育、探索、家长圈等'],
  ['对比维度', comparisonRows.length, '本表', '按用户价值和产品能力合并归纳'],
  ['小乐已明确的成长数据类型', 4, '小乐手册 3.6', '聊天摘要、情绪记录、孩子的闪光点、成长报告'],
];
summary.getRange('A12:D12').format = { fill: '#17365D', font: { name: font, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center' };
summary.getRange('A13:D16').format.borders = { preset: 'all', style: 'thin', color: '#D9E2F3' };
summary.getRange('B13:B16').format.numberFormat = '0';

summary.getRange('A19:B19').values = [['产品策略启示', '建议']];
summary.getRange('A20:B23').values = recommendations;
summary.getRange('A19:B19').format = { fill: '#17365D', font: { name: font, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center' };
summary.getRange('A20:A23').format = { fill: '#EAF2F8', font: { name: font, bold: true, color: '#17365D' } };
summary.getRange('B20:B23').format.wrapText = true;
summary.getRange('A19:B23').format.borders = { preset: 'all', style: 'thin', color: '#D9E2F3' };
summary.getRange('A20:B23').format.rowHeight = 42;

summary.getRange('A26:B28').values = [
  ['来源 1', '小乐使用手册总稿 V7，62 页，用户提供 PDF'],
  ['来源 2', '芙崽 FUZZOZO 功能清单，用户提供飞书表格，sheet=bfd9d2'],
  ['更新时间', '2026-09-22'],
];
summary.getRange('A26:A28').format = { font: { name: font, bold: true, color: '#6B7280' } };
summary.getRange('A26:B28').format.font = { name: font, size: 9, italic: true, color: '#6B7280' };

summary.getRange('A:A').format.columnWidth = 22;
summary.getRange('B:B').format.columnWidth = 78;
summary.getRange('C:C').format.columnWidth = 18;
summary.getRange('D:D').format.columnWidth = 58;
summary.getRange('A1:D30').format.wrapText = true;

detail.getRange('A2').values = [['功能明细对比']];
detail.getRange('A2').format = { font: { name: font, size: 16, bold: true, color: '#17365D' } };
detail.getRange('A3').values = [['筛选“判断”列，可快速查看芙崽优势、小乐优势、重叠或待核实项']];
detail.getRange('A3').format = { font: { name: font, size: 10, italic: true, color: '#6B7280' } };
detail.getRange('A5:E5').values = [['比较维度', '芙崽 Fuzozo', '小乐', '判断', '产品经理解读']];
detail.getRange('A6:E25').values = comparisonRows;
detail.getRange('A5:E5').format = { fill: '#17365D', font: { name: font, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
detail.getRange(`A6:E${5 + comparisonRows.length}`).format.wrapText = true;
detail.getRange(`A5:E${5 + comparisonRows.length}`).format.borders = { preset: 'all', style: 'thin', color: '#D9E2F3' };
detail.getRange(`A6:E${5 + comparisonRows.length}`).format.rowHeight = 44;
detail.getRange('A6:A26').format = { fill: '#EAF2F8', font: { name: font, bold: true, color: '#17365D' }, wrapText: true };
detail.getRange('D6:D26').format.horizontalAlignment = 'center';
detail.getRange('D6:D26').conditionalFormats.add('containsText', { text: '芙崽优势', format: { fill: '#FFF2CC', font: { bold: true, color: '#7F6000' } } });
detail.getRange('D6:D26').conditionalFormats.add('containsText', { text: '小乐优势', format: { fill: '#D9EAD3', font: { bold: true, color: '#274E13' } } });
detail.getRange('D6:D26').conditionalFormats.add('containsText', { text: '各有侧重', format: { fill: '#D9EAF7', font: { bold: true, color: '#17365D' } } });
detail.getRange('D6:D26').conditionalFormats.add('containsText', { text: '重叠', format: { fill: '#EDEDED', font: { bold: true, color: '#404040' } } });
detail.getRange('D6:D26').conditionalFormats.add('containsText', { text: '场景不同', format: { fill: '#FCE4D6', font: { bold: true, color: '#843C0C' } } });
detail.getRange('D6:D26').conditionalFormats.add('containsText', { text: '芙崽模式更明确', format: { fill: '#FFF2CC', font: { bold: true, color: '#7F6000' } } });

const table = detail.tables.add(`A5:E${5 + comparisonRows.length}`, true, 'FuzozoXiaoleComparison');
table.style = 'TableStyleMedium2';
table.showFilterButton = true;
table.showBandedColumns = false;
detail.freezePanes.freezeRows(5);
detail.freezePanes.freezeColumns(1);
detail.getRange('A:A').format.columnWidth = 20;
detail.getRange('B:B').format.columnWidth = 37;
detail.getRange('C:C').format.columnWidth = 42;
detail.getRange('D:D').format.columnWidth = 17;
detail.getRange('E:E').format.columnWidth = 54;
detail.getRange('A1:E30').format.wrapText = true;

workbook.recalculate();

const summaryCheck = await workbook.inspect({ kind: 'table', range: '对比总览!A2:D28', include: 'values,formulas', tableMaxRows: 30, tableMaxCols: 6, maxChars: 6000 });
const detailCheck = await workbook.inspect({ kind: 'table', range: '功能明细!A5:E26', include: 'values,formulas', tableMaxRows: 30, tableMaxCols: 6, maxChars: 12000 });
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(`${outputDir}/verification.json`, JSON.stringify({ summary: summaryCheck.ndjson, detail: detailCheck.ndjson }, null, 2), 'utf8');

const preview = await workbook.render({ sheetName: '对比总览', range: 'A1:D28', scale: 1, format: 'png' });
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));
const detailPreview = await workbook.render({ sheetName: '功能明细', range: 'A1:E25', scale: 1, format: 'png' });
await fs.writeFile(detailPreviewPath, new Uint8Array(await detailPreview.arrayBuffer()));
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(JSON.stringify({ outputPath, previewPath, detailPreviewPath, summaryCheck: summaryCheck.ndjson.slice(0, 1200), detailCheck: detailCheck.ndjson.slice(0, 1200) }, null, 2));
