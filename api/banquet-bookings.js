import supabase from './_supabase.js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ylfaprsqkzcgzeizpmsc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_v0ck2wz6f7jH5_DIHOTR5Q_M3SPwBPO';

async function sendTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
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
      const { status } = req.query;
      let query = supabase.from('banquet_bookings').select('*').order('created_at', { ascending: false });
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const body = req.body;
      if (!body.customer_name) return res.status(400).json({ error: '\u0418\u043c\u044f \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e' });
      if (!body.customer_phone) return res.status(400).json({ error: '\u0422\u0435\u043b\u0435\u0444\u043e\u043d \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e' });
      if (!body.event_date) return res.status(400).json({ error: '\u0414\u0430\u0442\u0430 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u0430' });

      const { data, error } = await supabase.from('banquet_bookings').insert({
        customer_name:  body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email || null,
        occasion:       body.occasion || null,
        package_key:    body.package_key || null,
        package_name:   body.package_name || null,
        event_date:     body.event_date,
        event_time:     body.event_time || '18:00',
        guests_count:   body.guests_count || 1,
        extra_services: body.extra_services || [],
        total_estimate: body.total_estimate || 0,
        comment:        body.comment || null,
        status:         'new',
      }).select().single();
      if (error) throw error;

      const services = (data.extra_services || []).map(s => `\u2022 ${s}`).join('\n') || '\u043d\u0435\u0442';
      await sendTelegram(
        `\ud83c\udf89 \u0411\u0410\u041d\u041a\u0415\u0422 #${data.id}\n\n` +
        `\ud83d\udc64 ${data.customer_name}\n` +
        `\ud83d\udcde ${data.customer_phone}\n` +
        `\ud83d\udce7 ${data.customer_email || '\u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d'}\n` +
        `\ud83c\udf89 \u041f\u043e\u0432\u043e\u0434: ${data.occasion || '\u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d'}\n` +
        `\ud83d\udce6 \u041f\u0430\u043a\u0435\u0442: ${data.package_name || '\u0431\u0435\u0437 \u043f\u0430\u043a\u0435\u0442\u0430'}\n` +
        `\ud83d\udcc6 \u0414\u0430\u0442\u0430: ${data.event_date} \u0432 ${data.event_time}\n` +
        `\ud83d\udc65 \u0413\u043e\u0441\u0442\u0435\u0439: ${data.guests_count}\n` +
        `\ud83c\udf89 \u0414\u043e\u043f. \u0443\u0441\u043b\u0443\u0433\u0438:\n${services}\n` +
        `\ud83d\udcb0 \u0421\u043c\u0435\u0442\u0430: ~${data.total_estimate}\u20bd\n` +
        `\ud83d\udcac ${data.comment || '\u0411\u0435\u0437 \u043a\u043e\u043c\u043c\u0435\u043d\u0442\u0430\u0440\u0438\u044f'}`
      );
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      const { id, status, admin_comment } = req.body;
      const upd = {};
      if (status !== undefined) upd.status = status;
      if (admin_comment !== undefined) upd.admin_comment = admin_comment;
      const { data, error } = await supabase.from('banquet_bookings').update(upd).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('banquet_bookings').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Banquet bookings error:', err);
    res.status(500).json({ error: err.message });
  }
}
