import supabase from './_supabase.js';

async function tg(text) {
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
    if (req.method === 'GET') {
      const { date, status } = req.query;
      let query = supabase
        .from('table_reservations')
        .select('*')
        .order('created_at', { ascending: false });
      if (date)   query = query.eq('reservation_date', date);
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const b = req.body;
      if (!b.customer_name || !b.customer_phone || !b.table_number || !b.guests_count || !b.reservation_date || !b.reservation_time) {
        return res.status(400).json({ error: 'Заполните все обязательные поля' });
      }

      // Проверяем что стол свободен на эту дату/время
      const { data: existing } = await supabase
        .from('table_reservations')
        .select('id')
        .eq('table_number', b.table_number)
        .eq('reservation_date', b.reservation_date)
        .eq('reservation_time', b.reservation_time)
        .neq('status', 'cancelled')
        .limit(1);

      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Этот стол уже забронирован на выбранное время' });
      }

      const { data, error } = await supabase
        .from('table_reservations')
        .insert({
          customer_name:    b.customer_name,
          customer_phone:   b.customer_phone,
          table_number:     Number(b.table_number),
          seats:            b.seats     || null,
          table_zone:       b.table_zone || null,
          guests_count:     Number(b.guests_count),
          reservation_date: b.reservation_date,
          reservation_time: b.reservation_time,
          occasion:         b.occasion  || null,
          comment:          b.comment   || null,
          status:           'new'
        })
        .select()
        .single();

      if (error) throw error;

      await tg(
        `🪑 НОВАЯ БРОНЬ СТОЛА #${data.id}\n\n` +
        `👤 ${data.customer_name}\n` +
        `📞 ${data.customer_phone}\n` +
        `🔢 Стол №${data.table_number}${data.table_zone ? ` (${data.table_zone})` : ''}\n` +
        `👥 Гостей: ${data.guests_count}\n` +
        `📅 Дата: ${data.reservation_date}\n` +
        `🕐 Время: ${data.reservation_time}\n` +
        `🎉 Повод: ${data.occasion || 'не указан'}\n` +
        `💬 Комментарий: ${data.comment || 'нет'}\n` +
        `⏰ ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
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
