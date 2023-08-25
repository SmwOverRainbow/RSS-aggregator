import './scss/styles.scss';
// import * as bootstrap from 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash';
import { buildFeeds, buildPosts } from './view.js';

// import keyBy from 'lodash/keyBy.js';
// import has from 'lodash/has.js';
// import isEmpty from 'lodash/isEmpty.js';

const getDataFromDoc = (doc) => {
	const result = {
		feed: {},
		posts: [],
	};

	result.feed.title = doc.querySelector('channel > title').textContent;
	result.feed.description = doc.querySelector('channel > description').textContent;
	result.feed.id = uniqueId('feed_');

	const items = Array.from(doc.querySelectorAll('channel > item'));
	result.posts = items.map((el) => {
		const title = el.querySelector('title').textContent;
		const link = el.querySelector('link').textContent;
		const description = el.querySelector('description').textContent;
		const id = uniqueId('post_');
		return { title, link, description, id };
	});

	return result;
};

yup.setLocale({
  string: {
		default: 'defaultErr',
    url: 'mustBeUrl',
  },
	mixed: {
		notOneOf: 'alreadyExist',
	}
});

i18next.init({
  lng: 'ru',
  debug: true,
  resources: {
    ru: {
      translation: {
        defaultErr: 'Ошибка',
				mustBeUrl: 'Ссылка должна быть валидным URL',
				empty: 'Не должно быть пустым',
				alreadyExist: 'RSS уже существует',
				success: 'RSS успешно загружен',
      }
    }
  }
});

const state = {
	rssForm: {
		// status: 'valid',
		data: {
			link: '',
			feedback: '',
		},
		dataStatus: {
			link: '',
		},
	},
	rssLinks: [],
	feeds: [],
	posts: [],
};

const form = document.querySelector('.rss-form');
const input = document.getElementById('url-input');
const feedbackEl = document.querySelector('.feedback');

// Разделить вотчеры по областям стейта (а не на весь стейт вешать) !!! <----  ?
// сделать отрисовщики на каждый "слой" стейта, импортировать сюда, через switch/case решить какой отрисовщик нужен

const watchedState = onChange(state, (path, value) => {
	if (path === 'rssForm.dataStatus.link') {
		if (value === 'invalid') {
			input.classList.add('is-invalid');
			feedbackEl.classList.add('text-danger');
		} else {
			input.classList.remove('is-invalid');
			feedbackEl.classList.remove('text-danger');
			feedbackEl.classList.add('text-success');
		}
	}
	if (path === 'rssForm.data.feedback') {
		feedbackEl.textContent = i18next.t(state.rssForm.data.feedback);
	}
	if (path === 'feeds') {
		buildFeeds(state.feeds);
	}
	if (path === 'posts') {
		buildPosts(state.posts);
	}
});

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const currentLink = input.value;
	state.rssForm.data.link = currentLink;

	const schema = yup.string().url().notOneOf(state.rssLinks);
	schema.validate(currentLink, { abortEarly: true })
	.then(() => {
		state.rssLinks.push(currentLink);
		watchedState.rssForm.data.feedback = 'success';
		watchedState.rssForm.dataStatus.link = 'valid';

		const corsUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(currentLink)}`;
		const response = axios.get(corsUrl);
		return response;
	})
	.then((response) => {
		input.value = '';
		input.focus();

		const parser = new DOMParser();
		const parsedDoc = parser.parseFromString(response.data.contents, 'application/xml');
		console.log(parsedDoc);
		const parsererror = parsedDoc.querySelector('parsererror');

		if (parsererror) {
			const err = new Error('Document is empty');
			err.name = 'ParseError';
			throw err;
		}

		const dataDoc = getDataFromDoc(parsedDoc);
		watchedState.feeds = [dataDoc.feed, ...watchedState.feeds];
		watchedState.posts = dataDoc.posts;
		// данные из ответа помещаем в стейт и вызыается отрисовка фида данных
	})
	.catch((e) => {
		if (e instanceof yup.ValidationError){
			const [error] = e.errors;
			watchedState.rssForm.data.feedback = error;
			watchedState.rssForm.dataStatus.link = 'invalid';
		} else if (e.name === 'ParseError') {
			watchedState.rssForm.data.feedback = 'empty';
			watchedState.rssForm.dataStatus.link = 'invalid';
		}
		// Прописать ошибки сети !!!!
	});
});
