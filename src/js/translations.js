import i18next from 'i18next';

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
          alreadyInRSSlist: 'RSS уже существует',
          invalidURL: 'Ссылка должна быть валидным URL',
          isRequired: 'Не должно быть пустым',
          invalidRSS: 'Ресурс не содержит валидный RSS',
          networkError: 'Ошибка сети',
        },
        successMessage: 'RSS успешно загружен',
        feedsTitle: 'Фиды',
        postsTitle: 'Посты',
        btnText: 'Просмотр',
        modal: {
          primary: 'Читать полностью',
          secondary: 'Закрыть',
        },
      },
    },
  },
});

export default i18n;
