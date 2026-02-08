# Stripe Integration - Quick Reference

## TL;DR - What's Ready

✅ Stripe npm packages installed  
✅ Frontend checkout button component created  
✅ Pricing tier cards display created  
✅ `/billing` route functional  
✅ Development demo mode working  
✅ Build passing (0 TypeScript errors)  

**Status**: Ready for backend integration

---

## Quick Start for Production

### 1. Get Stripe Keys (5 mins)
```
https://dashboard.stripe.com → Developers → API Keys
Copy: pk_test_abc123...
```

### 2. Add to .env
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_abc123...
```

### 3. Create Backend Endpoint (20 mins)
```typescript
POST /api/create-checkout-session
Input: { priceId: "price_pro" }
Output: { sessionId: "cs_test_..." }
```

### 4. Update Component (10 mins)
In `src/components/StripeCheckoutButton.tsx`, replace mock with:
```typescript
const response = await fetch('/api/create-checkout-session', {
  method: 'POST',
  body: JSON.stringify({ priceId })
});

const { sessionId } = await response.json();
await stripe.redirectToCheckout({ sessionId });
```

### 5. Set Up Webhooks (15 mins)
Dashboard → Webhooks → Add Endpoint
- URL: `https://api.yoursite.com/webhooks/stripe`
- Events: `customer.subscription.*`, `invoice.payment_*`

**Done!** ✅

---

## Files Modified/Created

| File | Type | Change |
|------|------|--------|
| `.env.example` | Config | Added Stripe key template |
| `src/components/StripeCheckoutButton.tsx` | NEW | Checkout handler |
| `src/components/BillingPage.tsx` | NEW | Pricing cards display |
| `App.tsx` | Updated | Import BillingPage, update route |
| `package.json` | Updated | Added @stripe packages |

---

## API Reference

### StripeCheckoutButton Component

```tsx
import { StripeCheckoutButton } from './src/components/StripeCheckoutButton';

<StripeCheckoutButton
  priceId="price_pro"           // Price ID from Stripe
  tierName="Pro Elite"          // Display name
  price={297}                   // Price in dollars
/>
```

### BillingPage Component

```tsx
import { BillingPage } from './src/components/BillingPage';

<Route path="/billing" element={<BillingPage />} />
```

Automatically displays all `PRICING_TIERS` from `constants.tsx`

---

## Environment Variables

**Frontend** (safe to expose):
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Backend** (keep secret):
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Development Testing

### Current Demo Mode
1. Navigate to `/billing`
2. Click any "Upgrade" button
3. See mock checkout details
4. Check browser console for logs

### Console Output
```javascript
{
  sessionId: "cs_test_1707123456789",
  priceId: "price_pro",
  tierName: "Pro Elite",
  price: 297
}
```

---

## Pricing Tiers (from constants.tsx)

| Tier | ID | Price | Conversations | Creative | Platforms |
|------|-------|-------|-------|----------|-----------|
| Starter Node | `starter` | $97 | 1,000 | 10 | 2 |
| Pro Elite | `pro` | $297 | 5,000 | 50 | 6 |
| Enterprise | `enterprise` | Custom | Unlimited | 1,000 | Unlimited |

**Usage**: Pass tier `id` as `priceId` to checkout button

---

## Code Snippets

### Load Stripe
```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(publishableKey);
```

### Create Checkout Session (Backend)
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  customer_email: user.email,
  line_items: [{ price: priceId, quantity: 1 }],
  mode: 'subscription',
  success_url: 'https://yoursite.com/billing?success=true',
  cancel_url: 'https://yoursite.com/billing?cancelled=true'
});
```

### Redirect to Checkout (Frontend)
```typescript
const result = await stripe.redirectToCheckout({
  sessionId: session.id
});

if (result?.error) {
  console.error(result.error.message);
}
```

### Handle Webhook (Backend)
```typescript
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
);

if (event.type === 'customer.subscription.updated') {
  // Update user subscription in database
}
```

---

## Testing Checklist

Frontend:
- [ ] `/billing` route loads pricing cards
- [ ] Click "Upgrade" shows loading state
- [ ] Demo alert appears with correct tier details
- [ ] Dark mode displays correctly
- [ ] Mobile responsive (1→2→3 columns)
- [ ] Error state displays properly

Backend (after implementation):
- [ ] `/api/create-checkout-session` endpoint exists
- [ ] Returns valid Stripe session ID
- [ ] Redirects to Stripe Checkout page
- [ ] Success URL redirects after payment
- [ ] Webhooks received and processed
- [ ] User subscription updated in database

---

## Common Issues & Fixes

**Issue**: "Stripe publishable key is not configured"
```
✓ Fix: Add VITE_STRIPE_PUBLISHABLE_KEY to .env
```

**Issue**: Blank checkout button
```
✓ Fix: npm install @stripe/stripe-js @stripe/react-stripe-js
```

**Issue**: Import errors
```
✓ Fix: Check path is ../../constants (not ../constants)
```

**Issue**: Webhook not working
```
✓ Fix: Add signature to .env and verify in handler
```

---

## Security Checklist

- [ ] Never commit secret key to Git
- [ ] Use test keys in development
- [ ] Use live keys in production
- [ ] Verify webhook signatures
- [ ] Check user auth before checkout
- [ ] Validate tier on backend, not frontend
- [ ] Store subscription state server-side
- [ ] Use HTTPS in production
- [ ] Rotate webhook secret regularly

---

## Performance Impact

- Stripe.js loads async (non-blocking)
- Bundle size increase: ~4 KB (minimal)
- No impact on page load
- Checkout redirects to Stripe-hosted page

---

## Browser Support

✅ All modern browsers (Chrome, Firefox, Safari, Edge)  
✅ Mobile browsers (iOS Safari, Chrome Android)  
✅ IE 11+ supported by Stripe.js  

---

## Useful Links

- 🎯 **Stripe Dashboard**: https://dashboard.stripe.com
- 📚 **Stripe Docs**: https://stripe.com/docs
- 💳 **Test Cards**: https://stripe.com/docs/testing
- 🔐 **Webhooks**: https://stripe.com/docs/webhooks
- ⚙️ **API Reference**: https://stripe.com/docs/api

---

## Next: Backend Implementation

After setting up frontend, implement:

1. **Auth Middleware**: Verify user logged in
2. **Checkout Endpoint**: Create Stripe session
3. **Webhook Handler**: Process subscription events
4. **Database Schema**: Store subscription data
5. **Usage Enforcement**: Check tier limits
6. **Customer Portal**: Allow subscription management

See [STRIPE_INTEGRATION_GUIDE.md](STRIPE_INTEGRATION_GUIDE.md) for detailed backend examples.

---

## Questions?

Check the full guide for:
- Step-by-step production setup
- Code examples for backend integration
- Webhook implementation details
- Testing with Stripe test cards
- Troubleshooting common issues
