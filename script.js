const dateInput = document.querySelector('#appointment-date');
const timeStep = document.querySelector('#time-step');
const requestStep = document.querySelector('#request-step');
const detailsStep = document.querySelector('#details-step');
const selection = document.querySelector('#selection');
const timeButtons = [...document.querySelectorAll('#appointment-times button')];

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
dateInput.min = tomorrow.toISOString().slice(0, 10);

dateInput.addEventListener('change', () => {
  timeStep.classList.toggle('muted', !dateInput.value);
  requestStep.classList.add('muted');
  detailsStep.classList.add('muted');
  selection.textContent = 'Your chosen appointment will appear here.';
  timeButtons.forEach((button) => { button.disabled = !dateInput.value; button.classList.remove('selected'); });
});

timeButtons.forEach((button) => button.addEventListener('click', () => {
  timeButtons.forEach((item) => item.classList.remove('selected'));
  button.classList.add('selected');
  requestStep.classList.remove('muted');
  detailsStep.classList.remove('muted');
  detailsStep.querySelectorAll('input, textarea').forEach((field) => { field.disabled = false; });
  const chosen = new Date(`${dateInput.value}T12:00:00`);
  selection.textContent = `${chosen.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} at ${button.textContent}`;
}));

document.querySelector('#booking-form').addEventListener('submit', (event) => event.preventDefault());
