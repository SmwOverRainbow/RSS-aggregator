const buildFeeds = (arrFeeds) => {
    const feedsContainer = document.querySelector('div.feeds');
    feedsContainer.innerHTML = `<div class="card border-0">
            <div class="card-body">
                <h2 class="card-title h4">Фиды</h2>
            </div>
            <ul class="list-group border-0 rounded-0">
            </ul>
        </div>`;

    // <li class="list-group-item border-0 border-end-0">
//   <h3 class="h6 m-0">Новые уроки на Хекслете</h3>
//   <p class="m-0 small text-black-50">Практические уроки по программированию</p>
// </li>

    const list = feedsContainer.querySelector('list-group');
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

export default buildFeeds;