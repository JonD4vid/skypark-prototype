# SkyPark Phase 1 prototype

Vue 3 click-through of the SkyPark digital parking payment and validation product. It rebuilds the existing HTML/React prototype as a standard Vue project, covering the customer payment journey and the operations admin portal.

This is a **frontend prototype**. Lookup, payment, and entervo posting are mocked so every success and failure path can be demonstrated without S&B or PowerTranz credentials.

## Run locally

```bash
cd skypark-prototype
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

| Path | What it is |
|---|---|
| `/` | Customer pay (mobile-first) |
| `/admin` | Operations portal (desktop-first) |

Use **Demo scenarios** (bottom right) to drive lookup failures, validation outcomes, wallet availability, payment declines, and the paid-but-entervo-failed state.

## What is in Phase 1

Customer: QR / barcode scan, pay by plate (LPR facilities only), ticket number, lost-plate phone search, session found, optional validation, PowerTranz-hosted card payment, confirmation, digital receipt, optional account with saved plates, history, and prepaid credit.

Admin: dashboard, transactions with separate PowerTranz and entervo statuses, customers, organisations and validation codes, validation rules, credit liability, audit history, facility configuration.

## Intentionally absent

AutoPay, automatic vehicle identification, tenant/staff monthly permit registration, and barrier control. These depend on interfaces that are not confirmed. They are omitted, not greyed out.

Amount due is always read-only and attributed to entervo. "You may now exit" is shown only after the parking system has accepted the payment notification.

## Stack

Vue 3, Vue Router, Pinia, Vite. No backend. TTD amounts.
