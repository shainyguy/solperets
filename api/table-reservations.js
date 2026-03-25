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
      const { date } = req.query;
      let query = supabase
        .from('table_reservations')
        .select('id, table_number, seats, guests_count, reservation_date, reservation_time, status, customer_name, customer_phone, occasion, comment, admin_comment, created_at')
        .order('created_at', { ascending: false });
      if (date) query = query.eq('reservation_date', date);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { customer_name, customer_phone, table_number, seats, guests_count, reservation_date, reservation_time, occasion, comment } = req.body;
      if (!customer_name || !customer_phone || !table_number || !guests_count || !reservation_date || !reservation_time) {
        return res.status(400).json({ error: 'Заполните все обязательные поля' });
      }
      // Проверяем не занят ли стол
      const { data: existing } = await supabase
        .from('table_reservations')
        .select('id')
        .eq('table_number', table_number)
        .eq('reservation_date', reservation_date)
        .eq('reservation_time', reservation_time)
        .neq('status', 'cancelled');
      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Этот стол уже забронирован на выбранное время' });
      }
      const { data, error } = await supabase
        .from('table_reservations')
        .insert({ customer_name, customer_phone, table_number, seats: seats || 4, guests_count, reservation_date, reservation_time, occasion: occasion || null, comment: comment || null, status: 'new' })
        .select().single();
      if (error) throw error;
      await sendTelegram(
        `🪑 БРОНЬ СТОЛА #${data.id}\n\n` +
        `👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
        `🪑 Стол №${data.table_number} (${data.seats} мест)\n` +
        `👥 Гостей: ${data.guests_count}\n` +
        `📅 ${data.reservation_date} в ${data.reservation_time}\n` +
        `🎉 Повод: ${data.occasion || 'не указан'}\n` +
        `💬 ${data.comment || 'Без комментария'}`
      );
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, admin_comment } = req.body;
      const upd = {};
      if (status !== undefined) upd.status = status;
      if (admin_comment !== undefined) upd.admin_comment = admin_comment;
      const { data, error } = await supabase
        .from('table_reservations').update(upd).eq('id', id).select().single();
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
