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

  // ── Matching / drag-drop rows (e.g. "which section contains...") ──
  // These were previously silently dropped, which is why question counts
  // shrank (e.g. 40 -> 25). We convert each drop-zone into an mcq-style
  // question, reusing the options pool shared by its match-container.
  doc.querySelectorAll(".match-container").forEach((container) => {
    const pool = Array.from(container.querySelectorAll(".options-pool .draggable-chip"))
      .map((c) => (c.dataset.val || c.textContent).trim())
      .filter(Boolean);
    container.querySelectorAll(".match-slot-row").forEach((row) => {
      const num = row.querySelector(".drop-zone")?.dataset?.q || row.querySelector(".q-num")?.textContent?.trim();
      const clone = row.cloneNode(true);
      clone.querySelector(".q-num")?.remove();
      clone.querySelector(".drop-zone")?.remove();
      const text = clone.textContent.replace(/\s+/g, " ").trim();
      if (num && text) {
        questions.push({ n: Number(num), type: "mcq", text, options: pool.length ? pool : undefined });
      }
    });
  });

  // ── Summary / word-box gaps (drag a word into a blank inside a paragraph) ──
  doc.querySelectorAll(".word-box").forEach((box) => {
    const pool = Array.from(box.querySelectorAll(".wb-chip"))
      .map((c) => (c.textContent || "").trim())
      .filter(Boolean);
    const blockEl = box.closest(".q-block") || box.parentElement;
    const summaryPara = blockEl?.querySelector(".summary-text");
    if (!summaryPara) return;

    const slots = Array.from(summaryPara.querySelectorAll(".sum-drop"));
    slots.forEach((slot) => {
      const num = slot.dataset.q || slot.textContent.trim();
      const before = [];
      const after = [];
      let node = slot.previousSibling;
      while (node && before.join(" ").length < 90) {
        before.unshift((node.textContent || "").trim());
        node = node.previousSibling;
      }
      node = slot.nextSibling;
      while (node && !(node.nodeType === 1 && node.classList?.contains("sum-drop")) && after.join(" ").length < 90) {
        after.push((node.textContent || "").trim());
        node = node.nextSibling;
      }
      const text = `${before.join(" ")} ___ ${after.join(" ")}`.replace(/\s+/g, " ").trim();
      if (num) {
        questions.push({ n: Number(num), type: "mcq", text, options: pool.length ? pool : undefined });
      }
    });
  });

  // De-duplicate by question number (keep first occurrence) and sort
  // ascending, so the final list always matches the source numbering.
  const seen = new Set();
  const dedupedQuestions = questions
    .filter((q) => {
      if (seen.has(q.n)) return false;
      seen.add(q.n);
      return true;
    })
    .sort((a, b) => a.n - b.n);

  return {
    id: "test_" + Date.now(),
    title: title || doc.querySelector("title")?.textContent || "Untitled Test",
    createdAt: new Date().toISOString(),
    passages,
    questions: dedupedQuestions,
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
