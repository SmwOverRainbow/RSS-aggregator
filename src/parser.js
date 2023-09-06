const getParsedData = (stringData, mimeType) => {
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(stringData, mimeType);
  const parserError = parsedDoc.querySelector('parsererror');
  if (parserError) {
    const err = new Error(parserError.textContent);
    err.name = 'ParseError';
    throw err;
  }
  const result = {
    feed: {},
    posts: [],
  };
  result.feed.title = parsedDoc.querySelector('channel > title').textContent;
  result.feed.description = parsedDoc.querySelector('channel > description').textContent;
  result.feed.id = parsedDoc.querySelector('channel > link').textContent.toString();

  const items = Array.from(parsedDoc.querySelectorAll('channel > item'));
  result.posts = items.map((el) => {
    const title = el.querySelector('title').textContent;
    const link = el.querySelector('link').textContent;
    const description = el.querySelector('description').textContent;
    const id = el.querySelector('guid').textContent.toString();
    const post = {
      title,
      link,
      description,
      id,
    };
    return post;
  });

  return result;
};

export default getParsedData;
