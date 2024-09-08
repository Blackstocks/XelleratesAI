// pages/api/generateJwt.js
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  const { userId } = req.body; // Assume the user ID is sent in the request body

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  // Generate a JWT token using your secret key
  const token = jwt.sign(
    { userId },
    process.env.NEXT_PUBLIC_JWT_SECRET, // Use environment variable for secret
    { expiresIn: '10m' }
  );

  return res.status(200).json({ token });
}
