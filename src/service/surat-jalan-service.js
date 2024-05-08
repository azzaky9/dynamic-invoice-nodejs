const { convertToCapitalCase } = require("../helper/capitalize");
const { patchesData } = require("./invoice-service");
const logger = require("../lib/logger");

function formatPersonDataSj(data) {
  const { customerData: c, adminData: a } = data;

  return {
    cs: patchesData(convertToCapitalCase(c.name)),
    cs_ad: patchesData(convertToCapitalCase(c.address)),
    admin: patchesData(convertToCapitalCase(a.name)),
    vehicle: patchesData(""),
    vehicle: patchesData("")
  };
}

function formatShippingLetter(data) {
  logger.info(`Client requesting the Shipping Letter with data:`, data);

  console.dir(data, { depth: null, color: true });
  const emptySlotLength = 5 - data.length;
  const fillEmptySlot = [...Array.from({ length: emptySlotLength })].map(
    (a, i) => {
      return {
        qty: "",
        name: "",
        description: ""
      };
    }
  );

  const result = [...data, ...fillEmptySlot].map((product, index) => {
    return {
      [`q_${index + 1}`]: patchesData(convertToCapitalCase(product.qty || "")),
      [`p_${index + 1}`]: patchesData(
        String(!!product.name ? product.name : "")
      ),
      [`kt_${index + 1}`]: patchesData(
        String(!!product.description ? product.description : "")
      )
    };
  });

  // console.dir(result, { depth: null, color: true });

  const flatten = result
    .reverse()
    .reduce((acc, product) => ({ ...acc, ...product }), {});

  return [flatten];
}

module.exports = { formatPersonDataSj, formatShippingLetter };
