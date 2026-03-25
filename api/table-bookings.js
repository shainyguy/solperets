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
  } catch (e) { console.error('TG error:', e.message); }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // GET — занятые столы на дату+время
    if (req.method === 'GET') {
      const { date, time } = req.query;
      let q = supabase
        .from('table_bookings')
        .select('table_number, status')
        .neq('status', 'cancelled');
      if (date) q = q.eq('event_date', date);
      if (time) q = q.eq('event_time', time);
      const { data, error } = await q;
      if (error) throw error;
      // Возвращаем список занятых номеров столов
      const busy = (data || []).map(r => r.table_number);
      return res.status(200).json({ busy });
    }

    // POST — создать бронь
    if (req.method === 'POST') {
      const b = req.body;
      if (!b.customer_name || !b.customer_phone || !b.table_number || !b.event_date || !b.event_time || !b.guests_count) {
        return res.status(400).json({ error: 'Заполните все обязательные поля' });
      }

      // Проверяем не занят ли стол
      const { data: existing } = await supabase
        .from('table_bookings')
        .select('id')
        .eq('table_number', b.table_number)
        .eq('event_date', b.event_date)
        .eq('event_time', b.event_time)
        .neq('status', 'cancelled')
        .limit(1);

      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Этот стол уже занят на выбранное время. Выберите другой стол или время.' });
      }

      const { data, error } = await supabase.from('table_bookings').insert({
        customer_name:  b.customer_name,
        customer_phone: b.customer_phone,
        customer_email: b.customer_email  || null,
        table_number:   Number(b.table_number),
        seats:          b.seats           || null,
        zone:           b.zone            || null,
        event_date:     b.event_date,
        event_time:     b.event_time,
        guests_count:   Number(b.guests_count),
        occasion:       b.occasion        || null,
        comment:        b.comment         || null,
        status:         'new'
      }).select().single();

      if (error) throw error;

      await sendTelegram(
        `🪑 БРОНЬ СТОЛА #${data.id}\n\n` +
        `👤 ${data.customer_name}\n` +
        `📞 ${data.customer_phone}\n` +
        `🪑 Стол №${data.table_number} (${data.seats} мест)\n` +
        `📆 ${data.event_date} в ${data.event_time}\n` +
        `👥 Гостей: ${data.guests_count}\n` +
        `🎉 Повод: ${data.occasion || 'не указан'}\n` +
        `💬 ${data.comment || 'без комментария'}\n` +
        `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
      );

      return res.status(201).json(data);
    }

    // PUT — сменить статус (для CRM)
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

    // DELETE
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
