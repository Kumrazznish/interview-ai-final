import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Example Response (Replace with Gemini API Call)
  res.status(200).json({ message: "Gemini API is working!" });
}
