/**
 * Substitute an element by a copy with all of its attributes. Possibly
 * a copy with a different tag name.
 * @function replaceByEmptyCopy
 * @param  {HTMLElement} el         Element to be substituted
 * @param  {[String]} newTagName Optional new tagName.
 * @return {HTMLElement}            The new element or null.
 */
function replaceByEmptyCopy(el, newTagName) {
  'use strict';
  if (!el || !el.parentNode) {
    return null;
  }

  var newEl = document.createElement(newTagName || el.tagName);
  var elAttributes = el.attributes;
  var attrName;
  var attrValue;
  var i;

  //Copy all attributes
  for (i = 0; i < elAttributes.length; i++) {
    attrName = elAttributes[i].nodeName;
    attrValue = el.getAttribute(attrName);
    newEl.setAttribute(attrName, attrValue);
  }

  //Switch original for new one
  el.parentNode.insertBefore(newEl, el);
  el.remove();
  return newEl;
}
