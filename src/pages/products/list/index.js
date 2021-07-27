import SortableTable from "../../../components/sortable-table";
import header from './products-header';

export default class Page {
  get template() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div class="content-box content-box_small">
          <form class="form-inline">
            <div class="form-group">
              <label class="form-label">Сортировать по:</label>
              <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
            </div>
            <div class="form-group">
              <label class="form-label">Статус:</label>
              <select class="form-control" data-elem="filterStatus">
                <option value="" selected="">Любой</option>
                <option value="1">Активный</option>
                <option value="0">Неактивный</option>
              </select>
            </div>
          </form>
        </div>
        <div data-elem="productsContainer" class="products-list__container"></div>
      </div>
    `;
  }

  initEventListeners() {
    this.subElements.filterStatus.addEventListener('change', async (e) => {
      await this.components.productsTable.sortOnServer('quantity', 'asc', {
        status: e.target.value,
      });
    });

    this.subElements.filterName.addEventListener('input', async (e) => {
      await this.components.productsTable.sortOnServer('quantity', 'asc', {
        title_like: e.target.value,
      });
    });

    this.subElements.productsContainer.addEventListener('click', e => {
      const el = e.target.closest('.sortable-table__row');

      if (el && el.dataset.id) {
        const link = document.createElement('a');
        link.href = `/products/${el.dataset.id}`;
        link.click();
      }
    });
  }

  async render() {
    const el = document.createElement('div');
    el.innerHTML = this.template;
    this.element = el.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    await this.renderComponents();
    this.initEventListeners();

    console.log(this);

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-elem]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.elem] = subElement;

      return accum;
    }, {});
  }

  initComponents() {
    this.components = {
      productsTable: new SortableTable(header, {
        url: 'https://course-js.javascript.ru/api/rest/products',
      }),
    };
  }

  async renderComponents() {
    this.subElements.productsContainer.append(
      this.components.productsTable.element
    );
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
