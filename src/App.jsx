import React, { useState, useMemo } from "react";
import {
  LayoutDashboard, ClipboardCheck, ClipboardList, Sun,
  Check, X, Camera, Wrench, Flag, ChevronDown, Send, AlertTriangle,
  Droplets, Pencil, Plus, Trash2,
} from "lucide-react";

// ============================================================
// THEME — pulled directly from struvae.com's live CSS variables.
// Single interactive accent (capture blue), same as the rest of
// the suite, so this reads as unmistakably Struvae.
// ============================================================
const INK = "#17181B";
const INK_SOFT = "#565B60";
const MUTED = "#90959A";
const PAPER = "#F9FAF9";
const PAPER_RAISED = "#FFFFFF";
const LINE = "rgba(23,24,27,0.08)";
const LINE_STRONG = "rgba(23,24,27,0.17)";

const CAPTURE = "#2E9BC7";
const CAPTURE_SOFT = "rgba(46,155,199,0.09)";
const CAPTURE_LINE = "rgba(46,155,199,0.35)";
const REPORT = "#3F9E6D";
const ESTIMATE = "#C68A2E";
const DANGER = "#B24A3D";

const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'IBM Plex Sans', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// ---- date helpers ----
function startOfDay(d) { const c = new Date(d); c.setHours(0, 0, 0, 0); return c; }
function toKey(d) { return startOfDay(d).toISOString().slice(0, 10); }
function addDays(d, n) { const c = new Date(d); c.setDate(c.getDate() + n); return c; }
function mondayOf(d) {
  const c = startOfDay(d);
  const day = c.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(c, diff);
}
function fmtShort(d) { return `${d.getMonth() + 1}/${d.getDate()}`; }
function formatDayRange(days) {
  if (!days || days.length === 0) return "Not scheduled this week";
  const sorted = [...days].sort((a, b) => a - b);
  const min = sorted[0], max = sorted[sorted.length - 1];
  const contiguous = sorted.length === max - min + 1;
  if (contiguous) return min === max ? WEEKDAY_LABELS[min] : `${WEEKDAY_LABELS[min]}–${WEEKDAY_LABELS[max]}`;
  return sorted.map((d) => WEEKDAY_LABELS[d]).join(", ");
}

const WEEK_START = mondayOf(new Date());
const WEEK_DAYS = [0, 1, 2, 3, 4].map((i) => addDays(WEEK_START, i));
const TODAY_KEY = toKey(new Date());

const ARRIVAL_META = {
  onTime: { label: "On time", color: REPORT },
  late: { label: "Running late", color: ESTIMATE },
};

// ============================================================
// MOCK DATA — stands in for jobs pulled from Struvae Capture/
// Project once those are wired together. scheduledDays controls
// which weekday columns a job shows up in (0 = Mon … 4 = Fri).
// ============================================================
function initialJobs() {
  return [
    {
      id: "j1", name: "5128 Riverside Dr",
      crew: ["Marcus T.", "Priya R."],
      scope: "Cat 1 water loss in the rec room. Drywall tear-out to 2ft, insulation removed, subfloor drying with 4 air movers and a low-grain dehum. Bathroom moisture readings logged daily. Target dry standard by Friday.",
      scheduledDays: [0, 1, 2, 3, 4],
    },
    {
      id: "j2", name: "220 Oak Hollow Ct",
      crew: ["Diego M."],
      scope: "Baseboard and trim removal complete, stud wall cleaned and treated. Equipment holding for another 24–48 hours pending final moisture check before close-out.",
      scheduledDays: [0, 1, 2],
    },
    {
      id: "j3", name: "88 Birchwood Ave",
      crew: ["Marcus T.", "Sam K."],
      scope: "Cat 3 loss — utility room tear-out complete. Storage room access was delayed by the homeowner; tear-out there resumes once access is confirmed Tuesday.",
      scheduledDays: [1, 2, 3, 4],
    },
  ];
}

function seedCheckins() {
  return [
    { id: `j1-${TODAY_KEY}-Marcus T.`, jobId: "j1", date: TODAY_KEY, crewMember: "Marcus T.", arrival: "onTime", tasksToday: "Set 4 air movers, pulled wet drywall to 2ft in the rec room.", photosLogged: true, equipmentInstalled: true, jobComplete: false, note: "" },
    { id: `j1-${TODAY_KEY}-Priya R.`, jobId: "j1", date: TODAY_KEY, crewMember: "Priya R.", arrival: "late", tasksToday: "Logged moisture readings in the bathroom, dehum running.", photosLogged: true, equipmentInstalled: true, jobComplete: false, note: "Traffic on the bridge — 20 min behind." },
    { id: `j2-${TODAY_KEY}-Diego M.`, jobId: "j2", date: TODAY_KEY, crewMember: "Diego M.", arrival: "onTime", tasksToday: "Final moisture check came back dry. Equipment pulled.", photosLogged: true, equipmentInstalled: false, jobComplete: true, note: "" },
  ];
}

// ============================================================
// SMALL UI PRIMITIVES
// ============================================================
function Toggle({ value, onChange, label }) {
  return (
    <button onClick={() => onChange(!value)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
      <span style={{ width: 34, height: 20, borderRadius: 10, background: value ? CAPTURE : LINE_STRONG, position: "relative", flexShrink: 0, transition: "background 140ms ease" }}>
        <span style={{ position: "absolute", top: 2, left: value ? 16 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 140ms ease" }} />
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 500, color: INK }}>{label}</span>
    </button>
  );
}

function Checkbox({ value, onChange, label }) {
  return (
    <button onClick={() => onChange(!value)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
      <span style={{ width: 20, height: 20, borderRadius: 5, border: `1.5px solid ${value ? CAPTURE : LINE_STRONG}`, background: value ? CAPTURE : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {value && <Check size={13} color="#fff" strokeWidth={3} />}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 500, color: INK }}>{label}</span>
    </button>
  );
}

function FieldBlock({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function FieldSelect({ options, value, onChange }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle({ appearance: "none", paddingRight: 30 })}>
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} color={MUTED} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );
}

function inputStyle(extra = {}) {
  return {
    width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${LINE_STRONG}`,
    background: "#fff", fontSize: 13.5, color: INK, fontFamily: FONT_BODY, ...extra,
  };
}

// ============================================================
// MAIN
// ============================================================
export default function StruvaeDaily() {
  const [view, setView] = useState("dashboard");
  // Role will come from real login once accounts exist: a PM's own session
  // sets "pm", a tech's name+PIN sign-in sets "tech". Defaulting to "pm"
  // here since there's no auth wired up yet — nothing else in this file
  // needs to change when that's added, it all already reads from `isPm`.
  const role = "pm";
  const isPm = role === "pm";

  const [jobs, setJobs] = useState(initialJobs);
  const [checkins, setCheckins] = useState(seedCheckins);

  const jobById = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs]);

  // ---- job editing (PM only) ----
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [crewDraft, setCrewDraft] = useState({});
  const [dayMenuOpenFor, setDayMenuOpenFor] = useState(null);

  const updateJob = (id, patch) => setJobs((js) => js.map((j) => (j.id === id ? { ...j, ...patch } : j)));

  const addJob = () => {
    const id = `job-${Date.now()}`;
    const draft = { id, name: "New job", crew: ["Unassigned"], scope: "", scheduledDays: [0, 1, 2, 3, 4] };
    setJobs((js) => [...js, draft]);
    setEditingId(id);
    setView("scope");
  };

  const removeJob = (id) => {
    setJobs((js) => js.filter((j) => j.id !== id));
    setConfirmDeleteId(null);
    if (editingId === id) setEditingId(null);
  };

  const addCrew = (jobId) => {
    const val = (crewDraft[jobId] || "").trim();
    if (!val) return;
    const job = jobById[jobId];
    if (job.crew.includes(val)) { setCrewDraft((d) => ({ ...d, [jobId]: "" })); return; }
    updateJob(jobId, { crew: [...job.crew, val] });
    setCrewDraft((d) => ({ ...d, [jobId]: "" }));
  };
  const removeCrew = (jobId, name) => {
    const job = jobById[jobId];
    if (job.crew.length <= 1) return; // always keep at least one
    updateJob(jobId, { crew: job.crew.filter((c) => c !== name) });
  };
  const toggleScheduledDay = (jobId, dayIdx) => {
    const job = jobById[jobId];
    const has = job.scheduledDays.includes(dayIdx);
    updateJob(jobId, { scheduledDays: has ? job.scheduledDays.filter((d) => d !== dayIdx) : [...job.scheduledDays, dayIdx].sort() });
  };

  // ---- check-in form ----
  const [formJobId, setFormJobId] = useState(jobs[0].id);
  const [formCrew, setFormCrew] = useState(jobs[0].crew[0]);
  const [formArrival, setFormArrival] = useState("onTime");
  const [formTasks, setFormTasks] = useState("");
  const [formPhotos, setFormPhotos] = useState(false);
  const [formEquip, setFormEquip] = useState(true);
  const [formComplete, setFormComplete] = useState(false);
  const [formNote, setFormNote] = useState("");
  const [formError, setFormError] = useState("");
  const [submitted, setSubmitted] = useState(null);

  const submitCheckin = () => {
    if (!formTasks.trim()) { setFormError("Add a quick note on what got done today."); return; }
    setFormError("");
    const entry = {
      id: `${formJobId}-${TODAY_KEY}-${formCrew}`,
      jobId: formJobId, date: TODAY_KEY, crewMember: formCrew,
      arrival: formArrival, tasksToday: formTasks.trim(),
      photosLogged: formPhotos, equipmentInstalled: formEquip, jobComplete: formComplete,
      note: formNote.trim(),
    };
    setCheckins((cs) => [...cs.filter((c) => c.id !== entry.id), entry]);
    setSubmitted(entry);
    setFormTasks(""); setFormPhotos(false); setFormEquip(true); setFormComplete(false); setFormNote(""); setFormArrival("onTime");
  };

  const checkinsFor = (jobId, dateKey) => checkins.filter((c) => c.jobId === jobId && c.date === dateKey);
  const totalToday = checkins.filter((c) => c.date === TODAY_KEY).length;

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: FONT_BODY, color: INK, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid ${CAPTURE}; outline-offset: 2px; }
        input, select, textarea { font-family: 'IBM Plex Sans', sans-serif; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      {/* subtle brand wash, same treatment as struvae.com's own background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 40% at 12% -6%, rgba(46,155,199,.05), transparent 60%)",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

      {/* ---------- nav ---------- */}
      <div style={{ borderBottom: `1px solid ${LINE}`, background: PAPER_RAISED }}>
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
            <img src="/struvae-mark.png" alt="Struvae" style={{ width: 32, height: 32, borderRadius: 7, display: "block", flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 16.5, lineHeight: 1 }}>Struvae Daily</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10.5, letterSpacing: 1, color: CAPTURE, marginTop: 4, textTransform: "uppercase" }}>Day-to-day schedule</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 4, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 10, padding: 4 }}>
            {[
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "checkin", label: "Check In", icon: ClipboardCheck },
              { id: "scope", label: "Scope", icon: ClipboardList },
            ].map((t) => {
              const active = view === t.id;
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setView(t.id)}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 7, border: "none", background: active ? CAPTURE : "transparent", color: active ? "#fff" : INK_SOFT, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 140ms ease, color 140ms ease" }}>
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "26px 22px 64px" }}>

        {/* ================= DASHBOARD ================= */}
        {view === "dashboard" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontFamily: FONT_HEAD, fontSize: 24, fontWeight: 600, marginBottom: 4 }}>This week</h1>
              <div style={{ fontSize: 13.5, color: INK_SOFT }}>
                {fmtShort(WEEK_DAYS[0])} – {fmtShort(WEEK_DAYS[4])} · {jobs.length} active jobs · {totalToday} check-in{totalToday === 1 ? "" : "s"} in today
                {isPm && <span style={{ color: MUTED }}> · click + on any day to add or remove a job</span>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {WEEK_DAYS.map((day, di) => {
                const key = toKey(day);
                const isToday = key === TODAY_KEY;
                const isPast = day < startOfDay(new Date());
                const scheduledJobs = jobs.filter((j) => j.scheduledDays.includes(di));
                const unscheduledJobs = jobs.filter((j) => !j.scheduledDays.includes(di));
                return (
                  <div key={di} style={{ background: PAPER_RAISED, border: `1px solid ${isToday ? CAPTURE : LINE}`, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "10px 12px", background: isToday ? CAPTURE_SOFT : PAPER, borderBottom: `1px solid ${LINE}`, textAlign: "center", position: "relative" }}>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: isToday ? CAPTURE : INK_SOFT, letterSpacing: 0.5 }}>{WEEKDAY_LABELS[di]}</div>
                      <div style={{ fontSize: 10.5, color: MUTED, marginTop: 1 }}>{fmtShort(day)}</div>
                    </div>
                    <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 6, minHeight: 160 }}>
                      {scheduledJobs.length === 0 && (
                        <div style={{ fontSize: 11, color: MUTED, textAlign: "center", padding: "16px 4px" }}>No jobs scheduled</div>
                      )}
                      {scheduledJobs.map((job) => {
                        const entries = checkinsFor(job.id, key);
                        if (entries.length === 0) {
                          return (
                            <div key={job.id} style={{ padding: "8px 9px", borderRadius: 7, border: `1px dashed ${LINE_STRONG}`, position: "relative" }}>
                              {isPm && (
                                <button onClick={() => toggleScheduledDay(job.id, di)} title="Remove from this day"
                                  style={{ position: "absolute", top: 4, right: 4, background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                                  <X size={11} color={MUTED} />
                                </button>
                              )}
                              <div style={{ fontSize: 11.5, fontWeight: 600, color: INK_SOFT, marginBottom: 2, paddingRight: 14 }}>{job.name}</div>
                              <div style={{ fontSize: 10.5, color: isPast ? DANGER : MUTED, fontFamily: FONT_MONO }}>
                                {isPast ? "No check-in" : isToday ? "Not checked in yet" : "Scheduled"}
                              </div>
                            </div>
                          );
                        }
                        return entries.map((entry) => {
                          const meta = ARRIVAL_META[entry.arrival];
                          return (
                            <div key={entry.id} style={{ padding: "8px 9px", borderRadius: 7, border: `1px solid ${LINE}`, background: PAPER, position: "relative" }}>
                              {isPm && (
                                <button onClick={() => toggleScheduledDay(job.id, di)} title="Remove from this day"
                                  style={{ position: "absolute", top: 4, right: 4, background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
                                  <X size={11} color={MUTED} />
                                </button>
                              )}
                              <div style={{ fontSize: 11.5, fontWeight: 600, color: INK, marginBottom: 2, paddingRight: 14 }}>{job.name}</div>
                              <div style={{ fontSize: 10.5, color: MUTED, marginBottom: 5 }}>{entry.crewMember}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: meta.color, flexShrink: 0 }} />
                                <span style={{ fontSize: 10.5, fontWeight: 600, color: meta.color, fontFamily: FONT_MONO }}>{meta.label}</span>
                              </div>
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <Camera size={12} color={entry.photosLogged ? CAPTURE : LINE_STRONG} />
                                <Wrench size={12} color={entry.equipmentInstalled ? CAPTURE : LINE_STRONG} />
                                {entry.jobComplete && (
                                  <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9.5, fontWeight: 700, color: REPORT, fontFamily: FONT_MONO, marginLeft: "auto" }}>
                                    <Flag size={11} /> DONE
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })}

                      {isPm && (
                        <div style={{ marginTop: 2 }}>
                          {dayMenuOpenFor === di ? (
                            <div style={{ border: `1px solid ${CAPTURE_LINE}`, background: CAPTURE_SOFT, borderRadius: 7, padding: 6 }}>
                              {unscheduledJobs.length === 0 ? (
                                <div style={{ fontSize: 10.5, color: MUTED, padding: 4 }}>All jobs already on this day.</div>
                              ) : unscheduledJobs.map((job) => (
                                <button key={job.id} onClick={() => { toggleScheduledDay(job.id, di); }}
                                  style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 6px", borderRadius: 5, border: "none", background: "transparent", color: INK, fontSize: 11, cursor: "pointer" }}>
                                  {job.name}
                                </button>
                              ))}
                              <button onClick={() => setDayMenuOpenFor(null)} style={{ width: "100%", marginTop: 4, padding: "5px", borderRadius: 5, border: "none", background: "#fff", color: INK_SOFT, fontSize: 10.5, fontWeight: 600, cursor: "pointer" }}>
                                Close
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setDayMenuOpenFor(di)}
                              style={{ width: "100%", padding: "7px", borderRadius: 7, border: `1px dashed ${LINE_STRONG}`, background: "transparent", color: MUTED, fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                              <Plus size={12} /> Add job
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 18, marginTop: 16, fontSize: 11.5, color: MUTED, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: REPORT, display: "inline-block" }} /> On time</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: ESTIMATE, display: "inline-block" }} /> Running late</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Camera size={12} color={CAPTURE} /> Photos logged</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Wrench size={12} color={CAPTURE} /> Equipment installed</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Flag size={11} color={REPORT} /> Job complete</span>
            </div>
          </div>
        )}

        {/* ================= CHECK-IN ================= */}
        {view === "checkin" && (
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <h1 style={{ fontFamily: FONT_HEAD, fontSize: 24, fontWeight: 600, marginBottom: 4, textAlign: "center" }}>Today's check-in</h1>
            <div style={{ fontSize: 13.5, color: INK_SOFT, marginBottom: 20, textAlign: "center" }}>Your PM sees it on the dashboard the second you submit.</div>

            {submitted && (
              <div style={{ border: `1px solid ${REPORT}`, background: "rgba(63,158,109,0.07)", borderRadius: 10, padding: 14, marginBottom: 18, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Check size={16} color={REPORT} style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ fontSize: 13, color: INK_SOFT }}>
                  <strong style={{ color: INK }}>Check-in submitted</strong> for {jobById[submitted.jobId].name} — {submitted.crewMember}. It's live on the dashboard now.
                </div>
              </div>
            )}

            <div style={{ background: PAPER_RAISED, border: `1px solid ${LINE}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Job</div>
                  <FieldSelect value={formJobId} onChange={(v) => { setFormJobId(v); setFormCrew(jobById[v].crew[0]); }}
                    options={jobs.map((j) => ({ id: j.id, label: j.name }))} />
                </div>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Crew member</div>
                  <FieldSelect value={formCrew} onChange={setFormCrew}
                    options={jobById[formJobId].crew.map((c) => ({ id: c, label: c }))} />
                </div>
              </div>

              <FieldBlock label="Arrival">
                <div style={{ display: "flex", gap: 8 }}>
                  {Object.entries(ARRIVAL_META).map(([id, m]) => {
                    const active = formArrival === id;
                    return (
                      <button key={id} onClick={() => setFormArrival(id)}
                        style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: `1.5px solid ${active ? m.color : LINE_STRONG}`, background: active ? m.color : "#fff", color: active ? "#fff" : INK, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </FieldBlock>

              <FieldBlock label="What did you work on today?">
                <textarea value={formTasks} onChange={(e) => setFormTasks(e.target.value)} rows={3}
                  placeholder="Tear-out complete in rec room, air movers running."
                  style={inputStyle({ resize: "none", borderColor: formError ? DANGER : LINE_STRONG })} />
              </FieldBlock>

              <FieldBlock label="Checklist">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Checkbox value={formPhotos} onChange={setFormPhotos} label="Photos logged" />
                  <Toggle value={formEquip} onChange={setFormEquip} label="Equipment installed" />
                  <Toggle value={formComplete} onChange={setFormComplete} label="Job complete" />
                </div>
              </FieldBlock>

              <FieldBlock label="Anything else for the PM (optional)">
                <textarea value={formNote} onChange={(e) => setFormNote(e.target.value)} rows={2}
                  placeholder="Waiting on homeowner access, running behind, anything to flag."
                  style={inputStyle({ resize: "none" })} />
              </FieldBlock>

              {formError && (
                <div style={{ fontSize: 12.5, color: DANGER, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={13} /> {formError}
                </div>
              )}

              <button onClick={submitCheckin}
                style={{ width: "100%", padding: "13px", borderRadius: 8, border: "none", background: CAPTURE, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Send size={14} /> Submit check-in
              </button>
            </div>
          </div>
        )}

        {/* ================= SCOPE ================= */}
        {view === "scope" && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h1 style={{ fontFamily: FONT_HEAD, fontSize: 24, fontWeight: 600, marginBottom: 4 }}>This week's scope</h1>
              <div style={{ fontSize: 13.5, color: INK_SOFT }}>What techs are walking into on each job, before they get there.</div>
              {isPm && (
                <button onClick={addJob}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 8, border: "none", background: INK, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 14 }}>
                  <Plus size={14} /> Add job
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {jobs.map((job) => {
                const editing = isPm && editingId === job.id;
                return (
                  <div key={job.id} style={{ background: PAPER_RAISED, border: `1px solid ${editing ? CAPTURE : LINE}`, borderRadius: 12, padding: 18 }}>

                    {!editing ? (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                          <div>
                            <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 15.5 }}>{job.name}</div>
                            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{job.crew.join(", ")}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: CAPTURE, background: CAPTURE_SOFT, border: `1px solid ${CAPTURE_LINE}`, padding: "4px 9px", borderRadius: 100 }}>
                              <Droplets size={11} /> {formatDayRange(job.scheduledDays)}
                            </span>
                            {isPm && (
                              <button onClick={() => setEditingId(job.id)} title="Edit job"
                                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 7, border: `1px solid ${LINE_STRONG}`, background: "#fff", color: INK_SOFT, fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                                <Pencil size={11} /> Edit
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: INK_SOFT }}>
                          {job.scope || <span style={{ color: MUTED, fontStyle: "italic" }}>No scope written yet.</span>}
                        </div>
                      </>
                    ) : (
                      <div>
                        <FieldBlock label="Job name">
                          <input type="text" value={job.name} onChange={(e) => updateJob(job.id, { name: e.target.value })} style={inputStyle()} />
                        </FieldBlock>

                        <FieldBlock label="Crew">
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                            {job.crew.map((name) => (
                              <span key={name} style={{ display: "flex", alignItems: "center", gap: 6, background: CAPTURE_SOFT, border: `1px solid ${CAPTURE_LINE}`, color: INK, fontSize: 12, padding: "5px 6px 5px 10px", borderRadius: 100 }}>
                                {name}
                                {job.crew.length > 1 && (
                                  <button onClick={() => removeCrew(job.id, name)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 2 }}>
                                    <X size={11} color={INK_SOFT} />
                                  </button>
                                )}
                              </span>
                            ))}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input type="text" value={crewDraft[job.id] || ""} onChange={(e) => setCrewDraft((d) => ({ ...d, [job.id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCrew(job.id); } }}
                              placeholder="Tech name" style={inputStyle({ flex: 1 })} />
                            <button onClick={() => addCrew(job.id)} style={{ padding: "0 14px", borderRadius: 8, border: `1px solid ${LINE_STRONG}`, background: "#fff", color: INK, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                              <Plus size={13} /> Add
                            </button>
                          </div>
                        </FieldBlock>

                        <FieldBlock label="Scope of work">
                          <textarea value={job.scope} onChange={(e) => updateJob(job.id, { scope: e.target.value })} rows={4}
                            placeholder="What's this job, what's been done, what's left, and anything the crew should know before they arrive."
                            style={inputStyle({ resize: "none" })} />
                        </FieldBlock>

                        <FieldBlock label="Scheduled days">
                          <div style={{ display: "flex", gap: 6 }}>
                            {WEEKDAY_LABELS.map((label, idx) => {
                              const active = job.scheduledDays.includes(idx);
                              return (
                                <button key={idx} onClick={() => toggleScheduledDay(job.id, idx)}
                                  style={{ flex: 1, padding: "9px 4px", borderRadius: 7, border: `1.5px solid ${active ? CAPTURE : LINE_STRONG}`, background: active ? CAPTURE : "#fff", color: active ? "#fff" : INK_SOFT, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </FieldBlock>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                          {confirmDeleteId === job.id ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 12.5, color: DANGER, fontWeight: 600 }}>Remove this job?</span>
                              <button onClick={() => removeJob(job.id)} style={{ padding: "6px 12px", borderRadius: 7, border: "none", background: DANGER, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Yes, remove</button>
                              <button onClick={() => setConfirmDeleteId(null)} style={{ padding: "6px 12px", borderRadius: 7, border: `1px solid ${LINE_STRONG}`, background: "#fff", color: INK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDeleteId(job.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 7, border: `1px solid ${LINE_STRONG}`, background: "#fff", color: DANGER, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                              <Trash2 size={12} /> Remove job
                            </button>
                          )}
                          <button onClick={() => setEditingId(null)}
                            style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: INK, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                            Done editing
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <footer style={{ borderTop: `1px solid ${LINE}`, padding: "24px 22px", marginTop: 8 }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12.5, color: MUTED }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img src="/struvae-mark.png" alt="Struvae" style={{ width: 20, height: 20, borderRadius: 5, display: "block" }} />
            <span style={{ fontSize: 13, color: INK_SOFT, fontWeight: 500 }}>Struvae Daily</span>
          </div>
          <div>Part of the Struvae suite — the operating system for restoration contractors.</div>
          <div>© 2026 Struvae</div>
        </div>
      </footer>

      </div>
    </div>
  );
}