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
  TextDirection,
  HeadingLevel
} = require("docx");
const moment = require("moment");
const { faker } = require("@faker-js/faker");
const path = require("path");
const { create } = require("domain");
// type exist = "RECEIPT" or "RECEIPT_PRODUCT"

function getStructure(type, data) {
  const receiptProductStructure = {
    noInvoice: 20,
    date: new Date().toDateString(),
    dueDate: new Date().toDateString(),
    client_company: "test",
    client_address: "test",
    client_phon: "312931203891",
    client_email: "jane@gmail.com",
    company_name: "PT MEGA SEMESTA",
    company_phone: "+62 81329391231",
    admin: "theresia"
  };

  return receiptProductStructure;
}

// TS

/*
  { 
    name: string 
    description: string 
    quantity: string
    stn: string 
    price: string;
    disc: string 
    tax: string
    totalAmount: string
  }[]
*/

const generateData = (data) => {
  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: data.name,
                size: "6pt"
              })
            ],
            verticalAlign: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: data.description })],
            verticalAlign: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: data.quantity })],
            textDirection: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: data.stn })],
            textDirection: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: data.price })],
            textDirection: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: data.disc })],
            textDirection: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: data.tax,
                size: "9pt"
              })
            ],
            textDirection: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: data.totalAmount })],
            textDirection: VerticalAlign.CENTER
          })
        ]
      })
    ]
  });
};
const generateText = (value) => {
  return {
    type: PatchType.PARAGRAPH,
    children: [
      new TextRun({
        text: value,
        bold: true
      })
    ]
  };
};
const header = new Table({
  rows: [
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Product" })],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph({ text: "Deskripsi" })],
          verticalAlign: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph({ text: "Kuantitas" })],
          textDirection: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph({ text: "Satuan" })],
          textDirection: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph({ text: "Harga" })],
          textDirection: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph({ text: "Diskon" })],
          textDirection: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph({ text: "Pajak" })],
          textDirection: VerticalAlign.CENTER
        }),
        new TableCell({
          children: [new Paragraph({ text: "Jumlah" })],
          textDirection: VerticalAlign.CENTER
        })
      ]
    })
  ]
});

async function fillDocument(data) {
  const { companyData, orderData, customerData, invoiceNumber, transaction } =
    data;
  const createDummy = orderData.map((a) => generateData());

  const momentNowObject = moment();
  const now = momentNowObject.format("dd/MM/YYYY");
  const dueDate = momentNowObject.add(15, "days").format("dd/MM/YYYY");

  try {
    const result = await patchDocument(
      fs.readFileSync("./public/templates/invoice_ptmegasemesta.docx"),
      {
        patches: {
          noInvoice: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: invoiceNumber
              })
            ]
          },
          date: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: now
              })
            ]
          },
          dueDate: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: dueDate
              })
            ]
          },
          client_company: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: customerData.name
              })
            ]
          },
          client_address: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: customerData.address
              })
            ]
          },
          client_phone: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: customerData.phone
              })
            ]
          },
          client_email: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: customerData.email
              })
            ]
          },
          company_name: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: companyData.name
              })
            ]
          },
          company_phone: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: companyData.phone
              })
            ]
          },
          company_address: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: companyData.address
              })
            ]
          },
          admin: {
            type: PatchType.PARAGRAPH,
            children: [
              new TextRun({
                text: companyData.admin
              })
            ]
          },
          table: {
            type: PatchType.DOCUMENT,
            children: [header, ...createDummy]
          },
          subtotal: generateText(transaction.subtotal),
          tax: generateText(transaction.disc),
          totalTax: generateText(transaction.totalTax),
          total: generateText(transaction.totalAmount),
          rest: generateText(transaction.rest)
        }
      }
    );

    if (result) {
      fs.writeFileSync("./public/templates/result.docx", result);

      return result;
    }
  } catch (error) {
    console.log(error.message);

    throw new Error(error.message);
  }
}

module.exports = {
  fillDocument
};
