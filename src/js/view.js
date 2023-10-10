export const renderTexts = (i18n, elements) => {
  elements.h1.textContent = i18n.t('h1');
  elements.lead.textContent = i18n.t('lead');
  elements.label.textContent = i18n.t('label');
  elements.submitBtn.textContent = i18n.t('submitBtn');
  elements.example.textContent = i18n.t('example');
  elements.modalPrimaryBtn.textContent = i18n.t('modal.primary');
  elements.modalSecondaryBtn.textContent = i18n.t('modal.secondary');
};

export const changeFormState = (state, { input }) => {
  switch (state) {
    case 'invalid':
      input.classList.add('is-invalid');
      break;
    case 'valid':
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      break;
    default:
      console.log(`${state} is unsupported form state`);
  }
};

export const handleLoadingStatus = (state, i18n, elements) => {
  switch (state) {
    case 'waiting':
      elements.input.removeAttribute('disabled');
      elements.submitBtn.removeAttribute('disabled');
      break;
    case 'loading':
      elements.input.setAttribute('disabled', 'true');
      elements.submitBtn.setAttribute('disabled', 'true');
      break;
    case 'success':
      elements.feedback.textContent = i18n.t('successMessage');
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.add('text-success');
      elements.form.reset();
      elements.input.classList.remove('is-valid');
      elements.submitBtn.removeAttribute('disabled');
      break;
    case 'failed':
      elements.input.removeAttribute('disabled');
      elements.submitBtn.removeAttribute('disabled');
      break;
    default:
      throw new Error(`${state} is unknown loading status`);
  }
};

export const showError = (errorKey, i18n, { feedback }) => {
  feedback.textContent = i18n.t(`errors.${errorKey}`);
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
};

export const hideError = ({ feedback }) => {
  feedback.textContent = '';
};

export const renderFeeds = (feeds, i18n, { feedsList, feedsTitle }) => {
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
  });
};

export const renderPosts = (posts, visited, i18n, { postsList, postsTitle }) => {
  postsList.innerHTML = '';
  postsTitle.textContent = i18n.t('postsTitle');
  posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    if (visited.some((p) => p.id === post.id)) {
      a.classList.add('fw-normal', 'link-secondary');
    }
    a.classList.add('fw-bold');
    a.target = '_blank';
    a.rel = 'noopener';
    a.href = post.link;
    a.dataset.id = post.id;
    a.textContent = post.title;
    li.append(a);
    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#postModal';
    button.textContent = i18n.t('btnText');
    li.append(button);
    postsList.append(li);
  });
};

export const renderPostInModal = (post, { modalTitle, modalBody, modalPrimaryBtn }) => {
  const { title, description, link } = post;
  modalTitle.textContent = title;
  modalBody.textContent = description;
  modalPrimaryBtn.href = link;
};

export const markPostsAsVisited = (posts) => {
  posts.forEach((post) => {
    const visited = document.querySelector(`li a[data-id="${post.id}"]`);
    if (visited) {
      visited.classList.remove('fw-bold');
      visited.classList.add('fw-normal', 'link-secondary');
    }
  });
};
