import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";
import { JSDOM } from "jsdom";

const INPUT_DIR = "tests/wrong_files";
const OUTPUT_DIR = "tests/fixed_files";

async function* walk(dir) {
  for await (const item of await fs.readdirSync(dir, { withFileTypes: true })) {
    const entry = path.join(dir, item.name);
    if (item.isDirectory()) yield* await walk(entry);
    else if (item.isFile()) yield entry;
  }
}

for await (let file of walk(INPUT_DIR)) {
  try {
    if (file.endsWith(".html")) {
      const content = fs.readFileSync(file, { encoding: "utf8" });
      const dom = new JSDOM(content);
      const document = dom.window.document;

      // move <style> to body
      const styleElement = document
        .querySelector("head")
        .querySelector("#editme");
      styleElement.remove();
      document.body.prepend(styleElement);

      // prettify the content
      let html = dom.serialize();
      html = prettier.format(html, { parser: "html", singleQuote: false });

      file = file.replace(INPUT_DIR, OUTPUT_DIR);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, html);
      console.log(`Processed: ${file}`);
    }
  } catch (err) {
    console.warn(`Error processing file: ${file}\n ${err}`);
  }
}
