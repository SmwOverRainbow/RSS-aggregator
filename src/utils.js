import axios, { AxiosError } from 'axios';
import * as yup from 'yup';
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
  const promisesResp = state.feeds.map((feed) => axios.get(addProxy(feed.url))
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

const identifyError = (err, state, translate) => {
  if (err instanceof yup.ValidationError) {
    const [error] = err.errors;
    state.rssForm.feedback = translate(error);
  } else if (err.name === 'ParseError') {
    state.rssForm.feedback = translate('emptyDoc');
  } else if (err instanceof AxiosError) {
    state.rssForm.feedback = translate('networkErr');
  } else {
    console.error(err);
    state.rssForm.feedback = translate('defaultErr');
  }
};

export { addProxy, updateAllRSS, identifyError };
