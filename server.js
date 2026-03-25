import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL    || 'https://ylfaprsqkzcgzeizpmsc.supabase.co';
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY   || 'sb_secret_v0ck2wz6f7jH5_DIHOTR5Q_M3SPwBPO';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD              || 'soliperec2025';
const TG_TOKEN       = process.env.TELEGRAM_BOT_TOKEN          || '';
const TG_CHAT        = process.env.TELEGRAM_CHAT_ID            || '';
const PORT           = parseInt(process.env.PORT               || '3000', 10);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const app      = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

async function tg(text) {
  if (!TG_TOKEN || !TG_CHAT) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text })
    });
  } catch (e) { console.error('TG:', e.message); }
}

// ── health ────────────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    const { count, error } = await supabase.from('menu_items').select('id', { count: 'exact' }).limit(1);
    if (error) throw error;
    res.json({ status: 'ok', db: true, menu_items: count });
  } catch (e) { res.status(500).json({ status: 'error', error: e.message }); }
});

// ── admin-auth ────────────────────────────────────────────────────────────────
app.post('/api/admin-auth', (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Пароль не указан' });
  if (password === ADMIN_PASSWORD) return res.json({ ok: true, token: Buffer.from(`admin:${Date.now()}`).toString('base64') });
  res.status(401).json({ error: 'Неверный пароль' });
});

// ── menu ──────────────────────────────────────────────────────────────────────
app.get('/api/menu', async (req, res) => {
  try {
    const { category, type, featured, day_special } = req.query;
    let q = supabase.from('menu_items').select('*').eq('is_active', true).order('sort_order', { ascending: true });
    if (category)              q = q.eq('category', category);
    if (type)                  q = q.eq('type', type);
    if (featured === 'true')   q = q.eq('is_featured', true);
    if (day_special === 'true') q = q.eq('is_day_special', true);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/menu', async (req, res) => {
  try {
    const { data, error } = await supabase.from('menu_items').insert(req.body).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/menu', async (req, res) => {
  try {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase.from('menu_items').update(rest).eq('id', id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/menu', async (req, res) => {
  try {
    const { error } = await supabase.from('menu_items').delete().eq('id', req.body.id);
    if (error) throw error; res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── orders ────────────────────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
      .range(+offset, +offset + +limit - 1);
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/orders', async (req, res) => {
  try {
    const b = req.body;
    const { data, error } = await supabase.from('orders').insert({
      customer_name: b.customer_name, customer_phone: b.customer_phone,
      delivery_address: b.delivery_address || null, comment: b.comment || null,
      items: b.items, total_price: b.total_price,
      payment_method: b.payment_method || 'cash', status: 'new',
      delivery_type: b.delivery_type || 'delivery'
    }).select().single();
    if (error) throw error;
    const itemsText = (data.items || []).map(i => `• ${i.name} ×${i.quantity} — ${i.price * i.quantity}₽`).join('\n');
    await tg(`🍽 НОВЫЙ ЗАКАЗ #${data.id}\n\n👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
      `📍 ${data.delivery_address || 'Самовывоз'}\n💬 ${data.comment || '—'}\n\n🛒 Состав:\n${itemsText}\n\n` +
      `💰 Итого: ${data.total_price}₽\n💳 ${data.payment_method}\n🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/orders', async (req, res) => {
  try {
    const { id, status, admin_comment } = req.body;
    const upd = {};
    if (status !== undefined)        upd.status = status;
    if (admin_comment !== undefined) upd.admin_comment = admin_comment;
    const { data, error } = await supabase.from('orders').update(upd).eq('id', id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── bookings (банкеты) ────────────────────────────────────────────────────────
app.get('/api/bookings', async (req, res) => {
  try {
    const { status } = req.query;
    let q = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/bookings', async (req, res) => {
  try {
    const b = req.body;
    const { data, error } = await supabase.from('bookings').insert({
      customer_name: b.customer_name, customer_phone: b.customer_phone,
      customer_email: b.customer_email || null, event_type: b.event_type,
      event_date: b.event_date, event_time: b.event_time,
      guests_count: b.guests_count, extra_services: b.extra_services || [],
      total_estimate: b.total_estimate || 0, comment: b.comment || null, status: 'new'
    }).select().single();
    if (error) throw error;
    await tg(`📅 БАНКЕТ #${data.id}\n\n👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
      `🎭 ${data.event_type}\n📆 ${data.event_date} в ${data.event_time}\n👥 ${data.guests_count} гостей\n` +
      `💰 ~${data.total_estimate}₽\n💬 ${data.comment || '—'}`);
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/bookings', async (req, res) => {
  try {
    const { id, status, admin_comment } = req.body;
    const upd = {};
    if (status !== undefined)        upd.status = status;
    if (admin_comment !== undefined) upd.admin_comment = admin_comment;
    const { data, error } = await supabase.from('bookings').update(upd).eq('id', id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/bookings', async (req, res) => {
  try {
    const { error } = await supabase.from('bookings').delete().eq('id', req.body.id);
    if (error) throw error; res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── table-bookings (бронь столов) ─────────────────────────────────────────────
app.get('/api/table-bookings', async (req, res) => {
  try {
    const { date, time, all } = req.query;
    // Для схемы зала — занятые столы на дату+время
    if (date && time && !all) {
      const { data, error } = await supabase.from('table_bookings')
        .select('table_number, status')
        .eq('event_date', date).eq('event_time', time).neq('status', 'cancelled');
      if (error) throw error;
      return res.json({ busy: (data || []).map(r => r.table_number) });
    }
    // Для CRM — все брони
    let q = supabase.from('table_bookings').select('*').order('created_at', { ascending: false });
    if (date) q = q.eq('event_date', date);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/table-bookings', async (req, res) => {
  try {
    const b = req.body;
    if (!b.customer_name || !b.customer_phone || !b.table_number || !b.event_date || !b.event_time || !b.guests_count) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }
    // Проверка занятости стола
    const { data: existing } = await supabase.from('table_bookings').select('id')
      .eq('table_number', b.table_number).eq('event_date', b.event_date)
      .eq('event_time', b.event_time).neq('status', 'cancelled').limit(1);
    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Этот стол уже занят на выбранное время. Выберите другой стол или время.' });
    }
    const { data, error } = await supabase.from('table_bookings').insert({
      customer_name: b.customer_name, customer_phone: b.customer_phone,
      customer_email: b.customer_email || null,
      table_number: b.table_number, seats: b.seats || null,
      event_date: b.event_date, event_time: b.event_time,
      guests_count: b.guests_count, occasion: b.occasion || null,
      comment: b.comment || null, status: 'new'
    }).select().single();
    if (error) throw error;
    await tg(`🪑 БРОНЬ СТОЛА #${data.id}\n\n🔢 Стол №${data.table_number} (${data.seats || '?'} мест)\n` +
      `👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
      `👥 ${data.guests_count} гостей\n📅 ${data.event_date} в ${data.event_time}\n` +
      `🎉 Повод: ${data.occasion || 'не указан'}\n💬 ${data.comment || '—'}\n` +
      `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/table-bookings', async (req, res) => {
  try {
    const { id, status, admin_comment } = req.body;
    const upd = {};
    if (status !== undefined)        upd.status = status;
    if (admin_comment !== undefined) upd.admin_comment = admin_comment;
    const { data, error } = await supabase.from('table_bookings').update(upd).eq('id', id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/table-bookings', async (req, res) => {
  try {
    const { error } = await supabase.from('table_bookings').delete().eq('id', req.body.id);
    if (error) throw error; res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── reviews ───────────────────────────────────────────────────────────────────
app.get('/api/reviews', async (req, res) => {
  try {
    let q = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (req.query.approved === 'true') q = q.eq('is_approved', true);
    const { data, error } = await q;
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/reviews', async (req, res) => {
  try {
    const { author_name, rating, text, dish_name } = req.body;
    const { data, error } = await supabase.from('reviews')
      .insert({ author_name, rating, text, dish_name: dish_name || null, is_approved: false })
      .select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/reviews', async (req, res) => {
  try {
    const { id, is_approved } = req.body;
    const { data, error } = await supabase.from('reviews').update({ is_approved }).eq('id', id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/reviews', async (req, res) => {
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', req.body.id);
    if (error) throw error; res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── contacts ──────────────────────────────────────────────────────────────────
app.get('/api/contacts', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    const { data, error } = await supabase.from('contact_messages')
      .insert({ name, phone, email, message, is_read: false }).select().single();
    if (error) throw error;
    await tg(`📩 СООБЩЕНИЕ\n\n👤 ${name}\n📞 ${phone || '—'}\n📧 ${email || '—'}\n💬 ${message}`);
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/contacts', async (req, res) => {
  try {
    const { error } = await supabase.from('contact_messages').delete().eq('id', req.body.id);
    if (error) throw error; res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── banquet-services ──────────────────────────────────────────────────────────
app.get('/api/banquet-services', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('banquet_services').select('*')
      .eq('is_active', true).order('sort_order', { ascending: true });
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/banquet-services', async (req, res) => {
  try {
    const { data, error } = await supabase.from('banquet_services').insert(req.body).select().single();
    if (error) throw error; res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put('/api/banquet-services', async (req, res) => {
  try {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase.from('banquet_services').update(rest).eq('id', id).select().single();
    if (error) throw error; res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.delete('/api/banquet-services', async (req, res) => {
  try {
    const { error } = await supabase.from('banquet_services').delete().eq('id', req.body.id);
    if (error) throw error; res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── stats ─────────────────────────────────────────────────────────────────────
app.get('/api/stats', async (_req, res) => {
  try {
    const [o, b, tb, rv, m] = await Promise.all([
      supabase.from('orders').select('id,status,total_price'),
      supabase.from('bookings').select('id,status'),
      supabase.from('table_bookings').select('id,status'),
      supabase.from('reviews').select('id,is_approved,rating'),
      supabase.from('contact_messages').select('id,is_read'),
    ]);
    const orders = o.data ?? [], reviews = rv.data ?? [], msgs = m.data ?? [];
    const allBookings = [...(b.data ?? []), ...(tb.data ?? [])];
    const approved = reviews.filter(r => r.is_approved);
    res.json({
      total_orders:     orders.length,
      new_orders:       orders.filter(x => x.status === 'new').length,
      total_revenue:    orders.filter(x => x.status !== 'cancelled').reduce((s, x) => s + (+x.total_price || 0), 0),
      total_bookings:   allBookings.length,
      pending_bookings: allBookings.filter(x => x.status === 'new').length,
      pending_reviews:  reviews.filter(x => !x.is_approved).length,
      unread_messages:  msgs.filter(x => !x.is_read).length,
      avg_rating:       approved.length ? (approved.reduce((s, x) => s + x.rating, 0) / approved.length).toFixed(1) : '0',
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── static + SPA ──────────────────────────────────────────────────────────────
app.use(express.static(join(__dirname, 'dist')));
app.use((_req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));

// ── start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Соль и Перец — сервер запущен`);
  console.log(`   Порт:    ${PORT}`);
  console.log(`   Сайт:    http://localhost:${PORT}`);
  console.log(`   Админка: http://localhost:${PORT}/admin  (пароль: ${ADMIN_PASSWORD})`);
  console.log(`   DB:      ${SUPABASE_URL.slice(0, 40)}...`);
});
