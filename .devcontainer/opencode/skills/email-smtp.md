---
description: Email sending with emailit.com SMTP
---

# Email Setup with emailit.com

This skill covers email integration using emailit.com SMTP service.

## Prerequisites

1. emailit.com account
2. Domain verified (for production)
3. SMTP credentials

### Environment Variables

```bash
SMTP_HOST="smtp.emailit.com"
SMTP_PORT="587"
SMTP_USER="your_username"
SMTP_PASSWORD="your_password"
EMAIL_FROM="noreply@yourdomain.com"
```

## Setup with Nodemailer

### 1. Install Dependencies

```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### 2. Create Email Client

```typescript
// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return info;
}
```

## Email Templates

### 3. Create Email Templates

```typescript
// lib/email-templates.ts
export function welcomeEmail(name: string, loginUrl: string) {
  return {
    subject: 'Welcome to Our App!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #0066cc; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome, ${name}!</h1>
            <p>Thanks for signing up. We're excited to have you on board.</p>
            <p>
              <a href="${loginUrl}" class="button">Get Started</a>
            </p>
            <div class="footer">
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Welcome, ${name}! Thanks for signing up. Get started here: ${loginUrl}`,
  };
}

export function passwordResetEmail(resetUrl: string) {
  return {
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #dc3545; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Reset Your Password</h1>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            <p>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>This link expires in 1 hour.</p>
            <div class="footer">
              <p>If you didn't request this, please ignore this email.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Reset your password using this link: ${resetUrl}. This link expires in 1 hour.`,
  };
}

export function invoiceEmail(customerName: string, invoiceNumber: string, amount: string, pdfUrl: string) {
  return {
    subject: `Invoice #${invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .invoice-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #28a745; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Invoice #${invoiceNumber}</h1>
            <p>Dear ${customerName},</p>
            <p>Please find your invoice details below:</p>
            <div class="invoice-box">
              <strong>Invoice Number:</strong> ${invoiceNumber}<br>
              <strong>Amount Due:</strong> ${amount}
            </div>
            <p>
              <a href="${pdfUrl}" class="button">Download Invoice</a>
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Invoice #${invoiceNumber} for ${customerName}. Amount: ${amount}. Download: ${pdfUrl}`,
  };
}
```

## Usage Examples

### 4. Send Emails

```typescript
// In your API route or server action
import { sendEmail } from '@/lib/email';
import { welcomeEmail, passwordResetEmail } from '@/lib/email-templates';

// Send welcome email
export async function sendWelcomeEmail(email: string, name: string) {
  const template = welcomeEmail(name, 'https://yourapp.com/dashboard');
  await sendEmail({
    to: email,
    ...template,
  });
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `https://yourapp.com/reset-password?token=${token}`;
  const template = passwordResetEmail(resetUrl);
  await sendEmail({
    to: email,
    ...template,
  });
}
```

### 5. API Route Example

```typescript
// app/api/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { to, subject, message } = await req.json();

  try {
    await sendEmail({
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email send failed:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
```

## Email Queue (for high volume)

For production use with high email volume, consider using a queue:

```typescript
// lib/email-queue.ts
import { db } from '@/db';
import { emailQueue } from '@/db/schema';
import { sendEmail } from './email';

export async function queueEmail(options: EmailOptions) {
  await db.insert(emailQueue).values({
    to: Array.isArray(options.to) ? options.to.join(',') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    status: 'pending',
  });
}

// Process queue (run as cron job or background worker)
export async function processEmailQueue() {
  const pending = await db
    .select()
    .from(emailQueue)
    .where(eq(emailQueue.status, 'pending'))
    .limit(10);

  for (const email of pending) {
    try {
      await sendEmail({
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      });
      
      await db
        .update(emailQueue)
        .set({ status: 'sent', sentAt: new Date() })
        .where(eq(emailQueue.id, email.id));
    } catch (error) {
      await db
        .update(emailQueue)
        .set({ status: 'failed', error: String(error) })
        .where(eq(emailQueue.id, email.id));
    }
  }
}
```

## Tips

- Always include both HTML and plain text versions
- Use inline CSS for email templates (most email clients don't support external CSS)
- Test emails with different email clients
- Implement rate limiting for email sending
- Use email queues for reliability in production
