import onChange from 'on-change';
import { string, setLocale } from 'yup';
import { changeFormState, hideError, showError } from './view';

export default () => {
    const input = document.getElementById('url-input');
    const form = document.querySelector('form');
    
    const state = {
        formState: 'valid',
        inputValue: '',
        error: '',
        URLs: ['https://google.com/']
    };
    
    const watchedState = onChange(state, (path, value) => {
        if (path === 'formState') {
            watchedState.formState = value
            changeFormState(value, watchedState.error)
        }
        if (path === 'error') {
            value ? showError(value) : hideError()
        }
    });

    setLocale({
        mixed: {
            notOneOf: 'alreadyInURLs'
        },
        string: {
            url: () => 'invalidURL'
        }
    })
    
    const urlSchema = string().url().notOneOf(watchedState.URLs)
    
    input.addEventListener('input', (e) => {
        watchedState.inputValue = e.target.value;
        inputValidation(e.target.value);
    });

    const inputValidation = (value) => {
        urlSchema
        .validate(value)
        .then(() => {
            watchedState.error = '';
            watchedState.formState = 'valid';
        })
        .catch((error) => {
            watchedState.error = error.message;
            watchedState.formState = 'invalid';
        })
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault()
    });
}