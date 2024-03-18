import * as fs from "fs";
import { Paragraph, patchDocument, PatchType, TextRun } from "docx";

export async function fillDocument(data) {
  const DEFAULT_FONT_CONFIG = {
    size: "11pt"
  };

  return await patchDocument(
    fs.readFileSync("src/templates/invoice-t.terima.docx"),
    {
      patches: {
        sender: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              ...DEFAULT_FONT_CONFIG,
              text: "Joe",
              size: "11pt"
            })
          ]
        },
        recipient: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              ...DEFAULT_FONT_CONFIG,
              text: "Joko",
              size: "11pt"
            })
          ]
        },
        qty: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "10",
              size: "10pt"
            })
          ]
        },
        stn: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "Kg",
              size: "10pt"
            })
          ]
        },
        weight: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "100",
              size: "10pt"
            })
          ]
        },
        name: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "Sample Product",
              size: "10pt"
            })
          ]
        },
        price: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "120.000",
              size: "10pt"
            })
          ]
        },
        price_words: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "Seratus Dua Puluh Ribu Rupiah",
              size: "10pt"
            })
          ]
        },
        description: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "",
              size: "10pt"
            })
          ]
        }
      }
    }
  )
    .then((doc) => {
      console.log(doc);

      fs.writeFileSync("src/templates/result2.docx", doc);
    })
    .catch((err) => {
      console.log(err.message);
    });
}
