import { store } from "./store.svelte.js";

function pad(n) {
  return n.toString().padStart(2, "0");
}

function timestampName(prefix, ext) {
  const d = new Date();
  return `${prefix}_${pad(d.getDate())}${pad(d.getMonth() + 1)}${d.getFullYear()}_${pad(d.getHours())}${pad(d.getMinutes())}.${ext}`;
}

export function saveDishesAsJSON() {
  const blob = new Blob([JSON.stringify(store.dishes)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = timestampName("LM", "json");
  a.click();
  URL.revokeObjectURL(a.href);
}

export function loadDishesFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) {
          throw new Error("Expected a JSON array of dishes");
        }
        store.replaceDishes(data);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
