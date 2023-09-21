const form = document.querySelector('form');
const input = document.getElementById('url-input');
const submitBtn = document.querySelector('.btn[type="submit"]');
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
    feedback.textContent = errorMessage;
};

export const hideError = () => feedback.textContent = ''