// pages/api/meetings.js
import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  try {
    // Step 1: Fetch all events
    const { data: events, error: eventError } = await supabase
      .from('events')
      .select('*');

    if (eventError) throw new Error('Error fetching events:', eventError);

    // Step 2: Fetch receiver details from investor_signup
    const receiverIds = events.map((event) => event.receiver_id);
    const { data: receivers, error: receiverError } = await supabase
      .from('investor_signup')
      .select('name, profile_id')
      .in('profile_id', receiverIds);

    if (receiverError)
      throw new Error('Error fetching receiver details:', receiverError);

    // Step 3: Fetch sender details from company_profile
    const senderIds = events.map((event) => event.sender_id);
    const { data: senders, error: senderError } = await supabase
      .from('company_profile')
      .select('company_name, id')
      .in('id', senderIds);

    if (senderError)
      throw new Error('Error fetching sender details:', senderError);

    // Combine the data
    const combinedData = events.map((event) => {
      const receiver = receivers.find(
        (r) => r.profile_id === event.receiver_id
      );
      const sender = senders.find((s) => s.id === event.sender_id);
      return {
        ...event,
        receiver_name: receiver?.name || 'Unknown',
        sender_company_name: sender?.company_name || 'Unknown',
      };
    });

    res.status(200).json(combinedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
