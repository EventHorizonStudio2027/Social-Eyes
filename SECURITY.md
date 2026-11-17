# Security policy

Social Eyes is under private Phase 1 development.

## Never commit

- Supabase service-role or secret API keys
- Access tokens, GitHub credentials, private signing keys
- `.env` files containing real values
- Passwords, test-user credentials, or session tokens

Only the public Supabase publishable key belongs in a client build. Authorization must be enforced by Supabase Row Level Security; client-side checks are not an authorization boundary.

## Reporting

Report suspected credential exposure privately to the repository owner. Rotate exposed credentials before removing them from the Git history.

## Release criteria

No public release until reproducible dependency installation, TypeScript compilation, Expo validation, authentication and two-user RLS testing, and real-device startup are verified.
