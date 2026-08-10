# Calm Collective Google Calendar bridge

This Google Apps Script runs as `calmcollectivebooking@gmail.com`.

Deploy it as a web app with:

- Execute as: Me
- Who has access: Anyone

Copy the deployment `/exec` URL into `github-pages/booking-config.js`.

The script reads the shared `jackstuarttroth@gmail.com` calendar, returns free one-hour weekday slots from 10:00 to 15:00, creates the event on the Calm Collective booking calendar, and invites both Jack and the customer.
