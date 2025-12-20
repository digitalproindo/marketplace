// api/approve.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Ambil paymentId dari body request yang dikirim oleh app.js (frontend)
  const { paymentId } = JSON.parse(req.body);

  // Ambil API Key dari Environment Variable Vercel (Jangan di-hardcode!)
  const PI_API_KEY = process.env.PI_API_KEY;

  try {
    // Beri tahu server Pi bahwa kita setuju dengan transaksi ini
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Payment ${paymentId} Approved!`);
      return res.status(200).json(data);
    } else {
      return res.status(400).json({ error: "Gagal Approve ke Server Pi", detail: data });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}