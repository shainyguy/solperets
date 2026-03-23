import supabase from './_supabase.js';

async function sendTelegramBooking(booking) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const services = (booking.extra_services || []).join(', ') || 'нет';
  const tableInfo = booking.table_number ? `Стол №${booking.table_number}` : 'Стол не выбран';
  const text =
    `📅 НОВОЕ БРОНИРОВАНИЕ #${booking.id}\n\n` +
    `👤 ${booking.customer_name}\n📞 ${booking.customer_phone}\n` +
    `📧 ${booking.customer_email || 'не указан'}\n` +
    `🎭 Повод: ${booking.occasion || 'не указан'}\n` +
    `📦 Пакет: ${booking.event_type || '—'}\n` +
    `🪑 ${tableInfo}\n` +
    `📆 ${booking.event_date} в ${booking.event_time}\n` +
    `👥 ${booking.guests_count} гостей\n` +
    `🎉 Доп. услуги: ${services}\n` +
    `💰 ~${booking.total_estimate?.toLocaleString('ru-RU')}₽\n` +
    `💬 ${booking.comment || 'Без комментария'}`;
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { status, date } = req.query;
      let query = supabase.from('bookings_v2').select('*').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      if (date) query = query.eq('event_date', date);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      const { data, error } = await supabase.from('bookings_v2').insert({
        table_number:   body.table_number || null,
        customer_name:  body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email || null,
        event_type:     body.event_type || null,
        occasion:       body.occasion || null,
        package_key:    body.package_key || null,
        event_date:     body.event_date,
        event_time:     body.event_time || '18:00',
        guests_count:   body.guests_count,
        extra_services: body.extra_services || [],
        total_estimate: body.total_estimate || 0,
        comment:        body.comment || null,
        status:         'new',
      }).select().single();
      if (error) throw error;
      await sendTelegramBooking(data);
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, admin_comment } = req.body;
      const upd = {};
      if (status !== undefined)        upd.status = status;
      if (admin_comment !== undefined) upd.admin_comment = admin_comment;
      const { data, error } = await supabase
        .from('bookings_v2').update(upd).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('bookings_v2').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Bookings API error:', err);
    res.status(500).json({ error: err.message });
  }
}
