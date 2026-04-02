# Payment Integration - Razorpay & PayPal

## Overview

eComJunction uses **Razorpay** for Indian users and **PayPal** for international users, providing seamless payment processing across regions.

---

## Why Razorpay + PayPal?

### Razorpay (India)
**Advantages:**
- RBI compliant and approved
- Supports all Indian payment methods (UPI, Cards, Net Banking, Wallets)
- Lower transaction fees (2% vs 2.9% Stripe)
- INR settlements
- Better for Indian market
- Instant settlements available

**Transaction Fees:**
- Domestic: 2% + ₹0 (no fixed fee)
- International: 3% + ₹0

### PayPal (International)
**Advantages:**
- Globally recognized and trusted
- Supports 200+ countries
- Multiple currencies
- Buyer protection
- Easy integration

**Transaction Fees:**
- Standard: 2.9% + $0.30
- International: 4.4% + fixed fee

---

## Architecture

### Payment Flow

```
User Location Detection
        ↓
    India? → Yes → Razorpay
        ↓
       No → PayPal
```

### Database Schema

```sql
-- Add payment fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS razorpay_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS paypal_customer_id VARCHAR(255);

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_gateway VARCHAR(20) NOT NULL, -- 'razorpay' or 'paypal'
    gateway_payment_id VARCHAR(255) NOT NULL,
    gateway_order_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    plan VARCHAR(20) NOT NULL, -- 'pro', 'enterprise'
    payment_method VARCHAR(50), -- 'upi', 'card', 'netbanking', etc.
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_gateway ON payments(payment_gateway);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_gateway VARCHAR(20) NOT NULL,
    gateway_subscription_id VARCHAR(255) NOT NULL,
    plan VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired', 'paused'
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_gateway ON subscriptions(payment_gateway);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    subscription_id UUID REFERENCES subscriptions(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'draft', 'paid', 'void'
    invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    invoice_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
```

---

## Environment Configuration

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=live # or 'sandbox' for testing

# Application
VITE_APP_URL=https://ecomjunction.com
```

---

## Installation

```bash
# Install Razorpay SDK
npm install razorpay

# Install PayPal SDK
npm install @paypal/checkout-server-sdk

# Install for frontend
npm install react-razorpay
```

---

## Implementation

### 1. Payment Service

```typescript
// src/lib/payments/razorpay.ts
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const razorpayService = {
  // Create order
  async createOrder(amount: number, currency: string, userId: string) {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        user_id: userId,
      },
    });

    return order;
  },

  // Create subscription
  async createSubscription(planId: string, userId: string) {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12, // 12 months
      notes: {
        user_id: userId,
      },
    });

    return subscription;
  },

  // Verify payment signature
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const crypto = require('crypto');
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  },

  // Fetch payment details
  async getPayment(paymentId: string) {
    return await razorpay.payments.fetch(paymentId);
  },

  // Create refund
  async createRefund(paymentId: string, amount?: number) {
    return await razorpay.payments.refund(paymentId, {
      amount: amount ? amount * 100 : undefined,
    });
  },
};
```

```typescript
// src/lib/payments/paypal.ts
import paypal from '@paypal/checkout-server-sdk';

const environment =
  process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
      );

const client = new paypal.core.PayPalHttpClient(environment);

export const paypalService = {
  // Create order
  async createOrder(amount: number, currency: string, userId: string) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          custom_id: userId,
        },
      ],
      application_context: {
        return_url: `${process.env.VITE_APP_URL}/payment/success`,
        cancel_url: `${process.env.VITE_APP_URL}/payment/cancel`,
      },
    });

    const response = await client.execute(request);
    return response.result;
  },

  // Capture payment
  async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const response = await client.execute(request);
    return response.result;
  },

  // Create subscription
  async createSubscription(planId: string, userId: string) {
    const request = new paypal.subscriptions.SubscriptionsCreateRequest();
    request.requestBody({
      plan_id: planId,
      custom_id: userId,
      application_context: {
        return_url: `${process.env.VITE_APP_URL}/subscription/success`,
        cancel_url: `${process.env.VITE_APP_URL}/subscription/cancel`,
      },
    });

    const response = await client.execute(request);
    return response.result;
  },

  // Get subscription details
  async getSubscription(subscriptionId: string) {
    const request = new paypal.subscriptions.SubscriptionsGetRequest(
      subscriptionId
    );
    const response = await client.execute(request);
    return response.result;
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, reason: string) {
    const request = new paypal.subscriptions.SubscriptionsCancelRequest(
      subscriptionId
    );
    request.requestBody({
      reason,
    });

    const response = await client.execute(request);
    return response.result;
  },
};
```

```typescript
// src/lib/payments/index.ts
import { razorpayService } from './razorpay';
import { paypalService } from './paypal';

export const PLAN_PRICES = {
  pro: {
    inr: 1499, // ₹1,499/month
    usd: 19, // $19/month
  },
  enterprise: {
    inr: 7999, // ₹7,999/month
    usd: 99, // $99/month
  },
};

export const RAZORPAY_PLAN_IDS = {
  pro: 'plan_xxxxx', // Replace with actual Razorpay plan ID
  enterprise: 'plan_yyyyy',
};

export const PAYPAL_PLAN_IDS = {
  pro: 'P-xxxxx', // Replace with actual PayPal plan ID
  enterprise: 'P-yyyyy',
};

export function detectUserRegion(req: Request): 'india' | 'international' {
  // Get country from IP or user profile
  const country = req.headers.get('cf-ipcountry') || 'US';
  return country === 'IN' ? 'india' : 'international';
}

export async function createPaymentOrder(
  userId: string,
  plan: 'pro' | 'enterprise',
  region: 'india' | 'international'
) {
  if (region === 'india') {
    const amount = PLAN_PRICES[plan].inr;
    return await razorpayService.createOrder(amount, 'INR', userId);
  } else {
    const amount = PLAN_PRICES[plan].usd;
    return await paypalService.createOrder(amount, 'USD', userId);
  }
}

export async function createSubscription(
  userId: string,
  plan: 'pro' | 'enterprise',
  region: 'india' | 'international'
) {
  if (region === 'india') {
    const planId = RAZORPAY_PLAN_IDS[plan];
    return await razorpayService.createSubscription(planId, userId);
  } else {
    const planId = PAYPAL_PLAN_IDS[plan];
    return await paypalService.createSubscription(planId, userId);
  }
}
```

---

### 2. API Routes

```typescript
// api/payments/create-order.ts
import { requireAuth } from '@/middleware/auth';
import { createPaymentOrder, detectUserRegion } from '@/lib/payments';

export async function POST(req: Request) {
  const user = await requireAuth(req);
  const { plan } = await req.json();

  if (!['pro', 'enterprise'].includes(plan)) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const region = detectUserRegion(req);
  const order = await createPaymentOrder(user.id, plan, region);

  return Response.json({
    order,
    region,
    gateway: region === 'india' ? 'razorpay' : 'paypal',
  });
}
```

```typescript
// api/payments/verify-razorpay.ts
import { requireAuth } from '@/middleware/auth';
import { razorpayService } from '@/lib/payments/razorpay';
import { db } from '@/lib/neon';

export async function POST(req: Request) {
  const user = await requireAuth(req);
  const { order_id, payment_id, signature, plan } = await req.json();

  // Verify signature
  const isValid = razorpayService.verifyPaymentSignature(
    order_id,
    payment_id,
    signature
  );

  if (!isValid) {
    return Response.json(
      { error: 'Invalid payment signature' },
      { status: 400 }
    );
  }

  // Get payment details
  const payment = await razorpayService.getPayment(payment_id);

  // Save payment to database
  await db.query(
    `
    INSERT INTO payments (
      user_id, payment_gateway, gateway_payment_id, gateway_order_id,
      amount, currency, status, plan, payment_method
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `,
    [
      user.id,
      'razorpay',
      payment_id,
      order_id,
      payment.amount / 100,
      payment.currency,
      'completed',
      plan,
      payment.method,
    ]
  );

  // Update user subscription
  await db.query(
    `
    UPDATE users
    SET subscription_plan = $1,
        subscription_status = 'active',
        subscription_started_at = NOW(),
        subscription_expires_at = NOW() + INTERVAL '1 month'
    WHERE id = $2
  `,
    [plan, user.id]
  );

  return Response.json({ success: true });
}
```

```typescript
// api/payments/verify-paypal.ts
import { requireAuth } from '@/middleware/auth';
import { paypalService } from '@/lib/payments/paypal';
import { db } from '@/lib/neon';

export async function POST(req: Request) {
  const user = await requireAuth(req);
  const { order_id, plan } = await req.json();

  // Capture the order
  const order = await paypalService.captureOrder(order_id);

  if (order.status !== 'COMPLETED') {
    return Response.json({ error: 'Payment not completed' }, { status: 400 });
  }

  const capture = order.purchase_units[0].payments.captures[0];

  // Save payment to database
  await db.query(
    `
    INSERT INTO payments (
      user_id, payment_gateway, gateway_payment_id, gateway_order_id,
      amount, currency, status, plan
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `,
    [
      user.id,
      'paypal',
      capture.id,
      order_id,
      capture.amount.value,
      capture.amount.currency_code,
      'completed',
      plan,
    ]
  );

  // Update user subscription
  await db.query(
    `
    UPDATE users
    SET subscription_plan = $1,
        subscription_status = 'active',
        subscription_started_at = NOW(),
        subscription_expires_at = NOW() + INTERVAL '1 month'
    WHERE id = $2
  `,
    [plan, user.id]
  );

  return Response.json({ success: true });
}
```

```typescript
// api/webhooks/razorpay.ts
import { razorpayService } from '@/lib/payments/razorpay';
import { db } from '@/lib/neon';

export async function POST(req: Request) {
  const signature = req.headers.get('x-razorpay-signature');
  const body = await req.text();

  // Verify webhook signature
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);

  switch (event.event) {
    case 'payment.captured':
      await handlePaymentCaptured(event.payload.payment.entity);
      break;

    case 'payment.failed':
      await handlePaymentFailed(event.payload.payment.entity);
      break;

    case 'subscription.activated':
      await handleSubscriptionActivated(event.payload.subscription.entity);
      break;

    case 'subscription.cancelled':
      await handleSubscriptionCancelled(event.payload.subscription.entity);
      break;
  }

  return Response.json({ received: true });
}

async function handlePaymentCaptured(payment: any) {
  await db.query(
    `UPDATE payments SET status = 'completed' WHERE gateway_payment_id = $1`,
    [payment.id]
  );
}

async function handlePaymentFailed(payment: any) {
  await db.query(
    `UPDATE payments SET status = 'failed' WHERE gateway_payment_id = $1`,
    [payment.id]
  );
}

async function handleSubscriptionActivated(subscription: any) {
  const userId = subscription.notes.user_id;
  await db.query(
    `UPDATE users SET subscription_status = 'active' WHERE id = $1`,
    [userId]
  );
}

async function handleSubscriptionCancelled(subscription: any) {
  const userId = subscription.notes.user_id;
  await db.query(
    `UPDATE users SET subscription_status = 'cancelled' WHERE id = $1`,
    [userId]
  );
}
```

```typescript
// api/webhooks/paypal.ts
import { paypalService } from '@/lib/payments/paypal';
import { db } from '@/lib/neon';

export async function POST(req: Request) {
  const body = await req.json();

  // Verify webhook (PayPal provides verification SDK)
  // For production, implement proper webhook verification

  switch (body.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      await handlePaymentCompleted(body.resource);
      break;

    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      await handleSubscriptionActivated(body.resource);
      break;

    case 'BILLING.SUBSCRIPTION.CANCELLED':
      await handleSubscriptionCancelled(body.resource);
      break;
  }

  return Response.json({ received: true });
}

async function handlePaymentCompleted(payment: any) {
  await db.query(
    `UPDATE payments SET status = 'completed' WHERE gateway_payment_id = $1`,
    [payment.id]
  );
}

async function handleSubscriptionActivated(subscription: any) {
  const userId = subscription.custom_id;
  await db.query(
    `UPDATE users SET subscription_status = 'active' WHERE id = $1`,
    [userId]
  );
}

async function handleSubscriptionCancelled(subscription: any) {
  const userId = subscription.custom_id;
  await db.query(
    `UPDATE users SET subscription_status = 'cancelled' WHERE id = $1`,
    [userId]
  );
}
```

---

### 3. Frontend Components

```typescript
// src/components/payments/RazorpayCheckout.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayCheckout({ plan }: { plan: 'pro' | 'enterprise' }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Create order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const { order, region } = await response.json();

      if (region !== 'india') {
        // Redirect to PayPal
        window.location.href = '/payment/paypal?plan=' + plan;
        return;
      }

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'eComJunction',
          description: `${plan.toUpperCase()} Plan Subscription`,
          order_id: order.id,
          handler: async (response: any) => {
            // Verify payment
            await fetch('/api/payments/verify-razorpay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan,
              }),
            });

            // Redirect to success page
            window.location.href = '/payment/success';
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: '#6366F1',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Subscribe Now'}
    </Button>
  );
}
```

```typescript
// src/components/payments/PayPalCheckout.tsx
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

export function PayPalCheckout({ plan }: { plan: 'pro' | 'enterprise' }) {
  return (
    <PayPalScriptProvider
      options={{
        'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
        currency: 'USD',
        intent: 'capture',
      }}
    >
      <PayPalButtons
        createOrder={async () => {
          const response = await fetch('/api/payments/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan }),
          });

          const { order } = await response.json();
          return order.id;
        }}
        onApprove={async (data) => {
          await fetch('/api/payments/verify-paypal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: data.orderID,
              plan,
            }),
          });

          window.location.href = '/payment/success';
        }}
        onError={(err) => {
          console.error('PayPal error:', err);
        }}
      />
    </PayPalScriptProvider>
  );
}
```

```typescript
// src/components/payments/PaymentGatewaySelector.tsx
import { useEffect, useState } from 'react';
import { RazorpayCheckout } from './RazorpayCheckout';
import { PayPalCheckout } from './PayPalCheckout';

export function PaymentGatewaySelector({
  plan,
}: {
  plan: 'pro' | 'enterprise';
}) {
  const [region, setRegion] = useState<'india' | 'international' | null>(null);

  useEffect(() => {
    // Detect user region
    fetch('/api/user/region')
      .then((res) => res.json())
      .then((data) => setRegion(data.region));
  }, []);

  if (!region) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {region === 'india' ? (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pay with Razorpay</h3>
          <p className="text-sm text-gray-600 mb-4">
            Supports UPI, Cards, Net Banking, and Wallets
          </p>
          <RazorpayCheckout plan={plan} />
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pay with PayPal</h3>
          <p className="text-sm text-gray-600 mb-4">
            Secure international payments
          </p>
          <PayPalCheckout plan={plan} />
        </div>
      )}
    </div>
  );
}
```

---

### 4. Pricing Page Update

```typescript
// src/pages/Pricing.tsx
import { PaymentGatewaySelector } from '@/components/payments/PaymentGatewaySelector';

export function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-12">
        Choose Your Plan
      </h1>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <PricingCard
          name="Free"
          priceINR="₹0"
          priceUSD="$0"
          features={[...]}
          onSelect={() => {}}
        />

        {/* Pro Plan */}
        <PricingCard
          name="Pro"
          priceINR="₹1,499"
          priceUSD="$19"
          features={[...]}
          onSelect={() => setSelectedPlan('pro')}
        />

        {/* Enterprise Plan */}
        <PricingCard
          name="Enterprise"
          priceINR="₹7,999"
          priceUSD="$99"
          features={[...]}
          onSelect={() => setSelectedPlan('enterprise')}
        />
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subscribe to {selectedPlan} Plan</DialogTitle>
            </DialogHeader>
            <PaymentGatewaySelector plan={selectedPlan as any} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
```

---

## Testing

### Razorpay Test Mode

```env
# Test credentials
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=test_secret_key
```

**Test Cards:**
- Success: 4111 1111 1111 1111
- Failure: 4000 0000 0000 0002

### PayPal Sandbox

```env
# Sandbox credentials
PAYPAL_CLIENT_ID=sandbox_client_id
PAYPAL_CLIENT_SECRET=sandbox_secret
PAYPAL_MODE=sandbox
```

**Test Accounts:** Create in PayPal Developer Dashboard

---

## Deployment Checklist

- [ ] Create Razorpay account
- [ ] Create PayPal business account
- [ ] Set up payment plans in both gateways
- [ ] Configure webhook URLs
- [ ] Set environment variables
- [ ] Test payment flows (India & International)
- [ ] Test subscription management
- [ ] Test refunds
- [ ] Verify webhook handling
- [ ] Set up invoice generation
- [ ] Test in production mode

---

## Cost Comparison

| Gateway | Region | Transaction Fee | Settlement |
|---------|--------|----------------|------------|
| Razorpay | India | 2% + ₹0 | T+1 to T+7 days |
| PayPal | International | 2.9% + $0.30 | Instant to 3 days |

**Example (Pro Plan):**
- India (₹1,499): Fee = ₹30, Net = ₹1,469
- International ($19): Fee = $0.85, Net = $18.15

---

**Status:** Ready to implement  
**Estimated Time:** 1 week  
**Dependencies:** Razorpay account, PayPal account
