import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const [orders, bookings, reviews, messages] = await Promise.all([
      supabase.from('orders').select('id, status, total_price, created_at'),
      supabase.from('table_bookings').select('id, status, created_at'),
      supabase.from('reviews').select('id, is_approved, rating'),
      supabase.from('contact_messages').select('id, is_read')
    ]);

    const totalRevenue = (orders.data || []).filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total_price || 0), 0);
    const newOrders = (orders.data || []).filter(o => o.status === 'new').length;
    const pendingBookings = (bookings.data || []).filter(b => b.status === 'new').length;
    const pendingReviews = (reviews.data || []).filter(r => !r.is_approved).length;
    const unreadMessages = (messages.data || []).filter(m => !m.is_read).length;
    const avgRating = (reviews.data || []).filter(r => r.is_approved).reduce((s, r, _, a) => s + r.rating / a.length, 0);

    return res.status(200).json({
      total_orders: (orders.data || []).length,
      new_orders: newOrders,
      total_revenue: totalRevenue,
      total_bookings: (bookings.data || []).length,
      pending_bookings: pendingBookings,
      pending_reviews: pendingReviews,
      unread_messages: unreadMessages,
      avg_rating: avgRating.toFixed(1)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
