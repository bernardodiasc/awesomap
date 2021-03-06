export default class DomUtils {

  static createFrom (options) {
    let { container, content, tag, classList, timer, single } = options;

    if (!container) {
      container = document.querySelectorAll('body')[0];
    }
    //console.log(container);

    let element = container.querySelectorAll(tag)[0] || [];
    if (single && element.length > 0) {
      container.removeChild(element);
    }

    if (!tag) {
      tag = 'div';
    }
    element = document.createElement(tag);

    if (classList) {
      element.classList.add(classList);
    }

    container.appendChild(element);

    if (tag === 'div' || tag === 'p' || tag === 'h1') {
      if (content) {
        element.innerHTML = content;
      }
    } else if (tag === 'img') {
      element.src = content;
    }

    if (timer) {
      setTimeout(function(){
        container.removeChild(element);
      }, timer);
    }

    return element;
  }
}
