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

  const list = feedsContainer.querySelector('.list-group');
  arrFeeds.forEach(({ title, description }) => {
		console.log(title, description);
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
		console.log(list);
	});
};

const buildPosts = (arrPosts) => {
	const postsContainer = document.querySelector('div.posts');
	postsContainer.innerHTML = `<div class="card border-0">
    <div class="card-body">
      <h2 class="card-title h4">Посты</h2>
    </div>
    <ul class="list-group border-0 rounded-0">
		</ul>
	</div>`;

	// <li class="list-group-item d-flex justify-content-between align-items-start border-0 border-end-0"><a
  //         href="https://ru.hexlet.io/courses/java-web/lessons/servlets/theory_unit" class="fw-bold" data-id="2"
  //         target="_blank" rel="noopener noreferrer">Сервлеты / Java: Веб-технологии</a><button type="button"
  //         class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal"
  //         data-bs-target="#modal">Просмотр</button></li>

	const list = postsContainer.querySelector('.list-group');
  arrPosts.forEach(({ title, link, description, id }) => {
		console.log(title, link, description);
		const li = document.createElement('li');
		li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
		const a = document.createElement('a');
		a.classList.add('fw-bold');
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
		button.textContent = 'Просмотр';
		li.append(a);
		li.append(button);
		list.append(li);
		// console.log(list);
	});
};

export { buildFeeds, buildPosts };