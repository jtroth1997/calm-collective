const JACK_CALENDAR_ID = 'jackstuarttroth@gmail.com';
const TIME_ZONE = 'Europe/London';
const VALID_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
const ENQUIRY_EMAIL = 'jackstuarttroth@gmail.com';

function doGet(event) {
  const params = event && event.parameter ? event.parameter : {};
  const callback = safeCallback_(params.callback);
  let result;

  try {
    if (params.action === 'enquiry-health') {
      result = { ok: true, mode: 'callback-enquiry' };
    } else if (params.action === 'availability') {
      result = { ok: true, slots: availableSlots_(params.date) };
    } else if (params.action === 'status') {
      result = bookingStatus_(params.requestId);
    } else {
      result = { ok: false, error: 'Unknown request.' };
    }
  } catch (error) {
    result = { ok: false, error: error.message || 'Calendar request failed.' };
  }

  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(event) {
  let requestId = '';
  try {
    const payload = JSON.parse((event && event.postData && event.postData.contents) || '{}');
    requestId = clean_(payload.requestId, 80);
    if (!requestId) throw new Error('Missing request reference.');

    if (payload.action === 'enquiry') {
      createEnquiry_(payload);
    } else {
      createBooking_(payload);
    }

    cacheStatus_(requestId, { ok: true, state: 'confirmed' });
  } catch (error) {
    if (requestId) cacheStatus_(requestId, { ok: false, state: 'failed', error: error.message || 'Your enquiry could not be sent.' });
  }
  return ContentService.createTextOutput('ok');
}


function authoriseEmailSending() {
  MailApp.sendEmail({
    to: ENQUIRY_EMAIL,
    subject: 'Calm Collective email connection test',
    name: 'Calm Collective Website',
    body: 'Success — Google Apps Script is now authorised to send Calm Collective room enquiries.'
  });
}

function createEnquiry_(payload) {
  const requestId = clean_(payload.requestId, 80);
  const name = clean_(payload.name, 100);
  const phone = clean_(payload.phone, 40);
  const therapyType = clean_(payload.therapyType, 120);
  const otherTherapy = clean_(payload.otherTherapy, 160);
  const callbackTime = clean_(payload.callbackTime, 100) || 'Any time';
  const notes = clean_(payload.notes, 1800);
  const website = clean_(payload.website, 100);

  if (website) throw new Error('Unable to process this enquiry.');
  if (!requestId || !name || !phone || !therapyType) throw new Error('Please complete your name, phone number and therapy type.');
  if (therapyType === 'Other' && !otherTherapy) throw new Error('Please tell us what therapy or service you provide.');

  const rateKey = 'enquiry:' + Utilities.base64EncodeWebSafe(phone).slice(0, 80);
  const cache = CacheService.getScriptCache();
  if (cache.get(rateKey)) throw new Error('An enquiry was recently sent from this phone number. Please wait a few minutes.');

  const plainBody = [
    'New room hire enquiry from the Calm Collective website',
    '',
    'Name: ' + name,
    'Phone: ' + phone,
    'Therapy / service: ' + (therapyType === 'Other' ? otherTherapy : therapyType),
    'Best time to call: ' + callbackTime,
    '',
    'Additional notes:',
    notes || 'No additional notes provided.',
    '',
    'Please contact this practitioner by phone to discuss their room requirements.'
  ].join('\n');

  MailApp.sendEmail({
    to: ENQUIRY_EMAIL,
    subject: 'New Calm Collective room enquiry — ' + name,
    name: 'Calm Collective Website',
    body: plainBody,
    htmlBody:
      '<h2>New room hire enquiry</h2>' +
      '<p><strong>Name:</strong> ' + htmlEscape_(name) + '<br>' +
      '<strong>Phone:</strong> <a href="tel:' + htmlEscape_(phone) + '">' + htmlEscape_(phone) + '</a><br>' +
      '<strong>Therapy / service:</strong> ' + htmlEscape_(therapyType === 'Other' ? otherTherapy : therapyType) + '<br>' +
      '<strong>Best time to call:</strong> ' + htmlEscape_(callbackTime) + '</p>' +
      '<p><strong>Additional notes</strong><br>' + htmlEscape_(notes || 'No additional notes provided.').replace(/\n/g, '<br>') + '</p>' +
      '<p>Please contact this practitioner by phone to discuss their room requirements.</p>'
  });

  cache.put(rateKey, '1', 300);
}

function availableSlots_(dateText) {
  const day = parseDate_(dateText);
  if (day.getDay() === 0 || day.getDay() === 6) return [];

  const now = new Date();
  const jackCalendar = CalendarApp.getCalendarById(JACK_CALENDAR_ID);
  const bookingCalendar = CalendarApp.getDefaultCalendar();
  if (!jackCalendar) throw new Error('Jack’s shared calendar is not available.');

  return VALID_TIMES.filter(function(time) {
    const range = slotRange_(dateText, time);
    if (range.start <= now) return false;
    return jackCalendar.getEvents(range.start, range.end).length === 0 &&
      bookingCalendar.getEvents(range.start, range.end).length === 0;
  });
}

function createBooking_(payload) {
  const requestId = clean_(payload.requestId, 80);
  const date = clean_(payload.date, 10);
  const time = clean_(payload.time, 5);
  const name = clean_(payload.name, 100);
  const email = clean_(payload.email, 160).toLowerCase();
  const phone = clean_(payload.phone, 40);
  const requirements = clean_(payload.requirements, 1800);
  const website = clean_(payload.website, 100);

  if (website) throw new Error('Unable to process this request.');
  if (!requestId || !date || !VALID_TIMES.includes(time) || !name || !phone || !requirements) throw new Error('Please complete every field.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
  if (availableSlots_(date).indexOf(time) === -1) throw new Error('That appointment has just been taken. Please choose another time.');

  const rateKey = 'rate:' + Utilities.base64EncodeWebSafe(email).slice(0, 80);
  const cache = CacheService.getScriptCache();
  if (cache.get(rateKey)) throw new Error('A request was recently sent from this email. Please wait a few minutes.');

  const range = slotRange_(date, time);
  const formatted = Utilities.formatDate(range.start, TIME_ZONE, 'EEEE d MMMM yyyy, HH:mm');
  const description = [
    'Appointment request submitted through the Calm Collective website.',
    '',
    'Customer: ' + name,
    'Email: ' + email,
    'Phone: ' + phone,
    '',
    'Requirements:',
    requirements,
    '',
    'Requested: ' + formatted,
    '',
    '[CALM_CUSTOMER_EMAIL:' + email + ']',
    '[CALM_CUSTOMER_NAME:' + name + ']',
    '[CALM_CUSTOMER_NOTIFIED:NO]',
    '[CALM_DECLINE_NOTIFIED:NO]'
  ].join('\n');

  CalendarApp.getDefaultCalendar().createEvent(
    'APPROVAL REQUIRED — Calm Collective — ' + name,
    range.start,
    range.end,
    {
      description: description,
      guests: JACK_CALENDAR_ID,
      sendInvites: true
    }
  );

  cache.put(rateKey, '1', 300);
}


function installApprovalTrigger() {
  ScriptApp.getProjectTriggers().forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'processPendingApprovals') ScriptApp.deleteTrigger(trigger);
  });
  ScriptApp.newTrigger('processPendingApprovals').timeBased().everyMinutes(1).create();
}

function processPendingApprovals() {
  const calendar = CalendarApp.getDefaultCalendar();
  const now = new Date();
  const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const until = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

  calendar.getEvents(from, until).forEach(function(event) {
    if (event.getTitle().indexOf('APPROVAL REQUIRED — Calm Collective — ') !== 0) return;

    let description = event.getDescription() || '';
    const emailMatch = description.match(/\[CALM_CUSTOMER_EMAIL:([^\]]+)\]/);
    const nameMatch = description.match(/\[CALM_CUSTOMER_NAME:([^\]]+)\]/);
    if (!emailMatch) return;

    const customerEmail = emailMatch[1];
    const customerName = nameMatch ? nameMatch[1] : 'there';
    const jackGuest = event.getGuestByEmail(JACK_CALENDAR_ID);
    if (!jackGuest) return;

    const response = jackGuest.getGuestStatus();
    if (response === CalendarApp.GuestStatus.YES && description.indexOf('[CALM_CUSTOMER_NOTIFIED:NO]') !== -1) {
      event.addGuest(customerEmail);
      description = description.replace('[CALM_CUSTOMER_NOTIFIED:NO]', '[CALM_CUSTOMER_NOTIFIED:YES]');
      event.setDescription(description);
      event.setTitle(event.getTitle().replace('APPROVAL REQUIRED — ', 'CONFIRMED — '));
    }

    if (response === CalendarApp.GuestStatus.NO && description.indexOf('[CALM_DECLINE_NOTIFIED:NO]') !== -1) {
      MailApp.sendEmail({
        to: customerEmail,
        subject: 'Your Calm Collective appointment request',
        name: 'Calm Collective',
        htmlBody: '<p>Hello ' + htmlEscape_(customerName) + ',</p><p>Thank you for requesting an appointment with Calm Collective. Unfortunately, we are unable to confirm that time.</p><p>Please return to the Calm Collective website to choose another suitable appointment, or call <a href="tel:07508070295">07508 070295</a>.</p><p>Warm regards,<br>Calm Collective</p>'
      });
      description = description.replace('[CALM_DECLINE_NOTIFIED:NO]', '[CALM_DECLINE_NOTIFIED:YES]');
      event.setDescription(description);
      event.setTitle(event.getTitle().replace('APPROVAL REQUIRED — ', 'DECLINED — '));
    }
  });
}

function htmlEscape_(value) {
  return String(value).replace(/[&<>"']/g, function(character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
  });
}

function bookingStatus_(requestId) {
  const id = clean_(requestId, 80);
  if (!id) return { ok: false, state: 'failed', error: 'Missing request reference.' };
  const stored = CacheService.getScriptCache().get('status:' + id);
  return stored ? JSON.parse(stored) : { ok: true, state: 'processing' };
}

function cacheStatus_(requestId, value) {
  CacheService.getScriptCache().put('status:' + requestId, JSON.stringify(value), 600);
}

function slotRange_(dateText, timeText) {
  const parts = dateText.split('-').map(Number);
  const time = timeText.split(':').map(Number);
  const start = new Date(parts[0], parts[1] - 1, parts[2], time[0], time[1], 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start: start, end: end };
}

function parseDate_(dateText) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText || '')) throw new Error('Please choose a valid date.');
  const parts = dateText.split('-').map(Number);
  const day = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  if (day.getFullYear() !== parts[0] || day.getMonth() !== parts[1] - 1 || day.getDate() !== parts[2]) throw new Error('Please choose a valid date.');
  return day;
}

function safeCallback_(value) {
  return /^[A-Za-z_$][0-9A-Za-z_$\.]{0,100}$/.test(value || '') ? value : 'calendarResponse';
}

function clean_(value, maxLength) {
  return String(value == null ? '' : value).trim().slice(0, maxLength);
}
