/** Legacy accounts (no verification fields) count as verified. */
export const isEmailVerified = (user: {
  emailVerified?: boolean | null;
  emailVerificationToken?: string | null;
}) =>
  user.emailVerified === true ||
  (user.emailVerified == null && !user.emailVerificationToken);
