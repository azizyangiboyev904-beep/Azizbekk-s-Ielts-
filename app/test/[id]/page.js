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
    <div className="shell">
      {/* Top Header Bar */}
      <header className="shell-header">
        <div className="shell-brand">
          <div className="brand-mark">✓</div>
          <div className="topbar-title">{test.title}</div>
        </div>
        <a href="/" className="btn btn-ghost">← Back to library</a>
      </header>

      {/* Main Structural Layout Split Container */}
      <main className="test-container-layout">
        
        {/* Left Column: Reading Passage (Fixes Merged Text & Scrolls Independently) */}
        <div className="passage-panel">
          <div className="passage-text-container">
            {test.passages && test.passages.map((passage, pIdx) => (
              <div key={pIdx} className="passage-section" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '22px', marginBottom: '1.5rem', fontWeight: '700' }}>
                  {passage.title || `Passage ${pIdx + 1}`}
                </h2>
                
                {/* Dynamic Paragraph Splitter */}
                {passage.text && passage.text.split(/\n\s*\n/).map((para, index) => {
                  if (!para.trim()) return null;
                  return (
                    <p key={index} className="passage-paragraph">
                      {para.trim()}
                    </p>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Questions Panel (Stops elements from disappearing) */}
        <div className="q-panel">
          <div className="questions-scroll-container">
            {test.questions.length === 0 && (
              <div className="card empty-state">No questions detected.</div>
            )}

            {/* Your exact question card loop wrapper */}
            {test.questions.map((q) => (
              <div className="card" key={q.n} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span className="q-num">{q.n}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: 10, fontSize: '15px' }}>{q.text}</div>
                    
                    <input 
                      className="input" 
                      placeholder="Type your answer here..."
                      value={test.answers?.[q.n] || ''} 
                      onChange={(e) => updateAnswer(q.n, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
