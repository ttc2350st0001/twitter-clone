'use client'

import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase'

export default function Profile() {
    const router = useRouter()
    const [user,setUser] = useState<any>(null)
    const [username,setUsername] = useState('')
    const [avatarUrl,setAvatarUrl] = useState('')
    const [loading,setLoading] = useState(true)
    const [uploading,setUploading] = useState(false)

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user }}  = await supabase.auth.getUser()

            if (!user) {
                router.push('login')
                return
            }

            setUser(user)

            const {data,error} = await supabase
            .from('profiles')
            .select('*')
            .eq('id',user.id)
            .maybeSingle()

            if (error) {
                console.error("PROFILE ERROR:",error)
            } else if (data) {
                setUsername(data.username || '')
                setAvatarUrl(data.avatar_url || '')
            }

            setLoading(false)
        }

        getProfile()
        },[])

        const handleAvatarUpload = async (event: any) => {
            try {
                setUploading(true)

                if(!user) return

                const file = event.target.files[0]
                if (!file) return

                const fileExt = file.name.split('.').pop()
                const fileName = `${user.id}-${Date.now()}.${fileExt}`

                const {error: uploadError} = await supabase.storage
                .from('avatars')
                .upload(fileName,file, {upsert:true})

                if(uploadError) throw uploadError

                const {data} = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

                const publicUrl = data.publicUrl

                await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id',user.id)

                setAvatarUrl(publicUrl)

            } catch (error) {
                console.error(error)
                alert('アップロード失敗')
            } finally {
                setUploading(false)
            }
        }

        const handleUpdate = async () => {
            if (!user) return

            const {error} = await supabase
            .from('profiles')
            .update({
                username,
                avatar_url:avatarUrl
            })
            .eq('id',user.id)

            if (error) {
                console.error(error)
                alert('更新失敗')
            }else{
                alert('更新成功!')
                router.push('/')
            }
        }

        if (loading) return <p>Loading...</p>

        return (
            <div>
                <h1>プロフィール編集</h1>

               <div>
                    <label>ユーザー名</label>
                    <br />
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}  
                    />
                </div>

                <div>
                    <label>アバター画像</label>
                    <br />
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                    />

                {uploading && <p>アップロード中...</p>}

                {avatarUrl && (
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        width={100}
                        height={100}
                        style={{borderRadius: '50%', marginTop: '10px'}}
                    />
                )}

                </div> 

                <button onClick={handleUpdate}>
                    保存
                </button>

                <br /><br />

                <button onClick={() => router.push('/')}>
                    戻る
                </button>

            </div>
        )
}

