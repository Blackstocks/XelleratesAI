import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  const { data: user, error: authError } = await supabase.auth.getUser();

  console.log(user);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !data || data.role !== 'super_admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.status(200).json({ message: 'Authorized' });
}
