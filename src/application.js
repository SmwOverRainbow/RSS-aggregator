import './scss/styles.scss';
import i18n from 'i18next';
import * as yup from 'yup';
import axios, { AxiosError } from 'axios';
import getParsedData from './parser.js';
import resources from './locales/ru.js';
import getWatchedState from './view.js';
import {
  handleButtonClick, handleLinkClick, addProxy, updateAllRSS,
} from './utils.js';

const app = () => {
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

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
    feedbackEl: document.querySelector('.feedback'),
    submitBtn: document.querySelector('form button'),
  };

  const i18nextInstance = i18n.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
    .then((translate) => {
      const state = {
        rssForm: {
          status: '',
          data: {
            link: '',
            feedback: '',
          },
          dataStatus: {
            link: '',
          },
        },
        rssLinks: [],
        feeds: [],
        posts: [],
        visitedLinksIds: [],
        modal: {
          modalID: '',
        },
      };

      const watchedState = getWatchedState(translate, state, elements);
      updateAllRSS(watchedState);

      elements.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const currentLink = elements.input.value;
        state.rssForm.data.link = currentLink;
        const corsUrl = addProxy(currentLink);

        const schema = yup.string().required().url().notOneOf(state.rssLinks);
        schema.validate(currentLink, { abortEarly: true })
          .then(() => {
            state.rssLinks.push(currentLink);
            const response = axios.get(corsUrl);
            watchedState.rssForm.status = 'pending';
            return response;
          })
          .then((response) => {
            watchedState.rssForm.data.feedback = 'success';
            watchedState.rssForm.dataStatus.link = 'valid';
            watchedState.rssForm.status = 'ok';
            const dataDoc = getParsedData(response.data.contents, 'application/xml');
            watchedState.feeds = [dataDoc.feed, ...watchedState.feeds];
            watchedState.posts = [...dataDoc.posts, ...watchedState.posts];
          })
          .catch((e) => {
            watchedState.rssForm.status = 'error';
            if (e instanceof yup.ValidationError) {
              const [error] = e.errors;
              watchedState.rssForm.data.feedback = error;
              watchedState.rssForm.dataStatus.link = 'invalid';
            } else if (e.name === 'ParseError') {
              watchedState.rssForm.data.feedback = 'emptyDoc';
              watchedState.rssForm.dataStatus.link = 'invalid';
            } else if (e instanceof AxiosError) {
              watchedState.rssForm.data.feedback = 'networkErr';
              watchedState.rssForm.dataStatus.link = 'invalid';
            } else {
              console.error(e);
              watchedState.rssForm.data.feedback = 'defaultErr';
              watchedState.rssForm.dataStatus.link = 'invalid';
            }
          });
      });

      const postsContainer = document.querySelector('.posts');
      postsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
          handleLinkClick(e.target, watchedState);
        }
        if (e.target.tagName === 'BUTTON') {
          handleButtonClick(e.target, watchedState);
        }
      });
    });
};

export default app;
