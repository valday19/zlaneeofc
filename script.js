const BOT_TOKEN = '7414598655:AAEroWQ277kT5Yy-1kpVblOjRXhOQc_9BAY';
const CHAT_ID = '7845232622';

function startOrder(product) {
  localStorage.setItem('currentProduct', product);
  window.location.href = 'payment.html';
}

function goToForm() {
  const fileInput = document.getElementById("buktiTransfer");
  if (!fileInput.files || fileInput.files.length === 0) {
    alert("Silakan upload bukti transfer terlebih dahulu!");
    return;
  }

  const currentProduct = localStorage.getItem('currentProduct');
  const isJasteb = currentProduct.toLowerCase().includes("jasteb vvip");

  if (isJasteb) {
    window.location.href = 'form_jasteb.html';
  } else {
    window.location.href = 'form_biasa.html';
  }
}

async function sendToTelegram(e, isJasteb) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const currentProduct = localStorage.getItem('currentProduct');
  const fileInput = document.getElementById("buktiTransfer"); // This will be null if not on payment.html

  let pesan = `*Pesanan ZLANEE STORE:*
Produk: ${currentProduct}
Nama: ${formData.get("nama")}
WA: ${formData.get("wa")}`;

  if (isJasteb) {
    pesan += `\nGmail: ${formData.get("gmail")}`;
  }
  pesan += `\nCatatan: ${formData.get("catatan") || "-"}`;

  try {
    // Send text message
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: pesan, parse_mode: "Markdown" })
    });

    // Send photo if available (from payment.html)
    if (fileInput && fileInput.files.length > 0) {
      const photoData = new FormData();
      photoData.append("chat_id", CHAT_ID);
      photoData.append("photo", fileInput.files[0]);
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        body: photoData
      });
    }

    alert(isJasteb
      ? "OTW PROSES MAS/TEBAR❗❗\nCARA CEK RESS JASTEB ⬇\n\n-BUKA APK GMAIL\n-PILIH GARIS 3 DI POJOK KIRI ATAS PILIH -BAGIAN SPAM\n-LALU REFRESH\n-RESS MASUK SATU PERSATU\n-USAHAKAN EMAIL BENAR (SLH NO GNTI)\n-RES MASUK LANGSUNG CEK BIAR FRESH🥶👑\n-RESS BELUM MASUK TUNGGU MUNGKIN WEB DELAY✍️\nRESS MASUK LANGSUNG CEK2 AJA\nDAPET FB/FF/ML/DLL WAJIB SS/STORAN\nDAPET LANSUNG UBAH PW+KELUARIN PERANGKAT BIAR GAK KE HB\nLU STOR GUA BONUSIN👊🤙"
      : "Pesanan diproses. Admin akan menghubungi via WhatsApp. Pastikan nomor WhatsApp anda aktif/dapat dihubungi"
    );

    // Clear localStorage and redirect to home
    localStorage.removeItem('currentProduct');
    window.location.href = 'index.html';

  } catch (error) {
    console.error("Error sending to Telegram:", error);
    alert("Terjadi kesalahan saat mengirim pesanan. Silakan coba lagi.");
  }
}

// Attach event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // This part ensures the correct form submission handler is attached
  // It's crucial for the form pages (form_jasteb.html and form_biasa.html)
  // The sendToTelegram function is now called directly from the form's submit event listener
  // defined within each form's HTML file.
});
