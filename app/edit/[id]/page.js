"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTest, saveTest } from "../../../lib/storage";
import "../../theme.css";

export default function EditTest() {
  const { id } = useParams();
  const router = useRouter();
  const [test, setTest] = useState(null);

  useEffect(() => {
    setTest(getTest(id));
  }, [id]);

  if (!test) return <div className="shell"><div className="shell-body">Loading…</div></div>;

  function updateAnswer(n, val) {
    setTest((t) => ({ ...t, answers: { ...t.answers, [n]: val } }));
  }

  function updateQuestionText(n, val) {
    setTest((t) => ({
      ...t,
      questions: t.questions.map((q) => (q.n === n ? { ...q, text: val } : q)),
    }));
  }

  function handleSave() {
    saveTest(test);
    router.push(`/test/${test.id}`);
  }

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-brand">
          <div className="brand-mark">✓</div>
          <div className="topbar-title">Edit: {test.title}</div>
        </div>
        <a href="/" className="btn btn-ghost">← Back to library</a>
      </header>

      <div className="shell-body">
        <div className="page-title">Review &amp; set answer key</div>
        <div className="page-sub">
          The converter pulls out passages and question text automatically, but correct answers
          aren't always in the source — set them here so scoring works.
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            Test title
          </label>
          <input
            className="input"
            value={test.title}
            onChange={(e) => setTest((t) => ({ ...t, title: e.target.value }))}
          />
        </div>

        {test.questions.length === 0 && (
          <div className="card empty-state">
            No questions were detected automatically. You can still open the test to read the
            passage — question-editing support for this format is a good next thing to add.
          </div>
        )}

        {test.questions.map((q) => (
          <div className="card" key={q.n} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span className="q-num">{q.n}</span>
              <div style={{ flex: 1 }}>
                <input
                  className="input"
                  value={q.text}
                  onChange={(e) => updateQuestionText(q.n, e.target.value)}
                  style={{ marginBottom: 10 }}
                />
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 600 }}>
                    Correct answer:
                  </span>
                  {q.type === "tfng" ? (
                    q.options.map((opt) => (
                      <button
                        key={opt}
                        className={test.answers[q.n] === opt ? "tfng-btn selected" : "tfng-btn"}
                        onClick={() => updateAnswer(q.n, opt)}
                        type="button"
                      >
                        {opt}
                      </button>
                    ))
                  ) : (
                    <input
                      className="input"
                      style={{ width: 220 }}
                      value={test.answers[q.n] || ""}
                      onChange={(e) => updateAnswer(q.n, e.target.value)}
                      placeholder="Type the correct answer"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <button className="btn btn-primary" onClick={handleSave} style={{ marginTop: 8 }}>
          Save &amp; open test
        </button>
      </div>
    </div>
  );
}
