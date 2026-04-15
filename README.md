# CardNest Crypto Validation

CardNest Crypto Validation is a hosted security-check flow that lets your users validate a recipient crypto address before continuing with a transfer.

The integration pattern is simple:
1. Your app starts a secure CardNest session for a merchant.
2. CardNest returns a one-time `session_id`.
3. You redirect the user to the CardNest validation page with that `session_id`.
4. CardNest verifies access, checks the wallet address, optionally requests a memo/tag, and shows an approved or rejected result.

## What customers need

Customers integrating this solution need:

- A registered `merchant_id`.
- A backend or server-side route that can call CardNest session creation.
- A way to open the CardNest experience in a browser, embedded webview, or redirect flow.
- A wallet address ready to validate from their own checkout or transfer flow.
- Optional memo/tag support for chains that require it.

## How it works

The current app uses two session endpoints:

- `POST /api/session` creates a secure session after validating the merchant.
- `GET /api/session?session_id=...` confirms the session before the UI loads.

After access is confirmed, the page:

- accepts a wallet address,
- checks whether the address requires a memo/tag,
- sends the address to the validation service,
- shows an approval or rejection result.

## Integration flow

### 1. Customer starts from their app

The customer clicks something like:

- `Validate wallet`
- `Review recipient address`
- `Continue with secure check`

### 2. Their backend requests a CardNest session

The merchant should create the session server-side so the `merchant_id` is not exposed in the frontend.

Example:

```js
const response = await fetch('https://crypto.cardnest.io/api/session', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ merchant_id: 'YOUR_MERCHANT_ID' }),
});

const data = await response.json();
```

The response returns:

```json
{
	"success": true,
	"session_id": "...",
	"redirect_to": "/?session_id=..."
}
```

### 3. Redirect or open the CardNest page

Use the returned `redirect_to` value, or build the URL yourself:

```js
window.location.href = `https://crypto.cardnest.io/?session_id=${encodeURIComponent(sessionId)}`;
```

For mobile, open the same URL in:

- an in-app browser,
- a secure webview,
- or the device browser, depending on the UX you want.

### 4. User validates the address

Inside CardNest, the user:

- pastes the recipient wallet address,
- sees whether a memo/tag is required,
- adds the memo/tag if needed,
- starts validation.

### 5. CardNest returns the result

If the address passes validation, the UI shows an approved state with security details.

If the address fails, the UI shows a rejection state with the reason.

## Web integration example

```js
async function startValidation() {
	const response = await fetch('/api/cardnest/session', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ merchant_id: 'YOUR_MERCHANT_ID' }),
	});

	const data = await response.json();

	if (!response.ok || !data.success) {
		throw new Error(data.error || 'Unable to start validation');
	}

	window.location.href = data.redirect_to;
}
```

## Mobile integration example

Mobile apps usually follow the same backend flow:

1. The app calls your server.
2. Your server requests a CardNest session.
3. Your app opens the returned URL in a browser or webview.
4. The user completes validation.

Example flow:

```text
Mobile app -> Your backend -> CardNest session API -> redirect URL -> CardNest validation screen
```

## What your backend should do

Your backend should:

- keep `merchant_id` private,
- request a session only when the user is ready to validate,
- pass the `session_id` to the CardNest page,
- handle the result after the user returns to your app if you use a return URL or callback flow.

## What your frontend should do

Your frontend should:

- send the user into the CardNest validation screen,
- wait for the approval or rejection result,
- continue only when the address is approved,
- stop or warn the user when the address is rejected.

## Expected inputs from the customer

- `merchant_id`: identifies the merchant account.
- `session_id`: one-time access token for the validation page.
- `wallet address`: the recipient address the customer wants to validate.
- `memo/tag`: only when the chain requires it.

## User experience summary

From the customer's point of view, the flow is:

1. They choose a recipient address in your app.
2. They are redirected to CardNest for secure validation.
3. CardNest checks whether the address is allowed.
4. CardNest returns approval or rejection.
5. Your app continues the transfer only if the result is approved.

## Running locally

```bash
npm install
npm run dev
```

Open [https://crypto.cardnest.io](https://crypto.cardnest.io) to view the app.

## Files that control the flow

- [src/app/page.js](src/app/page.js) handles the customer-facing validation screen.
- [src/app/api/session/route.js](src/app/api/session/route.js) creates and verifies sessions.
- [src/lib/session.js](src/lib/session.js) stores the session helper logic.

## Notes for production

- Use HTTPS for all redirects and API calls.
- Keep merchant credentials on the server.
- Treat `session_id` as short-lived and one-time use.
- Decide whether you want a browser redirect, embedded webview, or return-to-app flow for mobile.
