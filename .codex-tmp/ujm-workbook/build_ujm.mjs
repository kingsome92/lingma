import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "D:/Codex/养娃乐产品/outputs/fuzozo-xiaole-ujm";
const previewDir = "D:/Codex/养娃乐产品/.codex-tmp/ujm-workbook";
const outputPath = `${outputDir}/Fuzozo芙崽与小乐用户旅程地图.xlsx`;
const previewPath = `${previewDir}/ujm-preview.png`;

const fontFamily = "Microsoft YaHei";
const colors = {
  ink: "#172033",
  muted: "#667085",
  line: "#D9E0EA",
  softGray: "#F7F8FA",
  label: "#EEF1F5",
  purple: "#6D3CC7",
  purpleSoft: "#F5F0FF",
  blue: "#2563EB",
  blueSoft: "#EFF6FF",
  orangeSoft: "#FFF3E8",
  orangeInk: "#A84B12",
  greenSoft: "#ECFDF3",
  greenInk: "#137A4A",
  white: "#FFFFFF",
};

const stages = [
  "1 认知与购买",
  "2 开箱与激活",
  "3 建立关系",
  "4 日常核心使用",
  "5 成长与社交",
  "6 持续使用与增购",
];

const fuzozo = {
  goal: [
    "判断它是否具有真实的生命感，值得长期陪伴",
    "快速开机联网，完成初始人格与主人识别",
    "让芙崽认识主人，并产生独特、可感知的回应",
    "获得稳定、随身且理解情绪的陪伴",
    "看见人格成长，并借芙崽建立新的社交关系",
    "保持长期关系，同时扩展个性表达和使用场景",
  ],
  behavior: [
    "浏览短视频、达人测评和用户分享；对比 WiFi 版、随行版、造型与价格",
    "开机、联网、绑定 App；选择 MBTI；录入声纹",
    "聊天并尝试毛毛语；抚摸、握持、摇晃；观察体温、震动和表情",
    "随时聊天和倾诉；低落时寻求安抚；让芙崽协助做决定",
    "查看心情日记和养成周报；碰一碰加好友；搜索崽崽号、附近的崽并传纸条",
    "迁移记忆和性格；购买换装配件；补充精力或升级随行版",
  ],
  touchpoint: [
    "社媒内容、电商详情页、线下展示、用户口碑",
    "包装引导、设备、App、WiFi/4G、声纹录入页",
    "设备语音、触摸区域、毛绒材质、体温、震动、情绪模型",
    "地球语/毛毛语、情绪感知、长期记忆、4G、精力值",
    "App 周报、碰一碰、LBS、好友系统、传纸条",
    "数字生命迁移、配件商城、精力值、设备版本、售后",
  ],
  pain: [
    "功能概念较多，线上难以判断真实情绪体验；版本差异和后续精力值成本不直观",
    "声纹录入和人格设定步骤偏重；WiFi 版仅支持 2.4G；不同版本能力存在差异",
    "触发边界不清；多人环境识别可能波动；期待过高容易造成落差",
    "精力值消耗可能打断沉浸感；续航、网络和错误记忆会影响信任",
    "人格变化解释不够透明；陌生人社交存在隐私风险；用户密度影响体验",
    "同属性才能迁移；配件与精力值形成持续成本；担心硬件损坏导致关系中断",
  ],
  emotion: [4, 3, 5, 4, 4, 3],
  opportunity: [
    "提供可交互 Demo、版本对照卡和精力值成本计算器",
    "设计三分钟激活向导、网络诊断，并允许稍后完成人格设定",
    "提供互动能力图鉴、首次关系任务和成功触发反馈",
    "提供重要对话免扣、记忆纠错与隐私控制、低电量和低精力预判",
    "解释人格变化原因；建立社交隐私分级、好友推荐与安全模式",
    "支持跨属性迁移策略、成长纪念册、透明订阅权益和以旧换新",
  ],
};

const xiaole = {
  goal: [
    "判断它能否安全、有效地陪伴孩子，并减轻家长负担",
    "完成设备绑定、联网和孩子档案创建",
    "让孩子自然开口，同时让家长感到可控",
    "陪伴孩子聊天、听内容，并帮助形成日常习惯",
    "了解孩子状态，获得可执行的家庭教育建议",
    "持续获得内容、服务和家庭支持",
  ],
  behavior: [
    "查看产品介绍与家长口碑；比较陪伴、安全、教育能力和联网规则",
    "微信扫码登录；蓝牙搜索；选择 WiFi/4G；创建孩子档案",
    "使用语音或按键唤醒；连续对话和打断；家长调整音量、接话速度与亮度",
    "聊天、问答、听音乐和故事；完成成长目标；接收闹钟、留言与睡眠提醒",
    "查看聊天摘要、情绪记录、闪光点及日报/周报/月报；咨询 AI 或专家",
    "使用探索和灵玛乐园；参与家长圈；购买商品，使用积分、优惠券并邀请好友",
  ],
  touchpoint: [
    "社媒、电商页、线下体验、家长推荐、专家内容",
    "包装码、眼睛屏幕码、小程序、蓝牙/GPS、设备管理",
    "耳朵按键、唤醒词、眼睛屏幕、家长端设备设置",
    "设备对话、内容库、成长目标、闹钟、语音留言、睡眠提醒",
    "成长中心、情绪日历、六维报告、童言拾光、阿乐老师、测评",
    "内容生态、家长圈、商城、订单、积分、优惠券、售后",
  ],
  pain: [
    "教育效果难量化；家长担心隐私、内容安全和孩子沉迷；功能多但核心价值分散",
    "权限较多、配网链路长；Android 需要定位；WiFi 与 4G 规则较复杂",
    "深度睡眠不能语音唤醒；接话速度需调节；家长设置与孩子体验存在割裂",
    "音乐和故事依赖 WiFi；提醒受网络与音量影响；目标完成后不能撤销",
    "数据并非实时；记录不能删除、筛选或导出；极端情绪预警可能放大家长焦虑",
    "家长端不能直接点播并推送故事；社区 AI 审核缺少人工入口；服务入口分散",
  ],
  emotion: [3, 2, 4, 4, 3, 3],
  opportunity: [
    "提供真实家庭案例、安全白皮书，并按年龄和问题推荐使用方案",
    "使用单页进度条、权限预检、失败自动诊断，并提供默认 4G 兜底",
    "设计儿童首日引导剧本、慢语速自动适配和亲子共同设置仪式",
    "提供离线基础内容、提醒送达状态、目标容错与连续完成激励",
    "说明数据实时性；支持纠错、导出和删除；明确建议优先级与证据来源",
    "支持家长远程点播、统一服务首页、专家/内容订阅和家庭成长年度报告",
  ],
};

const comparisons = [
  ["核心关系", "用户与玩偶的一对一情感依恋", "孩子、设备、家长的三方协同", "两者不宜只做功能数量对比，应分别评估情感深度与家庭闭环"],
  ["关键决策人", "用户本人或潮玩、陪伴型消费人群", "家长购买决策，孩子是核心使用者", "小乐需要同时经营家长信任和儿童体验；芙崽更重自我表达"],
  ["关键高峰时刻", "首次成功触摸反馈、声纹识别和个性化回应", "孩子愿意持续开口，家长获得有意义的成长洞察", "激活指标应围绕首次关系建立，而不只是完成绑定"],
  ["主要信任风险", "记忆错误、精力值中断、续航与网络不稳定", "配网权限、内容安全、记录治理与预警焦虑", "都需要透明状态、纠错入口和隐私控制，降低关系破裂风险"],
  ["留存循环", "人格成长、长期记忆、社交连接、换装和随行使用", "成长目标、家庭洞察、内容消费、专家服务和家长社区", "芙崽靠关系与个性化续航；小乐靠可见成长与家庭行动闭环"],
  ["建议核心指标", "首日有效互动率、7日关系留存、记忆纠错率、社交转化", "配网成功率、孩子对话天数、家长报告查看率、建议执行率", "用关系质量和任务闭环衡量，不以单纯对话次数代替价值"],
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("双产品UJM");
sheet.showGridLines = false;
sheet.tabColor = colors.purple;

sheet.mergeCells("A2:G2");
sheet.getRange("A2").values = [["Fuzozo 芙崽 × 小乐 用户旅程地图"]];
sheet.mergeCells("A3:G3");
sheet.getRange("A3").values = [["统一六阶段：从首次认知到持续陪伴，便于横向比较两种产品价值路径"]];
sheet.mergeCells("A4:G4");
sheet.getRange("A4").values = [["资料来源：小乐使用手册总稿V7.pdf；Fuzozo 功能详情表（飞书：https://feishu.doubao.com/sheets/LncMsOmefhQT0htb8SHcoUgO6jf?sheet=bfd9d2）"]];

const base = sheet.getRange("A1:G33");
base.format.font = { name: fontFamily, size: 10, color: colors.ink };
base.format.verticalAlignment = "center";

sheet.getRange("A2:G2").format.font = { name: fontFamily, size: 16, bold: true, color: colors.ink };
sheet.getRange("A2:G2").format.rowHeight = 30;
sheet.getRange("A3:G3").format.font = { name: fontFamily, size: 10, color: colors.muted };
sheet.getRange("A3:G3").format.rowHeight = 22;
sheet.getRange("A4:G4").format.font = { name: fontFamily, size: 9, italic: true, color: colors.muted };
sheet.getRange("A4:G4").format.wrapText = true;
sheet.getRange("A4:G4").format.rowHeight = 34;
sheet.getRange("A5:G5").format.rowHeight = 10;

function writeJourney(startRow, productTitle, accent, softFill, data) {
  const titleRow = startRow;
  const headerRow = startRow + 1;
  const firstDataRow = startRow + 2;
  const lastDataRow = startRow + 7;

  sheet.mergeCells(`A${titleRow}:G${titleRow}`);
  sheet.getRange(`A${titleRow}`).values = [[productTitle]];
  sheet.getRange(`A${titleRow}:G${titleRow}`).format = {
    fill: accent,
    font: { name: fontFamily, size: 12, bold: true, color: colors.white },
    verticalAlignment: "center",
  };
  sheet.getRange(`A${titleRow}:G${titleRow}`).format.rowHeight = 30;

  sheet.getRange(`A${headerRow}:G${headerRow}`).values = [["旅程维度", ...stages]];
  sheet.getRange(`A${headerRow}:G${headerRow}`).format = {
    fill: softFill,
    font: { name: fontFamily, size: 10, bold: true, color: colors.ink },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: colors.line },
  };
  sheet.getRange(`A${headerRow}:G${headerRow}`).format.rowHeight = 38;

  const rows = [
    ["用户目标", ...data.goal],
    ["用户行为", ...data.behavior],
    ["接触点", ...data.touchpoint],
    ["痛点 / 费力点", ...data.pain],
    ["情绪评分（1–5）", ...data.emotion],
    ["机会点", ...data.opportunity],
  ];
  sheet.getRange(`A${firstDataRow}:G${lastDataRow}`).values = rows;
  sheet.getRange(`A${firstDataRow}:G${lastDataRow}`).format = {
    font: { name: fontFamily, size: 10, color: colors.ink },
    verticalAlignment: "top",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: colors.line },
  };
  sheet.getRange(`A${firstDataRow}:A${lastDataRow}`).format = {
    fill: colors.label,
    font: { name: fontFamily, size: 10, bold: true, color: colors.ink },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: colors.line },
  };

  const painRow = firstDataRow + 3;
  const emotionRow = firstDataRow + 4;
  const opportunityRow = firstDataRow + 5;
  sheet.getRange(`B${painRow}:G${painRow}`).format.fill = colors.orangeSoft;
  sheet.getRange(`B${painRow}:G${painRow}`).format.font = { name: fontFamily, size: 10, color: colors.orangeInk };
  sheet.getRange(`B${opportunityRow}:G${opportunityRow}`).format.fill = colors.greenSoft;
  sheet.getRange(`B${opportunityRow}:G${opportunityRow}`).format.font = { name: fontFamily, size: 10, color: colors.greenInk };
  sheet.getRange(`B${emotionRow}:G${emotionRow}`).format.horizontalAlignment = "center";
  sheet.getRange(`B${emotionRow}:G${emotionRow}`).format.verticalAlignment = "center";
  sheet.getRange(`B${emotionRow}:G${emotionRow}`).format.font = { name: fontFamily, size: 11, bold: true, color: colors.ink };
  sheet.getRange(`B${emotionRow}:G${emotionRow}`).conditionalFormats.add("colorScale", {
    colors: ["#FCA5A5", "#FDE68A", "#86EFAC"],
    thresholds: ["min", { type: "percentile", value: 50 }, "max"],
  });

  const heights = [68, 96, 82, 100, 34, 100];
  heights.forEach((height, idx) => {
    sheet.getRange(`A${firstDataRow + idx}:G${firstDataRow + idx}`).format.rowHeight = height;
  });
}

writeJourney(6, "Fuzozo 芙崽｜AI 情感潮玩与社交型数字生命", colors.purple, colors.purpleSoft, fuzozo);
sheet.getRange("A14:G14").format.rowHeight = 12;
writeJourney(15, "小乐｜AI 儿童陪伴与家庭教育闭环", colors.blue, colors.blueSoft, xiaole);
sheet.getRange("A23:G23").format.rowHeight = 14;

sheet.mergeCells("A24:G24");
sheet.getRange("A24").values = [["产品经理横向结论"]];
sheet.getRange("A24:G24").format = {
  fill: "#344054",
  font: { name: fontFamily, size: 12, bold: true, color: colors.white },
  verticalAlignment: "center",
};
sheet.getRange("A24:G24").format.rowHeight = 30;

sheet.mergeCells("B25:C25");
sheet.mergeCells("D25:E25");
sheet.mergeCells("F25:G25");
sheet.getRange("A25").values = [["比较维度"]];
sheet.getRange("B25").values = [["芙崽"]];
sheet.getRange("D25").values = [["小乐"]];
sheet.getRange("F25").values = [["设计启示"]];
sheet.getRange("A25:G25").format = {
  fill: "#E8ECF2",
  font: { name: fontFamily, size: 10, bold: true, color: colors.ink },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  borders: { preset: "all", style: "thin", color: colors.line },
};
sheet.getRange("A25:G25").format.rowHeight = 32;

comparisons.forEach((row, idx) => {
  const r = 26 + idx;
  sheet.mergeCells(`B${r}:C${r}`);
  sheet.mergeCells(`D${r}:E${r}`);
  sheet.mergeCells(`F${r}:G${r}`);
  sheet.getRange(`A${r}`).values = [[row[0]]];
  sheet.getRange(`B${r}`).values = [[row[1]]];
  sheet.getRange(`D${r}`).values = [[row[2]]];
  sheet.getRange(`F${r}`).values = [[row[3]]];
  sheet.getRange(`A${r}:G${r}`).format = {
    fill: idx % 2 === 0 ? colors.white : colors.softGray,
    font: { name: fontFamily, size: 10, color: colors.ink },
    verticalAlignment: "top",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: colors.line },
  };
  sheet.getRange(`A${r}`).format.font = { name: fontFamily, size: 10, bold: true, color: colors.ink };
  sheet.getRange(`A${r}`).format.horizontalAlignment = "center";
  sheet.getRange(`A${r}`).format.verticalAlignment = "center";
  sheet.getRange(`A${r}:G${r}`).format.rowHeight = 64;
});

sheet.mergeCells("A33:G33");
sheet.getRange("A33").values = [["情绪评分说明：1 = 明显受挫，3 = 中性或有阻力，5 = 高度愉悦。分值用于表达旅程相对变化，不代表用户研究统计结果。"]];
sheet.getRange("A33:G33").format = {
  fill: colors.softGray,
  font: { name: fontFamily, size: 9, italic: true, color: colors.muted },
  verticalAlignment: "center",
  wrapText: true,
};
sheet.getRange("A33:G33").format.rowHeight = 34;

sheet.getRange("A1:A33").format.columnWidth = 18;
sheet.getRange("B1:G33").format.columnWidth = 31;
sheet.getRange("A1:G33").format.verticalAlignment = "center";
sheet.getRange("B8:G13").format.verticalAlignment = "top";
sheet.getRange("B17:G22").format.verticalAlignment = "top";
sheet.getRange("B12:G12").format.verticalAlignment = "center";
sheet.getRange("B21:G21").format.verticalAlignment = "center";
sheet.freezePanes.freezeRows(7);
sheet.freezePanes.freezeColumns(1);

workbook.recalculate();

const keyInspect = await workbook.inspect({
  kind: "table",
  range: "双产品UJM!A2:G33",
  include: "values,formulas",
  tableMaxRows: 40,
  tableMaxCols: 8,
  maxChars: 15000,
});
console.log("KEY_INSPECT");
console.log(keyInspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log("ERROR_SCAN");
console.log(errors.ndjson);

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });
const preview = await workbook.render({
  sheetName: "双产品UJM",
  range: "A1:G33",
  scale: 1,
  format: "png",
});
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);

console.log(JSON.stringify({ outputPath, previewPath }));
