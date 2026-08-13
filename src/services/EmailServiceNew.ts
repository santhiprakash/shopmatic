/**
 * Email Service with Dynamic SMTP Configuration
 * Supports: Custom SMTP, Resend, SendGrid, EmailIT
 * Uses user-configured settings from database
 *
 * ARCHITECTURE NOTE:
 * This service uses NeonDB (PostgreSQL) as the database backend.
 * SMTP settings are fetched through backend API endpoints,
 * NOT directly from the client-side code for security reasons.
 *
 * Required Backend API Endpoint:
 * - GET /api/smtp-settings/:userId/active - Get active SMTP settings for a user
 */

interface EmailRecipient {
  email: string;
  name?: string;
}

interface EmailData {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SMTPSetting {
  id: string;
  provider: 'custom' | 'resend' | 'sendgrid' | 'emailit';
  settings: Record<string, any>;
  from_email: string;
  from_name?: string;
  is_active: boolean;
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class EmailService {
  private cachedSettings: SMTPSetting | null = null;
  private cacheTimestamp: number = 0;
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get active SMTP settings for a user (with caching)
   */
  private async getActiveSMTPSettings(userId: string): Promise<SMTPSetting | null> {
    const now = Date.now();

    // Return cached settings if still valid
    if (this.cachedSettings && (now - this.cacheTimestamp) < this.cacheTTL) {
      return this.cachedSettings;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/smtp-settings/${userId}/active`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.status === 404 || !response.ok) {
        console.warn('No active SMTP settings found for user:', userId);
        return null;
      }

      const data = await response.json();
      this.cachedSettings = data as SMTPSetting;
      this.cacheTimestamp = now;
      return this.cachedSettings;
    } catch (error) {
      console.error('Failed to fetch SMTP settings:', error);
      return null;
    }
  }

  /**
   * Clear SMTP settings cache
   */
  clearCache() {
    this.cachedSettings = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Send email using configured SMTP settings
   */
  async sendEmail(emailData: EmailData, userId?: string): Promise<EmailResponse> {
    // Get SMTP settings if userId is provided
    let smtpSettings: SMTPSetting | null = null;
    if (userId) {
      smtpSettings = await this.getActiveSMTPSettings(userId);
    }

    // If no settings found, try to use environment variables as fallback
    if (!smtpSettings) {
      return this.sendWithEnvironmentConfig(emailData);
    }

    // Route to appropriate provider
    switch (smtpSettings.provider) {
      case 'custom':
        return this.sendWithCustomSMTP(emailData, smtpSettings);
      case 'resend':
        return this.sendWithResend(emailData, smtpSettings);
      case 'sendgrid':
        return this.sendWithSendGrid(emailData, smtpSettings);
      case 'emailit':
        return this.sendWithEmailIT(emailData, smtpSettings);
      default:
        return {
          success: false,
          error: `Unknown provider: ${smtpSettings.provider}`,
        };
    }
  }

  /**
   * Send email with Resend
   */
  private async sendWithResend(emailData: EmailData, settings: SMTPSetting): Promise<EmailResponse> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.settings.api_key}`,
        },
        body: JSON.stringify({
          from: `${settings.from_name || 'Shopmatic'} <${settings.from_email}>`,
          to: Array.isArray(emailData.to) ? emailData.to.map(r => r.email) : [emailData.to.email],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          reply_to: emailData.replyTo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email via Resend');
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.id,
      };
    } catch (error) {
      console.error('Resend email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email with SendGrid
   */
  private async sendWithSendGrid(emailData: EmailData, settings: SMTPSetting): Promise<EmailResponse> {
    try {
      const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to];

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.settings.api_key}`,
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: recipients.map(r => ({ email: r.email, name: r.name })),
              subject: emailData.subject,
            },
          ],
          from: {
            email: settings.from_email,
            name: settings.from_name || 'Shopmatic',
          },
          content: [
            { type: 'text/html', value: emailData.html },
            ...(emailData.text ? [{ type: 'text/plain', value: emailData.text }] : []),
          ],
          ...(emailData.replyTo ? { reply_to: { email: emailData.replyTo } } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0]?.message || 'Failed to send email via SendGrid');
      }

      return {
        success: true,
        messageId: response.headers.get('x-message-id') || undefined,
      };
    } catch (error) {
      console.error('SendGrid email sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email with EmailIT
   */
  private async sendWithEmailIT(emailData: EmailData, settings: SMTPSetting): Promise<EmailResponse> {
    try {
      const response = await fetch('https://api.emailit.com/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.settings.api_key}`,
        },
        body: JSON.stringify({
          from: {
            email: settings.from_email,
            name: settings.from_name || 'Shopmatic',
          },
          to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          replyTo: emailData.replyTo,
          cc: emailData.cc,
          bcc: emailData.bcc,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email via EmailIT');
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('EmailIT sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send email with Custom SMTP
   * Note: This requires a backend API endpoint as browsers cannot directly connect to SMTP servers
   */
  private async sendWithCustomSMTP(emailData: EmailData, settings: SMTPSetting): Promise<EmailResponse> {
    console.warn('Custom SMTP requires a backend API endpoint. Implement /api/email/send endpoint.');

    // TODO: Implement backend API endpoint at /api/email/send that uses nodemailer
    // For now, return a placeholder response
    return {
      success: false,
      error: 'Custom SMTP requires backend implementation. Please use API-based providers (Resend, SendGrid, EmailIT) or implement a backend endpoint.',
    };
  }

  /**
   * Fallback: Send with environment variables (backward compatibility)
   */
  private async sendWithEnvironmentConfig(emailData: EmailData): Promise<EmailResponse> {
    console.warn('No SMTP settings configured. Email not sent.');
    return {
      success: false,
      error: 'No SMTP settings configured for this user. Please configure SMTP settings in your account settings.',
    };
  }

  /**
   * Send team invitation email
   */
  async sendTeamInvitation(
    inviteeEmail: string,
    inviterName: string,
    pageName: string,
    role: string,
    invitationToken: string,
    userId: string,
    personalMessage?: string
  ): Promise<EmailResponse> {
    const invitationUrl = `${import.meta.env.VITE_PRODUCTION_URL || window.location.origin}/accept-invitation/${invitationToken}`;
    const unsubscribeUrl = `${import.meta.env.VITE_PRODUCTION_URL || window.location.origin}/unsubscribe?email=${encodeURIComponent(inviteeEmail)}`;

    const html = this.getTeamInvitationTemplate(
      inviterName,
      pageName,
      role,
      invitationUrl,
      personalMessage,
      unsubscribeUrl
    );
    const text = this.getTeamInvitationText(
      inviterName,
      pageName,
      role,
      invitationUrl,
      personalMessage
    );

    return this.sendEmail({
      to: { email: inviteeEmail },
      subject: `${inviterName} invited you to collaborate on "${pageName}"`,
      html,
      text,
    }, userId);
  }

  /**
   * Team Invitation Email HTML Template
   */
  private getTeamInvitationTemplate(
    inviterName: string,
    pageName: string,
    role: string,
    invitationUrl: string,
    personalMessage: string | undefined,
    unsubscribeUrl: string
  ): string {
    const roleDescriptions: Record<string, string> = {
      admin: 'Full page management and team control',
      editor: 'Add, edit, and delete products',
      viewer: 'View-only access to analytics',
    };

    const roleDescription = roleDescriptions[role.toLowerCase()] || 'Collaborate on this page';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Team Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Shopmatic</h1>
              <p style="margin: 10px 0 0; color: #e6e6ff; font-size: 16px;">Team Collaboration</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px;">You're Invited! 🎉</h2>
              <p style="margin: 0 0 15px; color: #666666; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to join their team as a <strong style="color: #667eea;">${role.charAt(0).toUpperCase() + role.slice(1)}</strong> on the page:
              </p>
              <div style="padding: 20px; background-color: #f8f9fa; border-left: 4px solid #667eea; margin: 20px 0;">
                <p style="margin: 0; color: #333333; font-size: 18px; font-weight: 600;">${pageName}</p>
                <p style="margin: 8px 0 0; color: #666666; font-size: 14px;">${roleDescription}</p>
              </div>
              ${personalMessage ? `
              <div style="padding: 15px; background-color: #fff8e1; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0 0 5px; color: #856404; font-size: 12px; font-weight: 600; text-transform: uppercase;">Personal Message</p>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6; font-style: italic;">"${personalMessage}"</p>
              </div>
              ` : ''}
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${invitationUrl}" style="display: inline-block; padding: 14px 30px; background-color: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Accept Invitation</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 25px 0 15px; color: #666666; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 25px; padding: 15px; background-color: #f8f9fa; color: #667eea; font-size: 12px; word-break: break-all; border-radius: 4px;">
                ${invitationUrl}
              </p>
              <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; margin-bottom: 20px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>⏱️ Note:</strong> This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e0e0e0; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px; line-height: 1.5;">
                <strong>Shopmatic</strong><br>
                shopmatic.cc
              </p>
              <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                This is a team invitation email sent on behalf of ${inviterName}.
                You're receiving this because someone invited you to collaborate on their Shopmatic page.
              </p>
              <p style="margin: 10px 0 0; color: #999999; font-size: 11px;">
                <a href="${unsubscribeUrl}" style="color: #667eea; text-decoration: underline;">Unsubscribe from emails</a> |
                <a href="${window.location.origin}/privacy" style="color: #667eea; text-decoration: underline;">Privacy Policy</a>
              </p>
              <p style="margin: 15px 0 0; color: #999999; font-size: 11px; line-height: 1.5;">
                © ${new Date().getFullYear()} Shopmatic. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  /**
   * Team Invitation Email Plain Text Version
   */
  private getTeamInvitationText(
    inviterName: string,
    pageName: string,
    role: string,
    invitationUrl: string,
    personalMessage: string | undefined
  ): string {
    const roleDescriptions: Record<string, string> = {
      admin: 'Full page management and team control',
      editor: 'Add, edit, and delete products',
      viewer: 'View-only access to analytics',
    };

    const roleDescription = roleDescriptions[role.toLowerCase()] || 'Collaborate on this page';

    return `You're Invited to Collaborate!

${inviterName} has invited you to join their team as a ${role.charAt(0).toUpperCase() + role.slice(1)} on the page: "${pageName}"

Role: ${role.charAt(0).toUpperCase() + role.slice(1)}
${roleDescription}
${personalMessage ? `\nPersonal Message:\n"${personalMessage}"\n` : ''}
Accept the invitation:
${invitationUrl}

NOTE: This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.

---
Shopmatic
shopmatic.cc

This is a team invitation email sent on behalf of ${inviterName}.

© ${new Date().getFullYear()} Shopmatic. All rights reserved.`;
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
