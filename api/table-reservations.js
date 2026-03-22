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
      let query = supabase.from('table_reservations').select('*').order('created_at', { ascending: false });
      if (date) query = query.eq('reserve_date', date);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { table_number, customer_name, customer_phone, guests_count, reserve_date, reserve_time, comment } = req.body;
      // Проверяем нет ли уже брони на этот стол в это время
      const { data: existing } = await supabase
        .from('table_reservations')
        .select('id')
        .eq('table_number', table_number)
        .eq('reserve_date', reserve_date)
        .eq('reserve_time', reserve_time)
        .not('status', 'eq', 'cancelled');
      if (existing && existing.length > 0) {
        return res.status(409).json({ error: 'Этот стол уже забронирован на выбранное время' });
      }
      const { data, error } = await supabase.from('table_reservations').insert({
        table_number, customer_name, customer_phone, guests_count,
        reserve_date, reserve_time, comment: comment || null, status: 'new'
      }).select().single();
      if (error) throw error;
      await sendTelegram(
        `🪑 БРОНЬ СТОЛА #${data.id}\n\n` +
        `🔢 Стол №${table_number}\n` +
        `👤 ${customer_name}\n📞 ${customer_phone}\n` +
        `📅 ${reserve_date} в ${reserve_time}\n` +
        `👥 ${guests_count} гостей\n` +
        `💬 ${comment || 'Без комментария'}`
      );
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, admin_comment } = req.body;
      const upd = {};
      if (status) upd.status = status;
      if (admin_comment !== undefined) upd.admin_comment = admin_comment;
      const { data, error } = await supabase.from('table_reservations').update(upd).eq('id', id).select().single();
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
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
