// Diet/allergen icon PNGs live under public/icons/<name>.png (extracted
// from the legacy public/images.js base64 blob — see CLAUDE.md).

export function iconUrl(name) {
  return `${import.meta.env.BASE_URL}icons/${name}.png`;
}

const byteCache = new Map();

// Fetches and caches an icon's raw PNG bytes for embedding in the PDF via
// jsPDF's addImage, which accepts a Uint8Array directly — verified to
// produce a byte-identical embedded image stream to loading the icon
// through an <img> element.
export function loadIconBytes(name) {
  if (!byteCache.has(name)) {
    byteCache.set(
      name,
      fetch(iconUrl(name))
        .then((res) => res.arrayBuffer())
        .then((buf) => new Uint8Array(buf)),
    );
  }
  return byteCache.get(name);
}
