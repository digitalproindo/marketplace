const Pi = window.Pi;
// Inisialisasi SDK dengan sandbox true untuk testing
Pi.init({ version: "2.0", sandbox: true });

async function login() {
    console.log("Fungsi login terpanggil...");
    
    try {
        // Autentikasi User
        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        
        if (auth && auth.user) {
            document.getElementById('user-profile').innerText = "Halo, " + auth.user.username;
            
            // Sembunyikan tombol login jika ada
            const loginBtn = document.getElementById('btn-login');
            if (loginBtn) loginBtn.style.display = "none";
            
            console.log("Login sukses: ", auth.user.username);
        }
    } catch (err) {
        console.error("Kesalahan Login:", err);
        document.getElementById('user-profile').innerText = "Gagal Login. Pastikan buka di Pi Browser!";
    }
}

// Menangani pembayaran yang sudah dibayar di blockchain tapi belum selesai di sistem (Fix Step 10)
function onIncompletePaymentFound(payment) {
    console.log("Menemukan pembayaran gantung:", payment);
    
    // Kirim secara otomatis ke backend untuk diselesaikan (Complete)
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
    console.log("Memulai proses pembelian: " + productId);
    
    // Pastikan user sudah login sebelum bisa beli
    const userText = document.getElementById('user-profile').innerText;
    if (userText.includes("Menghubungkan") || userText.includes("Login")) {
        alert("Mohon login terlebih dahulu dengan klik tombol Login Manual!");
        return;
    }

    const paymentData = {
        amount: amount,
        memo: "Pembelian " + productId + " di CTF Store",
        metadata: { productId: productId }
    };

    const callbacks = {
        onReadyForServerApproval: (paymentId) => {
            console.log("Meminta approval untuk ID:", paymentId);
            return fetch('/api/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
            });
        },
        onReadyForServerCompletion: (paymentId, txid) => {
            console.log("Menyelesaikan transaksi blockchain...");
            return fetch('/api/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid })
            });
        },
        onCancel: (paymentId) => { console.log("Pembayaran dibatalkan."); },
        onError: (error, payment) => { 
            console.error("Error pembayaran:", error);
            alert("Terjadi kesalahan. Silakan coba lagi.");
        }
    };

    try {
        await Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error("Gagal createPayment:", err);
    }
}

// Jalankan login otomatis saat script dimuat
window.onload = function() {
    login();
};