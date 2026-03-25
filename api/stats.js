import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const [orders, bookings, reviews, messages] = await Promise.all([
      supabase.from('orders').select('id, status, total_price'),
      supabase.from('bookings_v2').select('id, status'),
      supabase.from('reviews').select('id, is_approved, rating'),
      supabase.from('contact_messages').select('id, is_read')
    ]);

    const o = orders.data || [];
    const b = bookings.data || [];
    const r = reviews.data || [];
    const m = messages.data || [];

    const totalRevenue    = o.filter(x => x.status !== 'cancelled').reduce((s, x) => s + Number(x.total_price || 0), 0);
    const newOrders       = o.filter(x => x.status === 'new').length;
    const pendingBookings = b.filter(x => x.status === 'new').length;
    const pendingReviews  = r.filter(x => !x.is_approved).length;
    const unreadMessages  = m.filter(x => !x.is_read).length;
    const approved        = r.filter(x => x.is_approved);
    const avgRating       = approved.length
      ? (approved.reduce((s, x) => s + x.rating, 0) / approved.length).toFixed(1)
      : '0';

    return res.status(200).json({
      total_orders: o.length, new_orders: newOrders,
      total_revenue: totalRevenue,
      total_bookings: b.length, pending_bookings: pendingBookings,
      pending_reviews: pendingReviews,
      unread_messages: unreadMessages,
      avg_rating: avgRating
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
