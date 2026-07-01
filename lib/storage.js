// All tests are saved in the browser's localStorage under one key.
// This is free (no database), private to your browser, and persists
// across visits as long as you use the same browser/device.
const KEY = "ielts_pro_tests_v1";

export function getTests() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveTest(test) {
  const tests = getTests();
  const idx = tests.findIndex((t) => t.id === test.id);
  if (idx >= 0) tests[idx] = test;
  else tests.unshift(test);
  localStorage.setItem(KEY, JSON.stringify(tests));
  return test;
}

export function getTest(id) {
  return getTests().find((t) => t.id === id) || null;
}

export function deleteTest(id) {
  const tests = getTests().filter((t) => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(tests));
}

export function exportAllTests() {
  const blob = new Blob([JSON.stringify(getTests(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "ielts-pro-tests-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllTests(jsonText) {
  const incoming = JSON.parse(jsonText);
  if (!Array.isArray(incoming)) throw new Error("Invalid backup file");
  const existing = getTests();
  const merged = [...incoming, ...existing.filter((e) => !incoming.some((i) => i.id === e.id))];
  localStorage.setItem(KEY, JSON.stringify(merged));
  return merged;
}
