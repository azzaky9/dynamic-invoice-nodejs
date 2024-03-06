import { nestedLog } from "../helper/nested-log.js";

export const createArrayOfProduct = (raws) => {
  const result = raws.map((raw, index) => ({
    no: index + 1,
    name: raw.products.name,
    description: raw.products.description,
    // change later
    packingType: "Box",
    quantity: 0,
    weight: "100 kg"
  }));

  nestedLog(result);

  return result;
};
