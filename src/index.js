import './scss/styles.scss';
// import * as bootstrap from 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
// import keyBy from 'lodash/keyBy.js';
// import has from 'lodash/has.js';
// import isEmpty from 'lodash/isEmpty.js';

yup.setLocale({
	mixed: {
    default: 'RSS уже существует',
  },
  string: {
    url: 'Ссылка должна быть валидным URL',
  },
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
	feedRss: [],
};

const schema = yup.string().url().notOneOf(state.feedRss);

const form = document.querySelector('.rss-form');
const input = document.getElementById('url-input');
const feedbackEl = document.querySelector('.feedback');

const watchedState = onChange(state, (path, value) => {
	if (path === 'rssForm.dataStatus.link') {
		if (value === 'invalid') {
			input.classList.add('is-invalid');
			feedbackEl.classList.add('text-danger');
		} else {
			input.classList.remove('is-invalid');
			feedbackEl.classList.remove('text-danger').add('text-success');
		}
		feedbackEl.textContent = state.rssForm.data.feedback;
	}
});

form.addEventListener('submit', (e) => {
	e.preventDefault();
	const currentLink = input.value;
	state.rssForm.data.link = currentLink;

	schema.validate(currentLink).then(() => {
		state.rssForm.data.feedback = 'RSS успешно загружен';
		state.feedRss.push(currentLink);
		watchedState.rssForm.dataStatus.link = 'valid';
		// здесь будет запрос на сервер и возврат промиса от axios
	}).then(() => {
		input.value = '';
		input.focus();
		// данные из ответа помещаем в стейт и вызыается отрисовка фида данных
	}).catch((e) => {
		if (e instanceof yup.ValidationError) {
			const [error] = e.errors;
			state.rssForm.data.feedback = error;
			watchedState.rssForm.dataStatus.link = 'invalid';
		}
	});
	// }
});
