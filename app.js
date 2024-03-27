const express = require("express");
const cors = require("cors");
const fs = require("fs");
const mustache = require("mustache");
const path = require("path");
const dotenv = require("dotenv");
const {
  fillDocument,
  createInvoice,
  createSuratJalan
} = require("./src/service/fill-document.js");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

dotenv.config();

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

app.post("/invoice", async (req, res) => {
  const body = req.body;
  const q = req.query;

  if (q.dType === "invoice") {
    const document = await createInvoice(body);

    if (document) {
      return res.status(200).send({
        downloadedURL: `${process.env.DEV_URL}download-docx?docType=${q.dType}`
      });
    }
  }

  if (q.dType === "shipping") {
    const document = await createSuratJalan(body);

    if (document) {
      return res.status(200).send({
        downloadedURL: `${process.env.DEV_URL}download-docx?docType=${q.dType}`
      });
    }
  }

  // console.log("🚀 ~ app.post ~ document:", document);

  return res.status(500).send({ message: "INTERNAL_SERVER_ERROR" });
});

app.get("/download-docx", (req, res) => {
  const q = req.query;
  const getPath = path.resolve(
    "public",
    q.docType === "invoice"
      ? "templates/result.docx"
      : "templates/surat-jalan-template.docx"
  );
  const filePath = getPath; // Update with the actual path to your .docx file
  if (filePath) {
    return res.status(200).download(filePath);
  }

  return res.status(500).send({ message: "INTERNAL_SERVER_ERROR" });
});

app.get("/", async (req, res) => {
  res.send({ message: "No ones here." });
});

// Set up the server to listen on port 8080
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
