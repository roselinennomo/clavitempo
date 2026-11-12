const content = {
  "solfege-1": {
    blocks: [
      { title: "Les sept noms de notes", text: "La musique occidentale emploie sept noms : Do, Ré, Mi, Fa, Sol, La, Si. Après Si, le cycle recommence sur Do, plus aigu. Chante la suite à voix haute avant de la jouer." },
      { title: "Cherche les motifs", text: "Sur un clavier, les notes blanches avancent par pas. Do–Ré–Mi–Fa–Sol monte ; Sol–Fa–Mi–Ré–Do redescend. Dire le nom pendant que tu joues relie l’oreille, le geste et le langage musical." },
      { title: "À retenir", text: "Une note n’est pas seulement une touche : c’est un son que tu peux nommer, chanter, lire et retrouver à différentes hauteurs." }
    ],
    video: {
      title: "Les sept notes prennent vie",
      visual: "keyboard",
      script: "Bienvenue au piano ! Voici les sept noms qui forment notre alphabet musical : Do, Ré, Mi, Fa, Sol, La et Si. Écoute-les monter, puis redescendre. Après Si, on revient à Do, une octave plus haut. Chante chaque nom en même temps que le son : ta voix, ton oreille et tes doigts apprennent ensemble. À toi maintenant de jouer lentement Do, Ré, Mi, Ré, Do.",
      scenes: ["Voici l’alphabet des sept notes.", "Monte pas à pas, puis redescends.", "Chante les notes pendant que tu les joues."]
    },
    practice: { kind: "keyboard", title: "La petite promenade", instruction: "Joue chaque note dans l’ordre et écoute si elle monte ou descend. Chante les noms à voix haute.", notes: ["Do", "Ré", "Mi", "Ré", "Do"], tempo: 60 }
  },
  "piano-1": {
    blocks: [
      { title: "Lis les groupes noirs", text: "Les touches noires forment un motif régulier : deux, puis trois, puis deux, puis trois. Ce repère visuel t’aide à te situer sans avoir à compter toutes les touches depuis le bord." },
      { title: "Trouve Do", text: "Repère un groupe de deux touches noires. La touche blanche juste à sa gauche est Do. À partir de Do, les touches blanches suivantes sont Ré, Mi, puis Fa." },
      { title: "Posture avant vitesse", text: "Assieds-toi face au centre du clavier, épaules relâchées et poignets souples. Laisse le poids du bras guider le doigt ; évite d’écraser la touche." }
    ],
    video: {
      title: "Les repères qui révèlent le clavier",
      visual: "keyboard",
      script: "Regarde les touches noires : elles se regroupent par deux et par trois. Cherche un groupe de deux. Juste à sa gauche, tu trouveras Do. Le groupe de trois commence un peu plus loin ; il t’aide lui aussi à retrouver les autres notes. Installe-toi confortablement, relâche les épaules et pose la main sans la raidir. Essaie maintenant Do, Ré, Mi, puis Fa.",
      scenes: ["Observe les groupes de deux et trois.", "Do se cache juste avant le groupe de deux.", "Installe une main souple et détendue."]
    },
    practice: { kind: "keyboard", title: "La chasse aux repères", instruction: "Joue la suite en montant. Observe le groupe de deux touches noires qui te sert de point de départ.", notes: ["Do", "Ré", "Mi", "Fa", "Mi", "Ré", "Do"], tempo: 56 }
  },
  "rythme-1": {
    blocks: [
      { title: "La pulsation, le cœur régulier", text: "La pulsation est le battement régulier que l’on peut taper du pied. Une musique peut accélérer ou ralentir, mais dans un exercice, on commence par garder ce battement stable." },
      { title: "Mesure à quatre temps", text: "La barre de mesure sépare la musique en petits groupes. En 4/4, chaque groupe contient quatre pulsations : compte 1, 2, 3, 4, puis recommence sans changer de vitesse." },
      { title: "Écoute avant de jouer", text: "Marche ou frappe doucement sur chaque pulsation. Quand ton corps garde le tempo, ajoute une note sur le premier temps." }
    ],
    video: {
      title: "Sentir la pulsation",
      visual: "rhythm",
      script: "La pulsation, c’est le battement régulier de la musique. Écoute : un, deux, trois, quatre. Chaque battement a le même espace autour de lui. Une mesure en quatre-quatre contient quatre temps ; après le quatrième, on recommence au premier. Tape doucement dans tes mains avec le métronome. Garde le mouvement calme et égal : le tempo juste vaut mieux qu’un tempo rapide.",
      scenes: ["Un battement régulier donne le tempo.", "Compte quatre temps dans la mesure.", "Tape doucement, sans accélérer."]
    },
    practice: { kind: "rhythm", title: "Quatre pulsations tranquilles", instruction: "Lance le métronome, écoute un tour, puis tape quatre pulsations régulières avec lui.", beats: 4, tempo: 60 }
  },
  "solfege-2": {
    blocks: [
      { title: "La portée", text: "Cinq lignes et quatre interlignes forment la portée. Une note placée plus haut sonne plus aigu ; une note plus basse sonne plus grave. Les lignes et les interlignes alternent." },
      { title: "La clé de sol", text: "En clé de sol, les lignes de bas en haut sont Mi, Sol, Si, Ré, Fa. Retrouve Mi sur la première ligne et Sol sur la deuxième : ce sont des repères précieux." },
      { title: "Lire, chanter, jouer", text: "Avant de chercher la touche, nomme la note sur la portée, chante-la, puis joue-la. Cette petite pause t’aide à ne pas confondre lecture et mémoire des doigts." }
    ],
    video: {
      title: "Les lignes de la clé de sol",
      visual: "staff",
      script: "La portée compte cinq lignes. En clé de sol, on lit de bas en haut : Mi, Sol, Si, Ré, Fa. La clé tourne autour de la deuxième ligne, celle du Sol. Entre les lignes, les interlignes donnent Fa, La, Do, Mi. Regarde d’abord la position de la note, nomme-la, puis chante-la. Maintenant, lis Sol, puis joue Sol sur le clavier.",
      scenes: ["Cinq lignes composent la portée.", "La deuxième ligne porte le Sol.", "Lis, chante, puis joue la note."]
    },
    practice: { kind: "keyboard", title: "La portée chante", instruction: "Lis les noms affichés, chante-les puis joue la ligne de notes sans te presser.", notes: ["Mi", "Sol", "Si", "Ré", "Fa", "Ré", "Si", "Sol", "Mi"], tempo: 54 }
  },
  "piano-2": {
    blocks: [
      { title: "Une position de départ confortable", text: "Place le pouce droit sur Do, puis les doigts suivants sur Ré, Mi, Fa et Sol. Garde la main arrondie comme si elle tenait une petite balle." },
      { title: "Construis une phrase", text: "Une mélodie est une phrase musicale. Lis son contour : les notes montent-elles, descendent-elles ou se répètent-elles ? Ici, Do–Ré–Mi–Fa–Sol avance pas à pas." },
      { title: "Trois répétitions utiles", text: "Joue une fois lentement en regardant les touches, une fois en nommant les notes et une fois en écoutant le son sans te presser. Arrête-toi si la main se crispe." }
    ],
    video: {
      title: "Ta première phrase au piano",
      visual: "keyboard",
      script: "Pose le pouce sur Do, puis un doigt sur chaque note voisine. Notre petite phrase monte : Do, Ré, Mi, Fa, Sol. Joue chaque note avec le même calme. Maintenant, redescends : Sol, Fa, Mi, Ré, Do. Ne cherche pas la vitesse ; écoute la forme de la phrase et garde la main détendue. Recommence en disant les noms des notes.",
      scenes: ["Installe le pouce sur Do.", "La phrase monte note après note.", "Redescends en écoutant la mélodie."]
    },
    practice: { kind: "keyboard", title: "Une phrase qui monte et redescend", instruction: "Joue la phrase complète en gardant un son régulier. Recommence si un doigt se crispe.", notes: ["Do", "Ré", "Mi", "Fa", "Sol", "Fa", "Mi", "Ré", "Do"], tempo: 54 }
  },
  "theory-1": {
    blocks: [
      { title: "La gamme, une famille de notes", text: "Une gamme est un ensemble de notes rangées selon un ordre. Do majeur utilise les sept notes blanches du clavier, puis revient à Do à l’octave." },
      { title: "Le motif majeur", text: "Entre Mi et Fa, et entre Si et Do, les touches sont voisines : ce sont des demi-tons. Les autres pas de la gamme de Do majeur sont des tons. Ce motif donne sa couleur à la gamme." },
      { title: "Le lien avec le clavier", text: "Monte Do, Ré, Mi, Fa, Sol, La, Si, Do. Écoute le passage Mi–Fa puis Si–Do : ces deux pas plus serrés sont les repères de la gamme majeure." }
    ],
    video: {
      title: "Pourquoi la gamme de Do sonne juste",
      visual: "scale",
      script: "La gamme de Do majeur traverse les touches blanches : Do, Ré, Mi, Fa, Sol, La, Si, Do. Entre Mi et Fa, les touches sont côte à côte : c’est un demi-ton. Même chose entre Si et Do. Les autres écarts sont plus grands. Monte lentement la gamme et écoute où les notes se rapprochent. Puis redescends pour bien mémoriser le motif.",
      scenes: ["La gamme utilise les touches blanches.", "Écoute les demi-tons Mi–Fa et Si–Do.", "Monte et redescends sans accélérer."]
    },
    practice: { kind: "keyboard", title: "La gamme de Do majeur", instruction: "Joue toute la gamme à tempo lent. Marque une courte respiration au sommet, puis redescends.", notes: ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si", "Do", "Si", "La", "Sol", "Fa", "Mi", "Ré", "Do"], tempo: 48 }
  },
  "ear-1": {
    blocks: [
      { title: "Écouter le contour", text: "Une mélodie peut monter, descendre ou répéter la même note. Même sans connaître son nom, tu peux entendre son mouvement." },
      { title: "Pas à pas ou par saut ?", text: "Quand les notes voisines se suivent, le mouvement est conjoint. Quand la mélodie franchit une ou plusieurs notes, elle fait un saut." },
      { title: "Chante avant de jouer", text: "Écoute Do–Ré–Mi, puis chante-la en gardant la hauteur. Ensuite, chante Do–Mi : le deuxième motif fait un saut plus large." }
    ],
    video: {
      title: "Voir la mélodie avec son oreille",
      visual: "staff",
      script: "Écoute ces notes : Do, Ré, Mi. La mélodie avance par petits pas ; on dit que son mouvement est conjoint. Maintenant, compare Do puis Mi : elle saute une note et le déplacement est plus large. Essaie de chanter les deux motifs avant de les jouer. Ton oreille apprend à suivre le contour, pas seulement à reconnaître un nom.",
      scenes: ["Une mélodie peut monter ou descendre.", "Do–Ré–Mi avance par pas conjoints.", "Do–Mi fait entendre un saut."]
    },
    practice: { kind: "keyboard", title: "Le motif des pas et des sauts", instruction: "Joue chaque motif, chante-le, puis compare le petit pas au saut.", notes: ["Do", "Ré", "Mi", "Do", "Mi", "Sol", "Mi", "Ré", "Do"], tempo: 56 }
  },
  "piano-3": {
    blocks: [
      { title: "Deux rôles qui se complètent", text: "Dans un morceau simple, la main droite porte souvent la mélodie tandis que la gauche soutient le son avec une basse ou un accord." },
      { title: "Séparer avant de réunir", text: "Apprends d’abord la partie de chaque main à part. Compte à voix haute, puis réunis les mains sur un tempo très lent, une mesure à la fois." },
      { title: "Le premier appui", text: "Une note grave tenue sous une mélodie peut suffire à créer un accompagnement. La main gauche n’a pas besoin de jouer beaucoup pour être utile." }
    ],
    video: {
      title: "Donner deux rôles à tes mains",
      visual: "hands",
      script: "La main droite peut jouer la mélodie, tandis que la main gauche apporte une basse. Commence par apprendre chaque partie séparément. Compte un, deux, trois, quatre et garde le tempo lent. Quand chaque main est confortable, joue-les ensemble. Si tu te perds, reviens à une seule main : cette étape fait partie de l’apprentissage.",
      scenes: ["La main droite porte souvent la mélodie.", "La gauche soutient avec une basse.", "Réunis les mains à tempo lent."]
    },
    practice: { kind: "keyboard", title: "La mélodie et son appui", instruction: "Joue d’abord la main droite, puis le motif d’accompagnement. Enfin, relie-les lentement.", notes: ["Do", "Mi", "Sol", "Mi", "Do"], tempo: 46 }
  },
  "evaluation-1": {
    blocks: [
      { title: "Avant le bilan", text: "Tu as rencontré les notes, le clavier, la portée, la pulsation et une première mélodie. Ce bilan vérifie ce que tu sais déjà mobiliser ; il sert à choisir quoi réviser, pas à te juger." },
      { title: "Comment l’utiliser", text: "Lis chaque question jusqu’au bout. Après le bilan, reprends la notion liée à chaque réponse hésitante. Puis retourne au clavier pour la transformer en geste et en écoute." }
    ],
    video: {
      title: "Relier ce que tu lis, joues et entends",
      visual: "staff",
      script: "Tu arrives à une étape importante. Pour faire de la musique, tu relies plusieurs choses : lire les notes, sentir le rythme, écouter les sons et les jouer. Le bilan ne mesure pas ta valeur ; il t’indique les notions à revoir. Prends ton temps. Après chaque réponse, imagine comment tu pourrais montrer la même idée au piano.",
      scenes: ["Relie lecture, rythme et écoute.", "Un bilan révèle ce qui est déjà solide.", "Reviens au clavier pour consolider."]
    },
    practice: { kind: "keyboard", title: "Échauffement du bilan", instruction: "Joue cette courte phrase avant le bilan écrit. Respire et garde la pulsation.", notes: ["Do", "Ré", "Mi", "Fa", "Sol", "Fa", "Mi", "Ré", "Do"], tempo: 52 }
  },
  "solfege-3": {
    blocks: [
      { title: "Une noire, un temps", text: "La noire sert souvent d’unité de pulsation. Dans une mesure en 4/4, quatre noires remplissent les quatre temps." },
      { title: "La blanche dure deux temps", text: "Une blanche dure deux noires. Une ronde dure quatre temps en 4/4. Les silences correspondants ont eux aussi une durée précise." },
      { title: "Compte en jouant", text: "Prononce les temps à voix haute. Pour tenir une blanche, compte « un, deux » avant de jouer la note suivante." }
    ],
    video: {
      title: "Comprendre la durée des notes",
      visual: "rhythm",
      script: "La noire dure un temps. La blanche tient deux temps, et la ronde peut tenir quatre temps dans une mesure à quatre-quatre. Un silence occupe lui aussi du temps, même si tu ne joues pas. Compte à voix haute et garde le battement régulier pendant toute la durée de la note.",
      scenes: ["La noire dure un temps.", "La blanche en tient deux.", "Un silence garde aussi sa durée."]
    },
    practice: { kind: "rhythm", title: "Noires et blanches en 4/4", instruction: "Frappe quatre temps réguliers, puis tiens chaque deuxième frappe deux temps.", beats: 8, tempo: 60 }
  },
  "rythme-2": {
    blocks: [
      { title: "Partager un temps en deux", text: "Deux croches occupent ensemble la durée d’une noire. On peut les compter « un-et, deux-et, trois-et, quatre-et »." },
      { title: "Le métronome comme compagnon", text: "Le clic donne la pulsation principale. Les syllabes « et » tombent exactement entre deux clics." },
      { title: "Garder le corps détendu", text: "Commence lentement. Si tu accélères, arrête-toi, respire et retrouve le battement avant de reprendre." }
    ],
    video: {
      title: "Placer deux croches dans un temps",
      visual: "rhythm",
      script: "Deux croches partagent le temps d’une noire. Écoute le clic, puis dis « un-et » : le un tombe sur le clic et le et entre deux clics. Garde la main souple. Essaie à tempo lent avant d’augmenter la vitesse. Une pulsation stable rend la musique lisible et agréable.",
      scenes: ["Deux croches partagent un temps.", "Le « et » se place entre deux clics.", "Reste régulier avant d’accélérer."]
    },
    practice: { kind: "rhythm", title: "Un-et, deux-et", instruction: "Compte huit pulsations et tape deux fois par clic. Reste détendu et recommence si tu perds le tempo.", beats: 8, tempo: 58 }
  },
  "theory-2": {
    blocks: [
      { title: "Empiler une note sur trois", text: "Un accord de trois sons peut être construit en partant d’une note, puis en ajoutant sa tierce et sa quinte." },
      { title: "L’accord de Do majeur", text: "Do, Mi et Sol composent l’accord de Do majeur. Do est la fondamentale ; Mi donne la couleur majeure ; Sol stabilise l’accord." },
      { title: "L’écoute de l’accord", text: "Joue les notes une par une, puis ensemble. L’accord sonne plus riche parce que plusieurs hauteurs se font entendre au même moment." }
    ],
    video: {
      title: "Construire l’accord de Do",
      visual: "chord",
      script: "Pour former un accord de Do majeur, commence par Do. Ajoute Mi, puis Sol : fondamentale, tierce et quinte. Joue les trois notes séparément et écoute chacune. Ensuite, fais-les sonner ensemble. Garde la main souple et cherche un son équilibré, sans forcer.",
      scenes: ["Choisis Do comme fondamentale.", "Ajoute Mi puis Sol.", "Écoute les trois notes ensemble."]
    },
    practice: { kind: "keyboard", title: "Do, Mi, Sol : le premier accord", instruction: "Joue les notes une à une, puis retrouve-les à nouveau dans l’ordre pour entendre la structure.", notes: ["Do", "Mi", "Sol", "Mi", "Do"], tempo: 50 }
  },
  "piano-4": {
    blocks: [
      { title: "Préparer le passage du pouce", text: "Pour monter une gamme au-delà de cinq doigts, le pouce passe sous la main après le troisième doigt. Le geste reste souple : ce n’est pas le poignet qui s’effondre." },
      { title: "Un doigté de départ", text: "À la main droite, Do majeur monte généralement 1–2–3, passage du pouce, puis 1–2–3–4–5. Descends avec le mouvement inverse." },
      { title: "Qualité du son", text: "Travaille lentement et régulièrement. Le passage du pouce doit rester fluide, sans accent involontaire sur la note qui suit." }
    ],
    video: {
      title: "La gamme et le passage du pouce",
      visual: "scale",
      script: "La gamme de Do majeur va de Do à Do. Avec la main droite, joue Do, Ré, Mi, puis glisse le pouce sous la main pour continuer Fa, Sol, La, Si, Do. Le geste reste détendu et régulier. Travaille lentement, puis redescends sans accentuer le passage du pouce.",
      scenes: ["Joue les trois premières notes.", "Le pouce passe avec souplesse.", "Redescends avec le même son."]
    },
    practice: { kind: "keyboard", title: "La gamme sans heurt", instruction: "Monte puis redescends en gardant le même volume. Le passage du pouce doit rester discret.", notes: ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si", "Do", "Si", "La", "Sol", "Fa", "Mi", "Ré", "Do"], tempo: 42 }
  },
  "ear-2": {
    blocks: [
      { title: "L’intervalle, une distance sonore", text: "Un intervalle mesure l’écart entre deux notes. Tu peux l’entendre comme un pas, un saut ou un mouvement vers le grave." },
      { title: "Comparer plutôt que deviner", text: "Écoute d’abord la première note, puis la seconde. La seconde est-elle plus aiguë ou plus grave ? Est-elle voisine ou éloignée ?" },
      { title: "Chanter pour mémoriser", text: "Chante les deux sons l’un après l’autre. Le geste vocal révèle la direction et aide à retenir la distance." }
    ],
    video: {
      title: "Écouter la distance entre deux notes",
      visual: "staff",
      script: "Un intervalle, c’est la distance entre deux notes. Écoute d’abord Do puis Ré : les notes sont voisines. Maintenant, écoute Do puis Sol : le saut est plus large. Chante chaque paire et remarque si elle monte ou descend. L’oreille progresse grâce à la comparaison attentive.",
      scenes: ["Deux notes forment un intervalle.", "Do–Ré est un petit pas.", "Do–Sol produit un saut plus large."]
    },
    practice: { kind: "keyboard", title: "Petits pas, grands sauts", instruction: "Joue les motifs et chante chaque distance avant de poursuivre.", notes: ["Do", "Ré", "Do", "Mi", "Do", "Sol", "Sol", "Mi", "Ré", "Do"], tempo: 48 }
  },
  "piano-5": {
    blocks: [
      { title: "La basse pose les fondations", text: "La main gauche peut jouer la fondamentale sur le premier temps. Une basse claire aide l’oreille à comprendre l’harmonie du morceau." },
      { title: "Un accompagnement régulier", text: "Commence par une note grave tenue pendant que la main droite joue une petite mélodie. Compte la mesure et laisse de l’espace au son." },
      { title: "Équilibrer les deux mains", text: "La mélodie doit rester audible. Joue la main gauche plus doucement, puis ajuste selon ce que tu entends." }
    ],
    video: {
      title: "Accompagner avec la main gauche",
      visual: "hands",
      script: "La main gauche pose souvent la basse sur la fondamentale de l’accord. Pour Do majeur, commence par Do. Tiens la note pendant que la main droite joue sa mélodie. Compte la pulsation, joue doucement et écoute si les deux mains s’équilibrent.",
      scenes: ["La basse repose sur la fondamentale.", "La main droite garde la mélodie.", "Écoute l’équilibre entre les mains."]
    },
    practice: { kind: "keyboard", title: "La basse sur les temps forts", instruction: "Fais sonner Do comme une basse, puis reprends le motif. Imagine une main gauche plus grave.", notes: ["Do", "Sol", "Do", "Sol", "Do"], tempo: 44 }
  },
  "solfege-4": {
    blocks: [
      { title: "La clé de fa", text: "La clé de fa sert à lire les notes graves. Ses deux points entourent la ligne du Fa, quatrième ligne en partant du bas." },
      { title: "Les lignes de la portée", text: "De bas en haut, les cinq lignes en clé de fa sont Sol, Si, Ré, Fa, La. Les interlignes sont La, Do, Mi, Sol." },
      { title: "Le lien avec la main gauche", text: "La main gauche joue souvent dans le registre grave. Lis une note de la portée basse avant de chercher son emplacement sur le clavier." }
    ],
    video: {
      title: "Lire les notes graves en clé de fa",
      visual: "staff",
      script: "La clé de fa t’aide à lire les notes graves. Les deux points entourent la quatrième ligne : c’est Fa. En partant du bas, les lignes sont Sol, Si, Ré, Fa, La. Lis lentement chaque position et relie-la aux touches jouées par la main gauche.",
      scenes: ["Les deux points entourent la ligne du Fa.", "Lis Sol, Si, Ré, Fa, La en montant.", "Relie la portée basse au clavier."]
    },
    practice: { kind: "keyboard", title: "La ligne de basse", instruction: "Lis les notes de bas en haut, puis joue-les sur le clavier dans le même ordre.", notes: ["Sol", "Si", "Ré", "Fa", "La", "Fa", "Ré", "Si", "Sol"], tempo: 48 }
  },
  "theory-3": {
    blocks: [
      { title: "Un demi-ton vers le haut", text: "Le dièse augmente la hauteur d’un demi-ton. Sur le clavier, la touche la plus proche à droite est souvent la note diésée." },
      { title: "Un demi-ton vers le bas", text: "Le bémol baisse la hauteur d’un demi-ton. Un même son peut avoir plusieurs noms selon la tonalité et le contexte musical." },
      { title: "Attention à la tonalité", text: "Les altérations à l’armure s’appliquent aux notes concernées pendant le morceau, sauf indication contraire. Repère-les avant de jouer." }
    ],
    video: {
      title: "Dièses et bémols sur le clavier",
      visual: "keyboard",
      script: "Un dièse monte une note d’un demi-ton ; un bémol la baisse d’un demi-ton. Sur le clavier, les touches noires servent souvent à montrer ces sons. Les noms dépendent de la tonalité et du contexte. Avant de jouer, repère les signes à l’armure.",
      scenes: ["Le dièse monte d’un demi-ton.", "Le bémol baisse d’un demi-ton.", "Repère l’armure avant de jouer."]
    },
    practice: { kind: "keyboard", title: "Entendre les altérations", instruction: "Compare les notes naturelles et leurs voisines chromatiques. Écoute la petite distance qui les sépare.", notes: ["Fa", "Fa♯", "Sol", "La", "La♭", "Sol"], tempo: 50 }
  },
  "piano-6": {
    blocks: [
      { title: "Assembler par petits morceaux", text: "Choisis une mesure courte. Travaille chaque main seule, puis joue les deux mains lentement. N’augmente le tempo qu’après plusieurs répétitions confortables." },
      { title: "Écouter la coordination", text: "La basse et la mélodie ne tombent pas toujours ensemble. Compte le temps, repère leurs points de rencontre et garde les poignets souples." },
      { title: "Une pratique qui progresse", text: "Rejoue le passage lentement, puis fais une pause. Une bonne répétition attentive vaut mieux qu’une longue série jouée en tension." }
    ],
    video: {
      title: "Coordonner les deux mains pas à pas",
      visual: "hands",
      script: "Choisis un motif court. Joue d’abord la main droite, puis la main gauche seule. Compte à voix haute. Réunis les mains très lentement et écoute où elles se retrouvent. Si la coordination devient difficile, ralentis et isole une seule mesure.",
      scenes: ["Apprends chaque main séparément.", "Compte avant de les réunir.", "Ralentis pour retrouver la coordination."]
    },
    practice: { kind: "keyboard", title: "Un motif, deux rôles", instruction: "Joue chaque note doucement. Imagine la première comme une basse et les suivantes comme une mélodie.", notes: ["Do", "Sol", "Mi", "Sol", "Do"], tempo: 42 }
  },
  "evaluation-2": {
    blocks: [
      { title: "Le bilan n’est pas une course", text: "Ce bilan rassemble lecture, valeurs rythmiques, harmonie, altérations et coordination. Lis la consigne et prends le temps de réfléchir." },
      { title: "Transformer un résultat en plan", text: "Après le bilan, retourne aux leçons où tu as hésité. Rejoue l’exercice lentement, écoute le résultat, puis retente plus tard." }
    ],
    video: {
      title: "Préparer son bilan musical",
      visual: "hands",
      script: "Ce bilan rassemble les outils que tu as travaillés : lire les notes, compter les rythmes, entendre les intervalles et coordonner tes mains. Prends ton temps. Une réponse incertaine indique une piste à revoir, pas un échec. Après le bilan, retourne jouer ce qui mérite encore de l’attention.",
      scenes: ["Rassemble lecture, rythme et harmonie.", "Prends le temps de réfléchir.", "Fais du bilan un plan de pratique."]
    },
    practice: { kind: "keyboard", title: "Le motif de concentration", instruction: "Joue lentement et régulièrement, puis passe au bilan quand tu te sens prêt·e.", notes: ["Do", "Mi", "Sol", "Mi", "Do"], tempo: 44 }
  }
};

module.exports = content;
