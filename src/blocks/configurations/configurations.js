ready(function(){
  httpGet('https://api.jsonbin.io/b/5b683d097b212953678c03dd')
    .then((response) => {
      const configs = JSON.parse(response);
      const configsEl = document.querySelector('.configurations');
      const configsLoaderEl = configsEl.querySelector('.configurations__loader');
      const configsContentEl = document.createElement('div');
      configsContentEl.className = 'cofigurations__content';

      let template = configs.map(configTemplate).join(``);
      configsContentEl.innerHTML = template;
      configsEl.replaceChild(configsContentEl, configsLoaderEl);
  })
    .catch((error) => {
        const configsEl = document.querySelector('.configurations');
        const configsLoaderEl = configsEl.querySelector('.configurations__loader');

        const configsErrorEl = document.createElement('div');
        configsErrorEl.className = 'configurations__error';
        configsErrorEl.innerHTML = error;

        configsEl.replaceChild(configsErrorEl, configsLoaderEl);
    });
});

const configTemplate = (data) => `<div class="configurations__item">
  <div class="configurations__cell configurations__cell--cpu">
    <span class="configurations__cell-title">Процессор</span>
    ${data.cpu}
  </div>
  <div class="configurations__cell configurations__cell--hdd">
    <span class="configurations__cell-title">Жесткий диск</span>
    ${data.hdd} ГБ
  </div>
  <div class="configurations__cell configurations__cell--ram">
    <span class="configurations__cell-title">Память</span>
    ${data.ram} ГБ
  </div>
  <div class="configurations__cell configurations__cell--price">
    <span class="configurations__cell-title">Цена</span>
    ${data.price.toLocaleString('ru')} ₽/мес.
  </div>
  <div class="configurations__cell configurations__cell--order">
    <a href="https://selectel.ru/" class="button" target="_blank" rel="noopener">Заказать</a>
  </div>
</div>`;
