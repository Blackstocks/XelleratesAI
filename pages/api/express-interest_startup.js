import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { senderId, receiverId, message, dateTime } = req.body;

    try {
      // Generate a unique room ID
      const roomId = `${senderId}_${receiverId}_${Date.now()}`;

      // Insert into the meeting_rooms table
      const { data: meetingData, error: meetingError } = await supabase
        .from('meeting_rooms')
        .insert([
          {
            room_id: roomId,
            sender_id: senderId,
            receiver_id: receiverId,
            message,
            available_time_slots: dateTime,
          },
        ]);

      if (meetingError) {
        console.error('Error creating meeting room:', meetingError);
        return res.status(500).json({ error: meetingError.message });
      }

      // Insert into the notifications table
      const notification_type = 'express_interest';
      const notification_status = 'pending';
      const notification_read_status = 'unread';

      const { data: notificationData, error: notificationError } =
        await supabase.from('notifications').insert([
          {
            sender_id: senderId,
            receiver_id: receiverId,
            notification_status,
            notification_type,
            notification_message: message,
            notification_read_status,
            available_time_slots: dateTime,
            room_id: roomId,
          },
        ]);

      if (notificationError) {
        console.error(
          'Error sending interest notification:',
          notificationError
        );
        return res.status(500).json({ error: notificationError.message });
      }

      res
        .status(200)
        .json({
          message: 'Meeting room and notification created successfully',
          roomId,
        });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Unexpected error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
