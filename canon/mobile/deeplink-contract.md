# Deep Link Contract (Mobile-Core)

## Schemes
- lumariq://auth/callback?token=JWT&refresh=REFRESH
- lumariq://order/{id}
- lumariq://ride/{id}
- lumariq://wallet

## Universal Links
- https://app.lumariq.ai/auth/callback?token=...
- https://app.lumariq.ai/order/{id}

## Rules
- Token only delivered once; client stores in secure storage.
- If token missing/expired: redirect to /auth/login.
