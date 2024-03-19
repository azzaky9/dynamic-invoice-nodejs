const { nestedLog } = require("../helper/nested-log");

module.exports = createArrayOfProduct = (raws) => {
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
