import axios from 'axios';
import { getDataFromDoc, getParseDoc } from './parser.js';

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const handleResponce = (rssResp, state) => {
  const parsedDoc = getParseDoc(rssResp.data.contents, 'application/xml');
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
};

const updateAllRSS = (state) => {
  const promisesResp = state.rssLinks.map((link) => axios.get(addProxy(link)));
  Promise.all(promisesResp)
    .then((responces) => {
      responces.forEach((el) => {
        handleResponce(el, state);
      });
      setTimeout(() => updateAllRSS(state), 5000);
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

export {
  handleButtonClick, handleLinkClick, addProxy, updateAllRSS,
};
