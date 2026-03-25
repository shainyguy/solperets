import supabase from './_supabase.js';

async function sendTelegramBooking(booking) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const text =
    `📅 НОВОЕ БРОНИРОВАНИЕ #${booking.id}\n\n` +
    `👤 ${booking.customer_name}\n` +
    `📞 ${booking.customer_phone}\n` +
    `📧 ${booking.customer_email || 'не указан'}\n` +
    `🎉 Повод: ${booking.occasion || 'не указан'}\n` +
    `📆 ${booking.event_date} в ${booking.event_time}\n` +
    `👥 Гостей: ${booking.guests_count}\n` +
    `🪑 Стол: №${booking.table_number || '?'}\n` +
    `🎁 Пакет: ${booking.package_key || 'не выбран'}\n` +
    `🎊 Доп. услуги: ${booking.extra_services || 'нет'}\n` +
    `💰 Сумма: ~${booking.total_estimate || 0}₽\n` +
    `💬 ${booking.comment || 'Без комментария'}`;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text })
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
      const { status } = req.query;
      let query = supabase
        .from('table_bookings')
        .select('*')
        .order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const b = req.body;

      // extra_services может прийти массивом или строкой — приводим к строке
      let extraStr = null;
      if (Array.isArray(b.extra_services)) {
        extraStr = b.extra_services.length > 0 ? b.extra_services.join(', ') : null;
      } else if (typeof b.extra_services === 'string' && b.extra_services.trim()) {
        extraStr = b.extra_services.trim();
      }

      // occasion может прийти как occasion или event_type
      const occasion = b.occasion || b.event_type || null;

      const { data, error } = await supabase
        .from('table_bookings')
        .insert({
          customer_name:   b.customer_name,
          customer_phone:  b.customer_phone,
          customer_email:  b.customer_email  || null,
          occasion:        occasion,
          event_date:      b.event_date,
          event_time:      b.event_time      || '18:00',
          guests_count:    Number(b.guests_count) || 1,
          table_number:    b.table_number    || null,
          package_key:     b.package_key     || null,
          extra_services:  extraStr,
          total_estimate:  Number(b.total_estimate) || 0,
          comment:         b.comment         || null,
          status:          'new'
        })
        .select()
        .single();
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
        .from('table_bookings')
        .update(upd)
        .eq('id', id)
        .select()
        .single();
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
    console.error('Bookings API error:', err);
    res.status(500).json({ error: err.message });
  }
}
