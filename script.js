const dateInput = document.querySelector('#appointment-date');
const timeStep = document.querySelector('#time-step');
const requestStep = document.querySelector('#request-step');
const detailsStep = document.querySelector('#details-step');
const selection = document.querySelector('#selection');
const bookingStatus = document.querySelector('#booking-status');
const timeButtons = [...document.querySelectorAll('#appointment-times button')];
const requestButton = document.querySelector('.request');
const bookingForm = document.querySelector('#booking-form');
const bookingApiUrl = window.CALM_BOOKING_API_URL || '';
let selectedTime = '';

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.min = tomorrow.toISOString().slice(0, 10);

function setStatus(message, type = '') {
  bookingStatus.textContent = message;
  bookingStatus.className = `booking-status ${type}`.trim();
}

function jsonp(params) {
  return new Promise((resolve, reject) => {
    if (!bookingApiUrl) {
      reject(new Error('Online booking is completing its final connection. Please call us in the meantime.'));
      return;
    }
    const callback = `calmCalendar_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => finish(new Error('The calendar is taking too long to respond. Please try again.')), 8000);
    const finish = (error, value) => {
      window.clearTimeout(timer);
      delete window[callback];
      script.remove();
      error ? reject(error) : resolve(value);
    };
    window[callback] = (value) => finish(null, value);
    script.onerror = () => finish(new Error('The calendar could not be reached. Please try again.'));
    const query = new URLSearchParams({ ...params, callback });
    script.src = `${bookingApiUrl}?${query}`;
    document.head.appendChild(script);
  });
}

function updateSubmitState() {
  const ready = Boolean(selectedTime) && bookingForm.checkValidity();
  requestButton.disabled = !ready;
  requestStep.classList.toggle('muted', !ready);
  requestButton.textContent = ready ? 'Send appointment request' : 'Complete your details to continue';
}

dateInput.addEventListener('change', async () => {
  selectedTime = '';
  selection.textContent = 'Your chosen appointment will appear here.';
  timeStep.classList.toggle('muted', !dateInput.value);
  requestStep.classList.add('muted');
  detailsStep.classList.add('muted');
  detailsStep.querySelectorAll('input, textarea').forEach((field) => { field.disabled = true; });
  timeButtons.forEach((button) => { button.disabled = true; button.classList.remove('selected'); });
  requestButton.disabled = true;
  setStatus(dateInput.value ? 'Checking the calendar…' : '');
  if (!dateInput.value) return;

  try {
    const result = await jsonp({ action: 'availability', date: dateInput.value });
    if (!result.ok) throw new Error(result.error || 'Availability could not be checked.');
    timeButtons.forEach((button) => { button.disabled = !result.slots.includes(button.textContent.trim()); });
    const availableCount = result.slots.length;
    setStatus(availableCount ? `${availableCount} appointment${availableCount === 1 ? '' : 's'} available.` : 'There are no appointments available on this date.');
  } catch (error) {
    setStatus(error.message, 'error');
  }
});

timeButtons.forEach((button) => button.addEventListener('click', () => {
  timeButtons.forEach((item) => item.classList.remove('selected'));
  button.classList.add('selected');
  selectedTime = button.textContent.trim();
  detailsStep.classList.remove('muted');
  detailsStep.querySelectorAll('input, textarea').forEach((field) => { field.disabled = false; });
  const chosen = new Date(`${dateInput.value}T12:00:00`);
  selection.textContent = `${chosen.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at ${selectedTime}`;
  setStatus('Complete your details and send your request.');
  updateSubmitState();
}));

bookingForm.addEventListener('input', updateSubmitState);

bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!selectedTime || !bookingForm.reportValidity() || !bookingApiUrl) return;

  requestButton.disabled = true;
  requestButton.textContent = 'Sending your request…';
  setStatus('Securely connecting your appointment to Google Calendar.');
  const requestId = self.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const formData = new FormData(bookingForm);
  const payload = {
    requestId,
    date: dateInput.value,
    time: selectedTime,
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    requirements: formData.get('requirements'),
    website: formData.get('website') || ''
  };

  try {
    await fetch(bookingApiUrl, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
    let result = { state: 'processing' };
    for (let attempt = 0; attempt < 8 && result.state === 'processing'; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 750));
      result = await jsonp({ action: 'status', requestId });
    }
    if (!result.ok || result.state !== 'confirmed') throw new Error(result.error || 'The request could not be confirmed. Please try again.');

    setStatus('Your appointment request has been received. We’ll email your calendar invitation once the appointment is approved.', 'success');
    requestButton.textContent = 'Request sent';
    bookingForm.querySelectorAll('input, textarea, button').forEach((field) => { field.disabled = true; });
  } catch (error) {
    setStatus(error.message, 'error');
    requestButton.disabled = false;
    requestButton.textContent = 'Try sending again';
  }
});
