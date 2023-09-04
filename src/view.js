import onChange from 'on-change';

const form = document.querySelector('.rss-form');
const input = document.getElementById('url-input');
const feedbackEl = document.querySelector('.feedback');
const submitBtn = form.querySelector('button');

const buildFeeds = (arrFeeds, t) => {
  const titleFeeds = document.querySelector('.feeds .card-title');
  titleFeeds.textContent = t('feeds');

  const list = document.querySelector('.feeds .list-group');
  list.innerHTML = '';
  arrFeeds.forEach(({ title, description }) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = description;
    li.append(h3);
    li.append(p);
    list.append(li);
  });
};

const buildOnePost = (obj, arrLinks, t) => {
  const { title, link, id } = obj;
  const li = document.createElement('li');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  const a = document.createElement('a');
  const classnames = arrLinks.includes(id) ? ['fw-normal', 'link-secondary'] : ['fw-bold'];
  a.classList.add(...classnames);
  a.setAttribute('href', link);
  a.setAttribute('data-id', id);
  a.setAttribute('target', '_blank');
  a.setAttribute('rel', 'noopener noreferrer');
  a.textContent = title;
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.setAttribute('data-id', id);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.textContent = t('showModalBtn');
  li.append(a);
  li.append(button);
  return li;
};

const buildPosts = (arrPosts, arrVisitedLinks, translate) => {
  const titlePosts = document.querySelector('.posts .card-title');
  titlePosts.textContent = translate('posts');

  const list = document.querySelector('.posts .list-group');
  list.innerHTML = '';
  arrPosts.forEach((post) => {
    const li = buildOnePost(post, arrVisitedLinks, translate);
    list.append(li);
  });
};

const buildFeedback = (value) => { feedbackEl.textContent = value; };

const buildFeedbackStatus = (linkStatus) => {
  if (linkStatus === 'invalid') {
    input.classList.add('is-invalid');
    feedbackEl.classList.add('text-danger');
  } else {
    input.value = '';
    input.focus();
    input.classList.remove('is-invalid');
    feedbackEl.classList.remove('text-danger');
    feedbackEl.classList.add('text-success');
  }
};

const buildRssFormStatus = (rssFormStatus) => {
  if (rssFormStatus === 'pending') {
    input.setAttribute('readonly', 'true');
    submitBtn.setAttribute('disabled', 'true');
  } else {
    input.removeAttribute('readonly');
    submitBtn.removeAttribute('disabled');
  }
};

const getFormatVisitedLink = (id) => {
  const linkPost = document.querySelector(`[data-id="${id}"]`);
  linkPost.classList.remove('fw-bold');
  linkPost.classList.add('fw-normal', 'link-secondary');
};

const buildModal = (modId, arrPosts, arrVisitedLinksIds) => {
  const [{
    title, link, description, id,
  }] = arrPosts.filter((el) => el.id === modId);
  getFormatVisitedLink(id);
  if (!arrVisitedLinksIds.includes(id)) {
    arrVisitedLinksIds.push(id);
  }
  const modalContainer = document.getElementById('modal');

  const modalTitle = modalContainer.querySelector('.modal-title');
  modalTitle.textContent = title;
  const modalBody = modalContainer.querySelector('.modal-body');
  modalBody.textContent = description;
  const modalLink = modalContainer.querySelector('.full-article');
  modalLink.setAttribute('href', link);
};

const getWatchedState = (translate, state) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssForm.dataStatus.link':
        buildFeedbackStatus(value);
        break;
      case 'rssForm.data.feedback':
        buildFeedback(translate(state.rssForm.data.feedback));
        break;
      case 'feeds':
        buildFeeds(state.feeds, translate);
        break;
      case 'posts':
        buildPosts(state.posts, state.visitedLinksIds, translate);
        break;
      case 'rssForm.status':
        buildRssFormStatus(value);
        break;
      case 'modal.modalID':
        buildModal(state.modal.modalID, state.posts, state.visitedLinksIds);
        break;
      default:
        break;
    }
  });

  return watchedState;
};

export default getWatchedState;
