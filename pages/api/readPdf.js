import pdfParse from 'pdf-parse';
import axios from 'axios';

export default async function handler(req, res) {
  const { fileUrl } = req.query;

  if (!fileUrl) {
    return res.status(400).json({ error: 'File URL is required' });
  }

  try {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const data = await pdfParse(response.data);
    const text = data.text;

    return res.status(200).json({"text" : text});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
