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
  } catch (e) { console.error('TG error', e.message); }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { date, status } = req.query;
      let q = supabase
        .from('table_reservations')
        .select('*')
        .order('created_at', { ascending: false });
      if (date)   q = q.eq('reservation_date', date);
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const b = req.body;
      // zone сохраняем внутри comment если нет колонки
      const commentWithZone = b.zone
        ? `[Зона ${b.zone}] ${b.comment || ''}`.trim()
        : (b.comment || null);

      const { data, error } = await supabase
        .from('table_reservations')
        .insert({
          table_number:     b.table_number,
          seats:            b.seats,
          customer_name:    b.customer_name,
          customer_phone:   b.customer_phone,
          reservation_date: b.reservation_date,
          reservation_time: b.reservation_time,
          guests_count:     b.guests_count,
          occasion:         b.occasion || null,
          comment:          commentWithZone,
          status:           'new'
        })
        .select()
        .single();
      if (error) throw error;

      await sendTelegram(
        `📍 НОВАЯ БРОНЬ СТОЛА #${data.id}\n\n` +
        `🪑 Стол №${data.table_number}${b.zone ? ` (Зона ${b.zone})` : ''}\n` +
        `👤 ${data.customer_name}\n` +
        `📞 ${data.customer_phone}\n` +
        `📅 ${data.reservation_date} в ${data.reservation_time}\n` +
        `👥 ${data.guests_count} чел.\n` +
        `🎉 Повод: ${data.occasion || 'не указан'}\n` +
        `💬 ${b.comment || 'без комментария'}`
      );
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, admin_comment } = req.body;
      const upd = {};
      if (status !== undefined)        upd.status = status;
      if (admin_comment !== undefined) upd.admin_comment = admin_comment;
      const { data, error } = await supabase
        .from('table_reservations')
        .update(upd)
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
    console.error('Reservations error:', err);
    res.status(500).json({ error: err.message });
  }
}
