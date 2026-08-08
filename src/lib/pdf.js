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

export function generateLabelsPdf(cards, diets, allergens, hImages) {
  const doc = new jsPDF({ compress: true });
  const d = new Date();

  let xMultiplier = 0;
  let yMultiplier = 0;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    doc.rect(
      X + CARD_WIDTH * xMultiplier,
      Y + CARD_HEIGHT * yMultiplier,
      CARD_WIDTH,
      CARD_HEIGHT,
    );
    doc.line(
      X + CARD_WIDTH * xMultiplier + 10,
      Y + CARD_HEIGHT * yMultiplier + CARD_CELL_HEIGHT,
      X + CARD_WIDTH * xMultiplier + 10 + 45,
      Y + CARD_HEIGHT * yMultiplier + CARD_CELL_HEIGHT,
    );
    doc.setFontSize(14);

    // ---- German block (top row) ----
    let linesGermanBold = 0;
    if (card.germanTextBold) {
      const dim = doc.getTextDimensions(card.germanTextBold);
      linesGermanBold =
        dim.w / MAX_TEXT_WIDTH > 1 ? Math.ceil(dim.w / MAX_TEXT_WIDTH) : 1;
    }
    let linesGerman = 0;
    const dimensionGerman = doc.getTextDimensions(card.germanText);
    if (dimensionGerman.w / MAX_TEXT_WIDTH > 1) {
      linesGerman = Math.ceil(dimensionGerman.w / MAX_TEXT_WIDTH);
    }

    if (card.germanTextBold) {
      doc.setFont(undefined, "bold");
      doc.text(
        card.germanTextBold,
        X + CARD_WIDTH / 2 + CARD_WIDTH * xMultiplier,
        Y +
          CARD_HEIGHT * yMultiplier +
          CARD_CELL_HEIGHT / 2 +
          (doc.getLineHeight() * 25.4) / 72 / 2 -
          (doc.getLineHeight() * (linesGermanBold + linesGerman) * 25.4) /
            72 /
            2 +
          (doc.getLineHeight() * linesGermanBold * 25.4) / 72 / 2,
        TEXT_OPTS,
      );
      doc.setFont(undefined, "normal");
    }
    doc.text(
      card.germanText,
      X + CARD_WIDTH / 2 + CARD_WIDTH * xMultiplier,
      Y +
        CARD_HEIGHT * yMultiplier +
        CARD_CELL_HEIGHT / 2 +
        (doc.getLineHeight() * 25.4) / 72 / 2 -
        (doc.getLineHeight() * (linesGermanBold + linesGerman) * 25.4) /
          72 /
          2 +
        (doc.getLineHeight() * linesGermanBold * 25.4) / 72 / 2 +
        (doc.getLineHeight() * linesGermanBold * 25.4) / 72,
      TEXT_OPTS,
    );

    // ---- English block (second row) ----
    let linesEnglishBold = 0;
    if (card.englishTextBold) {
      const dim = doc.getTextDimensions(card.englishTextBold);
      linesEnglishBold =
        dim.w / MAX_TEXT_WIDTH > 1 ? Math.ceil(dim.w / MAX_TEXT_WIDTH) : 1;
    }
    let linesEnglish = 0;
    const dimEnglish = doc.getTextDimensions(card.englishText);
    if (dimEnglish.w / MAX_TEXT_WIDTH > 1) {
      linesEnglish = Math.ceil(dimEnglish.w / MAX_TEXT_WIDTH);
    }

    if (card.englishTextBold) {
      doc.setFont(undefined, "bold");
      doc.text(
        card.englishTextBold,
        X + CARD_WIDTH / 2 + CARD_WIDTH * xMultiplier,
        Y +
          CARD_HEIGHT * yMultiplier +
          CARD_CELL_HEIGHT / 2 +
          CARD_CELL_HEIGHT +
          (doc.getLineHeight() * 25.4) / 72 / 2 -
          (doc.getLineHeight() * (linesEnglishBold + linesEnglish) * 25.4) /
            72 /
            2 +
          (doc.getLineHeight() * linesEnglishBold * 25.4) / 72 / 2,
        TEXT_OPTS,
      );
      doc.setFont(undefined, "normal");
    }
    doc.text(
      card.englishText,
      X + CARD_WIDTH / 2 + CARD_WIDTH * xMultiplier,
      Y +
        CARD_HEIGHT * yMultiplier +
        CARD_CELL_HEIGHT / 2 +
        CARD_CELL_HEIGHT +
        (doc.getLineHeight() * 25.4) / 72 / 2 -
        (doc.getLineHeight() * (linesEnglishBold + linesEnglish) * 25.4) /
          72 /
          2 +
        (doc.getLineHeight() * linesEnglishBold * 25.4) / 72 +
        (doc.getLineHeight() * linesEnglishBold * 25.4) / 72 / 2,
      TEXT_OPTS,
    );

    // ---- bottom row (icons) ----
    const dietCount = card.diets.length;
    const allergenCount = card.allergens.length;
    doc.setFontSize(6);

    // diet icons
    for (let j = 0; j <= dietCount; j++) {
      if (card.diets[j]) {
        const img = new Image();
        img.src =
          "data:image/png;base64," + hImages[diets[card.diets[j]].toLowerCase()];
        doc.addImage(
          img,
          "png",
          X +
            CARD_WIDTH / 2 +
            CARD_WIDTH * xMultiplier -
            (dietCount * MAX_ICON_SIZE) / 2 +
            MAX_ICON_SIZE * j,
          Y +
            CARD_HEIGHT * yMultiplier +
            CARD_CELL_HEIGHT / 2 +
            33 +
            (CARD_CELL_HEIGHT / 2 + 5),
          MAX_ICON_SIZE,
          MAX_ICON_SIZE,
        );
      }
    }

    // allergen icons
    let allergenMargin = 5;
    if (dietCount) allergenMargin = 18;
    const maxIcons = 5;
    const iconSize = MAX_ICON_SIZE;
    let rows = Math.ceil(allergenCount / maxIcons);
    let idx = 0;
    for (let row = 0; row < rows; row++) {
      const icons = row === 0 ? allergenCount - (rows - 1) * maxIcons : maxIcons;
      for (let j = 0; j < icons; j++) {
        if (card.allergens[idx]) {
          const img = new Image();
          img.src =
            "data:image/png;base64," +
            hImages[allergens[card.allergens[idx]].toLowerCase()];
          doc.addImage(
            img,
            "png",
            X +
              CARD_WIDTH / 2 +
              CARD_WIDTH * xMultiplier -
              (icons * iconSize) / 2 +
              iconSize * j,
            Y +
              CARD_HEIGHT * yMultiplier +
              CARD_CELL_HEIGHT / 2 +
              33 +
              (CARD_CELL_HEIGHT / 2 + allergenMargin) +
              iconSize * row,
            iconSize,
            iconSize,
          );
          idx++;
        }
      }
    }

    // second pass: allergen letter labels beneath icons
    idx = 0;
    for (let row = 0; row < rows; row++) {
      const icons = row === 0 ? allergenCount - (rows - 1) * maxIcons : maxIcons;
      for (let j = 0; j < icons; j++) {
        if (card.allergens[idx]) {
          doc.text(
            allergens[card.allergens[idx]],
            X +
              CARD_WIDTH / 2 +
              CARD_WIDTH * xMultiplier -
              (icons * iconSize) / 2 +
              iconSize * j +
              iconSize / 2,
            Y +
              CARD_HEIGHT * yMultiplier +
              CARD_CELL_HEIGHT / 2 +
              33 +
              (CARD_CELL_HEIGHT / 2 + allergenMargin) +
              iconSize * row +
              iconSize,
            TEXT_OPTS,
          );
          idx++;
        }
      }
    }

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
