// Import necessary modules
import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import fs from "fs";
import mustache from "mustache";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import dotenv from "dotenv";
import { prismaConnection } from "./src/lib/prisma.js";
import { randomUUID } from "crypto";
import { nestedLog } from "./src/helper/nested-log.js";
import { data } from "./src/utils/makeData.js";
import { createArrayOfProduct } from "./src/service/docService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

dotenv.config();

// Define a route handler for the root path
app.post("/doc", async (req, res) => {
  const body = req.body;

  console.log(body);

  if (!body.orderId) {
    return res.send({ message: "need orderId for creating the invoice" });
  }

  // Required: {orderId -> String}
  const totalInvoice = await prismaConnection.invoice.count();
  const createdInvoice = await prismaConnection.invoice.create({
    data: {
      id: randomUUID(),
      invoice_number: String(totalInvoice + 1).padStart("4", "000"),
      order: {
        
        connect: {
          id: body.orderId
        }
      }
    },
    select: {
      id: true
    }
  });

  if (!createdInvoice) {
    return res.send({
      status: 500,
      message: "error during creating, internal server error."
    });
  }

  res.send({ message: "invoice created", url: `/doc?d=${createdInvoice.id}` });
});

app.get("/doc", async (req, res) => {
  // expected doc?d={invoiceId}

  const params = req.query;
  const id = params.d;

  if (!id) {
    return res.redirect("/");
  }

  const rawInvoiceData = await prismaConnection.invoice.findFirst({
    where: {
      id
    },
    include: {
      order: {
        select: {
          recipient_name: true,
          address: true,
          recipient_phone: true,
          order_person: {
            select: {
              customer: {
                select: {
                  name: true,
                  address: true
                }
              }
            }
          },
          product_orders: {
            select: {
              products: {
                select: {
                  name: true,
                  description: true
                }
              }
            }
          },
          total_price: true
        }
      }
    }
  });

  nestedLog(rawInvoiceData);

  const template = fs.readFileSync(
    path.join(__dirname, "public", "templates/A5-Surat-Jalan.html"),
    "utf-8"
  );
  const formatCurrency = data.totalPrice.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR"
  });
  const trimLastZero = formatCurrency.replace(/,00$/, "");
  const renderedHtml = mustache.render(template, {
    ...data,
    invoiceNumber: rawInvoiceData.invoice_number,
    sender: {
      name: rawInvoiceData.order[0].order_person[0].customer.name,
      address: rawInvoiceData.order[0].order_person[0].customer.address
    },
    recipient: {
      name: rawInvoiceData.order[0].recipient_name,
      address: rawInvoiceData.order[0].address
    },
    totalPrice: trimLastZero,
    productOrders: createArrayOfProduct(rawInvoiceData.order[0].product_orders)
  });
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
    path: "./dist/output.pdf",
    format: "A5",
    landscape: true
  });

  await browser.close();

  console.log("PDF Launch.");

  res.type("application/pdf");
  res.send(pdf);
});

app.get("/", async (req, res) => {
  res.send({ message: "No ones here." });
});

// Set up the server to listen on port 8080
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
