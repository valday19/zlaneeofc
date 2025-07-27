const BOT_TOKEN = '7414598655:AAEroWQ277kT5Yy-1kpVblOjRXhOQc_9BAY';
const CHAT_ID = '7845232622';
const MIN_PAYMENT_AMOUNT = 1000; // Minimum payment amount in IDR
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Show current product on payment page
  if (window.location.pathname.includes('payment.html')) {
    const currentProduct = localStorage.getItem('currentProduct');
    if (currentProduct) {
      document.getElementById('product-display').textContent = currentProduct;
    } else {
      window.location.href = 'index.html';
    }
  }
});

function startOrder(product) {
  // Store product and expected price
  const price = extractPrice(product);
  localStorage.setItem('currentProduct', product);
  localStorage.setItem('expectedPrice', price);
  window.location.href = 'payment.html';
}

function extractPrice(productName) {
  // Extract price from product name (e.g., "JASTEB VVIP 5K" → 5000)
  const priceMatch = productName.match(/(\d+)K/i);
  if (priceMatch) return parseInt(priceMatch[1]) * 1000;
  return 0;
}

async function verifyPayment() {
  const namaPembayar = document.getElementById('namaPembayar').value.trim();
  const jumlahTransfer = parseInt(document.getElementById('jumlahTransfer').value);
  const fileInput = document.getElementById('buktiTransfer');
  const metodePembayaran = document.getElementById('metodePembayaran').value;
  const expectedPrice = parseInt(localStorage.getItem('expectedPrice'));
  
  // Validate inputs
  if (!namaPembayar) {
    alert('Silakan masukkan nama pembayar!');
    return;
  }
  
  if (isNaN(jumlahTransfer) || jumlahTransfer <= 0) {
    alert('Jumlah transfer tidak valid!');
    return;
  }
  
  if (jumlahTransfer < expectedPrice) {
    alert(`Jumlah transfer kurang dari harga produk (Rp ${expectedPrice.toLocaleString('id-ID')})!`);
    return;
  }
  
  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Silakan upload bukti transfer!');
    return;
  }
  
  const file = fileInput.files[0];
  if (file.size > MAX_FILE_SIZE) {
    alert('Ukuran file terlalu besar (maks. 2MB)!');
    return;
  }
  
  if (!metodePembayaran) {
    alert('Silakan pilih metode pembayaran!');
    return;
  }
  
  // Show loading
  document.getElementById('loading').classList.remove('hidden');
  
  try {
    // Create payment record
    const paymentData = {
      product: localStorage.getItem('currentProduct'),
      nama: namaPembayar,
      amount: jumlahTransfer,
      method: metodePembayaran,
      timestamp: new Date().toISOString()
    };
    
    // Store payment data temporarily
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
    
    // Proceed to form
    setTimeout(() => {
      const isJasteb = paymentData.product.toLowerCase().includes("jasteb");
      window.location.href = isJasteb ? 'form_jasteb.html' : 'form_biasa.html';
    }, 1500);
    
  } catch (error) {
    console.error('Error:', error);
    alert('Terjadi kesalahan saat memverifikasi pembayaran.');
    document.getElementById('loading').classList.add('hidden');
  }
}

// Enhanced Telegram sending function
async function sendToTelegram(formData, file, currentProduct) {
  const paymentData = JSON.parse(localStorage.getItem('paymentData') || {};
  
  // Prepare detailed message
  const textMessage = `*PESANAN BARU ZLANEE STORE*
  
📦 *Produk:* ${currentProduct}
👤 *Nama:* ${formData.get('nama')}
📱 *WA:* ${formData.get('wa')}
💰 *Jumlah TF:* Rp ${paymentData.amount?.toLocaleString('id-ID') || '-'}
🏦 *Metode:* ${paymentData.method || '-'}
⏱ *Waktu:* ${new Date(paymentData.timestamp).toLocaleString('id-ID') || '-'}`;

  if (currentProduct.toLowerCase().includes('jasteb')) {
    textMessage += `\n📧 *Gmail:* ${formData.get('gmail')}`;
  }
  
  textMessage += `\n📝 *Catatan:* ${formData.get('catatan') || '-'}`;
  
  try {
    // Send text message
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: textMessage,
        parse_mode: "Markdown"
      })
    });

    // Send photo
    const photoData = new FormData();
    photoData.append("chat_id", CHAT_ID);
    photoData.append("photo", file);
    photoData.append("caption", `Bukti transfer dari ${formData.get('nama')}`);
    
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: "POST",
      body: photoData
    });

    // Clear storage and redirect
    localStorage.removeItem('currentProduct');
    localStorage.removeItem('paymentData');
    localStorage.removeItem('expectedPrice');
    
    const isJasteb = currentProduct.toLowerCase().includes("jasteb");
    if (isJasteb) {
      alert('OTW PROSES MAS/TEBAR❗❗\nCARA CEK RESS JASTEB ⬇\n\n-BUKA APK GMAIL\n-PILIH GARIS 3 DI POJOK KIRI ATAS PILIH -BAGIAN SPAM\n-LALU REFRESH\n-RESS MASUK SATU PERSATU\n-USAHAKAN EMAIL BENAR (SLH NO GNTI)\n-RES MASUK LANGSUNG CEK BIAR FRESH🥶👑\n-RESS BELUM MASUK TUNGGU MUNGKIN WEB DELAY✍️\nRESS MASUK LANGSUNG CEK2 AJA\nDAPET FB/FF/ML/DLL WAJIB SS/STORAN\nDAPET LANSUNG UBAH PW+KELUARIN PERANGKAT BIAR GAK KE HB\nLU STOR GUA BONUSIN👊🤙');
      window.location.href = 'https://chat.whatsapp.com/IoDNV31tWcXAnO6O9yEeue?mode=ac_t';
    } else {
      alert('Pesanan diproses. Admin akan menghubungi via WhatsApp. Pastikan nomor WhatsApp anda aktif/dapat dihubungi');
      window.location.href = 'https://chat.whatsapp.com/CH3nsiINdKA7L2sAiBr7Wp?mode=ac_t';
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan saat mengirim pesanan. Silakan coba lagi.");
  }
}