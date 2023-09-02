import './scss/styles.scss';
import * as yup from 'yup';
import onChange from 'on-change';
import axios, { AxiosError } from 'axios';
import { getParseDoc, getDataFromDoc } from './parser.js';
import {
  buildFeeds, buildPosts, buildModal, buildFeedback, buildFeedbackStatus, buildRssFormStatus,
} from './view.js';
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

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssForm.dataStatus.link':
        buildFeedbackStatus(value);
        break;
      case 'rssForm.data.feedback':
        buildFeedback(translate(state.rssForm.data.feedback));
        break;
      case 'feeds':
        buildFeeds(state.feeds);
        break;
      case 'posts':
        buildPosts(state.posts, state.visitedLinksIds, translate);
        break;
      case 'rssForm.status':
        buildRssFormStatus(value);
        break;
      case 'modal.modalID':
        buildModal(state.modal.modalID, state.posts, state.visitedLinksIds);
        break;
      default:
        break;
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

  const postsContainer = document.querySelector('.posts');
  postsContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      handleLinkClick(e.target, watchedState);
    }
    if (e.target.tagName === 'BUTTON') {
      handleButtonClick(e.target, watchedState);
    }
  });
};

export default app;
