export const diets = {
  a: "Vegetarian",
  b: "Vegan",
  c: "Pork",
  d: "Halal",
  e: "Gluten-free",
  f: "Lactose-free",
  g: "Austrian",
  h: "Indian-Vegetarian",
  i: "Indian-Non-Vegetarian",
};

export const allergens = {
  a: "Gluten",
  b: "Crustaceans",
  c: "Egg",
  d: "Fish",
  e: "Peanuts",
  f: "Soya",
  g: "Dairy",
  h: "Nuts",
  l: "Celery",
  m: "Mustard",
  n: "Sesame",
  o: "Sulphite",
  p: "Lupin",
  r: "Molluscs",
};

export const dietOptions = [
  { value: "a", label: "Vegetarian" },
  { value: "b", label: "Vegan" },
  { value: "c", label: "Pork" },
  { value: "d", label: "Halal" },
  { value: "e", label: "Gluten free" },
  { value: "f", label: "Lactose free" },
  { value: "g", label: "Austrian" },
  { value: "h", label: "Indian Veg" },
  { value: "i", label: "Indian Non Veg" },
];

export const allergenOptions = [
  { value: "a", label: "Gluten ⓐ" },
  { value: "b", label: "Crustaceans ⓑ" },
  { value: "c", label: "Egg ⓒ" },
  { value: "d", label: "Fish ⓓ" },
  { value: "e", label: "Peanuts ⓔ" },
  { value: "f", label: "Soya ⓕ" },
  { value: "g", label: "Dairy ⓖ" },
  { value: "h", label: "Nuts ⓗ" },
  { value: "l", label: "Celery ⓛ" },
  { value: "m", label: "Mustard ⓜ" },
  { value: "n", label: "Sesame ⓝ" },
  { value: "o", label: "Sulphite ⓞ" },
  { value: "p", label: "Lupin ⓟ" },
  { value: "r", label: "Molluscs ⓡ" },
];

export const defaultDishes = [
  {
    id: 1,
    germanTextBold: "Hummus",
    germanText: "mit roter Bete auf einem Karotten-Sonnenblumen-Mix-Brot",
    englishTextBold: "Hummus",
    englishText: "topped with Red Beets on a Carrot-Sunflower mix Bread",
    allergens: ["a", "n"],
    diets: [],
    category: "Main course",
    tags: [],
  },
];

export function blankDish() {
  return {
    germanTextBold: "",
    germanText: "",
    englishTextBold: "",
    englishText: "",
    allergens: [],
    diets: [],
    category: "",
    tags: [],
  };
}
