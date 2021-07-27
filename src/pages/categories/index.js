import SortableList from "../../components/sortable-list";
import fetchJson from '../../utils/fetch-json.js';

const CATEGORIES_API_URL = 'https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory';

export default class Page {
  async render() {
    const el = document.createElement('div');

    el.innerHTML = `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <div data-elem="categoriesContainer"></div>
      </div>
    `;

    this.element = el.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.categories = await fetchJson(CATEGORIES_API_URL);

    this.renderCategories();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.subElements.categoriesContainer.addEventListener('sortable-list-reorder', e => {
      const el = e.target.closest('.category');
      const sortChange = e.detail;

      this.reorderSubcategories(el.dataset.id, sortChange);
    });

    this.subElements.categoriesContainer.addEventListener('click', e => {
      const header = e.target.closest('.category__header');
      const category = e.target.closest('.category');

      if (header) {
        category.classList.toggle('category_open');
      }
    });
  }

  async reorderSubcategories(id, { from, to }) {
    const { subcategories } = this.categories.find(item => item.id === id);
    const [moved] = subcategories.splice(from, 1);
    subcategories.splice(to, 0, moved);
    const payload = subcategories.map(({ id }, i) => ({ id, weight: (i + 1) }));

    await fetchJson('https://course-js.javascript.ru/api/rest/subcategories', {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;

      return accum;
    }, {});
  }

  renderCategories() {
    this.categories.forEach(category => {
      this.subElements.categoriesContainer.append(
        this.renderCategory(category)
      );
    });
  }

  renderCategory(cat) {
    const el = document.createElement('div');

    const sortableList = new SortableList({
      items: cat.subcategories.map(item => {
        const el = document.createElement('div');
        el.innerHTML = `
          <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${item.id}">
            <strong>${item.title}</strong>
            <span><b>${item.count}</b> products</span>
          </li>
        `;
        return el.firstElementChild;
      }),
    });

    el.innerHTML = `
      <div class="category category_open" data-id="${cat.id}">
        <header class="category__header">${cat.title}</header>
        <div class="category__body">
          <div class="subcategory-list"></div>
        </div>
      </div>
    `;

    const subcategoryList = el.querySelector('.subcategory-list');
    subcategoryList.append(sortableList.element);

    return el.firstElementChild;
  }
}
