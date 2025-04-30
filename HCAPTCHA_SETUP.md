# hCaptcha Setup for DocProche

This document explains how to set up hCaptcha for DocProche's login and registration forms.

## Configuration

1. Create a `.env.local` file in the root of the project with the following environment variables:

```
# HCaptcha configuration
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_site_key_here
HCAPTCHA_SECRET_KEY=your_secret_key_here
```

2. Replace `your_site_key_here` with your hCaptcha site key and `your_secret_key_here` with your hCaptcha secret key.

## Development Mode

For development or testing, you can use hCaptcha's test keys:

```
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=10000000-ffff-ffff-ffff-000000000001
HCAPTCHA_SECRET_KEY=0x0000000000000000000000000000000000000000
```

These test keys will always pass verification without showing an actual CAPTCHA challenge.

## Supabase Integration

The hCaptcha integration works with Supabase Auth in the following ways:

1. When a user registers, the captcha token is sent to the server API endpoint (`/api/auth/register`).
2. The server verifies the token with hCaptcha's API before proceeding with registration.
3. The captcha token is also passed to Supabase Auth when creating the user.
4. For login, the captcha token is passed directly to Supabase Auth's `signInWithPassword` method.

## Troubleshooting

If you encounter issues with hCaptcha:

1. Check that your environment variables are correctly set.
2. Ensure your site is on the allowlist in your hCaptcha dashboard.
3. For local development, you may need to use a service like ngrok to expose your local server with HTTPS.
4. Check browser console for any errors related to hCaptcha.

## Additional Resources

- [hCaptcha Documentation](https://docs.hcaptcha.com/)
- [hCaptcha React Component](https://github.com/hCaptcha/react-hcaptcha)
- [Supabase Auth Captcha](https://supabase.com/docs/guides/auth/auth-captcha) 