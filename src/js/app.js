import onChange from 'on-change';
import axios from 'axios';
import i18next from 'i18next';
import { string, setLocale } from 'yup';
import { uniqueId } from 'lodash';
import resources from './translations';
import createProxy from './proxy/createProxy';
import {
  changeFormState,
  hideError,
  renderFeeds,
  renderPosts,
  showError,
  renderPostInModal,
  markPostsAsVisited,
  renderTexts,
} from './view';
import parse from './parser/parser';

export default () => {
  const elements = {
    h1: document.querySelector('h1'),
    lead: document.querySelector('.lead'),
    label: document.querySelector('.form-label'),
    submitBtn: document.querySelector('.btn-primary'),
    example: document.querySelector('.example-text'),
    form: document.querySelector('form'),
    input: document.getElementById('url-input'),
    feedback: document.querySelector('.feedback'),
    feedsList: document.querySelector('.feeds ul.list-group'),
    postsList: document.querySelector('.posts ul.list-group'),
    feedsTitle: document.querySelector('.feeds .card-title'),
    postsTitle: document.querySelector('.posts .card-title'),
    postModal: document.getElementById('postModal'),
    modalTitle: document.querySelector('#postModal .modal-title'),
    modalBody: document.querySelector('#postModal .modal-body'),
    modalPrimaryBtn: document.querySelector('#postModal .btn-primary'),
    modalSecondaryBtn: document.querySelector('#postModal .btn-secondary'),
  };

  const i18n = i18next.createInstance({
    lng: 'ru',
    resources,
  });

  i18n
    .init()
    .then(() => renderTexts(i18n, elements))
    .catch((error) => console.log(error.message));

  const state = {
    form: {
      formState: '',
      inputValue: '',
      error: '',
    },
    RSS: {
      RSSlist: [],
      feeds: [],
      posts: [],
    },
    UI: {
      postInModal: {},
      visitedPosts: [],
    },
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'form.formState') {
      changeFormState(value, i18n, elements);
    }
    if (path === 'form.error') {
      if (value) {
        showError(value, i18n, elements);
        return;
      }
      hideError(elements);
    }
    if (path === 'RSS.feeds') {
      renderFeeds(value, i18n, elements);
    }
    if (path === 'RSS.posts') {
      renderPosts(value, watchedState.UI.visitedPosts, i18n, elements);
      markPostsAsVisited(watchedState.UI.visitedPosts);
    }
    if (path === 'UI.postInModal') {
      renderPostInModal(value, elements);
    }
    if (path === 'UI.visitedPosts') {
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

  const inputValidation = (value, list, success, fail) => {
    const urlSchema = string().url().notOneOf(list).required();
    urlSchema
      .validate(value)
      .then(() => success())
      .catch((error) => fail(error));
  };

  elements.input.addEventListener('input', (e) => {
    watchedState.form.inputValue = e.target.value;
  });

  const checkRSSupdates = (rssList, feeds) => {
    const requests = rssList.forEach((rss) => {
      const proxy = createProxy(rss);
      return axios.get(proxy)
        .then((response) => {
          const xml = response.data.contents;
          const data = parse(xml);
          const feed = feeds.find((f) => f.rss === rss);
          const existingPosts = watchedState.RSS.posts.filter((p) => p.feedName === feed.title);
          const newPosts = [];
          data.posts.forEach((post) => {
            if (!existingPosts.some((p) => p.title === post.title)) {
              newPosts.push({
                ...post,
                feedName: feed.title,
                id: uniqueId('post_'),
              });
            }
          });
          newPosts.forEach((post) => watchedState.RSS.posts.push(post));
        })
        .catch(() => {
          watchedState.form.error = 'networkError';
        });
    });

    setTimeout(() => checkRSSupdates(rssList, feeds), 5000);

    return requests;
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    inputValidation(
      watchedState.form.inputValue,
      watchedState.RSS.RSSlist,
      () => {
        watchedState.form.error = '';
        watchedState.form.formState = 'valid';
        const rss = watchedState.form.inputValue;
        const proxy = createProxy(rss);
        axios.get(proxy)
          .then((response) => {
            const xml = response.data.contents;
            const data = parse(xml, rss);
            const feedId = uniqueId('feed_');
            const posts = data.posts.map((post) => ({
              ...post,
              feedName: data.feed.title,
              id: uniqueId('post_'),
            }));
            watchedState.RSS.feeds.push({ ...data.feed, id: feedId, rss: data.url });
            watchedState.RSS.posts = [...watchedState.RSS.posts, ...posts];
            watchedState.RSS.RSSlist.push(data.url);
            watchedState.form.formState = 'success';
            checkRSSupdates(watchedState.RSS.RSSlist, watchedState.RSS.feeds);
          })
          .catch((err) => {
            watchedState.form.formState = 'valid';
            if (err.request) {
              watchedState.form.error = 'networkError';
              return;
            }
            watchedState.form.error = 'invalidRSS';
          });
      },
      (error) => {
        watchedState.form.error = error.message;
        watchedState.form.formState = 'invalid';
      },
    );
  });

  elements.postModal.addEventListener('show.bs.modal', (event) => {
    const button = event.relatedTarget;
    const target = button.getAttribute('data-id');
    const activePost = watchedState.RSS.posts.find((post) => post.id === target);
    watchedState.UI.visitedPosts.push(activePost);
    watchedState.UI.postInModal = activePost;
  });
};
