import supabase from './_supabase.js';

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TG_CHAT  = process.env.TELEGRAM_CHAT_ID   || '';

async function sendTelegram(text) {
  if (!TG_TOKEN || !TG_CHAT) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text })
    });
  } catch (e) { console.error('TG error:', e.message); }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const TABLE = 'table_reservations';

  try {
    // GET
    if (req.method === 'GET') {
      const { date } = req.query;
      let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
      if (date) query = query.eq('reservation_date', date);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST — создать бронь
    if (req.method === 'POST') {
      const body = req.body || {};
      const {
        table_number, seats, customer_name, customer_phone,
        guests_count, reservation_date, reservation_time,
        occasion, comment
      } = body;

      if (!table_number || !customer_name || !customer_phone || !guests_count || !reservation_date || !reservation_time)
        return res.status(400).json({ error: 'Заполните все обязательные поля' });

      // Проверка что стол не занят
      const { data: existing } = await supabase.from(TABLE).select('id')
        .eq('table_number', table_number)
        .eq('reservation_date', reservation_date)
        .eq('reservation_time', reservation_time)
        .neq('status', 'cancelled')
        .limit(1);
      if (existing && existing.length > 0)
        return res.status(409).json({ error: 'Этот стол уже забронирован на выбранное время' });

      const { data, error } = await supabase.from(TABLE).insert({
        table_number:     Number(table_number),
        seats:            Number(seats) || 4,
        customer_name,
        customer_phone,
        guests_count:     Number(guests_count),
        reservation_date,
        reservation_time,
        occasion:         occasion || null,
        comment:          comment  || null,
        status:           'new'
      }).select().single();
      if (error) throw error;

      await sendTelegram(
        `🪑 БРОНЬ СТОЛА #${data.id}\n\n` +
        `🔢 Стол №${data.table_number} (мест: ${data.seats})\n` +
        `👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
        `👥 Гостей: ${data.guests_count}\n` +
        `📅 ${data.reservation_date} в ${data.reservation_time}\n` +
        (data.occasion ? `🎉 Повод: ${data.occasion}\n` : '') +
        `💬 ${data.comment || 'Без комментария'}\n` +
        `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
      );

      return res.status(201).json(data);
    }

    // PUT — обновить статус
    if (req.method === 'PUT') {
      const { id, status, admin_comment } = req.body || {};
      const upd = {};
      if (status !== undefined)        upd.status = status;
      if (admin_comment !== undefined) upd.admin_comment = admin_comment;
      const { data, error } = await supabase.from(TABLE).update(upd).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    // DELETE
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      const { error } = await supabase.from(TABLE).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('table-reservations error:', err);
    res.status(500).json({ error: err.message });
  }
}
