import React, { useState, useEffect, useMemo } from "react";
import {
  Home, Calendar, Users, Clock, ChevronLeft, ChevronRight, ChevronDown,
  X, Check, AlertTriangle, Send, Play, Square, FileText, ClipboardCheck,
  CheckCircle2, LayoutGrid, Edit3, User,
  Lock, LogOut, Delete, Plus, Trash2,
} from "lucide-react";

/* ============================================================
   THEME — Struvae brand tokens, identical to struvae.com.
   ============================================================ */
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
const REPORT_SOFT = "rgba(63,158,109,0.10)";
const ESTIMATE = "#C68A2E";
const ESTIMATE_SOFT = "rgba(198,138,46,0.10)";
const OPS = "#8467C9";
const OPS_SOFT = "rgba(132,103,201,0.10)";
const DANGER = "#C23B2E";
const DANGER_SOFT = "rgba(194,59,46,0.08)";

const FONT_HEAD = "'Space Grotesk', sans-serif";
const FONT_BODY = "'IBM Plex Sans', sans-serif";
const FONT_MONO = "'IBM Plex Mono', monospace";

const JOB_STATUS_META = {
  scheduled: { label: "Scheduled", color: MUTED, bg: "rgba(144,149,154,0.12)" },
  complete:  { label: "Complete",  color: REPORT, bg: REPORT_SOFT },
};
const ARRIVAL_META = {
  onTime: { label: "On time", color: REPORT },
  late: { label: "Running late", color: ESTIMATE },
};

/* ============================================================
   DATE HELPERS
   ============================================================ */
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
function fmtLong(d) { return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); }
const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEKDAY_LABELS_FULL = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TODAY = new Date();
const TODAY_KEY = toKey(TODAY);
const WEEK_START = mondayOf(TODAY);
const WEEK_DAYS = [0, 1, 2, 3, 4].map((i) => addDays(WEEK_START, i));
const WEEK_DAYS_FULL = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(WEEK_START, i));

function initials(name) { return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase(); }
function fmtHrs(n) { return `${(n || 0).toFixed(2).replace(/\.?0+$/, "").replace(/\.$/, "") || "0"}`; }
function fmtHrsClean(n) { const v = n || 0; return Number.isInteger(v) ? `${v}` : v.toFixed(2).replace(/0$/, ""); }

/* ============================================================
   MOCK DATA
   ============================================================ */
const TECHS_SEED = [
  { id: "t1", name: "Marcus Thompson", short: "Marcus T.", role: "Lead Technician", color: CAPTURE, pin: "1234" },
  { id: "t2", name: "Priya Raman", short: "Priya R.", role: "Technician", color: REPORT, pin: "2345" },
  { id: "t3", name: "Diego Martinez", short: "Diego M.", role: "Technician", color: ESTIMATE, pin: "3456" },
  { id: "t4", name: "Sam Kowalski", short: "Sam K.", role: "Technician", color: OPS, pin: "4567" },
];
const AVATAR_COLORS = [CAPTURE, REPORT, ESTIMATE, OPS];

const JOBS_SEED = [
  {
    id: "j1", name: "Nguyen Residence", address: "5128 Riverside Dr", customer: "David & Karen Nguyen",
    lossType: "Water Mitigation", category: "Category 1", claimNumber: "CLM-48213",
    insurer: "Aviva", dateOfLoss: "Aug 18, 2026", phase: "Mitigation",
    accessIssue: false, equipmentPickupRequired: false,
    scope: "Continue rec room drywall tear-out to 2ft, reposition air movers for even airflow, log moisture readings in bathroom and rec room, photograph exposed framing before insulation removal.",
    notes: "Homeowner works from home — knock before entering, dog on site (friendly).",
    equipment: { airMovers: 4, dehumidifiers: 1 },
    status: "scheduled",
  },
  {
    id: "j2", name: "Ferreira Residence", address: "220 Oak Hollow Ct", customer: "Marisol Ferreira",
    lossType: "Equipment Monitoring", category: "Category 1", claimNumber: "CLM-48190",
    insurer: "Intact", dateOfLoss: "Aug 15, 2026", phase: "Mitigation",
    accessIssue: false, equipmentPickupRequired: true,
    scope: "Take final moisture readings across affected areas. If dry standard is met, pull equipment and photograph final condition for close-out.",
    notes: "Equipment likely ready for pickup — confirm before pulling.",
    equipment: { airMovers: 2, dehumidifiers: 1 },
    status: "scheduled",
  },
  {
    id: "j3", name: "Whitfield Residence", address: "88 Birchwood Ave", customer: "Alan Whitfield",
    lossType: "Category 3 Mitigation", category: "Category 3", claimNumber: "CLM-48260",
    insurer: "Aviva", dateOfLoss: "Aug 21, 2026", phase: "Emergency",
    accessIssue: true, equipmentPickupRequired: false,
    scope: "Confirm homeowner access to storage room before starting tear-out. Bag and remove contaminated flooring, apply antimicrobial treatment to affected framing.",
    notes: "Homeowner delayed access to storage room — confirm before crew arrives.",
    equipment: { airMovers: 3, dehumidifiers: 0 },
    status: "scheduled",
  },
  {
    id: "j4", name: "Okafor Residence", address: "14 Maple Ridge Crescent", customer: "The Okafor Family",
    lossType: "Rebuild", category: "N/A", claimNumber: "CLM-47990",
    insurer: "Intact", dateOfLoss: "Aug 2, 2026", phase: "Repair",
    accessIssue: false, equipmentPickupRequired: false,
    scope: "Frame new partition wall per approved plans. Rough-in electrical for new outlets before drywall crew arrives Thursday.",
    notes: "Trade coordination — drywall crew scheduled once framing signed off.",
    equipment: { airMovers: 0, dehumidifiers: 0 },
    status: "scheduled",
  },
];

function buildAssignments() {
  const d = (n) => toKey(addDays(TODAY, n));
  return [
    { id: "a1", jobId: "j1", techId: "t1", date: d(0), start: "8:00 AM", end: "12:00 PM", startMin: 480, endMin: 720 },
    { id: "a2", jobId: "j1", techId: "t2", date: d(0), start: "8:00 AM", end: "11:30 AM", startMin: 480, endMin: 690 },
    { id: "a3", jobId: "j3", techId: "t3", date: d(0), start: "9:00 AM", end: "1:00 PM", startMin: 540, endMin: 780 },
    { id: "a4", jobId: "j2", techId: "t4", date: d(0), start: "1:00 PM", end: "3:00 PM", startMin: 780, endMin: 900 },
    { id: "a5", jobId: "j2", techId: "t1", date: d(1), start: "8:00 AM", end: "10:00 AM", startMin: 480, endMin: 600 },
    { id: "a6", jobId: "j4", techId: "t3", date: d(1), start: "8:00 AM", end: "1:00 PM", startMin: 480, endMin: 780 },
    { id: "a7", jobId: "j1", techId: "t2", date: d(2), start: "8:00 AM", end: "11:00 AM", startMin: 480, endMin: 660 },
    { id: "a8", jobId: "j3", techId: "t4", date: d(2), start: "9:00 AM", end: "2:00 PM", startMin: 540, endMin: 840 },
    { id: "a9", jobId: "j4", techId: "t1", date: d(-1), start: "8:00 AM", end: "12:00 PM", startMin: 480, endMin: 720 },
    { id: "a10", jobId: "j2", techId: "t3", date: d(-1), start: "1:00 PM", end: "4:00 PM", startMin: 780, endMin: 960 },
  ];
}
const ASSIGNMENTS = buildAssignments();

// Formats an assignment's date key back into a readable day label.
function fmtAssignmentDay(dateKey) {
  const [y, m, dd] = dateKey.split("-").map(Number);
  const d = new Date(y, m - 1, dd);
  const isToday = dateKey === TODAY_KEY;
  return `${isToday ? "Today, " : ""}${d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`;
}

// Timesheets: plain editable hours per real date, Mon–Sun of the current
// week. Seeded with a few realistic weekday numbers so it's not empty on
// first load; today (whatever day that actually is) starts blank so the
// clock-in/out flow has somewhere real to write to.
function seedTimesheets() {
  const seedHours = {
    t1: [8, 8.5, 7.5, 8, 0, 0, 0],
    t2: [8, 7.5, 4, 9, 6.5, 0, 0],
    t3: [5, 8, 0, 3, 0, 0, 0],
    t4: [5, 2, 8, 4, 5, 0, 0],
  };
  const out = {};
  TECHS_SEED.forEach((t) => {
    const hours = {};
    WEEK_DAYS_FULL.forEach((d, i) => {
      const key = toKey(d);
      hours[key] = key === TODAY_KEY ? 0 : (seedHours[t.id][i] || 0);
    });
    out[t.id] = { hours, status: "notSubmitted", clockedInAt: null };
  });
  return out;
}
function weekTotal(hours) { return WEEK_DAYS_FULL.reduce((s, d) => s + (hours[toKey(d)] || 0), 0); }

/* ============================================================
   SMALL UI PRIMITIVES
   ============================================================ */
function Avatar({ tech, size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: tech.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, fontFamily: FONT_HEAD, flexShrink: 0 }}>
      {initials(tech.name)}
    </div>
  );
}
function CompleteBadge({ status, small }) {
  if (status !== "complete") return null;
  const m = JOB_STATUS_META.complete;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: small ? 10.5 : 11.5, fontWeight: 700, color: m.color, background: m.bg, padding: small ? "3px 7px" : "4px 9px", borderRadius: 100, fontFamily: FONT_MONO, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }} />
      {m.label}
    </span>
  );
}
function SummaryCard({ value, label, color }) {
  return (
    <div style={{ background: PAPER_RAISED, border: `1px solid ${LINE}`, borderRadius: 12, padding: "16px 18px", minWidth: 110, flex: 1 }}>
      <div style={{ fontFamily: FONT_HEAD, fontSize: 26, fontWeight: 600, color: color || INK, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: INK_SOFT, marginTop: 6 }}>{label}</div>
    </div>
  );
}
function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background: PAPER_RAISED, border: `1px solid ${LINE}`, borderRadius: 12, cursor: onClick ? "pointer" : "default", transition: "box-shadow 160ms ease, transform 160ms ease", ...style }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.boxShadow = "0 6px 18px rgba(23,24,27,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={(e) => { if (onClick) { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; } }}
    >
      {children}
    </div>
  );
}
function Toggle({ value, onChange, label }) {
  return (
    <button onClick={() => onChange(!value)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
      <span style={{ width: 34, height: 20, borderRadius: 10, background: value ? CAPTURE : LINE_STRONG, position: "relative", flexShrink: 0, transition: "background 140ms ease" }}>
        <span style={{ position: "absolute", top: 2, left: value ? 16 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 140ms ease" }} />
      </span>
      {label && <span style={{ fontSize: 13.5, fontWeight: 500, color: INK }}>{label}</span>}
    </button>
  );
}
function Checkbox({ value, onChange, label }) {
  return (
    <button onClick={() => onChange(!value)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
      <span style={{ width: 20, height: 20, borderRadius: 5, border: `1.5px solid ${value ? CAPTURE : LINE_STRONG}`, background: value ? CAPTURE : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {value && <Check size={13} color="#fff" strokeWidth={3} />}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 500, color: INK }}>{label}</span>
    </button>
  );
}
function inputStyle(extra = {}) {
  return { width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${LINE_STRONG}`, background: "#fff", fontSize: 13.5, color: INK, fontFamily: FONT_BODY, ...extra };
}
function Drawer({ open, onClose, width = 420, children }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(23,24,27,0.32)", zIndex: 40, opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition: "opacity 220ms ease" }} />
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: `min(${width}px, 100vw)`, background: PAPER_RAISED, zIndex: 41, boxShadow: "-12px 0 40px rgba(23,24,27,0.14)", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 260ms cubic-bezier(.2,.8,.2,1)", overflowY: "auto" }}>
        {children}
      </div>
    </>
  );
}
function DrawerHeader({ title, subtitle, onClose }) {
  return (
    <div style={{ padding: "20px 22px", borderBottom: `1px solid ${LINE}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: PAPER_RAISED, zIndex: 1 }}>
      <div>
        <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 18 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: MUTED, marginTop: 3 }}>{subtitle}</div>}
      </div>
      <button onClick={onClose} style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
        <X size={15} color={INK_SOFT} />
      </button>
    </div>
  );
}
function DrawerRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${LINE}` }}>
      <Icon size={14} color={MUTED} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontSize: 10.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: FONT_MONO }}>{label}</div>
        <div style={{ fontSize: 13.5, color: INK, marginTop: 2 }}>{value}</div>
      </div>
    </div>
  );
}
function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 60, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, background: INK, color: "#fff", padding: "11px 18px", borderRadius: 100, fontSize: 13, fontWeight: 500, boxShadow: "0 10px 30px rgba(23,24,27,0.25)", animation: "toastIn 220ms ease" }}>
          <CheckCircle2 size={15} color={REPORT} /> {t.message}
        </div>
      ))}
    </div>
  );
}
function DateNav({ label, onPrev, onNext, onToday }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button onClick={onPrev} style={navBtnStyle}><ChevronLeft size={15} /></button>
      <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600, color: INK, minWidth: 150, textAlign: "center" }}>{label}</div>
      <button onClick={onNext} style={navBtnStyle}><ChevronRight size={15} /></button>
      <button onClick={onToday} style={{ ...navBtnStyle, width: "auto", padding: "0 12px", fontSize: 12, fontWeight: 600, color: INK_SOFT }}>Today</button>
    </div>
  );
}
const navBtnStyle = { width: 30, height: 30, borderRadius: 7, border: `1px solid ${LINE_STRONG}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };
function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 3, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 9, padding: 3 }}>
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button key={o.id} onClick={() => onChange(o.id)}
            style={{ padding: "7px 15px", borderRadius: 6, border: "none", background: active ? CAPTURE : "transparent", color: active ? "#fff" : INK_SOFT, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            {o.label}
          </button>
        );
      })}
    </div>
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

/* ============================================================
   JOB CARD
   ============================================================ */
function JobCard({ assignment, job, tech, onClick, compact }) {
  const complete = job.status === "complete";
  return (
    <Card onClick={onClick} style={{ padding: 14, borderLeft: `3px solid ${complete ? REPORT : LINE_STRONG}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <div>
          <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 14 }}>{job.name}</div>
          <div style={{ fontSize: 11.5, color: MUTED, marginTop: 1 }}>{job.address} · {job.lossType}</div>
        </div>
        <CompleteBadge status={job.status} small />
      </div>
      <div style={{ fontSize: 11.5, color: INK_SOFT, fontFamily: FONT_MONO, marginBottom: compact ? 0 : 8 }}>{assignment.start} – {assignment.end}</div>
      {!compact && tech && (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar tech={tech} size={24} />
        </div>
      )}
    </Card>
  );
}

/* ============================================================
   JOB DETAIL DRAWER
   ============================================================ */
function JobDrawer({ job, assignment, tech, open, onClose, isPm, onUpdateJob, onMarkComplete, onToast }) {
  if (!job) return null;
  const setEquip = (key, delta) => {
    const next = Math.max(0, (job.equipment[key] || 0) + delta);
    onUpdateJob(job.id, { equipment: { ...job.equipment, [key]: next } });
  };
  return (
    <Drawer open={open} onClose={onClose} width={440}>
      <DrawerHeader title={job.name} subtitle={`${job.address} — ${job.lossType}`} onClose={onClose} />
      <div style={{ padding: "18px 22px" }}>
        {job.status === "complete" && <div style={{ marginBottom: 16 }}><CompleteBadge status={job.status} /></div>}

        <DrawerRow icon={User} label="Customer" value={job.customer} />
        <DrawerRow icon={FileText} label="Claim Number" value={job.claimNumber} />
        <DrawerRow icon={FileText} label="Insurer" value={job.insurer} />
        <DrawerRow icon={Calendar} label="Date of Loss" value={job.dateOfLoss} />
        <DrawerRow icon={LayoutGrid} label="Phase" value={job.phase} />
        {assignment && <DrawerRow icon={Calendar} label="Scheduled" value={`${fmtAssignmentDay(assignment.date)} · ${assignment.start} – ${assignment.end}`} />}
        {tech && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${LINE}` }}>
            <Avatar tech={tech} size={26} />
            <div>
              <div style={{ fontSize: 10.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: FONT_MONO }}>Crew</div>
              <div style={{ fontSize: 13.5, color: INK, marginTop: 1 }}>{tech.name}</div>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Today's Scope</div>
          {isPm ? (
            <textarea value={job.scope} onChange={(e) => onUpdateJob(job.id, { scope: e.target.value })} rows={4}
              placeholder="What the crew is doing today — write it like a quick brief."
              style={inputStyle({ resize: "none" })} />
          ) : (
            <div style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.55, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 8, padding: 12 }}>
              {job.scope || <span style={{ color: MUTED, fontStyle: "italic" }}>No scope written yet.</span>}
            </div>
          )}
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Job Notes</div>
          {isPm ? (
            <textarea value={job.notes} onChange={(e) => onUpdateJob(job.id, { notes: e.target.value })} rows={3}
              placeholder="Access notes, pets on site, anything the crew should know before they arrive."
              style={inputStyle({ resize: "none" })} />
          ) : (
            job.notes && <div style={{ fontSize: 13, color: INK_SOFT, lineHeight: 1.55, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 8, padding: 12 }}>{job.notes}</div>
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Equipment</div>
          <div style={{ display: "flex", gap: 10 }}>
            <EquipmentStepper label="Air Movers" value={job.equipment.airMovers} onDec={() => setEquip("airMovers", -1)} onInc={() => setEquip("airMovers", 1)} editable={isPm} />
            <EquipmentStepper label="Dehumidifiers" value={job.equipment.dehumidifiers} onDec={() => setEquip("dehumidifiers", -1)} onInc={() => setEquip("dehumidifiers", 1)} editable={isPm} />
          </div>
          {!isPm && <div style={{ fontSize: 11, color: MUTED, marginTop: 8 }}>Load these before you leave the shop.</div>}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 26, flexWrap: "wrap" }}>
          {isPm && <DrawerAction icon={Edit3} label="Edit Assignment" onClick={() => onToast("Assignment editing coming soon")} />}
          <DrawerAction icon={CheckCircle2} label="Mark Complete" primary onClick={() => { onMarkComplete(job.id); onToast(`${job.name} marked complete`); }} />
        </div>
      </div>
    </Drawer>
  );
}
function EquipmentStepper({ label, value, onDec, onInc, editable }) {
  return (
    <div style={{ flex: 1, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 10, padding: 12, textAlign: "center" }}>
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>{label}</div>
      {editable ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <button onClick={onDec} style={stepBtnStyle}>−</button>
          <span style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, width: 22, textAlign: "center" }}>{value}</span>
          <button onClick={onInc} style={{ ...stepBtnStyle, background: CAPTURE, color: "#fff", border: "none" }}>+</button>
        </div>
      ) : (
        <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: INK }}>{value}</div>
      )}
    </div>
  );
}
const stepBtnStyle = { width: 26, height: 26, borderRadius: 6, border: `1px solid ${LINE_STRONG}`, background: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 600, color: INK, display: "flex", alignItems: "center", justifyContent: "center" };
function DrawerAction({ icon: Icon, label, onClick, primary }) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 13px", borderRadius: 8, border: primary ? "none" : `1px solid ${LINE_STRONG}`, background: primary ? CAPTURE : "#fff", color: primary ? "#fff" : INK, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
      <Icon size={13} /> {label}
    </button>
  );
}

/* ============================================================
   TECH DRAWER — PM's view of a tech, now with account management
   (name + PIN) since the PM is the one creating tech logins.
   ============================================================ */
function TechDrawer({ tech, open, onClose, assignments, jobsById, onUpdateTech, onRemoveTech, onToast }) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  useEffect(() => { setConfirmRemove(false); }, [tech]);
  if (!tech) return null;
  const todays = assignments.filter((a) => a.techId === tech.id && a.date === TODAY_KEY);

  const regeneratePin = () => {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    onUpdateTech(tech.id, { pin });
    onToast(`New PIN generated for ${tech.name.split(" ")[0]}`);
  };

  return (
    <Drawer open={open} onClose={onClose} width={400}>
      <DrawerHeader title={tech.name} subtitle={tech.role} onClose={onClose} />
      <div style={{ padding: "18px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <Avatar tech={tech} size={48} />
          <div>
            <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 16 }}>{tech.name}</div>
            <div style={{ fontSize: 12.5, color: MUTED }}>{tech.role}</div>
          </div>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Login</div>
        <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 10, padding: 14, marginBottom: 22 }}>
          <FieldBlock label="Name">
            <input type="text" value={tech.name} onChange={(e) => onUpdateTech(tech.id, { name: e.target.value })} style={inputStyle()} />
          </FieldBlock>
          <FieldBlock label="4-digit PIN">
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" inputMode="numeric" maxLength={4} value={tech.pin}
                onChange={(e) => onUpdateTech(tech.id, { pin: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                style={inputStyle({ fontFamily: FONT_MONO, letterSpacing: 3, flex: 1 })} />
              <button onClick={regeneratePin} style={{ padding: "0 12px", borderRadius: 8, border: `1px solid ${LINE_STRONG}`, background: "#fff", fontSize: 12, fontWeight: 600, color: INK_SOFT, cursor: "pointer" }}>Generate</button>
            </div>
          </FieldBlock>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>Give {tech.name.split(" ")[0]} this PIN — they'll sign in with their name and this code, no email or password needed.</div>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Today</div>
        {todays.length === 0 && <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>No assignments today.</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {todays.map((a) => {
            const job = jobsById[a.jobId];
            return (
              <div key={a.id} style={{ padding: 10, borderRadius: 8, border: `1px solid ${LINE}`, background: PAPER }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{job.name}</span>
                  <CompleteBadge status={job.status} small />
                </div>
                <div style={{ fontSize: 11.5, color: MUTED, fontFamily: FONT_MONO }}>{a.start} – {a.end}</div>
              </div>
            );
          })}
        </div>

        {confirmRemove ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12.5, color: DANGER, fontWeight: 600 }}>Remove {tech.name.split(" ")[0]} from the team?</span>
            <button onClick={() => onRemoveTech(tech.id)} style={{ padding: "7px 12px", borderRadius: 7, border: "none", background: DANGER, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Yes, remove</button>
            <button onClick={() => setConfirmRemove(false)} style={{ padding: "7px 12px", borderRadius: 7, border: `1px solid ${LINE_STRONG}`, background: "#fff", color: INK, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmRemove(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 7, border: `1px solid ${LINE_STRONG}`, background: "#fff", color: DANGER, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Trash2 size={12} /> Remove from team
          </button>
        )}
      </div>
    </Drawer>
  );
}

/* ============================================================
   PM HOME
   ============================================================ */
function PmHome({ jobsById, assignments, onOpenJob, onNavigate, techsById }) {
  const todays = assignments.filter((a) => a.date === TODAY_KEY);
  const techsScheduled = new Set(todays.map((a) => a.techId)).size;
  const allJobs = Object.values(jobsById);

  const thisWeekJobIds = new Set(
    assignments.filter((a) => WEEK_DAYS_FULL.some((d) => toKey(d) === a.date)).map((a) => a.jobId)
  );
  const jobsThisWeek = thisWeekJobIds.size;

  const equipmentOut = allJobs
    .filter((j) => j.status !== "complete")
    .reduce((sum, j) => sum + (j.equipment.airMovers || 0) + (j.equipment.dehumidifiers || 0), 0);

  const accessIssues = allJobs.filter((j) => j.accessIssue);
  const pickupsDue = allJobs.filter((j) => j.equipmentPickupRequired);

  const notifications = [
    ...accessIssues.map((j) => ({ icon: AlertTriangle, color: DANGER, text: `${j.name} — access issue flagged, needs attention` })),
    ...pickupsDue.map((j) => ({ icon: FileText, color: MUTED, text: `${j.name} — equipment pickup due` })),
  ];

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: FONT_HEAD, fontSize: 26, fontWeight: 600, marginBottom: 3 }}>Good morning, Vincent</h1>
        <div style={{ fontSize: 13.5, color: INK_SOFT }}>{fmtLong(TODAY)}</div>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <SummaryCard value={todays.length} label="Jobs Today" />
        <SummaryCard value={jobsThisWeek} label="Jobs This Week" />
        <SummaryCard value={techsScheduled} label="Technicians Scheduled" />
        <SummaryCard value={equipmentOut} label="Pieces of Equipment Out" color={CAPTURE} />
        <SummaryCard value={pickupsDue.length} label="Equipment Pickups Due" color={pickupsDue.length ? ESTIMATE : INK} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Needs Attention</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.length === 0 && <div style={{ fontSize: 13, color: MUTED }}>Nothing needs attention right now.</div>}
          {notifications.map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 9, border: `1px solid ${LINE}`, background: PAPER_RAISED }}>
                <Icon size={15} color={n.color} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: INK }}>{n.text}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 }}>Today's Schedule</div>
          <button onClick={() => onNavigate("schedule")} style={{ background: "none", border: "none", color: CAPTURE, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>View full schedule →</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {todays.map((a) => (
            <JobCard key={a.id} assignment={a} job={jobsById[a.jobId]} tech={techsById[a.techId]} onClick={() => onOpenJob(a)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SCHEDULE — Day / Week / Team. Pass techFilter to scope it to a
   single technician's own jobs (used by the tech-side Schedule tab).
   ============================================================ */
function ScheduleView({ jobsById, assignments, onOpenJob, techsById, techFilter }) {
  const [mode, setMode] = useState("day");
  const [cursor, setCursor] = useState(TODAY);
  const cursorKey = toKey(cursor);
  const scoped = techFilter ? assignments.filter((a) => a.techId === techFilter) : assignments;
  const dayAssignments = scoped.filter((a) => a.date === cursorKey).sort((a, b) => a.startMin - b.startMin);
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
  const modeOptions = techFilter
    ? [{ id: "day", label: "Day" }, { id: "week", label: "Week" }]
    : [{ id: "day", label: "Day" }, { id: "week", label: "Week" }, { id: "team", label: "Team" }];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontFamily: FONT_HEAD, fontSize: 24, fontWeight: 600 }}>Schedule</h1>
        <Segmented options={modeOptions} value={mode} onChange={setMode} />
      </div>

      {mode !== "team" && (
        <div style={{ marginBottom: 18 }}>
          <DateNav
            label={mode === "day" ? fmtLong(cursor) : `${fmtShort(WEEK_DAYS[0])} – ${fmtShort(WEEK_DAYS[4])}`}
            onPrev={() => setCursor(addDays(cursor, mode === "day" ? -1 : -7))}
            onNext={() => setCursor(addDays(cursor, mode === "day" ? 1 : 7))}
            onToday={() => setCursor(TODAY)}
          />
        </div>
      )}

      {mode === "day" && (
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ width: 56, flexShrink: 0 }}>
            {hours.map((h) => (
              <div key={h} style={{ height: 84, fontSize: 11, color: MUTED, fontFamily: FONT_MONO, paddingTop: 2 }}>
                {h > 12 ? h - 12 : h}:00 {h >= 12 ? "PM" : "AM"}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {hours.map((h) => {
              const items = dayAssignments.filter((a) => Math.floor(a.startMin / 60) === h);
              return (
                <div key={h} style={{ minHeight: 84, borderTop: `1px solid ${LINE}`, paddingTop: 8, paddingBottom: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map((a) => (
                      <div key={a.id} style={{ maxWidth: 360 }}>
                        <JobCard assignment={a} job={jobsById[a.jobId]} tech={techsById[a.techId]} onClick={() => onOpenJob(a)} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {dayAssignments.length === 0 && <div style={{ padding: "40px 0", textAlign: "center", color: MUTED, fontSize: 13.5 }}>No jobs scheduled this day.</div>}
          </div>
        </div>
      )}

      {mode === "week" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
          {WEEK_DAYS.map((day, di) => {
            const key = toKey(day);
            const isToday = key === TODAY_KEY;
            const items = scoped.filter((a) => a.date === key).sort((a, b) => a.startMin - b.startMin);
            return (
              <div key={di} style={{ background: PAPER_RAISED, border: `1px solid ${isToday ? CAPTURE : LINE}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "9px 10px", background: isToday ? CAPTURE_SOFT : PAPER, borderBottom: `1px solid ${LINE}`, textAlign: "center" }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, color: isToday ? CAPTURE : INK_SOFT }}>{WEEKDAY_LABELS[di]}</div>
                  <div style={{ fontSize: 10, color: MUTED }}>{fmtShort(day)}</div>
                </div>
                <div style={{ padding: 7, display: "flex", flexDirection: "column", gap: 6, minHeight: 140 }}>
                  {items.length === 0 && <div style={{ fontSize: 10.5, color: MUTED, textAlign: "center", padding: "14px 4px" }}>No jobs</div>}
                  {items.map((a) => (
                    <JobCard key={a.id} assignment={a} job={jobsById[a.jobId]} tech={techsById[a.techId]} onClick={() => onOpenJob(a)} compact />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === "team" && !techFilter && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.values(techsById).map((tech) => {
            const items = assignments.filter((a) => a.techId === tech.id && a.date === TODAY_KEY).sort((a, b) => a.startMin - b.startMin);
            return (
              <div key={tech.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: 12, background: PAPER_RAISED, border: `1px solid ${LINE}`, borderRadius: 10 }}>
                <div style={{ width: 140, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <Avatar tech={tech} size={30} />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{tech.short}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
                  {items.length === 0 && <span style={{ fontSize: 12.5, color: MUTED }}>Unassigned today</span>}
                  {items.map((a) => {
                    const job = jobsById[a.jobId];
                    const complete = job.status === "complete";
                    const color = complete ? REPORT : CAPTURE;
                    const bg = complete ? REPORT_SOFT : CAPTURE_SOFT;
                    return (
                      <button key={a.id} onClick={() => onOpenJob(a)} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${color}33`, background: bg, cursor: "pointer", textAlign: "left" }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>{job.name}</div>
                        <div style={{ fontSize: 10.5, color: INK_SOFT, fontFamily: FONT_MONO }}>{a.start} – {a.end}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TEAM SCREEN (roster) — PM can add techs here (name + PIN)
   ============================================================ */
function TeamScreen({ techs, jobsById, assignments, onOpenTech, onAddTech }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h1 style={{ fontFamily: FONT_HEAD, fontSize: 24, fontWeight: 600 }}>Team</h1>
        <button onClick={onAddTech} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 8, border: "none", background: INK, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={14} /> Add tech
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {techs.map((tech) => {
          const todays = assignments.filter((a) => a.techId === tech.id && a.date === TODAY_KEY).sort((a, b) => a.startMin - b.startMin);
          return (
            <Card key={tech.id} onClick={() => onOpenTech(tech)} style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Avatar tech={tech} size={42} />
                <div>
                  <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 14.5 }}>{tech.name}</div>
                  <div style={{ fontSize: 11.5, color: MUTED }}>{tech.role}</div>
                </div>
              </div>
              {todays.length > 0 ? (
                <div>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Today</div>
                  {todays.slice(0, 2).map((a) => (
                    <div key={a.id} style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{jobsById[a.jobId].name}</div>
                  ))}
                  {todays.length > 2 && <div style={{ fontSize: 11, color: MUTED }}>+{todays.length - 2} more</div>}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: MUTED }}>No jobs today</div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   TIMESHEETS — management review (reads the same editable hours
   the tech enters — no separate job-level time tracking anymore)
   ============================================================ */
function TimesheetsManagement({ techs, timesheets, setTimesheets, onToast }) {
  const [reviewTechId, setReviewTechId] = useState(null);
  const reviewTech = techs.find((t) => t.id === reviewTechId);

  const setStatus = (techId, status) => {
    setTimesheets((s) => ({ ...s, [techId]: { ...s[techId], status } }));
    onToast(status === "approved" ? "Timesheet approved" : "Change requested");
    setReviewTechId(null);
  };

  return (
    <div>
      <h1 style={{ fontFamily: FONT_HEAD, fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Timesheets</h1>
      <div style={{ fontSize: 13.5, color: INK_SOFT, marginBottom: 20 }}>Week of {fmtShort(WEEK_DAYS_FULL[0])} – {fmtShort(WEEK_DAYS_FULL[6])}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {techs.map((tech) => {
          const ts = timesheets[tech.id] || { hours: {}, status: "notSubmitted" };
          const mins = weekTotal(ts.hours);
          const statusMeta = {
            notSubmitted: { label: "Not Submitted", color: MUTED },
            submitted: { label: "Submitted", color: ESTIMATE },
            approved: { label: "Approved", color: REPORT },
            changeRequested: { label: "Change Requested", color: DANGER },
          }[ts.status] || { label: "Not Submitted", color: MUTED };
          return (
            <div key={tech.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, background: PAPER_RAISED, border: `1px solid ${LINE}`, borderRadius: 10 }}>
              <Avatar tech={tech} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{tech.name}</div>
                <div style={{ fontSize: 12, color: statusMeta.color, fontWeight: 600, marginTop: 2 }}>{statusMeta.label}</div>
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 15, fontWeight: 700 }}>{fmtHrsClean(mins)} hrs</div>
              <button onClick={() => setReviewTechId(tech.id)} style={{ padding: "8px 14px", borderRadius: 7, border: `1px solid ${LINE_STRONG}`, background: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                {ts.status === "notSubmitted" ? "Remind" : "Review"}
              </button>
            </div>
          );
        })}
      </div>

      <Drawer open={!!reviewTech} onClose={() => setReviewTechId(null)} width={400}>
        {reviewTech && (
          <>
            <DrawerHeader title={reviewTech.name} subtitle={`Week of ${fmtShort(WEEK_DAYS_FULL[0])} – ${fmtShort(WEEK_DAYS_FULL[6])}`} onClose={() => setReviewTechId(null)} />
            <div style={{ padding: "18px 22px" }}>
              {WEEK_DAYS_FULL.map((d, i) => {
                const key = toKey(d);
                const hrs = timesheets[reviewTech.id]?.hours[key] || 0;
                return (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${LINE}`, fontSize: 13 }}>
                    <span>{WEEKDAY_LABELS_FULL[i]} <span style={{ color: MUTED, fontSize: 11.5 }}>{fmtShort(d)}</span></span>
                    <span style={{ fontFamily: FONT_MONO, fontWeight: 600 }}>{hrs ? `${fmtHrsClean(hrs)} hrs` : "—"}</span>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14, paddingTop: 12, marginBottom: 20 }}>
                <span>Week Total</span>
                <span style={{ fontFamily: FONT_MONO }}>{fmtHrsClean(weekTotal(timesheets[reviewTech.id]?.hours || {}))} hrs</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setStatus(reviewTech.id, "approved")} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: REPORT, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Approve</button>
                <button onClick={() => setStatus(reviewTech.id, "changeRequested")} style={{ flex: 1, padding: "11px", borderRadius: 8, border: `1px solid ${LINE_STRONG}`, background: "#fff", color: INK, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Request Change</button>
              </div>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}

/* ============================================================
   TECH HOME — simple dashboard, view only (no start/timer)
   ============================================================ */
function TechHome({ tech, jobsById, assignments, timesheets, onOpenJob }) {
  const todays = assignments.filter((a) => a.techId === tech.id && a.date === TODAY_KEY).sort((a, b) => a.startMin - b.startMin);
  const weekMins = weekTotal(timesheets[tech.id]?.hours || {});

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: FONT_HEAD, fontSize: 24, fontWeight: 600, marginBottom: 3 }}>Good morning, {tech.name.split(" ")[0]}</h1>
        <div style={{ fontSize: 13.5, color: INK_SOFT }}>{fmtLong(TODAY)}</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        <SummaryCard value={todays.length} label="Jobs Today" />
        <SummaryCard value={fmtHrsClean(weekMins)} label="Hours This Week" color={CAPTURE} />
      </div>

      <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 }}>Today</div>
      {todays.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: MUTED, fontSize: 13.5 }}>No assignments today.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {todays.map((a) => {
          const job = jobsById[a.jobId];
          return (
            <div key={a.id} style={{ background: PAPER_RAISED, border: `1px solid ${LINE}`, borderRadius: 12, padding: 15 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: CAPTURE }}>{a.start}</div>
                <CompleteBadge status={job.status} small />
              </div>
              <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 15.5, marginBottom: 2 }}>{job.name}</div>
              <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 4 }}>{job.address}</div>
              <div style={{ fontSize: 12.5, color: INK_SOFT, marginBottom: 12 }}>{job.lossType}</div>
              <button onClick={() => onOpenJob(a)} style={{ width: "100%", padding: "9px", borderRadius: 8, border: `1px solid ${LINE_STRONG}`, background: "#fff", color: INK, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>View Job</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   CHECK IN — straightforward, no timer, can submit more than
   once a day since techs sometimes leave and come back.
   ============================================================ */
function CheckInForm({ tech, jobsById, assignments, checkins, onSubmit, onToast }) {
  const todaysAssignments = assignments.filter((a) => a.techId === tech.id && a.date === TODAY_KEY);
  const [jobId, setJobId] = useState(todaysAssignments[0]?.jobId || "");
  const [arrival, setArrival] = useState("onTime");
  const [tasks, setTasks] = useState("");
  const [photos, setPhotos] = useState(false);
  const [equip, setEquip] = useState(true);
  const [complete, setComplete] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const todaysCheckins = checkins.filter((c) => c.techId === tech.id && c.date === TODAY_KEY).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  if (todaysAssignments.length === 0) {
    return <div style={{ maxWidth: 480, margin: "60px auto 0", textAlign: "center", color: MUTED, fontSize: 13.5 }}>No jobs assigned today — nothing to check in for.</div>;
  }

  const submit = () => {
    if (!tasks.trim()) { setError("Add a quick note on what got done."); return; }
    setError("");
    onSubmit({ jobId, techId: tech.id, arrival, tasks: tasks.trim(), photos, equip, complete, note: note.trim() });
    onToast("Check-in submitted");
    setTasks(""); setPhotos(false); setEquip(true); setComplete(false); setNote(""); setArrival("onTime");
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontFamily: FONT_HEAD, fontSize: 24, fontWeight: 600, marginBottom: 4, textAlign: "center" }}>Check In</h1>
      <div style={{ fontSize: 13.5, color: INK_SOFT, marginBottom: 20, textAlign: "center" }}>Your PM sees this the second you submit — check in again anytime something changes.</div>

      <div style={{ background: PAPER_RAISED, border: `1px solid ${LINE}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <FieldBlock label="Job">
          <FieldSelect value={jobId} onChange={setJobId} options={todaysAssignments.map((a) => ({ id: a.jobId, label: jobsById[a.jobId].name }))} />
        </FieldBlock>

        <FieldBlock label="Arrival">
          <div style={{ display: "flex", gap: 8 }}>
            {Object.entries(ARRIVAL_META).map(([id, m]) => {
              const active = arrival === id;
              return (
                <button key={id} onClick={() => setArrival(id)} style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: `1.5px solid ${active ? m.color : LINE_STRONG}`, background: active ? m.color : "#fff", color: active ? "#fff" : INK, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                  {m.label}
                </button>
              );
            })}
          </div>
        </FieldBlock>

        <FieldBlock label="What did you work on?">
          <textarea value={tasks} onChange={(e) => setTasks(e.target.value)} rows={3} placeholder="Tear-out complete in rec room, air movers running."
            style={inputStyle({ resize: "none", borderColor: error ? DANGER : LINE_STRONG })} />
        </FieldBlock>

        <FieldBlock label="Checklist">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Checkbox value={photos} onChange={setPhotos} label="Photos logged" />
            <Toggle value={equip} onChange={setEquip} label="Equipment installed" />
            <Toggle value={complete} onChange={setComplete} label="Job complete" />
          </div>
        </FieldBlock>

        <FieldBlock label="Anything else for the PM (optional)">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Waiting on homeowner access, running behind, anything to flag."
            style={inputStyle({ resize: "none" })} />
        </FieldBlock>

        {error && <div style={{ fontSize: 12.5, color: DANGER, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={13} /> {error}</div>}

        <button onClick={submit} style={{ width: "100%", padding: "13px", borderRadius: 8, border: "none", background: CAPTURE, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Send size={14} /> Submit check-in
        </button>
      </div>

      {todaysCheckins.length > 0 && (
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Today's check-ins</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todaysCheckins.map((c) => (
              <div key={c.id} style={{ padding: 11, borderRadius: 8, border: `1px solid ${LINE}`, background: PAPER_RAISED, fontSize: 12.5 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>{jobsById[c.jobId].name}</span>
                  <span style={{ color: MUTED, fontFamily: FONT_MONO, fontSize: 11 }}>{c.submittedAt.slice(11, 16)}</span>
                </div>
                <div style={{ color: INK_SOFT }}>{c.tasks}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TECH TIMESHEET — editable hours + clock in/out for today
   ============================================================ */
function TechTimesheet({ tech, timesheets, setTimesheets, onToast }) {
  const [confirmed, setConfirmed] = useState(false);
  const [, forceTick] = useState(0);
  const ts = timesheets[tech.id] || { hours: {}, status: "notSubmitted", clockedInAt: null };
  const locked = ts.status !== "notSubmitted";

  useEffect(() => {
    if (!ts.clockedInAt) return;
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [ts.clockedInAt]);

  const setHour = (dateKey, val) => {
    const num = val === "" ? 0 : Math.max(0, parseFloat(val) || 0);
    setTimesheets((s) => ({ ...s, [tech.id]: { ...s[tech.id], hours: { ...s[tech.id].hours, [dateKey]: num } } }));
  };

  const clockIn = () => {
    setTimesheets((s) => ({ ...s, [tech.id]: { ...s[tech.id], clockedInAt: Date.now() } }));
    onToast("Clocked in");
  };
  const clockOut = () => {
    const elapsedHrs = (Date.now() - ts.clockedInAt) / (1000 * 60 * 60);
    const rounded = Math.round(elapsedHrs * 4) / 4; // nearest quarter hour
    setTimesheets((s) => ({
      ...s,
      [tech.id]: { ...s[tech.id], clockedInAt: null, hours: { ...s[tech.id].hours, [TODAY_KEY]: (s[tech.id].hours[TODAY_KEY] || 0) + rounded },
      },
    }));
    onToast(`Clocked out — added ${fmtHrsClean(rounded)} hrs`);
  };

  const elapsedLabel = () => {
    if (!ts.clockedInAt) return "";
    const s = Math.floor((Date.now() - ts.clockedInAt) / 1000);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const mins = weekTotal(ts.hours);
  const submit = () => {
    if (!confirmed) return;
    setTimesheets((s) => ({ ...s, [tech.id]: { ...s[tech.id], status: "submitted" } }));
    onToast("Timesheet submitted to management");
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontFamily: FONT_HEAD, fontSize: 22, fontWeight: 600, marginBottom: 4, textAlign: "center" }}>Your Hours</h1>
      <div style={{ fontSize: 13, color: INK_SOFT, textAlign: "center", marginBottom: 20 }}>Week of {fmtShort(WEEK_DAYS_FULL[0])} – {fmtShort(WEEK_DAYS_FULL[6])}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {WEEK_DAYS_FULL.map((d, i) => {
          const key = toKey(d);
          const isToday = key === TODAY_KEY;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: PAPER_RAISED, border: `1px solid ${isToday ? CAPTURE : LINE}`, borderRadius: 10 }}>
              <div style={{ width: 62, flexShrink: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: isToday ? CAPTURE : INK }}>{WEEKDAY_LABELS_FULL[i]}</div>
                <div style={{ fontSize: 10.5, color: MUTED }}>{fmtShort(d)}</div>
              </div>

              {isToday && !locked && (
                ts.clockedInAt ? (
                  <button onClick={clockOut} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 7, border: "none", background: DANGER, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    <Square size={11} fill="#fff" /> Clock Out · {elapsedLabel()}
                  </button>
                ) : (
                  <button onClick={clockIn} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 7, border: "none", background: CAPTURE, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    <Play size={11} fill="#fff" /> Clock In
                  </button>
                )
              )}

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <input type="number" min="0" step="0.25" value={ts.hours[key] || ""} placeholder="0" disabled={locked}
                  onChange={(e) => setHour(key, e.target.value)}
                  style={{ width: 62, textAlign: "right", padding: "7px 8px", borderRadius: 7, border: `1px solid ${LINE_STRONG}`, fontFamily: FONT_MONO, fontSize: 13.5, fontWeight: 600, background: locked ? PAPER : "#fff", color: locked ? MUTED : INK }} />
                <span style={{ fontSize: 12, color: MUTED }}>hrs</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: CAPTURE_SOFT, border: `1px solid ${CAPTURE_LINE}`, borderRadius: 10, marginBottom: 18 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>Week Total</span>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 17, color: CAPTURE }}>{fmtHrsClean(mins)} hrs</span>
      </div>

      {ts.status === "notSubmitted" ? (
        <>
          <Checkbox value={confirmed} onChange={setConfirmed} label="I confirm that these hours accurately represent the time worked this week." />
          <button onClick={submit} disabled={!confirmed}
            style={{ width: "100%", marginTop: 14, padding: "13px", borderRadius: 8, border: "none", background: confirmed ? CAPTURE : LINE_STRONG, color: confirmed ? "#fff" : MUTED, fontSize: 14, fontWeight: 700, cursor: confirmed ? "pointer" : "not-allowed" }}>
            Submit Timesheet
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: 14, borderRadius: 10, background: ts.status === "approved" ? REPORT_SOFT : CAPTURE_SOFT, color: ts.status === "approved" ? REPORT : CAPTURE, fontWeight: 700, fontSize: 13.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <CheckCircle2 size={16} /> {ts.status === "approved" ? "Approved by management" : ts.status === "changeRequested" ? "Change requested — check with your PM" : "Submitted to Management"}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TECH SIGN-IN — name picker + PIN pad. PM creates the accounts
   (Team screen); techs never sign up themselves.
   ============================================================ */
function TechSignIn({ techs, onLogin }) {
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const press = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      if (next === selected.pin) {
        onLogin(selected);
      } else {
        setError(true);
        setTimeout(() => { setPin(""); setError(false); }, 500);
      }
    }
  };
  const backspace = () => setPin((p) => p.slice(0, -1));

  if (!selected) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <img src="/struvae-mark.png" alt="Struvae" style={{ width: 40, height: 40, borderRadius: 9, marginBottom: 14 }} />
        <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 20, marginBottom: 4 }}>Struvae Daily</div>
        <div style={{ fontSize: 13.5, color: INK_SOFT, marginBottom: 28 }}>Who's checking in?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "min(320px, 100%)" }}>
          {techs.map((t) => (
            <button key={t.id} onClick={() => setSelected(t)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, border: `1px solid ${LINE}`, background: PAPER_RAISED, cursor: "pointer", textAlign: "left" }}>
              <Avatar tech={t} size={38} />
              <div>
                <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 15 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{t.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Avatar tech={selected} size={56} />
      <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 18, marginTop: 12, marginBottom: 4 }}>{selected.name}</div>
      <div style={{ fontSize: 12.5, color: MUTED, display: "flex", alignItems: "center", gap: 5, marginBottom: 26 }}><Lock size={12} /> Enter your 4-digit PIN</div>

      <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < pin.length ? (error ? DANGER : CAPTURE) : LINE_STRONG, transition: "background 120ms ease" }} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 12, marginBottom: 20 }}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} onClick={() => press(d)} style={keypadBtn}>{d}</button>
        ))}
        <div />
        <button onClick={() => press("0")} style={keypadBtn}>0</button>
        <button onClick={backspace} style={{ ...keypadBtn, background: "transparent", border: "none" }}><Delete size={18} color={INK_SOFT} /></button>
      </div>

      <button onClick={() => { setSelected(null); setPin(""); setError(false); }} style={{ background: "none", border: "none", color: MUTED, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
        ← Not you?
      </button>
    </div>
  );
}
const keypadBtn = { width: 64, height: 64, borderRadius: "50%", border: `1px solid ${LINE_STRONG}`, background: "#fff", fontSize: 20, fontWeight: 600, color: INK, cursor: "pointer", fontFamily: FONT_MONO };

/* ============================================================
   APP SHELL
   ============================================================ */
const PM_NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "team", label: "Team", icon: Users },
  { id: "timesheets", label: "Timesheets", icon: Clock },
];
const TECH_NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "checkin", label: "Check In", icon: ClipboardCheck },
  { id: "timesheets", label: "Timesheet", icon: Clock },
];

function Sidebar({ nav, view, setView, role, setRole, loggedInTech, onLogout }) {
  return (
    <div className="app-sidebar" style={{ width: 220, borderRight: `1px solid ${LINE}`, background: PAPER_RAISED, height: "100vh", position: "fixed", top: 0, left: 0, display: "flex", flexDirection: "column", overflowY: "auto", zIndex: 20 }}>
      <div style={{ padding: "20px 18px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
        <img src="/struvae-mark.png" alt="Struvae" style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: FONT_HEAD, fontWeight: 600, fontSize: 15, lineHeight: 1.1 }}>Struvae Daily</div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 9.5, letterSpacing: 0.8, color: CAPTURE, marginTop: 3, textTransform: "uppercase" }}>Day-to-day schedule</div>
        </div>
      </div>
      <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {nav.map((n) => {
          const active = view === n.id;
          const Icon = n.icon;
          return (
            <button key={n.id} onClick={() => setView(n.id)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: active ? CAPTURE_SOFT : "transparent", color: active ? CAPTURE : INK_SOFT, fontSize: 13.5, fontWeight: 600, cursor: "pointer", textAlign: "left" }}>
              <Icon size={16} /> {n.label}
            </button>
          );
        })}
      </div>
      {role === "tech" && loggedInTech && (
        <div style={{ padding: 14, borderTop: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar tech={loggedInTech} size={30} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{loggedInTech.name}</div>
          </div>
          <button onClick={onLogout} title="Switch user" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
            <LogOut size={15} color={MUTED} />
          </button>
        </div>
      )}
      <div style={{ padding: 14, borderTop: `1px dashed ${LINE_STRONG}` }}>
        <div style={{ fontSize: 9.5, fontFamily: FONT_MONO, color: MUTED, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 }}>Preview mode</div>
        <div style={{ display: "flex", gap: 3, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 7, padding: 2 }}>
          {["pm", "tech"].map((r) => (
            <button key={r} onClick={() => { setRole(r); setView("home"); }}
              style={{ flex: 1, padding: "6px 0", borderRadius: 5, border: "none", background: role === r ? INK : "transparent", color: role === r ? "#fff" : INK_SOFT, fontSize: 10.5, fontWeight: 600, cursor: "pointer" }}>
              {r === "pm" ? "PM" : "Tech"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
function BottomNav({ nav, view, setView }) {
  return (
    <div className="app-bottomnav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: PAPER_RAISED, borderTop: `1px solid ${LINE}`, display: "none", justifyContent: "space-around", padding: "8px 4px calc(8px + env(safe-area-inset-bottom))", zIndex: 30 }}>
      {nav.map((n) => {
        const active = view === n.id;
        const Icon = n.icon;
        return (
          <button key={n.id} onClick={() => setView(n.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none", padding: "4px 10px", cursor: "pointer", color: active ? CAPTURE : MUTED }}>
            <Icon size={19} />
            <span style={{ fontSize: 9.5, fontWeight: 600 }}>{n.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function StruvaeDaily() {
  const [role, setRole] = useState("pm");
  const [view, setView] = useState("home");
  const [techs, setTechs] = useState(TECHS_SEED);
  const [jobs, setJobs] = useState(JOBS_SEED);
  const [assignments] = useState(ASSIGNMENTS);
  const [checkins, setCheckins] = useState([]);
  const [timesheets, setTimesheets] = useState(seedTimesheets);
  const [drawerAssignment, setDrawerAssignment] = useState(null);
  const [drawerTech, setDrawerTech] = useState(null);
  const [loggedInTechId, setLoggedInTechId] = useState(null);
  const [toasts, setToasts] = useState([]);

  const jobsById = useMemo(() => Object.fromEntries(jobs.map((j) => [j.id, j])), [jobs]);
  const techsById = useMemo(() => Object.fromEntries(techs.map((t) => [t.id, t])), [techs]);
  const loggedInTech = techsById[loggedInTechId] || null;

  const pushToast = (message) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const updateJob = (jobId, patch) => setJobs((js) => js.map((j) => (j.id === jobId ? { ...j, ...patch } : j)));
  const markComplete = (jobId) => updateJob(jobId, { status: "complete" });

  const submitCheckin = (data) => {
    const entry = { id: `${data.jobId}-${Date.now()}`, date: TODAY_KEY, submittedAt: new Date().toISOString(), ...data };
    setCheckins((cs) => [...cs, entry]);
    if (data.complete) markComplete(data.jobId);
  };

  const addTech = () => {
    const id = `tech-${Date.now()}`;
    const color = AVATAR_COLORS[techs.length % AVATAR_COLORS.length];
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    const draft = { id, name: "New Technician", short: "New Tech", role: "Technician", color, pin };
    setTechs((t) => [...t, draft]);
    setTimesheets((s) => ({ ...s, [id]: { hours: Object.fromEntries(WEEK_DAYS_FULL.map((d) => [toKey(d), 0])), status: "notSubmitted", clockedInAt: null } }));
    setDrawerTech(draft);
  };
  const updateTech = (id, patch) => setTechs((t) => t.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const removeTech = (id) => { setTechs((t) => t.filter((x) => x.id !== id)); setDrawerTech(null); pushToast("Technician removed"); };

  const nav = role === "pm" ? PM_NAV : TECH_NAV;
  const drawerJob = drawerAssignment ? jobsById[drawerAssignment.jobId] : null;
  const drawerTechForJob = drawerAssignment ? techsById[drawerAssignment.techId] : null;

  const showTechSignIn = role === "tech" && !loggedInTech;

  return (
    <div style={{ fontFamily: FONT_BODY, color: INK, background: PAPER, minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible, input:focus-visible, select:focus-visible, textarea:focus-visible { outline: 2px solid ${CAPTURE}; outline-offset: 2px; }
        input, select, textarea { font-family: 'IBM Plex Sans', sans-serif; }
        @keyframes toastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 860px) {
          .app-sidebar { display: none !important; }
          .app-bottomnav { display: flex !important; }
          .app-main { margin-left: 0 !important; padding-bottom: 84px !important; }
        }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
      `}</style>

      {showTechSignIn ? (
        <TechSignIn techs={techs} onLogin={(t) => setLoggedInTechId(t.id)} />
      ) : (
        <>
          <Sidebar nav={nav} view={view} setView={setView} role={role} setRole={(r) => { setRole(r); if (r === "pm") setLoggedInTechId(null); }} loggedInTech={loggedInTech} onLogout={() => setLoggedInTechId(null)} />

          <div className="app-main" style={{ marginLeft: 220, padding: "26px 28px", maxWidth: 1100 }}>
            {role === "pm" && view === "home" && <PmHome jobsById={jobsById} assignments={assignments} onOpenJob={setDrawerAssignment} onNavigate={setView} techsById={techsById} />}
            {role === "pm" && view === "schedule" && <ScheduleView jobsById={jobsById} assignments={assignments} onOpenJob={setDrawerAssignment} techsById={techsById} />}
            {role === "pm" && view === "team" && <TeamScreen techs={techs} jobsById={jobsById} assignments={assignments} onOpenTech={setDrawerTech} onAddTech={addTech} />}
            {role === "pm" && view === "timesheets" && <TimesheetsManagement techs={techs} timesheets={timesheets} setTimesheets={setTimesheets} onToast={pushToast} />}

            {role === "tech" && loggedInTech && view === "home" && (
                <TechHome tech={loggedInTech} jobsById={jobsById} assignments={assignments} timesheets={timesheets} onOpenJob={setDrawerAssignment} />
              )}
              {role === "tech" && loggedInTech && view === "schedule" && (
                <ScheduleView jobsById={jobsById} assignments={assignments} onOpenJob={setDrawerAssignment} techsById={techsById} techFilter={loggedInTech.id} />
              )}
            {role === "tech" && loggedInTech && view === "checkin" && (
              <CheckInForm tech={loggedInTech} jobsById={jobsById} assignments={assignments} checkins={checkins} onSubmit={submitCheckin} onToast={pushToast} />
            )}
            {role === "tech" && loggedInTech && view === "timesheets" && (
              <TechTimesheet tech={loggedInTech} timesheets={timesheets} setTimesheets={setTimesheets} onToast={pushToast} />
            )}
          </div>

          <BottomNav nav={nav} view={view} setView={setView} />

          <JobDrawer
            job={drawerJob} assignment={drawerAssignment} tech={drawerTechForJob}
            open={!!drawerAssignment} onClose={() => setDrawerAssignment(null)}
            isPm={role === "pm"}
            onUpdateJob={updateJob}
            onMarkComplete={(jobId) => { markComplete(jobId); setDrawerAssignment(null); }}
            onToast={pushToast}
          />

          <TechDrawer
            tech={drawerTech} open={!!drawerTech} onClose={() => setDrawerTech(null)}
            assignments={assignments} jobsById={jobsById}
            onUpdateTech={updateTech} onRemoveTech={removeTech} onToast={pushToast}
          />

          <Toast toasts={toasts} />
        </>
      )}
    </div>
  );
}