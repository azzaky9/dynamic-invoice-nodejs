function numberToWords(number) {
  const units = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan"
  ];
  const teens = [
    "Sepuluh",
    "Sebelas",
    "Dua Belas",
    "Tiga Belas",
    "Empat Belas",
    "Lima Belas",
    "Enam Belas",
    "Tujuh Belas",
    "Delapan Belas",
    "Sembilan Belas"
  ];
  const tens = [
    "",
    "Sepuluh",
    "Dua Puluh",
    "Tiga Puluh",
    "Empat Puluh",
    "Lima Puluh",
    "Enam Puluh",
    "Tujuh Puluh",
    "Delapan Puluh",
    "Sembilan Puluh"
  ];
  const scales = ["", "Ribu", "Juta", "Miliar"];

  let words = "";

  if (number === 0) {
    return "Nol";
  }

  let numStr = String(number);

  // Pad the number with leading zeros if necessary
  while (numStr.length % 3 !== 0) {
    numStr = "0" + numStr;
  }

  let chunkCount = numStr.length / 3;

  for (let i = 0; i < numStr.length; i += 3) {
    let chunk = parseInt(numStr.substr(i, 3), 10);
    let scale = chunkCount > 1 ? scales[chunkCount - 1] : "";
    let hundred = Math.floor(chunk / 100);
    let remainder = chunk % 100;

    if (hundred > 0) {
      words += units[hundred] + " Ratus ";
    }

    if (remainder >= 20) {
      words += tens[Math.floor(remainder / 10)] + " ";
      words += units[remainder % 10] + " ";
    } else if (remainder >= 10) {
      words += teens[remainder - 10] + " ";
    } else if (remainder > 0) {
      words += units[remainder] + " ";
    }

    if (chunk !== 0) {
      words += scale + " ";
    }

    chunkCount--;
  }

  return words.trim() + " Rupiah";
}

// Test the function

module.exports = {
  numberToWords
};
