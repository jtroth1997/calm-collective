if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const holdHomepageAtTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
holdHomepageAtTop();
window.addEventListener('pageshow', holdHomepageAtTop);

const enquiryForm = document.querySelector('#booking-form');
const enquiryStatus = document.querySelector('#booking-status');
const enquiryButton = enquiryForm.querySelector('.request');
const bookingApiUrl = window.CALM_BOOKING_API_URL || '';
let enquiryConnected = false;

const therapyTypeField = enquiryForm.querySelector('#therapy-type');
const otherTherapyField = enquiryForm.querySelector('#other-therapy-field');
const otherTherapyInput = enquiryForm.querySelector('#other-therapy');

function updateOtherTherapy() {
  const needsDetails = therapyTypeField.value === 'Other';
  otherTherapyField.hidden = !needsDetails;
  otherTherapyInput.required = needsDetails;
  if (!needsDetails) otherTherapyInput.value = '';
}

therapyTypeField.addEventListener('change', updateOtherTherapy);
updateOtherTherapy();

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
    enquiryButton.textContent = 'Submit';
    setStatus('');
  } catch (error) {
    enquiryConnected = false;
    enquiryButton.disabled = true;
    enquiryButton.textContent = 'Submit';
    setStatus('The online form is temporarily unavailable while it is being updated. Please call us instead.', 'error');
  }
}

enquiryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!enquiryConnected || !enquiryForm.reportValidity()) return;

  enquiryButton.disabled = true;
  enquiryButton.textContent = 'Submitting…';
  setStatus('Sending your details securely.');

  const requestId = self.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const formData = new FormData(enquiryForm);
  const selectedTherapy = formData.get('therapyType');
  const otherTherapy = formData.get('otherTherapy') || '';
  const payload = {
    action: 'enquiry',
    requestId,
    name: formData.get('name'),
    phone: formData.get('phone'),
    therapyType: selectedTherapy === 'Other' ? `Other — ${otherTherapy}` : selectedTherapy,
    otherTherapy,
    callbackTime: formData.get('callbackTime') || 'Any time',
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

    setStatus('Thank you — your enquiry has been sent. A member of Calm Collective will contact you within three working days.', 'success');
    enquiryButton.textContent = 'Submitted';
    enquiryForm.querySelectorAll('input, select, textarea, button').forEach((field) => { field.disabled = true; });
  } catch (error) {
    const technicalError = /permission|authori[sz]ation|MailApp|googleapis/i.test(error.message || '');
    setStatus(technicalError ? 'We could not send your enquiry just now. Please call 07508 070295 or try again shortly.' : error.message, 'error');
    enquiryButton.disabled = false;
    enquiryButton.textContent = 'Submit';
  }
});

connectEnquiryForm();


const revealTargets = document.querySelectorAll(
  '.section-heading, .practice-grid > div, .benefits-section article, .room-card, .process-grid article, .booking-card, .faq-list details'
);
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px' });

  revealTargets.forEach((element) => {
    element.classList.add('premium-reveal');
    revealObserver.observe(element);
  });
}
