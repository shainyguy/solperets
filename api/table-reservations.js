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
  } catch (e) { console.error('Telegram error:', e); }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { date, status } = req.query;
      let query = supabase.from('table_reservations').select('*').order('created_at', { ascending: false });
      if (date) query = query.eq('reservation_date', date);
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const { data, error } = await supabase.from('table_reservations').insert({
        table_number:     body.table_number,
        seats_count:      body.seats_count,
        guests_count:     body.guests_count,
        customer_name:    body.customer_name,
        customer_phone:   body.customer_phone,
        reservation_date: body.reservation_date,
        reservation_time: body.reservation_time,
        comment:          body.comment || null,
        status:           'new'
      }).select().single();
      if (error) throw error;

      await sendTelegram(
        `🪑 БРОНЬ СТОЛА #${data.id}\n\n` +
        `🔢 Стол №${data.table_number} (${data.seats_count} мест)\n` +
        `👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
        `📅 ${data.reservation_date} в ${data.reservation_time}\n` +
        `👥 Гостей: ${data.guests_count}\n` +
        `💬 ${data.comment || 'Без комментария'}`
      );
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, admin_comment } = req.body;
      const upd = {};
      if (status !== undefined)        upd.status = status;
      if (admin_comment !== undefined) upd.admin_comment = admin_comment;
      const { data, error } = await supabase.from('table_reservations').update(upd).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('table_reservations').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('table-reservations error:', err);
    res.status(500).json({ error: err.message });
  }
}
