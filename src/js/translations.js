import i18next from "i18next";

const h1 = document.querySelector('h1');
const lead = document.querySelector('.lead');
const label = document.querySelector('.form-label');
const submitBtn = document.querySelector('.btn[type="submit"]');
const example = document.querySelector('.example-text');
const feedback = document.querySelector('.feedback');

export default () => {
    i18next.init({
        lng: 'ru',
        debug: true,
        resources: {
            ru: {
                translation: {
                    h1: 'RSS агрегатор',
                    lead: 'Начните читать RSS сегодня! Это легко, это красиво.',
                    label: 'Ссылка RSS',
                    submitBtn: 'Добавить',
                    example: 'Пример: https://ru.hexlet.io/lessons.rss',
                    errors: {
                        alreadyInURLs: 'URL уже добавлен',
                        invalidURL: 'Ссылка должна быть валидным URL',
                        fieldInvalid: 'Ошибка'
                    }
                }
            }
        }
    }).then((t) => {
        h1.textContent = t('h1');
        lead.textContent = t('lead');
        label.textContent = t('label');
        submitBtn.textContent = t('submitBtn');
        example.textContent = t('example');
    })
}