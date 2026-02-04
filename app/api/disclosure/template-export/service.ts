import { readFile } from "fs/promises";
import { join } from "path";
import AdmZip from "adm-zip";

export interface DisclosureData {
  inventionName: string;
  contactPerson?: string;
  applicationType?: string;
  technicalField: string;
  techBackground: string;
  technicalSolution: string;
  beneficialEffects?: string;
  protectionPoints?: string;
}

export async function generateDisclosureDocumentFromTemplate(data: DisclosureData): Promise<Buffer> {
  const {
    inventionName,
    contactPerson = "",
    applicationType = "发明",
    technicalField,
    techBackground,
    technicalSolution,
    beneficialEffects = "",
    protectionPoints = "",
  } = data;

  const templatePath = join(process.cwd(), "public", "专利交底书模板.docx");
  const templateBuffer = await readFile(templatePath);

  const zip = new AdmZip(templateBuffer);

  let documentXml = zip.readAsText("word/document.xml");

  const replacements: Record<string, string> = {
    "{{发明名称}}": inventionName,
    "{{联系人}}": contactPerson,
    "{{技术领域}}": technicalField,
    "{{技术背景}}": techBackground,
    "{{技术方案}}": technicalSolution,
    "{{有益效果}}": beneficialEffects,
    "{{关键保护点}}": protectionPoints,
    "{{填写日期}}": new Date().toLocaleDateString("zh-CN"),
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    const escapedValue = convertToWordFormat(value);
    const pattern = new RegExp(`<w:t>${escapeRegExp(placeholder)}</w:t>`, "g");
    documentXml = documentXml.replace(pattern, escapedValue);
  }

  const wingdingsMatches = [];
  let matchIndex = documentXml.indexOf('<w:sym w:font="Wingdings" w:char="00A8"/>');
  while (matchIndex !== -1) {
    wingdingsMatches.push(matchIndex);
    matchIndex = documentXml.indexOf('<w:sym w:font="Wingdings" w:char="00A8"/>', matchIndex + 1);
  }

  if (wingdingsMatches.length >= 2) {
    if (applicationType === "发明") {
      const firstCheckboxStart = wingdingsMatches[0];
      documentXml = documentXml.substring(0, firstCheckboxStart) + 
                   '<w:sym w:font="Wingdings" w:char="F0FE"/>' + 
                   documentXml.substring(firstCheckboxStart + '<w:sym w:font="Wingdings" w:char="00A8"/>'.length);
    } else if (applicationType === "实用新型") {
      const secondCheckboxStart = wingdingsMatches[1];
      documentXml = documentXml.substring(0, secondCheckboxStart) + 
                   '<w:sym w:font="Wingdings" w:char="F0FE"/>' + 
                   documentXml.substring(secondCheckboxStart + '<w:sym w:font="Wingdings" w:char="00A8"/>'.length);
    }
  }

  zip.addFile("word/document.xml", Buffer.from(documentXml, "utf-8"));

  return zip.toBuffer();
}

function convertToWordFormat(text: string): string {
  const lines = text.split(/\r?\n/);
  if (lines.length === 1) {
    return `<w:t>${escapeXml(lines[0])}</w:t>`;
  }
  
  return lines.map((line, index) => {
    const content = index === 0 ? line : `　　${line}`;
    return `<w:t>${escapeXml(content)}</w:t>`;
  }).join('<w:br/>');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
