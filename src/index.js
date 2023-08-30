import './scss/styles.scss';
// import * as bootstrap from 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios, { AxiosError } from 'axios';
import { buildFeeds, buildPosts, buildModal } from './view.js';
import { getDataFromDoc, updateRSS } from './utils.js';

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

i18next.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru: {
      translation: {
        defaultErr: 'Ошибка',
        mustBeUrl: 'Ссылка должна быть валидным URL',
        emptyDoc: 'Ресурс не содержит валидный RSS',
        mustBeFilled: 'Не должно быть пустым',
        alreadyExist: 'RSS уже существует',
        success: 'RSS успешно загружен',
        networkErr: 'Ошибка сети',
      },
    },
  },
});

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
    status: false,
  },
};

const form = document.querySelector('.rss-form');
const input = document.getElementById('url-input');
const feedbackEl = document.querySelector('.feedback');
const submitBtn = form.querySelector('button');
const body = document.querySelector('body');
const closeBtnsModal = document.querySelectorAll('.modal button');

const watchedState = onChange(state, (path, value) => {
  if (path === 'rssForm.dataStatus.link') {
    if (value === 'invalid') {
      input.classList.add('is-invalid');
      feedbackEl.classList.add('text-danger');
    } else {
      input.classList.remove('is-invalid');
      feedbackEl.classList.remove('text-danger');
      feedbackEl.classList.add('text-success');
    }
  }
  if (path === 'rssForm.data.feedback') {
    feedbackEl.textContent = i18next.t(state.rssForm.data.feedback);
  }
  if (path === 'feeds') {
    buildFeeds(state.feeds);
  }
  if (path === 'posts') {
    buildPosts(state.posts, state.visitedLinksIds);
    const modalButtons = document.querySelectorAll('.btn-sm');
    modalButtons.forEach((button) => {
      button.addEventListener('click', () => handleButtonClick(button));
    });

    const linksPosts = document.querySelectorAll('.posts a');
    linksPosts.forEach((link) => {
      link.addEventListener('click', () => handleLinkClick(link));
    });
  }
  if (path === 'rssForm.status') {
    if (value === 'pending') {
      input.setAttribute('readonly', 'true');
      submitBtn.setAttribute('disabled', 'true');
    } else {
      input.removeAttribute('readonly');
      submitBtn.removeAttribute('disabled');
    }
  }
  if (path === 'modal.status') {
    if (state.modal.status === 'true') {
      body.classList.add('modal-open');
    } else {
      body.classList.remove('modal-open');
      const modalContainer = document.getElementById('modal');
      modalContainer.classList.remove('show');
      modalContainer.removeAttribute('style');
      modalContainer.removeAttribute('aria-modal');
      modalContainer.setAttribute('aria-hidden', 'true');
    }
  }
  if (path === 'modal.modalID') {
    buildModal(state.modal.modalID, state.posts, state.visitedLinksIds);
  }
});

const handleButtonClick = (el) => {
  const currentId = el.dataset.id;
  watchedState.modal.status = 'true';
  watchedState.modal.modalID = currentId;
};

const handleLinkClick = (element) => {
  element.classList.remove('fw-bold');
  element.classList.add('fw-normal', 'link-secondary');
  const currentId = element.dataset.id;
  if (!watchedState.visitedLinksIds.includes(currentId)) {
    watchedState.visitedLinksIds.push(currentId);
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const currentLink = input.value;
  state.rssForm.data.link = currentLink;
  const corsUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(currentLink)}`;

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
      input.value = '';
      input.focus();

      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(response.data.contents, 'application/xml');
      console.log(parsedDoc);
      const parsererror = parsedDoc.querySelector('parsererror');

      if (parsererror) {
        const err = new Error('Document is empty');
        err.name = 'ParseError';
        throw err;
      }

      const dataDoc = getDataFromDoc(parsedDoc);
      watchedState.feeds = [dataDoc.feed, ...watchedState.feeds];
      watchedState.posts = [...dataDoc.posts, ...watchedState.posts];

      setTimeout(() => updateRSS(corsUrl, watchedState), 5000);
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

  closeBtnsModal.forEach((button) => {
    button.addEventListener('click', () => {
      watchedState.modal.status = 'false';
    });
  });
});
