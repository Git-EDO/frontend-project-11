const getFeed = (data) => {
  const title = data.querySelector('channel > title').textContent;
  const subtitle = data.querySelector('channel > description').textContent;
  return { title, subtitle };
};

const getPosts = (data) => Array.from(data.querySelectorAll('channel item')).map((item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;
  return {
    title, description, link,
  };
});

const parse = (xml, rss) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(xml, 'application/xml');
  const feed = getFeed(data);
  const posts = getPosts(data);
  return {
    feed, posts, url: rss,
  };
};

export default parse;
