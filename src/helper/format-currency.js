const formatCurrency = (number) => {
  // Format the number to IDR currency
  const formattedNumber = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);

  // Remove the last ",00" if it exists
  return formattedNumber.replace(/,00$/, "");
};

module.exports = { formatCurrency };
