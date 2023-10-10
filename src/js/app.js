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
  handleLoadingStatus,
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
    .then(() => {
      renderTexts(i18n, elements);
      const state = {
        form: {
          formState: 'filling',
          error: null,
        },
        loading: {
          status: 'waiting',
          networkError: null,
        },
        feeds: [],
        posts: [],
        UI: {
          postInModal: {},
          visitedPosts: [],
        },
      };

      const watchedState = onChange(state, (path, value) => {
        if (path === 'form.formState') {
          changeFormState(value, elements);
        }
        if (path === 'form.error') {
          if (value) {
            showError(value, i18n, elements);
            return;
          }
          hideError(elements);
        }
        if (path === 'feeds') {
          renderFeeds(value, i18n, elements);
        }
        if (path === 'posts') {
          renderPosts(value, watchedState.UI.visitedPosts, i18n, elements);
          markPostsAsVisited(watchedState.UI.visitedPosts);
        }
        if (path === 'loading.status') {
          handleLoadingStatus(value, i18n, elements);
        }
        if (path === 'loading.networkError') {
          if (value) {
            showError(value, i18n, elements);
            return;
          }
          hideError(elements);
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
        const urls = list.map((item) => item.url);
        const urlSchema = string().url().notOneOf(urls).required();
        urlSchema
          .validate(value)
          .then(() => success())
          .catch((error) => fail(error));
      };

      const checkRSSupdates = (feeds) => {
        feeds.forEach((feed) => {
          const proxy = createProxy(feed.url);
          return axios.get(proxy)
            .then((response) => {
              const xml = response.data.contents;
              const data = parse(xml);
              const existingFeed = feeds.find((f) => f.url === feed.url);
              const existingPosts = watchedState.posts
                .filter((p) => p.feedName === existingFeed.title);
              const newPosts = [];
              data.posts.forEach((post) => {
                if (!existingPosts.some((p) => p.title === post.title)) {
                  newPosts.push({
                    ...post,
                    feedName: existingFeed.title,
                    id: uniqueId('post_'),
                  });
                }
              });
              newPosts.forEach((post) => watchedState.posts.push(post));
            })
            .catch(() => {
              watchedState.form.error = 'networkError';
            });
        });

        setTimeout(() => checkRSSupdates(feeds), 5000);
      };

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const inputValue = formData.get('url');
        watchedState.loading.status = 'loading';
        inputValidation(
          inputValue,
          watchedState.feeds,
          () => {
            watchedState.form.error = '';
            watchedState.form.formState = 'valid';
            const proxy = createProxy(inputValue);
            axios.get(proxy)
              .then((response) => {
                const xml = response.data.contents;
                const data = parse(xml);
                const feedId = uniqueId('feed_');
                const posts = data.posts.map((post) => ({
                  ...post,
                  feedName: data.feed.title,
                  id: uniqueId('post_'),
                }));
                watchedState.feeds.push({ ...data.feed, id: feedId, url: inputValue });
                watchedState.posts = [...watchedState.posts, ...posts];
                watchedState.loading.status = 'success';
                checkRSSupdates(watchedState.feeds);
              })
              .catch((err) => {
                watchedState.loading.status = 'waiting';
                if (err.request) {
                  watchedState.loading.networkError = 'networkError';
                  return;
                }
                watchedState.form.error = 'invalidRSS';
              });
          },
          (error) => {
            watchedState.loading.status = 'waiting';
            watchedState.form.error = error.message;
            watchedState.form.formState = 'invalid';
          },
        );
      });

      elements.postModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        const target = button.getAttribute('data-id');
        const activePost = watchedState.posts.find((post) => post.id === target);
        watchedState.UI.visitedPosts.push(activePost);
        watchedState.UI.postInModal = activePost;
      });
    })
    .catch((error) => console.log(error.message));
};
