const Pi = window.Pi;

// Fungsi inisialisasi yang lebih stabil
async function initPi() {
    try {
        await Pi.init({ version: "2.0", sandbox: true });
        console.log("Pi SDK berhasil diinisialisasi");
    } catch (e) {
        console.error("Gagal inisialisasi Pi SDK:", e);
    }
}

async function login() {
    console.log("Fungsi login terpanggil...");
    const profile = document.getElementById('user-profile');
    const loginBtn = document.getElementById('btn-login');

    // Pastikan Pi SDK tersedia
    if (!window.Pi || !window.Pi.authenticate) {
        alert("Gunakan Pi Browser untuk mengakses fitur ini!");
        if (profile) profile.innerText = "Wajib gunakan Pi Browser!";
        return;
    }

    try {
        // Lakukan autentikasi
        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        
        if (auth && auth.user) {
            profile.innerText = "Halo, " + auth.user.username;
            profile.style.color = "#d4af37"; // Warna emas jika sukses
            
            if (loginBtn) loginBtn.style.display = "none";
            console.log("Login sukses: ", auth.user.username);
        }
    } catch (err) {
        console.error("Kesalahan Login:", err);
        if (profile) profile.innerText = "Login Gagal. Klik tombol di bawah:";
        if (loginBtn) loginBtn.style.display = "inline-block";
    }
}

function onIncompletePaymentFound(payment) {
    console.log("Menemukan pembayaran gantung:", payment);
    return fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            paymentId: payment.identifier, 
            txid: payment.transaction.txid 
        })
    });
};

async function buyProduct(productId, amount) {
    if (!window.Pi) {
        alert("Buka di Pi Browser untuk melakukan transaksi!");
        return;
    }

    const userText = document.getElementById('user-profile').innerText;
    if (userText.includes("Menghubungkan") || userText.includes("Gagal") || userText.includes("Klik")) {
        alert("Silakan login terlebih dahulu!");
        return;
    }

    const paymentData = {
        amount: amount,
        memo: "Pembelian " + productId + " di CTF Store",
        metadata: { productId: productId }
    };

    const callbacks = {
        onReadyForServerApproval: (paymentId) => {
            return fetch('/api/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
            });
        },
        onReadyForServerCompletion: (paymentId, txid) => {
            return fetch('/api/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid })
            });
        },
        onCancel: (paymentId) => { console.log("Pembayaran dibatalkan."); },
        onError: (error, payment) => { 
            console.error("Error pembayaran:", error);
            alert("Terjadi gangguan jaringan. Coba lagi.");
        }
    };

    try {
        await Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error("Gagal createPayment:", err);
    }
}

// Jalankan inisialisasi dan login otomatis dengan aman
window.onload = async function() {
    await initPi();
    // Beri jeda 1.5 detik agar browser siap sebelum login otomatis dijalankan
    setTimeout(() => {
        login();
    }, 1500);
};