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

const generateRows = (data, type) => {
  const createBaseLoop = [...Array(data.length)];
  const defaultSize = 100 / data.length;

  const rowsChildren = createBaseLoop.map((a, i) => {
    return new TableCell({
      width: {
        size: i === 0 ? 6000 : 2000,
        type: WidthType.DXA
      },
      children: [
        new Paragraph({
          spacing: {
            after: 0
          },
          children: [
            new TextRun({
              text: data[i].text,
              size: `${10}pt`,
              bold: !!type ? type === "bold" : false
            })
          ]
        })
      ]
    });
  });

  return new Table({
    rows: [
      new TableRow({
        children: rowsChildren
      })
    ]
  });
};

// console.dir(createHeader(["a", "b", "c", "d"], "bold"), {
//   depth: null,
//   colors: true
// });

const generateData = (data) => {
  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: {
              size: 30,
              type: WidthType.PERCENTAGE
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.name,
                    size: `${10}pt`
                  })
                ]
              })
            ],
            verticalAlign: VerticalAlign.CENTER
          }),
          generateBaseTextTable(data.description),
          generateBaseTextTable(data.quantity),
          generateBaseTextTable(data.stn),
          generateBaseTextTable(data.price),
          generateBaseTextTable(data.disc),
          generateBaseTextTable(data.tax),
          generateBaseTextTable(data.totalAmount, {
            width: {
              size: 26,
              type: WidthType.PERCENTAGE
            }
          })
        ]
      })
    ]
  });
};
const generateText = (value, bold, otherConfigText) => {
  return {
    type: PatchType.PARAGRAPH,
    children: [
      new TextRun({
        text: value,
        bold,
        ...otherConfigText
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

async function createInvoice(data) {
  const { companyData, orderData, customerData, invoiceNumber, transaction } =
    data;

  console.dir(data, { colors: true, depth: null });

  const createDummy = orderData.map((data) => generateData(data));

  const momentNowObject = moment();
  const now = momentNowObject.format("DD/MM/YYYY");
  const dueDate = momentNowObject.add(15, "days").format("DD/MM/YYYY");

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
          subtotal: generateText(transaction.subtotal, true),
          tax: generateText(orderData.tax, true),
          totalTax: generateText(transaction.totalTax, true),
          total: generateText(transaction.total, true),
          rest: generateText(transaction.rest, true)
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

async function createSuratJalan(data) {
  try {
    const templatePath = "./public/templates/surat-jalan-template.docx";
    const now = moment().format("DD/MM/YYYY");

    const dummy = [...Array(6)].map((f) =>
      generateRows([
        {
          text: faker.commerce.productName()
        },
        { text: String(faker.number.int({ max: 10 })) },
        { text: String(faker.commerce.price()) },
        { text: String(faker.commerce.price()) }
      ])
    );
    // const templateSize = [30, ...Array(3).map((_, i) => halfSize[i])];
    const getFakerPrice = faker.commerce.price();
    const result = await patchDocument(fs.readFileSync(templatePath), {
      patches: {
        clientName: generateText("Riki Stang Mio", false, { size: `${9}pt` }),
        totalAmount: generateText(getFakerPrice),
        priceWords: generateText(numberToWords(Number(getFakerPrice)), false, {
          size: `${9}pt`
        }),
        date: generateText(now),
        noInvoice: generateText(String(29)),
        tujuan: generateText(faker.location.streetAddress()),
        orders: {
          type: PatchType.DOCUMENT,
          children: [
            generateRows(
              [
                { text: "Nama Barang", size: 6000 },
                { text: "Jumlah Unit", size: 2000 },
                { text: "Harga", size: 2000 },
                { text: "Sub Total", size: 2000 }
              ],
              "bold"
            ),
            ...dummy
          ]
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
  createInvoice,
  createSuratJalan
};
