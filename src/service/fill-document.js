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
const { faker } = require("@faker-js/faker");
const path = require("path");
const { create } = require("domain");
const { generateKey } = require("crypto");
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

const generateData = () => {
  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                text: `${faker.commerce.productName()} x ${faker.commerce.productName()} x ${faker.commerce.productName()}`,
                size: "6pt"
              })
            ],
            verticalAlign: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: "Some Description" })],
            verticalAlign: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: String(faker.number.int(100)) })],
            textDirection: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: "Kg" })],
            textDirection: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: String(faker.number.int(1000)) })],
            textDirection: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [new Paragraph({ text: String(faker.number.int(10)) })],
            textDirection: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [
              new Paragraph({
                text: `PPN ${faker.number.int(20)}`,
                size: "9pt"
              })
            ],
            textDirection: VerticalAlign.CENTER
          }),
          new TableCell({
            children: [
              new Paragraph({ text: String(faker.number.int(99999)) })
            ],
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
  const createDummy = [...Array(5)].map((a) => generateData());

  patchDocument(
    fs.readFileSync("./public/templates/invoice_ptmegasemesta.docx"),
    {
      patches: {
        noInvoice: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "20"
            })
          ]
        },
        date: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: new Date().toDateString()
            })
          ]
        },
        dueDate: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: new Date().toDateString()
            })
          ]
        },
        client_company: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "SAMPLE COMPANY"
            })
          ]
        },
        client_address: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "SAMPLE ADDRESS"
            })
          ]
        },
        client_phone: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "+62 83912839128"
            })
          ]
        },
        client_email: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "SAMPLE EMAIL"
            })
          ]
        },
        company_name: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "PT MEGA SEMESTA"
            })
          ]
        },
        company_phone: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "+62 2349239492384"
            })
          ]
        },
        company_address: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "DASDAKLSBJDASDHASDAHDALSDKL"
            })
          ]
        },
        admin: {
          type: PatchType.PARAGRAPH,
          children: [
            new TextRun({
              text: "THERESIA"
            })
          ]
        },
        table: {
          type: PatchType.DOCUMENT,
          children: [header, ...createDummy]
        },
        subtotal: generateText(String(faker.number.int(999999))),
        tax: generateText("11%"),
        totalTax: generateText(String(faker.number.int(999999))),
        total: generateText(String(faker.number.int(999999))),
        rest: generateText(String(faker.number.int(999999)))
      }
    }
  )
    .then((doc) => {
      if (doc) {
        fs.writeFileSync("./public/templates/result.docx", doc);
      }
    })
    .catch((err) => console.log(err));
}

module.exports = {
  fillDocument
};
