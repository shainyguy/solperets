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
    if (req.method === 'GET') {
      const { status } = req.query;
      let q = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data ?? []);
    }

    if (req.method === 'POST') {
      const b = req.body;
      // Включаем пакет в event_type
      const eventType = b.package_type
        ? `${b.event_type || 'Банкет'} [${b.package_type}]`
        : (b.event_type || 'Банкет');

      const { data, error } = await supabase.from('bookings').insert({
        customer_name:   b.customer_name,
        customer_phone:  b.customer_phone,
        customer_email:  b.customer_email  || null,
        event_type:      eventType,
        event_date:      b.event_date,
        event_time:      b.event_time,
        guests_count:    b.guests_count,
        extra_services:  b.extra_services  || [],
        total_estimate:  b.total_estimate  || 0,
        comment:         b.comment         || null,
        status:          'new'
      }).select().single();
      if (error) throw error;

      const svcs = (data.extra_services || []).join(', ') || 'нет';
      await sendTelegram(
        `📅 БАНКЕТ #${data.id}\n\n` +
        `👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
        `📧 ${data.customer_email || 'не указан'}\n` +
        `🎭 ${data.event_type}\n` +
        `📆 ${data.event_date} в ${data.event_time}\n` +
        `👥 ${data.guests_count} гостей\n` +
        `📦 Пакет: ${data.package_type || 'не выбран'}\n` +
        `🎉 Услуги: ${svcs}\n` +
        `💰 ~${data.total_estimate}₽\n` +
        `💬 ${data.comment || 'без комментария'}\n` +
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
        .from('bookings').update(upd).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('bookings').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('bookings error:', err);
    res.status(500).json({ error: err.message });
  }
}
