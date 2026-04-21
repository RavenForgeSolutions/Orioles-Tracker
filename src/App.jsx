import { useState, useEffect, useCallback, useRef } from "react";

// ══════════════════════════════════════════
// CONFIGURATION - Apps Script Web App URL
// ══════════════════════════════════════════
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyTEpHUdcXfNTs_k84WDQl9ltRB_3RRe5KcBHQRLwTS38dCDTjBHeJHZU8MuqWFyRcx2Q/exec";

// ── Park Directory ──
const PARKS = {
  "DiPippo": { name: "DiPippo Park", address: "31 Williams Court, Longmeadow, MA" },
  "Beachgrounds": { name: "Beachgrounds", address: "147 Main St, South Hadley, MA" },
  "Forest Park #1": { name: "Forest Park #1", address: "293 Sumner Ave, Springfield, MA" },
  "Duggan Jr. High": { name: "Duggan Jr. High", address: "1015 Wilbraham Rd, Springfield, MA" },
  "Spec Pond": { name: "Spec Pond", address: "45 Post Office Park, Wilbraham, MA" },
  "Spec Pond-Lights": { name: "Spec Pond (Lights)", address: "45 Post Office Park, Wilbraham, MA" },
  "Mittineague": { name: "Mittineague Park #3", address: "100 Park Dr, W. Springfield, MA" },
  "School Street": { name: "School Street", address: "511 School St, Agawam, MA" },
  "South Hadley HS": { name: "South Hadley HS", address: "18 Lincoln Ave, South Hadley, MA" },
};

// ── Fallback Schedule ──
const FALLBACK_SCHEDULE = [
  { id: "g1", game: 1, date: "2026-04-26", time: "3:00 PM", opponent: "Angels", homeAway: "home", park: "DiPippo" },
  { id: "g2", game: 2, date: "2026-05-03", time: "4:00 PM", opponent: "Cubs", homeAway: "away", park: "Beachgrounds" },
  { id: "g3", game: 3, date: "2026-05-09", time: "10:00 AM", opponent: "Twins", homeAway: "away", park: "Forest Park #1" },
  { id: "g4", game: 4, date: "2026-05-17", time: "4:00 PM", opponent: "Athletics", homeAway: "home", park: "Duggan Jr. High" },
  { id: "g5", game: 5, date: "2026-05-20", time: "6:00 PM", opponent: "Tigers", homeAway: "home", park: "Spec Pond-Lights" },
  { id: "g6", game: 6, date: "2026-05-31", time: "4:00 PM", opponent: "Angels", homeAway: "away", park: "School Street" },
  { id: "g7", game: 7, date: "2026-06-07", time: "6:00 PM", opponent: "Cubs", homeAway: "home", park: "Spec Pond-Lights" },
  { id: "g8", game: 8, date: "2026-06-14", time: "1:30 PM", opponent: "Twins", homeAway: "home", park: "Forest Park #1" },
  { id: "g9", game: 9, date: "2026-06-21", time: "4:00 PM", opponent: "Athletics", homeAway: "home", park: "Mittineague" },
  { id: "g10", game: 10, date: "2026-06-28", time: "4:00 PM", opponent: "Tigers", homeAway: "away", park: "School Street" },
  { id: "g11", game: 11, date: "2026-07-02", time: "6:00 PM", opponent: "Angels", homeAway: "home", park: "Spec Pond-Lights" },
  { id: "g12", game: 12, date: "2026-07-12", time: "10:00 AM", opponent: "Cubs", homeAway: "away", park: "DiPippo" },
  { id: "g13", game: 13, date: "2026-07-19", time: "10:00 AM", opponent: "Twins", homeAway: "away", park: "Forest Park #1" },
  { id: "g14", game: 14, date: "2026-07-26", time: "6:00 PM", opponent: "Athletics", homeAway: "away", park: "Spec Pond-Lights" },
  { id: "g15", game: 15, date: "2026-08-02", time: "4:00 PM", opponent: "Tigers", homeAway: "home", park: "DiPippo" },
];

// ── Outcomes ──
const OUTCOMES = [
  { code: "1B", label: "Single", color: "#4ade80", isHit: true, isAB: true },
  { code: "2B", label: "Double", color: "#60a5fa", isHit: true, isAB: true },
  { code: "3B", label: "Triple", color: "#c084fc", isHit: true, isAB: true },
  { code: "HR", label: "HR", color: "#f97316", isHit: true, isAB: true },
  { code: "BB", label: "Walk", color: "#fbbf24", isHit: false, isAB: false },
  { code: "HBP", label: "HBP", color: "#fb923c", isHit: false, isAB: false },
  { code: "K", label: "K", color: "#6b7280", isHit: false, isAB: true },
  { code: "GO", label: "Groundout", color: "#78716c", isHit: false, isAB: true },
  { code: "FO", label: "Flyout", color: "#9ca3af", isHit: false, isAB: true },
  { code: "SAC", label: "SAC", color: "#d4d4d8", isHit: false, isAB: false },
  { code: "FC", label: "Fielder's Choice", color: "#a1a1aa", isHit: false, isAB: true },
  { code: "E", label: "ROE", color: "#fbbf24", isHit: false, isAB: true },
];

const getO = (code) => OUTCOMES.find((o) => o.code === code) || OUTCOMES[6];

function calcStats(abs) {
  const pa = abs.length;
  const atbats = abs.filter((a) => getO(a.result).isAB).length;
  const hits = abs.filter((a) => getO(a.result).isHit).length;
  const s = abs.filter((a) => a.result === "1B").length;
  const d = abs.filter((a) => a.result === "2B").length;
  const t = abs.filter((a) => a.result === "3B").length;
  const hr = abs.filter((a) => a.result === "HR").length;
  const bb = abs.filter((a) => a.result === "BB").length;
  const hbp = abs.filter((a) => a.result === "HBP").length;
  const k = abs.filter((a) => a.result === "K").length;
  const tb = s + d * 2 + t * 3 + hr * 4;
  const avg = atbats > 0 ? hits / atbats : 0;
  const obp = pa > 0 ? (hits + bb + hbp) / pa : 0;
  const slg = atbats > 0 ? tb / atbats : 0;
  return { pa, atbats, hits, s, d, t, hr, bb, hbp, k, tb, avg, obp, slg, ops: obp + slg };
}

function f3(v) { if (v === 0) return ".000"; const s = v.toFixed(3); return v >= 1 ? s : s.slice(1); }

function openDir(park) {
  const p = PARKS[park];
  if (p) window.open(`https://maps.google.com/maps?daddr=${encodeURIComponent(p.address)}`, "_blank");
}

// ══════════════════════════════════════════
// User Identity (localStorage)
// ══════════════════════════════════════════
function getUserIdentity() {
  try {
    const raw = localStorage.getItem("orioles_user");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function setUserIdentity(user) {
  localStorage.setItem("orioles_user", JSON.stringify(user));
}

function formatDisplayName(firstName, lastName) {
  if (!lastName) return firstName;
  return `${firstName.charAt(0).toUpperCase()}. ${lastName}`;
}

// ══════════════════════════════════════════
// Google Sheets API Layer
// ══════════════════════════════════════════
async function fetchAll() {
  if (!SCRIPT_URL) return null;
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getAll`);
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Fetch failed:", e);
    return null;
  }
}

async function postToSheet(payload) {
  if (!SCRIPT_URL) return;
  try {
    // Attach current user for audit log
    const user = getUserIdentity();
    if (user) {
      payload.user = user.displayName;
    }
    await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("Post failed:", e);
  }
}

// ── Theme ──
const C = {
  bg: "#0d0d0d", card: "#1a1a1a", cardAlt: "#222222", border: "#2e2e2e",
  text: "#f5f5f5", dim: "#888888",
  orange: "#f97316", orangeBright: "#fb923c", orangeDim: "#7c2d12",
  orangeBg: "#1f1208", black: "#0d0d0d", white: "#f5f5f5",
  danger: "#ef4444", dangerBg: "#3b1111", accent: "#f97316", accentBg: "#1f1208",
  green: "#22c55e", greenBg: "#052e16",
};
const mono = "'IBM Plex Mono', monospace";
const sans = "'IBM Plex Sans', system-ui, sans-serif";

function inputStyle() {
  return {
    width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
    color: C.text, padding: "7px 8px", fontSize: 12, fontFamily: mono, boxSizing: "border-box", marginTop: 2,
  };
}

// ══════════════════════════════════════════
// First-Time User Setup Modal
// ══════════════════════════════════════════
function UserSetupModal({ onComplete }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [jersey, setJersey] = useState("");

  const isValid = firstName.trim() && lastName.trim() && jersey.trim();

  const handleSubmit = () => {
    if (!isValid) return;
    const fn = firstName.trim();
    const ln = lastName.trim();
    const displayName = formatDisplayName(fn, ln);
    const user = { firstName: fn, lastName: ln, jersey: jersey.trim(), displayName };
    setUserIdentity(user);
    onComplete(user);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, borderRadius: 16, border: `2px solid ${C.orange}`, padding: "28px 24px", maxWidth: 360, width: "100%", boxShadow: `0 0 40px ${C.orange}20` }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.orange, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: C.black, fontFamily: mono, boxShadow: `0 0 20px ${C.orange}40`, marginBottom: 12 }}>O</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.orange, fontFamily: mono, letterSpacing: "1px" }}>ORIOLES 2026</div>
          <div style={{ fontSize: 12, color: C.dim, fontFamily: mono, marginTop: 4 }}>Join the roster</div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: C.orange, fontFamily: mono }}>FIRST NAME *</label>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus style={{ ...inputStyle(), fontSize: 15, padding: "10px 12px" }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: C.orange, fontFamily: mono }}>LAST NAME *</label>
          <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} style={{ ...inputStyle(), fontSize: 15, padding: "10px 12px" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: C.orange, fontFamily: mono }}>JERSEY # *</label>
          <input type="text" value={jersey} onChange={(e) => setJersey(e.target.value)} maxLength={3} style={{ ...inputStyle(), fontSize: 15, padding: "10px 12px", width: 80 }} />
        </div>

        {isValid && (
          <div style={{ marginBottom: 16, padding: "8px 12px", background: C.orangeBg, borderRadius: 8, border: `1px solid ${C.orange}30` }}>
            <span style={{ fontSize: 11, color: C.dim, fontFamily: mono }}>You'll appear as: </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.orange, fontFamily: mono }}>
              {formatDisplayName(firstName.trim(), lastName.trim())}
              <span style={{ opacity: 0.6 }}> #{jersey.trim()}</span>
            </span>
          </div>
        )}

        <button onClick={handleSubmit} disabled={!isValid} style={{
          width: "100%", padding: 13, background: isValid ? C.orange : C.border,
          color: isValid ? C.black : C.dim, border: "none", borderRadius: 10,
          fontWeight: 800, fontSize: 14, cursor: isValid ? "pointer" : "default",
          fontFamily: mono, letterSpacing: "0.5px",
        }}>LET'S GO ⚾</button>
      </div>
    </div>
  );
}



// ── Format score display ──
function formatScore(game) {
  if (game.orilesScore != null && game.opponentScore != null && (game.orilesScore > 0 || game.opponentScore > 0)) {
    return `${game.orilesScore}-${game.opponentScore}`;
  }
  return null;
}

// ── Header ──
function AppHeader({ schedule, currentUser }) {
  const wins = schedule.filter((g) => g.result === "W").length;
  const losses = schedule.filter((g) => g.result === "L").length;
  const hasRecord = wins + losses > 0;
  return (
    <div style={{ padding: "14px 16px 10px", background: `linear-gradient(135deg, ${C.orangeDim} 0%, ${C.bg} 100%)`, borderBottom: `2px solid ${C.orange}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: C.black, fontFamily: mono, boxShadow: `0 0 12px ${C.orange}40` }}>O</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.orange, fontFamily: mono, letterSpacing: "1px" }}>ORIOLES</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.dim, fontFamily: mono, letterSpacing: "0.5px" }}>
            {currentUser ? (
              <span>SUMMER 2026 · <span style={{ color: C.orangeBright }}>{currentUser.displayName}{currentUser.jersey ? ` #${currentUser.jersey}` : ""}</span></span>
            ) : "SUMMER 2026"}
          </div>
        </div>
        {hasRecord && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, fontFamily: mono, lineHeight: 1 }}>{wins}-{losses}</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: C.dim, fontFamily: mono }}>{(wins / (wins + losses) * 100).toFixed(0)}% WIN</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab Bar ──
function TabBar({ tab, setTab }) {
  const tabs = [
    { id: "game", icon: "⚾", label: "Game" }, { id: "stats", icon: "📊", label: "Stats" },
    { id: "schedule", icon: "📅", label: "Schedule" }, { id: "roster", icon: "👥", label: "Lineup" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: C.card, borderTop: `2px solid ${C.orange}40`, display: "flex", padding: "4px 0 env(safe-area-inset-bottom, 6px)" }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          background: "none", border: "none", padding: "5px 0", cursor: "pointer",
          color: tab === t.id ? C.orange : C.dim, fontSize: 9, fontWeight: 700, fontFamily: mono,
        }}>
          <span style={{ fontSize: 16 }}>{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
}

// ── Result Modal (opened by scoreboard icon) ──
function ResultModal({ game, onSelect, onClear, onClose }) {
  const score = formatScore(game);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 14, border: `2px solid ${C.orange}`, padding: "20px", maxWidth: 280, width: "100%", boxShadow: `0 0 30px ${C.orange}20` }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.orange, fontFamily: mono }}>FINAL RESULT</div>
          <div style={{ fontSize: 11, color: C.dim, fontFamily: mono, marginTop: 2 }}>
            Orioles {game.orilesScore ?? 0} - {game.opponent} {game.opponentScore ?? 0}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={() => onSelect("W")} style={{
            flex: 1, padding: "14px 0", borderRadius: 10, fontFamily: mono, fontSize: 18, fontWeight: 900,
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            border: `2px solid ${game.result === "W" ? C.green : C.green + "50"}`,
            background: game.result === "W" ? C.green : C.greenBg, color: game.result === "W" ? C.black : C.green,
          }}>{game.result === "W" ? "✓ WIN" : "WIN"}</button>
          <button onClick={() => onSelect("L")} style={{
            flex: 1, padding: "14px 0", borderRadius: 10, fontFamily: mono, fontSize: 18, fontWeight: 900,
            cursor: "pointer", WebkitTapHighlightColor: "transparent",
            border: `2px solid ${game.result === "L" ? C.danger : C.danger + "50"}`,
            background: game.result === "L" ? C.danger : C.dangerBg, color: game.result === "L" ? C.white : C.danger,
          }}>{game.result === "L" ? "✗ LOSS" : "LOSS"}</button>
        </div>

        {game.result && (
          <button onClick={onClear} style={{
            width: "100%", padding: 9, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
            color: C.dim, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: mono,
          }}>Clear result</button>
        )}
      </div>
    </div>
  );
}

// ── Game View ──
function GameView({ roster, atBats, schedule, gameId, setGameId, onLog, onGameResult, onUpdateScore, onUpdateInning }) {
  const [expanded, setExpanded] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const game = schedule.find((g) => g.id === gameId);
  const active = roster.filter((p) => p.active && !p.removed).sort((a, b) => a.order - b.order);
  const gABs = atBats.filter((ab) => ab.gameId === gameId);
  const park = game ? PARKS[game.park] : null;
  const isLocked = game && (game.result === "W" || game.result === "L");
  const oriScore = game?.orilesScore ?? 0;
  const oppScore = game?.opponentScore ?? 0;
  const inning = game?.inning ?? 0;

  const ScoreBtn = ({ onClick, disabled, children }) => (
    <button onClick={onClick} disabled={disabled} style={{
      width: 36, height: 36, borderRadius: 8, border: `1px solid ${disabled ? C.border : C.orange}40`,
      background: disabled ? "transparent" : C.orangeBg, color: disabled ? C.border : C.orange,
      fontSize: 18, fontWeight: 800, fontFamily: mono, cursor: disabled ? "default" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      WebkitTapHighlightColor: "transparent", opacity: disabled ? 0.3 : 1,
    }}>{children}</button>
  );

  const handleResultSelect = (result) => {
    onGameResult(game.id, result, oriScore, oppScore);
    setShowResult(false);
  };

  const handleResultClear = () => {
    onGameResult(game.id, null, oriScore, oppScore);
    setShowResult(false);
  };

  return (
    <div>
      {showResult && game && (
        <ResultModal game={game} onSelect={handleResultSelect} onClear={handleResultClear} onClose={() => setShowResult(false)} />
      )}

      <div style={{ padding: "10px 14px 0" }}>
        <select value={gameId} onChange={(e) => setGameId(e.target.value)} style={{
          width: "100%", background: C.card, border: `1px solid ${C.orange}40`, borderRadius: 8,
          color: C.text, padding: "10px 12px", fontSize: 13, fontFamily: mono, fontWeight: 700, marginBottom: 8,
        }}>
          {schedule.map((g) => {
            const dt = new Date(g.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const res = g.result ? ` [${g.result}${formatScore(g) ? ` ${formatScore(g)}` : ""}]` : "";
            return <option key={g.id} value={g.id}>G{g.game}: {dt} {g.homeAway === "home" ? "vs" : "@"} {g.opponent}{res}</option>;
          })}
        </select>
      </div>

      {game && (
        <div style={{ margin: "0 14px 8px", background: C.card, borderRadius: 10, border: `1px solid ${isLocked ? (game.result === "W" ? C.green : C.danger) + "50" : C.orange + "30"}`, boxShadow: `inset 0 1px 0 ${C.orange}15`, overflow: "hidden" }}>
          {/* Game info row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px 8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: C.dim, fontFamily: mono }}>
                {new Date(game.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {game.time}
              </span>
              <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 3, fontFamily: mono, color: game.homeAway === "home" ? C.orange : "#60a5fa", background: game.homeAway === "home" ? C.orangeBg : "#0d1a2e" }}>{game.homeAway === "home" ? "HOME" : "AWAY"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {isLocked && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, fontFamily: mono, color: game.result === "W" ? C.green : C.danger, background: game.result === "W" ? C.greenBg : C.dangerBg }}>
                  {game.result === "W" ? "WIN" : "LOSS"}
                </span>
              )}
              {park && (
                <button onClick={() => openDir(game.park)} style={{
                  background: C.orangeBg, border: `1px solid ${C.orange}35`, borderRadius: 6,
                  padding: "4px 10px", color: C.orange, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  fontFamily: mono, display: "flex", alignItems: "center", gap: 4,
                }}>📍</button>
              )}
            </div>
          </div>

          {/* Scoreboard */}
          <div style={{ padding: "8px 14px 12px" }}>
            {/* Orioles score row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: C.black, fontFamily: mono }}>O</div>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.orange, fontFamily: mono }}>Orioles</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ScoreBtn onClick={() => onUpdateScore(game.id, "ori", -1)} disabled={isLocked || oriScore <= 0}>−</ScoreBtn>
                <div style={{ width: 48, textAlign: "center", fontSize: 28, fontWeight: 900, color: C.orange, fontFamily: mono, lineHeight: 1 }}>{oriScore}</div>
                <ScoreBtn onClick={() => onUpdateScore(game.id, "ori", 1)} disabled={isLocked}>+</ScoreBtn>
              </div>
            </div>

            {/* vs divider */}
            <div style={{ textAlign: "center", fontSize: 10, color: C.dim, fontFamily: mono, margin: "2px 0" }}>vs</div>

            {/* Opponent score row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.dim, fontFamily: mono }}>{game.opponent.charAt(0)}</div>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: mono }}>{game.opponent}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ScoreBtn onClick={() => onUpdateScore(game.id, "opp", -1)} disabled={isLocked || oppScore <= 0}>−</ScoreBtn>
                <div style={{ width: 48, textAlign: "center", fontSize: 28, fontWeight: 900, color: C.text, fontFamily: mono, lineHeight: 1 }}>{oppScore}</div>
                <ScoreBtn onClick={() => onUpdateScore(game.id, "opp", 1)} disabled={isLocked}>+</ScoreBtn>
              </div>
            </div>
          </div>

          {/* Inning tracker + scoreboard icon */}
          <div style={{ padding: "0 14px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((inn) => (
                <button key={inn} onClick={() => !isLocked && onUpdateInning(game.id, inning === inn ? 0 : inn)} disabled={isLocked} style={{
                  width: 28, height: 28, borderRadius: 6, fontFamily: mono, fontSize: 11, fontWeight: 700,
                  cursor: isLocked ? "default" : "pointer", padding: 0,
                  border: `1.5px solid ${inning === inn ? C.orange : C.border}`,
                  background: inning === inn ? C.orange : "transparent",
                  color: inning === inn ? C.black : (isLocked ? C.border : C.dim),
                  opacity: isLocked && inning !== inn ? 0.3 : 1,
                  WebkitTapHighlightColor: "transparent", flexShrink: 0,
                }}>{inn}</button>
              ))}
              {/* Scoreboard icon */}
              <button onClick={() => setShowResult(true)} style={{
                width: 34, height: 28, borderRadius: 6, marginLeft: 2, padding: 0, flexShrink: 0,
                border: `1.5px solid ${isLocked ? (game.result === "W" ? C.green : C.danger) : C.orange}60`,
                background: isLocked ? (game.result === "W" ? C.greenBg : C.dangerBg) : C.orangeBg,
                color: isLocked ? (game.result === "W" ? C.green : C.danger) : C.orange,
                fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                WebkitTapHighlightColor: "transparent",
              }}>📋</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "0 14px 80px" }}>
        {active.map((p) => {
          const pABs = gABs.filter((ab) => ab.playerId === p.id);
          const st = calcStats(pABs);
          const isOpen = expanded === p.id;
          return (
            <div key={p.id} style={{ background: C.card, borderRadius: 10, marginBottom: 6, border: `1px solid ${isOpen ? C.orange + "60" : C.border}`, overflow: "hidden" }}>
              <div onClick={() => setExpanded(isOpen ? null : p.id)} style={{ display: "flex", alignItems: "center", padding: "10px 12px", cursor: "pointer", gap: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.orangeBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: C.orange, fontFamily: mono, flexShrink: 0, border: `1.5px solid ${C.orange}40` }}>{p.order + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: sans, display: "flex", alignItems: "center", gap: 5 }}>
                    {p.name}
                    {p.number && <span style={{ fontSize: 10, fontWeight: 700, color: C.orange, fontFamily: mono, opacity: 0.6 }}>#{p.number}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                    {pABs.map((ab, i) => { const o = getO(ab.result); return <span key={i} style={{ fontSize: 9, fontWeight: 700, color: o.color, background: `${o.color}15`, padding: "1px 5px", borderRadius: 3, fontFamily: mono }}>{ab.result}</span>; })}
                    {pABs.length === 0 && <span style={{ fontSize: 10, color: C.dim, fontFamily: mono }}>Due up</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, fontFamily: mono, color: st.hits > 0 ? C.orange : C.dim }}>{st.hits}-{st.atbats}</div>
                </div>
                <span style={{ fontSize: 12, color: C.dim, transform: isOpen ? "rotate(180deg)" : "", transition: "transform 0.2s" }}>▾</span>
              </div>
              {isOpen && (
                <div style={{ padding: "0 10px 10px", borderTop: `1px solid ${C.border}` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 5, padding: "10px 0" }}>
                    {OUTCOMES.map((o) => (
                      <button key={o.code} onClick={() => onLog(p.id, o.code)} style={{
                        background: `${o.color}12`, border: `1px solid ${o.color}30`, borderRadius: 8,
                        padding: "12px 2px", cursor: "pointer", display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 2, WebkitTapHighlightColor: "transparent",
                      }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: o.color, fontFamily: mono }}>{o.code}</span>
                        <span style={{ fontSize: 7, color: C.dim, fontWeight: 700, fontFamily: mono }}>{o.label}</span>
                      </button>
                    ))}
                  </div>
                  {pABs.length > 0 && (
                    <button onClick={() => onLog(p.id, "__UNDO__")} style={{
                      width: "100%", padding: 8, background: C.dangerBg, border: `1px solid ${C.danger}30`,
                      borderRadius: 8, color: C.danger, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: mono,
                    }}>↩ Undo Last</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {active.length === 0 && <div style={{ textAlign: "center", padding: 40, color: C.dim, fontFamily: mono, fontSize: 12 }}>No players yet. Go to Lineup to add your team.</div>}
      </div>
    </div>
  );
}

// ── Stats View ──
function StatsView({ roster, atBats, schedule }) {
  const [mode, setMode] = useState("season");
  const [selGame, setSelGame] = useState("");
  const filtered = mode === "season" ? atBats : atBats.filter((ab) => ab.gameId === selGame);
  const team = calcStats(filtered);
  const players = roster.map((p) => {
    const pABs = filtered.filter((ab) => ab.playerId === p.id);
    if (pABs.length === 0) return null;
    return { ...p, st: calcStats(pABs) };
  }).filter(Boolean).sort((a, b) => b.st.avg - a.st.avg);

  return (
    <div>
      <div style={{ padding: "10px 14px 8px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <button onClick={() => setMode("season")} style={{ flex: 1, padding: 8, background: mode === "season" ? C.orange : C.card, color: mode === "season" ? C.black : C.dim, border: `1px solid ${mode === "season" ? C.orange : C.border}`, borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: mono }}>Season</button>
          <select value={selGame} onChange={(e) => { setMode("game"); setSelGame(e.target.value); }} style={{ flex: 1.3, padding: 8, background: mode === "game" ? C.orange : C.card, color: mode === "game" ? C.black : C.dim, border: `1px solid ${mode === "game" ? C.orange : C.border}`, borderRadius: 6, fontWeight: 700, fontSize: 12, fontFamily: mono }}>
            <option value="" disabled>By game...</option>
            {schedule.map((g) => { const dt = new Date(g.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }); return <option key={g.id} value={g.id}>G{g.game} {dt} vs {g.opponent}</option>; })}
          </select>
        </div>
        <div style={{ background: C.card, borderRadius: 10, padding: 12, marginBottom: 10, border: `1px solid ${C.orange}25`, display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
          {[["AVG", f3(team.avg), C.orange], ["OBP", f3(team.obp), C.orangeBright], ["SLG", f3(team.slg), "#fbbf24"], ["OPS", f3(team.ops), team.ops >= .8 ? C.orange : C.text], ["H", team.hits], ["HR", team.hr, C.orange], ["BB", team.bb, "#fbbf24"], ["K", team.k, C.dim]].map(([l, v, c]) => (
            <div key={l} style={{ background: C.bg, borderRadius: 6, padding: "6px 8px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: 42 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: c || C.text, fontFamily: mono }}>{v}</span>
              <span style={{ fontSize: 8, color: C.dim, fontWeight: 700, fontFamily: mono }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 30px 30px 30px 40px 40px 40px", padding: "7px 10px", borderBottom: `1px solid ${C.orange}30`, background: C.orangeBg, gap: 2 }}>
            {["", "AB", "H", "HR", "AVG", "OBP", "OPS"].map((h) => <span key={h} style={{ fontSize: 8, fontWeight: 700, color: C.orange, fontFamily: mono, textAlign: h ? "center" : "left" }}>{h}</span>)}
          </div>
          {players.map((p, i) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 30px 30px 30px 40px 40px 40px", padding: "8px 10px", borderBottom: i < players.length - 1 ? `1px solid ${C.border}` : "none", background: i % 2 ? C.bg + "80" : "transparent", gap: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: sans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              {[p.st.atbats, p.st.hits, p.st.hr].map((v, j) => <span key={j} style={{ fontSize: 11, fontWeight: 600, textAlign: "center", color: C.text, fontFamily: mono }}>{v}</span>)}
              {[[f3(p.st.avg), p.st.avg >= .3 ? C.orange : C.text], [f3(p.st.obp), p.st.obp >= .4 ? C.orangeBright : C.text], [f3(p.st.ops), p.st.ops >= .8 ? "#fbbf24" : C.text]].map(([v, c], j) => <span key={j + 3} style={{ fontSize: 11, fontWeight: 600, textAlign: "center", color: c, fontFamily: mono }}>{v}</span>)}
            </div>
          ))}
          {players.length === 0 && <div style={{ padding: 24, textAlign: "center", color: C.dim, fontSize: 12, fontFamily: mono }}>No stats yet.</div>}
        </div>
      </div>
    </div>
  );
}

// ── Schedule View ──
function ScheduleView({ schedule, onUpdateGame }) {
  const [editing, setEditing] = useState(null);
  const today = new Date().toISOString().split("T")[0];
  return (
    <div>
      <div style={{ padding: "10px 14px 8px" }}><p style={{ margin: 0, fontSize: 11, color: C.dim, fontFamily: mono }}>Tap ✏️ to reschedule any game</p></div>
      <div style={{ padding: "0 14px 80px" }}>
        {schedule.map((g) => {
          const d = new Date(g.date + "T12:00:00"); const isPast = g.date < today; const isToday = g.date === today; const park = PARKS[g.park]; const ed = editing === g.id;
          const score = formatScore(g);
          return (
            <div key={g.id} style={{ background: C.card, borderRadius: 10, marginBottom: 6, border: `1px solid ${isToday ? C.orange + "80" : ed ? C.orange + "50" : C.border}`, opacity: isPast && !g.result ? 0.4 : 1, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 10 }}>
                <div style={{ width: 40, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, background: C.orangeBg, borderRadius: 6, padding: "4px 0" }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: C.orange, fontFamily: mono }}>{d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: mono, lineHeight: 1.1 }}>{d.getDate()}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, color: C.dim, fontFamily: mono }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: sans }}>{g.homeAway === "home" ? "vs" : "@"} {g.opponent}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 3, fontFamily: mono, color: g.homeAway === "home" ? C.orange : "#60a5fa", background: g.homeAway === "home" ? C.orangeBg : "#0d1a2e" }}>{g.homeAway === "home" ? "HOME" : "AWAY"}</span>
                    {g.result && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 3, fontFamily: mono, color: g.result === "W" ? C.green : C.danger, background: g.result === "W" ? C.greenBg : C.dangerBg }}>
                        {g.result}{score ? ` ${score}` : ""}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: C.dim, fontFamily: mono }}>{g.time} · {park?.name || g.park}</div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {park && <button onClick={() => openDir(g.park)} style={{ background: C.orangeBg, border: `1px solid ${C.orange}30`, borderRadius: 6, padding: "6px 8px", color: C.orange, fontSize: 13, cursor: "pointer" }}>📍</button>}
                  <button onClick={() => setEditing(ed ? null : g.id)} style={{ background: ed ? C.orange : `${C.orange}15`, border: `1px solid ${C.orange}30`, borderRadius: 6, padding: "6px 8px", color: ed ? C.black : C.orange, fontSize: 13, cursor: "pointer" }}>✏️</button>
                </div>
              </div>
              {ed && (
                <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${C.orange}25` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 10 }}>
                    <div><label style={{ fontSize: 9, color: C.orange, fontFamily: mono, fontWeight: 700 }}>DATE</label><input type="date" value={g.date} onChange={(e) => onUpdateGame(g.id, { date: e.target.value })} style={inputStyle()} /></div>
                    <div><label style={{ fontSize: 9, color: C.orange, fontFamily: mono, fontWeight: 700 }}>TIME</label><input type="text" value={g.time} onChange={(e) => onUpdateGame(g.id, { time: e.target.value })} style={inputStyle()} /></div>
                    <div><label style={{ fontSize: 9, color: C.orange, fontFamily: mono, fontWeight: 700 }}>OPPONENT</label><select value={g.opponent} onChange={(e) => onUpdateGame(g.id, { opponent: e.target.value })} style={inputStyle()}>{["Angels", "Cubs", "Twins", "Tigers", "Athletics"].map((t) => <option key={t}>{t}</option>)}</select></div>
                    <div><label style={{ fontSize: 9, color: C.orange, fontFamily: mono, fontWeight: 700 }}>PARK</label><select value={g.park} onChange={(e) => onUpdateGame(g.id, { park: e.target.value })} style={inputStyle()}>{Object.keys(PARKS).map((k) => <option key={k} value={k}>{PARKS[k].name}</option>)}</select></div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 9, color: C.orange, fontFamily: mono, fontWeight: 700 }}>HOME / AWAY</label>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      {["home", "away"].map((ha) => <button key={ha} onClick={() => onUpdateGame(g.id, { homeAway: ha })} style={{ flex: 1, padding: 7, borderRadius: 6, fontFamily: mono, fontSize: 11, fontWeight: 700, cursor: "pointer", border: `1px solid ${C.orange}40`, background: g.homeAway === ha ? C.orange : C.bg, color: g.homeAway === ha ? C.black : C.dim }}>{ha.toUpperCase()}</button>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Roster View ──
function RosterView({ roster, onAddPlayer, onUpdatePlayer, onReorder, onSoftRemove, onRestore }) {
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);
  const active = roster.filter((p) => p.active && !p.removed).sort((a, b) => a.order - b.order);
  const inactive = roster.filter((p) => !p.active && !p.removed);
  const removed = roster.filter((p) => p.removed);

  const addPlayer = () => {
    const name = newName.trim();
    if (!name) return;
    onAddPlayer(name, newNumber.trim());
    setNewName(""); setNewNumber("");
  };

  const saveEdit = (id) => {
    const name = editName.trim();
    if (!name) return;
    onUpdatePlayer(id, { name, number: editNumber.trim() });
    setEditingId(null);
  };

  const PlayerRow = ({ p, i, isActive, isRemoved }) => (
    <div style={{ background: C.card, borderRadius: 8, marginBottom: 4, border: `1px solid ${C.border}`, overflow: "hidden", opacity: isRemoved ? 0.35 : isActive ? 1 : 0.4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px" }}>
        {isActive && (
          <>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button onClick={() => i > 0 && onReorder(i, i - 1)} disabled={i === 0} style={{ background: "none", border: "none", color: i === 0 ? C.border : C.orange, cursor: i === 0 ? "default" : "pointer", fontSize: 10, padding: 0, lineHeight: 1 }}>▲</button>
              <button onClick={() => i < active.length - 1 && onReorder(i, i + 1)} disabled={i === active.length - 1} style={{ background: "none", border: "none", color: i === active.length - 1 ? C.border : C.orange, cursor: i === active.length - 1 ? "default" : "pointer", fontSize: 10, padding: 0, lineHeight: 1 }}>▼</button>
            </div>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: C.black, fontFamily: mono, flexShrink: 0 }}>{i + 1}</div>
          </>
        )}
        {editingId === p.id ? (
          <div style={{ flex: 1, display: "flex", gap: 4, alignItems: "center" }}>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveEdit(p.id)} autoFocus placeholder="Name" style={{ flex: 1, background: C.bg, border: `1px solid ${C.orange}50`, borderRadius: 4, color: C.text, padding: "4px 8px", fontSize: 13, fontFamily: sans, boxSizing: "border-box" }} />
            <input type="text" value={editNumber} onChange={(e) => setEditNumber(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveEdit(p.id)} placeholder="#" style={{ width: 40, background: C.bg, border: `1px solid ${C.orange}50`, borderRadius: 4, color: C.orange, padding: "4px 6px", fontSize: 13, fontFamily: mono, textAlign: "center", boxSizing: "border-box" }} />
            <button onClick={() => saveEdit(p.id)} style={{ background: C.orange, border: "none", borderRadius: 4, padding: "4px 8px", color: C.black, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: mono }}>SAVE</button>
            <button onClick={() => setEditingId(null)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 8px", color: C.dim, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: mono }}>✕</button>
          </div>
        ) : (
          <span onClick={() => { setEditingId(p.id); setEditName(p.name); setEditNumber(p.number || ""); }} style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text, fontFamily: sans, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            {p.name}
            {p.number && <span style={{ fontSize: 12, fontWeight: 700, color: C.orange, fontFamily: mono, opacity: 0.6 }}>#{p.number}</span>}
          </span>
        )}
        {!isRemoved && editingId !== p.id && (
          <>
            {isActive ? (
              <button onClick={() => onUpdatePlayer(p.id, { active: false })} style={{ background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: 6, padding: "4px 8px", color: C.danger, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: mono }}>OUT</button>
            ) : (
              <button onClick={() => onUpdatePlayer(p.id, { active: true })} style={{ background: C.orangeBg, border: `1px solid ${C.orange}30`, borderRadius: 6, padding: "4px 10px", color: C.orange, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: mono }}>ADD IN</button>
            )}
            <button onClick={() => setConfirmRemove(confirmRemove === p.id ? null : p.id)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 6px", color: C.dim, fontSize: 11, cursor: "pointer" }}>🗑</button>
          </>
        )}
        {isRemoved && editingId !== p.id && <button onClick={() => onRestore(p.id)} style={{ background: C.orangeBg, border: `1px solid ${C.orange}30`, borderRadius: 6, padding: "4px 10px", color: C.orange, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: mono }}>RESTORE</button>}
      </div>
      {confirmRemove === p.id && (
        <div style={{ padding: "8px 10px", borderTop: `1px solid ${C.danger}30`, background: C.dangerBg, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: C.danger, fontFamily: mono, fontWeight: 600 }}>Remove from roster? Stats are kept.</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => { onSoftRemove(p.id); setConfirmRemove(null); }} style={{ background: C.danger, border: "none", borderRadius: 4, padding: "4px 12px", color: C.white, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: mono }}>YES</button>
            <button onClick={() => setConfirmRemove(null)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 10px", color: C.dim, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: mono }}>NO</button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{ padding: "10px 14px 8px" }}><p style={{ margin: 0, fontSize: 11, color: C.dim, fontFamily: mono }}>Add, remove, or reorder players</p></div>
      <div style={{ padding: "0 14px 80px" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, background: C.card, borderRadius: 8, padding: "8px 10px", border: `1px solid ${C.orange}30` }}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPlayer()} placeholder="Player name..." style={{ flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.text, padding: "8px 10px", fontSize: 13, fontFamily: sans, boxSizing: "border-box" }} />
          <input type="text" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPlayer()} placeholder="#" style={{ width: 44, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, color: C.orange, padding: "8px 6px", fontSize: 13, fontFamily: mono, textAlign: "center", boxSizing: "border-box" }} />
          <button onClick={addPlayer} style={{ background: C.orange, border: "none", borderRadius: 6, padding: "8px 14px", color: C.black, fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: mono, opacity: newName.trim() ? 1 : 0.4 }}>+ ADD</button>
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.orange, marginBottom: 6, fontFamily: mono }}>ACTIVE ({active.length})</div>
        {active.map((p, i) => <PlayerRow key={p.id} p={p} i={i} isActive={true} isRemoved={false} />)}
        {inactive.length > 0 && (<><div style={{ fontSize: 10, fontWeight: 700, color: C.dim, margin: "14px 0 6px", fontFamily: mono }}>NOT PLAYING ({inactive.length})</div>{inactive.map((p) => <PlayerRow key={p.id} p={p} i={null} isActive={false} isRemoved={false} />)}</>)}
        {removed.length > 0 && (<><div style={{ fontSize: 10, fontWeight: 700, color: C.dim, margin: "14px 0 6px", fontFamily: mono }}>REMOVED ({removed.length})</div><div style={{ fontSize: 9, color: C.dim, fontFamily: mono, marginBottom: 6 }}>Stats preserved. Tap RESTORE to bring back.</div>{removed.map((p) => <PlayerRow key={p.id} p={p} i={null} isActive={false} isRemoved={true} />)}</>)}
      </div>
    </div>
  );
}

// ── Install Banner ──
function InstallBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  if (isStandalone || dismissed) return null;
  const handleInstall = async () => { if (deferredPrompt) { deferredPrompt.prompt(); const r = await deferredPrompt.userChoice; if (r.outcome === "accepted") setDismissed(true); setDeferredPrompt(null); } };
  return (
    <div style={{ margin: "8px 14px", padding: "12px 14px", background: C.card, borderRadius: 10, border: `1px solid ${C.orange}40`, position: "relative" }}>
      <button onClick={() => setDismissed(true)} style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: C.dim, fontSize: 16, cursor: "pointer", padding: 0, lineHeight: 1 }}>✕</button>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, fontFamily: mono, marginBottom: 6 }}>📲 Install This App</div>
      {deferredPrompt ? (
        <div>
          <div style={{ fontSize: 11, color: C.dim, fontFamily: mono, lineHeight: 1.5, marginBottom: 8 }}>Add Orioles Tracker to your home screen for the full app experience.</div>
          <button onClick={handleInstall} style={{ width: "100%", padding: 10, background: C.orange, color: C.black, border: "none", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: mono }}>Install App</button>
        </div>
      ) : isIOS ? (
        <div style={{ fontSize: 11, color: C.dim, fontFamily: mono, lineHeight: 1.6 }}>
          <div style={{ marginBottom: 4 }}>To install on your iPhone:</div>
          <div>1. Tap the <span style={{ color: C.text, fontWeight: 700 }}>⋯ three dots</span> next to the address bar</div>
          <div>2. Tap <span style={{ color: C.text, fontWeight: 700 }}>Share</span></div>
          <div>3. Tap <span style={{ color: C.text, fontWeight: 700 }}>Add to Home Screen</span></div>
          <div>4. Make sure "Open as Web App" is <span style={{ color: C.orange, fontWeight: 700 }}>ON</span></div>
          <div>5. Tap <span style={{ color: C.text, fontWeight: 700 }}>Add</span></div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: C.dim, fontFamily: mono, lineHeight: 1.6 }}>
          <div style={{ marginBottom: 4 }}>To install on your phone:</div>
          <div>1. Tap the <span style={{ color: C.text, fontWeight: 700 }}>⋮ three dots</span> menu (top right)</div>
          <div>2. Tap <span style={{ color: C.text, fontWeight: 700 }}>Add to Home Screen</span> or <span style={{ color: C.text, fontWeight: 700 }}>Install App</span></div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
// Main App
// ══════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("game");
  const [roster, setRoster] = useState([]);
  const [atBats, setAtBats] = useState([]);
  const [schedule, setSchedule] = useState(FALLBACK_SCHEDULE);
  const [gameId, setGameId] = useState(FALLBACK_SCHEDULE[0].id);
  const [toast, setToast] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [connected, setConnected] = useState(!!SCRIPT_URL);
  const [currentUser, setCurrentUser] = useState(getUserIdentity);
  const [showSetup, setShowSetup] = useState(!getUserIdentity());
  const hasAutoAdded = useRef(false);
  const hasSynced = useRef(false);

  const showToast = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 1800); };

  // ── Load data from sheet ──
  const loadData = useCallback(async () => {
    if (!SCRIPT_URL) return;
    setSyncing(true);
    const data = await fetchAll();
    if (data) {
      if (data.roster && data.roster.length > 0) setRoster(data.roster);
      if (data.atBats) setAtBats(data.atBats);
      if (data.schedule && data.schedule.length > 0) {
        // Merge score fields from sheet data
        setSchedule(data.schedule.map((g) => ({
          ...g,
          orilesScore: g.orilesScore ?? null,
          opponentScore: g.opponentScore ?? null,
          inning: g.inning ?? 0,
        })));
      }
      setLastSync(new Date().toLocaleTimeString());
      setConnected(true);
      hasSynced.current = true;
    }
    setSyncing(false);
  }, []);

  useEffect(() => {
    loadData();
    if (SCRIPT_URL) {
      const interval = setInterval(loadData, 15000);
      return () => clearInterval(interval);
    }
  }, [loadData]);

  // ── User setup just saves identity, defers roster add ──
  const handleUserSetup = (user) => {
    setCurrentUser(user);
    setShowSetup(false);
  };

  // ── Auto-add user to roster after first sync completes ──
  useEffect(() => {
    if (hasAutoAdded.current || !currentUser || !hasSynced.current) return;
    const displayName = currentUser.displayName;
    const alreadyOnRoster = roster.some((p) => p.name === displayName);
    if (!alreadyOnRoster) {
      hasAutoAdded.current = true;
      const maxOrder = Math.max(...roster.filter((p) => p.active && !p.removed).map((p) => p.order), -1);
      const newPlayer = {
        id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        name: displayName,
        number: currentUser.jersey || "",
        order: maxOrder + 1,
        active: true,
        removed: false,
      };
      setRoster((prev) => [...prev, newPlayer]);
      postToSheet({ action: "addPlayer", ...newPlayer });
      showToast(`${displayName} added to roster!`, C.orange);
    } else {
      hasAutoAdded.current = true;
    }
  }, [roster, currentUser]);

  // ── Action handlers ──
  const logAtBat = (playerId, result) => {
    if (result === "__UNDO__") {
      setAtBats((prev) => {
        const pABs = prev.filter((ab) => ab.playerId === playerId && ab.gameId === gameId);
        if (!pABs.length) return prev;
        const last = pABs[pABs.length - 1];
        showToast(`Removed ${last.result}`, C.danger);
        postToSheet({ action: "removeAtBat", id: last.id });
        return prev.filter((ab) => ab.id !== last.id);
      });
      return;
    }
    const player = roster.find((p) => p.id === playerId);
    const o = getO(result);
    const newAB = { id: `ab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, playerId, gameId, result };
    setAtBats((prev) => [...prev, newAB]);
    postToSheet({ action: "addAtBat", ...newAB });
    showToast(`${player?.name}: ${o.label}`, o.color);
  };

  const handleAddPlayer = (name, number) => {
    const maxOrder = Math.max(...roster.filter((p) => p.active && !p.removed).map((p) => p.order), -1);
    const newPlayer = { id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, name, number: number || "", order: maxOrder + 1, active: true, removed: false };
    setRoster((prev) => [...prev, newPlayer]);
    postToSheet({ action: "addPlayer", ...newPlayer });
  };

  const handleUpdatePlayer = (id, updates) => {
    setRoster((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        const newP = { ...p, ...updates };
        if (updates.active === true && !p.active) {
          const mx = Math.max(...prev.filter((x) => x.active && !x.removed && x.id !== id).map((x) => x.order), -1);
          newP.order = mx + 1;
        }
        return newP;
      });
      updated.filter((p) => p.active && !p.removed).sort((a, b) => a.order - b.order).forEach((p, i) => { p.order = i; });
      return [...updated];
    });
    postToSheet({ action: "updatePlayer", id, ...updates });
  };

  const handleReorder = (from, to) => {
    setRoster((prev) => {
      const act = prev.filter((p) => p.active && !p.removed).sort((a, b) => a.order - b.order);
      const [m] = act.splice(from, 1);
      act.splice(to, 0, m);
      act.forEach((p, i) => { p.order = i; });
      postToSheet({ action: "updateRosterOrder", players: act.map((p) => ({ id: p.id, order: p.order, active: p.active, removed: p.removed })) });
      return [...prev.filter((p) => !p.active || p.removed), ...act];
    });
  };

  const handleSoftRemove = (id) => {
    handleUpdatePlayer(id, { removed: true, active: false });
  };

  const handleRestore = (id) => {
    const mx = Math.max(...roster.filter((x) => x.active && !x.removed).map((x) => x.order), -1);
    handleUpdatePlayer(id, { removed: false, active: true, order: mx + 1 });
  };

  // ── Score +/- buttons ──
  const handleUpdateScore = (gId, team, delta) => {
    setSchedule((s) => s.map((g) => {
      if (g.id !== gId) return g;
      if (team === "ori") {
        const newScore = Math.max(0, (g.orilesScore ?? 0) + delta);
        postToSheet({ action: "updateGame", id: gId, orilesScore: newScore });
        return { ...g, orilesScore: newScore };
      } else {
        const newScore = Math.max(0, (g.opponentScore ?? 0) + delta);
        postToSheet({ action: "updateGame", id: gId, opponentScore: newScore });
        return { ...g, opponentScore: newScore };
      }
    }));
  };

  // ── Inning selector ──
  const handleUpdateInning = (gId, inning) => {
    setSchedule((s) => s.map((g) => g.id === gId ? { ...g, inning } : g));
    postToSheet({ action: "updateGame", id: gId, inning });
  };

  // ── W/L toggle (locks/unlocks score) ──
  const handleGameResult = (gId, result, oriScore, oppScore) => {
    if (result === null) {
      // Unlocking: clear result but keep scores editable
      setSchedule((s) => s.map((g) => g.id === gId ? { ...g, result: "" } : g));
      postToSheet({ action: "updateGame", id: gId, result: "" });
      showToast("Unlocked", C.dim);
      return;
    }
    // Locking: save result with current scores
    const updates = { result, orilesScore: oriScore, opponentScore: oppScore };
    setSchedule((s) => s.map((g) => g.id === gId ? { ...g, ...updates } : g));
    postToSheet({ action: "updateGame", id: gId, ...updates });
    showToast(`${result} ${oriScore}-${oppScore}`, result === "W" ? C.green : C.danger);
  };

  const handleUpdateGame = (gId, updates) => {
    setSchedule((s) => s.map((g) => g.id === gId ? { ...g, ...updates } : g));
    postToSheet({ action: "updateGame", id: gId, ...updates });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, maxWidth: 480, margin: "0 auto", paddingBottom: 60 }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.8); }
        input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        select option { background: ${C.card}; color: ${C.text}; }
      `}</style>

      {showSetup && <UserSetupModal onComplete={handleUserSetup} />}

      {toast && (
        <div style={{ position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)", background: C.card, border: `2px solid ${toast.color}`, borderRadius: 10, padding: "8px 18px", zIndex: 200, boxShadow: `0 4px 20px ${toast.color}25`, animation: "toastIn 0.15s ease-out" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: toast.color, fontFamily: mono }}>{toast.msg}</span>
        </div>
      )}

      <AppHeader schedule={schedule} currentUser={currentUser} />
      <InstallBanner />

      {!SCRIPT_URL && (
        <div style={{ margin: "8px 14px", padding: "10px 14px", background: C.orangeBg, borderRadius: 8, border: `1px solid ${C.orange}30` }}>
          <div style={{ fontSize: 11, color: C.orange, fontFamily: mono, fontWeight: 700 }}>⚠ Not connected to Google Sheets</div>
          <div style={{ fontSize: 10, color: C.dim, fontFamily: mono, marginTop: 4 }}>Data won't sync. Add your Apps Script URL to the code.</div>
        </div>
      )}

      {syncing && <div style={{ textAlign: "center", padding: "4px", fontSize: 10, color: C.dim, fontFamily: mono }}>Syncing...</div>}

      {tab === "game" && <GameView roster={roster} atBats={atBats} schedule={schedule} gameId={gameId} setGameId={setGameId} onLog={logAtBat} onGameResult={handleGameResult} onUpdateScore={handleUpdateScore} onUpdateInning={handleUpdateInning} />}
      {tab === "stats" && <StatsView roster={roster} atBats={atBats} schedule={schedule} />}
      {tab === "schedule" && <ScheduleView schedule={schedule} onUpdateGame={handleUpdateGame} />}
      {tab === "roster" && <RosterView roster={roster} onAddPlayer={handleAddPlayer} onUpdatePlayer={handleUpdatePlayer} onReorder={handleReorder} onSoftRemove={handleSoftRemove} onRestore={handleRestore} />}

      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}

