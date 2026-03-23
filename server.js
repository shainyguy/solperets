import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// ── Переменные окружения (fallback если .env не читается) ────────────────────
const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL    || 'https://ylfaprsqkzcgzeizpmsc.supabase.co';
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY   || 'sb_secret_v0ck2wz6f7jH5_DIHOTR5Q_M3SPwBPO';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD              || 'soliperec2025';
const TG_TOKEN       = process.env.TELEGRAM_BOT_TOKEN          || '';
const TG_CHAT        = process.env.TELEGRAM_CHAT_ID            || '';
const PORT           = parseInt(process.env.PORT               || '3000', 10);

// ── Supabase ─────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Express ──────────────────────────────────────────────────────────────────
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(cors());
app.use(express.json());

// ── Telegram ─────────────────────────────────────────────────────────────────
async function tg(text) {
  if (!TG_TOKEN || !TG_CHAT) return;
  try {
    await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TG_CHAT, text, parse_mode: 'HTML' }),
    });
  } catch (e) { console.error('TG error:', e.message); }
}

// ── Хелпер ошибки ────────────────────────────────────────────────────────────
function err500(res, e) {
  console.error(e);
  res.status(500).json({ error: e.message });
}

// ════════════════════════════════════════════════════════════════════════════
// HEALTH
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/health', async (req, res) => {
  try {
    const { count } = await supabase.from('menu_items').select('id', { count: 'exact' }).limit(1);
    res.json({ status: 'ok', db: true, items: count });
  } catch (e) { err500(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN AUTH
// ════════════════════════════════════════════════════════════════════════════
app.post('/api/admin-auth', (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Пароль не указан' });
  if (password === ADMIN_PASSWORD) {
    return res.json({ ok: true, token: Buffer.from(`admin:${Date.now()}`).toString('base64') });
  }
  res.status(401).json({ error: 'Неверный пароль' });
});

// ════════════════════════════════════════════════════════════════════════════
// MENU
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/menu', async (req, res) => {
  try {
    const { category, type, featured, day_special } = req.query;
    let q = supabase.from('menu_items').select('*').eq('is_active', true).order('sort_order');
    if (category)               q = q.eq('category', category);
    if (type)                   q = q.eq('type', type);
    if (featured === 'true')    q = q.eq('is_featured', true);
    if (day_special === 'true') q = q.eq('is_day_special', true);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.post('/api/menu', async (req, res) => {
  try {
    const { data, error } = await supabase.from('menu_items').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { err500(res, e); }
});

app.put('/api/menu', async (req, res) => {
  try {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase.from('menu_items').update(rest).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.delete('/api/menu', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { err500(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/orders', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
      .range(+offset, +offset + +limit - 1);
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const b = req.body;
    const { data, error } = await supabase.from('orders').insert({
      customer_name:    b.customer_name,
      customer_phone:   b.customer_phone,
      delivery_address: b.delivery_address || null,
      comment:          b.comment || null,
      items:            b.items,
      total_price:      b.total_price,
      payment_method:   b.payment_method || 'cash',
      status:           'new',
      delivery_type:    b.delivery_type || 'delivery',
    }).select().single();
    if (error) throw error;
    const lines = (data.items || []).map(i => `• ${i.name} ×${i.quantity} — ${i.price * i.quantity}₽`).join('\n');
    await tg(`🍽 <b>НОВЫЙ ЗАКАЗ #${data.id}</b>\n\n👤 ${data.customer_name}\n📞 ${data.customer_phone}\n📍 ${data.delivery_address || 'Самовывоз'}\n💬 ${data.comment || '—'}\n\n🛒 Состав:\n${lines}\n\n💰 Итого: ${data.total_price}₽\n💳 ${data.payment_method}`);
    res.status(201).json(data);
  } catch (e) { err500(res, e); }
});

app.put('/api/orders', async (req, res) => {
  try {
    const { id, status, admin_comment } = req.body;
    const upd = {};
    if (status !== undefined)        upd.status = status;
    if (admin_comment !== undefined) upd.admin_comment = admin_comment;
    const { data, error } = await supabase.from('orders').update(upd).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
// BOOKINGS (банкеты)
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/bookings', async (req, res) => {
  try {
    const { status } = req.query;
    let q = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const b = req.body;
    const { data, error } = await supabase.from('bookings').insert({
      customer_name:   b.customer_name,
      customer_phone:  b.customer_phone,
      customer_email:  b.customer_email || null,
      event_type:      b.event_type,
      event_date:      b.event_date,
      event_time:      b.event_time,
      guests_count:    b.guests_count,
      extra_services:  b.extra_services || [],
      total_estimate:  b.total_estimate || 0,
      comment:         b.comment || null,
      status:          'new',
    }).select().single();
    if (error) throw error;
    const svcs = (data.extra_services || []).join(', ') || '—';
    await tg(`📅 <b>БАНКЕТ #${data.id}</b>\n\n👤 ${data.customer_name}\n📞 ${data.customer_phone}\n🎭 ${data.event_type}\n📆 ${data.event_date} в ${data.event_time}\n👥 ${data.guests_count} гостей\n🎉 ${svcs}\n💰 ~${data.total_estimate}₽`);
    res.status(201).json(data);
  } catch (e) { err500(res, e); }
});

app.put('/api/bookings', async (req, res) => {
  try {
    const { id, status, admin_comment } = req.body;
    const upd = {};
    if (status !== undefined)        upd.status = status;
    if (admin_comment !== undefined) upd.admin_comment = admin_comment;
    const { data, error } = await supabase.from('bookings').update(upd).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.delete('/api/bookings', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { err500(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
// TABLE BOOKINGS (бронь столов)
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/table-bookings', async (req, res) => {
  try {
    const { date, table_number } = req.query;
    let q = supabase.from('table_bookings').select('*').order('created_at', { ascending: false });
    if (date)         q = q.eq('booking_date', date);
    if (table_number) q = q.eq('table_number', +table_number);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.post('/api/table-bookings', async (req, res) => {
  try {
    const b = req.body;
    // Проверка занятости стола
    const { data: existing } = await supabase.from('table_bookings').select('id')
      .eq('table_number', b.table_number)
      .eq('booking_date', b.booking_date)
      .eq('booking_time', b.booking_time)
      .neq('status', 'cancelled');
    if (existing && existing.length > 0)
      return res.status(409).json({ error: 'Этот стол уже забронирован на выбранное время' });

    const { data, error } = await supabase.from('table_bookings').insert({
      table_number:   b.table_number,
      zone:           b.zone,
      seats:          b.seats,
      customer_name:  b.customer_name,
      customer_phone: b.customer_phone,
      guests_count:   b.guests_count,
      booking_date:   b.booking_date,
      booking_time:   b.booking_time,
      comment:        b.comment || null,
      status:         'new',
    }).select().single();
    if (error) throw error;

    await tg(`🪑 <b>БРОНЬ СТОЛА #${data.id}</b>\n\n🔢 Стол №${data.table_number} (Зона ${data.zone})\n👤 ${data.customer_name}\n📞 ${data.customer_phone}\n👥 Гостей: ${data.guests_count}\n📅 ${data.booking_date} в ${data.booking_time}\n💬 ${data.comment || '—'}`);
    res.status(201).json(data);
  } catch (e) { err500(res, e); }
});

app.put('/api/table-bookings', async (req, res) => {
  try {
    const { id, status, admin_comment } = req.body;
    const upd = {};
    if (status !== undefined)        upd.status = status;
    if (admin_comment !== undefined) upd.admin_comment = admin_comment;
    const { data, error } = await supabase.from('table_bookings').update(upd).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.delete('/api/table-bookings', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('table_bookings').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { err500(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
// REVIEWS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/reviews', async (req, res) => {
  try {
    const { approved } = req.query;
    let q = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (approved === 'true') q = q.eq('is_approved', true);
    const { data, error } = await q;
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { author_name, rating, text, dish_name } = req.body;
    const { data, error } = await supabase.from('reviews')
      .insert({ author_name, rating, text, dish_name: dish_name || null, is_approved: false })
      .select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { err500(res, e); }
});

app.put('/api/reviews', async (req, res) => {
  try {
    const { id, is_approved } = req.body;
    const { data, error } = await supabase.from('reviews').update({ is_approved }).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.delete('/api/reviews', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { err500(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
// CONTACTS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    const { data, error } = await supabase.from('contact_messages')
      .insert({ name, phone, email, message, is_read: false }).select().single();
    if (error) throw error;
    await tg(`📩 <b>СООБЩЕНИЕ</b>\n\n👤 ${name}\n📞 ${phone || '—'}\n📧 ${email || '—'}\n💬 ${message}`);
    res.status(201).json(data);
  } catch (e) { err500(res, e); }
});

app.delete('/api/contacts', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { err500(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
// BANQUET SERVICES
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/banquet-services', async (req, res) => {
  try {
    const { data, error } = await supabase.from('banquet_services').select('*').eq('is_active', true).order('sort_order');
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.post('/api/banquet-services', async (req, res) => {
  try {
    const { data, error } = await supabase.from('banquet_services').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) { err500(res, e); }
});

app.put('/api/banquet-services', async (req, res) => {
  try {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase.from('banquet_services').update(rest).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (e) { err500(res, e); }
});

app.delete('/api/banquet-services', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('banquet_services').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { err500(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════════════════════
app.get('/api/stats', async (req, res) => {
  try {
    const [o, b, r, m, tr] = await Promise.all([
      supabase.from('orders').select('id,status,total_price'),
      supabase.from('bookings').select('id,status'),
      supabase.from('reviews').select('id,is_approved,rating'),
      supabase.from('contact_messages').select('id,is_read'),
      supabase.from('table_bookings').select('id,status'),
    ]);
    const orders   = o.data || [];
    const bookings = b.data || [];
    const reviews  = r.data || [];
    const msgs     = m.data || [];
    const tables   = tr.data || [];
    const approved = reviews.filter(x => x.is_approved);
    res.json({
      total_orders:     orders.length,
      new_orders:       orders.filter(x => x.status === 'new').length,
      total_revenue:    orders.filter(x => x.status !== 'cancelled').reduce((s, x) => s + (+x.total_price || 0), 0),
      total_bookings:   bookings.length,
      pending_bookings: bookings.filter(x => x.status === 'new').length,
      pending_reviews:  reviews.filter(x => !x.is_approved).length,
      unread_messages:  msgs.filter(x => !x.is_read).length,
      new_table_res:    tables.filter(x => x.status === 'new').length,
      avg_rating:       approved.length ? (approved.reduce((s, x) => s + x.rating, 0) / approved.length).toFixed(1) : '0',
    });
  } catch (e) { err500(res, e); }
});

// ════════════════════════════════════════════════════════════════════════════
// STATIC + SPA
// ════════════════════════════════════════════════════════════════════════════
app.use(express.static(join(__dirname, 'dist')));
app.use((req, res) => res.sendFile(join(__dirname, 'dist', 'index.html')));

// ── Запуск ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Сервер «Соль и Перец» запущен на порту ${PORT}`);
  console.log(`   Supabase: ${SUPABASE_URL.slice(0, 40)}...`);
  console.log(`   Пароль:   ${ADMIN_PASSWORD}`);
});
