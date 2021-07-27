import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './sales-header.js';

import fetchJson from '../../utils/fetch-json.js';

const ORDERS_API_URL = 'https://course-js.javascript.ru/api/rest/orders';
const getSalesUrl = ({ from, to }) => {
  return `${ORDERS_API_URL}?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`;
};

export default class Page {
  get template() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <div class="rangepicker" data-element="rangePicker"></div>
        </div>
        <div class="full-height flex-column" data-element="ordersContainer"></div>
      </div>
    `;
  }

  async render() {
    const el = document.createElement('div');
    el.innerHTML = this.template;
    this.element = el.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.createComponents();
    this.mountComponents();

    console.log(this);

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  createComponents() {
    const now = new Date();
    this.range = {
      from: new Date(now.getFullYear(), now.getMonth()),
      to: new Date(now.getFullYear(), now.getMonth() + 1),
    };

    this.components = {
      rangePicker: new RangePicker({
        ...this.range,
      }),
      sortableTable: new SortableTable(header, {
        url: getSalesUrl(this.range),
      }),
    };
  }

  mountComponents() {
    this.subElements.rangePicker.append(
      this.components.rangePicker.element
    );
    this.subElements.ordersContainer.append(
      this.components.sortableTable.element
    );

    this.components.rangePicker.element.addEventListener('date-select', this.changeRange);
  }

  changeRange = (event) => {
    if (!event.detail) {
      return;
    }

    const { from, to } = event.detail;
    this.updateComponents(from, to);
  }

  async updateComponents(from, to) {
    this.range = { from, to };
    const sales = await fetchJson(getSalesUrl(this.range));
    this.components.sortableTable.addRows(sales);
    this.components.sortableTable.update(sales);
  }
}
