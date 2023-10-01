import i18n from "./translations";
const h1 = document.querySelector('h1');
const lead = document.querySelector('.lead');
const label = document.querySelector('.form-label');
const submitBtn = document.querySelector('.btn[type="submit"]');
const example = document.querySelector('.example-text');
const form = document.querySelector('form');
const input = document.getElementById('url-input');
const feedback = document.querySelector('.feedback');
const feedsList = document.querySelector('.feeds ul.list-group');
const postsList = document.querySelector('.posts ul.list-group');
const feedsTitle = document.querySelector('.feeds .card-title');
const postsTitle = document.querySelector('.posts .card-title');
const modalTitle = document.querySelector('#postModal .modal-title');
const modalBody = document.querySelector('#postModal .modal-body');
const modalPrimaryBtn = document.querySelector('#postModal .btn-primary');
const modalSecondaryBtn = document.querySelector('#postModal .btn-secondary');

export const changeFormState = (state) => {
    switch (state) {
        case 'invalid':
            submitBtn.setAttribute('disabled', true);
            input.classList.add('is-invalid');
            break
        case 'valid':
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            input.removeAttribute('disabled');
            submitBtn.removeAttribute('disabled');
            break
        case 'sending':
            submitBtn.setAttribute('disabled', true);
            input.setAttribute('disabled', true);
            break
        case 'success':
            form.reset();
            input.focus();
            submitBtn.removeAttribute('disabled');
            input.removeAttribute('disabled');
            input.classList.remove('is-valid');
            feedback.textContent = i18n.t('successMessage');
            feedback.classList.remove('text-danger');
            feedback.classList.add('text-success');
            break
        default:
            console.log(`${state} is unsupported form state`)
    }
};

export const showError = (errorKey) => {
    feedback.textContent = i18n.t('errors.' + errorKey);
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
};

export const hideError = () => feedback.textContent = '';

i18n.init().then((t) => {
    h1.textContent = t('h1');
    lead.textContent = t('lead');
    label.textContent = t('label');
    submitBtn.textContent = t('submitBtn');
    example.textContent = t('example');
    modalPrimaryBtn.textContent = t('modal.primary');
    modalSecondaryBtn.textContent = t('modal.secondary');
})

export const renderFeeds = (feeds) => {
    feedsList.innerHTML = '';
    feedsTitle.textContent = i18n.t('feedsTitle');
    feeds.forEach((feed) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'border-0', 'border-end-0');
        const h3 = document.createElement('h3');
        h3.classList.add('h6', 'm-0');
        h3.textContent = feed.title;
        li.append(h3);
        const p = document.createElement('p');
        p.classList.add('m-0', 'small', 'text-black-50');
        p.textContent = feed.subtitle;
        li.append(p);
        feedsList.append(li);
    })
}

export const renderPosts = (posts, visited) => {
    postsList.innerHTML = '';
    postsTitle.textContent = i18n.t('postsTitle');
    posts.forEach((feed) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        const a = document.createElement('a');
        if (visited.some((p) => p.title === feed.title)) {
            a.classList.add('fw-normal', 'link-secondary');
        }
        a.classList.add('fw-bold');
        a.target = '_blank';
        a.rel = 'noopener';
        a.href = feed.link;
        a.dataset.id = feed.title; // временно
        a.textContent = feed.title;
        li.append(a);
        const button = document.createElement('button');
        button.type = 'button';
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        button.dataset.id = feed.title; // временно
        button.dataset.bsToggle = 'modal';
        button.dataset.bsTarget = '#postModal';
        button.textContent = i18n.t('btnText');
        li.append(button);
        postsList.append(li);
    })
}

export const renderPostInModal = (post) => {
    const { title, description, link } = post
    modalTitle.textContent = title
    modalBody.textContent = description
    modalPrimaryBtn.href = link
}

export const markPostsAsVisited = (posts) => {
    posts.forEach((post) => {
        const visited = document.querySelector(`li a[data-id="${post.title}"]`)
        if (visited) {
            visited.classList.remove('fw-bold');
            visited.classList.add('fw-normal', 'link-secondary');
        }
    })
}

