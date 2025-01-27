import { base64 } from 'rfc4648';

const tags = new Set(['script', 'style', 'svg', 'img', 'picture', 'video', 'audio', 'iframe']);
const attrs = new Set(['alt', 'title', 'aria-label', 'role', 'name', 'id', 'placeholder', 'type']);

export const getTarget = async (target: Element) => {
  do {
    if (target.textContent) {
      return target.textContent;
    }

    if (target.parentElement) {
      target = target.parentElement;
    } else {
      return null;
    }
  } while (target);

  return null;
};

export const extractDocument = async () => {
  const root = document.createElement('div');
  const shadow = root.attachShadow({ mode: 'open' });

  shadow.innerHTML = document.documentElement.outerHTML;

  for (const el of shadow.querySelectorAll([...tags].join(', '))) {
    el.remove();
  }

  for (const el of shadow.querySelectorAll('*')) {
    for (const attr of el.getAttributeNames()) {
      if (!attrs.has(attr)) {
        el.removeAttribute(attr);
      }
    }
  }

  const html = shadow.innerHTML.replaceAll(/<!--[\S\s]*?-->/g, '');
  root.remove();

  const stream = new Blob([html], { type: 'text/html' }).stream();
  const response = new Response(stream.pipeThrough(new CompressionStream('gzip')));
  const bytes = await response.bytes();

  return base64.stringify(bytes);
};
