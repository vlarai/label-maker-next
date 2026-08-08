import { defaultDishes, blankDish } from "./data.js";

const STORAGE_KEY = "dishes";

function loadInitialDishes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Could not read dishes from localStorage", e);
  }
  return structuredClone(defaultDishes);
}

function splitTags(value) {
  const raw = Array.isArray(value) ? value : (value || "").split(",");
  return raw.map((t) => (t || "").trim().toLowerCase()).filter(Boolean);
}

class LabelStore {
  dishes = $state(loadInitialDishes());
  cards = $state([]);
  search = $state("");
  currentSort = $state("id");
  currentSortDir = $state("desc");

  get filteredDishes() {
    const q = this.search.toLowerCase();
    if (!q) return this.dishes;
    return this.dishes.filter((dish) => {
      return (
        (dish.germanText || "").toLowerCase().includes(q) ||
        (dish.englishText || "").toLowerCase().includes(q) ||
        (dish.germanTextBold || "").toLowerCase().includes(q) ||
        (dish.englishTextBold || "").toLowerCase().includes(q) ||
        (dish.category || "").toLowerCase().includes(q) ||
        (dish.tags && dish.tags.includes(q))
      );
    });
  }

  get sortedDishes() {
    const modifier = this.currentSortDir === "desc" ? -1 : 1;
    const key = this.currentSort;
    return [...this.filteredDishes].sort((a, b) => {
      if (key === "german") {
        return (
          (a.germanTextBold + a.germanText).localeCompare(
            b.germanTextBold + b.germanText,
          ) * modifier
        );
      } else if (key === "english") {
        return (
          (a.englishTextBold + a.englishText).localeCompare(
            b.englishTextBold + b.englishText,
          ) * modifier
        );
      } else if (key === "tags") {
        return (
          (a.tags ? a.tags.join(",") : "").localeCompare(
            b.tags ? b.tags.join(",") : "",
          ) * modifier
        );
      } else if (key === "category") {
        return (a.category || "").localeCompare(b.category || "") * modifier;
      } else {
        if (a[key] < b[key]) return -1 * modifier;
        if (a[key] > b[key]) return 1 * modifier;
        return 0;
      }
    });
  }

  get categories() {
    return [
      ...new Set(this.dishes.map((d) => d.category).filter(Boolean)),
    ].sort();
  }

  get tags() {
    return [...new Set(this.dishes.flatMap((d) => d.tags || []))].sort();
  }

  sort(name) {
    if (name === this.currentSort) {
      this.currentSortDir = this.currentSortDir === "asc" ? "desc" : "asc";
    }
    this.currentSort = name;
  }

  getLastId() {
    return this.dishes.length
      ? Math.max(...this.dishes.map((d) => d.id))
      : 0;
  }

  addDish(formDish) {
    const id = this.getLastId() + 1;
    this.dishes.push({ ...formDish, id, tags: splitTags(formDish.tags) });
    this.persist();
  }

  updateDish(id, formDish) {
    const index = this.dishes.findIndex((d) => d.id === id);
    if (index === -1) return;
    this.dishes[index] = { ...formDish, id, tags: splitTags(formDish.tags) };
    this.persist();
  }

  deleteDish(id) {
    this.dishes = this.dishes.filter((d) => d.id !== id);
    this.persist();
  }

  addToCards(dishId, multiply = false) {
    const dish = this.dishes.find((d) => d.id === dishId);
    if (!dish) return;
    const count = multiply ? 6 : 1;
    for (let i = 0; i < count; i++) this.cards.push(dish);
  }

  addAllToCards() {
    this.filteredDishes.forEach((dish) => this.cards.push(dish));
  }

  deleteCard(idx) {
    this.cards.splice(idx, 1);
  }

  deleteAllCards() {
    this.cards = [];
  }

  replaceDishes(arr) {
    this.dishes = arr.map((d) => ({ ...d, tags: splitTags(d.tags) }));
    this.persist();
  }

  persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.dishes));
  }
}

export const store = new LabelStore();
export { blankDish };
