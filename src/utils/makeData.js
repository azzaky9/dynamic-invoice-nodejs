// @example

import { format } from "date-fns";

export const data = {
  sender: {
    name: "",
    address: ""
  },
  recipient: {
    name: "",
    address: ""
  },
  payment: {
    LUNAS: false,
    BAYAR_TUJUAN: false,
    BB: false,
    DP: false
  },
  currentDate: format(new Date(), "dd MMM yyyy"),
  barang: [
    {
      no: 1,
      jenis: "Elektronik",
      nama_barang: "Laptop",
      packing: "Kardus",
      jumlah: 1,
      berat_kubik: "2 kg/m3",
      keterangan: "Baru"
    }
  ],
  productOrders: [],
  invoiceNumber: 0,
  totalPrice: 0,
  catatan:
    "Barang harap diperiksa sebelum diterima.\nJika ada kerusakan, segera hubungi pengirim.",
  notes: [
    {
      note: "CV PUTRA MANDIRI EXPRESS tidak akan mengganti atas kerusakan barang barang yang di sebabkan kerusakan membungkus, kebocoran atau akibat kurang kuatnya ikstan pembungkus"
    },
    {
      note: "CV PUTRA MANDIRI EXPRESS tidak akan menggantirugi yang di akibatkan keaadaaan force mayor seperti kebakaran mobil, tabrakan mobil, mobil jatuh, penjarahan dalam perjalanan dll."
    },
    {
      note: "Status hukum dari barang yang dikirm sepenuhnya tanggung jawab pemilik barang dan isi barang tidak di periksa"
    },
    {
      note: "Barang-barang yang dirikim isinya harus cocok dan sejenis dengan yang tertera di faktur"
    },
    {
      note: "Claim barang dan kurang karena kelainan sopir harus disaksikan kami dalam tempo 1x12 jam setelah barang diterima, setelah 1x12  jam bukan tanggung jawab kami"
    },
    {
      note: "Barang-barang kiriman yang tidak  diasuransikan apabila terjadi kehilangan atau kerusakan, hanya dapat pengganti maksimum 10x dari biaya pengiriman, maksimal senilai harga baran diambil mana yang lebih rendah"
    }
  ]
};
