import { mkdir, readFile, writeFile } from "node:fs/promises";
import { products } from "../src/data.js";
const html = await readFile("dist/index.html", "utf8");
for (const item of [null, ...products]) {
  const route = item ? `products/${item.id}` : "products";
  await mkdir(`dist/${route}`, { recursive: true });
  const title = item ? `${item.name} | BAULIPA` : "Pool essentials | BAULIPA";
  await writeFile(
    `dist/${route}/index.html`,
    html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`),
  );
}
