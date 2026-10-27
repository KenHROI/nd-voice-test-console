# ND Voice Test Console

A one-page checklist for phone-testing the ND Wellness voice receptionist.
The tester opens the link on a phone or laptop, makes five calls, ticks boxes
while talking, and taps **Submit results**.

- `index.html` — the whole app. Plain HTML, CSS and JavaScript. No build step, no external requests except the results relay.
- `tests.config.js` — every piece of test content (instructions, scripts, checklist items, flag types, office hours, relay URL). Edit this file to change a test.
- `relay/` — a Cloudflare Worker that receives submissions and saves each one as a new file in a private results repository. Code only; its secrets live in Cloudflare.

## Link format

```
https://kenhroi.github.io/nd-voice-test-console/#k=SUBMIT_KEY
```

The submit key is only ever in the link the tester receives. The page remembers it on that device.

## How results are stored

Answers autosave in the browser's local storage. **Submit results** POSTs the
results JSON (`schema: "nd-voice-test-results/v1"`) to the relay, which commits
it to the private results repo at
`results/round-<round>/<ISO-timestamp>-<tester>.json`. Every submission is a new
file; nothing is overwritten. If submitting fails, the page offers **Share
results** (the phone's share sheet) or a copy to the clipboard, with a Markdown
report that starts with `ND-VOICE-TEST-RESULTS v1` and ends with the same JSON.

## Relay setup

```
cd relay
npx wrangler login
npx wrangler deploy
npx wrangler secret put GITHUB_TOKEN   # fine-grained token: only the results repo, Contents read and write
npx wrangler secret put SUBMIT_KEY     # any long random string
```

`wrangler.toml` holds the allowed origin and the results repo name (not secrets).

The relay rejects: other origins, a missing or wrong key, bodies over 200 KB,
invalid JSON, and bodies missing `schema`, `tester`, `round`, `promptVersion`
or a `tests` array. It never logs or returns the key or token.
