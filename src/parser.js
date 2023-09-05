const getParseDoc = (stringData, mimeType) => {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(stringData, mimeType);
  return parsedDocument;
};

const getDataFromDoc = (doc, url) => {
  const result = {
    feed: {},
    posts: [],
  };

  result.feed.title = doc.querySelector('channel > title').textContent;
  result.feed.description = doc.querySelector('channel > description').textContent;
  result.feed.id = doc.querySelector('channel > link').textContent.toString();
  result.feed.url = url;

  const items = Array.from(doc.querySelectorAll('channel > item'));
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

const getParsedData = (stringData, mimeType, link) => {
  const parsedDoc = getParseDoc(stringData, mimeType);
  const parserError = parsedDoc.querySelector('parsererror');

  if (parserError) {
    const err = new Error(parserError.textContent);
    err.name = 'ParseError';
    throw err;
  }
  return getDataFromDoc(parsedDoc, link);
};

export default getParsedData;
