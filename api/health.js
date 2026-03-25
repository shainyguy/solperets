import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // Проверяем подключение к БД
    const { data, error, count } = await supabase
      .from('menu_items')
      .select('id', { count: 'exact' })
      .limit(1);

    if (error) throw error;

    return res.status(200).json({
      status: 'ok',
      db_connected: true,
      menu_items_count: count,
      env: {
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        admin_password_set: !!process.env.ADMIN_PASSWORD,
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      db_connected: false,
      error: err.message,
      env: {
        supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    });
  }
}
