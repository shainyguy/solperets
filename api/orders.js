import supabase from './_supabase.js';

async function sendTelegramNotification(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const items = order.items.map(i => `• ${i.name} x${i.quantity} — ${i.price * i.quantity}₽`).join('\n');
  const text = `🍽 НОВЫЙ ЗАКАЗ #${order.id}\n\n` +
    `👤 ${order.customer_name}\n` +
    `📞 ${order.customer_phone}\n` +
    `📍 ${order.delivery_address || 'Самовывоз'}\n` +
    `💬 ${order.comment || 'Без комментария'}\n\n` +
    `🛒 Состав заказа:\n${items}\n\n` +
    `💰 Итого: ${order.total_price}₽\n` +
    `💳 Оплата: ${order.payment_method}\n` +
    `🕐 Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
  } catch (e) {
    console.error('Telegram error:', e);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { status, limit = 50, offset = 0 } = req.query;
      let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).range(Number(offset), Number(offset) + Number(limit) - 1);
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const body = req.body;
      const { data, error } = await supabase.from('orders').insert({
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        delivery_address: body.delivery_address || null,
        comment: body.comment || null,
        items: body.items,
        total_price: body.total_price,
        payment_method: body.payment_method || 'cash',
        status: 'new',
        delivery_type: body.delivery_type || 'delivery'
      }).select().single();
      if (error) throw error;
      await sendTelegramNotification(data);
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, status, admin_comment } = req.body;
      const updateData = {};
      if (status) updateData.status = status;
      if (admin_comment !== undefined) updateData.admin_comment = admin_comment;
      const { data, error } = await supabase.from('orders').update(updateData).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
