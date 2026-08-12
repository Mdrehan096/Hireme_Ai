const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function readPDF(filePath) {
  let parser;

  try {
    const buffer = fs.readFileSync(filePath);

    parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    return result.text;
  } catch (error) {
    console.error("PDF Error:", error.message);
    throw new Error("Unable to read resume PDF.");
  } finally {
    if (parser) {
      await parser.destroy();
    }
  }
}

module.exports = {
  readPDF,
};