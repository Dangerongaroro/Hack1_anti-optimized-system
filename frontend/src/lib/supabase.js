import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 環境変数の検証とエラーハンドリング
if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn('⚠️ VITE_SUPABASE_URL環境変数が正しく設定されていません')
  console.log('💡 .envファイルで実際のSupabaseプロジェクトURLを設定してください')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY環境変数が正しく設定されていません')
  console.log('💡 .envファイルで実際のSupabaseプロジェクトキーを設定してください')
}

// Supabaseクライアントを作成（環境変数が設定されていない場合はダミー値を使用）
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// 認証状態の変更を監視するヘルパー関数
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}

// 現在のセッションを取得するヘルパー関数
export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// サインアウトヘルパー関数
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Sign out error:', error)
    throw error
  }
  return true
}

export default supabase