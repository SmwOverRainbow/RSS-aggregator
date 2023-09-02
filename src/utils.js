import axios from 'axios';
import { getDataFromDoc } from './parser.js';

const updateRSS = (url, state) => {
  axios.get(url)
    .then((resp) => {
      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(resp.data.contents, 'application/xml');
      const parsererror = parsedDoc.querySelector('parsererror');

      if (parsererror) {
        const err = new Error('Document is empty');
        err.name = 'ParseError';
        throw err;
      }

      const dataDoc = getDataFromDoc(parsedDoc);
      const postsStateIds = state.posts.map((element) => element.id);
      const newPosts = dataDoc.posts.filter((el) => !postsStateIds.includes(el.id));

      state.posts = [...newPosts, ...state.posts];

      setTimeout(() => updateRSS(url, state), 5000);
    })
    .catch((e) => {
      console.error(e);
      throw e;
    });
};

const handleButtonClick = (el, state) => {
  const currentId = el.dataset.id;
  state.modal.status = 'true';
  state.modal.modalID = currentId;
};

const handleLinkClick = (element, state) => {
  element.classList.remove('fw-bold');
  element.classList.add('fw-normal', 'link-secondary');
  const currentId = element.dataset.id;
  if (!state.visitedLinksIds.includes(currentId)) {
    state.visitedLinksIds.push(currentId);
  }
};

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

export {
  updateRSS, handleButtonClick, handleLinkClick, addProxy,
};
