import fs from "fs";
import path from "path";

const targetDir = "./src";

function cleanCommentsInFile(filePath: string) {
  let content = fs.readFileSync(filePath, "utf8");

  const stringPlaceholders: string[] = [];
  content = content.replace(/(['"`])(?:\\.|(?!\1).)*\1/g, (match) => {
    stringPlaceholders.push(match);
    return `__STRING_${stringPlaceholders.length - 1}__`;
  });

  content = content.replace(/(\/\/(?!#region|#endregion).*?$)|(\/\*[\s\S]*?\*\/)/gm, "");

  content = content.replace(/__STRING_(\d+)__/g, (_, i) => stringPlaceholders[Number(i)]);

  fs.writeFileSync(filePath, content, "utf8");
  console.log("✅ Cleaned:", filePath);
}

function walkDir(dir: string) {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith(".ts")) {
      cleanCommentsInFile(filePath);
    }
  });
}

walkDir(targetDir);
