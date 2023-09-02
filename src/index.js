import app from './application.js';
import * as yup from 'yup';
import i18n from 'i18next';
import resources from './locales/ru.js';

yup.setLocale({
  string: {
    default: 'defaultErr',
    url: 'mustBeUrl',
    required: 'mustBeFilled',
  },
  mixed: {
    notOneOf: 'alreadyExist',
  },
});

const i18nextInstance = i18n.createInstance();
i18nextInstance.init({
  lng: 'ru',
  debug: true,
  resources,
})
  .then((t) => {
    app(t);
  });
