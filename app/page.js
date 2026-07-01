"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTests, deleteTest, exportAllTests, importAllTests } from "../lib/storage";
import "./theme.css";

export default function Dashboard() {
  const [tests, setTests] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTests(getTests());
    setMounted(true);
  }, []);

  function handleDelete(id) {
    if (!confirm("Delete this test? This can't be undone.")) return;
    deleteTest(id);
    setTests(getTests());
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAllTests(reader.result);
        setTests(getTests());
        alert("Backup imported.");
      } catch (err) {
        alert("Couldn't read that file: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="shell">
      <header className="shell-header">
        <div className="shell-brand">
          <div className="brand-mark">✓</div>
          <div>
            <div className="topbar-title">IELTS Pro</div>
            <div className="topbar-sub">Your private test library</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost" onClick={exportAllTests}>Export backup</button>
          <label className="btn btn-ghost" style={{ cursor: "pointer" }}>
            Import backup
            <input type="file" accept="application/json" onChange={handleImport} hidden />
          </label>
          <Link href="/add" className="btn btn-primary">+ Add test</Link>
        </div>
      </header>

      <div className="shell-body">
        <div className="page-title">Your tests</div>
        <div className="page-sub">
          Paste in HTML from an existing test and it'll be reformatted into this design,
          ready to solve. Saved locally in this browser — use "Export backup" any time to
          keep a copy of your data.
        </div>

        {mounted && tests.length === 0 && (
          <div className="empty-state card">
            No tests yet. Click <b>+ Add test</b> to convert your first one.
          </div>
        )}

        <div className="test-grid">
          {tests.map((t) => (
            <div key={t.id} className="test-card">
              <Link href={`/test/${t.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="test-card-title">{t.title}</div>
                <div className="test-card-meta">
                  {t.passages?.length || 0} passage(s) · {t.questions?.length || 0} question(s)
                </div>
              </Link>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <Link href={`/edit/${t.id}`} className="btn btn-ghost" style={{ padding: "6px 14px", fontSize: 12 }}>
                  Edit
                </Link>
                <button
                  className="btn btn-ghost"
                  style={{ padding: "6px 14px", fontSize: 12, color: "var(--bad)" }}
                  onClick={() => handleDelete(t.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
