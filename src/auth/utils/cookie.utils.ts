/**
 * Cookie utility functions for auth operations
 * Provides helpers for working with HttpOnly cookies in the authentication flow
 */

export class CookieUtils {
  /**
   * Cookie options for development environment
   */
  static readonly DEV_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  } as const;

  /**
   * Cookie options for production environment
   */
  static readonly PROD_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  } as const;

  /**
   * Get appropriate cookie options based on environment
   */
  static getCookieOptions(isProd: boolean, maxAge: number) {
    const options = isProd
      ? this.PROD_COOKIE_OPTIONS
      : this.DEV_COOKIE_OPTIONS;

    return {
      ...options,
      maxAge,
      path: '/',
    };
  }

  /**
   * Get cookie clear options (for logout)
   */
  static getCookieClearOptions(isProd: boolean) {
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      path: '/',
    };
  }

  /**
   * Cookie names
   */
  static readonly REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

  /**
   * Default cookie expiration times
   */
  static readonly DEFAULT_EXPIRATION_MS = {
    accessToken: 15 * 60 * 1000, // 15 minutes
    refreshToken: 7 * 24 * 60 * 60 * 1000, // 7 days
  } as const;
}

/**
 * Parse expiration string to milliseconds
 * Examples: "15m", "7d", "3600s"
 */
export function parseExpirationToMs(expiration: string): number {
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return CookieUtils.DEFAULT_EXPIRATION_MS.refreshToken;
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return CookieUtils.DEFAULT_EXPIRATION_MS.refreshToken;
  }
}
