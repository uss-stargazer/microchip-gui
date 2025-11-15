export function camelize(s: string): string {
  return s.replace(/\-(\w)/g, (str, letter) => letter.toUpperCase());
}

export function getStyle(el: any, styleProp: string): any {
  console.log("el", el);
  if (el.currentStyle) {
    return el.currentStyle[camelize(styleProp)];
  } else if (document.defaultView && document.defaultView.getComputedStyle) {
    return document.defaultView
      .getComputedStyle(el, null)
      .getPropertyValue(styleProp);
  } else {
    return el.style[camelize(styleProp)];
  }
}
