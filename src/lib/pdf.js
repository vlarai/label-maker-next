import { jsPDF } from "jspdf";

// Layout constants ported verbatim from the original vanilla/Vue implementation.
// These values are tuned to a specific physical card stock — do not change them
// without re-measuring a printed sheet.
const X = 7.5;
const Y = 33.5;
const CARD_CELL_HEIGHT = 38;
const CARD_WIDTH = 65;
const CARD_HEIGHT = 115;
const MAX_ICON_SIZE = 11;
const MAX_TEXT_WIDTH = 55;
const TEXT_OPTS = { align: "center", maxWidth: MAX_TEXT_WIDTH };

// Wrapped-line count for a text run. Bold headings have a floor of 1 line
// when present (matches the original: a single-line bold heading still
// counts as 1 toward the block's vertical centering); regular lines only
// count when they actually wrap, i.e. a single-line regular text counts
// as 0 — this asymmetry is intentional, calibrated spacing from the
// original app, not an oversight.
function wrapLineCount(doc, text, minOne = false) {
  if (minOne && !text) return 0;
  const width = doc.getTextDimensions(text || "").w;
  if (width / MAX_TEXT_WIDTH > 1) return Math.ceil(width / MAX_TEXT_WIDTH);
  return minOne ? 1 : 0;
}

// Draws a centered bold heading over a centered regular line, vertically
// centered as a pair around `rowBaseY`. Used for both the German and
// English text blocks.
function drawStackedText(doc, x, rowBaseY, boldText, text, lineHeightMm) {
  const linesBold = wrapLineCount(doc, boldText, true);
  const linesRegular = wrapLineCount(doc, text);
  const base =
    rowBaseY + lineHeightMm / 2 - (lineHeightMm * (linesBold + linesRegular)) / 2;
  const boldY = base + (lineHeightMm * linesBold) / 2;

  if (boldText) {
    doc.setFont(undefined, "bold");
    doc.text(boldText, x, boldY, TEXT_OPTS);
    doc.setFont(undefined, "normal");
  }
  doc.text(text, x, boldY + lineHeightMm * linesBold, TEXT_OPTS);
}

// Draws one label card with its top-left corner at (originX, originY).
// Everything below is positioned relative to that origin, so placing a
// card on the sheet is just picking where its origin lands.
function drawCard(doc, card, originX, originY, diets, allergens, hImages) {
  const cx = originX + CARD_WIDTH / 2;

  doc.rect(originX, originY, CARD_WIDTH, CARD_HEIGHT);
  doc.line(
    originX + 10,
    originY + CARD_CELL_HEIGHT,
    originX + 10 + 45,
    originY + CARD_CELL_HEIGHT,
  );
  doc.setFontSize(14);
  const lineHeightMm = (doc.getLineHeight() * 25.4) / 72;

  drawStackedText(
    doc,
    cx,
    originY + CARD_CELL_HEIGHT / 2,
    card.germanTextBold,
    card.germanText,
    lineHeightMm,
  );
  drawStackedText(
    doc,
    cx,
    originY + CARD_CELL_HEIGHT / 2 + CARD_CELL_HEIGHT,
    card.englishTextBold,
    card.englishText,
    lineHeightMm,
  );

  // ---- bottom row (icons) ----
  const dietCount = card.diets.length;
  const allergenCount = card.allergens.length;
  doc.setFontSize(6);
  const iconBaseY = originY + CARD_CELL_HEIGHT + 33;

  // diet icons
  for (let j = 0; j < dietCount; j++) {
    if (card.diets[j]) {
      const img = new Image();
      img.src =
        "data:image/png;base64," + hImages[diets[card.diets[j]].toLowerCase()];
      doc.addImage(
        img,
        "png",
        cx - (dietCount * MAX_ICON_SIZE) / 2 + MAX_ICON_SIZE * j,
        iconBaseY + 5,
        MAX_ICON_SIZE,
        MAX_ICON_SIZE,
      );
    }
  }

  // allergen icons + labels: positions computed once, then drawn in two
  // passes (all icons, then all labels) to match the original draw order.
  const allergenMargin = dietCount ? 18 : 5;
  const maxIcons = 5;
  const iconSize = MAX_ICON_SIZE;
  const rows = Math.ceil(allergenCount / maxIcons);
  const allergenSlots = [];
  let idx = 0;
  for (let row = 0; row < rows; row++) {
    const icons = row === 0 ? allergenCount - (rows - 1) * maxIcons : maxIcons;
    for (let j = 0; j < icons; j++) {
      if (card.allergens[idx]) {
        allergenSlots.push({
          key: card.allergens[idx],
          x: cx - (icons * iconSize) / 2 + iconSize * j,
          y: iconBaseY + allergenMargin + iconSize * row,
        });
        idx++;
      }
    }
  }

  for (const slot of allergenSlots) {
    const img = new Image();
    img.src = "data:image/png;base64," + hImages[allergens[slot.key].toLowerCase()];
    doc.addImage(img, "png", slot.x, slot.y, iconSize, iconSize);
  }
  for (const slot of allergenSlots) {
    doc.text(allergens[slot.key], slot.x + iconSize / 2, slot.y + iconSize, TEXT_OPTS);
  }
}

export function generateLabelsPdf(cards, diets, allergens, hImages) {
  const doc = new jsPDF({ compress: true });
  const d = new Date();

  let xMultiplier = 0;
  let yMultiplier = 0;

  for (let i = 0; i < cards.length; i++) {
    drawCard(
      doc,
      cards[i],
      X + CARD_WIDTH * xMultiplier,
      Y + CARD_HEIGHT * yMultiplier,
      diets,
      allergens,
      hImages,
    );

    xMultiplier++;
    if (xMultiplier >= 3 && yMultiplier === 1 && i < cards.length - 1) {
      doc.addPage();
      xMultiplier = 0;
      yMultiplier = 0;
    }
    if (xMultiplier >= 3) {
      yMultiplier = 1;
      xMultiplier = 0;
    }
    doc.text("Copyright © 2025 RVJK", 10, doc.internal.pageSize.height - 10);
  }

  doc.save(
    `LM_${d.getDay()}${d.getMonth()}${d.getFullYear()}_${d.getHours()}${d.getMinutes()}.pdf`,
  );
}
