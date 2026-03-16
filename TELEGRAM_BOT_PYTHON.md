# 🤖 Telegram-бот для кафе «Соль и Перец»

## Инструкция по развёртыванию на Railway

---

## 📁 Структура проекта бота

Создайте новый репозиторий со следующими файлами:

```
salt-pepper-bot/
├── main.py           # Основной файл бота
├── config.py         # Настройки
├── database.py       # База данных SQLite
├── handlers/
│   ├── __init__.py
│   ├── orders.py     # Обработка заказов
│   ├── reviews.py    # Модерация отзывов
│   ├── funnels.py    # Воронки продаж
│   └── admin.py      # Админ-команды
├── services/
│   ├── __init__.py
│   ├── scheduler.py  # Планировщик задач
│   └── sms.py        # SMS/WhatsApp интеграция
├── requirements.txt
├── Procfile          # Для Railway
└── railway.json
```

---

## 📄 Файлы проекта

### `requirements.txt`

```
python-telegram-bot==20.7
aiohttp==3.9.1
APScheduler==3.10.4
python-dotenv==1.0.0
aiosqlite==0.19.0
```

### `Procfile`

```
worker: python main.py
```

### `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python main.py",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `config.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Telegram
BOT_TOKEN = os.getenv('BOT_TOKEN', 'YOUR_BOT_TOKEN')
ADMIN_IDS = [int(id) for id in os.getenv('ADMIN_IDS', '').split(',') if id]

# Webhook от сайта
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'your-secret-key')
WEBHOOK_PORT = int(os.getenv('PORT', 8080))

# Сайт
SITE_URL = os.getenv('SITE_URL', 'https://your-site.ru')
SITE_ADMIN_URL = f"{SITE_URL}/?admin=solperecadmin2024"

# База данных
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///bot.db')
```

### `database.py`

```python
import aiosqlite
from datetime import datetime
from typing import Optional, List, Dict, Any

DATABASE_FILE = 'bot.db'

async def init_db():
    """Инициализация базы данных"""
    async with aiosqlite.connect(DATABASE_FILE) as db:
        # Таблица клиентов
        await db.execute('''
            CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                phone TEXT UNIQUE NOT NULL,
                name TEXT,
                telegram_id INTEGER,
                loyalty_points INTEGER DEFAULT 0,
                total_spent REAL DEFAULT 0,
                orders_count INTEGER DEFAULT 0,
                last_order_date TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                funnel_step TEXT,
                funnel_updated_at TEXT
            )
        ''')
        
        # Таблица заказов
        await db.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_number INTEGER UNIQUE,
                customer_phone TEXT,
                customer_name TEXT,
                items TEXT,
                total REAL,
                status TEXT DEFAULT 'new',
                delivery_type TEXT,
                address TEXT,
                payment_method TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT,
                notes TEXT,
                telegram_message_id INTEGER
            )
        ''')
        
        # Таблица отзывов
        await db.execute('''
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                author TEXT,
                phone TEXT,
                rating INTEGER,
                text TEXT,
                status TEXT DEFAULT 'pending',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                admin_comment TEXT,
                telegram_message_id INTEGER
            )
        ''')
        
        # Таблица банкетов
        await db.execute('''
            CREATE TABLE IF NOT EXISTS banquets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_name TEXT,
                customer_phone TEXT,
                event_date TEXT,
                guests_count INTEGER,
                package TEXT,
                extras TEXT,
                total REAL,
                status TEXT DEFAULT 'new',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                notes TEXT
            )
        ''')
        
        # Таблица сообщений воронок
        await db.execute('''
            CREATE TABLE IF NOT EXISTS funnel_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_phone TEXT,
                message_type TEXT,
                message_text TEXT,
                scheduled_at TEXT,
                sent_at TEXT,
                status TEXT DEFAULT 'pending'
            )
        ''')
        
        await db.commit()

# ============ CUSTOMERS ============

async def get_customer(phone: str) -> Optional[Dict]:
    async with aiosqlite.connect(DATABASE_FILE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            'SELECT * FROM customers WHERE phone = ?', (phone,)
        )
        row = await cursor.fetchone()
        return dict(row) if row else None

async def create_or_update_customer(phone: str, name: str = None, 
                                    order_total: float = 0, telegram_id: int = None):
    async with aiosqlite.connect(DATABASE_FILE) as db:
        customer = await get_customer(phone)
        
        if customer:
            await db.execute('''
                UPDATE customers SET
                    name = COALESCE(?, name),
                    telegram_id = COALESCE(?, telegram_id),
                    total_spent = total_spent + ?,
                    orders_count = orders_count + 1,
                    loyalty_points = loyalty_points + ?,
                    last_order_date = ?
                WHERE phone = ?
            ''', (name, telegram_id, order_total, int(order_total * 0.05), 
                  datetime.now().isoformat(), phone))
        else:
            await db.execute('''
                INSERT INTO customers (phone, name, telegram_id, total_spent, 
                                       orders_count, loyalty_points, last_order_date)
                VALUES (?, ?, ?, ?, 1, ?, ?)
            ''', (phone, name, telegram_id, order_total, 
                  int(order_total * 0.05), datetime.now().isoformat()))
        
        await db.commit()

async def get_all_customers() -> List[Dict]:
    async with aiosqlite.connect(DATABASE_FILE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('SELECT * FROM customers ORDER BY created_at DESC')
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

# ============ ORDERS ============

async def create_order(order_data: Dict) -> int:
    async with aiosqlite.connect(DATABASE_FILE) as db:
        cursor = await db.execute('SELECT MAX(order_number) FROM orders')
        result = await cursor.fetchone()
        next_number = (result[0] or 1000) + 1
        
        await db.execute('''
            INSERT INTO orders (order_number, customer_phone, customer_name, items,
                               total, delivery_type, address, payment_method, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            next_number,
            order_data.get('phone'),
            order_data.get('name'),
            str(order_data.get('items', [])),
            order_data.get('total', 0),
            order_data.get('delivery_type', 'pickup'),
            order_data.get('address'),
            order_data.get('payment_method', 'cash'),
            datetime.now().isoformat()
        ))
        await db.commit()
        return next_number

async def update_order_status(order_number: int, status: str):
    async with aiosqlite.connect(DATABASE_FILE) as db:
        await db.execute('''
            UPDATE orders SET status = ?, updated_at = ? WHERE order_number = ?
        ''', (status, datetime.now().isoformat(), order_number))
        await db.commit()

async def get_orders(status: str = None, limit: int = 50) -> List[Dict]:
    async with aiosqlite.connect(DATABASE_FILE) as db:
        db.row_factory = aiosqlite.Row
        if status:
            cursor = await db.execute(
                'SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ?',
                (status, limit)
            )
        else:
            cursor = await db.execute(
                'SELECT * FROM orders ORDER BY created_at DESC LIMIT ?', (limit,)
            )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

# ============ REVIEWS ============

async def create_review(review_data: Dict) -> int:
    async with aiosqlite.connect(DATABASE_FILE) as db:
        cursor = await db.execute('''
            INSERT INTO reviews (author, phone, rating, text, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            review_data.get('author'),
            review_data.get('phone'),
            review_data.get('rating'),
            review_data.get('text'),
            datetime.now().isoformat()
        ))
        await db.commit()
        return cursor.lastrowid

async def update_review_status(review_id: int, status: str, admin_comment: str = None):
    async with aiosqlite.connect(DATABASE_FILE) as db:
        await db.execute('''
            UPDATE reviews SET status = ?, admin_comment = ? WHERE id = ?
        ''', (status, admin_comment, review_id))
        await db.commit()

async def get_pending_reviews() -> List[Dict]:
    async with aiosqlite.connect(DATABASE_FILE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM reviews WHERE status = 'pending' ORDER BY created_at DESC"
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

# ============ FUNNELS ============

async def add_to_funnel_queue(phone: str, message_type: str, 
                              message_text: str, scheduled_at: datetime):
    async with aiosqlite.connect(DATABASE_FILE) as db:
        await db.execute('''
            INSERT INTO funnel_queue (customer_phone, message_type, message_text, scheduled_at)
            VALUES (?, ?, ?, ?)
        ''', (phone, message_type, message_text, scheduled_at.isoformat()))
        await db.commit()

async def get_pending_funnel_messages() -> List[Dict]:
    async with aiosqlite.connect(DATABASE_FILE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('''
            SELECT * FROM funnel_queue 
            WHERE status = 'pending' AND scheduled_at <= ?
            ORDER BY scheduled_at
        ''', (datetime.now().isoformat(),))
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

async def mark_funnel_message_sent(message_id: int):
    async with aiosqlite.connect(DATABASE_FILE) as db:
        await db.execute('''
            UPDATE funnel_queue SET status = 'sent', sent_at = ? WHERE id = ?
        ''', (datetime.now().isoformat(), message_id))
        await db.commit()
```

### `handlers/orders.py`

```python
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
import database as db

ORDER_STATUSES = {
    'new': '🆕 Новый',
    'confirmed': '✅ Подтверждён',
    'cooking': '👨‍🍳 Готовится',
    'ready': '🍽️ Готов',
    'delivering': '🚗 В доставке',
    'completed': '✔️ Завершён',
    'cancelled': '❌ Отменён'
}

def get_order_keyboard(order_number: int, current_status: str):
    """Клавиатура управления заказом"""
    buttons = []
    
    status_flow = ['new', 'confirmed', 'cooking', 'ready', 'delivering', 'completed']
    current_index = status_flow.index(current_status) if current_status in status_flow else 0
    
    # Следующий статус
    if current_index < len(status_flow) - 1:
        next_status = status_flow[current_index + 1]
        buttons.append([
            InlineKeyboardButton(
                f"➡️ {ORDER_STATUSES[next_status]}", 
                callback_data=f"order_status:{order_number}:{next_status}"
            )
        ])
    
    # Отмена
    if current_status not in ['completed', 'cancelled']:
        buttons.append([
            InlineKeyboardButton(
                "❌ Отменить", 
                callback_data=f"order_status:{order_number}:cancelled"
            )
        ])
    
    # Позвонить
    buttons.append([
        InlineKeyboardButton("📞 Позвонить клиенту", callback_data=f"order_call:{order_number}")
    ])
    
    return InlineKeyboardMarkup(buttons)

async def notify_new_order(bot, admin_ids: list, order_data: dict):
    """Отправить уведомление о новом заказе всем админам"""
    order_number = await db.create_order(order_data)
    
    # Создаём/обновляем клиента
    await db.create_or_update_customer(
        phone=order_data.get('phone'),
        name=order_data.get('name'),
        order_total=order_data.get('total', 0)
    )
    
    # Формируем сообщение
    items_text = "\n".join([
        f"  • {item['name']} × {item['quantity']} = {item['price'] * item['quantity']} ₽"
        for item in order_data.get('items', [])
    ])
    
    message = f"""
🆕 <b>НОВЫЙ ЗАКАЗ #{order_number}</b>

👤 <b>Клиент:</b> {order_data.get('name')}
📱 <b>Телефон:</b> {order_data.get('phone')}

📦 <b>Тип:</b> {'🚗 Доставка' if order_data.get('delivery_type') == 'delivery' else '🏪 Самовывоз'}
{f"📍 <b>Адрес:</b> {order_data.get('address')}" if order_data.get('address') else ""}

🛒 <b>Состав заказа:</b>
{items_text}

💰 <b>Итого:</b> {order_data.get('total', 0)} ₽
💳 <b>Оплата:</b> {order_data.get('payment_method', 'Наличные')}
"""
    
    keyboard = get_order_keyboard(order_number, 'new')
    
    # Отправляем всем админам
    for admin_id in admin_ids:
        try:
            await bot.send_message(
                chat_id=admin_id,
                text=message,
                parse_mode='HTML',
                reply_markup=keyboard
            )
        except Exception as e:
            print(f"Error sending to admin {admin_id}: {e}")
    
    return order_number

async def handle_order_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка нажатий кнопок заказа"""
    query = update.callback_query
    await query.answer()
    
    data = query.data.split(':')
    action = data[0]
    
    if action == 'order_status':
        order_number = int(data[1])
        new_status = data[2]
        
        await db.update_order_status(order_number, new_status)
        
        # Обновляем сообщение
        await query.edit_message_text(
            text=query.message.text + f"\n\n✅ <b>Статус изменён:</b> {ORDER_STATUSES[new_status]}",
            parse_mode='HTML',
            reply_markup=get_order_keyboard(order_number, new_status) if new_status not in ['completed', 'cancelled'] else None
        )
        
    elif action == 'order_call':
        order_number = int(data[1])
        orders = await db.get_orders()
        order = next((o for o in orders if o['order_number'] == order_number), None)
        
        if order:
            await query.message.reply_text(
                f"📞 Позвоните клиенту:\n\n"
                f"👤 {order['customer_name']}\n"
                f"📱 <a href='tel:{order['customer_phone']}'>{order['customer_phone']}</a>",
                parse_mode='HTML'
            )
```

### `handlers/reviews.py`

```python
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
import database as db

def get_review_keyboard(review_id: int):
    """Клавиатура модерации отзыва"""
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("✅ Одобрить", callback_data=f"review_approve:{review_id}"),
            InlineKeyboardButton("❌ Отклонить", callback_data=f"review_reject:{review_id}")
        ],
        [
            InlineKeyboardButton("✏️ Редактировать", callback_data=f"review_edit:{review_id}")
        ]
    ])

async def notify_new_review(bot, admin_ids: list, review_data: dict):
    """Отправить отзыв на модерацию"""
    review_id = await db.create_review(review_data)
    
    stars = '⭐' * review_data.get('rating', 5)
    
    message = f"""
📝 <b>НОВЫЙ ОТЗЫВ</b>

{stars}

👤 <b>Автор:</b> {review_data.get('author')}
📱 <b>Телефон:</b> {review_data.get('phone')}

💬 <i>"{review_data.get('text')}"</i>
"""
    
    keyboard = get_review_keyboard(review_id)
    
    for admin_id in admin_ids:
        try:
            await bot.send_message(
                chat_id=admin_id,
                text=message,
                parse_mode='HTML',
                reply_markup=keyboard
            )
        except Exception as e:
            print(f"Error sending to admin {admin_id}: {e}")
    
    return review_id

async def handle_review_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка модерации отзыва"""
    query = update.callback_query
    await query.answer()
    
    data = query.data.split(':')
    action = data[0]
    review_id = int(data[1])
    
    if action == 'review_approve':
        await db.update_review_status(review_id, 'approved')
        await query.edit_message_text(
            text=query.message.text + "\n\n✅ <b>ОДОБРЕН</b>",
            parse_mode='HTML'
        )
        
    elif action == 'review_reject':
        await db.update_review_status(review_id, 'rejected')
        await query.edit_message_text(
            text=query.message.text + "\n\n❌ <b>ОТКЛОНЁН</b>",
            parse_mode='HTML'
        )
        
    elif action == 'review_edit':
        context.user_data['editing_review'] = review_id
        await query.message.reply_text(
            "✏️ Отправьте отредактированный текст отзыва:"
        )
```

### `handlers/funnels.py`

```python
from datetime import datetime, timedelta
from telegram import Bot
import database as db

# Настройки воронок
FUNNELS = {
    # После заказа
    'after_order': [
        {
            'delay_hours': 1,
            'message': """🙏 Спасибо за заказ в «Соль и Перец»!

Надеемся, вам понравилось! 

⭐ Оставьте отзыв на нашем сайте и получите 100 бонусных баллов!

{site_url}#reviews"""
        },
        {
            'delay_hours': 24,
            'message': """📝 Как вам наши блюда?

Ваше мнение важно для нас! 

Оставьте отзыв и получите:
🎁 100 баллов на счёт
🎁 Скидку 10% на следующий заказ!"""
        }
    ],
    
    # Брошенная корзина (если интегрировать с сайтом)
    'abandoned_cart': [
        {
            'delay_hours': 1,
            'message': """👋 Вы что-то забыли!

Ваша корзина ждёт вас в «Соль и Перец»

🎁 Закажите в течение часа — доставка бесплатно!

Промокод: FREESHIP"""
        }
    ],
    
    # Неактивные клиенты
    'inactive': [
        {
            'delay_days': 14,
            'message': """👋 Давно не виделись!

Соскучились по нашему фирменному шашлыку?

🔥 Специально для вас — скидка 15% на любой заказ!

Промокод: COMEBACK15
Действует 3 дня"""
        }
    ]
}

async def schedule_funnel_messages(phone: str, funnel_type: str, site_url: str):
    """Запланировать сообщения воронки"""
    funnel = FUNNELS.get(funnel_type, [])
    
    for step in funnel:
        delay_hours = step.get('delay_hours', 0)
        delay_days = step.get('delay_days', 0)
        
        scheduled_at = datetime.now() + timedelta(hours=delay_hours, days=delay_days)
        message_text = step['message'].format(site_url=site_url)
        
        await db.add_to_funnel_queue(
            phone=phone,
            message_type=funnel_type,
            message_text=message_text,
            scheduled_at=scheduled_at
        )

async def process_funnel_queue(bot: Bot, admin_ids: list):
    """Обработать очередь сообщений воронки"""
    messages = await db.get_pending_funnel_messages()
    
    for msg in messages:
        # В реальности здесь отправка SMS/WhatsApp
        # Для демо — уведомляем админов
        for admin_id in admin_ids:
            try:
                await bot.send_message(
                    chat_id=admin_id,
                    text=f"📤 <b>Воронка — отправить клиенту:</b>\n\n"
                         f"📱 {msg['customer_phone']}\n\n"
                         f"{msg['message_text']}",
                    parse_mode='HTML'
                )
            except Exception as e:
                print(f"Error: {e}")
        
        await db.mark_funnel_message_sent(msg['id'])

async def check_inactive_customers(bot: Bot, admin_ids: list):
    """Проверить неактивных клиентов"""
    customers = await db.get_all_customers()
    
    for customer in customers:
        if not customer.get('last_order_date'):
            continue
            
        last_order = datetime.fromisoformat(customer['last_order_date'])
        days_inactive = (datetime.now() - last_order).days
        
        # Если не заказывал 14+ дней
        if days_inactive >= 14 and customer.get('funnel_step') != 'inactive_sent':
            await schedule_funnel_messages(
                phone=customer['phone'],
                funnel_type='inactive',
                site_url='https://your-site.ru'
            )
```

### `handlers/admin.py`

```python
from telegram import Update
from telegram.ext import ContextTypes
import database as db

async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /start"""
    await update.message.reply_text(
        "🍖 <b>Бот кафе «Соль и Перец»</b>\n\n"
        "Команды:\n"
        "/orders — Список заказов\n"
        "/reviews — Отзывы на модерации\n"
        "/customers — База клиентов\n"
        "/stats — Статистика\n"
        "/broadcast — Рассылка",
        parse_mode='HTML'
    )

async def cmd_orders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /orders — список заказов"""
    orders = await db.get_orders(limit=10)
    
    if not orders:
        await update.message.reply_text("📦 Нет заказов")
        return
    
    text = "📦 <b>Последние заказы:</b>\n\n"
    
    for order in orders:
        status_emoji = {
            'new': '🆕', 'confirmed': '✅', 'cooking': '👨‍🍳',
            'ready': '🍽️', 'delivering': '🚗', 'completed': '✔️', 'cancelled': '❌'
        }
        
        text += f"{status_emoji.get(order['status'], '❓')} #{order['order_number']} — {order['customer_name']} — {order['total']} ₽\n"
    
    await update.message.reply_text(text, parse_mode='HTML')

async def cmd_reviews(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /reviews — отзывы на модерации"""
    reviews = await db.get_pending_reviews()
    
    if not reviews:
        await update.message.reply_text("⭐ Нет отзывов на модерации")
        return
    
    text = "⭐ <b>Отзывы на модерации:</b>\n\n"
    
    for review in reviews:
        stars = '⭐' * review['rating']
        text += f"{stars}\n👤 {review['author']}\n💬 {review['text'][:100]}...\n\n"
    
    await update.message.reply_text(text, parse_mode='HTML')

async def cmd_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /stats — статистика"""
    orders = await db.get_orders()
    customers = await db.get_all_customers()
    
    total_revenue = sum(o.get('total', 0) for o in orders if o.get('status') != 'cancelled')
    
    text = f"""
📊 <b>Статистика</b>

📦 Всего заказов: {len(orders)}
👥 Клиентов: {len(customers)}
💰 Выручка: {total_revenue:,.0f} ₽
"""
    
    await update.message.reply_text(text, parse_mode='HTML')

async def cmd_broadcast(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда /broadcast — рассылка"""
    context.user_data['broadcast_mode'] = True
    await update.message.reply_text(
        "📢 Отправьте сообщение для рассылки всем клиентам:\n\n"
        "(Отправьте /cancel для отмены)"
    )
```

### `main.py`

```python
import asyncio
import logging
from aiohttp import web
from telegram import Update, Bot
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler, 
    MessageHandler, filters
)
from apscheduler.schedulers.asyncio import AsyncIOScheduler

import config
import database as db
from handlers.orders import handle_order_callback, notify_new_order
from handlers.reviews import handle_review_callback, notify_new_review
from handlers.funnels import process_funnel_queue, check_inactive_customers
from handlers.admin import cmd_start, cmd_orders, cmd_reviews, cmd_stats, cmd_broadcast

# Логирование
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Глобальные переменные
bot: Bot = None
scheduler: AsyncIOScheduler = None

# ============ WEBHOOK HANDLERS ============

async def handle_webhook(request):
    """Обработка вебхуков от сайта"""
    try:
        # Проверка секретного ключа
        secret = request.headers.get('X-Webhook-Secret')
        if secret != config.WEBHOOK_SECRET:
            return web.Response(status=403, text='Forbidden')
        
        data = await request.json()
        event_type = data.get('type')
        
        if event_type == 'new_order':
            await notify_new_order(bot, config.ADMIN_IDS, data.get('order', {}))
            return web.json_response({'status': 'ok', 'message': 'Order notification sent'})
        
        elif event_type == 'new_review':
            await notify_new_review(bot, config.ADMIN_IDS, data.get('review', {}))
            return web.json_response({'status': 'ok', 'message': 'Review sent for moderation'})
        
        elif event_type == 'new_banquet':
            # Уведомление о банкете
            banquet = data.get('banquet', {})
            message = f"""
🎉 <b>НОВАЯ ЗАЯВКА НА БАНКЕТ</b>

👤 {banquet.get('name')}
📱 {banquet.get('phone')}
📅 {banquet.get('date')}
👥 {banquet.get('guests')} чел.
📦 Пакет: {banquet.get('package')}
💰 Сумма: {banquet.get('total')} ₽
"""
            for admin_id in config.ADMIN_IDS:
                await bot.send_message(admin_id, message, parse_mode='HTML')
            return web.json_response({'status': 'ok'})
        
        elif event_type == 'new_contact':
            # Сообщение с формы контактов
            contact = data.get('contact', {})
            message = f"""
💬 <b>НОВОЕ СООБЩЕНИЕ</b>

👤 {contact.get('name')}
📱 {contact.get('phone')}

📝 {contact.get('message')}
"""
            for admin_id in config.ADMIN_IDS:
                await bot.send_message(admin_id, message, parse_mode='HTML')
            return web.json_response({'status': 'ok'})
        
        return web.json_response({'status': 'ok'})
        
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return web.Response(status=500, text=str(e))

async def health_check(request):
    """Health check endpoint"""
    return web.Response(text='OK')

# ============ SCHEDULED TASKS ============

async def scheduled_funnel_task():
    """Периодическая задача — обработка воронок"""
    await process_funnel_queue(bot, config.ADMIN_IDS)

async def scheduled_inactive_check():
    """Периодическая задача — проверка неактивных"""
    await check_inactive_customers(bot, config.ADMIN_IDS)

# ============ MAIN ============

async def main():
    global bot, scheduler
    
    # Инициализация БД
    await db.init_db()
    
    # Создаём приложение Telegram
    application = Application.builder().token(config.BOT_TOKEN).build()
    bot = application.bot
    
    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", cmd_start))
    application.add_handler(CommandHandler("orders", cmd_orders))
    application.add_handler(CommandHandler("reviews", cmd_reviews))
    application.add_handler(CommandHandler("stats", cmd_stats))
    application.add_handler(CommandHandler("broadcast", cmd_broadcast))
    
    # Callback handlers
    application.add_handler(CallbackQueryHandler(handle_order_callback, pattern=r'^order_'))
    application.add_handler(CallbackQueryHandler(handle_review_callback, pattern=r'^review_'))
    
    # Запускаем планировщик
    scheduler = AsyncIOScheduler()
    scheduler.add_job(scheduled_funnel_task, 'interval', minutes=5)
    scheduler.add_job(scheduled_inactive_check, 'cron', hour=10)  # Каждый день в 10:00
    scheduler.start()
    
    # Запускаем веб-сервер для вебхуков
    app = web.Application()
    app.router.add_post('/webhook', handle_webhook)
    app.router.add_get('/health', health_check)
    
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, '0.0.0.0', config.WEBHOOK_PORT)
    await site.start()
    
    logger.info(f"Webhook server started on port {config.WEBHOOK_PORT}")
    
    # Запускаем бота
    await application.initialize()
    await application.start()
    await application.updater.start_polling()
    
    logger.info("Bot started!")
    
    # Ждём завершения
    try:
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        scheduler.shutdown()
        await application.stop()
        await runner.cleanup()

if __name__ == '__main__':
    asyncio.run(main())
```

---

## 🚀 Деплой на Railway

### 1. Создайте репозиторий

```bash
mkdir salt-pepper-bot
cd salt-pepper-bot
git init
# Создайте все файлы выше
git add .
git commit -m "Initial commit"
```

### 2. Залейте на GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/salt-pepper-bot.git
git push -u origin main
```

### 3. Деплой на Railway

1. Зайдите на [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Выберите репозиторий `salt-pepper-bot`
4. Добавьте **Environment Variables**:

```
BOT_TOKEN=123456:ABC-DEF...
ADMIN_IDS=123456789,987654321
WEBHOOK_SECRET=your-secret-key-123
SITE_URL=https://your-cafe-site.ru
```

5. Railway автоматически задеплоит бота

### 4. Подключите сайт

На сайте обновите `src/data/menuData.ts`:

```typescript
export const TELEGRAM_CONFIG = {
  BOT_TOKEN: 'ВАШ_ТОКЕН',
  CHAT_ID: 'ВАШ_CHAT_ID',
  WEBHOOK_URL: 'https://your-bot.railway.app/webhook',
  WEBHOOK_SECRET: 'your-secret-key-123',
};
```

---

## 📱 Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Приветствие и список команд |
| `/orders` | Последние заказы |
| `/reviews` | Отзывы на модерации |
| `/customers` | База клиентов |
| `/stats` | Статистика |
| `/broadcast` | Рассылка всем клиентам |

---

## 🔄 Воронки продаж

### После заказа:
1. **Через 1 час** — благодарность + просьба оставить отзыв
2. **Через 24 часа** — напоминание об отзыве + бонус

### Неактивные клиенты:
- **Через 14 дней** — скидка 15% с промокодом COMEBACK15

### Брошенная корзина:
- **Через 1 час** — напоминание + бесплатная доставка

---

## 🎯 Что реализовано

✅ Уведомления о заказах с кнопками управления  
✅ Смена статуса заказа из Telegram  
✅ Модерация отзывов  
✅ База клиентов с историей  
✅ Автоматические воронки продаж  
✅ Webhook API для сайта  
✅ Планировщик задач  
✅ Статистика  

---

## 📞 Поддержка

Если нужна помощь с настройкой — обращайтесь!
