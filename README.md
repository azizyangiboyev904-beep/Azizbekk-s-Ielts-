# IELTS Pro — Personal

A private, password-gated IELTS reading test app, styled to match your Day 26 design.
Paste in HTML from an existing test and it converts it into this format, then saves it
to your personal library (stored in your browser).

Total cost to run this: **$0**, using Vercel's free Hobby plan. No database needed.

## What's included

- `/login` — passcode gate (only you can get in)
- `/` — dashboard listing all your saved tests
- `/add` — paste HTML (or plain text from a PDF) to convert a test into this design
- `/edit/[id]` — set the correct answer key after conversion
- `/test/[id]` — take the test, styled exactly like your Day 26 file, with timer + scoring

## 1. Set your passcode

Copy `.env.example` to `.env.local` and change `ACCESS_CODE` to whatever you want:

```
ACCESS_CODE=your-secret-code
```

## 2. Run it locally (optional, to try before deploying)

```
npm install
npm run dev
```

Then open http://localhost:3000 — it'll ask for your passcode first.

## 3. Deploy for free on Vercel

1. Create a free account at vercel.com (sign in with GitHub is easiest).
2. Push this folder to a **new GitHub repo** (can be private — only you need to see the code;
   the passcode is what actually protects the live site).
   ```
   git init
   git add .
   git commit -m "IELTS Pro personal app"
   git branch -M main
   git remote add origin <your-new-repo-url>
   git push -u origin main
   ```
3. In Vercel: **Add New → Project → Import** your repo.
4. Before deploying, open **Environment Variables** and add:
   - `ACCESS_CODE` = your chosen passcode
5. Click **Deploy**. In about a minute you'll get a live URL like
   `https://your-app-name.vercel.app` — that's your site.

No credit card, no database, no other setup needed for this to work.

## 4. Adding your tests

Open `/add`, paste the full HTML source of a test (or plain text copied from a PDF),
give it a title, and click Convert & Save. Then fill in the answer key on the next
screen — the converter pulls out passage text and question text automatically, but
correct answers usually need a quick manual check since they're not always explicit
in the source HTML.

## Notes on scope (read before relying on this)

- **Storage is per-browser** (uses `localStorage`), not a shared cloud database. If you
  switch browsers or devices, your tests won't follow automatically — use the
  **Export backup** / **Import backup** buttons on the dashboard to move your data.
- **The passcode gate is simple** (one shared secret, not full user accounts) — appropriate
  for "keep randoms out," not for bank-grade security.
- **PDF conversion is manual-paste only** for now (select text in your PDF viewer, copy,
  paste into "plain text" mode on `/add`). True automatic PDF parsing, or AI-assisted
  conversion of messy/inconsistent formats, is a solid next step but needs either a
  PDF-parsing library (free) or calls to an AI API using your own key (has a small
  per-use cost) — happy to add either if you want to go further.
