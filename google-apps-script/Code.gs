const JACK_CALENDAR_ID = 'jackstuarttroth@gmail.com';
const TIME_ZONE = 'Europe/London';
const VALID_TIMES = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

function doGet(event) {
  const params = event && event.parameter ? event.parameter : {};
  const callback = safeCallback_(params.callback);
  let result;

  try {
    if (params.action === 'availability') {
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
    createBooking_(payload);
    cacheStatus_(requestId, { ok: true, state: 'confirmed' });
  } catch (error) {
    if (requestId) cacheStatus_(requestId, { ok: false, state: 'failed', error: error.message || 'The appointment could not be requested.' });
  }
  return ContentService.createTextOutput('ok');
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
    'Requested: ' + formatted
  ].join('\n');

  CalendarApp.getDefaultCalendar().createEvent(
    'Calm Collective appointment — ' + name,
    range.start,
    range.end,
    {
      description: description,
      guests: JACK_CALENDAR_ID + ',' + email,
      sendInvites: true
    }
  );

  cache.put(rateKey, '1', 300);
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
