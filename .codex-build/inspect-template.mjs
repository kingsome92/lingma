import { FileBlob, PresentationFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";

const sourcePath = "D:/Codex/养娃乐产品/养娃乐季度汇报-模板.pptx";
const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const snapshot = await presentation.inspect({
  kind: "deck,slide,textbox,shape,image,table,chart,notes,layout",
  maxChars: 30000,
});
await fs.writeFile("D:/Codex/养娃乐产品/.codex-build/template-inspect.ndjson", snapshot.ndjson);
console.log(snapshot.ndjson);
const montage = await presentation.export({ format: "png", montage: true, scale: 1 });
await fs.writeFile("D:/Codex/养娃乐产品/.codex-build/template-montage.png", new Uint8Array(await montage.arrayBuffer()));
for (let i = 0; i < presentation.slides.items.length; i++) {
  const slide = presentation.slides.getItem(i);
  const preview = await slide.export({ format: "png", scale: 1.5 });
  await fs.writeFile(`D:/Codex/养娃乐产品/.codex-build/template-slide-${i+1}.png`, new Uint8Array(await preview.arrayBuffer()));
  const layout = await slide.export({ format: "layout" });
  await fs.writeFile(`D:/Codex/养娃乐产品/.codex-build/template-slide-${i+1}.layout.json`, await layout.text());
}
