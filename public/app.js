const Pi = window.Pi;
Pi.init({ version: "2.0" });

async function auth() {
    try {
        const scopes = ['username', 'payments'];
        const onIncompletePaymentFound = (payment) => {
            console.log("Menemukan pembayaran tertunda...");
        };
        await Pi.authenticate(scopes, onIncompletePaymentFound);
        const user = await Pi.authenticate(scopes, onIncompletePaymentFound);
        document.getElementById('user-profile').innerHTML = `<i class="fa fa-user"></i> ${user.user.username}`;
    } catch (err) {
        console.error("Autentikasi Gagal. Gunakan Pi Browser!");
    }
}

async function buyProduct(productName, amount) {
    try {
        const payment = await Pi.createPayment({
            amount: amount,
            memo: "Beli " + productName,
            metadata: { productName: productName },
        }, {
            onReadyForServerApproval: (paymentId) => {
                console.log("Payment ID Ready: ", paymentId);
                // Di testnet, langkah ini seringkali cukup untuk memicu pop-up wallet
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                alert("Pembayaran Berhasil! TXID: " + txid);
            },
            onCancel: (paymentId) => console.log("Dibatalkan oleh user"),
            onError: (error, payment) => {
                console.error("Error Transaksi: ", error);
                alert("Gagal: " + error.message);
            },
        });
    } catch (err) {
        alert("Terjadi kesalahan teknis. Coba lagi di Pi Browser.");
    }
}

// Render produk tetap sama seperti sebelumnya
auth();