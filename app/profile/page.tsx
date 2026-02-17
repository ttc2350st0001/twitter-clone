'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Profile() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [username, setUsername] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('login')
                return
            }

            setUser(user)

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle()

            if (error) {
                console.error("PROFILE ERROR:", error)
            } else if (data) {
                setUsername(data.username || '')
                setAvatarUrl(data.avatar_url || '')
            }

            setLoading(false)
        }

        getProfile()
    }, [])

    const handleAvatarUpload = async (event: any) => {
        try {
            setUploading(true)

            if (!user) return

            const file = event.target.files[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            const publicUrl = data.publicUrl

            await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

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

        try {
            setSaving(true)

            const { error } = await supabase
            .from('profiles')
            .update({
                username,
                avatar_url: avatarUrl
            })
            .eq('id', user.id)

        if (error) throw error

            router.push('/')
        } catch (error) {
            console.error(error)
            alert('更新失敗')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm">読み込み中...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex justify-center items-start p-6">
            <div className="w-full max-w-md border-gray-800 rounded-2xl p-6">
                <h1 className="text-2xl font-bold mb-6">
                    プロフィール編集
                </h1>
                {/* ユーザー名 */}
                <label className="block mb-2 text-sm text-gray-400">
                    ユーザー名
                </label>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 mb-6 focus:outline-none focus:border-blue-500"
                />

                {/* アバター */}
                <label className="block mb-2 text-sm text-gray-400">
                    プロフィール画像
                </label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="mb-4"
                />

                {uploading && (
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-400">更新中...</span>
                    </div>
                )}


                {avatarUrl && (
                    <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-24 h-24 rounded-full object-cover mb-6"
                    />
                )}
                {/* 保存ボタン */}
                <button
                    disabled={saving}
                    className={`w-full py-2 rounded-full font-bold transition flex items-center justify-center ${
                        saving
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            '保存'
                        )}
                </button>

                {/* 戻る */}
                <button
                    onClick={() => router.push('/')}
                    className="mt-4 text-gray-400 hover:text-white"
                >
                    戻る
                </button>

            </div>
        </div>
    )
}

