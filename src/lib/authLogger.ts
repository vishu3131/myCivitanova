/**
 * MYCIVITANOVA - AUTH LOGGER SERVICE
 * 
 * Comprehensive authentication event logging system for admin monitoring
 * and security tracking. Logs all authentication activities including
 * registrations, logins, role changes, and security events.
 */

export interface AuthLogEntry {
  id?: string;
  user_id?: string;
  firebase_uid?: string;
  action: 'login' | 'register' | 'logout' | 'password_reset' | 'email_verify' | 'role_change' | 'failed_login' | 'account_locked';
  status: 'success' | 'failed' | 'pending';
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
  additional_data?: Record<string, any>;
  created_at?: string;
}

export interface AuthStats {
  totalRegistrations: number;
  todayRegistrations: number;
  weekRegistrations: number;
  successfulLogins: number;
  failedLogins: number;
  passwordResets: number;
  verificationsSent: number;
  activeUsers: number;
  topFailureReasons: Array<{ reason: string; count: number }>;
}

export class AuthLogger {
  private static instance: AuthLogger;
  private isInitialized = false;
  
  static getInstance(): AuthLogger {
    if (!AuthLogger.instance) {
      AuthLogger.instance = new AuthLogger();
    }
    return AuthLogger.instance;
  }

  /**
   * Initialize the auth logger
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      console.log('🔍 Initializing Auth Logger...');
      this.isInitialized = true;
      console.log('✅ Auth Logger initialized');
    } catch (error) {
      console.error('❌ Error initializing Auth Logger:', error);
      throw error;
    }
  }

  /**
   * Log an authentication event
   */
  async logAuthEvent(entry: AuthLogEntry): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const logEntry = {
        ...entry,
        created_at: entry.created_at || new Date().toISOString(),
        ip_address: entry.ip_address || await this.getClientIP(),
        user_agent: entry.user_agent || this.getUserAgent()
      };

      // Send to API endpoint
      const idToken = await this.getIdToken();
      if (!idToken) {
        console.warn('No auth token available for logging');
        return;
      }

      const response = await fetch('/api/admin/auth-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(logEntry)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('Failed to log auth event:', errorText);
      }
    } catch (error) {
      console.warn('Auth logging error:', error);
      // Don't throw - logging should not break the main flow
    }
  }

  /**
   * Log successful registration
   */
  async logRegistration(userId: string, firebaseUid: string, success: boolean, error?: string, additionalData?: Record<string, any>): Promise<void> {
    await this.logAuthEvent({
      user_id: userId,
      firebase_uid: firebaseUid,
      action: 'register',
      status: success ? 'success' : 'failed',
      error_message: error,
      additional_data: additionalData
    });
  }

  /**
   * Log login attempt
   */
  async logLogin(userId: string, firebaseUid: string, success: boolean, error?: string): Promise<void> {
    await this.logAuthEvent({
      user_id: userId,
      firebase_uid: firebaseUid,
      action: success ? 'login' : 'failed_login',
      status: success ? 'success' : 'failed',
      error_message: error
    });
  }

  /**
   * Log logout event
   */
  async logLogout(userId: string, firebaseUid: string): Promise<void> {
    await this.logAuthEvent({
      user_id: userId,
      firebase_uid: firebaseUid,
      action: 'logout',
      status: 'success'
    });
  }

  /**
   * Log password reset request
   */
  async logPasswordReset(email: string, success: boolean, error?: string): Promise<void> {
    await this.logAuthEvent({
      action: 'password_reset',
      status: success ? 'success' : 'failed',
      error_message: error,
      additional_data: { email }
    });
  }

  /**
   * Log email verification event
   */
  async logEmailVerification(userId: string, firebaseUid: string, success: boolean, error?: string): Promise<void> {
    await this.logAuthEvent({
      user_id: userId,
      firebase_uid: firebaseUid,
      action: 'email_verify',
      status: success ? 'success' : 'failed',
      error_message: error
    });
  }

  /**
   * Log role change by admin
   */
  async logRoleChange(
    adminId: string, 
    adminFirebaseUid: string, 
    targetUserId: string, 
    targetFirebaseUid: string, 
    newRole: string, 
    oldRole: string, 
    success: boolean,
    error?: string
  ): Promise<void> {
    await this.logAuthEvent({
      user_id: adminId,
      firebase_uid: adminFirebaseUid,
      action: 'role_change',
      status: success ? 'success' : 'failed',
      error_message: error,
      additional_data: {
        target_user_id: targetUserId,
        target_firebase_uid: targetFirebaseUid,
        new_role: newRole,
        old_role: oldRole
      }
    });
  }

  /**
   * Get authentication statistics
   */
  async getAuthStats(): Promise<AuthStats | null> {
    try {
      const idToken = await this.getIdToken();
      if (!idToken) return null;

      const response = await fetch('/api/admin/auth-stats', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.stats;
    } catch (error) {
      console.error('Error fetching auth stats:', error);
      return null;
    }
  }

  /**
   * Get current Firebase ID token
   */
  private async getIdToken(): Promise<string> {
    try {
      if (typeof window === 'undefined') return '';
      
      const { auth } = await import('../utils/firebaseClient');
      if (!auth) return '';
      
      const user = auth.currentUser;
      return user ? await user.getIdToken() : '';
    } catch (error) {
      console.warn('Error getting ID token:', error);
      return '';
    }
  }

  /**
   * Get client IP address
   */
  private async getClientIP(): Promise<string> {
    try {
      if (typeof window === 'undefined') return 'server';
      
      const response = await fetch('/api/client-ip');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Get user agent string
   */
  private getUserAgent(): string {
    if (typeof window === 'undefined') return 'server';
    return navigator.userAgent || 'unknown';
  }

  /**
   * Cleanup the logger
   */
  cleanup(): void {
    console.log('🧹 Cleaning up Auth Logger...');
    this.isInitialized = false;
    console.log('✅ Auth Logger cleaned up');
  }
}

// Export singleton instance
export const authLogger = AuthLogger.getInstance();
export default authLogger;