/**
 * 閲覧制限: 学校メール（@haguroko.ed.jp）のみ忘れ物一覧などを閲覧可能
 */
export const VIEWER_ALLOWED_EMAIL_DOMAIN = "@haguroko.ed.jp";
export const VIEWER_COOKIE_NAME = "lf_viewer_verified";
export const VIEWER_COOKIE_DAYS = 7;

export function isAllowedViewerEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith(VIEWER_ALLOWED_EMAIL_DOMAIN.toLowerCase());
}
