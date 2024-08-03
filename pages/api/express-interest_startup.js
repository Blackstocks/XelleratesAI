import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { senderId, receiverId, message, dateTime } = req.body; // senderId and receiverId instead of startupId and investorId

    try {
      const notification_type = 'express_interest';
      const notification_status = 'pending';
      const notification_read_status = 'unread';

      const { data, error } = await supabase.from('notifications').insert([
        {
          sender_id: senderId, // Sender of the notification (investor)
          receiver_id: receiverId, // Receiver of the notification (startup)
          notification_status,
          notification_type,
          notification_message: message,
          notification_read_status,
          available_time_slots: dateTime, // Array of time slots
        },
      ]);

      if (error) {
        console.error('Error sending interest notification:', error);
        res.status(500).json({ error: error.message });
      } else {
        console.log('Interest notification sent:', data);
        res.status(200).json({ message: 'Notification sent successfully' });
      }
    } catch (error) {
      console.error('Unexpected error sending interest notification:', error);
      res.status(500).json({ error: 'Unexpected error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
