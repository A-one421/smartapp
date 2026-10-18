import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Timer, ArrowRight, ChevronRight, Gem } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useExam } from "../context/ExamContext";
import { GreenBar } from "../components/Layout";
import { SubjectIcon } from "../lib/subjectIcons";
import { loadCombo } from "../lib/combo";
import { buildPaper } from "../lib/questions";
import { recordInterest } from "../lib/interest";
import { usePrice } from "../lib/price";
import {
  TRACKS,
  FREE_PER_SUBJECT,
  ENGLISH_DEFAULT,
  OTHER_DEFAULT,
  naira,
} from "../config";

const TONES = ["emerald", "amber", "sky", "violet"];

// Bottom sheet: pick Year or Topic for one subject, then start studying.
function StudySheet({ subject, filters, onClose }) {
  const nav = useNavigate();
  const { hasFullAccess } = useAuth();
  const { setSetup, setPaper, setMode, setEndAt, setResult } = useExam();
  const [kind, setKind] = useState("year");
  const [value, setValue] = useState("");
  const [count, setCount] = useState(20);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const list = useMemo(
    () =>
      filters
        .filter(
          (r) =>
            r.subject_id === subject.id &&
            r.kind === (kind === "year" ? "session" : "topic"),
        )
        .sort((a, b) =>
          String(b.value).localeCompare(String(a.value), undefined, {
            numeric: true,
          }),
        ),
    [filters, subject, kind],
  );
  useEffect(() => {
    setValue(list[0]?.value || "");
  }, [list]);

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const setup = {
        type: kind,
        subjects: [
          {
            id: subject.id,
            name: subject.name,
            icon: subject.icon,
            filter: value,
            count: hasFullAccess ? Number(count) : FREE_PER_SUBJECT,
          },
        ],
      };
      const paper = await buildPaper(setup);
      if (!paper.length) {
        setError(
          hasFullAccess
            ? "No questions found for this choice yet."
            : "No free questions for this choice. Unlock full access to practise everything.",
        );
        return;
      }
      setSetup(setup);
      setPaper(paper);
      setMode("study");
      setEndAt(null);
      setResult(null);
      nav("/exam");
    } catch (e) {
      setError(e.message || "Could not load questions. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sheet-bg" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 4px", fontSize: 20 }}>
          Study {subject.name}
        </h3>
        <p className="sub" style={{ margin: "0 0 14px" }}>
          Choose how you want to study.
        </p>

        <div className="seg" style={{ marginTop: 0 }}>
          <button
            className={kind === "year" ? "on" : ""}
            onClick={() => setKind("year")}
          >
            <b>By Year</b>
            <span>Past question sessions</span>
          </button>
          <button
            className={kind === "topic" ? "on" : ""}
            onClick={() => setKind("topic")}
          >
            <b>By Topic</b>
            <span>One topic at a time</span>
          </button>
        </div>

        <label className="sheet-label" htmlFor="studyvalue">
          {kind === "year" ? "Pick a year" : "Pick a topic"}
        </label>
        {list.length === 0 ? (
          <div className="notice">
            {kind === "year"
              ? "No years available yet for this subject."
              : "No topics available yet for this subject."}
          </div>
        ) : (
          <select
            id="studyvalue"
            className="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          >
            {list.map((r) => (
              <option key={r.value} value={r.value}>
                {r.value}
              </option>
            ))}
          </select>
        )}

        <label className="sheet-label" htmlFor="studycount">
          Number of questions
        </label>
        {hasFullAccess ? (
          <select
            id="studycount"
            className="input"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          >
            {[10, 20, 40, 60].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        ) : (
          <div className="notice" style={{ marginBottom: 12 }}>
            Free trial: {FREE_PER_SUBJECT} questions per session.
          </div>
        )}

        {error && (
          <div className="err" role="alert">
            {error}
          </div>
        )}
        <button className="btn" onClick={start} disabled={busy || !value}>
          {busy ? "Loading…" : "Start studying"}
        </button>
        {!hasFullAccess && (
          <button
            className="link"
            style={{ width: "100%", marginTop: 8 }}
            onClick={() => nav("/activate")}
          >
            Unlock full access for every question
          </button>
        )}
      </div>
    </div>
  );
}

export default function JambDashboard() {
  const nav = useNavigate();
  const { hasFullAccess, user } = useAuth();
  const price = usePrice();
  const combo = useMemo(() => loadCombo("jamb"), []);
  const [tab, setTab] = useState("study");
  const [subjects, setSubjects] = useState([]);
  const [filters, setFilters] = useState([]);
  const [active, setActive] = useState(null);

  // First visit: no saved subjects yet, so go set them up.
  useEffect(() => {
    if (!combo) nav("/jamb/setup", { replace: true });
  }, [combo, nav]);
  // Let the admin see which exam this student is preparing for.
  useEffect(() => {
    if (user) recordInterest(user.id, "jamb");
  }, [user]);

  useEffect(() => {
    (async () => {
      const [s, f] = await Promise.all([
        supabase.from("subjects").select("*").order("sort_order"),
        supabase.rpc("available_filters"),
      ]);
      setSubjects(s.data || []);
      setFilters(f.data || []);
    })();
  }, []);

  if (!combo) return null;
  const track = TRACKS.find((t) => t.id === combo.track);
  const english = subjects.find((s) => s.is_compulsory);
  const mine = [
    english,
    ...combo.subjects.map((n) => subjects.find((s) => s.name === n)),
  ].filter(Boolean);

  return (
    <>
      <GreenBar
        title={`JAMB — ${track?.label || ""}`}
        subtitle="UTME Practice"
        backTo="/"
      />
      <main className="page has-nav">
        <div className="mode-toggle" role="tablist" aria-label="Practice mode">
          <button
            role="tab"
            aria-selected={tab === "study"}
            className={tab === "study" ? "on" : ""}
            onClick={() => setTab("study")}
          >
            <BookOpen size={20} /> Study Mode
          </button>
          <button
            role="tab"
            aria-selected={tab === "exam"}
            className={tab === "exam" ? "on" : ""}
            onClick={() => setTab("exam")}
          >
            <Timer size={20} /> Exam Mode
          </button>
        </div>

        <div className="sub-head">
          <h3>Your subjects</h3>
          <button className="link" onClick={() => nav("/jamb/setup")}>
            Change
          </button>
        </div>
        <div className="combo">
          {mine.map((s) => (
            <span key={s.id} className="pick plain">
              {s.name}
            </span>
          ))}
        </div>

        {tab === "study" ? (
          <>
            <h3 className="dash-title">Pick a subject to study</h3>
            {!hasFullAccess && (
              <p className="hint" style={{ marginTop: -6 }}>
                Free trial: {FREE_PER_SUBJECT} questions per session
              </p>
            )}
            {mine.map((s, i) => (
              <button
                key={s.id}
                className={`ex-card ${TONES[i % TONES.length]}`}
                style={{ marginBottom: 12 }}
                onClick={() => setActive(s)}
              >
                <span className="hm-ic">
                  <SubjectIcon name={s.icon} size={24} />
                </span>
                <span className="ex-text">
                  <b>{s.name}</b>
                  <span>Study by year or topic</span>
                </span>
                <ChevronRight size={22} />
              </button>
            ))}
          </>
        ) : (
          <>
            <h3 className="dash-title">Full CBT exam</h3>
            <div className="card">
              <p style={{ margin: "0 0 6px" }}>
                {hasFullAccess ? (
                  <>
                    All 4 subjects together: <b>{ENGLISH_DEFAULT}</b> English
                    questions and <b>{OTHER_DEFAULT}</b> for each of the others,
                    timed like the real JAMB CBT.
                  </>
                ) : (
                  <>
                    All 4 subjects together, timed like the real JAMB CBT. Free
                    trial gives <b>{FREE_PER_SUBJECT}</b> questions per subject.
                  </>
                )}
              </p>
              <p className="hint" style={{ margin: "0 0 14px" }}>
                Answers and score are shown when you finish.
              </p>
              <button className="btn" onClick={() => nav("/exam-setup")}>
                <Timer size={18} /> Continue to exam setup{" "}
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {!hasFullAccess && (
          <button className="unlock" onClick={() => nav("/activate")}>
            <Gem size={20} /> Unlock full access, {naira(price)} one-time
          </button>
        )}
      </main>

      {active && (
        <StudySheet
          subject={active}
          filters={filters}
          onClose={() => setActive(null)}
        />
      )}
    </>
  );
}
