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
      const { date, table_number } = req.query;
      let query = supabase
        .from('table_bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (date) query = query.eq('booking_date', date);
      if (table_number) query = query.eq('table_number', Number(table_number));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      // Проверяем нет ли уже брони на этот стол в это время
      const { data: existing } = await supabase
        .from('table_bookings')
        .select('id')
        .eq('table_number', body.table_number)
        .eq('booking_date', body.booking_date)
        .eq('booking_time', body.booking_time)
        .neq('status', 'cancelled');
      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Этот стол уже забронирован на выбранное время' });
      }

      const { data, error } = await supabase.from('table_bookings').insert({
        table_number: body.table_number,
        zone: body.zone,
        seats: body.seats,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        guests_count: body.guests_count,
        booking_date: body.booking_date,
        booking_time: body.booking_time,
        comment: body.comment || null,
        status: 'new'
      }).select().single();
      if (error) throw error;

      await sendTelegram(
        `🪑 БРОНЬ СТОЛА #${data.id}\n\n` +
        `🔢 Стол №${data.table_number} (Зона ${data.zone})\n` +
        `👤 ${data.customer_name}\n` +
        `📞 ${data.customer_phone}\n` +
        `👥 Гостей: ${data.guests_count}\n` +
        `📅 ${data.booking_date} в ${data.booking_time}\n` +
        `💬 ${data.comment || 'Без комментария'}\n` +
        `🕐 Заявка: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
      );
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, admin_comment } = req.body;
      const upd = {};
      if (status !== undefined) upd.status = status;
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
