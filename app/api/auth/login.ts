// /api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/utils/supabase/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email, password } = req.body
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return res.status(401).json({ error: error.message })

  // JWT は Supabase が自動発行。クライアントで supabase.auth.getSession() で取得可
  res.status(200).json({ access_token: data.session?.access_token })
}
