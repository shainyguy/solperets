import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Загружаем .env если есть
dotenv.config();

// ─── Переменные окружения ────────────────────────────────────────────────────
// Fallback-значения: если переменная не задана в панели Railway/хостинга,
// используется значение справа от ||

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL    || 'https://ylfaprsqkzcgzeizpmsc.supabase.co';
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY   || 'sb_secret_v0ck2wz6f7jH5_DIHOTR5Q_M3SPwBPO';
const ADMIN_PASSWORD    = process.env.ADMIN_PASSWORD              || 'soliperec2025';
const TG_TOKEN          = process.env.TELEGRAM_BOT_TOKEN          || '';
const TG_CHAT           = process.env.TELEGRAM_CHAT_ID            || '';
const PORT              = parseInt(process.env.PORT               || '3000', 10);

// ─── Supabase клиент ─────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Express ─────────────────────────────────────────────────────────────────

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());

// ─── Telegram ────────────────────────────────────────────────────────────────

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

// ─── /api/health ─────────────────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('menu_items')
      .select('id', { count: 'exact' })
      .limit(1);
    if (error) throw error;
    res.json({
      status: 'ok',
      db_connected: true,
      menu_items_count: count,
      supabase_url: SUPABASE_URL.substring(0, 30) + '...'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ─── /api/admin-auth ─────────────────────────────────────────────────────────

app.post('/api/admin-auth', (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Пароль не указан' });
  if (password === ADMIN_PASSWORD) {
    const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
    return res.json({ ok: true, token });
  }
  res.status(401).json({ error: 'Неверный пароль' });
});

// ─── /api/menu ───────────────────────────────────────────────────────────────

app.get('/api/menu', async (req, res) => {
  try {
    const { category, type, featured, day_special } = req.query;
    let query = supabase
      .from('menu_items')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (category) query = query.eq('category', category);
    if (type)     query = query.eq('type', type);
    if (featured === 'true')    query = query.eq('is_featured', true);
    if (day_special === 'true') query = query.eq('is_day_special', true);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/menu', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .insert(req.body)
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/menu', async (req, res) => {
  try {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase
      .from('menu_items')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/menu', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── /api/orders ─────────────────────────────────────────────────────────────

app.get('/api/orders', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const body = req.body;
    const { data, error } = await supabase.from('orders').insert({
      customer_name:    body.customer_name,
      customer_phone:   body.customer_phone,
      delivery_address: body.delivery_address || null,
      comment:          body.comment || null,
      items:            body.items,
      total_price:      body.total_price,
      payment_method:   body.payment_method || 'cash',
      status:           'new',
      delivery_type:    body.delivery_type || 'delivery'
    }).select().single();
    if (error) throw error;

    const itemsText = (data.items || [])
      .map(i => `• ${i.name} ×${i.quantity} — ${i.price * i.quantity}₽`)
      .join('\n');
    await sendTelegram(
      `🍽 НОВЫЙ ЗАКАЗ #${data.id}\n\n` +
      `👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
      `📍 ${data.delivery_address || 'Самовывоз'}\n` +
      `💬 ${data.comment || 'Без комментария'}\n\n` +
      `🛒 Состав:\n${itemsText}\n\n` +
      `💰 Итого: ${data.total_price}₽\n` +
      `💳 Оплата: ${data.payment_method}\n` +
      `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
    );
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders', async (req, res) => {
  try {
    const { id, status, admin_comment } = req.body;
    const upd = {};
    if (status !== undefined)        upd.status = status;
    if (admin_comment !== undefined) upd.admin_comment = admin_comment;
    const { data, error } = await supabase
      .from('orders').update(upd).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── /api/bookings ───────────────────────────────────────────────────────────

app.get('/api/bookings', async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const body = req.body;
    const { data, error } = await supabase.from('bookings').insert({
      customer_name:   body.customer_name,
      customer_phone:  body.customer_phone,
      customer_email:  body.customer_email || null,
      event_type:      body.event_type,
      event_date:      body.event_date,
      event_time:      body.event_time,
      guests_count:    body.guests_count,
      extra_services:  body.extra_services || [],
      total_estimate:  body.total_estimate || 0,
      comment:         body.comment || null,
      status:          'new'
    }).select().single();
    if (error) throw error;

    const services = (data.extra_services || []).join(', ') || 'нет';
    await sendTelegram(
      `📅 НОВОЕ БРОНИРОВАНИЕ #${data.id}\n\n` +
      `👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
      `📧 ${data.customer_email || 'не указан'}\n` +
      `🎭 ${data.event_type}\n📆 ${data.event_date} в ${data.event_time}\n` +
      `👥 ${data.guests_count} гостей\n🎉 Услуги: ${services}\n` +
      `💰 ~${data.total_estimate}₽\n💬 ${data.comment || 'Без комментария'}`
    );
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/bookings', async (req, res) => {
  try {
    const { id, status, admin_comment } = req.body;
    const upd = {};
    if (status !== undefined)        upd.status = status;
    if (admin_comment !== undefined) upd.admin_comment = admin_comment;
    const { data, error } = await supabase
      .from('bookings').update(upd).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/bookings', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── /api/reviews ────────────────────────────────────────────────────────────

app.get('/api/reviews', async (req, res) => {
  try {
    const { approved } = req.query;
    let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (approved === 'true') query = query.eq('is_approved', true);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const { author_name, rating, text, dish_name } = req.body;
    const { data, error } = await supabase.from('reviews').insert({
      author_name, rating, text,
      dish_name: dish_name || null,
      is_approved: false
    }).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/reviews', async (req, res) => {
  try {
    const { id, is_approved } = req.body;
    const { data, error } = await supabase
      .from('reviews').update({ is_approved }).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/reviews', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── /api/contacts ───────────────────────────────────────────────────────────

app.get('/api/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    const { data, error } = await supabase.from('contact_messages').insert({
      name, phone, email, message, is_read: false
    }).select().single();
    if (error) throw error;
    await sendTelegram(
      `📩 НОВОЕ СООБЩЕНИЕ\n\n👤 ${name}\n📞 ${phone || 'не указан'}\n📧 ${email || 'не указан'}\n💬 ${message}`
    );
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/contacts', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── /api/banquet-services ───────────────────────────────────────────────────

app.get('/api/banquet-services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('banquet_services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/banquet-services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('banquet_services').insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/banquet-services', async (req, res) => {
  try {
    const { id, ...rest } = req.body;
    const { data, error } = await supabase
      .from('banquet_services').update(rest).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/banquet-services', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('banquet_services').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── /api/stats ──────────────────────────────────────────────────────────────

app.get('/api/stats', async (req, res) => {
  try {
    const [ordersRes, bookingsRes, reviewsRes, messagesRes] = await Promise.all([
      supabase.from('orders').select('id, status, total_price'),
      supabase.from('bookings').select('id, status'),
      supabase.from('reviews').select('id, is_approved, rating'),
      supabase.from('contact_messages').select('id, is_read')
    ]);

    const orders   = ordersRes.data   || [];
    const bookings = bookingsRes.data  || [];
    const reviews  = reviewsRes.data   || [];
    const messages = messagesRes.data  || [];

    const totalRevenue    = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_price || 0), 0);
    const newOrders       = orders.filter(o => o.status === 'new').length;
    const pendingBookings = bookings.filter(b => b.status === 'new').length;
    const pendingReviews  = reviews.filter(r => !r.is_approved).length;
    const unreadMessages  = messages.filter(m => !m.is_read).length;
    const approved        = reviews.filter(r => r.is_approved);
    const avgRating       = approved.length
      ? (approved.reduce((s, r) => s + r.rating, 0) / approved.length).toFixed(1)
      : '0';

    res.json({
      total_orders:     orders.length,
      new_orders:       newOrders,
      total_revenue:    totalRevenue,
      total_bookings:   bookings.length,
      pending_bookings: pendingBookings,
      pending_reviews:  pendingReviews,
      unread_messages:  unreadMessages,
      avg_rating:       avgRating
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Статические файлы ───────────────────────────────────────────────────────

app.use(express.static(join(__dirname, 'dist')));

// SPA fallback
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// ─── Запуск ──────────────────────────────────────────────────────────────────

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Сервер «Соль и Перец» запущен`);
  console.log(`   Порт:     ${PORT}`);
  console.log(`   Сайт:     http://localhost:${PORT}`);
  console.log(`   Админка:  http://localhost:${PORT}/admin`);
  console.log(`   Пароль:   ${ADMIN_PASSWORD}`);
  console.log(`   Supabase: ${SUPABASE_URL.substring(0, 35)}...`);
});
