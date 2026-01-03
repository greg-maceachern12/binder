# Payment Functionality Removal - Free Site Mode

## Overview
All payment functionality has been **commented out** to make this a free site. Users can now:
- Generate unlimited courses (both Quick Primer and Full Course)
- Access all features without subscription
- Still see upsells to premium content (UpsellDialog remains functional)

All payment code is preserved in comments and can be restored by uncommenting the marked sections.

## Files Modified

### 1. `/src/app/context/AuthContext.tsx`
**Changes:**
- Commented out all subscription verification logic
- Made `subscriptionStatus` always return `'active'`
- Made `hasAccess` and `hasPremium` always return `true`

**To Restore:**
Uncomment the large block starting at line 42 (marked with "PAYMENT FUNCTIONALITY DISABLED")

---

### 2. `/src/app/api/generate-lesson/route.ts`
**Changes:**
- Commented out `verifySubscription` import
- Commented out subscription status checks before generating lessons

**To Restore:**
- Uncomment the import at line 4
- Uncomment the subscription verification block (lines 17-51)

---

### 3. `/src/app/api/generate-syllabus/route.ts`
**Changes:**
- Commented out trial deactivation logic (users on trials won't lose access after first generation)

**To Restore:**
Uncomment the block at line 145-166 (trial deactivation logic)

---

### 4. `/src/app/components/SyllabusForm.tsx`
**Changes:**
- Commented out `hasAccess` and `hasPremium` checks in `handleSubmit`
- Removed restriction on Full Course selection (everyone can select it)
- Commented out 403 subscription error handling
- Removed disabled styling from Full Course button

**To Restore:**
- Uncomment blocks at lines 122-134 (access checks)
- Uncomment lines 154-159 (403 error handling)
- Uncomment lines 304-313 (premium restriction on Full Course)
- Restore the conditional styling at line 317-320

---

### 5. `/src/app/dashboard/page.tsx`
**Changes:**
- Hid all subscription status banners (inactive, trial, active)

**To Restore:**
Uncomment the banner blocks at lines 82-135

---

## Files NOT Modified (Still Functional)

### Preserved for Upsells
These files remain functional to show premium content upsells:

1. **`/src/app/components/UpsellDialog.tsx`** - Still displays, can be triggered manually to promote premium features
2. **`/src/app/api/subscription/verify/route.ts`** - API endpoint preserved (not called anymore)
3. **`/src/app/api/webhook/polar/route.ts`** - Webhook endpoint preserved for future use
4. **`/src/app/lib/polar/client.ts`** - Polar SDK client preserved
5. **`/src/app/components/Header.tsx`** - Premium badges still show (since everyone is "premium" now)

---

## How to Restore Payment Functionality

1. Search for comments containing `PAYMENT FUNCTIONALITY DISABLED`
2. Uncomment each block marked with these comments
3. Ensure environment variables are set:
   - `NEXT_POLAR_ACCESS_TOKEN`
   - `POLAR_WEBHOOK_SECRET` (optional)

---

## Environment Variables
The following Polar-related environment variables are still in `.env.local` but are not currently being used:
- `NEXT_POLAR_ACCESS_TOKEN` - For Polar API integration
- Polar subscription URL is hardcoded in components (can be changed if needed)

---

## User Experience Changes

### Before (Paid)
- Free trial: 1 course generation
- After trial: Subscription required
- Full Course: Premium only

### After (Free)
- Unlimited course generations
- All course types available
- No subscription required
- UpsellDialog can still show to promote additional premium features

---

## Notes
- The database schema fields (`subscription_id`, `trial_active`, `polar_id`) remain unchanged
- Existing user subscription data is preserved in the database
- The Polar webhook can still receive events and update the database
- All commented code follows the same style: clear markers with `PAYMENT FUNCTIONALITY DISABLED`
