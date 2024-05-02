const { PatchType, TextRun } = require("docx");
const logger = require("../lib/logger");
const { convertToCapitalCase } = require("../helper/capitalize");

/**
 * Returns a formatted data object for patching.
 *
 * @param {string} value - The value to be patched.
 * @returns {object} - The formatted data object for patching.
 */
function patchesData(value) {
  return {
    type: PatchType.PARAGRAPH,
    children: [
      new TextRun({
        text: value
      })
    ]
  };
}

function getTotal(qty, price) {
  console.log("🚀 ~ getTotal ~ price:", price);
  console.log("🚀 ~ getTotal ~ qty:", qty);
  return isNaN(qty) ? String(Number(qty) * Number(price)) : "";
}

function getAmount(subTotal, disc, tax) {
  const discountAmount = subTotal * (disc / 100);
  const taxAmount = subTotal * (tax / 100);
  return subTotal - discountAmount + taxAmount;
}

/**
 * Formats the person data by extracting specific fields from the input data object.
 *
 * @param {Object} data - The input data object containing customer and company data.
 * @returns {Object} - The formatted person data object with extracted fields.
 */
function formatPersonData(data) {
  const { customerData: cs, companyData: c } = data;
  console.log("🚀 ~ formatPersonData ~ cs:", cs);

  return {
    cs_name: patchesData(convertToCapitalCase(cs.name)),
    cs_company_name: patchesData(convertToCapitalCase(cs.company)),
    cs_company_address: patchesData(cs.address),
    cs_phone: patchesData(cs.phone),
    c_admin: patchesData(convertToCapitalCase(c.admin)),
    c_name: patchesData(c.name),
    c_address: patchesData(c.address),
    c_phone: patchesData(c.phone)
  };
}

/**
 * Formats invoice data and calculates subTotal and total amount.
 *
 * @param {Object} data - The invoice data.
 * @param {number} disc - The discount percentage.
 * @param {number} tax - The tax percentage.
 * @returns {Array} - An array containing the formatted result, subTotal, and total amount.
 */
function formatInvoiceData(data, disc, tax) {
  let subTotal = 0;

  logger.info(`Client requesting the invoice with data:`, data);

  console.dir(data, { depth: null, color: true });
  const emptySlotLength = 8 - data.length;
  const fillEmptySlot = [...Array.from({ length: emptySlotLength })].map(
    (a, i) => {
      return {
        name: "",
        description: "",
        disc: "",
        price: "",
        quantity: "",
        stn: "",
        tax: "",
        totalAmount: ""
      };
    }
  );

  const result = [...data, ...fillEmptySlot].map((product, index) => {
    let total = getTotal(product.quantity || "", product.price);
    subTotal += total;

    return {
      [`product_${index + 1}`]: patchesData(
        convertToCapitalCase(product.name) || ""
      ),
      [`p_qty_${index + 1}`]: patchesData(
        String(!!product.quantity ? product.quantity : "")
      ),
      [`pt_${index + 1}`]: patchesData(product.stn || ""),
      [`price_${index + 1}`]: patchesData(product.price || ""),
      [`ptl_${index + 1}`]: patchesData(
        String(!!product.totalAmount ? product.totalAmount : "")
      )
    };
  });
  const total = getAmount(subTotal, disc, tax);
  const flatten = result
    .reverse()
    .reduce((acc, product) => ({ ...acc, ...product }), {});

  console.log("🚀 ~ formatInvoiceData ~ total:", total);

  return [flatten, subTotal, total];
}

module.exports = {
  formatInvoiceData,
  formatPersonData,
  getTotal,
  getAmount,
  patchesData
};
