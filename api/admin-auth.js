export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const { password } = body;
      
      // Пароль задаётся здесь — измените на свой
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'soliperec2025';
      
      if (!password) {
        return res.status(400).json({ error: 'Пароль не указан' });
      }
      
      if (password === ADMIN_PASSWORD) {
        const token = Buffer.from(`admin:${Date.now()}:${Math.random()}`).toString('base64');
        return res.status(200).json({ ok: true, token });
      }
      
      return res.status(401).json({ error: 'Неверный пароль' });
    } catch (err) {
      console.error('Auth error:', err);
      return res.status(500).json({ error: 'Ошибка сервера: ' + err.message });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
