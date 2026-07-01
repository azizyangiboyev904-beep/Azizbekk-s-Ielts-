"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTest } from "../../lib/storage";
import { parseTestHtml, parseTestFromPlainText } from "../../lib/parseTest";
import "../theme.css";

export default function AddTest() {
  const [title, setTitle] = useState("");
  const [raw, setRaw] = useState("");
  const [mode, setMode] = useState("html"); // 'html' | 'text'
  const router = useRouter();

  function handleConvert() {
    if (!raw.trim()) return alert("Paste some content first.");
    const test =
      mode === "html"
        ? parseTestHtml(raw, title)
        : parseTestFromPlainText(raw, title);

    if (test.passages.length === 0) {
      return alert("Couldn't find any readable passage text in that content.");
    }
    saveTest(test);
    router.push(`/edit/${test.id}`);
  }

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-brand">
          <div className="brand-mark">✓</div>
          <div className="topbar-title">Add a test</div>
        </div>
        <a href="/" className="btn btn-ghost">← Back to library</a>
      </header>

      <div className="shell-body">
        <div className="page-title">Convert into your design</div>
        <div className="page-sub">
          Paste the full HTML source of a test (View Source → copy) for the most accurate
          conversion, or paste plain text (e.g. copied out of a PDF) for a simple passage import.
        </div>

        <div className="card">
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            Test title
          </label>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Day 27 – Reading Test"
            style={{ marginBottom: 18 }}
          />

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button
              className={mode === "html" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setMode("html")}
            >
              Paste HTML
            </button>
            <button
              className={mode === "text" ? "btn btn-primary" : "btn btn-ghost"}
              onClick={() => setMode("text")}
            >
              Paste plain text (PDF)
            </button>
          </div>

          <textarea
            className="input"
            rows={14}
            style={{ fontFamily: "monospace", fontSize: 12.5 }}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={
              mode === "html"
                ? "<html>... paste the full source of your test file here ..."
                : "Paste the passage text you copied from a PDF here. Separate paragraphs with a blank line."
            }
          />

          <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={handleConvert}>
            Convert &amp; Save
          </button>
        </div>

        <div className="card" style={{ marginTop: 20, fontSize: 13, color: "var(--text-secondary)" }}>
          <b style={{ color: "var(--text)" }}>About PDF support:</b> real scanned-PDF-to-text
          extraction needs a PDF-reading library or an AI call, both of which are extra setup
          (and an AI call has a small ongoing cost from your own API key). For now, open your PDF,
          select and copy the text, and paste it in "plain text" mode above — that part is
          completely free and works for any text-based PDF.
        </div>
      </div>
    </div>
  );
}
