import onChange from 'on-change';
import axios from 'axios';
import { string, setLocale } from 'yup';
import {
  changeFormState,
  hideError,
  renderFeeds,
  renderPosts,
  showError,
  renderPostInModal,
  markPostsAsVisited,
} from './view';
import {
  parse,
  getFeed,
  getPosts,
  getNewPosts,
} from './parser/parser';

export default () => {
  const input = document.getElementById('url-input');
  const form = document.querySelector('form');
  const postModal = document.getElementById('postModal');

  const state = {
    formState: '',
    inputValue: '',
    error: '',
    RSSlist: [],
    feeds: [],
    posts: [],
    postInModal: {},
    visitedPosts: [],
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'formState') {
      changeFormState(value);
    }
    if (path === 'error') {
      if (value) {
        showError(value);
        return;
      }
      hideError();
    }
    // if (path === 'RSSlist') {
    //   checkRSSupdates(value);
    // }
    if (path === 'feeds') {
      renderFeeds(value);
    }
    if (path === 'posts') {
      renderPosts(value, watchedState.visitedPosts);
    }
    if (path === 'postInModal') {
      renderPostInModal(value);
    }
    if (path === 'visitedPosts') {
      markPostsAsVisited(value);
    }
  });

  setLocale({
    mixed: {
      notOneOf: 'alreadyInRSSlist',
      required: 'isRequired',
    },
    string: {
      url: 'invalidURL',
    },
  });

  const inputValidation = (value, list) => {
    const urlSchema = string().url().notOneOf(list).required();
    urlSchema
      .validate(value)
      .then(() => {
        watchedState.error = '';
        watchedState.formState = 'valid';
      })
      .catch((error) => {
        watchedState.error = error.message;
        watchedState.formState = 'invalid';
      });
  };

  input.addEventListener('input', (e) => {
    watchedState.inputValue = e.target.value;
    inputValidation(watchedState.inputValue, watchedState.RSSlist);
  });

  const checkRSSupdates = (rssList) => {
    const requests = rssList.map((rss) => {
      const proxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rss)}`;
      return axios.get(proxy)
        .then((response) => {
          const xml = response.data.contents;
          const html = parse(xml);
          const newPosts = getNewPosts(html, watchedState.posts);
          newPosts.forEach((post) => watchedState.posts.push(post));
        })
        .catch(() => {
          watchedState.error = 'networkError';
        });
    });

    Promise.all(requests).then(() => setTimeout(checkRSSupdates, 5000));
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (watchedState.formState !== 'valid') return;
    watchedState.formState = 'sending';
    const rss = watchedState.inputValue;
    const proxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rss)}`;
    axios.get(proxy)
      .then((response) => {
        const xml = response.data.contents;
        const html = parse(xml);
        const feed = getFeed(html);
        const posts = getPosts(html);
        watchedState.feeds.push(feed);
        watchedState.posts = [...watchedState.posts, ...posts];
        watchedState.RSSlist.push(rss);
        watchedState.formState = 'success';
        checkRSSupdates(watchedState.RSSlist);
      })
      .catch((error) => {
        watchedState.formState = 'valid';
        if (error.request) {
          watchedState.error = 'networkError';
          return;
        }
        watchedState.error = 'invalidRSS';
      });
  });

  postModal.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const target = button.getAttribute('data-id');
    const activePost = watchedState.posts.find((post) => post.title === target);
    watchedState.visitedPosts.push(activePost);
    watchedState.postInModal = activePost;
  });
};
