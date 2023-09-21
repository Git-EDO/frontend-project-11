import onChange from 'on-change';
import  { object, string, setLocale } from 'yup';
import { changeFormState, hideError, showError } from './view';
import i18n from './translations';

export default () => {
    const input = document.getElementById('url-input');
    const form = document.querySelector('form');

    setLocale({
        mixed: {
            default: 'fieldInvalid',
            url: {
                url: () => ({ key: 'invalidURL' }),
                test: ({ val }) => ({ key: 'alreadyInURLs', values: { val } })
            }
        }
    })
    
    const schema = object({
        url: string().url().test('alreadyInURLs', '', () => {
            return watchedState.URLs.indexOf(watchedState.inputValue) === -1
        })
    });
    
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
    
    input.addEventListener('input', (e) => {
        watchedState.inputValue = e.target.value;
        inputValidation(e.target.value);
    });

    const inputValidation = (value) => {
        const url = { url: value };

        schema
        .validate(url)
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
    
    i18n();
}