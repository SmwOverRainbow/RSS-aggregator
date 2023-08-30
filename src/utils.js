import axios from 'axios';

const getDataFromDoc = (doc) => {
  const result = {
    feed: {},
    posts: [],
  };

  result.feed.title = doc.querySelector('channel > title').textContent;
  result.feed.description = doc.querySelector('channel > description').textContent;
  result.feed.id = doc.querySelector('channel > link').textContent.toString();

  const items = Array.from(doc.querySelectorAll('channel > item'));
  result.posts = items.map((el) => {
    const title = el.querySelector('title').textContent;
    const link = el.querySelector('link').textContent;
    const description = el.querySelector('description').textContent;
    const id = el.querySelector('guid').textContent.toString();
    const post = { title, link, description, id };
    return post;
  });

  return result;
};

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
    })
  ;
};

export { getDataFromDoc, updateRSS };
