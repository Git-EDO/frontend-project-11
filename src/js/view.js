import i18n from "./translations";
const h1 = document.querySelector('h1');
const lead = document.querySelector('.lead');
const label = document.querySelector('.form-label');
const submitBtn = document.querySelector('.btn[type="submit"]');
const example = document.querySelector('.example-text');
const form = document.querySelector('form');
const input = document.getElementById('url-input');
const feedback = document.querySelector('.feedback');

export const changeFormState = (state) => {
    switch (state) {
        case 'filling':
            submitBtn.removeAttribute('disabled');
            input.removeAttribute('disabled');
            form.reset();
            input.focus();
            break
        case 'invalid':
            input.classList.add('is-invalid');
            break
        case 'valid':
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            break
        case 'sending':
            submitBtn.setAttribute('disabled', true);
            input.setAttribute('disabled', true);
            break
        default:
            console.log(`${state} is unsupported state`)
    }
};

export const showError = (errorMessage) => {
    feedback.textContent = i18n.t('errors.' + errorMessage);
};

export const hideError = () => feedback.textContent = '';

i18n.init().then((t) => {
    h1.textContent = t('h1');
    lead.textContent = t('lead');
    label.textContent = t('label');
    submitBtn.textContent = t('submitBtn');
    example.textContent = t('example');
})