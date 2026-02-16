'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const handleSignup = async () => {
    await supabase.auth.signUp({
      email,
      password,
    })
  }

  return (
    <div>
      <h2>ログイン</h2>

      <input
        type="email"
        placeholder="メール"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="パスワード"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>ログイン</button>
      <button onClick={handleSignup}>新規登録</button>
    </div>
  )
}
