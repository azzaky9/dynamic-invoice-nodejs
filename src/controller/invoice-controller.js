const fs = require("fs");
const moment = require("moment");
const { patchDocument } = require("docx");
const { generateText } = require("../service/document-service");
const {
  formatInvoiceData,
  formatPersonData
} = require("../service/invoice-service");
const { formatCurrency } = require("../helper/format-currency");
const {
  formatPersonDataSj,
  formatShippingLetter
} = require("../service/surat-jalan-service");
const logger = require("../lib/logger");

const NO_INVOICE_VAR = "no_invoice";
const DATE_INVOICE_VAR = "date";

async function makeSuratJalan(data) {
  console.dir(data, { depth: null, color: true });

  const date = new Date();
  const readableDate = date.toLocaleDateString("id-Id");

  const person = formatPersonDataSj({
    customerData: {
      name: data.clientName,
      address: data.shippingTo
    },
    adminData: {
      name: data.admin
    }
  });
  const [products] = formatShippingLetter(data.products);

  const result = await patchDocument(
    fs.readFileSync("./public/templates/template-surat-jalan-new.docx"),
    {
      patches: {
        ...person,
        ...products,
        [NO_INVOICE_VAR]: generateText(data.noInvoice, true),
        [DATE_INVOICE_VAR]: generateText(readableDate, true)
      }
    }
  );

  if (result) {
    fs.writeFileSync("./public/templates/result-surat-jalan.docx", result);

    return result;
  }
}

async function makeInvoice(data) {
  const { companyData, orderData, customerData, invoiceNumber, transaction } =
    data;

  // const momentNowObject = moment(dates);

  const persons = formatPersonData({
    companyData,
    customerData
  });
  const [products] = formatInvoiceData(
    orderData,
    transaction.disc,
    transaction.tax
  );
  const date = new Date();
  const readableDate = date.toLocaleDateString("id-Id");

  const result = await patchDocument(
    fs.readFileSync("./public/templates/dynamic-invoice.docx"),
    {
      patches: {
        ...persons,
        ...products,
        [NO_INVOICE_VAR]: generateText(invoiceNumber, true),
        [DATE_INVOICE_VAR]: generateText(readableDate, true),
        instruction: generateText("", true),
        subtotal: generateText(formatCurrency(transaction.subtotal), true),
        tax: generateText(`${transaction.tax} %`, true),
        disc: generateText(`${transaction.disc} %`, true),
        total: generateText(formatCurrency(transaction.total), true)
      }
    }
  );

  if (result) {
    fs.writeFileSync("./public/templates/result.docx", result);

    return result;
  }
}

const requestDocument = async (docType, bodyRequest) => {
  logger.info("Requesting document type: ", docType);
  logger.info("Creating document with data: ", bodyRequest);

  return docType === "invoice"
    ? makeInvoice(bodyRequest)
    : docType === "shipping"
    ? makeSuratJalan(bodyRequest)
    : null;
};

module.exports = { makeInvoice, requestDocument };
