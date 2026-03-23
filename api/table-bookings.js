import supabase from './_supabase.js';

// Возвращает занятые столы на конкретную дату
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    try {
      const { date } = req.query;
      let query = supabase
        .from('bookings_v2')
        .select('id, table_number, event_date, event_time, status, customer_name, guests_count')
        .not('table_number', 'is', null)
        .not('status', 'eq', 'cancelled');
      if (date) query = query.eq('event_date', date);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  res.status(405).json({ error: 'Method not allowed' });
}
