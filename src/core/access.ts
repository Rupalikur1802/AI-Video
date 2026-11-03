export function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
export function isApprovedMember(user: {email: string; emailVerified: boolean}, allowlist: string | undefined) {
  const approved = new Set((allowlist || '').split(',').map(normalizeEmail).filter(Boolean));
  return user.emailVerified === true && approved.has(normalizeEmail(user.email));
}
