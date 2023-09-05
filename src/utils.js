import axios from 'axios';
import getParsedData from './parser.js';

const addProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const handleResponce = (rssResp, state) => {
  const dataDoc = getParsedData(rssResp.data.contents, 'application/xml');
  const postsStateIds = state.posts.map((element) => element.id);
  const newPosts = dataDoc.posts.filter((el) => !postsStateIds.includes(el.id));
  state.posts = [...newPosts, ...state.posts];
};

const updateAllRSS = (state) => {
  const promisesResp = state.rssLinks.map((link) => axios.get(addProxy(link))
    .then((responce) => handleResponce(responce, state))
    .catch((e) => {
      console.error(e);
      throw e;
    }));
  Promise.all(promisesResp)
    .finally(() => {
      setTimeout(() => updateAllRSS(state), 5000);
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
