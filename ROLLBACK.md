# Rollback Runbook

## Decision Tree

```
Production is broken?
│
├─ Urgent (users affected NOW)
│   └─ → Strategy 1: Vercel instant rollback (< 2 min)
│
└─ Non-urgent (can take 5–10 min)
    └─ → Strategy 2: Git revert (clean audit trail)
```

---

## Strategy 1 — Vercel Instant Rollback

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Open the **stellium** project
3. Click **Deployments** tab → find last known-good deployment
4. Click **⋯** → **Promote to Production**

Done in < 30 seconds.

### Verification
- [ ] Landing page renders without hydration errors
- [ ] Birth data entry form accepts input
- [ ] 3D orb scene renders in `ChartEnvironment`
- [ ] Geocoding (Nominatim) resolves city input
- [ ] Claude report generation completes

---

## Strategy 2 — Git Revert

```bash
git log --oneline -10
git revert <commit-sha> --no-edit
git push origin main
```

---

## Strategy 3 — Git Tag Checkout (Dev Only)

```bash
git checkout v1.0.0
git checkout -b fix/investigate-v1.0.0
# test, then merge back via PR
```

---

## Version Tag Reference

| Tag | Date | Description |
|-----|------|-------------|
| `v1.1.0` | 2026-04-09 | Engineering hardening — dead code, strict TS |
| `v1.0.0` | 2026-04-08 | Production baseline — full Stellium spatial environment |

---

## Notes on the Anthropic API

Stellium calls the Anthropic API server-side to generate natal reports.
If report generation fails after a rollback, check:
- `ANTHROPIC_API_KEY` is set in Vercel environment variables
- API key has sufficient quota
- `src/lib/ai/report.ts` model name is still valid (currently `claude-opus-4-5`)
