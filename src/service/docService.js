const { nestedLog } = require("../helper/nested-log");
const { createInvoice, createSuratJalan } = require("./fill-document");

const createArrayOfProduct = (raws) => {
  nestedLog(raws);

  const result = raws.product_orders.map((raw, index) => ({
    no: index + 1,
    name: raw.products.name,
    description: raw.products.description,
    packingType: raws.packing_type,
    quantity: raw.products.stocks.quantity,
    weight: raw.products.weight + " " + raw.products.stocks.quantity_type
  }));

  nestedLog(result);

  return result;
};

const getDocument = async (docType, bodyRequest) => {
  return docType === "invoice"
    ? createInvoice(bodyRequest)
    : docType === "shipping"
    ? createSuratJalan(bodyRequest)
    : null;
};

module.exports = {
  createArrayOfProduct,
  getDocument
};
