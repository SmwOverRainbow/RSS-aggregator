import './scss/styles.scss';
import * as yup from 'yup';
import onChange from 'on-change';
import axios, { AxiosError } from 'axios';
import { buildFeeds, buildPosts, buildModal } from './view.js';
import { getParseDoc, getDataFromDoc } from './parser.js';
import {
  handleButtonClick, handleLinkClick, addProxy, updateAllRSS,
} from './utils.js';

const app = (translate) => {
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
  const closeBtnsModal = document.querySelectorAll('.modal button');

  const watchedState = onChange(state, (path, value) => {
    if (path === 'rssForm.dataStatus.link') {
      if (value === 'invalid') {
        input.classList.add('is-invalid');
        feedbackEl.classList.add('text-danger');
      } else {
        input.value = '';
        input.focus();
        input.classList.remove('is-invalid');
        feedbackEl.classList.remove('text-danger');
        feedbackEl.classList.add('text-success');
      }
    }
    if (path === 'rssForm.data.feedback') {
      feedbackEl.textContent = translate(state.rssForm.data.feedback);
    }
    if (path === 'feeds') {
      buildFeeds(state.feeds);
    }
    if (path === 'posts') {
      buildPosts(state.posts, state.visitedLinksIds, translate);
      const modalButtons = document.querySelectorAll('.btn-sm');
      modalButtons.forEach((button) => {
        button.addEventListener('click', () => handleButtonClick(button, watchedState));
      });

      const linksPosts = document.querySelectorAll('.posts a');
      linksPosts.forEach((link) => {
        link.addEventListener('click', () => handleLinkClick(link, watchedState));
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
    if (path === 'modal.modalID') {
      buildModal(state.modal.modalID, state.posts, state.visitedLinksIds);
    }
  });

  updateAllRSS(watchedState);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const currentLink = input.value;
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

        const parsedDoc = getParseDoc(response.data.contents, 'application/xml');
        const parsererror = parsedDoc.querySelector('parsererror');

        if (parsererror) {
          const err = new Error('Document is empty');
          err.name = 'ParseError';
          throw err;
        }

        const dataDoc = getDataFromDoc(parsedDoc);
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

  closeBtnsModal.forEach((button) => {
    button.addEventListener('click', () => {
      watchedState.modal.status = 'false';
    });
  });
};

export default app;
