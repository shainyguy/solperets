import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { date } = req.query;
      let query = supabase
        .from('table_bookings')
        .select('id, table_number, event_date, event_time, guests_count, status, customer_name')
        .neq('status', 'cancelled');
      if (date) query = query.eq('event_date', date);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Table bookings error:', err);
    res.status(500).json({ error: err.message });
  }
}
