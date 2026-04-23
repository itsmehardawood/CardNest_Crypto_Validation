# CardNest Crypto Validation: Client Integration Guide

This guide outlines the production-ready integration process for CardNest Crypto Validation. Ensure all implementations strictly follow the security protocols listed below to maintain the integrity of the validation flow.

## 1. Overview

CardNest Crypto Validation provides a hosted, secure environment for users to validate cryptocurrency addresses before completing transfers. This service removes the burden of managing complex validation logic while ensuring high security for both merchants and end-users.

## 2. Security Best Practices

- Zero Frontend Exposure: Never expose your merchant_id in frontend code or client-side logs.
- Server-to-Server Only: Always create sessions from your backend/server only.
- Protocol Requirement: Use HTTPS for all requests and redirects.
- Session Lifecycle: session_id is single-use and should be treated as short-lived.

## 3. Prerequisites

- Merchant ID: Your merchant_id stored securely on the backend.
- Backend Infrastructure: A server-side environment to call the CardNest session API.
- Client Interface: Frontend Web or Mobile that can open the redirect URL or WebView.

## 4. Integration Flow

1. Backend Session Creation: Your server calls the CardNest API to generate a unique session.
2. Secure Redirect: Your frontend receives a relative path and sends the user to the CardNest hosted page.
3. User Input: The user enters wallet details within the secure CardNest environment.
4. Validation and Callback: CardNest validates the data and returns the result via a callback.

Note on Timing: The callback is dispatched approximately 2.5 seconds after the result modal appears to ensure the user has time to view the validation status.

## 5. API Integration (Backend)

Base URL: https://crypto.cardnest.io

Endpoint: /api/session

Method: POST

Request Body (JSON):

```json
{
	"merchant_id": "YOUR_PRODUCTION_ID"
}
```

Response (JSON):

```json
{
	"success": true,
	"session_id": "sess_123abc456def",
	"redirect_to": "/?session_id=sess_123abc456def"
}
```

Implementation Note: The redirect_to field returns a relative path. Your frontend must append this to the base URL (https://crypto.cardnest.io) to form the full destination.

## 6. Frontend Integration

The frontend should call your backend endpoint (for example, /api/start-session). Your backend then calls the CardNest session API with the merchant_id.

JavaScript Example:

```javascript
async function startValidation() {
	try {
		const response = await fetch('/api/start-session');

		if (!response.ok) {
			throw new Error('Failed to initialize session');
		}

		const data = await response.json();

		if (data.success && data.redirect_to) {
			window.location.href = `https://crypto.cardnest.io${data.redirect_to}`;
		}
	} catch (error) {
		console.error('Integration Error:', error);
	}
}
```

## 7. Callback Handling

Web (JavaScript)

CardNest sends the callback in two ways:

- Same-origin parent: direct `window.parent.handleApiResponse(jsonString)` call.
- Cross-origin iframe: `window.postMessage` payload with `{ source: 'cardnest-crypto-validation', type: 'handleApiResponse', status: true, encrypted_data: '...', data: jsonString }`.

Implement both handlers on the parent page if you embed CardNest in an iframe.

```javascript
window.handleApiResponse = function (jsonString) {
	const jsonData = JSON.parse(jsonString);
	if (jsonData.status === true) {
		const encryptedData = jsonData.encrypted_data;
	}
};

window.addEventListener('message', function (event) {
	if (event?.data?.source === 'cardnest-crypto-validation' && event?.data?.type === 'handleApiResponse') {
		const encryptedData = event.data.encrypted_data;
		const jsonData = event.data.data ? JSON.parse(event.data.data) : null;
		if (jsonData?.status === true) {
			// encryptedData is also available directly on event.data
		}
	}
});
```

No CardNest-side merchant allowlist or special iframe permission is required for the callback itself. Your parent page must simply allow the iframe to load and listen for the message event when the iframe is cross-origin.

Android (Kotlin/Java)

Register the Javascript Interface with the name "Android".

Step 1: Register Interface

```kotlin
webView.addJavascriptInterface(WebAppInterface(), "Android")
```

Step 2: Handle the Data

```kotlin
@JavascriptInterface
fun handleApiResponse(jsonString: String) {
	val jsonData = JSONObject(jsonString)
	if (jsonData.getBoolean("status")) {
		val encryptedData = jsonData.optString("encrypted_data", "")
	}
}
```

## 8. Decryption and Processing

- Transmission: Send encrypted_data to your backend.
- Decryption: Decrypt the payload using your secret key.
- Finalization: Proceed with the transaction if the decrypted status is approved.
