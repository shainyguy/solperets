import supabase from './_supabase.js';

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  } catch (e) { console.error('Telegram error:', e.message); }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { status, date } = req.query;
      let query = supabase
        .from('table_bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      if (date)   query = query.eq('event_date', date);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const b = req.body;
      if (!b.customer_name || !b.customer_phone || !b.table_number || !b.event_date || !b.event_time || !b.guests_count) {
        return res.status(400).json({ error: 'Заполните все обязательные поля' });
      }
      const { data, error } = await supabase
        .from('table_bookings')
        .insert({
          customer_name: b.customer_name,
          customer_phone: b.customer_phone,
          table_number: Number(b.table_number),
          seats: Number(b.seats) || 4,
          guests_count: Number(b.guests_count),
          event_date: b.event_date,
          event_time: b.event_time,
          occasion: b.occasion || null,
          comment: b.comment || null,
          package: b.package || null,
          status: 'new'
        })
        .select()
        .single();
      if (error) throw error;

      await sendTelegram(
        `📅 НОВОЕ БРОНИРОВАНИЕ СТОЛА #${data.id}\n\n` +
        `👤 ${data.customer_name}\n` +
        `📞 ${data.customer_phone}\n` +
        `🪑 Стол №${data.table_number} (${data.seats} мест)\n` +
        `👥 Гостей: ${data.guests_count}\n` +
        `📆 ${data.event_date} в ${data.event_time}\n` +
        `🎉 Повод: ${data.occasion || 'не указан'}\n` +
        `🍽 Пакет: ${data.package || 'не выбран'}\n` +
        `💬 ${data.comment || 'без комментария'}`
      );
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, admin_comment } = req.body;
      const upd = {};
      if (status !== undefined)        upd.status = status;
      if (admin_comment !== undefined) upd.admin_comment = admin_comment;
      const { data, error } = await supabase
        .from('table_bookings').update(upd).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('table_bookings').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('table-bookings error:', err);
    res.status(500).json({ error: err.message });
  }
}
