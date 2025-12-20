// api/complete.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { paymentId, txid } = JSON.parse(req.body);
  const PI_API_KEY = process.env.PI_API_KEY;

  try {
    // Selesaikan transaksi secara resmi
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Payment ${paymentId} Completed!`);
      // DI SINI: Tambahkan logika Anda (misal: kirim barang, update database)
      return res.status(200).json(data);
    } else {
      return res.status(400).json({ error: "Gagal Complete ke Server Pi", detail: data });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}