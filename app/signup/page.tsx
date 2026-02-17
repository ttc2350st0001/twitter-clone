'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSignup = async () => {
    try {
      setLoading(true)
      setErrorMsg('')

      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      router.push('/')
    } catch (error: any) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-gray-800 rounded-2xl p-8">

        <h1 className="text-2xl font-bold text-white mb-8 text-center">
          新規登録
        </h1>

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 mb-4 focus:outline-none focus:border-blue-500"
        />

        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 mb-4 focus:outline-none focus:border-blue-500"
        />

        {errorMsg && (
          <p className="text-red-500 text-sm mb-4">
            {errorMsg}
          </p>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full py-3 rounded-full font-bold transition flex items-center justify-center ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            '登録'
          )}
        </button>

        <p className="text-center text-gray-400 text-sm mt-6">
          すでにアカウントをお持ちですか？
          <span
            onClick={() => router.push('/login')}
            className="text-blue-500 hover:text-blue-400 cursor-pointer ml-2"
          >
            ログイン
          </span>
        </p>

      </div>
    </div>
  )
}
