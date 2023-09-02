import 'bootstrap';

const buildFeeds = (arrFeeds) => {
  const feedsContainer = document.querySelector('div.feeds');
  feedsContainer.innerHTML = `<div class="card border-0">
      <div class="card-body">
        <h2 class="card-title h4">Фиды</h2>
      </div>
      <ul class="list-group border-0 rounded-0">
      </ul>
    </div>`;

  const list = feedsContainer.querySelector('.list-group');
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
  arrLinks.includes(id) ? a.classList.add('fw-normal', 'link-secondary') : a.classList.add('fw-bold');
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
  const postsContainer = document.querySelector('div.posts');
  postsContainer.innerHTML = `<div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">Посты</h2>
    </div>
    <ul class="list-group border-0 rounded-0">
    </ul>
  </div>`;

  const list = postsContainer.querySelector('.list-group');
  arrPosts.forEach((post) => {
    const li = buildOnePost(post, arrVisitedLinks, translate);
    list.append(li);
  });
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

export { buildFeeds, buildPosts, buildModal };
