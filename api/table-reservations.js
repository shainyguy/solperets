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
      const { date } = req.query;
      let query = supabase
        .from('table_reservations')
        .select('*')
        .neq('status', 'cancelled')
        .order('reservation_date', { ascending: true });
      if (date) query = query.eq('reservation_date', date);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const { data, error } = await supabase
        .from('table_reservations')
        .insert({
          table_number: body.table_number,
          customer_name: body.customer_name,
          customer_phone: body.customer_phone,
          guests_count: body.guests_count,
          reservation_date: body.reservation_date,
          reservation_time: body.reservation_time,
          duration_hours: body.duration_hours || 2,
          comment: body.comment || null,
          status: 'confirmed'
        })
        .select()
        .single();
      if (error) throw error;

      await sendTelegram(
        `🪑 БРОНЬ СТОЛА #${data.id}\n\n` +
        `🔢 Стол: №${data.table_number}\n` +
        `👤 ${data.customer_name}\n` +
        `📞 ${data.customer_phone}\n` +
        `👥 Гостей: ${data.guests_count}\n` +
        `📅 ${data.reservation_date} в ${data.reservation_time}\n` +
        `⏱ На ${data.duration_hours} ч.\n` +
        `💬 ${data.comment || 'Без комментария'}`
      );
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body;
      const { data, error } = await supabase
        .from('table_reservations')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase
        .from('table_reservations')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
