"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTest } from "../../../lib/storage";
import "../../theme.css";

export default function TestPage() {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600);

  useEffect(() => {
    setTest(getTest(id));
  }, [id]);

  useEffect(() => {
    if (checked) return;
    const iv = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(iv);
  }, [checked]);

  if (!test) return <div className="shell"><div className="shell-body">Loading…</div></div>;

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");

  function pick(n, val) {
    if (checked) return;
    setUserAnswers((a) => ({ ...a, [n]: val }));
  }

  function norm(s) {
    return String(s || "").trim().toUpperCase().replace(/\s+/g, " ");
  }

  function submit() {
    setChecked(true);
  }

  const answeredCount = Object.keys(userAnswers).length;
  const total = test.questions.length;
  const correctCount = test.questions.filter(
    (q) => norm(userAnswers[q.n]) === norm(test.answers[q.n])
  ).length;

  return (
    <div className="app" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand-mark">✓</div>
          <div>
            <div className="topbar-title">{test.title}</div>
            <div className="topbar-sub">Reading Test</div>
          </div>
        </div>
        <div className="topbar-center">
          <div className={"timer-box" + (timeLeft <= 300 ? " danger" : timeLeft <= 600 ? " warn" : "")}>
            {mm}:{ss}
          </div>
        </div>
        <div className="topbar-right">
          <a href="/" className="btn btn-ghost" style={{ padding: "8px 14px", fontSize: 12.5 }}>
            ← Library
          </a>
        </div>
      </header>

      <main className="layout" style={{ flex: 1, display: "flex", gap: 14, padding: 14, minHeight: 0 }}>
        <div className="passage-panel" style={{ width: "50%", overflowY: "auto" }}>
          {test.passages.map((p, i) => (
            <div key={i} style={{ marginBottom: 30 }}>
              <span className="passage-tag">Reading Passage {i + 1}</span>
              <h2>{p.title}</h2>
              {p.paragraphs.map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="q-panel" style={{ flex: 1, overflowY: "auto" }}>
          <div className="q-panel-header">
            <div>
              <div className="qp-label">{test.title}</div>
              <div className="qp-title">Questions 1–{total}</div>
            </div>
          </div>

          {test.questions.map((q) => (
            <div className="q-block" key={q.n}>
              {q.type === "tfng" && (
                <div className="tfng-row">
                  <span className="q-num answered-check">
                    <span className={"q-num" + (userAnswers[q.n] ? " answered" : "")}>{q.n}</span>
                  </span>
                  <div className="tfng-q">
                    {q.text}
                    <div className="tfng-opts">
                      {q.options.map((opt) => {
                        let cls = "tfng-btn";
                        if (userAnswers[q.n] === opt) cls += " selected";
                        if (checked && opt === test.answers[q.n]) cls += " ok";
                        else if (checked && userAnswers[q.n] === opt) cls += " bad";
                        return (
                          <button key={opt} className={cls} onClick={() => pick(q.n, opt)}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {q.type === "mcq" && (
                <div className="mcq-row">
                  <span className={"q-num" + (userAnswers[q.n] ? " answered" : "")}>{q.n}</span>
                  <div className="mcq-q">
                    {q.text}
                    <div className="mcq-opts">
                      {q.options.map((opt, k) => (
                        <label className="mcq-opt" key={k}>
                          <input
                            type="radio"
                            name={"q" + q.n}
                            checked={userAnswers[q.n] === opt}
                            onChange={() => pick(q.n, opt)}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {q.type === "fill" && (
                <div className="fill-row">
                  <span className={"q-num" + (userAnswers[q.n] ? " answered" : "")}>{q.n}</span>
                  <input
                    className={
                      "fill" +
                      (checked
                        ? norm(userAnswers[q.n]) === norm(test.answers[q.n])
                          ? " ok"
                          : " bad"
                        : "")
                    }
                    value={userAnswers[q.n] || ""}
                    onChange={(e) => pick(q.n, e.target.value)}
                    disabled={checked}
                  />
                  {checked && norm(userAnswers[q.n]) !== norm(test.answers[q.n]) && (
                    <span style={{ fontSize: 12.5, color: "var(--ok)" }}>
                      → {test.answers[q.n] || "(no answer set)"}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <footer className="navbar">
        <div className="navbar-row1">
          <span className="answered-cnt">{answeredCount} / {total} answered</span>
          <div className="nav-spacer" />
          {checked ? (
            <span style={{ fontWeight: 700, color: "var(--accent-dark)" }}>
              Score: {correctCount} / {total}
            </span>
          ) : (
            <button className="submit-btn" onClick={submit}>Submit &amp; Check</button>
          )}
        </div>
      </footer>
    </div>
  );
}
