const fs = require("fs");
const {
  Paragraph,
  patchDocument,
  PatchType,
  TextRun,
  Packer
} = require("docx");
const { fakerID_ID: faker } = require("@faker-js/faker");
const { PDFNet } = require("@pdftron/pdfnet-node");
const path = require("path");
const libre = require("libreoffice-convert");
libre.convertAsync = require("util").promisify(libre.convert);
// type exist = "RECEIPT" or "RECEIPT_PRODUCT"

const outputPath = path.resolve(__dirname, "public", "output.pdf");

function getStructure(type, data) {
  if (type === "RECEIPT") {
    const getRandomWeight = 9.219;
    const getPrice = 2000;

    const receiptProductStructure = {
      no: String(faker.finance.accountNumber()),
      date: new Date().toDateString(),
      receivedFrom: faker.person.fullName().toUpperCase(),
      priceWords:
        "Sembilan Juta Lima Ratus Tiga Puluh Dua Ribu Rupiah".toUpperCase(),
      productName: faker.commerce.productName(),
      fromCity: "MEDAN",
      destination: faker.location.city().toUpperCase(),
      weight: String(getRandomWeight),
      stn: "kg",
      resultWeight: String(getRandomWeight) + " " + "kg",
      price: String(getPrice),
      totalPrice: String(getRandomWeight * getPrice)
    };

    return receiptProductStructure;
  }
}

const convertToPDF = async (doc) => {
  const pdfDoc = await PDFNet.PDFDoc.create();
  await pdfDoc.initSecurityHandler();
  await PDFNet.Convert.toPdf(pdfDoc, doc);
  pdfDoc.save(outputPath, PDFNet.SDFDoc.SaveOptions.e_linearized);
};

async function fillDocument(data) {
  const { docType = "RECEIPT" } = data;

  const patches = {};
  Object.entries(getStructure(docType)).forEach(([key, value]) => {
    patches[key] = {
      type: PatchType.PARAGRAPH,
      children: [
        new TextRun({
          text: value,
          size: "9pt",
          font: "Fira Code"
        })
      ]
    };
  });

  return await patchDocument(
    fs.readFileSync("./public/templates/receipt.docx"),
    {
      patches
    }
  )
    .then((doc) => {
      return doc;
    })
    .catch((err) => {
      console.log(err.message);
    });
}

//  patches: {
//       sender: {
//         type: PatchType.PARAGRAPH,
//         children: [
//           new TextRun({
//             ...DEFAULT_FONT_CONFIG,
//             text: "Joe",
//             size: "11pt"
//           })
//         ]
//       },
//       recipient: {
//         type: PatchType.PARAGRAPH,
//         children: [
//           new TextRun({
//             ...DEFAULT_FONT_CONFIG,
//             text: "Joko",
//             size: "11pt"
//           })
//         ]
//       },
//       qty: {
//         type: PatchType.PARAGRAPH,
//         children: [
//           new TextRun({
//             text: "10",
//             size: "10pt"
//           })
//         ]
//       },
//       stn: {
//         type: PatchType.PARAGRAPH,
//         children: [
//           new TextRun({
//             text: "Kg",
//             size: "10pt"
//           })
//         ]
//       },
//       weight: {
//         type: PatchType.PARAGRAPH,
//         children: [
//           new TextRun({
//             text: "100",
//             size: "10pt"
//           })
//         ]
//       },
//       name: {
//         type: PatchType.PARAGRAPH,
//         children: [
//           new TextRun({
//             text: "Sample Product",
//             size: "11pt"
//           })
//         ]
//       },
//       prd_desc: {
//         type: PatchType.PARAGRAPH,
//         children: [
//           new TextRun({
//             text: "",
//             size: "10pt"
//           })
//         ]
//       },
//       price: {
//         type: PatchType.PARAGRAPH,
//         children: [
//           new TextRun({
//             text: "9.590.601.210,00",
//             size: "8pt"
//           })
//         ]
//       },
//       price_words: {
//         type: PatchType.PARAGRAPH,
//         children: [
//           new TextRun({
//             text: "Seratus Dua Puluh Ribu Rupiah",
//             size: "10pt"
//           })
//         ]
//       },
//       description: {
//         type: PatchType.PARAGRAPH,
//         children: [
//           new TextRun({
//             text: "",
//             size: "10pt"
//           })
//         ]
//       }
//     }

module.exports = {
  fillDocument
};
