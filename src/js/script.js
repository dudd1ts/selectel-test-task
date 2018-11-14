/**
 * Используется для вызова кода, который будет выплнен, токо когда весь DOM будет загружен
 * Аналог Jquery функции $(document).ready
 */
function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
/**
 * Отправляет GET зарос к указанному url
 * @param  {string} url - url по которому отправляется запрос
 * @return {Promise}
 */
function httpGet(url) {
  return new Promise(function(resolve, reject) {

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);

    xhr.onload = function() {
      if (this.status === 200) {
        // Добавлена задержка дабы подольше лицезреть лоадер :)
        setTimeout(() => resolve(this.response), 3000);
      } else {
        reject('Ошибка соединения');
      }
    };

    xhr.onerror = function() {reject('Ошибка соединения')};

    xhr.send();
  });
}

/**
 * Проверяет, есть ли указанный css класс у элемента
 * @param  {HTMLElement} element - DOM элемент у которого проверяется наличие класса
 * @param  {String} cls - имя css класса
 * @return {Boolean}
 */
function hasClass(element, cls) {
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') !== -1;
}

/**
 * Возвращает число, показывающее каким по счету дочерним элементом является переданный DOM элемент
 * @param  {HTMLElement} element
 * @return {Number}
 */
function getElementNumber(element) {
  let number = 0;
  while(element = element.previousElementSibling) {
    number++;
  }

  return number;
}
