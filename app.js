const Pi = window.Pi;
// Inisialisasi SDK dengan sandbox true untuk testing
Pi.init({ version: "2.0", sandbox: true });

async function login() {
    // Tambahkan notifikasi log untuk debugging di konsol
    console.log("Fungsi login terpanggil...");
    
    try {
        // Cek apakah SDK sudah siap
        if (!Pi) {
            console.error("SDK Pi tidak ditemukan!");
            return;
        }

        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        
        if (auth && auth.user) {
            document.getElementById('user-profile').innerText = "Halo, " + auth.user.username;
            // Sembunyikan tombol login jika sudah berhasil
            const loginBtn = document.getElementById('btn-login');
            if (loginBtn) loginBtn.style.display = "none";
            
            console.log("Login sukses: ", auth.user.username);
        }
    } catch (err) {
        console.error("Kesalahan Login:", err);
        document.getElementById('user-profile').innerText = "Gagal Login. Gunakan Pi Browser!";
    }
}

function onIncompletePaymentFound(payment) {
    console.log("Menemukan pembayaran gantung:", payment);
};

async function buyProduct(productId, amount) {
    console.log("Memulai proses pembelian: " + productId);

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
        onError: (error, payment) => { console.error("Error pembayaran:", error); }
    };

    try {
        await Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error("Gagal createPayment:", err);
    }
}

// Jalankan login otomatis saat script dimuat
login();