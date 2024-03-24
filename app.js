// Import necessary modules
const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");
const fs = require("fs");
const mustache = require("mustache");
const { fileURLToPath } = require("url");
const path = require("path");
const dotenv = require("dotenv");
const { prismaConnection } = require("./src/lib/prisma.js");
const { randomUUID } = require("crypto");
const { nestedLog } = require("./src/helper/nested-log.js");
const { data } = require("./src/utils/makeData.js");
const { createArrayOfProduct } = require("./src/service/docService.js");
const { fillDocument } = require("./src/service/fill-document.js");
const { Packer } = require("docx");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

dotenv.config();

// Define a route handler for the root path
// app.post("/doc", async (req, res) => {
//   const body = req.body;

//   console.log(body);

//   if (!body.orderId) {
//     return res.send({ message: "need orderId for creating the invoice" });
//   }

//   // Required: {orderId -> String}
//   const totalInvoice = await prismaConnection.invoice.count();
//   const createdInvoice = await prismaConnection.invoice.create({
//     data: {
//       id: randomUUID(),
//       invoice_number: String(totalInvoice + 1).padStart("4", "000"),
//       order: {
//         connect: {
//           id: body.orderId
//         }
//       }
//     },
//     select: {
//       id: true
//     }
//   });

//   if (!createdInvoice) {
//     return res.send({
//       status: 500,
//       message: "error during creating, internal server error."
//     });
//   }

//   res.send({ message: "invoice created", url: `/doc?d=${createdInvoice.id}` });
// });

app.get("/sample-doc", async (req, res) => {
  console.log("trigger sample docs");

  const template = fs.readFileSync(
    path.join(__dirname, "public", "templates", "receipt.mustache"),
    "utf-8"
  );

  const renderedHtml = mustache.render(template, {});

  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(`data:text/html,${renderedHtml}`, {
    waitUntil: "networkidle0"
  });
  // await page.setContent(renderedHtml, { waitUntil: "networkidle0" });
  await page.addStyleTag({
    path: path.join(__dirname, "public", "styles/style.css")
  });

  const pdf = await page.pdf({
    format: "A5",
    landscape: true
  });

  await browser.close();

  res.type("application/pdf");
  res.send(pdf);
});

// app.get("/doc", async (req, res) => {
//   // expected doc?d={invoiceId}

//   const params = req.query;
//   const id = params.d;
//   const qId = params.q_id;

//   if (!id) {
//     return res.redirect("/");
//   }

//   const rawInvoiceData = await prismaConnection.invoice.findFirst({
//     where: {
//       id
//     },
//     select: {
//       order: {
//         select: {
//           recipient_name: true,
//           recipient_phone: true,
//           address: true,
//           payment_method: true,
//           packing_type: true,
//           invoice: {
//             select: {
//               invoice_number: true
//             }
//           },
//           order_person: {
//             select: {
//               customer: {
//                 select: {
//                   name: true,
//                   address: true
//                 }
//               }
//             }
//           },
//           product_orders: {
//             select: {
//               products: {
//                 select: {
//                   name: true,
//                   description: true,
//                   weight: true,
//                   price: true,
//                   stocks: {
//                     where: {
//                       id: Number(qId)
//                     }
//                   }
//                 }
//               }
//             }
//           },
//           total_price: true
//         }
//       }
//     }
//   });

//   nestedLog(rawInvoiceData);

//   const template = fs.readFileSync(
//     path.join(__dirname, "public", "templates/tanda-terima.html"),
//     "utf-8"
//   );

//   const formatCurrency = rawInvoiceData.order[0].total_price.toLocaleString(
//     "id-ID",
//     {
//       style: "currency",
//       currency: "IDR"
//     }
//   );
//   const trimLastZero = formatCurrency.replace(/,00$/, "");
//   const renderedHtml = mustache.render(template, {
//     ...data,
//     invoiceNumber: rawInvoiceData.order[0].invoice.invoice_number,
//     sender: {
//       name: rawInvoiceData.order[0].order_person[0].customer.name,
//       address: rawInvoiceData.order[0].order_person[0].customer.address
//     },
//     recipient: {
//       name: rawInvoiceData.order[0].recipient_name,
//       address: rawInvoiceData.order[0].address
//     },
//     payment: {
//       ...data.payment,
//       [rawInvoiceData.order[0].payment_method]: true
//     },
//     totalPrice: trimLastZero,
//     productOrders: createArrayOfProduct(rawInvoiceData.order[0])
//   });

//   nestedLog(renderedHtml);

//   const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
//   const page = await browser.newPage();
//   await page.goto(`data:text/html,${renderedHtml}`, {
//     waitUntil: "networkidle0"
//   });
//   // await page.setContent(renderedHtml, { waitUntil: "networkidle0" });
//   await page.addStyleTag({
//     path: path.join(__dirname, "public", "styles/style.css")
//   });

//   const pdf = await page.pdf({
//     path: "./dist/output.pdf",
//     format: "A5",
//     landscape: false
//   });

//   await browser.close();

//   console.log("PDF Launch.");

//   res.type("application/pdf");
//   res.send(pdf);
// });

app.get("/invoice/receipt", async (req, res) => {
  const body = req.body;

  const docBuffer = await fillDocument(body);

  // await Packer({  })
  const docxFilePath = path.join(
    __dirname,
    "public",
    "templates",
    "receipt-result2.docx"
  );
  const file = fs.createReadStream(docxFilePath);
  const stat = fs.statSync(docxFilePath);

  file.pipe(res);

  // Set the headers to specify the file type and attachment
  res.setHeader("Content-Length", stat.size);
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
  res.setHeader("Content-Disposition", "attachment; filename=example.docx");
});

app.get("/", async (req, res) => {
  res.send({ message: "No ones here." });
});

// Set up the server to listen on port 8080
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
