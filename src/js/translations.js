import i18next from "i18next";

const i18n = i18next.createInstance({
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
                    invalidURL: 'Ссылка должна быть валидным URL'
                }
            }
        }
    }
})

export default i18n