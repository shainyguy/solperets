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

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL    || 'https://qwrkejlsxzdtoyesxwad.supabase.co';
const SUPABASE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY   || 'sb_publishable_ov1c0f7V1dnNsr9YHJ26pw_K9nccjAZ';
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

// ─── /api/table-bookings ─────────────────────────────────────────────────────

app.get('/api/table-bookings', async (req, res) => {
  try {
    const { date } = req.query;
    let query = supabase.from('bookings_v2')
      .select('id, table_number, event_date, event_time, status, customer_name, guests_count')
      .neq('status', 'cancelled');
    if (date) query = query.eq('event_date', date);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── /api/bookings ───────────────────────────────────────────────────────────

app.get('/api/bookings', async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('bookings_v2').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const body = req.body;
    const { data, error } = await supabase.from('bookings_v2').insert({
      table_number:   body.table_number || null,
      customer_name:  body.customer_name,
      customer_phone: body.customer_phone,
      customer_email: body.customer_email || null,
      event_type:     body.event_type || null,
      occasion:       body.occasion || null,
      package_key:    body.package_key || null,
      event_date:     body.event_date,
      event_time:     body.event_time || '18:00',
      guests_count:   body.guests_count,
      extra_services: body.extra_services || [],
      total_estimate: body.total_estimate || 0,
      comment:        body.comment || null,
      status:         'new',
    }).select().single();
    if (error) throw error;

    const services = (data.extra_services || []).join(', ') || 'нет';
    await sendTelegram(
      `📅 НОВОЕ БРОНИРОВАНИЕ #${data.id}\n\n` +
      `👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
      `📧 ${data.customer_email || 'не указан'}\n` +
      `🎭 Повод: ${data.event_type}\n` +
      `📦 Пакет: ${data.package_type || 'не выбран'}\n` +
      `🪑 Стол: ${data.table_number || 'не выбран'}\n` +
      `📆 ${data.event_date} в ${data.event_time}\n` +
      `👥 ${data.guests_count} гостей\n🎉 Доп. услуги: ${services}\n` +
      `💰 ~${(data.total_estimate || 0).toLocaleString('ru-RU')}₽\n💬 ${data.comment || 'Без комментария'}`
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
      .from('bookings_v2').update(upd).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/bookings', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('bookings_v2').delete().eq('id', id);
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

// ─── /api/table-reservations ─────────────────────────────────────────────────

app.get('/api/table-reservations', async (req, res) => {
  try {
    const { date } = req.query;
    let query = supabase.from('table_reservations').select('*').order('created_at', { ascending: false });
    if (date) query = query.eq('reservation_date', date);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/table-reservations', async (req, res) => {
  try {
    const body = req.body;
    if (!body.table_number || !body.customer_name || !body.customer_phone || !body.guests_count || !body.reservation_date || !body.reservation_time)
      return res.status(400).json({ error: 'Заполните все обязательные поля' });

    const { data: existing } = await supabase.from('table_reservations').select('id')
      .eq('table_number', body.table_number).eq('reservation_date', body.reservation_date)
      .eq('reservation_time', body.reservation_time).neq('status', 'cancelled').limit(1);
    if (existing && existing.length > 0)
      return res.status(409).json({ error: 'Этот стол уже забронирован на выбранное время' });

    const { data, error } = await supabase.from('table_reservations').insert({
      table_number:     body.table_number,
      zone:             body.zone || '',
      customer_name:    body.customer_name,
      customer_phone:   body.customer_phone,
      guests_count:     body.guests_count,
      reservation_date: body.reservation_date,
      reservation_time: body.reservation_time,
      comment:          body.comment || null,
      status:           'new'
    }).select().single();
    if (error) throw error;

    await sendTelegram(
      `🪑 БРОНЬ СТОЛА #${data.id}\n\n` +
      `🔢 Стол №${data.table_number}${data.zone ? ` (зона ${data.zone})` : ''}\n` +
      `👤 ${data.customer_name}\n📞 ${data.customer_phone}\n` +
      `👥 Гостей: ${data.guests_count}\n` +
      `📅 ${data.reservation_date} в ${data.reservation_time}\n` +
      `💬 ${data.comment || 'Без комментария'}\n` +
      `🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
    );
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/table-reservations', async (req, res) => {
  try {
    const { id, status, admin_comment } = req.body;
    const upd = {};
    if (status !== undefined)        upd.status = status;
    if (admin_comment !== undefined) upd.admin_comment = admin_comment;
    const { data, error } = await supabase.from('table_reservations').update(upd).eq('id', id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/table-reservations', async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('table_reservations').delete().eq('id', id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Статика ─────────────────────────────────────────────────────────────────
app.use(express.static(join(__dirname, 'dist')));
app.use((req, res) => { res.sendFile(join(__dirname, 'dist', 'index.html')); });
app.listen(PORT, '0.0.0.0', () => {
  console.log('✅ Сервер запущен на порту ' + PORT);
  console.log('   Сайт: http://localhost:' + PORT);
  console.log('   Пароль: ' + ADMIN_PASSWORD);
});
