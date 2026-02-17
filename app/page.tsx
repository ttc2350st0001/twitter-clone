'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [text, setText] = useState('')
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)

        // await supabase.from('profiles').upsert({
        //   id: data.user.id,
        //   username: data.user.email?.split('@')[0]
        // })
      }
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push('/login')
        }else{
          setUser(session.user)
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  //投稿一覧取得
  const fetchPosts = async () => {
    const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    profiles (
    username,
    avatar_url
    ),
    likes (
    user_id
    )
  `)
  .order('created_at', { ascending: false })
  if (error) {
    console.error("Supabase Error:",error)
    return
  }

  setPosts(data)
  }

  useEffect(() => {
  if (user) {
    fetchPosts()
  }
}, [user])
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  //投稿処理

  const handlePost = async () => {
    if (!user || !text) return
    const {error} = await supabase.from('posts').insert({
      content: text,
      user_id: user.id
    })

    if(error) {
      console.error(error)
      return
    }

    setText('')
    fetchPosts() //投降後に再度取得
  }

  const handleDelete = async (postid: string) => {
    const {error} = await supabase
    .from('posts')
    .delete()
    .eq('id',postid)

    if (error) {
      console.error(error);
      return
    }
      fetchPosts()
  }

  const handleLike = async (post: any) => {
    if (!user) return

    const alreadyLiked  = post.likes.some(
      (like: any) => like.user_id === user.id
    ) ?? false

    if (alreadyLiked) {
      //いいね解除
      await supabase
      .from('likes')
      .delete()
      .eq('post_id',post.id)
      .eq('user_id',user.id)
    }else{
      //いいねする
      await supabase
        .from('likes')
        .insert({
          post_id:post.id,
          user_id:user.id,
        })
    }

    fetchPosts()

  }

  return (
    <div className="bg-black min-h-screen text-white flex">

    {/* 左メニュ＝ */}
    <div className="w-1/4 border-r border-gary-800 p-6 hidden md:block">
      <h1 className="text-2xl font-bold mb-8">Twitter Clone</h1>

      <div className="space-y-6 text-lg">
        <button className="block hover:text-blue-480 transition">
          ホーム
        </button>

        <button
        onClick={() => router.push('/profile')}
        className="block hover:text-blue-400 transition"
        >
          プロフィール
        </button>

        <button
          onClick={handleLogout}
          className="block text-red-500 hover:text-red-400 transition"
        >
          ログアウト
        </button>
      </div>
    </div>

    {/* タイムライン */}
    <div className="w-full md:w-3/4 p-6">
    
      {/* 投稿フォーム */}
      <div className="mb-8 border-b border-gray-800 pb-6">
        <textarea
          placeholder="いま何してる？"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:outline-none focus:border-blue-500"
        />

        <div className="flex justify-end">
          <button
            onClick={handlePost}
            className="mt-3 bg-blue-500 px-5 py-2 rounded-full font-bold hover:bg-blue-600 transition"
          >
            投稿
          </button>
        </div>
      </div>

 {/* 投稿一覧 */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="border border-gray-800 p-4 rounded-xl hover:bg-gray-900 transition"
          >
            <div className="flex items-center gap-3 mb-2">
              {post.profiles?.avatar_url ? (
                <img
                  src={post.profiles.avatar_url}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover"
                  />
              ) : (
                <div className="w-10 h-10 bg-gray-700 rounded-full"/>
              )}

              <strong>{post.profiles?.username}</strong>
            </div>

            <p className="mb-2">{post.content}</p>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              {user?.id === post.user_id && (
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-500 hover:text-red-400"
                >
                  削除
                </button>
              )}

              <button
                onClick={() => handleLike(post)}
                className={`${
                  post.likes?.some(
                    (like: any) => like.user_id === user?.id
                  )
                    ? 'text-red-500'
                    : 'text-gray-400'
                } hover:text-red-400`}
              >
                💛 {post.likes.length ?? 0}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  )
}
