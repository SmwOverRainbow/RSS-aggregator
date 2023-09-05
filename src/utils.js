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

export { addProxy, updateAllRSS };
