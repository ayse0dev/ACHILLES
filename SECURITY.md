# ACHILLES Security Checklist

Status: **Done** = in the code now. **Planned** = you or the host must do it. **N/A** = does not apply to this stack.
Priority: **Critical** do first, **High**, **Medium**, **Low**.

ACHILLES is a Next.js app with Airtable as the database, PayMongo for payments, and Brevo for email. There is no WordPress, PHP, SQL database or file upload, so some items from the brief do not apply.

## Plain-language summary

- The site now sends strict browser security headers, forces HTTPS in production, and limits how fast anyone can try logins, forms, checkout and the chat.
- Logins already need a password plus an emailed code. Admin and staff sessions now end after 8 hours, or after 30 minutes of no activity.
- Spam bots are caught by a hidden field. Customers must agree to the Privacy Policy before registering or booking a repair.
- Staff actions (repair, order, stock, ticket and role changes, plus logins and failed logins) are written to an `AuditLog` table. Staff see masked customer emails; only admins see full ones.
- Card details never touch your server. PayMongo hosts the payment page and the webhook is signature-checked.
- Things only you can do: put the site behind Cloudflare, use a host with backups, turn on 2FA on every account (Airtable, PayMongo, Brevo, domain, GitHub), set up SPF/DKIM/DMARC on your own domain, and rotate the Brevo key that appeared in a screenshot.

## 1. Hosting and infrastructure

| Item | Status | Priority | Notes |
|---|---|---|---|
| HTTPS everywhere | Planned | Critical | Vercel and most hosts issue free TLS certificates. `proxy.ts` also redirects `http` to `https` in production. |
| HSTS | Done | Critical | `next.config.ts` sends `max-age=63072000; includeSubDomains; preload`. Only submit to the preload list when every subdomain is HTTPS. |
| Backups with tested restore | Planned | High | Code is in Git. Data lives in Airtable: use Airtable's snapshots plus a weekly CSV export of every table to cloud storage. Test restoring into a copy base. |
| WAF / CDN / DDoS | Planned | High | Cloudflare Free covers DDoS and basic bot rules (about 0 PHP/month). Pro is about USD 20/month if you need a managed WAF ruleset. |
| Patching | Planned | High | Run `npm audit` monthly and enable GitHub Dependabot (free). See "Known issues" below. |
| Directory listing, file permissions | N/A | Low | Next.js serves only built routes. On a managed host there is no web directory to list. |
| Staging vs production | Planned | Medium | Use a Vercel preview deployment with a separate Airtable base and PayMongo test keys. |

## 2. Authentication and access

| Item | Status | Priority | Notes |
|---|---|---|---|
| 2FA for admin/staff | Done | Critical | Every login needs password plus an emailed one-time code. |
| Strong passwords | Done | High | Minimum 8 characters, stored with bcrypt. Admins should use long passphrases. |
| Least-privilege roles | Done | High | customer / staff / admin enforced on every server action. Admins are locked to the admin area. Do not share logins. |
| Login attempt limits | Done | Critical | 15 tries per IP and 6 per email per 15 minutes on the login form, plus 8 per email on the final sign-in step. |
| CAPTCHA | Planned | Medium | Honeypot is in place. Add Cloudflare Turnstile (free) if spam continues. |
| No default "admin" username | Done | Medium | Accounts are identified by email. |
| IP restriction for admin | Planned | Low | Cloudflare Access (free for up to 50 users) can restrict `/admin`. |
| Idle logout, session length | Done | High | JWT sessions last 8 hours. `IdleLogout` signs out after 30 minutes idle. |
| Secure cookies | Done | High | NextAuth sets HttpOnly and SameSite=Lax cookies, and Secure automatically when `NEXTAUTH_URL` is https. |

## 3. Forms and input

| Item | Status | Priority | Notes |
|---|---|---|---|
| Server-side validation | Done | Critical | Every action validates with zod. |
| CSRF | Done | Critical | Next.js server actions check the Origin header. Session cookies are SameSite=Lax. |
| Rate limit and honeypot | Done | High | Register, repair, contact, support, reviews, tracking, checkout, chat. Limits are in memory: on several servers move them to Upstash Redis (free tier). |
| File uploads | N/A | Medium | There is no upload. The repair form takes a photo URL only, validated as a URL. If uploads are added later: allow jpg/png/webp, check type and size, rename files, store in private storage, and scan. |
| XSS | Done | Critical | React escapes output and nothing uses `dangerouslySetInnerHTML`. Airtable formulas escape user text through `formulaString`. |

## 4. Payments and data protection

| Item | Status | Priority | Notes |
|---|---|---|---|
| No card data on our servers | Done | Critical | PayMongo hosted checkout handles cards, GCash and Maya. |
| Webhook signature check | Done | Critical | `app/api/paymongo/webhook/route.ts` verifies the signature. |
| GCash / Maya | Done | High | Enabled through PayMongo hosted checkout. Turn each method on in the PayMongo dashboard, and complete business verification before going live. |
| Data minimisation | Done | Medium | Only name, email, phone, items and notes are collected. |
| Encryption in transit and at rest | Done | High | TLS in transit. Airtable encrypts at rest. |
| RA 10173 compliance | Done / Planned | High | Privacy Policy at `/privacy` and consent checkboxes are in. Still needed: register with the National Privacy Commission if you qualify, name a data protection officer, and keep a retention schedule. |
| Mask personal data in admin | Done | Medium | Staff see masked emails. Admins see full data. |
| Log access to sensitive records | Partly done | Medium | Changes and logins are logged. Plain views are not logged, because the dashboard refreshes every 20 seconds. |

## 5. Application hardening

| Item | Status | Priority | Notes |
|---|---|---|---|
| Security headers | Done | Critical | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP in `next.config.ts`. |
| SQL injection | N/A | n/a | No SQL. Airtable queries are built with escaped values. |
| Plugins, CMS, XML-RPC, file editing | N/A | n/a | Not a CMS. |
| Remove unused dependencies | Planned | Low | Google and Facebook login providers load only when their keys are set. |

**CSP trade-off:** it allows inline scripts and styles because Next.js needs them without a nonce setup. Images can come from any https site (Airtable attachment URLs). A nonce-based CSP is stricter but makes every page dynamic and slower. If something breaks after deploy (fonts, images, checkout), look at the browser console for "Refused to load" and adjust the matching directive.

## 6. Monitoring, logging and response

| Item | Status | Priority | Notes |
|---|---|---|---|
| Security logging | Done | High | `AuditLog` table: login success and failure, repair, order, stock, ticket and role changes. |
| Uptime and alerts | Planned | High | UptimeRobot free plan, 5-minute checks. |
| Vulnerability and malware scans | Planned | Medium | GitHub Dependabot and `npm audit` (free). Optional paid scanner: Snyk free tier. |
| Incident response plan | Planned | High | Write one page: who is called, how to rotate keys, how to restore, and how to notify customers and the National Privacy Commission (within 72 hours of a confirmed breach). |
| 3-2-1 backups | Planned | High | Git (code) + Airtable snapshot + weekly CSV export to a separate cloud drive. |

## 7. Email and domain

| Item | Status | Priority | Notes |
|---|---|---|---|
| SPF, DKIM, DMARC | Planned | Critical | Brevo warned that a Gmail sender fails DMARC. Buy a domain (about PHP 600 to 900 per year), authenticate it in Brevo, add the DNS records, then set `MAIL_FROM` to an address on it. |
| Registrar lock and 2FA | Planned | High | Turn both on at your registrar and DNS provider. |
| Secure SMTP | Done | High | Brevo relay on port 587 with STARTTLS. Customers are emailed individually. |

## 8. Third parties and secrets

| Item | Status | Priority | Notes |
|---|---|---|---|
| Secrets in env variables | Done | Critical | `.env.local` is git-ignored. Set the same variables in your host's dashboard. |
| Rotate keys | Planned | Critical | Rotate the Brevo SMTP key now (it appeared in a screenshot). Then every 6 to 12 months. |
| Minimum API scopes | Planned | High | Make the Airtable token scoped to this base only, with data read and write but not schema or webhook access. Never expose the PayMongo secret key; use the public key only in browsers (this site never needs it). |
| Vet integrations | Planned | Medium | Review Airtable, PayMongo, Brevo and Google (chat) privacy and security pages. |

## Airtable tables to add

- `AuditLog`: `Actor`, `Action`, `Target`, `Detail` (text), `CreatedAt` (text or date).

## Known issues

- `npm audit` reports 2 high findings in `nodemailer` (a dependency of next-auth). The site does not use next-auth's email login, so the risk is low, but upgrading `nodemailer` directly to the latest version is worth doing and testing against Brevo.
- Rate limits reset when the server restarts, and are per server instance.

## Estimated cost and time

| Task | Cost | Time |
|---|---|---|
| Cloudflare Free | 0 | 1 hour |
| UptimeRobot, Dependabot, Turnstile | 0 | 1 hour |
| Domain for email + SPF/DKIM/DMARC | about PHP 600 to 900 per year | 1 to 2 hours |
| Upstash Redis for shared rate limits | 0 on the free tier | 1 hour |
| Cloudflare Pro WAF (optional) | about USD 20 per month | 30 minutes |
| Incident response plan, backups routine | 0 | half a day |
