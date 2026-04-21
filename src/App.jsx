import { useState } from "react";

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

// ── 2026 Orioles Schedule ──
const INITIAL_SCHEDULE = [
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

const DEMO_ROSTER = [
  { id: "1", name: "Sam R.", order: 0, active: true },
  { id: "2", name: "Player 2", order: 1, active: true },
  { id: "3", name: "Player 3", order: 2, active: true },
  { id: "4", name: "Player 4", order: 3, active: true },
  { id: "5", name: "Player 5", order: 4, active: true },
  { id: "6", name: "Player 6", order: 5, active: true },
  { id: "7", name: "Player 7", order: 6, active: true },
  { id: "8", name: "Player 8", order: 7, active: true },
  { id: "9", name: "Player 9", order: 8, active: true },
  { id: "10", name: "Player 10", order: 9, active: true },
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
  { code: "GO", label: "GO", color: "#78716c", isHit: false, isAB: true },
  { code: "FO", label: "FO", color: "#9ca3af", isHit: false, isAB: true },
  { code: "SAC", label: "SAC", color: "#d4d4d8", isHit: false, isAB: false },
  { code: "FC", label: "FC", color: "#a1a1aa", isHit: false, isAB: true },
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

// ── Orioles Orange & Black Theme ──
const C = {
  bg: "#0d0d0d",
  card: "#1a1a1a",
  cardAlt: "#222222",
  border: "#2e2e2e",
  text: "#f5f5f5",
  dim: "#888888",
  orange: "#f97316",        // Primary Orioles orange
  orangeBright: "#fb923c",
  orangeDim: "#7c2d12",     // Dark orange for backgrounds
  orangeBg: "#1f1208",      // Very dark orange tint
  black: "#0d0d0d",
  white: "#f5f5f5",
  danger: "#ef4444",
  dangerBg: "#3b1111",
  accent: "#f97316",        // Orange is the accent
  accentBg: "#1f1208",
};
const mono = "'IBM Plex Mono', monospace";
const sans = "'IBM Plex Sans', system-ui, sans-serif";

function inputStyle() {
  return {
    width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
    color: C.text, padding: "7px 8px", fontSize: 12, fontFamily: mono, boxSizing: "border-box", marginTop: 2,
  };
}

// ── Header ──
function AppHeader() {
  return (
    <div style={{
      padding: "14px 16px 10px", background: `linear-gradient(135deg, ${C.orangeDim} 0%, ${C.bg} 100%)`,
      borderBottom: `2px solid ${C.orange}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", background: C.orange,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 900, color: C.black, fontFamily: mono,
          boxShadow: `0 0 12px ${C.orange}40`,
        }}>O</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.orange, fontFamily: mono, letterSpacing: "1px" }}>
            ORIOLES
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: C.dim, fontFamily: mono, letterSpacing: "0.5px" }}>
            SUMMER 2026
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab Bar ──
function TabBar({ tab, setTab }) {
  const tabs = [
    { id: "game", icon: "⚾", label: "Game" }, { id: "stats", icon: "📊", label: "Stats" },
    { id: "schedule", icon: "📅", label: "Schedule" }, { id: "roster", icon: "👥", label: "Lineup" },
    { id: "setup", icon: "⚙", label: "Setup" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: C.card, borderTop: `2px solid ${C.orange}40`,
      display: "flex", padding: "4px 0 env(safe-area-inset-bottom, 6px)",
    }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          background: "none", border: "none", padding: "5px 0", cursor: "pointer",
          color: tab === t.id ? C.orange : C.dim, fontSize: 9, fontWeight: 700, fontFamily: mono,
          transition: "color 0.15s",
        }}>
          <span style={{ fontSize: 16 }}>{t.icon}</span>{t.label}
        </button>
      ))}
    </div>
  );
}

// ── Game View ──
function GameView({ roster, atBats, schedule, gameId, setGameId, onLog }) {
  const [expanded, setExpanded] = useState(null);
  const game = schedule.find((g) => g.id === gameId);
  const active = roster.filter((p) => p.active).sort((a, b) => a.order - b.order);
  const gABs = atBats.filter((ab) => ab.gameId === gameId);
  const park = game ? PARKS[game.park] : null;

  return (
    <div>
      <div style={{ padding: "10px 14px 0" }}>
        <select value={gameId} onChange={(e) => setGameId(e.target.value)} style={{
          width: "100%", background: C.card, border: `1px solid ${C.orange}40`, borderRadius: 8,
          color: C.text, padding: "10px 12px", fontSize: 13, fontFamily: mono, fontWeight: 700, marginBottom: 8,
        }}>
          {schedule.map((g) => {
            const dt = new Date(g.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return <option key={g.id} value={g.id}>G{g.game}: {dt} {g.homeAway === "home" ? "vs" : "@"} {g.opponent}</option>;
          })}
        </select>
      </div>

      {game && (
        <div style={{
          margin: "0 14px 8px", padding: "12px 14px", background: C.card, borderRadius: 10,
          border: `1px solid ${C.orange}30`, boxShadow: `inset 0 1px 0 ${C.orange}15`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 17, fontWeight: 800, color: C.orange, fontFamily: mono }}>Orioles</span>
              <span style={{ fontSize: 13, color: C.dim, margin: "0 8px", fontFamily: mono }}>{game.homeAway === "home" ? "vs" : "@"}</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: C.text, fontFamily: mono }}>{game.opponent}</span>
            </div>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, fontFamily: mono,
              color: game.homeAway === "home" ? C.orange : "#60a5fa",
              background: game.homeAway === "home" ? C.orangeBg : "#0d1a2e",
            }}>{game.homeAway === "home" ? "HOME" : "AWAY"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: C.dim, fontFamily: mono }}>
              {new Date(game.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {game.time}
            </span>
            {park && (
              <button onClick={() => openDir(game.park)} style={{
                background: C.orangeBg, border: `1px solid ${C.orange}35`, borderRadius: 6,
                padding: "4px 10px", color: C.orange, fontSize: 11, fontWeight: 700, cursor: "pointer",
                fontFamily: mono, display: "flex", alignItems: "center", gap: 4,
              }}>📍 Directions</button>
            )}
          </div>
        </div>
      )}

      <div style={{ padding: "0 14px 80px" }}>
        {active.map((p) => {
          const pABs = gABs.filter((ab) => ab.playerId === p.id);
          const st = calcStats(pABs);
          const isOpen = expanded === p.id;
          return (
            <div key={p.id} style={{
              background: C.card, borderRadius: 10, marginBottom: 6,
              border: `1px solid ${isOpen ? C.orange + "60" : C.border}`, overflow: "hidden",
              transition: "border-color 0.2s",
            }}>
              <div onClick={() => setExpanded(isOpen ? null : p.id)} style={{
                display: "flex", alignItems: "center", padding: "10px 12px", cursor: "pointer", gap: 10,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", background: C.orangeBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: C.orange, fontFamily: mono, flexShrink: 0,
                  border: `1.5px solid ${C.orange}40`,
                }}>{p.order + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: sans }}>{p.name}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                    {pABs.map((ab, i) => {
                      const o = getO(ab.result);
                      return <span key={i} style={{
                        fontSize: 9, fontWeight: 700, color: o.color, background: `${o.color}15`,
                        padding: "1px 5px", borderRadius: 3, fontFamily: mono,
                      }}>{ab.result}</span>;
                    })}
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
          <button onClick={() => setMode("season")} style={{
            flex: 1, padding: 8, background: mode === "season" ? C.orange : C.card,
            color: mode === "season" ? C.black : C.dim, border: `1px solid ${mode === "season" ? C.orange : C.border}`,
            borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: mono,
          }}>Season</button>
          <select value={selGame} onChange={(e) => { setMode("game"); setSelGame(e.target.value); }} style={{
            flex: 1.3, padding: 8, background: mode === "game" ? C.orange : C.card,
            color: mode === "game" ? C.black : C.dim, border: `1px solid ${mode === "game" ? C.orange : C.border}`,
            borderRadius: 6, fontWeight: 700, fontSize: 12, fontFamily: mono,
          }}>
            <option value="" disabled>By game...</option>
            {schedule.map((g) => {
              const dt = new Date(g.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return <option key={g.id} value={g.id}>G{g.game} {dt} vs {g.opponent}</option>;
            })}
          </select>
        </div>

        {/* Team totals */}
        <div style={{
          background: C.card, borderRadius: 10, padding: 12, marginBottom: 10,
          border: `1px solid ${C.orange}25`, display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center",
        }}>
          {[["AVG", f3(team.avg), C.orange], ["OBP", f3(team.obp), C.orangeBright], ["SLG", f3(team.slg), "#fbbf24"],
            ["OPS", f3(team.ops), team.ops >= .8 ? C.orange : C.text], ["H", team.hits], ["HR", team.hr, C.orange],
            ["BB", team.bb, "#fbbf24"], ["K", team.k, C.dim],
          ].map(([l, v, c]) => (
            <div key={l} style={{
              background: C.bg, borderRadius: 6, padding: "6px 8px",
              display: "flex", flexDirection: "column", alignItems: "center", minWidth: 42,
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: c || C.text, fontFamily: mono }}>{v}</span>
              <span style={{ fontSize: 8, color: C.dim, fontWeight: 700, fontFamily: mono }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "minmax(0,1fr) 30px 30px 30px 40px 40px 40px",
            padding: "7px 10px", borderBottom: `1px solid ${C.orange}30`, background: C.orangeBg, gap: 2,
          }}>
            {["", "AB", "H", "HR", "AVG", "OBP", "OPS"].map((h) => (
              <span key={h} style={{ fontSize: 8, fontWeight: 700, color: C.orange, fontFamily: mono, textAlign: h ? "center" : "left" }}>{h}</span>
            ))}
          </div>
          {players.map((p, i) => (
            <div key={p.id} style={{
              display: "grid", gridTemplateColumns: "minmax(0,1fr) 30px 30px 30px 40px 40px 40px",
              padding: "8px 10px", borderBottom: i < players.length - 1 ? `1px solid ${C.border}` : "none",
              background: i % 2 ? C.bg + "80" : "transparent", gap: 2,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.text, fontFamily: sans, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              {[p.st.atbats, p.st.hits, p.st.hr].map((v, j) => (
                <span key={j} style={{ fontSize: 11, fontWeight: 600, textAlign: "center", color: C.text, fontFamily: mono }}>{v}</span>
              ))}
              {[[f3(p.st.avg), p.st.avg >= .3 ? C.orange : C.text],
                [f3(p.st.obp), p.st.obp >= .4 ? C.orangeBright : C.text],
                [f3(p.st.ops), p.st.ops >= .8 ? "#fbbf24" : C.text],
              ].map(([v, c], j) => (
                <span key={j + 3} style={{ fontSize: 11, fontWeight: 600, textAlign: "center", color: c, fontFamily: mono }}>{v}</span>
              ))}
            </div>
          ))}
          {players.length === 0 && <div style={{ padding: 24, textAlign: "center", color: C.dim, fontSize: 12, fontFamily: mono }}>No stats yet.</div>}
        </div>
      </div>
    </div>
  );
}

// ── Schedule View ──
function ScheduleView({ schedule, setSchedule }) {
  const [editing, setEditing] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div style={{ padding: "10px 14px 8px" }}>
        <p style={{ margin: 0, fontSize: 11, color: C.dim, fontFamily: mono }}>Tap ✏️ to reschedule any game</p>
      </div>
      <div style={{ padding: "0 14px 80px" }}>
        {schedule.map((g) => {
          const d = new Date(g.date + "T12:00:00");
          const isPast = g.date < today;
          const isToday = g.date === today;
          const park = PARKS[g.park];
          const ed = editing === g.id;

          return (
            <div key={g.id} style={{
              background: C.card, borderRadius: 10, marginBottom: 6,
              border: `1px solid ${isToday ? C.orange + "80" : ed ? C.orange + "50" : C.border}`,
              opacity: isPast ? 0.4 : 1, overflow: "hidden",
            }}>
              <div style={{ display: "flex", alignItems: "center", padding: "10px 12px", gap: 10 }}>
                <div style={{
                  width: 40, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0,
                  background: C.orangeBg, borderRadius: 6, padding: "4px 0",
                }}>
                  <span style={{ fontSize: 8, fontWeight: 700, color: C.orange, fontFamily: mono }}>{d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: mono, lineHeight: 1.1 }}>{d.getDate()}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, color: C.dim, fontFamily: mono }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text, fontFamily: sans }}>
                      {g.homeAway === "home" ? "vs" : "@"} {g.opponent}
                    </span>
                    <span style={{
                      fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 3, fontFamily: mono,
                      color: g.homeAway === "home" ? C.orange : "#60a5fa",
                      background: g.homeAway === "home" ? C.orangeBg : "#0d1a2e",
                    }}>{g.homeAway === "home" ? "HOME" : "AWAY"}</span>
                  </div>
                  <div style={{ fontSize: 10, color: C.dim, fontFamily: mono }}>
                    {g.time} · {park?.name || g.park}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  {park && <button onClick={() => openDir(g.park)} style={{
                    background: C.orangeBg, border: `1px solid ${C.orange}30`, borderRadius: 6,
                    padding: "6px 8px", color: C.orange, fontSize: 13, cursor: "pointer",
                  }}>📍</button>}
                  <button onClick={() => setEditing(ed ? null : g.id)} style={{
                    background: ed ? C.orange : `${C.orange}15`, border: `1px solid ${C.orange}30`, borderRadius: 6,
                    padding: "6px 8px", color: ed ? C.black : C.orange, fontSize: 13, cursor: "pointer",
                    transition: "all 0.15s",
                  }}>✏️</button>
                </div>
              </div>
              {ed && (
                <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${C.orange}25` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 10 }}>
                    <div>
                      <label style={{ fontSize: 9, color: C.orange, fontFamily: mono, fontWeight: 700 }}>DATE</label>
                      <input type="date" value={g.date} onChange={(e) => setSchedule((s) => s.map((x) => x.id === g.id ? { ...x, date: e.target.value } : x))} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ fontSize: 9, color: C.orange, fontFamily: mono, fontWeight: 700 }}>TIME</label>
                      <input type="text" value={g.time} onChange={(e) => setSchedule((s) => s.map((x) => x.id === g.id ? { ...x, time: e.target.value } : x))} style={inputStyle()} />
                    </div>
                    <div>
                      <label style={{ fontSize: 9, color: C.orange, fontFamily: mono, fontWeight: 700 }}>OPPONENT</label>
                      <select value={g.opponent} onChange={(e) => setSchedule((s) => s.map((x) => x.id === g.id ? { ...x, opponent: e.target.value } : x))} style={inputStyle()}>
                        {["Angels", "Cubs", "Twins", "Tigers", "Athletics"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 9, color: C.orange, fontFamily: mono, fontWeight: 700 }}>PARK</label>
                      <select value={g.park} onChange={(e) => setSchedule((s) => s.map((x) => x.id === g.id ? { ...x, park: e.target.value } : x))} style={inputStyle()}>
                        {Object.keys(PARKS).map((k) => <option key={k} value={k}>{PARKS[k].name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label style={{ fontSize: 9, color: C.orange, fontFamily: mono, fontWeight: 700 }}>HOME / AWAY</label>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      {["home", "away"].map((ha) => (
                        <button key={ha} onClick={() => setSchedule((s) => s.map((x) => x.id === g.id ? { ...x, homeAway: ha } : x))} style={{
                          flex: 1, padding: 7, borderRadius: 6, fontFamily: mono, fontSize: 11, fontWeight: 700,
                          cursor: "pointer", border: `1px solid ${C.orange}40`,
                          background: g.homeAway === ha ? C.orange : C.bg,
                          color: g.homeAway === ha ? C.black : C.dim,
                        }}>{ha.toUpperCase()}</button>
                      ))}
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
function RosterView({ roster, setRoster }) {
  const active = roster.filter((p) => p.active).sort((a, b) => a.order - b.order);
  const inactive = roster.filter((p) => !p.active);

  const toggle = (id) => {
    setRoster((prev) => {
      const up = prev.map((p) => {
        if (p.id !== id) return p;
        if (!p.active) {
          const mx = Math.max(...prev.filter((x) => x.active).map((x) => x.order), -1);
          return { ...p, active: true, order: mx + 1 };
        }
        return { ...p, active: false };
      });
      up.filter((p) => p.active).sort((a, b) => a.order - b.order).forEach((p, i) => { p.order = i; });
      return [...up];
    });
  };

  const move = (from, to) => {
    if (from === to) return;
    setRoster((prev) => {
      const act = prev.filter((p) => p.active).sort((a, b) => a.order - b.order);
      const [m] = act.splice(from, 1);
      act.splice(to, 0, m);
      act.forEach((p, i) => { p.order = i; });
      return [...prev.filter((p) => !p.active), ...act];
    });
  };

  return (
    <div>
      <div style={{ padding: "10px 14px 8px" }}>
        <p style={{ margin: 0, fontSize: 11, color: C.dim, fontFamily: mono }}>Tap arrows to set batting order</p>
      </div>
      <div style={{ padding: "0 14px 80px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.orange, marginBottom: 6, fontFamily: mono }}>ACTIVE ({active.length})</div>
        {active.map((p, i) => (
          <div key={p.id} style={{
            display: "flex", alignItems: "center", gap: 8, background: C.card,
            borderRadius: 8, padding: "9px 10px", marginBottom: 4, border: `1px solid ${C.border}`,
          }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <button onClick={() => i > 0 && move(i, i - 1)} disabled={i === 0} style={{
                background: "none", border: "none", color: i === 0 ? C.border : C.orange,
                cursor: i === 0 ? "default" : "pointer", fontSize: 10, padding: 0, lineHeight: 1,
              }}>▲</button>
              <button onClick={() => i < active.length - 1 && move(i, i + 1)} disabled={i === active.length - 1} style={{
                background: "none", border: "none", color: i === active.length - 1 ? C.border : C.orange,
                cursor: i === active.length - 1 ? "default" : "pointer", fontSize: 10, padding: 0, lineHeight: 1,
              }}>▼</button>
            </div>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", background: C.orange,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 800, color: C.black, fontFamily: mono, flexShrink: 0,
            }}>{i + 1}</div>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text, fontFamily: sans }}>{p.name}</span>
            <button onClick={() => toggle(p.id)} style={{
              background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: 6,
              padding: "4px 10px", color: C.danger, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: mono,
            }}>OUT</button>
          </div>
        ))}
        {inactive.length > 0 && (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.dim, margin: "14px 0 6px", fontFamily: mono }}>NOT PLAYING ({inactive.length})</div>
            {inactive.map((p) => (
              <div key={p.id} style={{
                display: "flex", alignItems: "center", gap: 10, background: C.card,
                borderRadius: 8, padding: "9px 10px", marginBottom: 4, border: `1px solid ${C.border}`, opacity: 0.4,
              }}>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text, fontFamily: sans }}>{p.name}</span>
                <button onClick={() => toggle(p.id)} style={{
                  background: C.orangeBg, border: `1px solid ${C.orange}30`, borderRadius: 6,
                  padding: "4px 10px", color: C.orange, fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: mono,
                }}>ADD IN</button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Setup View ──
function SetupView({ config, setConfig }) {
  const [testStatus, setTestStatus] = useState(null);
  const testConnection = async () => {
    if (!config.sheetId || !config.apiKey) { setTestStatus({ ok: false, msg: "Enter both Sheet ID and API Key." }); return; }
    setTestStatus({ ok: null, msg: "Testing..." });
    try {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${config.sheetId}?key=${config.apiKey}&fields=properties.title`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTestStatus({ ok: true, msg: `Connected: "${data.properties.title}"` });
    } catch (e) { setTestStatus({ ok: false, msg: `Failed: ${e.message}` }); }
  };

  return (
    <div>
      <div style={{ padding: "10px 14px 80px" }}>
        <div style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.orange}25`, marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.orange, marginBottom: 10, fontFamily: mono }}>GOOGLE SHEETS CONNECTION</div>
          <label style={{ display: "block", fontSize: 10, color: C.dim, marginBottom: 3, fontFamily: mono, fontWeight: 700 }}>SHEET ID</label>
          <input type="text" value={config.sheetId} onChange={(e) => setConfig((c) => ({ ...c, sheetId: e.target.value }))} placeholder="From your Sheet URL" style={{
            width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
            color: C.text, padding: 8, fontSize: 12, fontFamily: mono, marginBottom: 8, boxSizing: "border-box",
          }} />
          <label style={{ display: "block", fontSize: 10, color: C.dim, marginBottom: 3, fontFamily: mono, fontWeight: 700 }}>API KEY</label>
          <input type="password" value={config.apiKey} onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))} placeholder="Google Cloud API Key" style={{
            width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
            color: C.text, padding: 8, fontSize: 12, fontFamily: mono, marginBottom: 10, boxSizing: "border-box",
          }} />
          <button onClick={testConnection} style={{
            width: "100%", padding: 10, background: C.orange, color: C.black,
            border: "none", borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: mono,
          }}>Test Connection</button>
          {testStatus && (
            <div style={{
              marginTop: 8, padding: "8px 10px", borderRadius: 6, fontSize: 11, fontFamily: mono, fontWeight: 600,
              background: testStatus.ok === null ? "#60a5fa15" : testStatus.ok ? `${C.orange}15` : "#ef444415",
              color: testStatus.ok === null ? "#60a5fa" : testStatus.ok ? C.orange : "#ef4444",
            }}>{testStatus.msg}</div>
          )}
        </div>
        <div style={{ background: C.card, borderRadius: 10, padding: 14, border: `1px solid ${C.border}`, marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.orange, marginBottom: 8, fontFamily: mono }}>SETUP STEPS</div>
          {["1. Create a Google Sheet", "2. Add tabs: Roster, AtBats, Schedule",
            "3. Roster cols: id, name, order, active", "4. AtBats cols: id, playerId, gameId, result",
            "5. Schedule cols: id, game, date, time, opponent, homeAway, park",
            "6. Enable Sheets API in Google Cloud Console", "7. Create an API key",
            "8. Share sheet as 'Anyone with link' (Editor)",
          ].map((s, i) => <div key={i} style={{ fontSize: 11, color: C.dim, padding: "3px 0", fontFamily: mono, lineHeight: 1.5 }}>{s}</div>)}
        </div>
        <div style={{ background: C.orangeBg, borderRadius: 10, padding: 14, border: `1px solid ${C.orange}25` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.orange, marginBottom: 3, fontFamily: mono }}>DEMO MODE</div>
          <div style={{ fontSize: 11, color: C.dim, fontFamily: mono, lineHeight: 1.5 }}>Running with sample data. Connect a Google Sheet to sync across all phones.</div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──
export default function App() {
  const [tab, setTab] = useState("game");
  const [roster, setRoster] = useState(DEMO_ROSTER);
  const [atBats, setAtBats] = useState([]);
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [gameId, setGameId] = useState(INITIAL_SCHEDULE[0].id);
  const [config, setConfig] = useState({ sheetId: "", apiKey: "" });
  const [toast, setToast] = useState(null);

  const showToast = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 1800); };

  const logAtBat = (playerId, result) => {
    if (result === "__UNDO__") {
      setAtBats((prev) => {
        const pABs = prev.filter((ab) => ab.playerId === playerId && ab.gameId === gameId);
        if (!pABs.length) return prev;
        const last = pABs[pABs.length - 1];
        showToast(`Removed ${last.result}`, C.danger);
        return prev.filter((ab) => ab.id !== last.id);
      });
      return;
    }
    const player = roster.find((p) => p.id === playerId);
    const o = getO(result);
    setAtBats((prev) => [...prev, { id: `ab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, playerId, gameId, result }]);
    showToast(`${player?.name}: ${o.label}`, o.color);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, maxWidth: 480, margin: "0 auto", paddingBottom: 60 }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&family=IBM+Plex+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.8); }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(-8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        select option { background: ${C.card}; color: ${C.text}; }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)",
          background: C.card, border: `2px solid ${toast.color}`, borderRadius: 10,
          padding: "8px 18px", zIndex: 200, boxShadow: `0 4px 20px ${toast.color}25`,
          animation: "toastIn 0.15s ease-out",
        }}><span style={{ fontSize: 13, fontWeight: 700, color: toast.color, fontFamily: mono }}>{toast.msg}</span></div>
      )}

      <AppHeader />

      {tab === "game" && <GameView roster={roster} atBats={atBats} schedule={schedule} gameId={gameId} setGameId={setGameId} onLog={logAtBat} />}
      {tab === "stats" && <StatsView roster={roster} atBats={atBats} schedule={schedule} />}
      {tab === "schedule" && <ScheduleView schedule={schedule} setSchedule={setSchedule} />}
      {tab === "roster" && <RosterView roster={roster} setRoster={setRoster} />}
      {tab === "setup" && <SetupView config={config} setConfig={setConfig} />}

      <TabBar tab={tab} setTab={setTab} />
    </div>
  );
}
