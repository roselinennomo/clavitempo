import React, { useEffect, useMemo, useRef, useState } from "react";

const COURSE_ID = "tempo-foundations";
const DEFAULT_VIDEO_SETTINGS = { volume: 0.8, playbackRate: 1 };
const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const STEP_NAMES = [
  ["reading", "Comprendre", "Lire la leçon"],
  ["video", "Regarder & écouter", "Voir la capsule"],
  ["practice", "Pratiquer", "Faire l’exercice"]
];
const LEVEL_DESCRIPTIONS = [
  "Découvrir l’instrument, les premières notes et les repères essentiels.",
  "Lire une partition et comprendre comment les sons s’organisent.",
  "Développer une technique souple et une pratique régulière.",
  "Relier l’écoute, l’harmonie et l’interprétation.",
  "Explorer les grands langages et couleurs du piano.",
  "Créer, jouer avec d’autres et interpréter avec intention."
];
const SUBJECT_GROUPS = [
  { id: "foundations", label: "Fondations", icon: "✧", categories: ["solfege", "rythme", "theorie", "ecoute"] },
  { id: "piano-practice", label: "Pratique du piano", icon: "♬", categories: ["piano", "technique", "repertoire"] },
  { id: "culture-creation", label: "Culture & création", icon: "◖", categories: ["histoire", "styles", "improvisation", "ensemble"] },
  { id: "assessments", label: "Mes bilans", icon: "✷", categories: ["evaluation"] }
];

const NOTE_PITCH = {
  Do: 0, "Do♯": 1, "Ré♭": 1, Ré: 2, "Ré♯": 3, "Mi♭": 3,
  Mi: 4, Fa: 5, "Fa♯": 6, "Sol♭": 6, Sol: 7, "Sol♯": 8,
  "La♭": 8, La: 9, "La♯": 10, "Si♭": 10, Si: 11,
  "Do♭": 11, "Mi♯": 5, "Si♯": 0
};
const WHITE_KEYS = [
  { note: "Do", label: "Do", pitch: 0 },
  { note: "Ré", label: "Ré", pitch: 2 },
  { note: "Mi", label: "Mi", pitch: 4 },
  { note: "Fa", label: "Fa", pitch: 5 },
  { note: "Sol", label: "Sol", pitch: 7 },
  { note: "La", label: "La", pitch: 9 },
  { note: "Si", label: "Si", pitch: 11 },
  { note: "Do", label: "Do", pitch: 12 }
];
const BLACK_KEYS = [
  { note: "Do♯", label: "Do♯", pitch: 1, after: 0 },
  { note: "Ré♯", label: "Ré♯", pitch: 3, after: 1 },
  { note: "Fa♯", label: "Fa♯", pitch: 6, after: 3 },
  { note: "Sol♯", label: "Sol♯", pitch: 8, after: 4 },
  { note: "La♯", label: "La♯", pitch: 10, after: 5 }
];

function formatTime(seconds) {
  const totalSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function useVideoFullscreen(stageRef, videoRef, onError, videoKey) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    function updateFullscreenState() {
      setIsFullscreen(
        document.fullscreenElement === stageRef.current
        || document.webkitFullscreenElement === stageRef.current
        || Boolean(video?.webkitDisplayingFullscreen)
      );
    }
    function finishWebkitFullscreen() {
      if (video) video.controls = false;
      updateFullscreenState();
    }

    document.addEventListener("fullscreenchange", updateFullscreenState);
    document.addEventListener("webkitfullscreenchange", updateFullscreenState);
    video?.addEventListener("webkitbeginfullscreen", updateFullscreenState);
    video?.addEventListener("webkitendfullscreen", finishWebkitFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreenState);
      document.removeEventListener("webkitfullscreenchange", updateFullscreenState);
      video?.removeEventListener("webkitbeginfullscreen", updateFullscreenState);
      video?.removeEventListener("webkitendfullscreen", finishWebkitFullscreen);
    };
  }, [stageRef, videoRef, videoKey]);

  async function toggleFullscreen() {
    const stage = stageRef.current;
    const video = videoRef.current;
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;

    try {
      if (fullscreenElement === stage) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else document.webkitExitFullscreen?.();
      } else if (isFullscreen && video?.webkitExitFullscreen) {
        video.webkitExitFullscreen();
      } else if (stage?.requestFullscreen) {
        await stage.requestFullscreen();
      } else if (video?.webkitEnterFullscreen) {
        video.controls = true;
        video.webkitEnterFullscreen();
      } else {
        onError("Le mode plein écran n’est pas disponible dans ce navigateur.");
      }
    } catch (error) {
      onError(`Impossible d’activer le plein écran : ${error.message}`);
    }
  }

  return { isFullscreen, toggleFullscreen };
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Une erreur est survenue. Réessaie.");
  return data;
}

function Brand({ className = "" }) {
  return (
    <a className={`brand ${className}`} href="/" aria-label="ClaviTempo, accueil">
      <span className="brand-mark">c</span>
      <span>clavitempo<span className="brand-dot">.</span></span>
    </a>
  );
}

function AuthScreen({ onSession, onError }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const session = await request(`/api/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password })
      });
      onSession(session);
    } catch (caught) {
      setError(caught.message);
      onError(caught.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <Brand className="auth-brand" />
        <div className="auth-note"><span className="note-doodle">♪</span> TON ÉCOLE DE MUSIQUE, À TON RYTHME <span className="note-doodle note-doodle-right">✦</span></div>
        <div className="auth-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> UN VOYAGE MUSICAL COMMENCE</div>
          <h1>Chaque grand pianiste a commencé par <em>une note.</em></h1>
          <p>Un cursus pas à pas pour apprendre, pratiquer et trouver ta musique, depuis les tout premiers repères.</p>
        </div>
        <div className="auth-toggle" role="tablist" aria-label="Connexion ou création de compte">
          <button type="button" className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>Me connecter</button>
          <button type="button" className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => { setMode("register"); setError(""); }}>Créer mon compte</button>
        </div>
        <form onSubmit={submit}>
          {mode === "register" && <label className="form-field">Ton prénom
            <input autoComplete="name" required minLength={2} maxLength={40} value={name} onChange={(event) => setName(event.target.value)} placeholder="Camille" />
          </label>}
          <label className="form-field">Adresse e-mail
            <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="toi@exemple.fr" />
          </label>
          <label className="form-field">Mot de passe
            <input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={10} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="10 caractères minimum" />
          </label>
          <p className="form-error" role="alert">{error}</p>
          <button className="button button-dark auth-submit" type="submit" disabled={busy}>
            {busy ? "Un instant…" : mode === "login" ? "Reprendre mon apprentissage" : "Commencer mon voyage"}
            <span>→</span>
          </button>
        </form>
        <p className="auth-footnote">Ton parcours et tes progrès restent enregistrés sur ton compte.</p>
      </section>
      <aside className="auth-art" aria-hidden="true">
        <div className="art-orbit" /><div className="art-orbit orbit-two" />
        <span className="floating-note note-one">♪</span><span className="floating-note note-two">♫</span><span className="floating-note note-three">♬</span>
        <div className="art-caption"><span className="caption-line" /> UNE NOTE À LA FOIS <span className="caption-line" /></div>
        <div className="art-sticker"><span>✦</span><span>À ton rythme,<br />avec méthode.</span></div>
        <div className="piano-art"><div className="piano-keyboard" /></div>
      </aside>
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState([]);
  const [lessonSteps, setLessonSteps] = useState({});
  const [assessments, setAssessments] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [levels, setLevels] = useState([]);
  const [expandedSubjectGroup, setExpandedSubjectGroup] = useState("foundations");
  const [view, setView] = useState("overview");
  const [filter, setFilter] = useState("all");
  const [activeLesson, setActiveLesson] = useState(null);
  const [videoPreferences, setVideoPreferences] = useState({
    applyToAll: true,
    shared: DEFAULT_VIDEO_SETTINGS,
    byLesson: {}
  });
  const [toast, setToast] = useState("");
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState("");
  const toastTimer = useRef(null);

  useEffect(() => {
    let active = true;
    async function boot() {
      try {
        const [course, session] = await Promise.all([
          request(`/api/v1/courses/${COURSE_ID}`),
          request("/api/me").catch((error) => {
            if (error.message === "Connecte-toi pour continuer.") return null;
            throw error;
          })
        ]);
        if (!active) return;
        setLessons(course.lessons);
        setCategories(course.categories);
        setLevels(course.levels);
        if (session) setSession(session);
      } catch (error) {
        if (active) setBootError(error.message);
      } finally {
        if (active) setBooting(false);
      }
    }
    boot();
    return () => { active = false; };
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function setSession(session) {
    setUser(session.user);
    setProgress(session.progress || []);
    setLessonSteps(session.lessonSteps || {});
    setAssessments(session.assessments || []);
  }

  function notify(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 3000);
  }

  function videoSettingsFor(lessonId) {
    return videoPreferences.applyToAll
      ? videoPreferences.shared
      : videoPreferences.byLesson[lessonId] || videoPreferences.shared;
  }

  function updateVideoSetting(lessonId, setting, value) {
    setVideoPreferences((current) => {
      if (current.applyToAll) {
        return { ...current, shared: { ...current.shared, [setting]: value } };
      }
      const lessonSettings = current.byLesson[lessonId] || current.shared;
      return {
        ...current,
        byLesson: {
          ...current.byLesson,
          [lessonId]: { ...lessonSettings, [setting]: value }
        }
      };
    });
  }

  function updateApplyToAll(lessonId, applyToAll) {
    setVideoPreferences((current) => {
      const lessonSettings = current.applyToAll
        ? current.shared
        : current.byLesson[lessonId] || current.shared;
      if (applyToAll) {
        return { ...current, applyToAll: true, shared: lessonSettings };
      }
      return {
        ...current,
        applyToAll: false,
        byLesson: { ...current.byLesson, [lessonId]: lessonSettings }
      };
    });
  }

  const completedIds = useMemo(() => new Set(progress.map((entry) => entry.lessonId)), [progress]);
  const lessonsById = useMemo(() => new Map(lessons.map((lesson) => [lesson.id, lesson])), [lessons]);
  const resumeLesson = lessons.find((lesson) => !completedIds.has(lesson.id)) || lessons[0];
  const dateLabel = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
  const pageLabels = { overview: "Aujourd’hui", path: "Ordre conseillé", practice: "Le clavier", videos: "La vidéothèque", playlist: "Playlist" };
  const categoryLabel = categories.find((category) => category.id === filter)?.label;
  const breadcrumb = view.startsWith("topic:") ? categoryLabel || "Apprendre" : pageLabels[view] || "Mon espace";

  async function markStep(lesson, stepId) {
    const data = await request("/api/v1/progress/steps", {
      method: "POST",
      body: JSON.stringify({ lessonId: lesson.id, stepId })
    });
    setLessonSteps(data.lessonSteps || {});
  }

  async function completeLesson(lesson, score) {
    const data = await request(`/api/v1/progress/lessons/${encodeURIComponent(lesson.id)}/complete`, {
      method: "POST",
      body: JSON.stringify({ score: score ?? null })
    });
    setProgress(data.progress || []);
    setLessonSteps(data.lessonSteps || {});
    setActiveLesson(null);
    notify("Leçon validée ! Tes nouvelles étapes sont débloquées.");
  }

  async function submitAssessment(lesson, answers) {
    const data = await request(`/api/v1/assessments/${encodeURIComponent(lesson.id)}/attempt`, {
      method: "POST",
      body: JSON.stringify({ answers })
    });
    setAssessments(data.assessments || []);
    if (data.passed) {
      setProgress(data.progress || []);
      setLessonSteps(data.lessonSteps || {});
    }
    return data;
  }

  async function logout() {
    try {
      await request("/api/logout", { method: "POST" });
      setUser(null);
      setProgress([]);
      setLessonSteps({});
      setAssessments([]);
      setActiveLesson(null);
    } catch (error) {
      notify(error.message);
    }
  }

  function navigate(nextView) {
    setView(nextView);
    setFilter(nextView.startsWith("topic:") ? nextView.slice(6) : "all");
    if (nextView.startsWith("topic:")) {
      const categoryId = nextView.slice(6);
      const group = SUBJECT_GROUPS.find((item) => item.categories.includes(categoryId));
      if (group) setExpandedSubjectGroup(group.id);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (booting) return <div className="boot-screen"><span className="boot-note">♪</span><strong>ClaviTempo</strong><span>Accordons nos instruments…</span></div>;
  if (bootError) return <main className="boot-screen"><strong>Impossible de charger ClaviTempo</strong><span>{bootError}</span><button className="button button-dark" onClick={() => window.location.reload()}>Réessayer</button></main>;
  if (!user) return <AuthScreen onSession={setSession} onError={() => {}} />;

  const firstName = user.displayName.split(/\s+/)[0];
  const percent = lessons.length ? Math.round(progress.length / lessons.length * 100) : 0;
  const completed = (lesson) => completedIds.has(lesson.id);
  const progressFor = (lesson) => progress.find((entry) => entry.lessonId === lesson.id);

  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <Brand />
          <div className="sidebar-label">TON ESPACE</div>
          <nav className="main-nav" aria-label="Navigation principale">
            <NavButton view="overview" active={view === "overview"} onClick={navigate} icon="⌂">Aujourd’hui</NavButton>
            <NavButton view="path" active={view === "path" || view.startsWith("topic:")} onClick={navigate} icon="✧">Ordre conseillé</NavButton>
            <NavButton view="practice" active={view === "practice"} onClick={navigate} icon="♬">Le clavier</NavButton>
            <NavButton view="videos" active={view === "videos"} onClick={navigate} icon="▷">Vidéothèque</NavButton>
            <NavButton view="playlist" active={view === "playlist"} onClick={navigate} icon="♫">Playlist</NavButton>
          </nav>
          <div className="sidebar-label sidebar-learn-label">LES MATIÈRES</div>
          <nav className="topic-nav" aria-label="Matières musicales">
            {SUBJECT_GROUPS.map((group) => {
              const groupCategories = categories.filter((category) => group.categories.includes(category.id));
              const groupLessons = lessons.filter((lesson) => group.categories.includes(lesson.category));
              const completedGroupLessons = groupLessons.filter((lesson) => completedIds.has(lesson.id)).length;
              const expanded = expandedSubjectGroup === group.id;
              const active = groupCategories.some((category) => view === `topic:${category.id}`);
              return (
                <section className="topic-group" key={group.id}>
                  <button
                    type="button"
                    className={`topic-group-toggle ${active ? "active" : ""}`}
                    aria-expanded={expanded}
                    aria-controls={`topic-group-${group.id}`}
                    onClick={() => setExpandedSubjectGroup(expanded ? "" : group.id)}
                  >
                    <span className="topic-group-icon" aria-hidden="true">{group.icon}</span>
                    <span className="topic-group-title">{group.label}</span>
                    <span className="topic-group-count">{completedGroupLessons}/{groupLessons.length}</span>
                    <span className="topic-group-chevron" aria-hidden="true">⌄</span>
                  </button>
                  {expanded && (
                    <div className="topic-group-items" id={`topic-group-${group.id}`}>
                      {groupCategories.map((category) => (
                        <button key={category.id} type="button" className={`topic-link ${view === `topic:${category.id}` ? "active" : ""}`} onClick={() => navigate(`topic:${category.id}`)}>
                          <span className="nav-icon">{category.icon}</span>{category.label}
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </nav>
          <div className="sidebar-bottom">
            <div className="streak-card"><span className="streak-icon">✦</span><span className="streak-copy"><strong>À ton rythme</strong><small>La régularité vaut mieux que la vitesse.</small></span><span className="streak-arrow">♪</span></div>
            <button type="button" className="profile-button" onClick={logout} title="Se déconnecter">
              <span className="avatar">{firstName.slice(0, 1).toUpperCase()}</span>
              <span className="profile-details"><strong>{user.displayName}</strong><small>{user.email}</small></span><span className="profile-menu-icon">···</span>
            </button>
            <button type="button" className="logout-button" onClick={logout}>Se déconnecter <span>↗</span></button>
          </div>
        </aside>
        <main className="main-content">
          <header className="topbar">
            <div className="breadcrumb"><span>Mon espace</span><span className="breadcrumb-divider">/</span><strong>{breadcrumb}</strong></div>
            <div className="topbar-right"><span className="date-label">{dateLabel}</span><span className="header-avatar">{firstName.slice(0, 1).toUpperCase()}</span></div>
          </header>
          <div className="page-content page-enter">
            {view === "overview" && <Overview
              firstName={firstName} lessons={lessons} progress={progress} percent={percent}
              completed={completed} resumeLesson={resumeLesson} levels={levels}
              onLesson={setActiveLesson} onNavigate={navigate}
            />}
            {(view === "path" || view.startsWith("topic:")) && <PathView
              lessons={lessons} categories={categories} levels={levels} progress={progress}
              completedIds={completedIds} lessonsById={lessonsById}
              filter={filter} setFilter={setFilter} resumeLesson={resumeLesson}
              onLesson={setActiveLesson}
            />}
            {view === "practice" && <PracticePage onNavigate={navigate} />}
            {view === "videos" && <VideoLibrary lessons={lessons} lessonSteps={lessonSteps} onLesson={setActiveLesson} onPlaylist={() => navigate("playlist")} />}
            {view === "playlist" && <PlaylistPage
              lessons={lessons}
              categories={categories}
              onMarkStep={markStep}
              onError={notify}
              videoPreferences={videoPreferences}
              videoSettingsFor={videoSettingsFor}
              onVideoSettingChange={updateVideoSetting}
              onApplyToAllChange={updateApplyToAll}
            />}
          </div>
        </main>
      </div>
      {activeLesson && (
        <LessonModal
          key={activeLesson.id}
          lesson={activeLesson}
          steps={lessonSteps[activeLesson.id] || []}
          isCompleted={completed(activeLesson)}
          score={progressFor(activeLesson)?.score}
          onClose={() => setActiveLesson(null)}
          onMarkStep={markStep}
          onComplete={completeLesson}
          onAssessment={submitAssessment}
          onError={notify}
          videoSettings={videoSettingsFor(activeLesson.id)}
          applyVideoSettingsToAll={videoPreferences.applyToAll}
          onVideoSettingChange={updateVideoSetting}
          onApplyToAllChange={updateApplyToAll}
        />
      )}
      <div className={`toast ${toast ? "show" : ""}`} role="status">{toast}</div>
    </>
  );
}

function NavButton({ view, active, onClick, icon, children }) {
  return <button type="button" className={`nav-link ${active ? "active" : ""}`} onClick={() => onClick(view)}><span className="nav-icon">{icon}</span>{children}</button>;
}

function LessonCard({ lesson, done, score, onClick }) {
  return (
    <article className="lesson-card available" onClick={onClick} onKeyDown={(event) => event.key === "Enter" && onClick()} tabIndex={0} role="button">
      <div className="lesson-card-top"><span className={`lesson-icon tone-${lesson.color}`}>{lesson.icon}</span><span className={`lesson-status ${done ? "done" : ""}`}>{done ? "✓" : `${lesson.duration} min`}</span></div>
      <h3>{lesson.shortTitle}</h3><p>{lesson.description}</p>
      {done ? <div className="progress-bar"><span style={{ width: `${score || 100}%` }} /></div> : <div className="lesson-meta"><span>{lesson.categoryLabel}</span><span>À découvrir →</span></div>}
    </article>
  );
}

function Overview({ firstName, lessons, progress, percent, completed, resumeLesson, levels, onLesson, onNavigate }) {
  const doneIds = new Set(progress.map((entry) => entry.lessonId));
  const recommended = lessons.filter((lesson) => !doneIds.has(lesson.id)).slice(0, 3);
  const weekdayNames = ["L", "M", "M", "J", "V", "S", "D"];
  const mondayIndex = (new Date().getDay() + 6) % 7;
  if (!resumeLesson) return <div className="empty-state">Le parcours arrive bientôt.</div>;
  return (
    <>
      <div className="welcome-row">
        <div className="welcome-copy"><div className="eyebrow"><span className="eyebrow-dot" /> MERCI D’ÊTRE LÀ</div><h1>Salut {firstName} <span>✳</span></h1><p>Un peu de musique aujourd’hui ? Chaque note te fait avancer.</p></div>
        <div className="level-pill"><span>✦</span><span>{percent >= 100 ? "Parcours terminé" : `Niveau ${resumeLesson.level} · ${levels.find((level) => level.id === resumeLesson.level)?.title || ""}`}</span></div>
      </div>
      <div className="dashboard-grid">
        <section className="continue-card">
          <div className="continue-content">
            <div className="continue-kicker"><span>✦</span> {progress.length ? "ON CONTINUE ?" : "PRÊTE POUR TA PREMIÈRE LEÇON ?"}</div>
            <h2>{progress.length >= lessons.length ? "Quel beau voyage musical !" : resumeLesson.shortTitle}</h2>
            <p>{progress.length >= lessons.length ? "Toutes les étapes du parcours sont validées." : resumeLesson.description}</p>
            <button className="button button-light" onClick={() => onLesson(resumeLesson)}>{progress.length >= lessons.length ? "Rejouer une leçon" : "Continuer ma leçon"} <span>→</span></button>
          </div>
          <div className="continue-illustration" aria-hidden="true"><div className="illustration-circle" /><span className="illustration-note">♫</span><div className="mini-piano"><i /><i /><i /><i /><i /><i /><i /></div></div>
        </section>
        <section className="stats-card">
          <div className="stat-heading"><span>TON VOYAGE</span><strong>{percent}% accompli</strong></div>
          <div className="progress-visual"><div className="progress-ring" style={{ "--ring-progress": `${percent * 3.6}deg` }}><span>{progress.length}/{lessons.length}</span></div><div className="progress-copy"><strong>{progress.length ? "Bravo, tu avances !" : "À toi de jouer !"}</strong><span>{progress.length ? "Le meilleur arrive, continue à ton rythme." : "Ta première leçon n’attend que toi."}</span></div></div>
          <div className="stat-divider" /><div className="stat-topline">Ton petit rendez-vous musical</div>
          <div className="weekly-row">{weekdayNames.map((day, index) => <div key={index} className={`day-column ${index === mondayIndex ? "current" : ""}`}><span>{day}</span><span className="day-dot">{index === mondayIndex ? "♪" : ""}</span></div>)}</div>
        </section>
      </div>
      <div className="section-heading"><div><h2>{progress.length ? "Sur ton pupitre" : "Ton aventure commence par ici"}</h2><p>Un ordre suggéré, sans cadenas : tu peux aussi explorer librement.</p></div><button className="text-button" onClick={() => onNavigate("path")}>Voir l’ordre conseillé →</button></div>
      <div className="lesson-list">{recommended.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} done={doneIds.has(lesson.id)} score={progress.find((entry) => entry.lessonId === lesson.id)?.score} onClick={() => onLesson(lesson)} />)}</div>
      <div className="stats-strip">
        <StripItem icon="𝄞" title="Le solfège te guide" text="Les notes deviennent tes repères." />
        <StripItem icon="♬" title="Le piano te répond" text="Tu relies ce que tu lis à ce que tu joues." />
        <StripItem icon="✧" title="Chaque étape compte" text="Les bases te portent vers la suite." />
      </div>
    </>
  );
}

function StripItem({ icon, title, text }) {
  return <div className="strip-item"><span className="strip-icon">{icon}</span><span className="strip-copy"><strong>{title}</strong><small>{text}</small></span></div>;
}

function PathView({ lessons, categories, levels, progress, completedIds, lessonsById, filter, setFilter, resumeLesson, onLesson }) {
  const filtered = filter === "all" ? lessons : lessons.filter((lesson) => lesson.category === filter);
  const percent = lessons.length ? Math.round(progress.length / lessons.length * 100) : 0;
  const groups = filter === "all"
    ? (levels.length ? levels : [...new Set(lessons.map((lesson) => lesson.level))].map((id) => ({ id, title: `Niveau ${id}` })))
    : [];
  const filteredCategory = categories.find((category) => category.id === filter);
  const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  return (
    <>
      <div className="eyebrow"><span className="eyebrow-dot" /> UN FIL CONDUCTEUR, SANS CADENAS</div>
      <h1 className="page-title">{filter === "all" ? "Ordre conseillé" : `Cap sur ${filteredCategory?.label.toLowerCase() || "cette matière"}`}</h1>
      <p className="page-description">Le cursus relie solfège, écoute, théorie et piano pour construire des bases solides. Suis l’ordre proposé pour garder le fil, ou ouvre directement n’importe quelle leçon par curiosité.</p>
      <section className="path-hero">
        <div className="eyebrow"><span>✦</span> {resumeLesson ? `ORDRE SUGGÉRÉ · NIVEAU ${resumeLesson.level} · ${resumeLesson.levelName || "EN COURS"}` : "PARCOURS TERMINÉ"}</div>
        <h2>Comprendre. Écouter. Jouer.</h2><p>{percent}% de ton parcours musical parcouru. Les étapes sont des conseils : toutes les leçons restent accessibles.</p>
        <div className="path-hero-meta"><span>✧ {progress.length}/{lessons.length} leçons</span><span>◷ {totalMinutes} min de pratique guidée</span><span>♫ Solfège · Piano · Écoute</span></div>
      </section>
      <div className="section-heading"><div><h2>Le fil recommandé</h2><p>Les numéros indiquent un ordre utile, pas un verrouillage.</p></div></div>
      <div className="filter-row">
        {[{ id: "all", label: "Tout le parcours" }, ...categories.map((category) => ({ id: category.id, label: category.label }))].map((item) => <button key={item.id} className={`filter-chip ${filter === item.id ? "active" : ""}`} onClick={() => setFilter(item.id)}>{item.label}</button>)}
      </div>
      {filter === "all" ? groups.map((level) => {
        const stageLessons = filtered.filter((lesson) => lesson.level === level.id);
        if (!stageLessons.length) return null;
        const stageDone = stageLessons.filter((lesson) => completedIds.has(lesson.id)).length;
        return <section className="stage-section" key={level.id}>
          <div className="stage-heading"><div><span className="stage-number">{String(level.id).padStart(2, "0")}</span><span><strong>{level.title}</strong><small>{LEVEL_DESCRIPTIONS[level.id - 1] || "Un nouveau chapitre de ton parcours musical."}</small></span></div><span className="stage-counter">{stageDone}/{stageLessons.length} leçons</span></div>
          <div className="path-list">{stageLessons.map((lesson) => <PathRow key={lesson.id} lesson={lesson} index={lessons.indexOf(lesson) + 1} done={completedIds.has(lesson.id)} progress={progress.find((entry) => entry.lessonId === lesson.id)} recommendedAfter={(lesson.requires || []).map((id) => lessonsById.get(id)?.shortTitle).filter(Boolean)} onClick={() => onLesson(lesson)} />)}</div>
        </section>;
      }) : <div className="path-list">{filtered.map((lesson) => <PathRow key={lesson.id} lesson={lesson} index={lessons.indexOf(lesson) + 1} done={completedIds.has(lesson.id)} progress={progress.find((entry) => entry.lessonId === lesson.id)} recommendedAfter={(lesson.requires || []).map((id) => lessonsById.get(id)?.shortTitle).filter(Boolean)} onClick={() => onLesson(lesson)} />)}</div>}
    </>
  );
}

function PathRow({ lesson, index, done, progress, recommendedAfter, onClick }) {
  return <article className="path-row available" onClick={onClick} onKeyDown={(event) => event.key === "Enter" && onClick()} tabIndex={0} role="button">
    <span className={`path-row-icon tone-${lesson.color}`}>{done ? "✓" : lesson.icon}</span>
    <span className="path-row-copy"><h3>{index}. {lesson.title}</h3><p>{lesson.description}{recommendedAfter.length > 0 && <small className="path-recommendation">Fil conseillé : après {recommendedAfter.join(", ")} · ouvre-la quand tu veux.</small>}</p></span>
    <span className="path-row-meta">{done ? <strong className="row-done">{progress?.score ?? 100}%</strong> : <span>{lesson.duration} min</span>}<span>→</span></span>
  </article>;
}

function PracticePage({ onNavigate }) {
  const [lastNote, setLastNote] = useState("");
  const [audioError, setAudioError] = useState("");
  async function playNote(note, pitch) {
    try {
      await playTone(pitch, 0.55);
      setLastNote(note);
      setAudioError("");
    } catch {
      setAudioError("Le navigateur ne permet pas de lancer le son. Vérifie les réglages audio de ton appareil.");
    }
  }
  return <>
    <div className="eyebrow"><span className="eyebrow-dot" /> TON INSTRUMENT, TOUJOURS À PORTÉE DE MAIN</div>
    <h1 className="page-title">Le clavier</h1>
    <p className="page-description">Explore les notes et entraîne ton oreille. Dans les leçons, chaque clavier te guide vers les sons de l’exercice.</p>
    <section className="keyboard-panel">
      <div className="keyboard-top"><div><h2>Les notes du clavier</h2><p>Appuie sur une touche pour entendre sa note.</p></div><span className="keyboard-octave">Une octave · Do à Do</span></div>
      <PianoKeyboard onNote={(note, pitch) => playNote(note, pitch)} />
      <p className="keyboard-feedback" aria-live="polite">{audioError || (lastNote ? `Tu viens de jouer ${lastNote}.` : "Prends le temps d’écouter chaque son.")}</p>
    </section>
    <section className="practice-hint"><span className="practice-hint-icon">✦</span><div><strong>Un repère à garder</strong><p>Les touches noires portent deux noms possibles. Par exemple, Sol♯ et La♭ désignent la même touche : on parle d’équivalence enharmonique.</p></div></section>
    <div className="section-heading"><div><h2>Prêt·e pour la suite ?</h2><p>Les exercices des leçons s’adaptent aux notions que tu viens d’étudier.</p></div><button className="text-button" onClick={() => onNavigate("path")}>Reprendre mon parcours →</button></div>
  </>;
}

function VideoLibrary({ lessons, lessonSteps, onLesson, onPlaylist }) {
  return <>
    <div className="eyebrow"><span className="eyebrow-dot" /> DES CAPSULES ORIGINALES, CRÉÉES POUR TON PARCOURS</div>
    <h1 className="page-title">La vidéothèque</h1>
    <p className="page-description">Des animations et des textes intégrés, pensés pour éclairer les notions du cursus. La lecture vocale utilise, si tu le souhaites, une voix française de ton appareil. Choisis une capsule pour ouvrir sa leçon complète.</p>
    <section className="path-hero video-note"><div className="eyebrow"><span>♫</span> APPRENDRE EN IMAGES ET EN SONS</div><h2>Regarder, écouter, puis essayer.</h2><p>Chaque capsule est originale et reliée à une pratique au piano : pas de liens externes, pas de vidéos hors sujet.</p><button className="button button-dark" type="button" onClick={onPlaylist}>Choisir une matière pour sa playlist <span>→</span></button></section>
    <div className="video-library-grid">{lessons.map((lesson) => {
      const videoComplete = (lessonSteps[lesson.id] || []).includes("video");
      const progress = videoComplete ? 100 : 0;
      return <button key={lesson.id} className="video-library-card" onClick={() => onLesson(lesson)}>
        <span className="video-library-art"><VideoVisual visual={lesson.video.visual} sceneIndex={0} /></span>
        <span className="video-library-info"><span className="eyebrow">{lesson.categoryLabel} · {lesson.duration} MIN</span><strong>{lesson.video.title}</strong><small>{lesson.shortTitle}</small></span>
        <span className="video-library-play" aria-label="Ouvrir la capsule">▶</span>
        <span className="video-library-progress-row">
          <span>{videoComplete ? "Capsule terminée" : "Capsule à regarder"}</span>
          <span className={`video-library-progress ${videoComplete ? "complete" : ""}`} role="progressbar" aria-label={`Progression de la capsule « ${lesson.shortTitle} »`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </span>
        </span>
      </button>;
    })}</div>
  </>;
}

function VideoPlaybackControls({
  videoCurrentTime,
  videoDuration,
  videoPlaying,
  isFullscreen,
  volume,
  playbackRate,
  applyToAll,
  onTogglePlayback,
  onToggleFullscreen,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange,
  onApplyToAllChange
}) {
  return <>
    <div className="lesson-video-controls">
      <button type="button" className="video-control-button" onClick={onTogglePlayback} disabled={!videoDuration} aria-label={videoPlaying ? "Mettre la vidéo en pause" : "Lire la vidéo"}>
        <span aria-hidden="true">{videoPlaying ? "Ⅱ" : "▶"}</span>
        <span>{videoPlaying ? "Pause" : "Lecture"}</span>
      </button>
      <input
        type="range"
        min="0"
        max={videoDuration || 0.1}
        step="0.1"
        value={Math.min(videoCurrentTime, videoDuration || 0)}
        onChange={(event) => onSeek(Number(event.target.value))}
        disabled={!videoDuration}
        aria-label="Progression de la vidéo"
        aria-valuetext={`${formatTime(videoCurrentTime)} sur ${formatTime(videoDuration)}`}
      />
      <span className="video-time-label">{formatTime(videoCurrentTime)} / {formatTime(videoDuration)}</span>
      <button
        type="button"
        className="video-control-button video-fullscreen-button"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? "Quitter le plein écran" : "Mettre la vidéo en plein écran"}
        aria-pressed={isFullscreen}
        title={isFullscreen ? "Quitter le plein écran" : "Mettre la vidéo en plein écran"}
      >
        <span aria-hidden="true">{isFullscreen ? "⛶" : "⛶"}</span>
        <span>{isFullscreen ? "Quitter" : "Plein écran"}</span>
      </button>
    </div>
    <div className="video-settings-controls">
      <label className="video-setting-control">
        <span>Volume <output>{Math.round(volume * 100)} %</output></span>
        <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => onVolumeChange(Number(event.target.value))} aria-label="Volume de la vidéo" />
      </label>
      <label className="video-setting-control">
        <span>Vitesse</span>
        <select value={playbackRate} onChange={(event) => onPlaybackRateChange(Number(event.target.value))} aria-label="Vitesse de lecture">
          {PLAYBACK_RATES.map((rate) => <option key={rate} value={rate}>{rate.toLocaleString("fr-FR")}×</option>)}
        </select>
      </label>
      <label className="video-global-setting">
        <input type="checkbox" checked={applyToAll} onChange={(event) => onApplyToAllChange(event.target.checked)} />
        <span>{applyToAll ? "Appliquer ces réglages à toutes les vidéos" : "Réglages propres à cette vidéo"}</span>
      </label>
    </div>
  </>;
}

function PlaylistPage({
  lessons,
  categories,
  onMarkStep,
  onError,
  videoPreferences,
  videoSettingsFor,
  onVideoSettingChange,
  onApplyToAllChange
}) {
  const playlistCategories = categories.filter((category) =>
    lessons.some((lesson) => lesson.category === category.id && lesson.video?.url)
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(() =>
    lessons.find((lesson) => lesson.video?.url)?.category || ""
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [playlistComplete, setPlaylistComplete] = useState(false);
  const [videoError, setVideoError] = useState("");
  const videoRef = useRef(null);
  const videoStageRef = useRef(null);
  const countdownTimer = useRef(null);
  const pendingAutoPlay = useRef(false);
  const selectedCategory = playlistCategories.find((category) => category.id === selectedCategoryId) || playlistCategories[0];
  const playlistLessons = selectedCategory
    ? lessons.filter((lesson) => lesson.category === selectedCategory.id && lesson.video?.url)
    : [];
  const selectedLesson = playlistLessons[selectedIndex];
  const nextLesson = playlistLessons[selectedIndex + 1];
  const videoSettings = selectedLesson ? videoSettingsFor(selectedLesson.id) : DEFAULT_VIDEO_SETTINGS;
  const { isFullscreen, toggleFullscreen } = useVideoFullscreen(videoStageRef, videoRef, setVideoError, selectedLesson?.id);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = videoSettings.volume;
    video.playbackRate = videoSettings.playbackRate;
  }, [selectedLesson?.id, videoSettings.volume, videoSettings.playbackRate]);

  useEffect(() => () => {
    window.clearInterval(countdownTimer.current);
    videoRef.current?.pause();
  }, []);

  function cancelCountdown() {
    window.clearInterval(countdownTimer.current);
    countdownTimer.current = null;
    setCountdown(null);
  }

  function seekVideo(seconds) {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.min(video.duration, Math.max(0, seconds));
    setVideoCurrentTime(video.currentTime);
  }

  async function toggleVideoPlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setVideoError("");
      } catch {
        setVideoError("La lecture automatique a été bloquée. Appuie sur Lecture pour continuer.");
      }
    } else {
      video.pause();
    }
  }

  function selectLesson(index, shouldPlay = true) {
    cancelCountdown();
    setPlaylistComplete(false);
    setVideoError("");
    if (index === selectedIndex) {
      if (shouldPlay) void toggleVideoPlayback();
      return;
    }
    if (shouldPlay) pendingAutoPlay.current = true;
    setSelectedIndex(index);
    setVideoCurrentTime(0);
    setVideoDuration(0);
    setVideoPlaying(false);
  }

  function selectCategory(categoryId) {
    if (categoryId === selectedCategory?.id) return;
    cancelCountdown();
    videoRef.current?.pause();
    pendingAutoPlay.current = false;
    setSelectedCategoryId(categoryId);
    setSelectedIndex(0);
    setPlaylistComplete(false);
    setVideoError("");
    setVideoCurrentTime(0);
    setVideoDuration(0);
    setVideoPlaying(false);
  }

  function handleVideoEnded() {
    setVideoPlaying(false);
    setVideoCurrentTime(videoDuration);
    void onMarkStep(selectedLesson, "video").catch((error) => onError(error.message));
    if (!nextLesson) {
      setPlaylistComplete(true);
      return;
    }

    cancelCountdown();
    setCountdown(5);
    let remaining = 5;
    countdownTimer.current = window.setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        window.clearInterval(countdownTimer.current);
        countdownTimer.current = null;
        setCountdown(null);
        pendingAutoPlay.current = true;
        setSelectedIndex((current) => current + 1);
        setVideoCurrentTime(0);
        setVideoDuration(0);
      } else {
        setCountdown(remaining);
      }
    }, 1000);
  }

  if (!selectedLesson) return <div className="empty-state">Aucune vidéo n’est disponible dans cette playlist.</div>;

  return <>
    <div className="eyebrow"><span className="eyebrow-dot" /> UNE PLAYLIST PAR MATIÈRE</div>
    <h1 className="page-title">La playlist · {selectedCategory?.label}</h1>
    <p className="page-description">Choisis une matière : chaque playlist ne contient que ses propres capsules, dans l’ordre du cursus. À la fin d’une vidéo, un compte à rebours de cinq secondes te laisse le temps d’annuler le passage à la suivante.</p>
    <div className="playlist-course-picker">
      <label htmlFor="playlist-category">Matière de la playlist<small>Les vidéos des autres matières restent séparées.</small></label>
      <select id="playlist-category" value={selectedCategory?.id || ""} onChange={(event) => selectCategory(event.target.value)} aria-label="Matière de la playlist">
        {playlistCategories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}
      </select>
    </div>
    <div className="playlist-layout">
      <section className="playlist-player-card">
        <div className="playlist-player-heading">
          <div><span className="eyebrow">VIDÉO {selectedIndex + 1} / {playlistLessons.length} · {selectedLesson.categoryLabel}</span><h2>{selectedLesson.video.title}</h2><p>{selectedLesson.shortTitle}</p></div>
          <button type="button" className="button button-dark" onClick={toggleVideoPlayback} disabled={!videoDuration}>{videoPlaying ? "Pause" : "Lire la playlist"} <span>{videoPlaying ? "Ⅱ" : "▶"}</span></button>
        </div>
        <div ref={videoStageRef} className="lesson-video-player-shell">
          <div className="lesson-video-frame playlist-video-frame">
            <video
              key={selectedLesson.id}
              ref={videoRef}
              className="lesson-video-player"
              src={selectedLesson.video?.url}
              preload="metadata"
              playsInline
              controlsList="nodownload"
              disablePictureInPicture
              onContextMenu={(event) => event.preventDefault()}
              aria-label={`Vidéo de cours : ${selectedLesson.video?.title || selectedLesson.title}`}
              onLoadedMetadata={(event) => {
                const video = event.currentTarget;
                setVideoDuration(Number.isFinite(video.duration) ? video.duration : 0);
                video.volume = videoSettings.volume;
                video.playbackRate = videoSettings.playbackRate;
                if (pendingAutoPlay.current) {
                  pendingAutoPlay.current = false;
                  void video.play().then(() => setVideoError("")).catch(() => {
                    setVideoError("La lecture automatique a été bloquée. Appuie sur Lecture pour continuer.");
                  });
                }
              }}
              onTimeUpdate={(event) => setVideoCurrentTime(event.currentTarget.currentTime)}
              onPlay={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onEnded={handleVideoEnded}
              onError={() => setVideoError("La capsule vidéo n’a pas pu être chargée. Réessaie dans quelques instants.")}
            />
            {countdown !== null && nextLesson && <div className="playlist-countdown" role="status" aria-live="assertive">
              <span>Prochaine vidéo dans <strong>{countdown}</strong> seconde{countdown > 1 ? "s" : ""} : {nextLesson.shortTitle}</span>
              <button type="button" onClick={cancelCountdown}>Annuler</button>
            </div>}
            {playlistComplete && <div className="playlist-countdown" role="status">
              <span>Tu as terminé la playlist. Bravo !</span>
              <button type="button" onClick={() => selectLesson(0)}>Recommencer</button>
            </div>}
          </div>
          <VideoPlaybackControls
            videoCurrentTime={videoCurrentTime}
            videoDuration={videoDuration}
            videoPlaying={videoPlaying}
            isFullscreen={isFullscreen}
            volume={videoSettings.volume}
            playbackRate={videoSettings.playbackRate}
            applyToAll={videoPreferences.applyToAll}
            onTogglePlayback={toggleVideoPlayback}
            onToggleFullscreen={toggleFullscreen}
            onSeek={seekVideo}
            onVolumeChange={(value) => {
              if (videoRef.current) videoRef.current.volume = value;
              onVideoSettingChange(selectedLesson.id, "volume", value);
            }}
            onPlaybackRateChange={(value) => {
              if (videoRef.current) videoRef.current.playbackRate = value;
              onVideoSettingChange(selectedLesson.id, "playbackRate", value);
            }}
            onApplyToAllChange={(value) => onApplyToAllChange(selectedLesson.id, value)}
          />
        </div>
        <p className="video-feedback" aria-live="polite">{videoError || `Playlist ${selectedCategory?.label} : les vidéos des autres matières ne seront pas ajoutées à cette file.`}</p>
        <div className="playlist-skip-controls">
          <button type="button" className="video-control-button" disabled={selectedIndex === 0} onClick={() => selectLesson(selectedIndex - 1)}>← Précédente</button>
          <button type="button" className="video-control-button" disabled={!nextLesson} onClick={() => selectLesson(selectedIndex + 1)}>Suivante →</button>
        </div>
      </section>
      <aside className="playlist-queue">
        <div className="playlist-queue-heading"><h2>À suivre · {selectedCategory?.label}</h2><span>{playlistLessons.length} capsules</span></div>
        <div className="playlist-queue-list" aria-label="Vidéos de la playlist">
          {playlistLessons.map((lesson, index) => <button
            key={lesson.id}
            type="button"
            className={`playlist-queue-item ${index === selectedIndex ? "active" : ""}`}
            onClick={() => selectLesson(index)}
            aria-current={index === selectedIndex ? "true" : undefined}
          >
            <span className="playlist-queue-number">{index < selectedIndex ? "✓" : String(index + 1).padStart(2, "0")}</span>
            <span className="playlist-queue-copy"><strong>{lesson.shortTitle}</strong><small>{lesson.categoryLabel} · {lesson.duration} min</small></span>
            <span aria-hidden="true">{index === selectedIndex && videoPlaying ? "♫" : "▶"}</span>
          </button>)}
        </div>
      </aside>
    </div>
  </>;
}

function VideoVisual({ visual, sceneIndex }) {
  const accent = ["#f3bb91", "#d9d3f0", "#b8d7c3"][sceneIndex % 3];
  const className = `scene-graphic scene-${visual || "keyboard"}`;
  if (visual === "staff") return <svg className={className} viewBox="0 0 600 260" role="img" aria-label="Animation de portée musicale">
    {[75, 100, 125, 150, 175].map((y) => <line key={y} x1="75" x2="525" y1={y} y2={y} stroke="#ffffff55" strokeWidth="2" />)}
    <text x="88" y="157" fill="#ffffffd6" fontSize="80" fontFamily="serif">𝄞</text>
    {[0, 1, 2, 3, 4].map((i) => <g key={i} className="note-float" style={{ animationDelay: `${i * 160}ms` }}><ellipse cx={220 + i * 58} cy={142 - (i % 3) * 20} rx="13" ry="9" fill={i === sceneIndex % 5 ? accent : "#ffffffd8"} transform={`rotate(-18 ${220 + i * 58} ${142 - (i % 3) * 20})`} /><line x1={230 + i * 58} x2={230 + i * 58} y1={142 - (i % 3) * 20} y2={76 - (i % 3) * 20} stroke="#ffffffd8" strokeWidth="3" /></g>)}
  </svg>;
  if (visual === "hands") return <svg className={className} viewBox="0 0 600 260" role="img" aria-label="Animation du geste au piano">
    <rect x="99" y="145" width="402" height="65" rx="8" fill="#fff" opacity=".94" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1={151 + i * 50} x2={151 + i * 50} y1="146" y2="207" stroke="#ded9e9" />)}
    <path d="M225 116 C235 66 263 68 272 115 L282 76 C289 42 315 46 318 81 L324 112 L334 69 C341 39 367 45 367 80 L369 115 L383 86 C397 59 419 70 411 100 L396 150 L245 152 Z" fill={accent} className="hand-wave" />
    <path d="M243 152 Q300 140 397 150" fill="none" stroke="#ffffffaa" strokeWidth="4" />
  </svg>;
  if (visual === "scale") return <svg className={className} viewBox="0 0 600 260" role="img" aria-label="Animation de notes qui montent">
    <path d="M90 195 Q290 200 510 60" fill="none" stroke="#ffffff54" strokeWidth="3" strokeDasharray="7 9" />
    {["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"].map((note, i) => <g key={note} className="scale-step" style={{ animationDelay: `${i * 90}ms` }}><circle cx={105 + i * 63} cy={180 - i * 18} r="18" fill={i === sceneIndex % 7 ? accent : "#ffffffd9"} /><text x={105 + i * 63} y={185 - i * 18} fill="#514783" textAnchor="middle" fontSize="10" fontWeight="700">{note}</text></g>)}
  </svg>;
  return <svg className={className} viewBox="0 0 600 260" role="img" aria-label="Animation d’un clavier de piano">
    <circle cx="300" cy="130" r="95" fill="none" stroke="#ffffff38" strokeWidth="2" /><circle cx="300" cy="130" r="70" fill="none" stroke="#ffffff38" strokeWidth="2" />
    <text x="300" y="111" textAnchor="middle" fill={accent} fontSize="38" fontFamily="serif">♫</text>
    <rect x="190" y="136" width="220" height="60" rx="6" fill="#fff" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1={217 + i * 27} x2={217 + i * 27} y1="138" y2="193" stroke="#ded9e9" />)}
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={231 + i * 54} y="137" width="13" height="35" rx="2" fill={i === sceneIndex % 5 ? "#e5a883" : "#383444"} />)}
  </svg>;
}

function LessonModal({
  lesson,
  steps,
  isCompleted,
  score,
  onClose,
  onMarkStep,
  onComplete,
  onAssessment,
  onError,
  videoSettings,
  applyVideoSettingsToAll,
  onVideoSettingChange,
  onApplyToAllChange
}) {
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceMessage, setPracticeMessage] = useState("");
  const [savingStep, setSavingStep] = useState("");
  const [answers, setAnswers] = useState([]);
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [submittingAssessment, setSubmittingAssessment] = useState(false);
  const modalRef = useRef(null);
  const videoRef = useRef(null);
  const videoStageRef = useRef(null);
  const { isFullscreen, toggleFullscreen } = useVideoFullscreen(videoStageRef, videoRef, setVideoError, lesson.id);
  const isEvaluation = lesson.category === "evaluation";
  const lessonSteps = lessonStepsFor(steps);
  const practiceNotes = lesson.practice?.notes || [];
  const completeActivity = practiceIndex >= practiceNotes.length;
  const sceneTimings = lesson.video?.sectionTimings || [];
  const sceneCount = sceneTimings.length || lesson.video?.scenes?.length || 1;
  const matchedSceneIndex = sceneTimings.reduce(
    (active, scene, index) => videoCurrentTime >= scene.startSeconds ? index : active,
    0
  );
  const activeSceneIndex = sceneTimings.length
    ? matchedSceneIndex
    : Math.min(sceneCount - 1, Math.floor(videoDuration > 0 ? videoCurrentTime / videoDuration * sceneCount + 1e-6 : 0));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = videoSettings.volume;
    video.playbackRate = videoSettings.playbackRate;
  }, [lesson.id, videoSettings.volume, videoSettings.playbackRate]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event) { if (event.key === "Escape" && !document.fullscreenElement && !videoRef.current?.webkitDisplayingFullscreen) onClose(); }
    window.addEventListener("keydown", onKey);
    modalRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      videoRef.current?.pause();
    };
  }, []);

  async function saveStep(stepId) {
    setSavingStep(stepId);
    try {
      await onMarkStep(lesson, stepId);
    } catch (error) {
      onError(error.message);
    } finally {
      setSavingStep("");
    }
  }

  function updateVideoTime(event) {
    setVideoCurrentTime(event.currentTarget.currentTime);
  }

  function seekVideo(seconds) {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    const nextTime = Math.min(video.duration, Math.max(0, seconds));
    video.currentTime = nextTime;
    setVideoCurrentTime(nextTime);
  }

  async function toggleVideoPlayback() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setVideoError("");
      } catch {
        setVideoError("La lecture de la capsule n’a pas pu démarrer. Réessaie ou consulte sa transcription.");
      }
    } else {
      video.pause();
    }
  }

  function completeVideo() {
    setVideoPlaying(false);
    setVideoCurrentTime(videoDuration);
    if (!lessonSteps.includes("video")) void saveStep("video");
  }

  async function handleKey(note, pitch) {
    try {
      await playTone(pitch, 0.28);
      const expected = practiceNotes[practiceIndex];
      if (!expected) return;
      if (pitchClass(note) === pitchClass(expected)) {
        const nextIndex = practiceIndex + 1;
        setPracticeIndex(nextIndex);
        setPracticeMessage(nextIndex === practiceNotes.length ? "Bravo, tu as terminé la phrase ! Étape validée." : `Oui, ${expected} ! Cherche maintenant ${practiceNotes[nextIndex]}.`);
        if (nextIndex === practiceNotes.length && !lessonSteps.includes("practice")) await saveStep("practice");
      } else {
        setPracticeMessage(`Écoute bien la touche jouée. La note recherchée est ${expected}.`);
      }
    } catch {
      setPracticeMessage("Le son n’a pas pu être lancé. Vérifie les réglages audio.");
    }
  }

  async function submitAnswers(event) {
    event.preventDefault();
    setSubmittingAssessment(true);
    try {
      const result = await onAssessment(lesson, answers);
      setAssessmentResult(result);
    } catch (error) {
      onError(error.message);
    } finally {
      setSubmittingAssessment(false);
    }
  }

  const allStepsDone = ["reading", "video", "practice"].every((step) => lessonSteps.includes(step));
  const questionCount = lesson.questions?.length || 0;
  const answeredAll = questionCount > 0 && answers.filter((answer) => answer !== undefined).length === questionCount;

  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <article className="lesson-modal" ref={modalRef} tabIndex={-1} aria-labelledby="lesson-title">
      <button className="modal-close" type="button" onClick={onClose} aria-label="Fermer la leçon">×</button>
      <header className="course-header">
        <div className="modal-eyebrow"><span className="eyebrow-dot" /> NIVEAU {lesson.level} · {lesson.categoryLabel} · {lesson.duration} MIN</div>
        <span className={`modal-lesson-icon tone-${lesson.color}`}>{lesson.icon}</span>
        <h2 id="lesson-title">{lesson.title}</h2><p>{lesson.objective || lesson.description}</p>
        <div className="course-progress">{STEP_NAMES.map(([id, title], index) => <div key={id} className={`course-progress-step ${lessonSteps.includes(id) ? "done" : ""}`}><span>{lessonSteps.includes(id) ? "✓" : index + 1}</span>{title}</div>)}</div>
      </header>
      <div className="course-body">
        <section>
          <CourseSection number="01" title="Comprendre" subtitle="Prends le temps de lire et de relier les idées." />
          <div className="teaching-blocks">{(lesson.blocks || []).map((block, index) => <article key={`${block.title}-${index}`} className="teaching-block"><span className="teaching-index">{String(index + 1).padStart(2, "0")}</span><div><h4>{block.title}</h4><p>{block.text}</p>{block.images?.length > 0 && <div className="teaching-images">{block.images.map((image) => <figure className="teaching-image" key={image.src}><img src={image.src} alt={image.alt} loading="lazy" /><figcaption><span>{image.caption}</span><small>{image.credit} <a href={image.sourceUrl} target="_blank" rel="noreferrer">Voir la notice</a></small></figcaption></figure>)}</div>}</div></article>)}</div>
          {!lessonSteps.includes("reading") ? <button className="step-done-button" type="button" onClick={() => saveStep("reading")} disabled={savingStep === "reading"}>{savingStep === "reading" ? "Enregistrement…" : "J’ai terminé la lecture ✓"}</button> : <button className="step-done-button done" type="button" disabled>Lecture terminée ✓</button>}
        </section>
        <section>
          <CourseSection number="02" title="Regarder & écouter" subtitle="Une vidéo de cours originale avec narration française. Utilise la barre pour suivre ou reprendre la lecture." />
          <div ref={videoStageRef} className="lesson-video-player-shell">
            <div className="lesson-video-frame">
              <video
                ref={videoRef}
                className="lesson-video-player"
                src={lesson.video?.url}
                preload="auto"
                playsInline
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={(event) => event.preventDefault()}
                aria-label={`Vidéo de cours : ${lesson.video?.title || lesson.title}`}
                onLoadedMetadata={(event) => {
                  const duration = event.currentTarget.duration;
                  setVideoDuration(Number.isFinite(duration) ? duration : 0);
                  event.currentTarget.volume = videoSettings.volume;
                  event.currentTarget.playbackRate = videoSettings.playbackRate;
                }}
                onTimeUpdate={updateVideoTime}
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
                onEnded={completeVideo}
                onError={() => setVideoError("La capsule vidéo n’a pas pu être chargée. Réessaie ou consulte sa transcription.")}
              />
            </div>
            <VideoPlaybackControls
              videoCurrentTime={videoCurrentTime}
              videoDuration={videoDuration}
              videoPlaying={videoPlaying}
              isFullscreen={isFullscreen}
              volume={videoSettings.volume}
              playbackRate={videoSettings.playbackRate}
              applyToAll={applyVideoSettingsToAll}
              onTogglePlayback={toggleVideoPlayback}
              onToggleFullscreen={toggleFullscreen}
              onSeek={seekVideo}
              onVolumeChange={(value) => {
                if (videoRef.current) videoRef.current.volume = value;
                onVideoSettingChange(lesson.id, "volume", value);
              }}
              onPlaybackRateChange={(value) => {
                if (videoRef.current) videoRef.current.playbackRate = value;
                onVideoSettingChange(lesson.id, "playbackRate", value);
              }}
              onApplyToAllChange={(value) => onApplyToAllChange(lesson.id, value)}
            />
          </div>
          <p className="video-feedback" aria-live="polite">{videoError || "La narration est intégrée à la vidéo. Tu peux mettre en pause ou déplacer la tête de lecture."}</p>
          <div className="scene-selector" aria-label="Scènes de la capsule">
            {(lesson.video?.scenes || []).map((scene, index) => <button key={`${scene}-${index}`} type="button" className={`scene-selector-button ${index === activeSceneIndex ? "active" : ""}`} onClick={() => seekVideo(sceneTimings[index]?.startSeconds ?? videoDuration * index / sceneCount)} disabled={!videoDuration} aria-label={`Aller à ${scene}`} aria-pressed={index === activeSceneIndex}>Étape {index + 1}</button>)}
          </div>
          <details className="narration-transcript"><summary>Lire la transcription complète</summary><p>{lesson.video?.script}</p></details>
          {lessonSteps.includes("video") && <button className="step-done-button done" type="button" disabled>Capsule terminée ✓</button>}
          {!lessonSteps.includes("video") && <button className="step-done-button" type="button" onClick={() => saveStep("video")} disabled={savingStep === "video"}>{savingStep === "video" ? "Enregistrement…" : "J’ai terminé la capsule ✓"}</button>}
        </section>
        <section>
          <CourseSection number="03" title="Pratiquer" subtitle={lesson.practice?.instruction || "À toi de mettre ces idées en musique."} />
          <div className="exercise-challenge">
            <div className="challenge-copy"><strong>{lesson.practice?.title || "À toi de jouer"}</strong><span>{practiceNotes.map((note, index) => <i key={`${note}-${index}`} className={index < practiceIndex ? "note-complete" : ""}>{note}</i>)}</span><small>{completeActivity ? "Phrase terminée" : `${practiceIndex}/${practiceNotes.length} notes`}</small></div>
            <div className="challenge-progress"><span style={{ width: `${practiceNotes.length ? practiceIndex / practiceNotes.length * 100 : 100}%` }} /></div>
            {lesson.practice?.kind === "rhythm" ? <RhythmPractice tempo={lesson.practice.tempo || 60} onComplete={() => { setPracticeIndex(practiceNotes.length || 1); setPracticeMessage("Bravo, exercice de rythme terminé."); if (!lessonSteps.includes("practice")) saveStep("practice"); }} /> : <PianoKeyboard onNote={handleKey} />}
            <p className="activity-feedback" aria-live="polite">{practiceMessage || (practiceNotes.length ? `Joue ${practiceNotes[practiceIndex] || "la phrase"} sur le clavier.` : "Répète l’exercice lentement, en restant détendu·e.")}</p>
          </div>
          {lessonSteps.includes("practice") && <button className="step-done-button done" type="button" disabled>Pratique terminée ✓</button>}
        </section>
        <section>
            <CourseSection number="04" title="À retenir" subtitle="Garde ces repères en tête ; reviens-y après ta pratique." />
            <ul className="takeaways-list">{(lesson.takeaways || []).map((takeaway, index) => <li key={`${takeaway}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{takeaway}</p></li>)}</ul>
        </section>
        <FurtherResources references={lesson.references} />
        {isEvaluation && <section className="assessment-section">
          <CourseSection number="05" title="Faire le bilan" subtitle="Une évaluation ponctuelle pour mesurer ce que tu sais déjà mobiliser." />
          {assessmentResult ? <div className="assessment-result-card" role="status">
            <strong>{assessmentResult.passed ? "Bilan validé ! 🎉" : "Continue à t’entraîner"}</strong>
            <span>{assessmentResult.score}% de réussite</span>
            <p>{assessmentResult.passed ? "Tu as franchi ce jalon. Les prochaines leçons sont débloquées." : "Il faut 70 % pour valider le bilan. Tu peux reprendre les questions après révision."}</p>
            {!assessmentResult.passed && <button type="button" className="step-done-button" onClick={() => { setAssessmentResult(null); setAnswers([]); }}>Réessayer le bilan</button>}
          </div> : <form onSubmit={submitAnswers} className="assessment-questions">
            {(lesson.questions || []).map((question, index) => <fieldset className="assessment-question" key={`${lesson.id}-${index}`}><legend>{index + 1}. {question.prompt}</legend><div className="assessment-options">{question.choices.map((choice) => <button type="button" key={choice} className={`assessment-choice ${answers[index] === choice ? "selected" : ""}`} onClick={() => setAnswers((current) => { const next = [...current]; next[index] = choice; return next; })}>{choice}</button>)}</div></fieldset>)}
            <div className="assessment-actions"><span>{answers.filter((answer) => answer !== undefined).length}/{questionCount} réponses</span><button className="button button-dark" type="submit" disabled={!answeredAll || submittingAssessment}>{submittingAssessment ? "Correction…" : "Valider le bilan"}</button></div>
          </form>}
        </section>}
        <section className="course-completion">
          <div><strong>{isCompleted ? "Cette leçon est déjà validée" : allStepsDone ? "Tu as terminé les trois étapes" : "Chaque étape construit la suivante"}</strong><p>{isCompleted ? `Meilleur résultat enregistré : ${score ?? 100} %.` : isEvaluation ? "Complète les étapes puis valide le bilan pour débloquer la suite." : "Lis, regarde et pratique. Tu pourras ensuite valider cette leçon."}</p></div>
          {!isEvaluation && <button type="button" className="button button-dark" disabled={!allStepsDone || isCompleted} onClick={() => onComplete(lesson)}>{isCompleted ? "Leçon validée ✓" : "Valider la leçon"}</button>}
          {isEvaluation && isCompleted && <span className="assessment-passed-label">Bilan réussi · {score}%</span>}
        </section>
      </div>
    </article>
  </div>;
}

function lessonStepsFor(steps) {
  return Array.isArray(steps) ? steps : [];
}

function CourseSection({ number, title, subtitle }) {
  return <div className="course-section-heading"><span className="course-section-number">{number}</span><span><h3>{title}</h3><p>{subtitle}</p></span></div>;
}

function FurtherResources({ references }) {
  const resources = [
    ...(references?.videos || []).map((item) => ({ ...item, type: "Vidéo gratuite", icon: "▷" })),
    ...(references?.reading || []).map((item) => ({ ...item, type: item.kind || "Lecture", icon: "↗" }))
  ];
  if (!resources.length) return null;
  return <section className="further-resources">
    <CourseSection number="04" title="Pour aller plus loin" subtitle="Des références gratuites et facultatives, choisies pour cette matière. Le cours ClaviTempo reste complet sans les ouvrir." />
    <div className="external-resource-grid">{resources.map((resource) => <a key={`${resource.url}-${resource.title}`} className="external-resource-card" href={resource.url} target="_blank" rel="noopener noreferrer">
      <span className="external-resource-icon" aria-hidden="true">{resource.icon}</span>
      <span className="external-resource-copy"><span className="external-resource-kicker">{resource.type} · {resource.language}</span><strong>{resource.title}</strong><small>{resource.source}</small><span className="external-resource-description">{resource.description}</span></span>
      <span className="external-resource-arrow" aria-hidden="true">↗</span>
    </a>)}</div>
    <p className="external-resource-note">Les liens ouvrent des sites externes. Les vidéos sont gratuites à regarder et peuvent comporter des publicités. Pour les livres numérisés et les partitions, le statut des éditions peut dépendre du pays.</p>
  </section>;
}

function PianoKeyboard({ onNote }) {
  return <div className="exercise-keyboard" role="group" aria-label="Clavier de piano interactif">
    <div className="exercise-white-keys">{WHITE_KEYS.map((key, index) => <button type="button" key={`${key.note}-${index}`} className="exercise-white-key" aria-label={`Jouer ${key.note}`} onClick={() => onNote(key.note, key.pitch)}><span>{key.label}</span></button>)}</div>
    {BLACK_KEYS.map((key) => <button type="button" key={key.note} className="exercise-black-key" style={{ left: `${(key.after + 1) / 8 * 100}%` }} aria-label={`Jouer ${key.note}`} onClick={() => onNote(key.note, key.pitch)} />)}
  </div>;
}

function RhythmPractice({ tempo, onComplete }) {
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(0);
  const [taps, setTaps] = useState(0);
  const [message, setMessage] = useState("Écoute le battement, puis marque quatre pulsations.");
  const timer = useRef(null);
  useEffect(() => () => window.clearInterval(timer.current), []);
  function start() {
    window.clearInterval(timer.current);
    setRunning(true);
    setBeat(0);
    setTaps(0);
    const interval = Math.max(300, 60000 / tempo);
    timer.current = window.setInterval(() => setBeat((current) => (current + 1) % 4), interval);
  }
  function tap() {
    const next = taps + 1;
    setTaps(next);
    if (next >= 4) {
      window.clearInterval(timer.current);
      setRunning(false);
      setMessage("Quatre pulsations régulières, bravo !");
      onComplete();
    } else setMessage(`${next}/4 pulsations. Garde le tempo.`);
  }
  return <div className="rhythm-practice"><div className="rhythm-display"><span className={`rhythm-pulse ${running ? "pulse" : ""}`} key={beat} /><strong>Tempo · ♩ = {tempo}</strong><small>{message}</small></div><div className="rhythm-actions"><button type="button" className="button rhythm-tap-button" onClick={start}>▶ Écouter le tempo</button><button type="button" className="button rhythm-tap-button" disabled={!running} onClick={tap}>● Marquer la pulsation</button></div></div>;
}

function pitchClass(note) {
  const clean = String(note || "").replace(/\d+/g, "").trim();
  return NOTE_PITCH[clean];
}

async function playTone(semitone, duration) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error("AudioContext unavailable");
  const context = new AudioContextClass();
  await context.resume();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = 261.63 * Math.pow(2, semitone / 12);
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration + 0.02);
  window.setTimeout(() => context.close(), (duration + 0.15) * 1000);
}

export default App;
