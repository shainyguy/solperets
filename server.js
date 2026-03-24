// ═══════════════════════════════════════════════════════════════
//  Сервер кафе «Соль и Перец»
//  Работает на Railway, VPS, Beget, REG.RU и любом Node.js хосте
// ═══════════════════════════════════════════════════════════════

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Настройки ───────────────────────────────────────────────────────────────
// Если на хостинге заданы переменные окружения — используются они.
// Если нет — используются значения справа от ||  (уже вписаны верные ключи)

const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL    ?? 'https://ylfaprsqkzcgzeizpmsc.supabase.co';
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY   ?? 'sb_secret_v0ck2wz6f7jH5_DIHOTR5Q_M3SPwBPO';
const ADMIN_PASS     = process.env.ADMIN_PASSWORD              ?? 'soliperec2025';
const TG_TOKEN       = process.env.TELEGRAM_BOT_TOKEN          ?? '';
const TG_CHAT        = process.env.TELEGRAM_CHAT_ID            ?? '';
const PORT           = Number(process.env.PORT                 ?? 3000);

// ─── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Express ──────────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ─── Telegram ─────────────────────────────────────────────────────────────────
async function tg(text) {
  if (!TG_TOKEN || !TG_CHAT) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'HTML' })
    });
  } catch {}
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    const { count } = await supabase.from('menu_items').select('id', { count: 'exact', head: true });
    res.json({ ok: true, menu_items: count, supabase: SUPABASE_URL.slice(0, 40) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────
app.post('/api/admin-auth', (req, res) => {
  const { password } = req.body ?? {};
  if (!password) return res.status(400).json({ error: 'Пароль не указан' });
  if (password === ADMIN_PASS) {
    return res.json({ ok: true, token: Buffer.from(`admin:${Date.now()}`).toString('base64') });
  }
  res.status(401).json({ error: 'Неверный пароль' });
});

// ─── MENU ─────────────────────────────────────────────────────────────────────
app.get('/api/menu', async (req, res) => {
  try {
    const { category, type, featured, day_special } = req.query;
    let q = supabase.from('menu_items').select('*').eq('is_active', true).order('sort_order');
    if (category)              q = q.eq('category', category);
    if (type)                  q = q.eq('type', type);
    if (featured === 'true')   q = q.eq('is_featured', true);
    if (day_special === 'true') q = q.eq('is_day_special', true);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data ?? []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/menu', async (req, res) => {
  try {
    const { data, error } = await supabase.from('menu_items').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/menu', async (req, res) => {
  try {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase.from('menu_items').update(rest).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/menu', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── ORDERS ───────────────────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
      .range(+offset, +offset + +limit - 1);
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data ?? []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const b = req.body;
    const { data, error } = await supabase.from('orders').insert({
      customer_name: b.customer_name, customer_phone: b.customer_phone,
      delivery_address: b.delivery_address ?? null, comment: b.comment ?? null,
      items: b.items, total_price: b.total_price,
      payment_method: b.payment_method ?? 'cash', status: 'new',
      delivery_type: b.delivery_type ?? 'delivery'
    }).select().single();
    if (error) throw error;
    const lines = (data.items ?? []).map(i => `• ${i.name} ×${i.quantity} — ${i.price * i.quantity}₽`).join('\n');
    await tg(`🍽 <b>НОВЫЙ ЗАКАЗ #${data.id}</b>\n\n👤 ${data.customer_name}\n📞 ${data.customer_phone}\n📍 ${data.delivery_address ?? 'Самовывоз'}\n\n${lines}\n\n💰 <b>${data.total_price}₽</b> · ${data.payment_method}`);
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/orders', async (req, res) => {
  try {
    const { id, ...upd } = req.body;
    const { data, error } = await supabase.from('orders').update(upd).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────
app.get('/api/bookings', async (req, res) => {
  try {
    const { status } = req.query;
    let q = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data ?? []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const b = req.body;
    const { data, error } = await supabase.from('bookings').insert({
      customer_name: b.customer_name, customer_phone: b.customer_phone,
      customer_email: b.customer_email ?? null, event_type: b.event_type ?? 'Банкет',
      event_date: b.event_date, event_time: b.event_time,
      guests_count: b.guests_count, extra_services: b.extra_services ?? [],
      total_estimate: b.total_estimate ?? 0, comment: b.comment ?? null,
      table_number: b.table_number ?? null, seats: b.seats ?? null,
      package: b.package ?? null, status: 'new'
    }).select().single();
    if (error) throw error;
    const svcs = (data.extra_services ?? []).join(', ') || 'нет';
    await tg(`📅 <b>БРОНИРОВАНИЕ #${data.id}</b>\n\n👤 ${data.customer_name}\n📞 ${data.customer_phone}\n🎭 ${data.event_type}\n📆 ${data.event_date} в ${data.event_time}\n👥 ${data.guests_count} гостей\n🪑 Стол №${data.table_number ?? '?'}, мест: ${data.seats ?? '?'}\n📦 Пакет: ${data.package ?? 'не выбран'}\n🎉 Услуги: ${svcs}\n💰 ~${data.total_estimate}₽\n💬 ${data.comment ?? 'без комментария'}`);
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/bookings', async (req, res) => {
  try {
    const { id, ...upd } = req.body;
    const { data, error } = await supabase.from('bookings').update(upd).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/bookings', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── REVIEWS ──────────────────────────────────────────────────────────────────
app.get('/api/reviews', async (req, res) => {
  try {
    let q = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (req.query.approved === 'true') q = q.eq('is_approved', true);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data ?? []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { author_name, rating, text, dish_name } = req.body;
    const { data, error } = await supabase.from('reviews')
      .insert({ author_name, rating, text, dish_name: dish_name ?? null, is_approved: false })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/reviews', async (req, res) => {
  try {
    const { id, is_approved } = req.body;
    const { data, error } = await supabase.from('reviews').update({ is_approved }).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/reviews', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── CONTACTS ─────────────────────────────────────────────────────────────────
app.get('/api/contacts', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data ?? []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    const { data, error } = await supabase.from('contact_messages')
      .insert({ name, phone, email, message, is_read: false }).select().single();
    if (error) throw error;
    await tg(`📩 <b>СООБЩЕНИЕ</b>\n\n👤 ${name}\n📞 ${phone ?? '—'}\n📧 ${email ?? '—'}\n💬 ${message}`);
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/contacts', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── BANQUET SERVICES ─────────────────────────────────────────────────────────
app.get('/api/banquet-services', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('banquet_services')
      .select('*').eq('is_active', true).order('sort_order');
    if (error) throw error;
    res.json(data ?? []);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/banquet-services', async (req, res) => {
  try {
    const { data, error } = await supabase.from('banquet_services').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/banquet-services', async (req, res) => {
  try {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase.from('banquet_services').update(rest).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/banquet-services', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('banquet_services').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── STATS ────────────────────────────────────────────────────────────────────
app.get('/api/stats', async (_req, res) => {
  try {
    const [o, b, rv, m] = await Promise.all([
      supabase.from('orders').select('id,status,total_price'),
      supabase.from('bookings').select('id,status'),
      supabase.from('reviews').select('id,is_approved,rating'),
      supabase.from('contact_messages').select('id,is_read'),
    ]);
    const orders = o.data ?? [], bookings = b.data ?? [], reviews = rv.data ?? [], msgs = m.data ?? [];
    const approved = reviews.filter(r => r.is_approved);
    res.json({
      total_orders:     orders.length,
      new_orders:       orders.filter(x => x.status === 'new').length,
      total_revenue:    orders.filter(x => x.status !== 'cancelled').reduce((s, x) => s + (+x.total_price || 0), 0),
      total_bookings:   bookings.length,
      pending_bookings: bookings.filter(x => x.status === 'new').length,
      pending_reviews:  reviews.filter(x => !x.is_approved).length,
      unread_messages:  msgs.filter(x => !x.is_read).length,
      avg_rating:       approved.length ? (approved.reduce((s, x) => s + x.rating, 0) / approved.length).toFixed(1) : '0',
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── /api/table-bookings ─────────────────────────────────────────────────────

app.get('/api/table-bookings', async (req, res) => {
  try {
    const { date, time, table_number } = req.query;
    let query = supabase.from('table_bookings').select('*').order('created_at', { ascending: false });
    if (date)         query = query.eq('event_date', date);
    if (time)         query = query.eq('event_time', time);
    if (table_number) query = query.eq('table_number', Number(table_number));
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/table-bookings', async (req, res) => {
  try {
    const body = req.body;
    const { data: existing, error: checkErr } = await supabase
      .from('table_bookings').select('id')
      .eq('table_number', body.table_number)
      .eq('event_date', body.event_date)
      .eq('event_time', body.event_time)
      .neq('status', 'cancelled');
    if (checkErr) throw checkErr;
    if (existing && existing.length > 0) return res.status(409).json({ error: 'Этот стол уже забронирован на выбранное время' });
    const { data, error } = await supabase.from('table_bookings').insert({
      table_number: body.table_number,
      customer_name: body.customer_name, customer_phone: body.customer_phone,
      guests_count: body.guests_count, event_date: body.event_date,
      event_time: body.event_time, comment: body.comment || null, status: 'new'
    }).select().single();
    if (error) throw error;
    await sendTelegram(`🪑 БРОНЬ СТОЛА #${data.id}\n🔢 Стол №${data.table_number}\n👤 ${data.customer_name}\n📞 ${data.customer_phone}\n👥 ${data.guests_count} гостей\n📅 ${data.event_date} в ${data.event_time}\n💬 ${data.comment || '-'}`);
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/table-bookings', async (req, res) => {
  try {
    const { id, status, admin_comment } = req.body;
    const upd = {};
    if (status !== undefined) upd.status = status;
    if (admin_comment !== undefined) upd.admin_comment = admin_comment;
    const { data, error } = await supabase.from('table_bookings').update(upd).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/table-bookings', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('table_bookings').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── STATIC + SPA ─────────────────────────────────────────────────────────────

// ─── Статические файлы ───────────────────────────────────────────────────────

app.use(express.static(join(__dirname, 'dist')));
app.use((_req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅  Соль и Перец — сервер запущен`);
  console.log(`    http://0.0.0.0:${PORT}`);
  console.log(`    Supabase: ${SUPABASE_URL.slice(0, 40)}...`);
  console.log(`    Пароль админки: ${ADMIN_PASS}`);
});
