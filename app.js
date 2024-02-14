// Import necessary modules
import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import fs from "fs";
import mustache from "mustache";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create an instance of express

const app = express();

app.use(cors());
// app.use(e.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, "public")));

var data = {
  pengirim: {
    nama: "Budi Santoso",
    alamat: "Jl. Merdeka No. 123, Medan"
  },
  penerima: {
    nama: "Andi Wijaya",
    alamat: "Jl. Sudirman No. 456, Jakarta"
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
  sender: {
    name: "Joni",
    address: "Example address sender"
  },
  recipient: {
    name: "Joko",
    address: "Example address recipient Jl Melati "
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
app.get("/", async (req, res) => {
  const template = fs.readFileSync(
    path.join(__dirname, "public", "templates/A5-Surat-Jalan.html"),
    "utf-8"
  );

  const renderedHtml = mustache.render(template, data);
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.goto(`data:text/html,${renderedHtml}`, {
    waitUntil: "networkidle0"
  });
  // await page.setContent(renderedHtml, { waitUntil: "networkidle0" });
  await page.addStyleTag({
    path: path.join(__dirname, "public", "styles/style.css")
  });

  const pdfBuffer = await page.pdf({
    path: "output.pdf",
    format: "A5",
    landscape: true
  });

  await browser.close();

  res.contentType("application/pdf");
  res.send(pdfBuffer);
});

// Set up the server to listen on port 8080
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
