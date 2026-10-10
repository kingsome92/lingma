import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";
import { pathToFileURL } from "node:url";

const workspaceDir = "D:/Codex/养娃乐产品";
const skillDir = "C:/Users/kings/.codex/plugins/cache/openai-primary-runtime/presentations/26.923.10815/skills/presentations";
const buildDir = path.join(workspaceDir, ".codex-build");
const outputDir = path.join(workspaceDir, "季度汇报输出");
const draftPath = path.join(buildDir, "养娃乐季度汇报-8-9月-草稿.pptx");
const finalPath = path.join(outputDir, "养娃乐季度汇报-8-9月-已填充-v2.pptx");

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });

const presentation = await PresentationFile.importPptx(
  await FileBlob.load(path.join(workspaceDir, "养娃乐季度汇报-模板.pptx")),
);

const setText = (id, text, style = undefined) => {
  const shape = presentation.resolve(id);
  shape.text = text.replace(/^• /gm, "");
  if (style) shape.text.style = style;
};

setText("sh/547294r6", "季度工作汇报\n2026年8-9月");
setText("sh/k3yl0zql", "养娃乐教育科技");

setText("sh/a10jqpsj", "部门工作职责");
setText("sh/x4r21kru", [
  "• AI玩偶硬件端侧与协同软件端小程序开发、迭代",
  "• 版本Roadmap规划与产品调研",
  "• 机器人及智能硬件竞品调研",
  "• 端侧体验优化、功能上线、版本发布与跨团队项目推进",
].join("\n"), { typeface: "Arial", fontSize: 27, color: "#000000", alignment: "left" });

setText("sh/m5cra54z", "1. 三季度工作总结 - 核心成果");
setText("sh/n6ls3alk", [
  "• 贝瓦音频资源接入：上万首曲库资源上线",
  "• AI联网搜索：支持时政新闻、百科、天气等查询",
  "• 冷启动提速50%：WiFi开机对话约15秒（由30秒降至15秒）；深睡唤醒联网约9秒（由13秒降至9秒）",
  "• 4G开机对话约25秒（由30秒降至25秒）；深睡唤醒联网约15秒（由20秒降至15秒）",
  "• 弱网提示与重连机制、程序看门狗兜底上线",
  "• 主动对话：开机沉默至浅睡眠前5分钟窗口自动攀谈",
  "• 固件4.8.6、4.8.8、4.9.1、4.9.6完成测试、验收、灰度与全量发布",
].join("\n"), { typeface: "Arial", fontSize: 23.5, color: "#000000", alignment: "left" });

setText("sh/5cva1cfq", "2. 三季度工作总结 - 技术突破");
setText("sh/i94r6xgz", [
  "• 对话速度优化专项：聚焦听不清、响应慢两类问题",
  "• 固件端：优化收音阈值，调整唤醒词逻辑",
  "• 服务端：上下文召回由20轮降至5轮，人格提示词优化",
  "• 提示词重构：由4000余字符压缩至600余字符",
  "• 增加意图路由前置判断，优化资源预加载",
  "• 稳定性兜底：弱网重连、程序看门狗、深度睡眠唤醒优化",
].join("\n"), { typeface: "Arial", fontSize: 24.5, color: "#000000", alignment: "left" });

setText("sh/k7mxovud", "3. 四季度工作目标");
setText("sh/58vehgvy", [
  "• 10月重启福瑞达V5机芯内测，完成联调验证与问题闭环",
  "• 推进声纹识别玩偶及小程序功能开发",
  "• 跟进硬件产品矩阵Roadmap落地，覆盖机芯、玩偶版本与其他设备",
  "• 推进NFC故事阅读项目从打样到测试与上线准备",
  "• 持续优化直播项目，沉淀提示词、人设与示例对话方案",
  "• 持续推进固件版本质量、灰度与全量发布",
].join("\n"), { typeface: "Arial", fontSize: 24.5, color: "#000000", alignment: "left" });

setText("sh/i54bylor", "4. 四季度工作思路");
setText("sh/twfux0ne", [
  "• 10月：重启V5内测，围绕核心体验完成联调与问题闭环；推进声纹识别开发排期，同步支持直播项目",
  "• 11月：推进NFC故事阅读测试，完善硬件产品矩阵与竞品调研结论",
  "• 12月：沉淀版本Roadmap，完成年度重点功能复盘与下一阶段规划",
  "• 主要挑战：硬件、固件、服务端与小程序多端协同，线上问题需要快速定位",
  "• 应对方式：以版本节奏为主线，建立问题清单、每日跟踪、灰度验证与复盘闭环",
].join("\n"), { typeface: "Arial", fontSize: 23.5, color: "#000000", alignment: "left" });

await (await PresentationFile.exportPptx(presentation)).save(draftPath);

const montage = await presentation.export({ format: "png", montage: true, scale: 1 });
await fs.writeFile(path.join(buildDir, "filled-montage.png"), new Uint8Array(await montage.arrayBuffer()));
for (let i = 0; i < presentation.slides.items.length; i++) {
  const slide = presentation.slides.getItem(i);
  const preview = await slide.export({ format: "png", scale: 1.5 });
  await fs.writeFile(path.join(buildDir, `filled-slide-${i + 1}.png`), new Uint8Array(await preview.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(path.join(buildDir, `filled-slide-${i + 1}.layout.json`), await layout.text());
}

const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);
const stagingDir = path.join(workspaceDir, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const result = await finalizePresentation({
  workspaceDir,
  candidatePath: draftPath,
  finalPath,
  pythonExecutable: "C:/Users/kings/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe",
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit"],
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "养娃乐季度汇报-8-9月-已填充-v2.validation.json"),
});
console.log(JSON.stringify(result, null, 2));
