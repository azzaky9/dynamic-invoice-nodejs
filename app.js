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
import util from "util";
import { nestedLog } from "./src/helper/nested-log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

dotenv.config();

const data = {
  sender: {
    name: "",
    address: ""
  },
  recipient: {
    name: "",
    address: ""
  },
  barang: [
    {
      no: 1,
      jenis: "Elektronik",
      nama_barang: "Laptop",
      packing: "Kardus",
      jumlah: 1,
      berat_kubik: "2 kg/m3",
      keterangan: "Baru"
    }
  ],
  invoiceNumber: 509,
  tagihan: {
    tagihan: "Rp. 1.000.000",
    lunas: "Rp. 500.000",
    dp: "Rp. 200.000",
    jumlah_tagihan: "Rp. 300.000"
  },
  catatan:
    "Barang harap diperiksa sebelum diterima.\nJika ada kerusakan, segera hubungi pengirim.",
  notes: [
    {
      note: "CV PUTRA MANDIRI EXPRESS tidak akan mengganti atas kerusakan barang barang yang di sebabkan kerusakan membungkus, kebocoran atau akibat kurang kuatnya ikstan pembungkus"
    },
    {
      note: "CV PUTRA MANDIRI EXPRESS tidak akan menggantirugi yang di akibatkan keaadaaan force mayor seperti kebakaran mobil, tabrakan mobil, mobil jatuh, penjarahan dalam perjalanan dll."
    },
    {
      note: "Status hukum dari barang yang dikirm sepenuhnya tanggung jawab pemilik barang dan isi barang tidak di periksa"
    },
    {
      note: "Barang-barang yang dirikim isinya harus cocok dan sejenis dengan yang tertera di faktur"
    },
    {
      note: "Claim barang dan kurang karena kelainan sopir harus disaksikan kami dalam tempo 1x12 jam setelah barang diterima, setelah 1x12  jam bukan tanggung jawab kami"
    },
    {
      note: "Barang-barang kiriman yang tidak  diasuransikan apabila terjadi kehilangan atau kerusakan, hanya dapat pengganti maksimum 10x dari biaya pengiriman, maksimal senilai harga baran diambil mana yang lebih rendah"
    }
  ]
};
// Define a route handler for the root path
app.post("/doc", async (req, res) => {
  const body = req.body;

  console.log(body);

  if (!body.orderId) {
    return res.send({ message: "need orderId for creating the invoice" });
  }

  // Required: {orderId -> String}
  const totalInvoice = await prismaConnection.invoice.count();
  await prismaConnection.invoice.create({
    data: {
      id: randomUUID(),
      invoice_number: String(totalInvoice + 1).padStart("4", "000"),
      order: {
        connect: {
          id: body.orderId
        }
      }
    }
  });

  res.send({ message: "invoice created" }).redirect("/doc");
});

app.get("/doc", async (req, res) => {
  // expected doc?d={invoiceId}

  const params = req.query;
  const id = params.d;

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
          }
        }
      }
    }
  });

  nestedLog(rawInvoiceData);

  const template = fs.readFileSync(
    path.join(__dirname, "public", "templates/A5-Surat-Jalan.html"),
    "utf-8"
  );

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
    }
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
    path: "output.pdf",
    format: "A5",
    landscape: true
  });

  await browser.close();

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
