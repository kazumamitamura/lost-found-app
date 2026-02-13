import { supabase } from "./supabase";

/**
 * 現在のユーザーが認証されているか確認
 */
export async function checkAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return { authenticated: false, user: null };
  }

  // 登録者リストに存在するか確認
  const { data: registrant, error: registrantError } = await supabase
    .from("lost_registrants")
    .select("*")
    .eq("email", session.user.email)
    .single();

  if (registrantError || !registrant) {
    return { authenticated: false, user: null };
  }

  return { 
    authenticated: true, 
    user: session.user,
    registrant 
  };
}

/**
 * ログアウト
 */
export async function logout() {
  await supabase.auth.signOut();
}
