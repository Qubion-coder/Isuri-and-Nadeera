# Connect RSVP & Wishes to Google Sheets

Spreadsheet: https://docs.google.com/spreadsheets/d/1aS8-ZvXdzRaZvppUX7s16kPVb24SPjbiaVaWMW7BVYE/edit

1. Open the spreadsheet > Extensions > Apps Script.
2. Delete everything in Code.gs and paste the full contents of `code.ts`
   (same as `google-apps-script/code.gs`). Save.
3. In the function dropdown pick `setup` and click Run. Approve the
   permissions. This creates the "RSVP" and "Wishes" sheets with headers
   (they are also created automatically on the first submission).
4. Deploy > New deployment > type: Web app
   - Execute as: Me
   - Who has access: Anyone
5. Copy the Web App URL (ends with /exec).
6. Paste it in `src/config.ts` in place of PASTE_YOUR_WEB_APP_URL_HERE
   (or set VITE_GOOGLE_APPS_SCRIPT_URL in .env / Vercel env vars).
7. Rebuild / redeploy the website.

Sheets created:
- RSVP:   Timestamp | Full Name | Phone | Attending | Guests | Message / Notes
- Wishes: Timestamp | Guest Name | Message

If you change the script later: Deploy > Manage deployments > Edit > New version.
