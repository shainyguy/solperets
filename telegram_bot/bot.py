"""
Telegram-бот для кафе "Соль и Перец"
Воронки продаж, уведомления, CRM

Для запуска на Railway:
1. Создайте новый проект на railway.app
2. Подключите этот репозиторий
3. Добавьте переменные окружения (см. ниже)
4. Деплой произойдёт автоматически
"""

import os
import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    MessageHandler,
    filters,
    ContextTypes,
)

# ========================================
# НАСТРОЙКИ (переменные окружения)
# ========================================

BOT_TOKEN = os.getenv("BOT_TOKEN", "YOUR_BOT_TOKEN")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "YOUR_CHAT_ID")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")  # Для Railway

# Логирование
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ========================================
# БАЗА ДАННЫХ (in-memory, для продакшена используйте Redis/PostgreSQL)
# ========================================

# Хранилище данных
orders: Dict[str, dict] = {}
customers: Dict[str, dict] = {}
reviews: Dict[str, dict] = {}
funnels: Dict[str, dict] = {}

# ========================================
# ВОРОНКИ ПРОДАЖ
# ========================================

FUNNEL_TEMPLATES = {
    "welcome": {
        "name": "Приветствие",
        "steps": [
            {"delay": 0, "message": "🎉 Добро пожаловать в кафе «Соль и Перец»!\n\nМы рады, что вы с нами!"},
            {"delay": 3600, "message": "🍖 Кстати, у нас сегодня акция на шашлык! Скидка 15% по промокоду WELCOME"},
        ]
    },
    "abandoned_cart": {
        "name": "Брошенная корзина",
        "steps": [
            {"delay": 1800, "message": "👋 Вы забыли завершить заказ!\n\nВаша корзина ждёт вас. Промокод CART10 — скидка 10%"},
            {"delay": 86400, "message": "🔥 Последний шанс! Промокод LASTCHANCE — скидка 15% только сегодня!"},
        ]
    },
    "after_order": {
        "name": "После заказа",
        "steps": [
            {"delay": 7200, "message": "😊 Как вам наш шашлык?\n\nБудем рады вашему отзыву! Напишите нам."},
            {"delay": 604800, "message": "🎁 Скучаем по вам! Вот промокод COMEBACK — скидка 20% на следующий заказ."},
        ]
    },
    "birthday": {
        "name": "День рождения",
        "steps": [
            {"delay": 0, "message": "🎂 С Днём рождения!\n\nДарим вам скидку 25% на любой заказ! Промокод: BIRTHDAY25"},
        ]
    },
}

# ========================================
# КОМАНДЫ БОТА
# ========================================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Приветствие нового пользователя"""
    user = update.effective_user
    
    # Сохраняем клиента
    customers[str(user.id)] = {
        "id": user.id,
        "name": user.full_name,
        "username": user.username,
        "joined": datetime.now().isoformat(),
        "orders_count": 0,
    }
    
    keyboard = [
        [InlineKeyboardButton("📋 Меню", callback_data="menu")],
        [InlineKeyboardButton("📞 Контакты", callback_data="contacts")],
        [InlineKeyboardButton("🎉 Забронировать стол", callback_data="booking")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        f"🍖 Добро пожаловать в кафе «Соль и Перец», {user.first_name}!\n\n"
        "Мы готовим настоящий шашлык на живом огне рядом с МЦД Сходня.\n\n"
        "🚚 Бесплатная доставка по Сходне!\n\n"
        "Выберите действие:",
        reply_markup=reply_markup
    )
    
    # Запускаем воронку приветствия
    await start_funnel(user.id, "welcome", context)


async def admin(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Админ-панель"""
    user = update.effective_user
    
    if str(user.id) != ADMIN_CHAT_ID:
        await update.message.reply_text("❌ Доступ запрещён")
        return
    
    keyboard = [
        [InlineKeyboardButton("📦 Заказы", callback_data="admin_orders")],
        [InlineKeyboardButton("⭐ Отзывы", callback_data="admin_reviews")],
        [InlineKeyboardButton("👥 Клиенты", callback_data="admin_customers")],
        [InlineKeyboardButton("📊 Статистика", callback_data="admin_stats")],
        [InlineKeyboardButton("📢 Рассылка", callback_data="admin_broadcast")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "🔐 *Админ-панель*\n\n"
        f"📦 Заказов: {len(orders)}\n"
        f"⭐ Отзывов: {len(reviews)}\n"
        f"👥 Клиентов: {len(customers)}\n",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )


async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Статистика для админа"""
    if str(update.effective_user.id) != ADMIN_CHAT_ID:
        return
    
    total_revenue = sum(o.get("total", 0) for o in orders.values())
    avg_rating = sum(r.get("rating", 0) for r in reviews.values()) / max(len(reviews), 1)
    
    await update.message.reply_text(
        "📊 *Статистика*\n\n"
        f"📦 Всего заказов: {len(orders)}\n"
        f"💰 Выручка: {total_revenue:,.0f} ₽\n"
        f"👥 Клиентов: {len(customers)}\n"
        f"⭐ Средний рейтинг: {avg_rating:.1f}/5\n"
        f"📝 Отзывов: {len(reviews)}\n",
        parse_mode="Markdown"
    )


# ========================================
# ОБРАБОТКА CALLBACK
# ========================================

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка нажатий на кнопки"""
    query = update.callback_query
    await query.answer()
    
    data = query.data
    
    if data == "menu":
        await query.edit_message_text(
            "📋 *Наше меню*\n\n"
            "🔥 Шашлык — от 500 ₽\n"
            "🍖 Садж — от 700 ₽\n"
            "🥗 Салаты — от 425 ₽\n"
            "🍲 Супы — от 400 ₽\n\n"
            "📱 Полное меню на сайте: sol-perec.ru/menu",
            parse_mode="Markdown"
        )
    
    elif data == "contacts":
        await query.edit_message_text(
            "📍 *Контакты*\n\n"
            "🏠 г. Химки, мкр. Сходня\n"
            "📞 +7 (999) 123-45-67\n"
            "🕐 Ежедневно 11:00 - 23:00\n\n"
            "🚚 Доставка по Сходне — БЕСПЛАТНО!",
            parse_mode="Markdown"
        )
    
    elif data == "booking":
        await query.edit_message_text(
            "🎉 *Бронирование*\n\n"
            "Для бронирования столика или банкета позвоните:\n"
            "📞 +7 (999) 123-45-67\n\n"
            "Или напишите нам прямо здесь — мы перезвоним!"
        )
    
    elif data.startswith("admin_"):
        await handle_admin_callback(query, data, context)
    
    elif data.startswith("order_"):
        await handle_order_callback(query, data, context)
    
    elif data.startswith("review_"):
        await handle_review_callback(query, data, context)


async def handle_admin_callback(query, data: str, context: ContextTypes.DEFAULT_TYPE):
    """Обработка админских действий"""
    if data == "admin_orders":
        pending = [o for o in orders.values() if o.get("status") == "pending"]
        text = "📦 *Новые заказы*\n\n"
        
        if not pending:
            text += "Нет новых заказов"
        else:
            for order in pending[:5]:
                text += f"#{order['id'][:8]} — {order['total']} ₽\n"
        
        await query.edit_message_text(text, parse_mode="Markdown")
    
    elif data == "admin_reviews":
        pending = [r for r in reviews.values() if r.get("status") == "pending"]
        text = "⭐ *Отзывы на модерации*\n\n"
        
        if not pending:
            text += "Нет отзывов на модерации"
        else:
            for review in pending[:5]:
                text += f"{'⭐' * review['rating']} — {review['name']}\n"
        
        await query.edit_message_text(text, parse_mode="Markdown")
    
    elif data == "admin_customers":
        text = f"👥 *Клиенты* ({len(customers)})\n\n"
        for customer in list(customers.values())[:10]:
            text += f"• {customer['name']} — {customer['orders_count']} заказов\n"
        
        await query.edit_message_text(text, parse_mode="Markdown")
    
    elif data == "admin_stats":
        total = sum(o.get("total", 0) for o in orders.values())
        await query.edit_message_text(
            f"📊 *Статистика*\n\n"
            f"💰 Выручка: {total:,.0f} ₽\n"
            f"📦 Заказов: {len(orders)}\n"
            f"👥 Клиентов: {len(customers)}\n",
            parse_mode="Markdown"
        )


async def handle_order_callback(query, data: str, context: ContextTypes.DEFAULT_TYPE):
    """Обработка действий с заказами"""
    parts = data.split("_")
    action = parts[1]
    order_id = parts[2] if len(parts) > 2 else None
    
    if action == "confirm" and order_id:
        if order_id in orders:
            orders[order_id]["status"] = "confirmed"
            await query.edit_message_text(f"✅ Заказ #{order_id[:8]} подтверждён!")
    
    elif action == "cancel" and order_id:
        if order_id in orders:
            orders[order_id]["status"] = "cancelled"
            await query.edit_message_text(f"❌ Заказ #{order_id[:8]} отменён")


async def handle_review_callback(query, data: str, context: ContextTypes.DEFAULT_TYPE):
    """Обработка действий с отзывами"""
    parts = data.split("_")
    action = parts[1]
    review_id = parts[2] if len(parts) > 2 else None
    
    if action == "approve" and review_id:
        if review_id in reviews:
            reviews[review_id]["status"] = "approved"
            await query.edit_message_text(f"✅ Отзыв одобрен!")
    
    elif action == "reject" and review_id:
        if review_id in reviews:
            reviews[review_id]["status"] = "rejected"
            await query.edit_message_text(f"❌ Отзыв отклонён")


# ========================================
# ВОРОНКИ ПРОДАЖ
# ========================================

async def start_funnel(user_id: int, funnel_type: str, context: ContextTypes.DEFAULT_TYPE):
    """Запуск воронки продаж"""
    funnel = FUNNEL_TEMPLATES.get(funnel_type)
    if not funnel:
        return
    
    funnel_id = f"{user_id}_{funnel_type}_{datetime.now().timestamp()}"
    funnels[funnel_id] = {
        "user_id": user_id,
        "type": funnel_type,
        "started": datetime.now().isoformat(),
        "step": 0,
    }
    
    # Запускаем первый шаг
    for i, step in enumerate(funnel["steps"]):
        delay = step["delay"]
        message = step["message"]
        
        # Планируем отправку
        context.job_queue.run_once(
            send_funnel_message,
            when=delay,
            data={"user_id": user_id, "message": message, "funnel_id": funnel_id}
        )


async def send_funnel_message(context: ContextTypes.DEFAULT_TYPE):
    """Отправка сообщения воронки"""
    job = context.job
    data = job.data
    
    try:
        await context.bot.send_message(
            chat_id=data["user_id"],
            text=data["message"]
        )
    except Exception as e:
        logger.error(f"Failed to send funnel message: {e}")


# ========================================
# WEBHOOK для приёма данных с сайта
# ========================================

async def process_webhook(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка вебхука с сайта"""
    if not update.message or not update.message.text:
        return
    
    try:
        data = json.loads(update.message.text)
        event_type = data.get("type")
        
        if event_type == "new_order":
            await process_new_order(data, context)
        elif event_type == "new_review":
            await process_new_review(data, context)
        elif event_type == "new_booking":
            await process_new_booking(data, context)
        elif event_type == "contact_message":
            await process_contact_message(data, context)
    except json.JSONDecodeError:
        pass


async def process_new_order(data: dict, context: ContextTypes.DEFAULT_TYPE):
    """Обработка нового заказа"""
    order_id = data.get("order_id", str(datetime.now().timestamp()))
    orders[order_id] = {
        "id": order_id,
        "customer": data.get("customer", {}),
        "items": data.get("items", []),
        "total": data.get("total", 0),
        "status": "pending",
        "created": datetime.now().isoformat(),
    }
    
    # Формируем сообщение
    items_text = "\n".join([f"• {i['name']} × {i['quantity']}" for i in data.get("items", [])])
    customer = data.get("customer", {})
    
    keyboard = [
        [
            InlineKeyboardButton("✅ Подтвердить", callback_data=f"order_confirm_{order_id}"),
            InlineKeyboardButton("❌ Отменить", callback_data=f"order_cancel_{order_id}"),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await context.bot.send_message(
        chat_id=ADMIN_CHAT_ID,
        text=f"🛒 *НОВЫЙ ЗАКАЗ* #{order_id[:8]}\n\n"
             f"👤 {customer.get('name', 'Не указано')}\n"
             f"📞 {customer.get('phone', 'Не указано')}\n"
             f"📍 {customer.get('address', 'Самовывоз')}\n\n"
             f"{items_text}\n\n"
             f"💰 *Итого: {data.get('total', 0):,} ₽*",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )


async def process_new_review(data: dict, context: ContextTypes.DEFAULT_TYPE):
    """Обработка нового отзыва"""
    review_id = str(datetime.now().timestamp())
    reviews[review_id] = {
        "id": review_id,
        "name": data.get("name", "Аноним"),
        "rating": data.get("rating", 5),
        "text": data.get("text", ""),
        "status": "pending",
        "created": datetime.now().isoformat(),
    }
    
    keyboard = [
        [
            InlineKeyboardButton("✅ Одобрить", callback_data=f"review_approve_{review_id}"),
            InlineKeyboardButton("❌ Отклонить", callback_data=f"review_reject_{review_id}"),
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await context.bot.send_message(
        chat_id=ADMIN_CHAT_ID,
        text=f"⭐ *НОВЫЙ ОТЗЫВ*\n\n"
             f"👤 {data.get('name', 'Аноним')}\n"
             f"{'⭐' * data.get('rating', 5)}\n\n"
             f"\"{data.get('text', '')}\"",
        reply_markup=reply_markup,
        parse_mode="Markdown"
    )


async def process_new_booking(data: dict, context: ContextTypes.DEFAULT_TYPE):
    """Обработка заявки на банкет"""
    await context.bot.send_message(
        chat_id=ADMIN_CHAT_ID,
        text=f"🎉 *ЗАЯВКА НА БАНКЕТ*\n\n"
             f"👤 {data.get('name', 'Не указано')}\n"
             f"📞 {data.get('phone', 'Не указано')}\n"
             f"📅 {data.get('date', 'Не указано')}\n"
             f"👥 Гостей: {data.get('guests', 'Не указано')}\n"
             f"📦 Пакет: {data.get('package', 'Не указано')}\n\n"
             f"💰 Сумма: {data.get('total', 0):,} ₽\n\n"
             f"💬 {data.get('comment', '')}",
        parse_mode="Markdown"
    )


async def process_contact_message(data: dict, context: ContextTypes.DEFAULT_TYPE):
    """Обработка сообщения с формы контактов"""
    await context.bot.send_message(
        chat_id=ADMIN_CHAT_ID,
        text=f"📩 *СООБЩЕНИЕ С САЙТА*\n\n"
             f"👤 {data.get('name', 'Не указано')}\n"
             f"📞 {data.get('phone', 'Не указано')}\n\n"
             f"💬 {data.get('message', '')}",
        parse_mode="Markdown"
    )


# ========================================
# АВТОМАТИЧЕСКИЕ РАССЫЛКИ
# ========================================

async def daily_report(context: ContextTypes.DEFAULT_TYPE):
    """Ежедневный отчёт"""
    today = datetime.now().date().isoformat()
    today_orders = [o for o in orders.values() if o["created"].startswith(today)]
    today_revenue = sum(o.get("total", 0) for o in today_orders)
    
    await context.bot.send_message(
        chat_id=ADMIN_CHAT_ID,
        text=f"📊 *Отчёт за {today}*\n\n"
             f"📦 Заказов: {len(today_orders)}\n"
             f"💰 Выручка: {today_revenue:,} ₽\n"
             f"👥 Новых клиентов: {len([c for c in customers.values() if c['joined'].startswith(today)])}",
        parse_mode="Markdown"
    )


# ========================================
# ЗАПУСК БОТА
# ========================================

def main():
    """Запуск бота"""
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Команды
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("admin", admin))
    application.add_handler(CommandHandler("stats", stats))
    
    # Callback кнопки
    application.add_handler(CallbackQueryHandler(button_callback))
    
    # Сообщения (для вебхука)
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, process_webhook))
    
    # Ежедневный отчёт в 21:00
    application.job_queue.run_daily(
        daily_report,
        time=datetime.strptime("21:00", "%H:%M").time()
    )
    
    # Запуск
    if WEBHOOK_URL:
        # Режим webhook (для Railway)
        application.run_webhook(
            listen="0.0.0.0",
            port=int(os.getenv("PORT", 8443)),
            webhook_url=WEBHOOK_URL
        )
    else:
        # Режим polling (для локальной разработки)
        application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
