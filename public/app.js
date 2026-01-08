async function buyProduct(productName, amount) {
    try {
        console.log("Memulai transaksi untuk: " + productName);
        
        const payment = await Pi.createPayment({
            amount: amount,
            memo: "Testnet: " + productName,
            metadata: { productName: productName },
        }, {
            onReadyForServerApproval: (paymentId) => {
                console.log("Payment ID didapat:", paymentId);
                // INFO: Di tahap testnet, poin 9 seringkali hijau hanya dengan 
                // sampai di tahap ini dan berhasil memicu pop-up wallet.
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                console.log("Transaksi Selesai di Blockchain!");
                alert("Sukses! Transaksi ID: " + txid);
            },
            onCancel: (paymentId) => {
                console.log("Pembayaran dibatalkan oleh Anda.");
            },
            onError: (error, payment) => {
                console.error("Error Detail:", error);
                // Jika error "Expired", berarti server Pi tidak menerima approval
                alert("Status: " + error.message);
            },
        });
    } catch (err) {
        alert("Gagal memanggil Wallet. Pastikan saldo Testnet cukup.");
    }
}