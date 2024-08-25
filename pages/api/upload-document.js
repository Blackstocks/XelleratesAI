import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { startupId, investorId, documentName } = req.body;

    try {
      const { error: transactionError } = await supabase.rpc(
        'handle_document_upload',
        {
          startup_id: startupId,
          investor_id: investorId,
          document_name: documentName,
        }
      );

      if (transactionError) throw transactionError;

      res.status(200).json({
        message: 'Document upload processed successfully. Notification sent.',
      });
    } catch (error) {
      console.error('Error processing document upload:', error);
      res.status(500).json({ error: 'Error processing document upload.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
