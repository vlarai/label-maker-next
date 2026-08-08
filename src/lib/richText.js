// Shared "**bold**" markdown-style rich-text parsing for dish name/
// description fields. A field's raw string may contain explicit \n line
// breaks (typed as Enter in the editor) and **bold** spans; everything
// else is plain text.

const BOLD_RE = /\*\*(.+?)\*\*/g;

function parseBoldRuns(line) {
  const runs = [];
  let lastIndex = 0;
  for (const match of line.matchAll(BOLD_RE)) {
    if (match.index > lastIndex) {
      runs.push({ text: line.slice(lastIndex, match.index), bold: false });
    }
    runs.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) {
    runs.push({ text: line.slice(lastIndex), bold: false });
  }
  return runs;
}

// Splits `text` into lines (on \n), each an ordered array of { text, bold }
// runs. An empty string yields a single empty line.
export function parseBoldLines(text) {
  return (text || "").split("\n").map(parseBoldRuns);
}
