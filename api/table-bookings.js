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
  } catch (e) { console.error('Telegram error:', e.message); }
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
      if (date)         query = query.eq('event_date', date);
      if (table_number) query = query.eq('table_number', Number(table_number));
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const b = req.body;

      // Проверяем конфликт — тот же стол + дата + время + не отменено
      const { data: existing, error: checkErr } = await supabase
        .from('table_bookings')
        .select('id')
        .eq('table_number', b.table_number)
        .eq('event_date',   b.event_date)
        .eq('event_time',   b.event_time)
        .neq('status', 'cancelled');
      if (checkErr) throw checkErr;
      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Этот стол уже забронирован на выбранное время' });
      }

      const { data, error } = await supabase.from('table_bookings').insert({
        table_number:   b.table_number,
        customer_name:  b.customer_name,
        customer_phone: b.customer_phone,
        customer_email: b.customer_email || null,
        occasion:       b.occasion       || null,
        package_key:    b.package_key    || null,
        event_date:     b.event_date,
        event_time:     b.event_time,
        guests_count:   b.guests_count,
        extra_services: b.extra_services || [],
        total_estimate: b.total_estimate || 0,
        comment:        b.comment        || null,
        status:         'new'
      }).select().single();
      if (error) throw error;

      await sendTelegram(
        `🪑 БРОНЬ СТОЛА #${data.id}\n\n` +
        `🔢 Стол №${data.table_number}\n` +
        `👤 ${data.customer_name}\n` +
        `📞 ${data.customer_phone}\n` +
        `👥 Гостей: ${data.guests_count}\n` +
        `📅 ${data.event_date} в ${data.event_time}\n` +
        `🎉 Повод: ${data.occasion || 'не указан'}\n` +
        `📦 Пакет: ${data.package_key || 'без пакета'}\n` +
        `💬 ${data.comment || 'Без комментария'}\n` +
        `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
      );
      return res.status(201).json(data);
    }

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
