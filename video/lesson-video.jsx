import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const COLORS = {
  ink: "#292638",
  muted: "#777382",
  plum: "#695ba4",
  lavender: "#eeeaf8",
  peach: "#e5a17e",
  green: "#8eb49b",
  paper: "#fbfafc"
};

export function calculateLessonDuration(lesson) {
  const fps = 24;
  const audioFrames = Math.ceil((lesson.audioDurationSeconds || 12) * fps);
  return Math.max(fps * 6, audioFrames + fps * 2);
}

function Illustration({ visual, sceneIndex, frame }) {
  const noteY = (index) => 172 - index * 19;
  const bounce = interpolate(frame % 48, [0, 24, 48], [0, -7, 0]);

  if (visual === "staff") {
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        {[85, 115, 145, 175, 205].map((y) => <line key={y} x1="75" x2="565" y1={y} y2={y} stroke="#d9d4e5" strokeWidth="3" />)}
        <text x="92" y="194" fill={COLORS.plum} fontSize="110" fontFamily="serif">𝄞</text>
        {[0, 1, 2, 3, 4].map((index) => (
          <g key={index} transform={`translate(${235 + index * 62}, ${noteY(index % 4) + bounce})`}>
            <ellipse rx="16" ry="11" fill={index === sceneIndex ? COLORS.peach : COLORS.plum} transform="rotate(-18)" />
            <line x1="13" y1="0" x2="13" y2="-70" stroke={COLORS.plum} strokeWidth="5" />
          </g>
        ))}
      </svg>
    );
  }

  if (visual === "scale") {
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <path d="M75 236 Q300 245 570 65" fill="none" stroke="#ded9ea" strokeWidth="4" strokeDasharray="9 12" />
        {["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"].map((note, index) => {
          const x = 95 + index * 74;
          const y = 214 - index * 24 + (index === sceneIndex * 2 ? bounce : 0);
          return (
            <g key={note}>
              <circle cx={x} cy={y} r={index === sceneIndex * 2 ? 26 : 20} fill={index <= sceneIndex * 2 ? COLORS.peach : COLORS.lavender} />
              <text x={x} y={y + 5} fill={COLORS.plum} textAnchor="middle" fontSize="12" fontWeight="700">{note}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (visual === "hands") {
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <rect x="84" y="184" width="472" height="76" rx="9" fill="#fff" stroke="#ded9e8" strokeWidth="2" />
        {Array.from({ length: 7 }, (_, index) => <line key={index} x1={151 + index * 58} x2={151 + index * 58} y1="186" y2="258" stroke="#e2deea" strokeWidth="2" />)}
        {[0, 1, 2, 3, 4].map((index) => <rect key={index} x={183 + index * 58} y="185" width="18" height="44" rx="3" fill={index === sceneIndex + 1 ? COLORS.peach : COLORS.ink} />)}
        <path d="M194 150 C205 104 232 106 240 151 L250 112 C258 78 282 82 286 116 L291 151 L302 109 C309 78 335 85 335 119 L337 152 L351 125 C365 99 388 111 379 142 L363 188 L212 189 Z" fill={COLORS.plum} transform={`translate(0 ${bounce})`} />
      </svg>
    );
  }

  if (visual === "keyboard") {
    const notes = ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"];
    const blackKeyAfter = new Set([0, 1, 3, 4, 5]);
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <text x="320" y="58" textAnchor="middle" fill={COLORS.muted} fontSize="16" fontWeight="700">REPÈRES SUR LE CLAVIER</text>
        {notes.map((note, index) => {
          const x = 96 + index * 64;
          const selected = index === sceneIndex % notes.length;
          return (
            <g key={note}>
              <rect x={x} y="94" width="64" height="142" rx="4" fill={selected ? "#f8e8dd" : "#fff"} stroke="#d9d4e5" strokeWidth="2" />
              <text x={x + 32} y="219" fill={COLORS.plum} textAnchor="middle" fontSize="14" fontWeight="700">{note}</text>
              {blackKeyAfter.has(index) && index < notes.length - 1 && <rect x={x + 46} y="94" width="36" height="87" rx="4" fill={COLORS.ink} />}
              {selected && <circle cx={x + 32} cy="76" r="8" fill={COLORS.peach} />}
            </g>
          );
        })}
      </svg>
    );
  }

  if (visual === "rhythm") {
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <text x="320" y="66" textAnchor="middle" fill={COLORS.muted} fontSize="16" fontWeight="700">UNE MESURE · QUATRE PULSATIONS</text>
        <line x1="112" y1="158" x2="528" y2="158" stroke="#ded9ea" strokeWidth="5" strokeLinecap="round" />
        {[0, 1, 2, 3].map((beat) => {
          const x = 128 + beat * 128;
          const active = beat === sceneIndex % 4;
          return (
            <g key={beat}>
              <circle cx={x} cy="158" r={active ? 40 : 31} fill={active ? COLORS.peach : COLORS.lavender} />
              <text x={x} y="166" fill={COLORS.plum} textAnchor="middle" fontSize="24" fontWeight="800">{beat + 1}</text>
              <text x={x} y="222" fill={COLORS.muted} textAnchor="middle" fontSize="14">temps</text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (visual === "chord") {
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <text x="320" y="46" textAnchor="middle" fill={COLORS.muted} fontSize="16" fontWeight="700">DES NOTES QUI SONNENT ENSEMBLE</text>
        {["Do", "Mi", "Sol"].map((note, index) => {
          const y = 192 - index * 54;
          return (
            <g key={note}>
              <circle cx="320" cy={y} r="23" fill={index === sceneIndex % 3 ? COLORS.peach : COLORS.lavender} />
              <text x="320" y={y + 6} fill={COLORS.plum} textAnchor="middle" fontSize="15" fontWeight="800">{note}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 640 300" width="640" height="300">
      <circle cx="320" cy="145" r="118" fill="none" stroke="#e4dfef" strokeWidth="2" />
      <circle cx="320" cy="145" r="87" fill="none" stroke="#e4dfef" strokeWidth="2" />
      <text x="320" y="150" textAnchor="middle" fill={COLORS.plum} fontSize="66" fontFamily="serif">♫</text>
      <rect x="176" y="190" width="288" height="70" rx="7" fill="#fff" stroke="#ded9e8" strokeWidth="2" />
      {Array.from({ length: 7 }, (_, index) => <line key={index} x1={212 + index * 36} x2={212 + index * 36} y1="192" y2="258" stroke="#e2deea" strokeWidth="2" />)}
      {[0, 1, 2, 3, 4].map((index) => <rect key={index} x={230 + index * 72} y="191" width="18" height="42" rx="3" fill={index === sceneIndex ? COLORS.peach : COLORS.ink} />)}
    </svg>
  );
}

function SectionVisual({ lesson, section, sceneIndex, frame }) {
  const sections = lesson.video.sections || [];
  const chapters = sections.filter((item) => item.kind === "chapter");
  const chapterTitle = (item) => item.title.replace(/^Chapitre \d+ · /, "");

  if (section.kind === "chapter" && section.images?.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: 12, width: "100%", padding: "0 10px" }}>
        {section.images.map((image) => (
          <figure key={image.src} style={{
            display: "grid", gridTemplateRows: "1fr auto", flex: "1 1 0", minWidth: 0,
            height: 236, margin: 0, overflow: "hidden", border: "1px solid #e8e4ef",
            borderRadius: 12, background: "#fff",
          }}>
            <Img src={staticFile(image.src.replace(/^\//, ""))} alt={image.alt} style={{
              width: "100%", height: 176, objectFit: "contain", background: "#f7f5f8",
            }} />
            <figcaption style={{ display: "grid", alignContent: "center", gap: 3, padding: "7px 9px", color: COLORS.ink, fontSize: 12, lineHeight: 1.25 }}>
              <strong>{image.caption}</strong>
              <span style={{ color: COLORS.muted, fontSize: 10 }}>{image.credit}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    );
  }

  if (section.kind === "intro") {
    return (
      <div style={{ display: "grid", gap: 20, justifyItems: "center", textAlign: "center", maxWidth: 560 }}>
        <span style={{ color: COLORS.peach, fontSize: 15, fontWeight: 800, letterSpacing: 2 }}>OBJECTIF DE LA LEÇON</span>
        <strong style={{ fontSize: 30, lineHeight: 1.3 }}>{lesson.objective}</strong>
        <span style={{ color: COLORS.muted, fontSize: 16 }}>{lesson.categoryLabel} · {lesson.shortTitle}</span>
      </div>
    );
  }

  if (section.kind === "roadmap" && chapters.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "stretch", gap: 12, width: "100%", padding: "0 18px" }}>
        {chapters.map((item, index) => (
          <div key={item.title} style={{
            display: "grid", alignContent: "center", gap: 12, flex: "1 1 0", minWidth: 0,
            minHeight: 150, padding: 18, border: "1px solid #e8e4ef", borderRadius: 18,
            background: "#fff", boxShadow: "0 12px 30px #4435630b",
            opacity: spring({ frame: frame - index * 5, fps: 24, config: { damping: 16 } }),
          }}>
            <span style={{ color: COLORS.peach, fontSize: 14, fontWeight: 800, letterSpacing: 1.5 }}>CHAPITRE {String(index + 1).padStart(2, "0")}</span>
            <strong style={{ color: COLORS.ink, fontSize: 19, lineHeight: 1.25 }}>{chapterTitle(item)}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (section.kind === "practice") {
    const notes = section.notes || [];
    if (notes.length) {
      return (
        <div style={{ display: "grid", justifyItems: "center", gap: 24 }}>
          <span style={{ color: COLORS.muted, fontSize: 15, fontWeight: 700, letterSpacing: 1.5 }}>PHRASE À JOUER</span>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 9 }}>
            {notes.map((note, index) => (
              <span key={`${note}-${index}`} style={{
                display: "grid", placeItems: "center", width: 58, height: 54, borderRadius: 14,
                background: index === sceneIndex % notes.length ? COLORS.peach : COLORS.lavender,
                color: COLORS.plum, fontSize: 17, fontWeight: 800,
                transform: `translateY(${index === Math.floor(frame / 16) % notes.length ? -5 : 0}px)`,
              }}>{note}</span>
            ))}
          </div>
          <span style={{ color: COLORS.muted, fontSize: 16 }}>Écoute chaque note avant de passer à la suivante.</span>
        </div>
      );
    }
    return <Illustration visual="rhythm" sceneIndex={sceneIndex} frame={frame} />;
  }

  if (section.kind === "takeaways") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${section.takeaways.length}, minmax(0, 1fr))`, gap: 9, width: "100%", padding: "0 8px" }}>
        {section.takeaways.map((takeaway, index) => (
          <div key={`${takeaway}-${index}`} style={{
            display: "grid", alignContent: "center", gap: 9, minHeight: 164, padding: 11,
            border: "1px solid #e8e4ef", borderRadius: 14,
            background: index === sceneIndex % section.takeaways.length ? COLORS.lavender : "#fff",
            opacity: spring({ frame: frame - index * 4, fps: 24, config: { damping: 16 } }),
          }}>
            <span style={{ color: COLORS.peach, fontSize: 18, fontWeight: 800 }}>{String(index + 1).padStart(2, "0")}</span>
            <strong style={{ color: COLORS.ink, fontSize: 13, lineHeight: 1.35 }}>{takeaway}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (section.kind === "recap" && chapters.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: 14, width: "100%", padding: "0 18px" }}>
        {chapters.map((item, index) => (
          <div key={item.title} style={{
            display: "grid", alignContent: "center", justifyItems: "center", gap: 13,
            flex: "1 1 0", minWidth: 0, minHeight: 145, padding: 16,
            borderRadius: 18, background: index === sceneIndex % chapters.length ? COLORS.lavender : "#fff",
            border: "1px solid #e8e4ef",
          }}>
            <span style={{ color: COLORS.peach, fontSize: 22, fontWeight: 800 }}>{String(index + 1).padStart(2, "0")}</span>
            <strong style={{ color: COLORS.ink, fontSize: 16, lineHeight: 1.25, textAlign: "center" }}>{item.takeaway}</strong>
          </div>
        ))}
      </div>
    );
  }

  return <Illustration visual={lesson.video.visual} sceneIndex={sceneIndex} frame={frame} />;
}

function HistoryMechanismVisual({ frame }) {
  const hammer = interpolate(frame % 72, [0, 24, 40, 72], [0, -20, 0, 0]);
  return (
    <svg viewBox="0 0 640 300" width="640" height="250">
      <text x="320" y="34" textAnchor="middle" fill={COLORS.muted} fontSize="15" fontWeight="700">DU DOIGT À LA CORDE : UNE CHAÎNE DE MOUVEMENTS</text>
      <line x1="370" y1="97" x2="568" y2="97" stroke="#766b82" strokeWidth="5" />
      <text x="512" y="78" textAnchor="middle" fill={COLORS.plum} fontSize="13" fontWeight="700">CORDE</text>
      <path d="M474 146 Q516 111 558 146" fill="none" stroke={COLORS.peach} strokeWidth="4" strokeDasharray="7 7" />
      <text x="515" y="168" textAnchor="middle" fill={COLORS.muted} fontSize="12">vibration</text>
      <rect x="398" y="60" width="15" height="40" rx="4" fill={COLORS.green} />
      <text x="405" y="52" textAnchor="middle" fill={COLORS.plum} fontSize="12">étouffoir</text>
      <g transform={`translate(${hammer}, ${-hammer * 0.25})`}>
        <path d="M300 202 L450 112" stroke={COLORS.plum} strokeWidth="13" strokeLinecap="round" />
        <rect x="437" y="88" width="44" height="25" rx="8" fill={COLORS.peach} transform="rotate(-31 459 100)" />
      </g>
      <circle cx="300" cy="202" r="11" fill={COLORS.ink} />
      <text x="408" y="203" textAnchor="middle" fill={COLORS.plum} fontSize="13" fontWeight="700">MARTEAU</text>
      <path d="M94 222 L290 222 L332 194" fill="none" stroke={COLORS.plum} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="72" y="212" width="128" height="27" rx="5" fill="#fff" stroke="#d9d4e5" strokeWidth="2" />
      <text x="136" y="231" textAnchor="middle" fill={COLORS.plum} fontSize="13" fontWeight="700">TOUCHE-LEVIER</text>
      <path d="M278 195 L311 169" stroke={COLORS.peach} strokeWidth="7" strokeLinecap="round" />
      <text x="267" y="158" textAnchor="middle" fill={COLORS.muted} fontSize="12">échappement</text>
      <path d="M219 258 C280 274 378 264 426 222" fill="none" stroke="#d9d4e5" strokeWidth="3" markerEnd="url(#actionArrow)" />
      <defs><marker id="actionArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#d9d4e5" /></marker></defs>
      <text x="320" y="289" textAnchor="middle" fill={COLORS.muted} fontSize="12">La touche accélère le marteau ; elle ne pousse pas directement la corde.</text>
    </svg>
  );
}

function ManufacturingFlowVisual({ sceneIndex, frame }) {
  const steps = [
    ["01", "Caisse", "bois + table"],
    ["02", "Cordes", "cadre + chevalets"],
    ["03", "Mécanique", "touches + marteaux"],
    ["04", "Réglages", "accord + timbre"],
  ];
  return (
    <div style={{ display: "grid", gap: 17, width: "100%", padding: "0 12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
        {steps.map(([number, title, detail], index) => (
          <div key={number} style={{
            display: "grid", alignContent: "center", justifyItems: "center", gap: 11,
            minHeight: 142, padding: 10, border: "1px solid #e8e4ef", borderRadius: 14,
            background: index === sceneIndex % steps.length ? COLORS.lavender : "#fff",
            transform: `translateY(${index === Math.floor(frame / 20) % steps.length ? -5 : 0}px)`,
          }}>
            <span style={{ color: COLORS.peach, fontSize: 21, fontWeight: 800 }}>{number}</span>
            <strong style={{ color: COLORS.ink, fontSize: 15 }}>{title}</strong>
            <span style={{ color: COLORS.muted, fontSize: 11, textAlign: "center" }}>{detail}</span>
          </div>
        ))}
      </div>
      <span style={{ color: COLORS.plum, fontSize: 14, fontWeight: 700, textAlign: "center" }}>Le bois résonne, le cadre tient la tension, la mécanique transmet ton geste.</span>
    </div>
  );
}

function MusicalContextVisual({ lesson, sceneIndex, frame }) {
  const active = sceneIndex % 3;
  const pulse = interpolate(frame % 48, [0, 24, 48], [0, -6, 0]);

  if (lesson.category === "histoire") {
    if (lesson.id === "history-1" && sceneIndex === 2) {
      return <HistoryMechanismVisual frame={frame} />;
    }
    if (lesson.id === "history-5") {
      return <ManufacturingFlowVisual sceneIndex={sceneIndex} frame={frame} />;
    }
    const events = ["Clavecin", "Pianoforte · vers 1700", "Piano moderne"];
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <text x="320" y="60" textAnchor="middle" fill={COLORS.muted} fontSize="16" fontWeight="700">LE PIANO À TRAVERS LE TEMPS</text>
        <line x1="115" y1="158" x2="525" y2="158" stroke="#ded9ea" strokeWidth="5" />
        {events.map((event, index) => {
          const x = 130 + index * 190;
          return (
            <g key={event} transform={`translate(0 ${index === active ? pulse : 0})`}>
              <circle cx={x} cy="158" r={index === active ? 25 : 19} fill={index === active ? COLORS.peach : COLORS.lavender} />
              <text x={x} y="218" fill={COLORS.plum} textAnchor="middle" fontSize="13" fontWeight="700">{event}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  if (lesson.category === "ecoute") {
    const contour = [154, 110, 142, 76, 116, 94, 146];
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <text x="320" y="55" textAnchor="middle" fill={COLORS.muted} fontSize="16" fontWeight="700">ÉCOUTER LE CONTOUR D’UNE MÉLODIE</text>
        <path d={`M${contour.map((y, index) => `${92 + index * 76} ${y}`).join(" L")}`} fill="none" stroke="#ded9ea" strokeWidth="4" />
        {contour.map((y, index) => (
          <g key={`${y}-${index}`}>
            <circle cx={92 + index * 76} cy={y + (index === active ? pulse : 0)} r={index === active ? 19 : 13} fill={index === active ? COLORS.peach : COLORS.plum} />
            <text x={92 + index * 76} y="218" fill={COLORS.muted} textAnchor="middle" fontSize="13">{index % 2 ? "pas" : "son"}</text>
          </g>
        ))}
      </svg>
    );
  }

  if (lesson.category === "styles") {
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <text x="320" y="54" textAnchor="middle" fill={COLORS.muted} fontSize="16" fontWeight="700">MÉLODIE ET ACCOMPAGNEMENT</text>
        <text x="90" y="118" fill={COLORS.plum} fontSize="14" fontWeight="700">MÉLODIE</text>
        <text x="90" y="202" fill={COLORS.muted} fontSize="14" fontWeight="700">ACCOMPAGNEMENT</text>
        {[0, 1, 2, 3, 4].map((index) => (
          <g key={index}>
            <rect x={198 + index * 70} y={index === active ? 92 : 101} width="46" height="18" rx="9" fill={index === active ? COLORS.peach : COLORS.plum} />
            <rect x={198 + index * 70} y="182" width="46" height="18" rx="9" fill={COLORS.lavender} />
          </g>
        ))}
      </svg>
    );
  }

  if (lesson.category === "evaluation") {
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <text x="320" y="56" textAnchor="middle" fill={COLORS.muted} fontSize="16" fontWeight="700">UN BILAN POUR GUIDER LA SUITE</text>
        {["Lire", "Écouter", "Jouer"].map((skill, index) => (
          <g key={skill}>
            <circle cx={160 + index * 160} cy="145" r="43" fill={index === active ? COLORS.peach : COLORS.lavender} />
            <text x={160 + index * 160} y="153" fill={COLORS.plum} textAnchor="middle" fontSize="16" fontWeight="800">{index + 1}</text>
            <text x={160 + index * 160} y="218" fill={COLORS.ink} textAnchor="middle" fontSize="16" fontWeight="700">{skill}</text>
          </g>
        ))}
      </svg>
    );
  }

  if (lesson.category === "ensemble") {
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <text x="320" y="56" textAnchor="middle" fill={COLORS.muted} fontSize="16" fontWeight="700">TROIS REPÈRES POUR JOUER ENSEMBLE</text>
        {["Mélodie", "Accompagnement", "Écoute partagée"].map((role, index) => (
          <g key={role}>
            <rect x="110" y={94 + index * 54} width="420" height="38" rx="12" fill={index === active ? COLORS.peach : COLORS.lavender} />
            <text x="320" y={119 + index * 54} fill={COLORS.plum} textAnchor="middle" fontSize="15" fontWeight="700">{role}</text>
          </g>
        ))}
      </svg>
    );
  }

  if (lesson.category === "improvisation" || lesson.category === "composition") {
    const ideas = lesson.category === "composition"
      ? ["A · idée", "B · contraste", "A′ · retour"]
      : ["Question", "Réponse", "Variation"];
    return (
      <svg viewBox="0 0 640 300" width="640" height="300">
        <text x="320" y="56" textAnchor="middle" fill={COLORS.muted} fontSize="16" fontWeight="700">UNE IDÉE MUSICALE SE TRANSFORME</text>
        {ideas.map((idea, index) => (
          <g key={idea}>
            <rect x={88 + index * 160} y={112 + (index === active ? pulse : 0)} width="144" height="92" rx="20" fill={index === active ? COLORS.peach : COLORS.lavender} />
            <text x={160 + index * 160} y="164" fill={COLORS.plum} textAnchor="middle" fontSize="15" fontWeight="800">{idea}</text>
          </g>
        ))}
      </svg>
    );
  }

  return null;
}

export function LessonVideo({ lesson, audioFile, audioDurationSeconds, audioSections }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneCount = Math.max(1, lesson.video.sections?.length || lesson.video.scenes?.length || 1);
  const timedIndex = audioSections?.reduce(
    (active, section, index) => frame >= section.startSeconds * fps ? index : active,
    0
  ) ?? 0;
  const sceneIndex = audioSections?.length
    ? timedIndex
    : Math.min(sceneCount - 1, Math.floor(frame / Math.max(1, audioDurationSeconds * fps) * sceneCount));
  const section = lesson.video.sections?.[sceneIndex] || {
    kind: "chapter",
    title: lesson.video.scenes?.[sceneIndex] || lesson.video.title,
    detail: lesson.objective,
    takeaway: lesson.objective,
  };
  const sceneStartFrame = audioSections?.[sceneIndex]?.startSeconds * fps || 0;
  const localFrame = Math.max(0, frame - sceneStartFrame);
  const chapterIndex = Math.max(
    0,
    (lesson.video.sections || [])
      .slice(0, sceneIndex + 1)
      .filter((item) => item.kind === "chapter").length - 1
  );
  const visualSceneIndex = section.kind === "chapter"
    ? chapterIndex
    : section.kind === "practice"
      ? Math.floor(localFrame / 16)
      : sceneIndex;
  const sceneText = section.title;
  const entrance = spring({ frame, fps, config: { damping: 18, stiffness: 100 } });
  const sceneEntrance = spring({ frame: localFrame, fps, config: { damping: 16, stiffness: 110 } });
  const illustrationScale = interpolate(entrance, [0, 1], [0.94, 1]);
  const sceneProgress = Math.min(1, Math.max(0, frame / Math.max(1, audioDurationSeconds * fps)));
  const contextualVisual = section.kind === "chapter" && !section.images?.length
    ? MusicalContextVisual({ lesson, sceneIndex: chapterIndex, frame: localFrame })
    : null;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, color: COLORS.ink, fontFamily: "Arial, sans-serif" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 82% 18%, #eee9f8 0, transparent 34%), linear-gradient(135deg, #fcfbfd 0%, #f5f2fa 100%)" }} />
      <div style={{ position: "absolute", top: 42, left: 70, right: 70, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13, color: COLORS.plum, fontSize: 16, fontWeight: 800, letterSpacing: 2 }}>
          <span style={{ display: "grid", width: 38, height: 38, placeItems: "center", borderRadius: "12px 12px 12px 4px", background: COLORS.plum, color: "#fff", fontSize: 25, letterSpacing: 0 }}>c</span>
          CLAVITEMPO · COURS GUIDÉ
        </div>
        <span style={{ color: COLORS.muted, fontSize: 15, fontWeight: 700 }}>NIVEAU {lesson.level} · {lesson.categoryLabel.toUpperCase()}</span>
      </div>
      <div style={{ position: "absolute", top: 118, left: 78, right: 78, textAlign: "center" }}>
        <div style={{ color: COLORS.peach, fontSize: 15, fontWeight: 800, letterSpacing: 2 }}>{lesson.shortTitle.toUpperCase()}</div>
        <h1 style={{ margin: "10px 0 0", fontSize: 44, fontWeight: 700, letterSpacing: -1.5 }}>{lesson.video.title}</h1>
      </div>
      <div style={{ position: "absolute", top: 195, left: 90, right: 90, height: 5, borderRadius: 5, background: "#e7e2ee" }}>
        <div style={{ width: `${sceneProgress * 100}%`, height: "100%", borderRadius: 5, background: COLORS.peach }} />
      </div>
      <div style={{
        position: "absolute", top: 225, left: 640, width: 640, height: 250, display: "grid",
        placeItems: "center", padding: "0 18px", boxSizing: "border-box", border: "1px solid #e8e4ef", borderRadius: 28,
        background: "#ffffffc7", boxShadow: "0 24px 70px #44356312",
        transform: `translateX(-50%) scale(${illustrationScale})`,
      }}>
        {contextualVisual || <SectionVisual lesson={lesson} section={section} sceneIndex={visualSceneIndex} frame={localFrame} />}
      </div>
      <div style={{
        position: "absolute", right: 80, bottom: 42, left: 80, display: "grid", gap: 10,
        justifyItems: "center", padding: "14px 34px", border: "1px solid #e8e3f0",
        borderRadius: 18, background: "#ffffffde", boxShadow: "0 12px 32px #4435630b",
        opacity: sceneEntrance, transform: `translateY(${interpolate(sceneEntrance, [0, 1], [10, 0])}px)`,
      }}>
        <span style={{ color: COLORS.plum, fontSize: 13, fontWeight: 800, letterSpacing: 1.5 }}>ÉTAPE {String(sceneIndex + 1).padStart(2, "0")}</span>
        <strong style={{ color: COLORS.ink, fontSize: 22, textAlign: "center" }}>{sceneText}</strong>
        <span style={{ color: COLORS.ink, fontSize: 14, lineHeight: 1.3, textAlign: "center", maxWidth: 1070 }}>{section.detail}</span>
        <span style={{ color: COLORS.muted, fontSize: 14, fontWeight: 700, textAlign: "center" }}>{section.takeaway}</span>
      </div>
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
}
