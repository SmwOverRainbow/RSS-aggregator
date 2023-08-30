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
    return { title, link, description, id };
  });

  return result;
};

export { getDataFromDoc };
