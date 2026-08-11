const enquiryForm = document.querySelector('#booking-form');
const enquiryStatus = document.querySelector('#booking-status');
const enquiryButton = enquiryForm.querySelector('.request');
const bookingApiUrl = window.CALM_BOOKING_API_URL || '';
let enquiryConnected = false;

function setStatus(message, type = '') {
  enquiryStatus.textContent = message;
  enquiryStatus.className = `booking-status ${type}`.trim();
}

function jsonp(params) {
  return new Promise((resolve, reject) => {
    if (!bookingApiUrl) {
      reject(new Error('The online enquiry form is not connected.'));
      return;
    }

    const callback = `calmEnquiry_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const finish = (error, value) => {
      window.clearTimeout(timer);
      delete window[callback];
      script.remove();
      error ? reject(error) : resolve(value);
    };
    const timer = window.setTimeout(() => finish(new Error('The enquiry service is taking too long to respond.')), 8000);

    window[callback] = (value) => finish(null, value);
    script.onerror = () => finish(new Error('The enquiry service could not be reached.'));
    script.src = `${bookingApiUrl}?${new URLSearchParams({ ...params, callback })}`;
    document.head.appendChild(script);
  });
}

async function connectEnquiryForm() {
  try {
    const result = await jsonp({ action: 'enquiry-health' });
    if (!result.ok || result.mode !== 'callback-enquiry') throw new Error('The enquiry service is being updated.');

    enquiryConnected = true;
    enquiryButton.disabled = false;
    enquiryButton.textContent = 'Send callback request';
    setStatus('');
  } catch (error) {
    enquiryConnected = false;
    enquiryButton.disabled = true;
    enquiryButton.textContent = 'Please call 07508 070295';
    setStatus('The online form is temporarily unavailable while it is being updated. Please call us instead.', 'error');
  }
}

enquiryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!enquiryConnected || !enquiryForm.reportValidity()) return;

  enquiryButton.disabled = true;
  enquiryButton.textContent = 'Sending your enquiry…';
  setStatus('Sending your details securely.');

  const requestId = self.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const formData = new FormData(enquiryForm);
  const payload = {
    action: 'enquiry',
    requestId,
    name: formData.get('name'),
    phone: formData.get('phone'),
    therapyType: formData.get('therapyType'),
    notes: formData.get('notes') || '',
    website: formData.get('website') || ''
  };

  try {
    await fetch(bookingApiUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    let result = { state: 'processing' };
    for (let attempt = 0; attempt < 8 && result.state === 'processing'; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
      result = await jsonp({ action: 'status', requestId });
    }

    if (!result.ok || result.state !== 'confirmed') {
      throw new Error(result.error || 'Your enquiry could not be confirmed. Please try again.');
    }

    setStatus('Thank you — your enquiry has been sent. Angel will call you to discuss your practice and room requirements.', 'success');
    enquiryButton.textContent = 'Enquiry sent';
    enquiryForm.querySelectorAll('input, select, textarea, button').forEach((field) => { field.disabled = true; });
  } catch (error) {
    setStatus(error.message, 'error');
    enquiryButton.disabled = false;
    enquiryButton.textContent = 'Try sending again';
  }
});

connectEnquiryForm();
