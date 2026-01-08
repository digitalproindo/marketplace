// 1. Inisialisasi Pi SDK (Menyelesaikan Poin 6)
const Pi = window.Pi;
Pi.init({ version: "2.0" });

// 2. Autentikasi User (Menyelesaikan Poin 7)
async function auth() {
    try {
        const scopes = ['username', 'payments'];
        const onIncompletePaymentFound = (payment) => {
            console.log("Ada pembayaran gantung:", payment);
        };

        const user = await Pi.authenticate(scopes, onIncompletePaymentFound);
        document.getElementById('user-profile').innerHTML = `<i class="fa fa-user"></i> ${user.user.username}`;
        console.log("Login Berhasil:", user.user.username);
    } catch (err) {
        console.error("Gagal Autentikasi:", err);
    }
}

// 3. Fungsi Pembayaran Testnet (Menyelesaikan Poin 8 & 9)
async function buyProduct(productName, amount) {
    try {
        const payment = await Pi.createPayment({
            amount: amount,
            memo: "Pembelian " + productName + " di Digitalproindo",
            metadata: { productName: productName },
        }, {
            onReadyForServerApproval: (paymentId) => {
                console.log("Payment ID Ready:", paymentId);
                // Di tahap testnet ini biasanya poin akan hijau setelah fungsi dipanggil
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                console.log("Transaksi Selesai:", txid);
                alert("Terima kasih! Pembayaran Berhasil.");
            },
            onCancel: (paymentId) => console.log("Dibatalkan"),
            onError: (error, payment) => console.error("Error:", error),
        });
    } catch (err) {
        alert("Gagal memproses pembayaran. Pastikan saldo Testnet cukup.");
    }
}

// 4. Render Produk
const products = [
    { name: "iPhone 15 Pro", price: 0.0002, img: "https://images.unsplash.com/photo-1678911820864-e2c567c655d7?w=400" },
    { name: "Supercar Porsche", price: 0.0005, img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400" },
    { name: "Villa Modern", price: 0.001, img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400" },
    { name: "Macbook Pro M3", price: 0.0003, img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400" }
];

const container = document.getElementById('product-list');
products.forEach(p => {
    container.innerHTML += `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}">
            <div class="p-info">
                <div class="p-name">${p.name}</div>
                <div class="p-price">π ${p.price}</div>
                <button class="btn-buy" onclick="buyProduct('${p.name}', ${p.price})">Beli</button>
            </div>
        </div>
    `;
});

// Jalankan Autentikasi saat load
auth();