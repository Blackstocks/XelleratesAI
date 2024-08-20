import { supabase } from '@/lib/supabaseclient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { investorId, startupId, documents } = req.body; // Updated to receive `documents` array
    console.log('Requesting documents:', documents);
    console.log('Investor ID:', investorId);
    console.log('Startup ID:', startupId);

    try {
      // Ensure documents is an array
      if (!Array.isArray(documents)) {
        throw new Error('documents should be an array');
      }

      for (const document of documents) {
        const { label: documentLabel, value: documentValue } = document;

        const { error: transactionError } = await supabase.rpc(
          'handle_document_request',
          {
            investor_id: investorId,
            startup_id: startupId, // Ensure startupId is passed correctly
            document_label: documentLabel, // Pass document label
            document_value: documentValue, // Pass document value
          }
        );

        if (transactionError) throw transactionError;
      }

      res.status(200).json({
        message: 'Document requests and notifications processed successfully',
      });
    } catch (error) {
      console.error(
        'Error processing document requests and notifications:',
        error
      );
      res.status(500).json({
        error: 'Error processing document requests and notifications',
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
