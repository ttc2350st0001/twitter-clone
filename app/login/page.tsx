'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) {
      router.push('/')
    }else{
      alert(error.message)
    }

  }

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (!error) {
      router.push('/')
    }else{
      alert(error.message)
    }
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
