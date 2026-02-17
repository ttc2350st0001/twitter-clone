'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
      }

      router.push('/') //ログイン成功後

    }

  

  // const handleSignup = async () => {
  //   const { error } = await supabase.auth.signUp({
  //     email,
  //     password,
  //   })

  //   if (!error) {
  //     router.push('/')
  //   }else{
  //     alert(error.message)
  //   }
  // }

 return (
  <div className="min-h-screen bg-black flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-black border border-gray-800 rounded-2xl p-8">
{/* <div className="flex justify-center mb-6">
  <img
    src="/logo.jpg"
    alt="logo"
    className="w-24 h-24 object-contain"
  />
</div> */}

      <h1 className="text-2xl font-bold text-white mb-8 text-center">
        ログイン
      </h1>

      <form onSubmit={handleLogin}>

      {/* メール */}
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 mb-4 focus:outline-none focus:border-blue-500"
      />

      {/* パスワード */}
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 mb-6 focus:outline-none focus:border-blue-500"
      />

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-900/30 p-3 rounded-lg">
          {error}
          </div>
      )}

      {/* ログインボタン */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 py-3 rounded-full font-bold text-white hover:bg-blue-600 transition"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>

      </form>

      {/* 新規登録 */}
      <p className="text-center text-gray-400 text-sm mt-6">
        アカウントをお持ちでないですか？
        <span
          onClick={() => router.push('/signup')}
          className="text-blue-500 hover:text-blue-400 cursor-pointer ml-2"
        >
          新規登録
        </span>
      </p>

    </div>
  </div>
)
}
