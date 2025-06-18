// pages/api/set-role.ts

import { clerkClient } from '@clerk/nextjs/server';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ error: 'Missing userId or role' });
  }

  try {
    const user = await clerkClient();
    await user.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    res.status(200).json({ message: 'Role set successfully' });
  } catch (error) {
    console.error('Failed to update role:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
