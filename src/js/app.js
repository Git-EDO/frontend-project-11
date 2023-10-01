import onChange from 'on-change';
import axios from 'axios';
import { string, setLocale } from 'yup';
import { changeFormState, hideError, renderFeeds, renderPosts, showError, renderPostInModal, markPostsAsVisited, showSuccessMessage } from './view';
import { parse, getFeed, getPosts } from './parser/parser';

export default () => {
    const input = document.getElementById('url-input');
    const form = document.querySelector('form');
    const postModal = document.getElementById('postModal');
    
    const state = {
        formState: 'valid',
        inputValue: '',
        error: '',
        RSSlist: [],
        feeds: [],
        posts: [],
        postInModal: {},
        visitedPosts: []
    };
    
    const watchedState = onChange(state, (path, value) => {
        if (path === 'formState') {
            changeFormState(value);
        }
        if (path === 'error') {
            value ? showError(value) : hideError();
        }
        if (path === 'inputValue') {
            inputValidation(value);
        }
        if (path === 'RSSlist') {
            checkRSSupdates();
        }
        if (path === 'feeds') {
            renderFeeds(value);
        }
        if (path === 'posts') {
            renderPosts(value);
        }
        if (path === 'postInModal') {
            renderPostInModal(value)
        }
        if (path === 'visitedPosts') {
            markPostsAsVisited(value)
        }
    });

    setLocale({
        mixed: {
            notOneOf: 'alreadyInRSSlist',
            required: 'isRequired'
        },
        string: {
            url: 'invalidURL'
        }
    });
    
    const urlSchema = string().url().notOneOf(watchedState.RSSlist).required();
    
    input.addEventListener('input', (e) => watchedState.inputValue = e.target.value);

    const inputValidation = (value) => {
        urlSchema
        .validate(value)
        .then(() => {
            watchedState.error = '';
            watchedState.formState = 'valid';
        })
        .catch((error) => {
            watchedState.error = error.message;
            watchedState.formState = 'invalid';
        })
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
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
                watchedState.formState = 'filling';
                showSuccessMessage();
            })
            .catch((e) => {
                watchedState.formState = 'valid';
                if (e.request) {
                    watchedState.error = 'networkError';
                    return
                }
                watchedState.error = 'invalidRSS';
            });
    });

    const checkRSSupdates = () => {
        const requests = watchedState.RSSlist.map(rss => {
            const proxy = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rss)}`;
            axios.get(proxy)
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

    const getNewPosts = (html, existingPosts) => {
        const posts = getPosts(html);
        const newPosts = [];
        posts.forEach((post) => {
            if (!existingPosts.some((p) => p.title === post.title)) {
                newPosts.push(post);
            }
        });
        return newPosts;
    };

    postModal.addEventListener('show.bs.modal', (event) => {
        const button = event.relatedTarget;
        const target = button.getAttribute('data-id');
        const activePost = watchedState.posts.find((post) => post.title === target);
        watchedState.visitedPosts.push(activePost);
        watchedState.postInModal = activePost;
    });
}