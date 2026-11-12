PROMPT DE TRANSFERT DE CONTEXTE — PROJET PIANO ACADEMY

Tu reprends un projet de conception d'une plateforme complète d'apprentissage du piano et de formation musicale.

Tu dois agir comme un expert réunissant plusieurs compétences :

Directeur pédagogique d'une école de musique.
Professeur de piano expérimenté.
Spécialiste de la pédagogie musicale et des conservatoires.
Expert en solfège, harmonie et formation auditive.
Expert en sciences cognitives et apprentissage.
Product Manager spécialisé en EdTech.
UX/UI Designer spécialisé dans les applications éducatives.
Architecte logiciel senior.
Expert en conception de plateformes SaaS.
Expert en gamification et apprentissage adaptatif.

Ton rôle est de reconstituer et d'approfondir la réflexion du projet afin de produire des spécifications fonctionnelles et techniques destinées à Claude Code.

L'objectif final est de construire une véritable école de musique numérique, pas simplement une application qui apprend quelques morceaux de piano.

1. VISION DU PROJET

Nous voulons créer une plateforme qui permette à une personne débutante de suivre une formation musicale complète et de progresser jusqu'à un niveau pianistique avancé, voire expert.

L'ambition est de proposer une formation comparable, dans ses compétences et sa richesse disciplinaire, à un cursus complet d'école de musique ou de conservatoire.

L'apprenant doit acquérir :

Une véritable maîtrise du piano.
Une excellente compréhension du solfège.
La capacité de lire des partitions.
Une bonne oreille musicale.
Une maîtrise du rythme.
Une compréhension approfondie de la théorie musicale.
Des connaissances en harmonie.
Une culture musicale solide.
Des connaissances en histoire de la musique.
Une capacité d'analyse musicale.
Des capacités d'improvisation.
Des connaissances en composition.
Une véritable autonomie artistique.

L'application doit rendre cet apprentissage accessible, compréhensible, ludique et motivant.

Elle doit éviter l'effet scolaire rébarbatif tout en conservant une exigence pédagogique élevée.

2. PHILOSOPHIE PÉDAGOGIQUE FONDAMENTALE

Une décision importante a déjà été prise :

NE PAS ORGANISER LE PARCOURS EN ANNÉES SCOLAIRES.

Nous ne voulons surtout pas qu'un apprenant ait l'impression qu'il lui faudra obligatoirement un an pour maîtriser un niveau.

La progression doit être entièrement individualisée.

Un apprenant peut :

Apprendre rapidement certaines notions.
Prendre plus de temps sur d'autres.
Être avancé en solfège mais débutant au piano.
Revenir sur une compétence fragile.
Explorer des matières facultatives.
Progresser à son propre rythme.
Passer directement à des notions plus avancées lorsque ses compétences le permettent.

La progression doit dépendre de la maîtrise réelle et non du temps écoulé.

Architecture de progression envisagée

Nous avons imaginé sept grands mondes :

Découverte du piano.
Premières mélodies.
Langage musical.
Autonomie musicale.
Expression musicale.
Maîtrise musicale.
Expertise artistique.

Ces mondes sont des étapes de progression et non des durées.

Chaque monde contient :

Des niveaux.
Des matières.
Des chapitres.
Des leçons.
Des activités.
Des compétences.
Des évaluations.

L'organisation doit être dynamique et administrable.

Progression multidimensionnelle

Il est essentiel de ne pas attribuer un seul niveau général à l'apprenant.

Il faut une progression indépendante pour chaque matière :

Technique pianistique.
Solfège.
Lecture musicale.
Rythme.
Formation auditive.
Théorie musicale.
Harmonie.
Histoire de la musique.
Culture musicale.
Improvisation.
Composition.
Analyse musicale.

Chaque matière doit pouvoir évoluer indépendamment des autres.

3. LE MOTEUR DE COMPÉTENCES

Une architecture centrale a été envisagée autour de trois moteurs indépendants.

MasteryEngine

Calcule le niveau réel de maîtrise de chaque compétence.

Chaque compétence possède :

Un identifiant.
Un code.
Un nom.
Une description.
Une matière.
Un niveau de difficulté.
Des objectifs pédagogiques.
Des prérequis.
Des critères d'évaluation.
Un historique de progression.

États envisagés :

NOT_STARTED
DISCOVERING
LEARNING
PRACTICING
ACQUIRED
MASTERED
TO_REVIEW

Chaque compétence possède un score de 0 à 100.

La maîtrise ne doit jamais être validée sur la base d'une seule bonne réponse.

Le calcul peut prendre en compte :

Exactitude.
Réussite des exercices.
Évaluations dédiées.
Réussite sans aide.
Rétention dans le temps.
Transfert des connaissances.

Les seuils doivent être configurables et scientifiquement cohérents.

LearningPathEngine

Détermine les prochaines compétences accessibles en tenant compte :

Des compétences acquises.
Des prérequis.
Des difficultés.
Des objectifs de l'apprenant.
Des compétences à réviser.
RecommendationEngine

Propose les meilleures activités à réaliser.

Exemples :

Continuer une matière.
Réviser une compétence.
Retravailler une difficulté.
Découvrir une notion facultative.
Passer une évaluation.
Débloquer une nouvelle compétence.

Chaque recommandation doit expliquer pourquoi elle est proposée.

4. MATIÈRES À ÉTUDIER ET À RECHERCHER

Nous voulons réaliser une recherche approfondie sur les formations musicales existantes.

Étudier notamment :

Les conservatoires français.
Les écoles de musique.
Les référentiels du ministère de la Culture.
Les programmes ABRSM.
Les programmes Royal Conservatory of Music.
Les formations musicales supérieures.
Les cursus de piano classique.
Les cursus de jazz.
Les méthodes pédagogiques reconnues.
Les recherches scientifiques sur l'apprentissage musical.

Ne pas recopier leurs contenus protégés.

Les utiliser comme références pour construire un programme original.

Les matières envisagées sont :

Piano et technique instrumentale
Posture.
Position des mains.
Doigtés.
Coordination.
Indépendance des mains.
Articulation.
Nuances.
Vélocité.
Gammes.
Arpèges.
Accords.
Pédale.
Technique avancée.
Interprétation.
Solfège et lecture
Notes.
Portées.
Clés.
Hauteurs.
Durées.
Silences.
Mesures.
Altérations.
Armures.
Intervalles.
Lecture à vue.
Transposition.
Rythme
Pulsation.
Tempo.
Mesures.
Figures rythmiques.
Syncopes.
Contretemps.
Polyrythmie.
Changements de mesure.
Formation auditive
Reconnaissance des notes.
Intervalles.
Accords.
Gammes.
Dictées mélodiques.
Dictées rythmiques.
Reconnaissance des tonalités.
Transcription auditive.
Théorie et harmonie
Tonalités.
Gammes.
Intervalles.
Accords.
Renversements.
Cadences.
Progressions harmoniques.
Harmonie classique.
Harmonie jazz.
Contrepoint.
Modulations.
Analyse harmonique.
Histoire et culture musicale
Musique médiévale.
Renaissance.
Baroque.
Classicisme.
Romantisme.
Impressionnisme.
Musique moderne.
Musique contemporaine.
Histoire du piano.
Grands compositeurs.
Grandes œuvres.
Courants musicaux.
Instruments et orchestres.
Musiques du monde.
Disciplines complémentaires
Improvisation.
Composition.
Analyse formelle.
Accompagnement.
Lecture à vue.
Mémorisation.
Musique de chambre.
Jeu collectif.
Acoustique.
Anatomie et biomécanique du pianiste.
Psychologie de l'apprentissage.
Méthodologie de travail.
Informatique musicale.

Cette liste est une base de travail et ne doit pas être considérée comme exhaustive.

Tu dois identifier les disciplines manquantes et les organiser.

5. EXPÉRIENCE UTILISATEUR

Trois grands espaces avaient été imaginés.

L'ÉCOLE

L'espace de formation :

Parcours.
Mondes.
Matières.
Cours.
Solfège.
Théorie.
Histoire musicale.
Examens.
LE STUDIO

L'espace de pratique :

Clavier virtuel.
Partitions.
Exercices.
MIDI.
Métronome.
Enregistrement.
Analyse de performances.
L'ACADÉMIE

L'espace de progression :

Objectifs.
Défis.
Récompenses.
Grades.
Badges.
Portfolio.
Concerts.
Communauté.

L'interface doit être élégante, moderne, intuitive et ludique, mais pas infantilisante.

6. FORMATS PÉDAGOGIQUES

L'application ne doit pas être constituée uniquement de vidéos.

Elle doit proposer une véritable diversité pédagogique.

Formats envisagés :

Vidéos courtes.
Animations.
Illustrations.
Schémas.
Clavier interactif.
Partitions interactives.
Démonstrations audio.
Exercices pratiques.
Quiz.
Dictées musicales.
Jeux de reconnaissance.
Glisser-déposer.
Simulations.
Exercices MIDI.
Projets musicaux.
Évaluations.

Chaque leçon doit avoir :

Un objectif pédagogique.
Une explication claire.
Une démonstration.
Une mise en pratique.
Un feedback.
Une vérification de compréhension.
Une association avec une ou plusieurs compétences.

Le contenu doit être progressif et adapté à la difficulté.

7. STUDIO PIANO

Prévoir un véritable espace de pratique.

Fonctionnalités souhaitées :

Clavier virtuel de 88 touches.
Sons de piano.
Affichage des notes.
Partitions interactives.
Métronome.
Contrôle du tempo.
Boucles de mesures.
Travail main droite.
Travail main gauche.
Travail mains ensemble.
Doigtés.
Enregistrement.
Historique.

Prévoir une architecture permettant :

L'intégration MIDI.
L'analyse audio.
La détection des notes jouées.
La comparaison avec une partition.
Le suivi des erreurs.
L'analyse du rythme.

Ne pas prétendre mesurer précisément la qualité artistique à partir des seules données MIDI.

8. GAMIFICATION ET MOTIVATION

Créer un système qui encourage la régularité et la progression.

Prévoir :

XP.
Badges.
Défis.
Collections.
Objectifs.
Récompenses.
Parcours visuels.
Projets.
Portfolio.

Ne pas utiliser de mécanismes culpabilisants.

Pas de perte de progression en cas d'absence.

Pas de séries quotidiennes obligatoires.

Les récompenses doivent valoriser l'apprentissage réel plutôt que le simple temps passé.

9. BACK-OFFICE

Prévoir un système d'administration complet permettant de gérer :

Mondes.
Niveaux.
Matières.
Chapitres.
Leçons.
Compétences.
Prérequis.
Exercices.
Évaluations.
Vidéos.
Audios.
Partitions.
Animations.
Critères de maîtrise.

Le moteur pédagogique doit être indépendant des contenus.

Les contenus doivent pouvoir être modifiés sans modification du code frontend.

10. ARCHITECTURE TECHNIQUE ENVISAGÉE

Le projet doit être développé avec Claude Code.

Une architecture possible :

Next.js.
React.
TypeScript.
PostgreSQL.
Prisma.
Auth.js.
Tailwind CSS.
Framer Motion.
Web Audio API.
Web MIDI API.
Vitest.
Playwright.

Ces choix ne sont pas définitifs.

Si un projet existe déjà, Claude Code doit d'abord l'inspecter et préserver les technologies adaptées.

Tables envisagées
users
learner_profiles
worlds
levels
subjects
chapters
lessons
activities
skills
skill_prerequisites
learner_skill_mastery
exercise_attempts
assessments
assessment_results
learning_recommendations
achievements
learner_achievements
practice_sessions
lesson_progress
Modules envisagés
curriculum
skills
progression
assessments
recommendations
exercises
audio
midi
gamification
11. MÉTHODE DE DÉVELOPPEMENT

Claude Code doit travailler par lots.

Audit technique.
Socle technique.
Architecture pédagogique.
Moteur de compétences.
Moteur de progression.
Interfaces.
Exercices interactifs.
Studio piano.
Gamification.
Back-office.
Tests et finalisation.

Ne pas lui demander de tout développer en une seule fois.

Il doit d'abord proposer une architecture et attendre sa validation.

12. TA MISSION DANS CETTE NOUVELLE CONVERSATION

Tu dois maintenant reprendre le projet à partir de toutes ces informations.

Ne te limite pas à reformuler ce texte.

Tu dois approfondir, vérifier, structurer et compléter la conception.

ÉTAPE 1 — RECHERCHE DOCUMENTAIRE

Effectue une recherche approfondie sur les cursus et référentiels pédagogiques reconnus.

Identifie les compétences réellement enseignées dans les écoles de musique et conservatoires.

Cite les sources.

Distingue :

Les exigences communes.
Les enseignements spécialisés.
Les disciplines complémentaires.
Les compétences de niveau avancé.
Les compétences de niveau supérieur.

Ne présente pas une simple liste de matières comme un cursus complet.

ÉTAPE 2 — CONSTRUCTION DU RÉFÉRENTIEL PÉDAGOGIQUE

Construis un référentiel exhaustif.

Pour chaque matière, définir :

Les objectifs.
Les grands domaines.
Les compétences.
Les sous-compétences.
Les prérequis.
Les exercices.
Les méthodes d'évaluation.
Les critères de maîtrise.
Les liens avec les autres matières.

La progression doit être sans années scolaires et multidimensionnelle.

ÉTAPE 3 — CONCEPTION DE L'EXPÉRIENCE

Définis :

Les parcours utilisateurs.
Les écrans.
Les interactions.
Les animations.
Les mécaniques de motivation.
Les systèmes de recommandation.
Les évaluations.
Les expériences de pratique.
ÉTAPE 4 — SPÉCIFICATIONS TECHNIQUES

Définis :

L'architecture logicielle.
Le modèle de données.
Les API.
Les services.
Les moteurs pédagogiques.
Les règles métier.
Les permissions.
Les tests.
Le back-office.
Les exigences de sécurité.
ÉTAPE 5 — DOCUMENTATION POUR CLAUDE CODE

Produis des documents Markdown séparés, précis et exploitables :

PROJECT_OVERVIEW.md : vision et architecture globale.
PEDAGOGICAL_FRAMEWORK.md : référentiel pédagogique.
CONTENT_MASTER_PLAN.md : catalogue détaillé des cours et compétences.
LEARNING_ENGINE_SPEC.md : moteurs de progression et de maîtrise.
FUNCTIONAL_SPEC.md : spécifications fonctionnelles.
UX_UI_SPEC.md : interfaces et expérience utilisateur.
TECHNICAL_SPEC.md : architecture technique.
DATABASE_SPEC.md : schéma de données.
IMPLEMENTATION_ROADMAP.md : lots de développement.
CLAUDE_CODE_MASTER_PROMPT.md : instructions opérationnelles pour Claude Code.

Chaque document doit être cohérent avec les autres.

Évite les contradictions, les fonctionnalités vagues et les exigences impossibles à tester.

CONSIGNES IMPORTANTES
Ne réduis pas l'ambition du projet à une simple application ludique.
Conserve l'objectif de formation musicale complète.
Ne transforme pas les sept mondes en années scolaires.
Ne confonds pas progression générale et maîtrise par matière.
Ne considère pas une compétence comme acquise sur une simple bonne réponse.
N'oublie pas la culture musicale et l'histoire de la musique.
Prévois les parcours avancés et spécialisés.
Privilégie une pédagogie fondée sur des objectifs observables.
Documente les choix pédagogiques.
Ne fabrique pas de références scientifiques.
Distingue les faits documentés de tes recommandations.
Privilégie une architecture évolutive.
Pense à la possibilité d'ajouter d'autres instruments ultérieurement.

Commence par analyser ce contexte et présente-moi ta stratégie de travail, les recherches documentaires prioritaires et la structure des livrables.

Ne commence pas immédiatement à écrire dix documents superficiels.

Je veux une conception sérieuse, exhaustive, cohérente et directement exploitable pour construire le produit avec Claude Code.