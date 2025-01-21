import fs from "fs";
import path from "path";
import handlebars from "handlebars";
import juice from "juice";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTemplate(name: string, context: any) {
  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    throw new Error("Invalid template name");
  }

  const templatePath = path.join(__dirname, `${name}.hbs`);

  if (!fs.existsSync(templatePath)) {
    throw new Error("Template not found");
  }

  const source = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(source);
  const html = template(context);
  return juice(html);
}
