const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const logger = require("./src/lib/logger.js");
const { requestDocument } = require("./src/controller/invoice-controller.js");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "public")));

dotenv.config();

app.post("/invoice", async (req, res) => {
  const body = req.body;
  const q = req.query;

  logger.info("Client Request the Invoice with query parameter: ", q);

  try {
    if (!!q.dType) {
      logger.info("Document Type Valid, start to request.");
      const getDocuments = await requestDocument(q.dType, body);

      if (getDocuments) {
        logger.info("Document Created!. Server send download URL to Client..");
        return res.status(200).send({
          downloadedURL: `${process.env.PUBLIC_URL}download-docx?docType=${q.dType}`
        });
      }
    } else {
      logger.info("Document type doesn't exist. Server send bad request.");
      return res.status(400).send({
        message: "must be include document type"
      });
    }
  } catch (error) {
    logger.error("Failed to create the document. Error happen in Server.");
    return res.status(500).send({ message: "INTERNAL_SERVER_ERROR" });
  }
});

app.get("/download-docx", (req, res) => {
  const q = req.query;

  try {
    logger.info("Client try to download the Document with query: ", q);

    const getPath = path.resolve(
      "public",
      q.docType === "invoice"
        ? "templates/result.docx"
        : "templates/result-surat-jalan.docx"
    );
    const filePath = getPath; // Update with the actual path to your .docx file
    if (filePath) {
      logger.info("Path Valid. Download Start, Process done.");
      return res.status(200).download(filePath);
    }
  } catch (error) {
    logger.error(
      "Error happen during requesting with URL, INTERNAL SERVER ERROR."
    );
    console.error(error.message);
    return res.status(500).send({ message: "INTERNAL_SERVER_ERROR" });
  }
});

app.get("/error-url", async (req, res) => {
  return res.send(`
    <p style="text-align: center; padding: 40px; font-size: 16px">Error Request to the Server. Please make sure your request url is valid</p>
  `);
});

app.get("/", async (req, res) => {
  return res.redirect(process.env.DIRECT_ORIGIN_URL);
});

// Set up the server to listen on port 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, (err) => {
  if (err) {
    logger.error("Error start the server");
    return console.log(err.message);
  }
  return logger.info(`Server is listening on port ${PORT}`);
});
