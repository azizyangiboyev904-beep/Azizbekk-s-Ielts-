// Parses a pasted IELTS-reading-style HTML document (passage panels + question
// blocks with TRUE/FALSE/NOT GIVEN, multiple choice, or fill-in-the-blank
// inputs) into the structured JSON our renderer understands.
// This runs entirely in the browser — no API key, no cost.

export function parseTestHtml(rawHtml, title) {
  const doc = new DOMParser().parseFromString(rawHtml, "text/html");

  // ── Passages: look for common containers used across exported tests ──
  const passageNodes = doc.querySelectorAll(
    '[id^="ptext"], .passage-panel > div, .passage, article'
  );
  const passages = [];
  passageNodes.forEach((node, i) => {
    const heading = node.querySelector("h2, h1")?.textContent?.trim() || `Passage ${i + 1}`;
    const paras = Array.from(node.querySelectorAll("p"))
      .map((p) => p.textContent.trim())
      .filter(Boolean);
    if (paras.length) passages.push({ title: heading, paragraphs: paras });
  });

  // Fallback: if nothing matched the known containers, just grab all <p> tags
  if (passages.length === 0) {
    const paras = Array.from(doc.querySelectorAll("p"))
      .map((p) => p.textContent.trim())
      .filter(Boolean);
    if (paras.length) passages.push({ title: title || "Reading Passage", paragraphs: paras });
  }

  // ── Questions: TRUE/FALSE/NOT GIVEN rows, MCQ rows, fill-in rows ──
  const questions = [];

  doc.querySelectorAll(".tfng-row").forEach((row) => {
    const num = row.querySelector(".q-num")?.textContent?.trim();
    const text = row.querySelector(".tfng-q")?.textContent?.replace(/^\d+\s*/, "").trim();
    if (num && text) questions.push({ n: Number(num), type: "tfng", text, options: ["TRUE", "FALSE", "NOT GIVEN"] });
  });

  doc.querySelectorAll(".mcq-row").forEach((row) => {
    const num = row.querySelector(".q-num")?.textContent?.trim();
    const text = row.querySelector(".mcq-q")?.childNodes[0]?.textContent?.trim();
    const opts = Array.from(row.querySelectorAll(".mcq-opt")).map((o) => o.textContent.trim());
    if (num && text) questions.push({ n: Number(num), type: "mcq", text, options: opts });
  });

  doc.querySelectorAll(".fill-row").forEach((row) => {
    const input = row.querySelector("input.fill");
    const num = input?.dataset?.q || row.querySelector(".q-num")?.textContent?.trim();
    const text = row.textContent.replace(/\s+/g, " ").trim();
    if (num) questions.push({ n: Number(num), type: "fill", text });
  });

  return {
    id: "test_" + Date.now(),
    title: title || doc.querySelector("title")?.textContent || "Untitled Test",
    createdAt: new Date().toISOString(),
    passages,
    questions,
    // Answer key is left blank — you fill it in on the Edit screen,
    // since raw source HTML doesn't always expose correct answers.
    answers: {},
  };
}

export function parseTestFromPlainText(text, title) {
  // Very simple fallback for plain extracted PDF text: treat the whole
  // thing as one passage, split into paragraphs on blank lines.
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return {
    id: "test_" + Date.now(),
    title: title || "Untitled Test",
    createdAt: new Date().toISOString(),
    passages: [{ title: title || "Reading Passage", paragraphs }],
    questions: [],
    answers: {},
  };
}
