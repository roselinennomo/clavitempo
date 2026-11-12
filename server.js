const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const courseContent = require("./course-content");

const app = express();
const port = Number(process.env.PORT) || 3000;
const sessionSecret = process.env.SESSION_SECRET || "tempo-local-dev-change-me";
const databasePath = process.env.DB_PATH || path.join(__dirname, "data", "tempo.sqlite");

fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const database = new Database(databasePath);
database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");
database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS lesson_progress (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id)
  );
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS course_lessons (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(id),
    sequence INTEGER NOT NULL,
    title TEXT NOT NULL,
    level INTEGER NOT NULL,
    prerequisites_json TEXT NOT NULL,
    content_json TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS lesson_steps (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    step_id TEXT NOT NULL,
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id, step_id)
  );
  CREATE TABLE IF NOT EXISTS assessment_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    answers_json TEXT NOT NULL,
    attempted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const lessons = [
  {
    id: "solfege-1",
    title: "Les 7 notes, ton nouveau langage",
    shortTitle: "Les 7 notes",
    category: "solfege",
    categoryLabel: "SOLFÈGE",
    level: 1,
    duration: 8,
    icon: "✳",
    color: "lavender",
    description: "Do, Ré, Mi… découvre les notes qui se cachent derrière toutes les mélodies.",
    objective: "Reconnaître les sept notes de musique et leur ordre.",
    prompt: "Quelle note vient juste après Mi ?",
    choices: ["Do", "Fa", "Ré", "Sol"],
    answer: "Fa",
    explanation: "L’ordre des notes est Do, Ré, Mi, Fa, Sol, La, Si — puis on recommence à Do."
  },
  {
    id: "piano-1",
    title: "Trouve ton chemin parmi les touches",
    shortTitle: "Les touches du piano",
    category: "piano",
    categoryLabel: "PIANO",
    level: 1,
    duration: 12,
    icon: "♬",
    color: "peach",
    requires: ["solfege-1"],
    description: "Repère les groupes de deux touches noires et trouve le Do central.",
    objective: "Trouver et nommer les notes blanches du clavier.",
    prompt: "Quelle touche blanche se trouve juste à gauche d’un groupe de deux touches noires ?",
    choices: ["Do", "Mi", "Fa", "La"],
    answer: "Do",
    explanation: "Le Do se trouve toujours immédiatement à gauche d’un groupe de deux touches noires."
  },
  {
    id: "rythme-1",
    title: "Garde la pulsation comme un pro",
    shortTitle: "La pulsation",
    category: "rythme",
    categoryLabel: "RYTHME",
    level: 1,
    duration: 7,
    icon: "◉",
    color: "mint",
    requires: ["solfege-1"],
    description: "Tape la mesure, compte jusqu’à quatre et sens la musique avancer.",
    objective: "Comprendre la pulsation et la mesure à quatre temps.",
    prompt: "Combien de temps compte une mesure en 4/4 ?",
    choices: ["Deux temps", "Trois temps", "Quatre temps", "Huit temps"],
    answer: "Quatre temps",
    explanation: "En 4/4, chaque mesure contient quatre temps. Compte régulièrement : 1, 2, 3, 4."
  },
  {
    id: "solfege-2",
    title: "Lis tes premières notes sur la portée",
    shortTitle: "La portée & la clé de sol",
    category: "solfege",
    categoryLabel: "SOLFÈGE",
    level: 2,
    duration: 10,
    icon: "𝄞",
    color: "lavender",
    requires: ["solfege-1"],
    description: "Les lignes, les interlignes et la clé qui ouvre le monde des aigus.",
    objective: "Lire les notes de la portée en clé de sol.",
    prompt: "En clé de sol, quelle note se pose sur la deuxième ligne en partant du bas ?",
    choices: ["Do", "Mi", "Sol", "Si"],
    answer: "Sol",
    explanation: "La clé de sol s’enroule autour de la deuxième ligne de la portée : c’est la note Sol."
  },
  {
    id: "piano-2",
    title: "Ta première mélodie, main droite",
    shortTitle: "Première mélodie",
    category: "piano",
    categoryLabel: "PIANO",
    level: 2,
    duration: 15,
    icon: "♫",
    color: "peach",
    requires: ["piano-1", "solfege-2"],
    description: "Relie ce que tu lis à ce que tu joues avec une mélodie pas à pas.",
    objective: "Jouer une courte mélodie en associant lecture et placement.",
    prompt: "Après avoir joué Do, Ré, Mi, quelle note vient ensuite ?",
    choices: ["Ré", "Mi", "Fa", "Sol"],
    answer: "Fa",
    explanation: "Do, Ré, Mi, Fa : la mélodie avance d’une note à la suivante. Essaie ces touches sur le clavier !"
  },
  {
    id: "theory-1",
    title: "Les gammes : les couleurs de la musique",
    shortTitle: "Intervalles & gammes",
    category: "theorie",
    categoryLabel: "THÉORIE",
    level: 2,
    duration: 12,
    icon: "✧",
    color: "butter",
    requires: ["piano-1", "solfege-2"],
    description: "Comprends les tons et demi-tons pour construire la gamme de Do majeur.",
    objective: "Identifier la structure d’une gamme majeure.",
    prompt: "Quelle est la dernière note de la gamme de Do majeur avant de revenir au Do ?",
    choices: ["La", "Si", "Ré", "Sol"],
    answer: "Si",
    explanation: "La gamme de Do majeur suit Do, Ré, Mi, Fa, Sol, La, Si, puis revient au Do."
  },
  {
    id: "ear-1",
    title: "Ton oreille musicale se réveille",
    shortTitle: "Réveille ton oreille",
    category: "ecoute",
    categoryLabel: "ÉCOUTE",
    level: 3,
    duration: 8,
    icon: "◖",
    color: "mint",
    requires: ["theory-1"],
    description: "Affûte ton écoute et reconnais le mouvement des notes dans une gamme.",
    objective: "Relier les sons et les relations entre les notes.",
    prompt: "Deux notes qui se suivent dans la gamme Do–Ré–Mi créent un mouvement…",
    choices: ["Conjoint", "En saut", "Silencieux", "Toujours grave"],
    answer: "Conjoint",
    explanation: "Quand la mélodie avance d’une note voisine à la suivante, le mouvement est conjoint."
  },
  {
    id: "piano-3",
    title: "La main gauche entre dans la danse",
    shortTitle: "Jouer à deux mains",
    category: "piano",
    categoryLabel: "PIANO",
    level: 3,
    duration: 16,
    icon: "♩",
    color: "peach",
    requires: ["piano-2", "theory-1", "rythme-1"],
    description: "Pose de bonnes fondations pour coordonner les deux mains sans te presser.",
    objective: "Comprendre le rôle des deux mains dans un accompagnement.",
    prompt: "Dans un accompagnement simple, que joue souvent la main gauche ?",
    choices: ["La mélodie la plus aiguë", "La basse ou les accords", "Uniquement des silences", "Les notes de la portée du haut"],
    answer: "La basse ou les accords",
    explanation: "La main gauche soutient souvent la musique avec des basses ou des accords ; la main droite porte souvent la mélodie."
  },
  {
    id: "evaluation-1",
    title: "Évaluation : tes premières fondations",
    shortTitle: "Bilan du niveau 1",
    category: "evaluation",
    categoryLabel: "ÉVALUATION",
    level: 3,
    duration: 10,
    icon: "✷",
    color: "butter",
    requires: ["piano-3", "ear-1"],
    description: "Fais le point sur le solfège, le rythme et le piano avant la suite du voyage.",
    objective: "Vérifier ensemble les compétences essentielles du premier parcours.",
    prompt: "Quel est le meilleur signe que tu progresses solidement ?",
    choices: ["Jouer vite sans lire", "Relier lecture, écoute, rythme et pratique", "Sauter les exercices faciles", "Apprendre seulement des chansons"],
    answer: "Relier lecture, écoute, rythme et pratique",
    explanation: "Une musicienne ou un musicien progresse quand théorie, écoute, lecture et pratique se renforcent ensemble.",
    questions: [
      { prompt: "Quelle note vient après Mi ?", choices: ["Sol", "Fa", "Do", "Ré"], answer: "Fa" },
      { prompt: "En clé de sol, quelle note se trouve sur la deuxième ligne en partant du bas ?", choices: ["Mi", "Sol", "Si", "Ré"], answer: "Sol" },
      { prompt: "Combien de temps contient une mesure en 4/4 ?", choices: ["Deux", "Trois", "Quatre", "Six"], answer: "Quatre" },
      { prompt: "Quelle touche blanche se trouve à gauche d’un groupe de deux touches noires ?", choices: ["La", "Mi", "Do", "Fa"], answer: "Do" },
      { prompt: "Pour progresser en musique, tu relies surtout…", choices: ["La vitesse et la force", "Lecture, écoute, rythme et pratique", "Les chansons et la mémoire seulement", "Les deux mains sans exercices"], answer: "Lecture, écoute, rythme et pratique" }
    ]
  },
  {
    id: "solfege-3",
    title: "Noires, blanches et silences : lis le rythme",
    shortTitle: "Les valeurs de notes",
    category: "solfege",
    categoryLabel: "SOLFÈGE",
    level: 3,
    duration: 12,
    icon: "𝅘𝅥",
    color: "lavender",
    requires: ["solfege-2", "rythme-1"],
    description: "Apprends combien de temps dure une note et comment la lire sur la portée.",
    objective: "Reconnaître les valeurs de notes et les silences les plus courants.",
    prompt: "Dans une mesure à 4/4, combien de temps dure une blanche ?",
    choices: ["Un temps", "Deux temps", "Trois temps", "Quatre temps"],
    answer: "Deux temps",
    explanation: "La blanche dure deux temps, soit deux fois plus qu’une noire, qui dure un temps."
  },
  {
    id: "rythme-2",
    title: "Divise le temps et garde le groove",
    shortTitle: "Les croches & le métronome",
    category: "rythme",
    categoryLabel: "RYTHME",
    level: 3,
    duration: 10,
    icon: "◉",
    color: "mint",
    requires: ["rythme-1", "solfege-3"],
    description: "Compte les subdivisions et entraîne-toi à jouer sans accélérer.",
    objective: "Comprendre les croches et garder une pulsation régulière.",
    prompt: "Combien de croches peuvent tenir dans la durée d’une noire ?",
    choices: ["Une", "Deux", "Trois", "Quatre"],
    answer: "Deux",
    explanation: "Deux croches partagent la durée d’une noire. Tu peux les compter « 1 et » dans un temps."
  },
  {
    id: "theory-2",
    title: "Les accords : plusieurs notes, une couleur",
    shortTitle: "Construire tes premiers accords",
    category: "theorie",
    categoryLabel: "THÉORIE",
    level: 3,
    duration: 14,
    icon: "✧",
    color: "butter",
    requires: ["theory-1", "piano-3"],
    description: "Découvre comment l’empilement des notes construit les accords majeurs.",
    objective: "Identifier les notes fondamentales d’un accord majeur.",
    prompt: "Quelles notes forment l’accord de Do majeur ?",
    choices: ["Do – Mi – Sol", "Do – Ré – Fa", "Ré – Fa – La", "Do – Fa – La"],
    answer: "Do – Mi – Sol",
    explanation: "L’accord de Do majeur est formé de Do, Mi et Sol : la note fondamentale, sa tierce et sa quinte."
  },
  {
    id: "piano-4",
    title: "Fais chanter ta première gamme",
    shortTitle: "La gamme sous les doigts",
    category: "piano",
    categoryLabel: "PIANO",
    level: 3,
    duration: 16,
    icon: "♫",
    color: "peach",
    requires: ["piano-3", "solfege-3", "theory-1"],
    description: "Travaille Do majeur avec un doigté confortable et un rythme régulier.",
    objective: "Jouer la gamme de Do majeur dans les deux sens, lentement.",
    prompt: "Quelle est la dernière note de Do majeur avant de redescendre ?",
    choices: ["La", "Si", "Ré", "Mi"],
    answer: "Si",
    explanation: "Après Si, on retrouve Do. Fais sonner chaque note régulièrement avant d’augmenter le tempo."
  },
  {
    id: "ear-2",
    title: "Entends la distance entre les notes",
    shortTitle: "L’oreille et les intervalles",
    category: "ecoute",
    categoryLabel: "ÉCOUTE",
    level: 3,
    duration: 11,
    icon: "◖",
    color: "mint",
    requires: ["ear-1", "theory-2"],
    description: "Relie les sons que tu entends aux intervalles que tu connais.",
    objective: "Comprendre la notion d’intervalle entre deux notes.",
    prompt: "Comment appelle-t-on la distance entre deux notes ?",
    choices: ["Une pulsation", "Un intervalle", "Une mesure", "Une portée"],
    answer: "Un intervalle",
    explanation: "L’intervalle décrit l’écart de hauteur entre deux notes ; il aide à comprendre et reconnaître les mélodies."
  },
  {
    id: "piano-5",
    title: "Accompagne une mélodie avec ta main gauche",
    shortTitle: "Premiers accompagnements",
    category: "piano",
    categoryLabel: "PIANO",
    level: 4,
    duration: 18,
    icon: "♩",
    color: "peach",
    requires: ["piano-4", "theory-2", "rythme-2"],
    description: "Pose une basse simple sous les notes de ta main droite et écoute l’équilibre.",
    objective: "Jouer une mélodie simple avec une basse régulière.",
    prompt: "Quelle note est un bon point de départ pour la basse d’un accord de Do majeur ?",
    choices: ["Mi", "Sol", "Do", "Si"],
    answer: "Do",
    explanation: "La fondamentale Do donne une assise naturelle à l’accord de Do majeur. Commence lentement, main par main."
  },
  {
    id: "solfege-4",
    title: "La clé de fa ouvre les notes graves",
    shortTitle: "La portée en clé de fa",
    category: "solfege",
    categoryLabel: "SOLFÈGE",
    level: 4,
    duration: 13,
    icon: "𝄢",
    color: "lavender",
    requires: ["solfege-3", "evaluation-1"],
    description: "Apprends à lire les notes graves jouées par la main gauche.",
    objective: "Identifier les notes sur la portée en clé de fa.",
    prompt: "En clé de fa, quelle note se trouve sur la quatrième ligne en partant du bas ?",
    choices: ["Mi", "La", "Fa", "Ré"],
    answer: "Fa",
    explanation: "Les deux points de la clé de fa encadrent la quatrième ligne de la portée, qui porte la note Fa."
  },
  {
    id: "theory-3",
    title: "Dièses, bémols et nouvelles tonalités",
    shortTitle: "Altérations & tonalités",
    category: "theorie",
    categoryLabel: "THÉORIE",
    level: 4,
    duration: 14,
    icon: "✧",
    color: "butter",
    requires: ["theory-2", "solfege-4"],
    description: "Comprends comment les altérations transforment le son et définissent une tonalité.",
    objective: "Différencier un dièse et un bémol dans une partition.",
    prompt: "Quel effet a un dièse sur la note qui le suit ?",
    choices: ["Il la baisse d’un demi-ton", "Il la hausse d’un demi-ton", "Il la hausse d’un ton", "Il l’annule"],
    answer: "Il la hausse d’un demi-ton",
    explanation: "Le dièse monte la note d’un demi-ton. Le bémol la baisse d’un demi-ton."
  },
  {
    id: "piano-6",
    title: "Deux mains, un seul morceau",
    shortTitle: "Coordination des deux mains",
    category: "piano",
    categoryLabel: "PIANO",
    level: 4,
    duration: 18,
    icon: "♫",
    color: "peach",
    requires: ["piano-5", "solfege-4", "rythme-2"],
    description: "Rassemble lecture, tempo et indépendance dans un premier jeu à deux mains.",
    objective: "Coordonner basse et mélodie à tempo lent et régulier.",
    prompt: "Quelle méthode aide à réunir les deux mains sans se précipiter ?",
    choices: ["Jouer les deux mains très vite", "Travailler chaque main puis réunir lentement", "Ignorer les notes de la main gauche", "Ralentir une main au hasard"],
    answer: "Travailler chaque main puis réunir lentement",
    explanation: "Travaille d’abord séparément, puis réunis les mains à un tempo confortable en comptant la pulsation."
  },
  {
    id: "evaluation-2",
    title: "Évaluation : tes outils de musicien·ne",
    shortTitle: "Bilan des acquis",
    category: "evaluation",
    categoryLabel: "ÉVALUATION",
    level: 4,
    duration: 12,
    icon: "✷",
    color: "butter",
    requires: ["piano-6", "theory-3", "ear-2"],
    description: "Vérifie tes acquis de lecture, de rythme, d’harmonie et de coordination.",
    objective: "Évaluer les connaissances mobilisées dans le parcours intermédiaire.",
    prompt: "Prêt·e à tester tes acquis ?",
    choices: ["Oui, je prends mon temps", "Non, je veux relire les leçons"],
    answer: "Oui, je prends mon temps",
    explanation: "L’aisance musicale se construit en reliant lecture, technique, rythme, écoute et compréhension.",
    questions: [
      { prompt: "Une blanche dure combien de temps par rapport à une noire ?", choices: ["La moitié", "Le double", "Le triple", "La même durée"], answer: "Le double" },
      { prompt: "Combien de croches équivalent à une noire ?", choices: ["Une", "Deux", "Trois", "Quatre"], answer: "Deux" },
      { prompt: "Quelles notes forment l’accord de Do majeur ?", choices: ["Do – Mi – Sol", "Do – Fa – La", "Ré – Fa – La", "Do – Ré – Sol"], answer: "Do – Mi – Sol" },
      { prompt: "Que fait un dièse à une note ?", choices: ["La monte d’un demi-ton", "La baisse d’un demi-ton", "La monte d’un ton", "La transforme en silence"], answer: "La monte d’un demi-ton" },
      { prompt: "Comment réunir les deux mains de manière sûre ?", choices: ["Jouer vite immédiatement", "Pratiquer chaque main puis réunir lentement", "Ignorer le tempo", "Commencer par les deux mains très fort"], answer: "Pratiquer chaque main puis réunir lentement" }
    ]
  }
];

const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const categories = [
  { id: "solfege", label: "Solfège", icon: "𝄞" },
  { id: "piano", label: "Piano", icon: "♬" },
  { id: "rythme", label: "Rythme", icon: "◉" },
  { id: "theorie", label: "Théorie", icon: "✧" },
  { id: "ecoute", label: "Écoute", icon: "◖" },
  { id: "evaluation", label: "Évaluations", icon: "✷" }
];
const course = {
  id: "tempo-foundations",
  title: "Les fondations du piano",
  description: "Du premier repère sur le clavier aux premières pièces à deux mains, avec solfège, rythme, écoute et harmonie intégrés."
};

for (const lesson of lessons) {
  const content = courseContent[lesson.id];
  if (!content) throw new Error(`Missing teaching content for lesson ${lesson.id}`);
  lesson.blocks = content.blocks;
  lesson.practice = content.practice;
  lesson.video = {
    ...content.video,
    audioUrl: `/media/${lesson.id}.wav`
  };
}

database.prepare(`
  INSERT INTO courses (id, title, description) VALUES (?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET title = excluded.title, description = excluded.description
`).run(course.id, course.title, course.description);

const saveLesson = database.prepare(`
  INSERT INTO course_lessons (id, course_id, sequence, title, level, prerequisites_json, content_json)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    course_id = excluded.course_id,
    sequence = excluded.sequence,
    title = excluded.title,
    level = excluded.level,
    prerequisites_json = excluded.prerequisites_json,
    content_json = excluded.content_json
`);
database.transaction(() => {
  lessons.forEach((lesson, sequence) => {
    saveLesson.run(
      lesson.id,
      course.id,
      sequence + 1,
      lesson.title,
      lesson.level,
      JSON.stringify(lesson.requires || []),
      JSON.stringify(lesson)
    );
  });
})();

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

function sign(userId) {
  return crypto.createHmac("sha256", sessionSecret).update(String(userId)).digest("hex");
}

function isValidSignature(userId, signature) {
  if (!signature || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const expected = Buffer.from(sign(userId), "hex");
  const actual = Buffer.from(signature, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function currentUser(request) {
  const [userId, signature, extra] = (request.get("cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("tempo_session="))
    ?.slice("tempo_session=".length)
    .split(".") || [];

  if (!userId || extra || !/^\d+$/.test(userId) || !isValidSignature(userId, signature)) return null;
  return database.prepare("SELECT id, email, display_name FROM users WHERE id = ?").get(Number(userId)) || null;
}

function setSession(response, userId) {
  response.cookie("tempo_session", `${userId}.${sign(userId)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.HTTPS === "true",
    maxAge: 14 * 24 * 60 * 60 * 1000,
    path: "/"
  });
}

function requireUser(request, response, next) {
  const user = currentUser(request);
  if (!user) return response.status(401).json({ error: "Connecte-toi pour continuer." });
  request.user = user;
  next();
}

function userProgress(userId) {
  return database.prepare(
    "SELECT lesson_id AS lessonId, score, completed_at AS completedAt FROM lesson_progress WHERE user_id = ? ORDER BY completed_at"
  ).all(userId);
}

function userLessonSteps(userId) {
  const steps = {};
  const rows = database.prepare(
    "SELECT lesson_id AS lessonId, step_id AS stepId FROM lesson_steps WHERE user_id = ?"
  ).all(userId);
  for (const row of rows) {
    (steps[row.lessonId] ||= []).push(row.stepId);
  }
  return steps;
}

function userAssessments(userId) {
  return database.prepare(`
    SELECT lesson_id AS lessonId, score, attempted_at AS attemptedAt
    FROM assessment_attempts WHERE user_id = ? ORDER BY attempted_at DESC
  `).all(userId);
}

function curriculumFromDatabase() {
  return database.prepare("SELECT content_json FROM course_lessons WHERE course_id = ? ORDER BY sequence")
    .all(course.id)
    .map((row) => JSON.parse(row.content_json));
}

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));

app.post("/api/register", (request, response) => {
  const { name, email, password } = request.body || {};
  const displayName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (displayName.length < 2 || displayName.length > 40) {
    return response.status(400).json({ error: "Ton prénom doit contenir entre 2 et 40 caractères." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    return response.status(400).json({ error: "Saisis une adresse e-mail valide." });
  }
  if (typeof password !== "string" || password.length < 10 || password.length > 72) {
    return response.status(400).json({ error: "Choisis un mot de passe de 10 caractères minimum." });
  }

  try {
    const result = database.prepare(
      "INSERT INTO users (email, display_name, password_hash) VALUES (?, ?, ?)"
    ).run(normalizedEmail, displayName, bcrypt.hashSync(password, 10));
    setSession(response, result.lastInsertRowid);
    return response.status(201).json({
      user: { id: result.lastInsertRowid, email: normalizedEmail, displayName },
      progress: [],
      lessonSteps: {},
      assessments: []
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return response.status(409).json({ error: "Cette adresse e-mail possède déjà un compte." });
    }
    throw error;
  }
});

app.post("/api/login", (request, response) => {
  const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
  const password = typeof request.body?.password === "string" ? request.body.password : "";
  const user = database.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return response.status(401).json({ error: "E-mail ou mot de passe incorrect." });
  }
  setSession(response, user.id);
  return response.json({
    user: { id: user.id, email: user.email, displayName: user.display_name },
    progress: userProgress(user.id),
    lessonSteps: userLessonSteps(user.id),
    assessments: userAssessments(user.id)
  });
});

app.post("/api/logout", (_request, response) => {
  response.clearCookie("tempo_session", { httpOnly: true, sameSite: "lax", path: "/" });
  response.status(204).end();
});

app.get("/api/me", requireUser, (request, response) => response.json({
  user: {
    id: request.user.id,
    email: request.user.email,
    displayName: request.user.display_name
  },
  progress: userProgress(request.user.id),
  lessonSteps: userLessonSteps(request.user.id),
  assessments: userAssessments(request.user.id)
}));

app.get("/api/v1/courses", (_request, response) => response.json({
  courses: database.prepare(`
    SELECT c.id, c.title, c.description, COUNT(l.id) AS lessonCount
    FROM courses c LEFT JOIN course_lessons l ON l.course_id = c.id
    GROUP BY c.id ORDER BY c.created_at
  `).all()
}));

app.get("/api/v1/courses/:courseId", (request, response) => {
  const foundCourse = database.prepare(
    "SELECT id, title, description FROM courses WHERE id = ?"
  ).get(request.params.courseId);
  if (!foundCourse) return response.status(404).json({ error: "Ce parcours n’existe pas." });
  const courseLessons = database.prepare(
    "SELECT content_json FROM course_lessons WHERE course_id = ? ORDER BY sequence"
  ).all(foundCourse.id).map((row) => JSON.parse(row.content_json));
  response.json({ course: foundCourse, lessons: courseLessons, categories });
});

app.get("/api/v1/lessons", (request, response) => {
  const courseLessons = curriculumFromDatabase();
  const filtered = request.query.category
    ? courseLessons.filter((lesson) => lesson.category === request.query.category)
    : courseLessons;
  response.json({ lessons: filtered });
});

app.get("/api/v1/lessons/:lessonId", (request, response) => {
  const lesson = database.prepare("SELECT content_json FROM course_lessons WHERE id = ?").get(request.params.lessonId);
  if (!lesson) return response.status(404).json({ error: "Cette leçon n’existe pas." });
  response.json({ lesson: JSON.parse(lesson.content_json) });
});

app.get("/api/v1/progress", requireUser, (request, response) => response.json({
  completed: userProgress(request.user.id),
  lessonSteps: userLessonSteps(request.user.id),
  assessments: userAssessments(request.user.id)
}));

app.post("/api/v1/progress/steps", requireUser, (request, response) => {
  const { lessonId, stepId } = request.body || {};
  const lesson = lessonById.get(lessonId);
  if (!lesson || !["reading", "video", "practice"].includes(stepId)) {
    return response.status(400).json({ error: "Cette étape de cours n’est pas valide." });
  }
  const completed = new Set(userProgress(request.user.id).map((item) => item.lessonId));
  if ((lesson.requires || []).some((id) => !completed.has(id))) {
    return response.status(403).json({ error: "Termine d’abord les leçons qui préparent cette étape." });
  }
  database.prepare(
    "INSERT OR IGNORE INTO lesson_steps (user_id, lesson_id, step_id) VALUES (?, ?, ?)"
  ).run(request.user.id, lessonId, stepId);
  response.json({ lessonSteps: userLessonSteps(request.user.id) });
});

function completeLesson(request, response, lessonId, score, extra = {}) {
  const lesson = lessonById.get(lessonId);
  if (!lesson) return response.status(404).json({ error: "Cette leçon n’existe pas." });
  const completed = new Set(userProgress(request.user.id).map((item) => item.lessonId));
  const missing = (lesson.requires || []).filter((id) => !completed.has(id));
  if (missing.length) {
    return response.status(403).json({ error: "Termine les leçons précédentes pour débloquer cette étape." });
  }

  const completedSteps = new Set(userLessonSteps(request.user.id)[lessonId] || []);
  const missingSteps = ["reading", "video", "practice"].filter((step) => !completedSteps.has(step));
  if (missingSteps.length) {
    return response.status(409).json({ error: "Lis le cours, regarde la capsule et termine la pratique avant de valider." });
  }
  const isEvaluation = lesson.category === "evaluation";
  if (isEvaluation && (!Number.isInteger(score) || score < 70 || score > 100)) {
    return response.status(400).json({ error: "Le bilan demande au moins 70 % de réussite." });
  }
  const recordedScore = isEvaluation ? score : 100;
  database.prepare(`
    INSERT INTO lesson_progress (user_id, lesson_id, score)
    VALUES (?, ?, ?)
    ON CONFLICT (user_id, lesson_id) DO UPDATE SET
      score = MAX(lesson_progress.score, excluded.score),
      completed_at = CURRENT_TIMESTAMP
  `).run(request.user.id, lessonId, recordedScore);

  return response.json({
    progress: userProgress(request.user.id),
    lessonSteps: userLessonSteps(request.user.id),
    ...extra
  });
}

app.post("/api/v1/progress/lessons/:lessonId/complete", requireUser, (request, response) => {
  return completeLesson(request, response, request.params.lessonId, request.body?.score);
});

app.post("/api/v1/assessments/:lessonId/attempt", requireUser, (request, response) => {
  const lesson = lessonById.get(request.params.lessonId);
  if (!lesson || lesson.category !== "evaluation") {
    return response.status(404).json({ error: "Cette évaluation n’existe pas." });
  }
  const completed = new Set(userProgress(request.user.id).map((item) => item.lessonId));
  if ((lesson.requires || []).some((id) => !completed.has(id))) {
    return response.status(403).json({ error: "Les leçons préparatoires ne sont pas encore validées." });
  }
  const steps = new Set(userLessonSteps(request.user.id)[lesson.id] || []);
  if (["reading", "video", "practice"].some((step) => !steps.has(step))) {
    return response.status(409).json({ error: "Termine les étapes du cours avant le bilan." });
  }
  const answers = request.body?.answers;
  if (!Array.isArray(answers) || answers.length !== lesson.questions.length ||
      answers.some((answer, index) => !lesson.questions[index].choices.includes(answer))) {
    return response.status(400).json({ error: "Réponds à toutes les questions du bilan." });
  }
  const score = Math.round(
    answers.reduce((total, answer, index) => total + Number(answer === lesson.questions[index].answer), 0) /
    lesson.questions.length * 100
  );
  database.prepare(
    "INSERT INTO assessment_attempts (user_id, lesson_id, score, answers_json) VALUES (?, ?, ?, ?)"
  ).run(request.user.id, lesson.id, score, JSON.stringify(answers));
  if (score >= 70) {
    return completeLesson(request, response, lesson.id, score, {
      score,
      passed: true,
      assessments: userAssessments(request.user.id)
    });
  }
  response.json({
    score,
    passed: false,
    assessments: userAssessments(request.user.id)
  });
});

app.get("/api/curriculum", (_request, response) => response.json({
  lessons: curriculumFromDatabase(),
  categories
}));

app.post("/api/complete", requireUser, (request, response) => {
  return completeLesson(request, response, request.body?.lessonId, request.body?.score);
});

app.get("*", (_request, response) => response.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(port, "0.0.0.0", () => {
  console.log(`Tempo is ready on http://0.0.0.0:${port}`);
});
