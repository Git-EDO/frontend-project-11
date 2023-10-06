export default (rss) => {
  const baseURL = 'https://allorigins.hexlet.app/get';
  const params = new URLSearchParams({ disableCache: true, url: rss });
  const proxyURL = new URL(baseURL);
  proxyURL.search = params.toString();
  return proxyURL.toString();
};
