# SMartApp: main app (React + Vite PWA)

## Run it
1. In Supabase SQL Editor run `schema.sql` (from the earlier step), then `supabase/schema_additions.sql`.
2. `cp .env.example .env` and fill in your Supabase URL, anon key and Paystack public key.
3. `npm install` then `npm run dev`.
4. Install prompt only appears on HTTPS (or localhost). Deploy to Vercel/Netlify to test it on a phone.

## Change the app name, plans, prices
Edit `src/config.js`.

## Question data the app expects
- Practice by Year uses the `session` column (e.g. "2024", "Model V").
- Practice by Class uses `class_level` (SS1, SS2, SS3).
- Practice by Topic uses `topic`.
- Mark some questions `is_free = true` so free users can try the app.

## Paystack
The app opens checkout and sends `metadata: { user_id, plan, days }`. Access is only granted
by your Supabase Edge Function webhook (built in a later step), never by the browser callback.

## Hero image
`public/hero.jpg` is cropped from your screenshot as a stand-in. Replace it with the original illustration.
