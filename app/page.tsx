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
    <div className="bg-black min-h-screen text-white p-10">
      <h1>トップページ</h1>
      {user && (
        <>
        <p>ログイン中: {user.email}</p>
        <button onClick={() => router.push('/profile')}>
          プロフィール編集
        </button>

        {/*投稿フォーム */}
        <div>
          <textarea
            placeholder="いまどうしてる？"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button onClick={handlePost}>
            投稿
          </button>
        </div>

        <button onClick={handleLogout}>
          ログアウト  
        </button>

        <hr />

        {/* 投稿一覧 */}
<div>
  {posts.map((post) => (
    <div
      key={post.id}
      style={{
        border: '1px solid gray',
        padding: '8px',
        marginTop: '8px'
      }}
    >

      {/* ユーザー情報 */}
      <div style={{
        display: 'flex',
        alignItems:'center',
        gap:'10px'
      }}>

        {post.profiles?.avatar_url ? (
          <img
          src={post.profiles.avatar_url}
          alt="avatar"
          width={40}
          height={40}
          style={{borderRadius: '50%'}}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'gray'
            }}
          />
        )}

        <strong>{post.profiles?.username}</strong>

      </div>


      {/* 投稿内容 */}
      <p>{post.content}</p>
      <small>{post.created_at}</small>

      {/* 自分の投稿だけ削除ボタン表示 */}
      {user?.id === post.user_id && (
        <button
          onClick={() => handleDelete(post.id)}
          style={{ marginLeft: '10px', color: 'red' }}
        >
          削除
        </button>
   )}
      {/* いいねボタン */}

    <button
      onClick={() => handleLike(post)}
      style={{
        marginLeft: '10px',
        color: post.likes?.some(
          (like: any) => like.user_id === user?.id
        )
          ?'red'
          :'gray'
      }}
    >
      💛 {post.likes.length ?? 0}
    </button>
   
    </div>
  ))}
</div>

        </>
      )}
    </div>
  )
}
