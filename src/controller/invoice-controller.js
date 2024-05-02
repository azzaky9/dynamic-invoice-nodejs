const fs = require("fs");
const moment = require("moment");
const { patchDocument } = require("docx");
const { generateText } = require("../service/document-service");
const { createSuratJalan } = require("../service/fill-document");
const {
  formatInvoiceData,
  formatPersonData
} = require("../service/invoice-service");
const { formatCurrency } = require("../helper/format-currency");

async function makeInvoice(data) {
  const {
    companyData,
    orderData,
    customerData,
    invoiceNumber,
    transaction,
    dates
  } = data;

  const momentNowObject = moment(dates);
  const NO_INVOICE_VAR = "no_invoice";
  const DATE_INVOICE_VAR = "date";
  const persons = formatPersonData({
    companyData,
    customerData
  });
  const [products, subTotal, totalAmount] = formatInvoiceData(
    orderData,
    transaction.disc,
    transaction.tax
  );
  const date = new Date();
  const readableDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  console.dir(products, { depth: null, color: true });

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
  console.log("🚀 ~ makeInvoice ~ result:", result);

  if (result) {
    fs.writeFileSync("./public/templates/result.docx", result);

    return result;
  }
}

const requestDocument = async (docType, bodyRequest) => {
  return await makeInvoice(bodyRequest);
  // return docType === "invoice"
  //   ? makeInvoice(bodyRequest)
  //   : docType === "shipping"
  //   ? createSuratJalan(bodyRequest)
  //   : null;
};

module.exports = { makeInvoice, requestDocument };
