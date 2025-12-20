const Pi = window.Pi;
Pi.init({ version: "2.0", sandbox: true });

async function login() {
    try {
        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        document.getElementById('user-profile').innerText = "Halo, " + auth.user.username;
    } catch (err) {
        console.error(err);
    }
}

function onIncompletePaymentFound(payment) {
    // Logika jika ada pembayaran gantung
}

async function buyProduct(productId, amount) {
    const paymentData = {
        amount: amount,
        memo: "Pembelian " + productId,
        metadata: { productId: productId }
    };

    const callbacks = {
    onReadyForServerApproval: (paymentId) => {
        // Mengirim ID pembayaran ke file api/approve.js
        return fetch('/api/approve', {
            method: 'POST',
            body: JSON.stringify({ paymentId })
        });
    },
    onReadyForServerCompletion: (paymentId, txid) => {
        // Mengirim ID pembayaran dan ID transaksi ke file api/complete.js
        return fetch('/api/complete', {
            method: 'POST',
            body: JSON.stringify({ paymentId, txid })
        });
    },
    onCancel: (paymentId) => { /* Logika batal */ },
    onError: (error, payment) => { /* Logika error */ }
};

    await Pi.createPayment(paymentData, callbacks);
}

login();