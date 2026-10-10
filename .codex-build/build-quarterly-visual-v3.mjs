import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "D:/Codex/养娃乐产品";
const skillDir = "C:/Users/kings/.codex/plugins/cache/openai-primary-runtime/presentations/26.923.10815/skills/presentations";
const buildDir = path.join(workspaceDir, ".codex-build", "quarterly-visual-v3");
const outputDir = path.join(workspaceDir, "季度汇报输出");
const sourcePath = path.join(workspaceDir, "养娃乐季度汇报-8-9月-已填充-v2.pptx");
const draftPath = path.join(buildDir, "养娃乐季度汇报-8-9月-可视化增强版-草稿.pptx");
const finalPath = path.join(outputDir, "养娃乐季度汇报-8-9月-可视化增强版-v3.pptx");

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });

const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const { applyPresentationChartFont, finalizePresentation } = await import(
  pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href,
);

const GREEN = "#27814F";
const GREEN_DARK = "#166534";
const GREEN_LIGHT = "#DCEFE3";
const GREEN_MID = "#8FD0A8";
const MINT = "#EFF8F2";
const GRAY = "#A7AFB5";
const GRAY_LIGHT = "#F3F5F6";
const TEXT = "#202124";
const BORDER = "#CAD3CE";
const AMBER = "#E0A62B";
const RED = "#C55A4A";
const FONT = "Arial";

function titleShape(slide) {
  return slide.shapes.items.find((s) => s.name?.includes("标题 1")) ?? slide.shapes.items[0];
}

function bodyShape(slide) {
  return slide.shapes.items.find((s) => s.name?.includes("内容占位符")) ?? slide.shapes.items[1];
}

function setTitle(slide, text) {
  titleShape(slide).text = text;
}

function setBody(slide, lines, fontSize = 25) {
  const body = bodyShape(slide);
  body.text = Array.isArray(lines) ? lines.join("\n") : lines;
  body.text.style = { typeface: FONT, fontSize, color: TEXT, alignment: "left" };
}

function clearBody(slide) {
  const body = bodyShape(slide);
  body.delete();
}

function addText(slide, text, position, style = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position,
    fill: "none",
    line: { fill: "none", width: 0 },
  });
  shape.text = text;
  shape.text.style = {
    typeface: FONT,
    fontSize: 18,
    color: TEXT,
    alignment: "left",
    ...style,
  };
  return shape;
}

function styleTable(table, rowCount, columnCount, { headerFill = GREEN, fontSize = 17, rowFills = [] } = {}) {
  table.borders.assign({ style: "solid", fill: BORDER, width: 1 });
  const all = table.cells.block({ row: 0, column: 0, rowCount, columnCount });
  all.textStyle.typeface = FONT;
  all.textStyle.fontSize = fontSize;
  all.textStyle.color = TEXT;
  all.anchor = "middle";
  all.margins = { left: 10, right: 10, top: 6, bottom: 6 };
  const header = table.cells.block({ row: 0, column: 0, rowCount: 1, columnCount });
  header.fill = headerFill;
  header.textStyle.color = "#FFFFFF";
  header.textStyle.bold = true;
  header.textStyle.alignment = "center";
  for (let r = 1; r < rowCount; r++) {
    const row = table.cells.block({ row: r, column: 0, rowCount: 1, columnCount });
    row.fill = rowFills[r - 1] ?? (r % 2 ? "#FFFFFF" : MINT);
  }
}

function addTable(slide, values, columnWidths, top = 190, height = 448, options = {}) {
  const table = slide.tables.add({
    rows: values.length,
    columns: values[0].length,
    left: 88,
    top,
    width: 1104,
    height,
    columnWidths,
    values,
  });
  const defaultRowHeight = height / values.length;
  for (let r = 0; r < values.length; r++) table.rows[r].height = defaultRowHeight;
  styleTable(table, values.length, values[0].length, options);
  return table;
}

// Expand the six-slide template rhythm to twelve slides.
const duplicateSource = presentation.slides.getItem(5);
for (let i = 0; i < 6; i++) duplicateSource.duplicate();
const slides = presentation.slides.items;

// 1. Cover
slides[0].shapes.items[0].text = "季度工作汇报\n2026年8-9月";
slides[0].shapes.items[1].text = "养娃乐教育科技";

// 2. Responsibilities and quarterly overview
setTitle(slides[1], "工作职责与季度工作全景");
clearBody(slides[1]);
addTable(slides[1], [
  ["工作领域", "主要职责", "8-9月重点产出"],
  ["AI玩偶端侧", "硬件端侧功能开发、迭代与体验优化", "核心功能上线，冷启动与对话专项优化"],
  ["协同软件端", "小程序能力建设与跨端协同", "声纹功能设计，涂鸦SDK接入60%"],
  ["产品规划", "Roadmap、产品矩阵与竞品调研", "完成硬件矩阵、UJM与智能硬件调研"],
  ["项目交付", "联调测试、版本发布与跨团队推进", "推进V5、直播、NFC项目，发布4个固件版本"],
], [170, 445, 489], 190, 430, { fontSize: 18 });

// 3. Core terminal features
setTitle(slides[2], "1. 核心终端功能上线");
clearBody(slides[2]);
addTable(slides[2], [
  ["方向", "上线内容", "用户价值"],
  ["内容资源", "接入贝瓦上万首曲库资源", "扩充儿童音频内容供给"],
  ["联网能力", "支持时政新闻、百科、天气查询", "提升实时信息获取能力"],
  ["连接稳定性", "弱网提示、自动重连、程序看门狗", "降低断网与程序异常影响"],
  ["主动交互", "开机沉默至浅睡眠前5分钟自动攀谈", "减少冷场，增强陪伴感"],
  ["版本交付", "4.8.6、4.8.8、4.9.1、4.9.6", "完成测试、验收、灰度与全量发布"],
], [160, 530, 414], 185, 450, { fontSize: 17 });

// 4. Cold-start comparison chart
setTitle(slides[3], "1.1 冷启动优化：关键场景均明显提速");
clearBody(slides[3]);
const coldChart = slides[3].charts.add("bar", {
  position: { left: 105, top: 185, width: 1040, height: 385 },
  categories: ["WiFi开机对话", "WiFi深睡唤醒", "4G开机对话", "4G深睡唤醒"],
  series: [
    { name: "优化前", values: [30, 13, 30, 20], fill: GRAY, valuesFormatCode: "0\"秒\"" },
    { name: "优化后", values: [15, 9, 25, 15], fill: GREEN, valuesFormatCode: "0\"秒\"" },
  ],
  barOptions: { direction: "bar", grouping: "clustered", gapWidth: 55 },
  hasLegend: true,
  legend: { position: "bottom", overlay: false, textStyle: { typeface: FONT, fontSize: 15, fill: TEXT } },
  xAxis: {
    min: 0, max: 35, majorUnit: 5, numberFormatCode: "0\"秒\"",
    textStyle: { typeface: FONT, fontSize: 13, fill: TEXT },
    majorGridlines: { style: "solid", fill: "#E3E7E5", width: 1 },
  },
  yAxis: { textStyle: { typeface: FONT, fontSize: 15, fill: TEXT }, majorGridlines: null },
  dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 14, fill: TEXT, bold: true } },
  chartFill: "#FFFFFF",
  plotAreaFill: "#FFFFFF",
  chartLine: { fill: "none", width: 0 },
  plotAreaLine: { fill: "none", width: 0 },
});
applyPresentationChartFont(coldChart, { fontFamily: FONT });
addText(slides[3], "WiFi开机对话由30秒降至15秒，提速50%；4G深睡唤醒由20秒降至15秒，提速25%", { left: 135, top: 592, width: 1010, height: 38 }, { fontSize: 18, color: GREEN_DARK, bold: true, alignment: "center" });

// 5. Dialogue speed optimization
setTitle(slides[4], "1.2 对话速度优化专项");
clearBody(slides[4]);
addText(slides[4], "围绕“听不清”和“响应慢”两类问题，缩短处理链路并提高端侧稳定性", { left: 90, top: 168, width: 1090, height: 42 }, { fontSize: 20, color: GREEN_DARK, bold: true });
addTable(slides[4], [
  ["优化层", "具体调整", "变化"],
  ["固件端", "优化收音阈值，调整唤醒词逻辑", "提升收音与唤醒稳定性"],
  ["上下文策略", "召回轮次由20轮调整为5轮", "处理轮次减少75%"],
  ["提示词", "人格生成提示词优化；约4000字符压缩至约600字符", "提示词长度减少约85%"],
  ["服务端链路", "意图路由增加前置判断，优化资源预加载", "减少无效处理与等待"],
], [180, 610, 314], 225, 385, { fontSize: 18, rowFills: ["#FFFFFF", MINT, "#FFFFFF", MINT] });

// 6. Feature design and research
setTitle(slides[5], "2. 功能设计与产品调研");
clearBody(slides[5]);
addTable(slides[5], [
  ["方向", "阶段产出", "状态"],
  ["声纹识别", "完成玩偶端与小程序功能、需求设计", "待开发"],
  ["硬件产品矩阵", "完成机芯、玩偶版本及其他设备规划", "已完成"],
  ["UJM分析", "完成fuzozo与小乐用户旅程对比", "已完成"],
  ["智能硬件", "完成AI眼镜、智能耳机竞品体验分析", "已完成"],
  ["机器人", "完成调研文档撰写并参与相关展会", "已完成"],
  ["对话竞品", "完成芷间智伴、涂鸦、fuzozo测试记录", "已完成"],
], [190, 720, 194], 180, 465, { fontSize: 17 });

// 7. Key project progress
setTitle(slides[6], "3. 重点项目进展");
clearBody(slides[6]);
addTable(slides[6], [
  ["项目", "8-9月进展", "当前状态", "下一步"],
  ["福瑞达V5", "PO主导联调，每日跟踪；0904前完成固件提测", "因直播及线上版本优化暂缓", "10月重启内测并完成验证"],
  ["直播支持", "设备调试、提示词、人设风格、示例对话测试", "持续复盘优化", "沉淀稳定的人设与对话方案"],
  ["NFC故事阅读", "完成制卡、打样、数据写入与测试", "已完成打样", "推进内容与交互测试"],
  ["涂鸦云", "小程序SDK接入60%；配网、联网流程打通", "数据上报未打通", "10月完成对接"],
], [150, 445, 230, 279], 180, 460, { fontSize: 16.5 });

// 8. Tuya progress chart
setTitle(slides[7], "3.1 涂鸦云接入进展");
clearBody(slides[7]);
const tuyaChart = slides[7].charts.add("bar", {
  position: { left: 125, top: 195, width: 1000, height: 330 },
  categories: ["小程序SDK接入", "配网流程", "联网流程", "数据上报"],
  series: [{
    name: "完成度",
    values: [0.6, 1, 1, 0],
    valuesFormatCode: "0%",
    fill: GREEN,
    points: [
      { idx: 0, fill: AMBER },
      { idx: 1, fill: GREEN },
      { idx: 2, fill: GREEN },
      { idx: 3, fill: RED },
    ],
  }],
  barOptions: { direction: "bar", grouping: "clustered", gapWidth: 60 },
  hasLegend: false,
  xAxis: {
    min: 0, max: 1, majorUnit: 0.2, numberFormatCode: "0%",
    textStyle: { typeface: FONT, fontSize: 13, fill: TEXT },
    majorGridlines: { style: "solid", fill: "#E3E7E5", width: 1 },
  },
  yAxis: { textStyle: { typeface: FONT, fontSize: 16, fill: TEXT }, majorGridlines: null },
  dataLabels: { showValue: true, position: "outEnd", textStyle: { typeface: FONT, fontSize: 15, fill: TEXT, bold: true } },
  chartFill: "#FFFFFF",
  plotAreaFill: "#FFFFFF",
  chartLine: { fill: "none", width: 0 },
  plotAreaLine: { fill: "none", width: 0 },
});
applyPresentationChartFont(tuyaChart, { fontFamily: FONT });
addText(slides[7], "当前关键阻塞点：数据上报链路尚未打通；目标在10月完成整体对接", { left: 150, top: 560, width: 980, height: 44 }, { fontSize: 19, color: GREEN_DARK, bold: true, alignment: "center" });

// 9. Release management
setTitle(slides[8], "4. 版本管理与发版");
clearBody(slides[8]);
const releaseTable = addTable(slides[8], [
  ["固件版本", "测试", "验收", "灰度", "全量发布", "公告传达"],
  ["4.8.6", "完成", "完成", "完成", "完成", "完成"],
  ["4.8.8", "完成", "完成", "完成", "完成", "完成"],
  ["4.9.1", "完成", "完成", "完成", "完成", "完成"],
  ["4.9.6", "完成", "完成", "完成", "完成", "完成"],
], [190, 165, 165, 165, 210, 209], 205, 345, { fontSize: 18 });
for (let r = 1; r < 5; r++) {
  const done = releaseTable.cells.block({ row: r, column: 1, rowCount: 1, columnCount: 5 });
  done.fill = GREEN_LIGHT;
  done.textStyle.color = GREEN_DARK;
  done.textStyle.bold = true;
  done.textStyle.alignment = "center";
}
addText(slides[8], "4个版本均完成测试、验收、灰度、全量发布及版本公告闭环", { left: 120, top: 585, width: 1040, height: 42 }, { fontSize: 20, color: GREEN_DARK, bold: true, alignment: "center" });

// 10. Hardware matrix derived from reference image
setTitle(slides[9], "5. 硬件产品矩阵规划");
clearBody(slides[9]);
addTable(slides[9], [
  ["系列", "产品/版本", "核心升级方向", "Q4节点", "参考上市节奏"],
  ["玩偶本体", "小乐V2", "NFC、主动攀谈、多人格、多音色", "11月上线并优化", "11月中旬至12月中旬"],
  ["玩偶本体", "小乐V3", "肢体动作、触摸、声纹、NFC换装", "12月完成打样", "12月中旬至次年1月底"],
  ["便携系列", "小乐包挂", "设备记忆、定位查找、触摸反馈", "10月完成打样", "11月中旬"],
  ["便携系列", "其他IP包挂", "IP包挂及来电方案", "11月完成打样", "11月中旬"],
  ["探索系列", "吧唧", "4G对话、跨设备记忆、定位", "11月打样，方案二选一", "12月中旬"],
  ["探索系列", "AI放大镜", "图像回传、多语言对话", "12月推进", "次年1月底"],
], [140, 180, 390, 205, 189], 175, 475, { fontSize: 15.5, rowFills: ["#FFFFFF", MINT, "#FFFFFF", "#EAF5FA", "#F6F0FA", "#FFFFFF"] });
slides[9].speakerNotes.textFrame.setText("硬件产品矩阵与上市节奏依据用户提供的《硬件矩阵规划表》参考图整理。Q4节点以用户本次更新的计划为准。 ");

// 11. Q4 roadmap
setTitle(slides[10], "6. 四季度 Roadmap");
clearBody(slides[10]);
const roadmap = addTable(slides[10], [
  ["月份", "硬件产品", "软件与平台", "关键验收点"],
  ["10月", "小乐包挂打样；V5机芯进入打样", "完成涂鸦对接", "V5机芯验证完成；涂鸦数据链路打通"],
  ["11月", "其他款包挂打样；吧唧打样", "小乐V2上线与功能优化", "吧唧在涂鸦与定制方案中完成选型"],
  ["12月", "AI放大镜推进；小乐V3打样", "V2小乐功能优化升级", "V3完成肢体动作与触摸能力验证"],
], [150, 350, 310, 294], 205, 360, { fontSize: 18, rowFills: ["#EAF5FA", "#EFF8F2", "#F6F0FA"] });
for (let r = 1; r < 4; r++) {
  const month = roadmap.getCell(r, 0);
  month.text.style = { typeface: FONT, fontSize: 24, bold: true, color: GREEN_DARK, alignment: "center" };
}
addText(slides[10], "主线：硬件打样与验证并行推进，小乐版本能力持续迭代", { left: 130, top: 595, width: 1020, height: 40 }, { fontSize: 20, color: GREEN_DARK, bold: true, alignment: "center" });
slides[10].speakerNotes.textFrame.setText("Roadmap依据用户提供的规划表参考图及本次明确的10月至12月计划整理。 ");

// 12. Q4 operating approach
setTitle(slides[11], "7. 四季度工作思路");
addText(slides[11], "项目推进机制", { left: 90, top: 178, width: 300, height: 36 }, { fontSize: 22, color: GREEN_DARK, bold: true });
const method = addTable(slides[11], [
  ["目标拆解", "方案与排期", "联调测试", "灰度验证", "复盘沉淀"],
  ["按月明确交付物", "绑定负责人和依赖", "每日跟踪问题清单", "分批验证核心体验", "更新Roadmap与规范"],
], [220, 220, 220, 220, 224], 220, 160, { fontSize: 17 });
method.cells.block({ row: 0, column: 0, rowCount: 1, columnCount: 5 }).fill = GREEN;
addText(slides[11], "重点关注", { left: 90, top: 420, width: 300, height: 36 }, { fontSize: 22, color: GREEN_DARK, bold: true });
setBody(slides[11], [
  "硬件、固件、服务端与小程序多端协同，提前识别接口和排期依赖",
  "线上版本问题优先保障，建立快速定位、验证和回滚机制",
  "以月度交付节点为准，持续跟踪打样、验证、上线和复盘闭环",
], 21);
const body = bodyShape(slides[11]);
body.position = { left: 88, top: 462, width: 1104, height: 170 };

// Export previews and draft.
await (await PresentationFile.exportPptx(presentation)).save(draftPath);
const inspect = await presentation.inspect({ kind: "deck,slide,textbox,shape,table,chart,notes,layout", maxChars: 50000 });
await fs.writeFile(path.join(buildDir, "deck.inspect.ndjson"), inspect.ndjson);
const montage = await presentation.export({ format: "png", montage: true, scale: 1 });
await fs.writeFile(path.join(buildDir, "montage.png"), new Uint8Array(await montage.arrayBuffer()));
for (let i = 0; i < slides.length; i++) {
  const preview = await slides[i].export({ format: "png", scale: 1.35 });
  await fs.writeFile(path.join(buildDir, `slide-${i + 1}.png`), new Uint8Array(await preview.arrayBuffer()));
  const layout = await slides[i].export({ format: "layout" });
  await fs.writeFile(path.join(buildDir, `slide-${i + 1}.layout.json`), await layout.text());
}

const stagingDir = path.join(workspaceDir, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const result = await finalizePresentation({
  explicitTotalSlideCount: 12,
  requiredNativeTableOwnerSlides: [2, 3, 5, 6, 7, 9, 10, 11, 12],
  requiredNativeChartOwnerSlides: [4, 8],
  materializeLiteralChartWorkbooks: true,
  nativeChartTargetApplication: "powerpoint",
  workspaceDir,
  candidatePath: draftPath,
  finalPath,
  pythonExecutable: "C:/Users/kings/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe",
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-heading-fit",
    "--require-native-table-slide", "2",
    "--require-native-table-slide", "3",
    "--require-native-table-slide", "5",
    "--require-native-table-slide", "6",
    "--require-native-table-slide", "7",
    "--require-native-table-slide", "9",
    "--require-native-table-slide", "10",
    "--require-native-table-slide", "11",
    "--require-native-table-slide", "12",
  ],
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "养娃乐季度汇报-8-9月-可视化增强版-v3.validation.json"),
});
console.log(JSON.stringify(result, null, 2));
