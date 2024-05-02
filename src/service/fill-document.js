const fs = require("fs");
const {
  Paragraph,
  patchDocument,
  PatchType,
  TextRun,
  Packer,
  Table,
  TableRow,
  TableCell,
  VerticalAlign,
  HorizontalPositionAlign,
  TextDirection,
  HeadingLevel,
  WidthType,
  AlignmentType
} = require("docx");
const moment = require("moment");
const path = require("path");
const { fakerID_ID: faker } = require("@faker-js/faker");
const { numberToWords } = require("./numberToWords");
const { formatInvoiceData, formatPersonData } = require("./invoice-service");
// type exist = "RECEIPT" or "RECEIPT_PRODUCT"

const generateBaseTextTable = (data, otherCellProp) => {
  return new TableCell({
    ...otherCellProp,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: data,
            size: `${10}pt`
          })
        ]
      })
    ],
    verticalAlign: VerticalAlign.CENTER
  });
};

async function createSuratJalan(data) {
  try {
    const templatePath = "./public/templates/surat-jalan-template.docx";
    const now = moment().format("DD/MM/YYYY");

    const headerTable = generateRows(
      [
        { text: "Nama Barang", size: 6000 },
        { text: "Jumlah Unit", size: 2000 },
        { text: "Harga", size: 2000 },
        { text: "Sub Total", size: 2000 }
      ],
      "bold"
    );
    const bodyTable = data.products.map((product) =>
      generateRows([
        {
          text: product.name
        },
        { text: product.quantity },
        { text: product.price },
        { text: product.subTotal }
      ])
    );
    const result = await patchDocument(fs.readFileSync(templatePath), {
      patches: {
        clientName: generateText(data.clientName, false, { size: `${9}pt` }),
        totalAmount: generateText(data.price),
        priceWords: generateText(data.priceWords, false, {
          size: `${9}pt`
        }),
        date: generateText(now),
        noInvoice: generateText(data.noInvoice),
        tujuan: generateText(data.shippingTo),
        orders: {
          type: PatchType.DOCUMENT,
          children: [headerTable, ...bodyTable]
        }
      }
    });

    if (result) {
      fs.writeFileSync("./public/templates/result-surat-jalan.docx", result);

      return result;
    }
  } catch (error) {
    console.error(error.message);
  }
}

module.exports = {
  createSuratJalan
};
