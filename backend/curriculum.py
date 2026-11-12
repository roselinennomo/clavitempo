import hashlib
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]

CATEGORIES = [
    {"id": "solfege", "label": "Solfège", "icon": "𝄞"},
    {"id": "piano", "label": "Piano", "icon": "♬"},
    {"id": "rythme", "label": "Rythme", "icon": "◉"},
    {"id": "theorie", "label": "Théorie & harmonie", "icon": "✧"},
    {"id": "ecoute", "label": "Écoute", "icon": "◖"},
    {"id": "histoire", "label": "Histoire du piano", "icon": "⌛"},
    {"id": "styles", "label": "Styles musicaux", "icon": "♫"},
    {"id": "technique", "label": "Technique", "icon": "✋"},
    {"id": "repertoire", "label": "Répertoire", "icon": "▤"},
    {"id": "improvisation", "label": "Improvisation", "icon": "✦"},
    {"id": "ensemble", "label": "Jeu d’ensemble", "icon": "♬"},
    {"id": "evaluation", "label": "Bilans de niveau", "icon": "✷"},
]

CURRICULUM_ORDER = [
    "solfege-1", "piano-1", "technique-1", "rythme-1", "history-1",
    "solfege-2", "piano-2", "theory-1", "repertoire-1", "styles-1", "history-2",
    "ear-1", "piano-3", "solfege-3", "rythme-2", "theory-2", "piano-4",
    "technique-2", "repertoire-2", "styles-2", "evaluation-1",
    "ear-2", "piano-5", "history-3", "styles-3", "solfege-4", "theory-3",
    "theory-4", "piano-6", "evaluation-2",
    "styles-4", "history-4", "history-5", "styles-5", "technique-3", "improvisation-1",
    "repertoire-3", "composition-1", "ensemble-1", "evaluation-3",
]

LEVEL_NAMES = {
    1: "Les premiers repères",
    2: "Lire et comprendre",
    3: "Construire sa technique",
    4: "Élargir son langage musical",
    5: "Explorer les styles",
    6: "Créer et interpréter",
}

VIDEO_RATIONALES = {
    "solfege": "le solfège relie ce que tu vois sur la partition, ce que tu entends et ce que tes doigts jouent",
    "piano": "les repères du clavier t’aident à trouver les notes et à jouer avec plus d’assurance",
    "rythme": "une pulsation stable permet de coordonner tes gestes et de garder le fil de la musique",
    "theorie": "comprendre les relations entre les notes rend les gammes, les accords et les morceaux plus lisibles",
    "ecoute": "l’écoute attentive t’aide à reconnaître les sons et à mieux contrôler ce que tu joues",
    "histoire": "connaître l’évolution de l’instrument éclaire les sons et les choix des musiciens",
    "styles": "chaque style demande une écoute, un toucher et une articulation adaptés",
    "technique": "un geste souple construit la précision tout en évitant les tensions inutiles",
    "repertoire": "lire une partition et organiser son travail t’aide à apprendre des morceaux entiers",
    "improvisation": "transformer des motifs te donne des outils pour créer et t’exprimer librement",
    "composition": "organiser des idées musicales t’aide à créer des phrases et des formes cohérentes",
    "ensemble": "écouter les autres permet de jouer ensemble avec un tempo et un équilibre partagés",
    "evaluation": "un bilan fait ressortir tes acquis et t’aide à choisir la prochaine étape de travail",
}

VIDEO_VISUAL_HINTS = {
    "keyboard": "Observe les touches et les repères mis en évidence pendant l’explication.",
    "staff": "Observe la portée et la position des notes pendant l’explication.",
    "rhythm": "Suis les pulsations à l’écran et remarque leur espacement régulier.",
    "scale": "Suis le trajet des notes et repère le sens de leur mouvement.",
    "chord": "Observe comment les sons se regroupent et se répondent.",
    "hands": "Observe la position des mains et le mouvement souple des doigts.",
}

INSTRUMENT_IMAGES = {
    "clavichord": {
        "src": "/images/instruments/clavichord-18c.jpg",
        "alt": "Clavicorde à clavier, photographié de face, avec ses touches et sa caisse en bois.",
        "caption": "Clavicorde, Johann Heinrich Gräbner, XVIIIe siècle.",
        "credit": "The Metropolitan Museum of Art, Open Access.",
        "sourceUrl": "https://www.metmuseum.org/art/collection/search/503896",
    },
    "harpsichord": {
        "src": "/images/instruments/harpsichord-1666.jpg",
        "alt": "Clavecin italien à queue, couvercle ouvert et caisse décorée.",
        "caption": "Clavecin, Girolamo Zenti, 1666.",
        "credit": "The Metropolitan Museum of Art, Open Access.",
        "sourceUrl": "https://www.metmuseum.org/art/collection/search/501789",
    },
    "cristofori": {
        "src": "/images/instruments/cristofori-piano-1720.jpg",
        "alt": "Piano à queue de Bartolomeo Cristofori, couvercle ouvert.",
        "caption": "Piano à queue, Bartolomeo Cristofori, 1720.",
        "credit": "The Metropolitan Museum of Art, Open Access.",
        "sourceUrl": "https://www.metmuseum.org/art/collection/search/501788",
    },
    "pianoforte": {
        "src": "/images/instruments/pianoforte-1794-1802.jpg",
        "alt": "Pianoforte ancien à queue, dont le décor et les proportions diffèrent d’un piano moderne.",
        "caption": "Pianoforte, Stein, Frère et Sœur, 1794–1802.",
        "credit": "The Metropolitan Museum of Art, Open Access.",
        "sourceUrl": "https://www.metmuseum.org/art/collection/search/503049",
    },
    "broadwood": {
        "src": "/images/instruments/broadwood-piano-1827.jpg",
        "alt": "Piano à queue de John Broadwood & Sons, daté de 1827.",
        "caption": "Piano à queue, John Broadwood & Sons, 1827.",
        "credit": "The Metropolitan Museum of Art, Open Access.",
        "sourceUrl": "https://www.metmuseum.org/art/collection/search/503056",
    },
}


def _build_video_sections(
    lesson: dict[str, Any],
    next_lesson: dict[str, Any] | None,
) -> list[dict[str, Any]]:
    blocks = lesson.get("blocks", [])
    original_scenes = lesson.get("video", {}).get("scenes", [])
    chapter_titles = [block["title"] for block in blocks]
    rationale = VIDEO_RATIONALES.get(
        lesson["category"],
        "chaque notion de musique devient plus facile à comprendre quand tu peux la relier à l’écoute et à la pratique",
    )
    visual_hint = VIDEO_VISUAL_HINTS.get(
        lesson.get("video", {}).get("visual", ""),
        "Observe l’illustration et relie-la à la notion expliquée.",
    )

    sections: list[dict[str, Any]] = [
        {
            "kind": "intro",
            "title": "Introduction",
            "detail": lesson["objective"],
            "takeaway": "Objectif et utilité de la leçon",
            "narration": (
                f"Bienvenue dans ClaviTempo. Aujourd’hui, nous allons travailler "
                f"« {lesson['shortTitle']} ». L’objectif est de {lesson['objective'][0].lower()}"
                f"{lesson['objective'][1:]} Cette compétence est utile parce que {rationale}. "
                "Prends le temps d’observer et d’écouter : la précision compte davantage que la vitesse."
            ),
        },
        {
            "kind": "roadmap",
            "title": "Au programme",
            "detail": " · ".join(
                f"{index + 1}. {title}" for index, title in enumerate(chapter_titles)
            ),
            "takeaway": "Explication, mise en pratique, puis bilan",
            "narration": (
                f"Voici le parcours de cette capsule : {len(blocks)} chapitres pour avancer pas à pas. "
                + " ".join(
                    f"Première étape : {title}."
                    if index == 0
                    else f"Ensuite : {title}."
                    for index, title in enumerate(chapter_titles)
                )
                + " Nous terminerons par un exercice guidé, puis par un résumé et un lien avec la suite du cursus."
            ),
        },
    ]

    for index, block in enumerate(blocks):
        takeaway = (
            original_scenes[index]
            if index < len(original_scenes)
            else block["title"]
        )
        sections.append(
            {
                "kind": "chapter",
                "title": f"Chapitre {index + 1} · {block['title']}",
                "detail": block["text"],
                "takeaway": takeaway,
                **({"images": block["images"]} if block.get("images") else {}),
                "narration": (
                    f"Chapitre {index + 1} : {block['title']}. {block['text']} "
                    f"{visual_hint} À retenir : {takeaway}"
                ),
            }
        )

    practice = lesson.get("practice", {})
    practice_notes = practice.get("notes", [])
    notes_detail = (
        f" La phrase utilise les notes suivantes : {' – '.join(practice_notes)}."
        if practice_notes
        else ""
    )
    sections.append(
        {
            "kind": "practice",
            "title": f"À toi de jouer · {practice.get('title', 'Exercice guidé')}",
            "detail": practice.get("instruction", "Reprends la notion lentement et écoute le résultat."),
            "takeaway": "Précision, écoute et détente avant la vitesse",
            "notes": practice_notes,
            "narration": (
                f"Passons à la pratique : {practice.get('title', 'exercice guidé')}. "
                f"{practice.get('instruction', 'Reprends la notion lentement et écoute le résultat.')} "
                f"Commence lentement et vérifie chaque geste à l’écoute.{notes_detail}"
            ),
        }
    )

    takeaways = lesson.get("takeaways") or [
        block["title"] for block in blocks
    ]
    sections.append(
        {
            "kind": "takeaways",
            "title": "À retenir",
            "detail": "Les idées essentielles de cette leçon, à retrouver dans ta pratique.",
            "takeaways": takeaways,
            "narration": (
                "Avant de conclure, voici les idées à garder en mémoire. "
                + " ".join(takeaways)
            ),
        }
    )

    recap = " ; ".join(
        original_scenes[index]
        if index < len(original_scenes)
        else block["title"]
        for index, block in enumerate(blocks)
    )
    if next_lesson:
        conclusion = (
            f"Pour conclure, garde en mémoire ces repères : {recap}. "
            f"Tu viens de travailler l’objectif suivant : {lesson['objective'][0].lower()}"
            f"{lesson['objective'][1:]} Dans la prochaine leçon, « {next_lesson['title']} », "
            f"tu réutiliseras cette base pour {next_lesson['objective'][0].lower()}"
            f"{next_lesson['objective'][1:]}"
        )
        next_detail = f"Prochaine étape : {next_lesson['title']}"
    else:
        conclusion = (
            f"Pour conclure, garde en mémoire ces repères : {recap}. "
            "Ce bilan clôt le parcours actuel : célèbre tes acquis et choisis les notions "
            "que tu souhaites continuer à approfondir."
        )
        next_detail = "Bilan du parcours et pistes pour continuer"

    sections.append(
        {
            "kind": "recap",
            "title": "Conclusion · les repères à retenir",
            "detail": recap,
            "takeaway": next_detail,
            "narration": conclusion,
        }
    )
    return sections


def _lesson(
    lesson_id: str,
    title: str,
    short_title: str,
    category: str,
    category_label: str,
    level: int,
    duration: int,
    icon: str,
    color: str,
    description: str,
    objective: str,
    requires: list[str],
    blocks: list[tuple[str, str]],
    video_title: str,
    visual: str,
    scenes: list[str],
    script: str,
    practice_title: str,
    practice_instruction: str,
    notes: list[str],
    tempo: int = 56,
    questions: list[dict[str, Any]] | None = None,
    block_images: dict[int, list[dict[str, str]]] | None = None,
    takeaways: list[str] | None = None,
) -> dict[str, Any]:
    lesson: dict[str, Any] = {
        "id": lesson_id,
        "title": title,
        "shortTitle": short_title,
        "category": category,
        "categoryLabel": category_label,
        "level": level,
        "duration": duration,
        "icon": icon,
        "color": color,
        "description": description,
        "objective": objective,
        "requires": requires,
        "blocks": [
            {
                "title": heading,
                "text": text,
                **(
                    {"images": block_images[index]}
                    if block_images and index in block_images
                    else {}
                ),
            }
            for index, (heading, text) in enumerate(blocks)
        ],
        "takeaways": takeaways or list(scenes),
        "video": {
            "title": video_title,
            "url": f"/media/{lesson_id}.mp4",
            "visual": visual,
            "scenes": scenes,
            "script": script,
        },
        "practice": {
            "kind": "keyboard",
            "title": practice_title,
            "instruction": practice_instruction,
            "notes": notes,
            "tempo": tempo,
        },
    }
    if questions:
        lesson["questions"] = questions
    return lesson


EXTRA_LESSONS = [
    _lesson(
        "technique-1", "S’installer au piano sans se crisper", "Posture et geste",
        "technique", "TECHNIQUE", 1, 8, "✋", "mint",
        "Trouve une position confortable avant de demander de la vitesse à tes doigts.",
        "Adopter une posture détendue et un geste souple.", ["piano-1"],
        [
            ("Le banc et le clavier", "Assieds-toi vers le milieu du banc, face au centre du clavier. Tes avant-bras arrivent à peu près à la hauteur des touches ; ajuste la hauteur plutôt que de hausser les épaules."),
            ("Une main naturellement arrondie", "Laisse les doigts reposer sur les touches, courbés sans raideur. Le pouce reste souple et les poignets continuent la ligne de l’avant-bras."),
            ("Le son vient d’un geste libre", "Appuie avec le poids naturel du bras, puis relâche. Si ta main, ton épaule ou ta nuque se tend, arrête-toi et recommence plus doucement."),
        ],
        "Une posture qui libère les mains", "hands",
        ["Installe-toi face au clavier.", "Relâche épaules et poignets.", "Laisse le bras guider le doigt."],
        "Avant de jouer, installe-toi confortablement. Le banc fait face au milieu du clavier et tes épaules restent libres. Pose les doigts comme si tu tenais une petite balle, sans raidir le poignet. Joue quatre notes lentement, puis relâche la main. Le confort et la qualité du son comptent davantage que la force.",
        "Le geste souple", "Joue une petite phrase en gardant la main détendue. Relâche les épaules entre les notes.",
        ["Do", "Ré", "Mi", "Ré", "Do"], 52,
    ),
    _lesson(
        "history-1", "Avant le piano : du clavecin au pianoforte", "Les origines du piano",
        "histoire", "HISTOIRE", 1, 9, "⌛", "butter",
        "Découvre les instruments à clavier qui ont précédé le piano moderne.",
        "Expliquer comment les mécanismes du clavicorde et du clavecin conduisent à l’invention du pianoforte par Cristofori.",
        ["solfege-1", "piano-1"],
        [
            (
                "Trois claviers, trois façons de faire vibrer",
                "Le clavicorde fait toucher la corde par une petite pièce de métal, la tangente. Tant que la touche reste enfoncée, le doigt peut modifier légèrement la pression et donc la nuance ; le son reste toutefois très doux. Dans le clavecin, un plectre accroché à un sautereau pince la corde : appuyer plus fort sur la touche ne rend pas vraiment cette note plus forte. Les registres ou les deux claviers changent plutôt la couleur et le volume d’ensemble. L’orgue, lui, envoie de l’air dans des tuyaux. Ces instruments coexistent : ils ne forment pas une chaîne où l’un disparaît dès l’arrivée du suivant.",
            ),
            (
                "Le défi de Cristofori",
                "Un clavier expressif doit permettre au même doigt de produire une nuance différente à chaque note. Le clavecin offre des contrastes par ses registres, mais pas ce contrôle direct du toucher ; le clavicorde le permet, mais son faible volume limite son usage dans une grande salle. Bartolomeo Cristofori (1655–1731), facteur d’instruments à Florence, cherche une autre réponse : faire frapper les cordes par un marteau dont la vitesse dépend du geste du pianiste. Il reprend la disposition familière d’un clavier à cordes, mais remplace le pincement par une mécanique nouvelle.",
            ),
            (
                "De la touche à la corde : la mécanique",
                "Quand le doigt enfonce la touche, celle-ci agit comme un levier et soulève une série de pièces articulées. Un marteau rembourré accélère vers la corde ; juste avant le contact, l’échappement le libère pour qu’il frappe puis retombe sans rester collé à la corde. Un mécanisme de réception contrôle sa chute, tandis que l’étouffoir se soulève pendant que la touche est tenue. Quand le doigt relâche, l’étouffoir revient et arrête la vibration. Le geste ne pousse donc pas directement la corde : il règle l’élan du marteau. C’est cette transmission précise qui rend possibles des nuances graduées et des notes répétées.",
            ),
            (
                "Du pianoforte de Cristofori au piano",
                "Cristofori construit ses premiers instruments autour de 1700 ; l’un de ses pianos à queue, conservé au Metropolitan Museum of Art, date de 1720. Le nom historique « clavicembalo col piano e forte » signifie littéralement un clavier capable de jouer doucement et fortement. Le mot piano résume donc une nouvelle relation entre le geste et la nuance. Les facteurs qui suivent ne recopient pas tous le même modèle : ils modifient peu à peu l’étendue, les cordes, la caisse et l’action. Le piano moderne est le résultat de cette longue mise au point, pas d’une invention achevée en un seul jour.",
            ),
        ],
        "Comment le pianoforte prend forme", "history",
        [
            "Clavicorde : la tangente frappe la corde ; le toucher nuance un son discret.",
            "Clavecin : le plectre pince la corde ; le toucher change peu son volume.",
            "Cristofori transmet le geste à un marteau qui frappe puis s’échappe.",
            "Pianoforte : le toucher peut faire entendre le piano et le forte.",
        ],
        "Avant le piano, les musiciens jouent du clavecin et de l’orgue. Le clavecin pince ses cordes ; son intensité varie peu sous les doigts. Autour de l’an mille sept cents, Cristofori imagine une mécanique à marteaux. Le pianoforte peut alors sonner doucement ou fortement selon le toucher. Cette invention transforme la façon d’écrire et de jouer au clavier.",
        "Écouter le toucher", "Joue le motif deux fois : d’abord doucement, puis avec un son plus affirmé, sans taper sur les touches.",
        ["Do", "Mi", "Sol", "Mi", "Do"], 50,
        block_images={
            0: [INSTRUMENT_IMAGES["clavichord"], INSTRUMENT_IMAGES["harpsichord"]],
            3: [INSTRUMENT_IMAGES["cristofori"], INSTRUMENT_IMAGES["pianoforte"]],
        },
        takeaways=[
            "Clavicorde : une tangente frappe la corde ; le doigt peut nuancer un son très doux.",
            "Clavecin : un plectre pince la corde ; le volume d’une note dépend peu de la force du doigt.",
            "Cristofori : un marteau libre frappe la corde ; l’échappement et l’étouffoir rendent le geste contrôlable.",
            "Pianoforte signifie « doux-fort » : la nuance devient une possibilité du toucher.",
        ],
    ),
    _lesson(
        "repertoire-1", "Lire une partition avant de jouer", "Découvrir une partition",
        "repertoire", "RÉPERTOIRE", 2, 10, "▤", "lavender",
        "Repère la clé, la mesure, le tempo et les nuances avant la première note.",
        "Préparer une courte partition en repérant ses indications.", ["solfege-2", "piano-2"],
        [
            ("Observer la page", "Avant de jouer, repère les portées, la clé et la mesure. Regarde ensuite les notes les plus hautes et les plus basses pour anticiper leur place sur le clavier."),
            ("Lire aussi ce qui n’est pas une note", "Le tempo indique la vitesse générale. Les nuances demandent de jouer plus doucement ou plus fort ; les barres et les reprises organisent les phrases."),
            ("Préparer avant d’exécuter", "Compte la mesure à voix basse, nomme quelques notes et imagine le mouvement de la mélodie. Une lecture préparée rend le premier essai plus calme."),
        ],
        "Les indices cachés dans une partition", "staff",
        ["Repère les clés et les mesures.", "Lis tempo et nuances.", "Prépare le geste avant de jouer."],
        "Une partition donne plus que des noms de notes. Commence par repérer la clé et la mesure. Cherche ensuite le tempo, les nuances et les reprises. Observe si la mélodie monte, descend ou se répète. Compte doucement la mesure avant de poser les doigts. Cette préparation transforme la page en plan de jeu.",
        "Lire puis jouer", "Lis la suite en nommant chaque note avant de la jouer. Garde un tempo lent et régulier.",
        ["Do", "Ré", "Mi", "Sol", "Mi", "Ré", "Do"], 50,
    ),
    _lesson(
        "styles-1", "Le piano baroque : plusieurs voix en dialogue", "Le style baroque",
        "styles", "STYLES", 2, 10, "♫", "butter",
        "Écoute le dialogue des lignes et l’articulation précise de la musique baroque.",
        "Reconnaître le contrepoint et articuler une phrase baroque simple.", ["history-1", "solfege-2", "piano-2"],
        [
            ("Un dialogue de voix", "Dans le contrepoint, plusieurs mélodies gardent leur indépendance tout en s’accordant. Écoute une voix, puis l’autre, au lieu de n’entendre qu’un bloc d’accords."),
            ("Une articulation lisible", "Les phrases baroques s’appuient souvent sur des notes détachées et des motifs répétés. Détacher ne signifie pas jouer sec : le geste reste souple et le rythme net."),
            ("Bach, un repère majeur", "Jean-Sébastien Bach compose préludes, suites et fugues. Dans une fugue, un thème circule d’une voix à l’autre ; on peut le suivre comme un personnage qui entre dans la conversation."),
        ],
        "Suivre les voix baroques", "staff",
        ["Chaque voix possède sa ligne.", "Un thème passe d’une voix à l’autre.", "Articule clairement sans te raidir."],
        "La musique baroque aime le dialogue. Une voix présente un motif, une autre lui répond. Dans une fugue de Bach, le thème passe d’une ligne à l’autre. Pour jouer ce style, écoute chaque phrase et garde une articulation claire. Détache légèrement les notes sans les durcir. La régularité du rythme aide les voix à rester lisibles.",
        "Un motif en dialogue", "Joue la phrase avec des notes légèrement séparées, puis répète-la comme une réponse musicale.",
        ["Do", "Sol", "Mi", "Sol", "Ré", "La", "Fa", "La"], 54,
    ),
    _lesson(
        "history-2", "Le piano classique et l’équilibre des phrases", "L’époque classique",
        "histoire", "HISTOIRE", 2, 9, "⌛", "lavender",
        "Relie l’essor du piano aux phrases claires de Haydn, Mozart et Beethoven.",
        "Situer le piano dans la période classique et en décrire le langage.", ["history-1", "piano-2", "solfege-2"],
        [
            ("Le pianoforte change selon les ateliers", "Au XVIIIe siècle, il n’existe pas encore un modèle unique de piano. Des facteurs de Vienne, d’Augsbourg et de Londres ajustent la mécanique, la longueur des cordes, le clavier et les registres à leurs choix. Un instrument léger et réactif ne répond pas comme un piano moderne : son timbre et sa résistance influencent l’articulation et la durée des notes. Les compositeurs écrivent ainsi pour un instrument en évolution, et les pianistes doivent écouter la réponse propre à leur clavier."),
            ("La forme sonate : présenter, transformer, revenir", "Dans de nombreuses sonates classiques, une première partie présente des idées musicales contrastées ; une partie centrale les transforme, les déplace ou les fragmente ; puis une réexposition fait revenir les thèmes dans un nouvel équilibre. Ce n’est pas une recette identique dans chaque œuvre, mais une façon d’organiser le temps et de faire entendre une transformation. Quand tu repères un motif qui revient, tu peux entendre ce qui a changé autour de lui, au lieu de suivre seulement une suite de notes."),
            ("Haydn, Mozart et Beethoven : trois voix différentes", "Haydn joue souvent avec les attentes et les silences ; Mozart privilégie fréquemment la clarté du chant et l’équilibre ; Beethoven amplifie les contrastes et peut transformer un motif très court en moteur d’un mouvement. Ces repères ne résument pas leur musique, mais ils aident à poser une première écoute. Dans une phrase au piano, identifie l’idée, sa réponse, puis le point où elle change ; donne à chaque rôle une articulation et une intensité adaptées."),
        ],
        "Le pianoforte classique et la forme sonate", "history",
        ["Les ateliers fabriquent des pianos aux réponses différentes.", "La sonate présente, transforme puis fait revenir des idées.", "Le toucher et l’articulation rendent les contrastes audibles."],
        "Au dix-huitième siècle, le piano gagne en étendue et en finesse. Haydn, Mozart et Beethoven écrivent pour cet instrument en pleine évolution. Dans leur musique, les motifs se répondent et les phrases respirent. Écoute les contrastes entre une idée et sa réponse. Au clavier, donne à chaque phrase un début, une direction et une fin.",
        "Question et réponse", "Joue le premier motif, marque une respiration, puis joue le second comme une réponse.",
        ["Do", "Mi", "Sol", "Mi", "Ré", "Fa", "La", "Fa"], 54,
        block_images={0: [INSTRUMENT_IMAGES["pianoforte"], INSTRUMENT_IMAGES["broadwood"]]},
        takeaways=[
            "Au XVIIIe siècle, les pianos varient selon les ateliers : il n’existe pas un seul toucher classique.",
            "Une forme sonate fait entendre des idées présentées, transformées puis ramenées.",
            "L’articulation, le silence et le contraste aident à distinguer les rôles d’une phrase.",
        ],
    ),
    _lesson(
        "technique-2", "Le doigté : trouver un chemin fluide", "Doigtés et legato",
        "technique", "TECHNIQUE", 3, 11, "✋", "peach",
        "Choisis des doigtés cohérents pour relier les notes sans gestes brusques.",
        "Utiliser un doigté simple et relier les notes avec souplesse.", ["technique-1", "piano-4"],
        [
            ("Un numéro par doigt", "Les doigts se numérotent de un à cinq, du pouce à l’auriculaire. Les indications de doigté aident à organiser un déplacement avant qu’il ne devienne urgent."),
            ("Le pouce passe, la main accompagne", "Dans une gamme, le pouce se glisse sous la main pour poursuivre le mouvement. Évite de tordre le poignet : le bras et la main se déplacent ensemble."),
            ("Legato sans tension", "Pour relier deux notes, prépare le doigt suivant avant de relâcher le précédent. Le geste reste petit ; le poignet ne doit ni s’affaisser ni se bloquer."),
        ],
        "Le passage du pouce en douceur", "hands",
        ["Du pouce au petit doigt : un à cinq.", "Prépare le doigt suivant.", "La main accompagne le passage."],
        "Les doigts portent un numéro de un à cinq. Un bon doigté prépare le mouvement suivant au lieu de le subir. Dans une gamme, le pouce passe sous la main ; le poignet reste souple et accompagne le déplacement. Pour relier les sons, prépare le doigt suivant avant de relâcher le premier. Va lentement et cherche un legato confortable.",
        "La gamme avec un doigté stable", "Joue la phrase lentement. Garde des doigts proches des touches et laisse le pouce se déplacer sans crispation.",
        ["Do", "Ré", "Mi", "Fa", "Sol", "Fa", "Mi", "Ré", "Do"], 46,
    ),
    _lesson(
        "styles-2", "Le style classique : clarté et équilibre", "Le style classique",
        "styles", "STYLES", 3, 10, "♫", "peach",
        "Travaille une phrase classique avec une mélodie claire et un accompagnement discret.",
        "Distinguer mélodie et accompagnement dans une phrase classique.", ["history-2", "piano-3"],
        [
            ("La mélodie en premier plan", "Dans une texture classique fréquente, la main droite porte la mélodie tandis que la gauche l’accompagne. Les deux rôles s’écoutent sans se concurrencer."),
            ("Des phrases symétriques", "Les motifs sont souvent organisés en phrases de longueur comparable. Une question musicale trouve sa réponse ; repère les respirations avant de jouer."),
            ("Équilibrer le son", "Fais ressortir la ligne chantante et allège les notes d’accompagnement. Un son clair et régulier vaut mieux qu’un volume uniforme ou une main gauche trop forte."),
        ],
        "Équilibrer mélodie et accompagnement", "hands",
        ["La mélodie chante au premier plan.", "L’accompagnement laisse de l’espace.", "Fais respirer chaque phrase."],
        "Dans une pièce classique, écoute la mélodie comme une voix qui chante. La main gauche l’accompagne sans la couvrir. Les phrases se répondent et laissent de petits espaces pour respirer. Joue la mélodie avec une intention claire, puis allège l’accompagnement. L’équilibre du son raconte la structure de la musique.",
        "Une phrase équilibrée", "Joue la mélodie seule, puis ajoute un appui régulier en imaginant la main gauche plus douce.",
        ["Do", "Mi", "Sol", "La", "Sol", "Mi", "Ré", "Do"], 50,
    ),
    _lesson(
        "repertoire-2", "Découper un morceau pour mieux l’apprendre", "Travailler un morceau",
        "repertoire", "RÉPERTOIRE", 3, 10, "▤", "mint",
        "Transforme un morceau en petites étapes de travail claires et répétables.",
        "Mettre en place une routine de travail par petites sections.", ["repertoire-1", "piano-4"],
        [
            ("Choisir une petite unité", "Travaille une mesure ou une courte phrase à la fois. Repère le passage difficile et isole-le, plutôt que de recommencer tout le morceau depuis le début."),
            ("Séparer puis réunir", "Apprends chaque main seule, puis réunis-les à une vitesse où tu peux rester détendu. Le métronome aide à stabiliser le tempo, pas à te presser."),
            ("Répéter avec une intention", "À chaque reprise, choisis une chose à écouter : le rythme, le doigté, la nuance ou la régularité. Termine par une exécution lente et attentive."),
        ],
        "Une méthode de travail qui avance", "rhythm",
        ["Isole une phrase courte.", "Travaille les mains séparément.", "Réunis-les au tempo confortable."],
        "Pour apprendre un morceau, choisis une phrase courte. Travaille d’abord la main droite, puis la gauche. Quand chacune est à l’aise, réunis-les lentement. Le métronome sert à garder un tempo stable, pas à accélérer trop tôt. À chaque reprise, écoute un détail précis. De petites séances attentives font avancer un morceau entier.",
        "Une phrase, trois attentions", "Joue le motif trois fois : écoute d’abord les notes, puis le rythme, puis la régularité du geste.",
        ["Do", "Ré", "Mi", "Sol", "Fa", "Mi", "Ré", "Do"], 48,
    ),
    _lesson(
        "history-3", "Le piano romantique : virtuosité et expression", "L’époque romantique",
        "histoire", "HISTOIRE", 4, 10, "⌛", "peach",
        "Découvre comment le piano du dix-neuvième siècle élargit la palette expressive.",
        "Relier les évolutions du piano aux nouveaux gestes du romantisme.", ["history-2", "evaluation-1"],
        [
            ("Pourquoi le piano du XIXe siècle devient plus puissant", "Les salles de concert s’agrandissent et les pianistes veulent davantage de projection, de graves et d’aigus. Les facteurs renforcent progressivement le cadre, augmentent la tension supportée par l’instrument et modifient les cordes, les marteaux et l’action. Le changement ne vient pas d’une seule pièce : la caisse, le cadre, la table d’harmonie et la mécanique doivent travailler ensemble. Cette évolution donne un son plus ample et une palette plus large, mais change aussi la résistance et le poids du clavier."),
            ("Chopin et Liszt : des écritures liées au nouvel instrument", "Chopin explore le chant au clavier, les danses, les nocturnes et des harmonies qui colorent la mélodie. Liszt développe une virtuosité spectaculaire et contribue à faire du récital de piano seul un événement public. Ils ne représentent pas tout le romantisme : leurs choix montrent cependant deux manières d’utiliser un clavier plus sonore et plus étendu, l’une centrée sur la ligne chantante, l’autre sur l’énergie et les contrastes. Dans les deux cas, la difficulté technique doit rendre l’idée musicale plus claire."),
            ("Quand la technique sert l’expression", "Une grande nuance ne consiste pas à jouer chaque note plus fort. La phrase a une direction : elle peut monter vers un sommet, s’assouplir, puis retomber. Le rubato permet de modeler localement le temps, mais la pulsation reste un repère partagé avec l’auditeur. Les arpèges, les octaves ou les grands sauts impressionnent seulement s’ils conduisent l’oreille vers un point important. Essaie d’abord une phrase simple avec deux nuances ; la structure doit rester compréhensible même sans virtuosité."),
        ],
        "Du piano de salon au piano de concert", "history",
        ["Les cadres, cordes et actions évoluent pour soutenir plus de projection.", "Chopin et Liszt explorent des possibilités différentes du clavier.", "Nuance et virtuosité servent la direction de la phrase."],
        "Au dix-neuvième siècle, le piano devient plus puissant et gagne de nouvelles possibilités. Chopin fait chanter ses mélodies ; Liszt explore une virtuosité spectaculaire. Le son romantique aime les contrastes et les nuances. Derrière les passages brillants, cherche toujours la phrase musicale. La technique prend son sens lorsqu’elle transmet une émotion.",
        "Un motif expressif", "Joue la même phrase avec deux nuances différentes. Laisse la mélodie guider le geste.",
        ["Do", "Mi", "Sol", "La", "Sol", "Mi", "Ré", "Do"], 48,
        block_images={0: [INSTRUMENT_IMAGES["broadwood"]]},
        takeaways=[
            "La puissance du piano vient de changements coordonnés dans le cadre, les cordes, la caisse et l’action.",
            "Chopin et Liszt exploitent des facettes différentes d’un clavier plus sonore et plus étendu.",
            "Une prouesse technique ne devient musicale que si elle fait entendre la direction de la phrase.",
        ],
    ),
    _lesson(
        "styles-3", "Le style romantique : chanter, nuancer, respirer", "Le style romantique",
        "styles", "STYLES", 4, 11, "♫", "peach",
        "Fais respirer une mélodie et module son intensité sans perdre la pulsation.",
        "Interpréter une phrase avec nuances et liberté maîtrisée.", ["history-3", "piano-4"],
        [
            ("Une mélodie qui chante", "Imagine une voix qui respire. Donne une direction à la phrase et évite de jouer chaque note avec la même intensité."),
            ("Le rubato, une liberté mesurée", "Le rubato assouplit localement le tempo pour exprimer une phrase. La pulsation n’est pas abandonnée : elle reste le fil auquel le musicien revient."),
            ("La pédale avec écoute", "La pédale forte prolonge les sons et les relie. Change-la avec l’harmonie pour éviter que les accords se mélangent ; si tu n’as pas de pédale, imagine la résonance et laisse les doigts relier les notes."),
        ],
        "Faire chanter une mélodie", "hands",
        ["Donne une direction à la phrase.", "Assouplis le tempo sans le perdre.", "Écoute la résonance de la pédale."],
        "Pour jouer une phrase romantique, imagine une voix qui chante. Fais grandir la mélodie, puis laisse-la retomber. Le rubato donne une liberté mesurée : le tempo respire, mais la pulsation reste présente. La pédale prolonge les sons ; change-la avec l’harmonie pour garder un son clair. Écoute avant de chercher l’effet.",
        "Une mélodie qui respire", "Joue le motif avec une nuance douce, puis donne plus d’élan à la note la plus haute.",
        ["Do", "Ré", "Mi", "Sol", "La", "Sol", "Mi", "Do"], 46,
    ),
    _lesson(
        "theory-4", "Les accords qui racontent une direction", "Toniques et cadences",
        "theorie", "THÉORIE", 4, 12, "✧", "butter",
        "Comprends la tension et le repos dans une progression harmonique simple.",
        "Entendre la tonique, la dominante et une cadence en Do majeur.", ["theory-2", "theory-3"],
        [
            ("La tonique comme maison", "L’accord construit sur le premier degré, Do majeur en Do, donne une impression de stabilité. On l’appelle tonique et on peut l’entendre comme un point d’arrivée."),
            ("La dominante crée une attente", "L’accord construit sur le cinquième degré, Sol majeur en Do, contient une tension qui appelle souvent un retour vers Do. Cette attraction rend la progression lisible."),
            ("Une cadence familière", "Joue Do majeur, puis Sol majeur, puis Do majeur. Écoute la question portée par la dominante et le repos du retour à la tonique."),
        ],
        "Tension et repos dans les accords", "chord",
        ["Do majeur donne un point d’appui.", "Sol majeur crée une attente.", "Le retour à Do apaise la phrase."],
        "Une harmonie peut donner une direction à la musique. En Do majeur, l’accord de Do est un point de repos : la tonique. L’accord de Sol crée souvent une attente : la dominante. Écoute Do, puis Sol, puis Do. La dernière harmonie donne l’impression de rentrer à la maison. Chante cette progression avant de la jouer.",
        "La cadence Do–Sol–Do", "Joue les notes de l’accord une par une dans l’ordre, en marquant une courte pause avant le retour à Do.",
        ["Do", "Mi", "Sol", "Sol", "Si", "Ré", "Do", "Mi", "Sol"], 46,
    ),
    _lesson(
        "styles-4", "Blues et jazz : swing, motifs et écoute", "Blues et jazz",
        "styles", "STYLES", 5, 12, "♫", "mint",
        "Repère le balancement du swing et l’appel-réponse dans un blues au piano.",
        "Jouer un motif de blues simple en gardant une pulsation stable.", ["history-3", "theory-2", "piano-5"],
        [
            ("Le blues, une forme et un langage", "Le blues est né de traditions afro-américaines. Son histoire est liée à des formes d’expression et de création majeures ; le piano en devient un instrument central."),
            ("Le swing se ressent", "Dans le swing, les subdivisions ne sont pas toutes égales comme des croches droites. Écoute le balancement avant de chercher à le compter ; la pulsation principale reste stable."),
            ("Question, réponse, couleur", "Un motif court peut être joué puis répété avec une petite variation. Les notes bleues ajoutent une couleur expressive ; écoute leur tension avant de la résoudre."),
        ],
        "Un motif de blues au piano", "rhythm",
        ["Écoute l’histoire du blues.", "Sens le balancement du swing.", "Réponds au motif par une variation."],
        "Le blues porte une histoire profonde de création afro-américaine. Au piano, écoute la pulsation et le balancement du swing. Un motif peut poser une question ; une variation lui répond. Certaines notes donnent une couleur tendue avant de revenir vers un son plus stable. Cherche d’abord le rythme et l’écoute, sans imiter une nuance que tu ne ressens pas encore.",
        "Question et réponse blues", "Joue le premier motif, puis réponds en changeant sa dernière note. Garde le battement régulier.",
        ["Do", "Ré♯", "Fa", "Sol", "La♯", "Sol", "Fa", "Ré♯"], 54,
    ),
    _lesson(
        "history-4", "Le piano au vingtième siècle et aujourd’hui", "Le piano moderne",
        "histoire", "HISTOIRE", 5, 10, "⌛", "lavender",
        "Explore les chemins modernes du piano, du classique au jazz et aux musiques actuelles.",
        "Identifier plusieurs traditions pianistiques des vingtième et vingt-et-unième siècles.", ["history-3", "styles-4"],
        [
            ("De nouvelles couleurs sans une seule école", "Au début du XXe siècle, Debussy et Ravel explorent notamment des accords, des registres et des résonances qui brouillent parfois la frontière entre accompagnement et couleur. Plus tard, les compositeurs utilisent aussi des rythmes irréguliers, des modes de jeu étendus ou des préparations de cordes. Il ne faut pas réduire toute la musique moderne à l’impressionnisme : ces exemples montrent plutôt que le piano peut devenir une source de timbres et de textures, pas seulement un instrument qui joue une mélodie avec des accords."),
            ("Des traditions différentes, pas un seul « style moderne »", "Le ragtime, le jazz et le gospel ont des histoires propres, marquées par la créativité des communautés afro-américaines ; la musique de film, la chanson et les musiques populaires ont aussi leurs pratiques et leurs langages. Le piano peut y porter une pulsation, un accompagnement, une improvisation ou une mélodie, mais son rôle change selon les musiciens et le contexte. Écouter sans confondre ces traditions, c’est repérer leur rythme, leur phrasé et leur histoire avant de chercher à les imiter."),
            ("Acoustique, électrique ou numérique ?", "Dans le piano acoustique, un marteau frappe des cordes et la table d’harmonie amplifie leur vibration. Un piano électrique électromécanique transforme la vibration d’éléments métalliques en signal électrique capté par des micros. Un piano numérique déclenche un son enregistré ou modélisé à partir de capteurs et peut reproduire le toucher au moyen d’un clavier lesté. Ces instruments ne produisent pas le son de la même façon, même si leurs claviers peuvent se ressembler. À l’écoute, compare l’attaque, la résonance et la façon dont le son s’éteint."),
        ],
        "Le piano, plusieurs histoires et plusieurs sons", "history",
        ["Le piano peut devenir une source de timbres autant qu’un instrument mélodique.", "Ragtime, jazz, gospel et chanson ont des histoires distinctes.", "Acoustique, électromécanique et numérique ne produisent pas le son de la même manière."],
        "Au vingtième siècle, le piano explore de nouvelles harmonies et de nouveaux rythmes. On l’entend dans le jazz, le ragtime, le gospel, la musique de film et la chanson. Le piano numérique et les claviers électroniques élargissent encore les possibilités. Chaque style a sa propre histoire. Écoute les sons avec curiosité, sans réduire une tradition à un seul cliché.",
        "Explorer trois couleurs", "Joue le motif de façon régulière, puis change son rythme ou son intensité pour inventer une autre couleur.",
        ["Do", "Mi", "Sol", "La", "Sol", "Mi", "Do"], 52,
        takeaways=[
            "Les compositeurs ont aussi utilisé le piano pour ses timbres, ses registres et ses résonances.",
            "Chaque tradition pianistique a son histoire, son rôle instrumental et ses pratiques.",
            "Acoustique, électromécanique et numérique sont trois familles de production sonore différentes.",
        ],
    ),
    _lesson(
        "history-5", "Comment un piano est fabriqué, de la caisse aux derniers réglages", "Dans l’atelier du piano",
        "histoire", "HISTOIRE", 5, 14, "⌛", "butter",
        "Suis la fabrication d’un piano acoustique moderne, du choix des matériaux à l’accord final.",
        "Décrire les étapes qui transforment le bois, les cordes et la mécanique en instrument jouable.",
        ["history-4"],
        [
            (
                "Dessiner la caisse et préparer la table d’harmonie",
                "La fabrication commence par des choix de conception : forme, dimensions, longueur des cordes, résistance du cadre et équilibre recherché entre les registres. Pour un piano à queue moderne, la ceinture courbe peut être formée en collant plusieurs plis de bois puis en les pressant dans un moule ; la méthode varie selon les facteurs et les modèles. La table d’harmonie est faite de planches soigneusement assemblées et séchées. Des barres de renfort, les nervures, la rigidifient ; les chevalets transmettent aux planches l’énergie des cordes. Le bois ne sert donc pas seulement à faire une belle caisse : sa forme et sa souplesse participent au son.",
            ),
            (
                "Installer le cadre et tendre les cordes",
                "Un cadre métallique rigide porte la forte tension des cordes et maintient leur géométrie. Les cordes ne sont pas toutes identiques : dans le grave, un fil de cuivre peut entourer l’âme de la corde pour augmenter sa masse sans l’allonger démesurément ; dans l’aigu, les cordes sont plus fines. Le chevalet appuie sur la table d’harmonie, qui met alors en mouvement une plus grande surface d’air. À titre d’ordre de grandeur, Yamaha indique qu’un piano peut réunir près de 230 cordes sous une tension totale voisine de 20 tonnes ; les valeurs exactes dépendent du modèle. La structure doit supporter cette force pendant des années.",
            ),
            (
                "Fabriquer le clavier et régler la mécanique",
                "Chaque touche est un levier ; elle commande une mécanique composée de pièces articulées, de pivots, de ressorts, de feutres et d’un marteau. Quand la touche descend, le marteau frappe la corde puis s’en échappe, pendant que l’étouffoir se soulève. Le feutre du marteau amortit l’impact et contribue à la couleur du son. Les pièces doivent bouger sans coincer ni ballotter : un jeu trop serré ralentit la touche, un jeu trop lâche rend le geste irrégulier. Les facteurs règlent la hauteur, la course et la répétition de chacune des 88 touches pour que le pianiste puisse contrôler l’attaque.",
            ),
            (
                "Assembler, accorder, harmoniser et vérifier",
                "Une fois clavier et mécanique installés, on ajuste les étouffoirs, les pédales et la course des touches, puis on accorde chaque corde. Le réglage mécanique — la régulation — rend le mouvement fiable ; l’harmonisation ajuste le contact et la souplesse des feutres pour équilibrer la couleur d’une note à l’autre. Ce sont deux opérations différentes : accorder règle la hauteur des sons, harmoniser travaille leur timbre. L’instrument est essayé, corrigé, laissé au repos dans des conditions adaptées, puis contrôlé de nouveau. La fabrication ne se termine donc pas quand la caisse est assemblée : elle s’achève quand les 88 touches, les cordes et les résonances forment un ensemble cohérent.",
            ),
        ],
        "Du bois au premier accord", "history-build",
        [
            "La caisse porte la structure ; la table d’harmonie transforme la vibration en son.",
            "Le cadre soutient la tension ; cordes et chevalets transmettent l’énergie.",
            "Chaque touche pilote un marteau, un échappement et un étouffoir réglés avec précision.",
            "Accorder règle la hauteur ; harmoniser équilibre le timbre ; réguler règle le geste.",
        ],
        "Comment un piano est-il fabriqué ? D’abord, les artisans conçoivent sa caisse et assemblent sa table d’harmonie. Ensuite, le cadre reçoit les cordes et porte leur tension. Puis chaque touche est reliée à une mécanique et à un marteau. Enfin, les étouffoirs, les pédales, la hauteur des touches, l’accord et le timbre sont réglés. Ces étapes varient selon les modèles et les facteurs, mais elles montrent pourquoi un piano est à la fois un instrument à cordes, à percussion et une caisse de résonance.",
        "Suivre l’énergie d’une note", "Observe une touche, imagine le marteau qui frappe la corde, puis fredonne le son qui se prolonge et s’arrête.",
        ["Do", "Mi", "Sol", "Mi", "Do"], 50,
        takeaways=[
            "La table d’harmonie et les chevalets transmettent les vibrations ; la caisse n’est pas qu’un décor.",
            "Le cadre supporte la tension des cordes et la mécanique transmet le mouvement des touches.",
            "Accorder règle la hauteur, réguler le geste et harmoniser la couleur du son.",
        ],
    ),
    _lesson(
        "styles-5", "Accompagner une chanson au piano", "Pop et chanson",
        "styles", "STYLES", 5, 11, "♫", "peach",
        "Construis un accompagnement simple en accords et garde le chant au premier plan.",
        "Accompagner une mélodie avec une pulsation régulière et des accords.", ["theory-4", "piano-5"],
        [
            ("La grille d’accords", "Une grille indique la suite des accords plutôt que chaque note de la mélodie. Commence par identifier la tonalité et les accords qui reviennent."),
            ("Un motif adapté au morceau", "La main gauche peut jouer une basse, des accords plaqués ou des arpèges. Choisis un motif simple qui laisse de la place à la mélodie et à la voix."),
            ("Écouter l’ensemble", "Accompagner, c’est soutenir sans dominer. Garde une pulsation stable, change d’accord au bon moment et ajuste le volume si quelqu’un chante ou joue avec toi."),
        ],
        "Construire un accompagnement de chanson", "chord",
        ["Lis les accords de la grille.", "Choisis basse, accord ou arpège.", "Soutiens le chant sans le couvrir."],
        "Dans une chanson, le piano accompagne la mélodie et la voix. Une grille d’accords t’indique les harmonies à jouer. Commence par une basse simple, puis essaie les accords ou un arpège. Garde le rythme régulier et joue moins fort que le chant. L’accompagnement laisse de l’espace aux autres musiciens.",
        "Un accompagnement régulier", "Joue les notes de l’accord une à une comme un arpège, en gardant la même pulsation.",
        ["Do", "Sol", "Mi", "Sol", "Fa", "Do", "La", "Do"], 52,
    ),
    _lesson(
        "technique-3", "La pédale forte et la résonance", "Pédale et résonance",
        "technique", "TECHNIQUE", 5, 9, "✋", "lavender",
        "Comprends le rôle de la pédale de sustain et découvre comment éviter un son brouillé.",
        "Utiliser la pédale forte avec une écoute harmonique attentive.", ["piano-6", "theory-2"],
        [
            ("Ce que fait la pédale forte", "Sur un piano acoustique, la pédale de droite relève les étouffoirs : les cordes continuent de résonner après le relâchement des touches. Sur un clavier numérique, l’effet dépend du réglage."),
            ("Changer avec l’harmonie", "Si la pédale reste enfoncée pendant plusieurs accords, les sons peuvent se mélanger. Relève-la au changement d’accord, puis appuie de nouveau pour laisser résonner la nouvelle harmonie."),
            ("Écouter avant de pédaler", "Joue d’abord la progression sans pédale. Ajoute-la ensuite avec parcimonie et compare la clarté. Si tu n’as pas de pédale, écoute la différence entre notes tenues et notes relâchées."),
        ],
        "La pédale prolonge les sons", "chord",
        ["La pédale laisse résonner les cordes.", "Change-la avec l’harmonie.", "Écoute si le son reste clair."],
        "La pédale forte prolonge les sons et relie les harmonies. Sur un piano acoustique, elle relève les étouffoirs. Si tu la gardes trop longtemps, les accords se mélangent. Relève-la au changement d’harmonie, puis appuie de nouveau. Joue d’abord sans pédale : entendre la différence t’aidera à choisir quand l’utiliser.",
        "Écouter le changement d’accord", "Joue Do majeur, relâche les touches, puis joue Sol majeur. Imagine la pédale qui change entre les deux accords.",
        ["Do", "Mi", "Sol", "Sol", "Si", "Ré"], 46,
    ),
    _lesson(
        "improvisation-1", "Improviser une mélodie avec cinq notes", "Premiers pas d’improvisation",
        "improvisation", "IMPROVISATION", 5, 12, "✦", "mint",
        "Crée un court motif et transforme-le par le rythme, le silence ou la direction.",
        "Improviser une phrase simple avec une collection limitée de notes.", ["styles-4", "theory-4", "ear-2"],
        [
            ("Limiter pour inventer", "Choisis cinq notes voisines. Une collection restreinte aide à écouter les relations et à développer une idée sans chercher la note parfaite."),
            ("Créer une question et une réponse", "Joue un petit motif, fais une pause, puis réponds en changeant le rythme ou la dernière note. Le silence fait partie de la phrase."),
            ("Écouter et transformer", "Répète ton idée en la déplaçant, en la raccourcissant ou en la faisant descendre. L’improvisation se construit par l’écoute et la variation."),
        ],
        "Improviser avec un petit vocabulaire", "keyboard",
        ["Choisis cinq notes.", "Laisse un silence entre deux idées.", "Transforme le motif pour répondre."],
        "Pour improviser, tu n’as pas besoin d’utiliser toutes les notes. Choisis-en cinq et invente un motif court. Laisse un silence, puis réponds en changeant son rythme ou sa dernière note. Écoute ce que tu viens de jouer avant d’ajouter une idée. Répéter et transformer un motif donne une forme à l’improvisation.",
        "Question et réponse", "Joue la phrase, marque un silence, puis réponds avec le même motif en changeant la dernière note.",
        ["Do", "Ré", "Mi", "Sol", "Mi", "Ré", "Do"], 50,
    ),
    _lesson(
        "repertoire-3", "Interpréter une pièce avec intention", "Phrasé et interprétation",
        "repertoire", "RÉPERTOIRE", 5, 12, "▤", "butter",
        "Passe de notes correctes à une phrase qui respire, nuance et s’adresse à l’auditeur.",
        "Construire une interprétation cohérente à partir de la partition.", ["repertoire-2", "styles-3", "piano-6"],
        [
            ("Comprendre la phrase", "Repère son point de départ, son sommet et sa résolution. Les notes ne sont pas une suite uniforme : elles forment une idée musicale."),
            ("Choisir une nuance", "Décide où la phrase prend de l’élan et où elle s’apaise. Les indications de la partition guident ton choix ; ton écoute affine le geste."),
            ("Jouer pour quelqu’un", "Avant de commencer, imagine le caractère que tu veux partager. Enregistre-toi si possible et écoute une seule chose à améliorer lors de la prochaine reprise."),
        ],
        "Donner une direction à la musique", "staff",
        ["Repère le sommet de la phrase.", "Choisis une nuance cohérente.", "Écoute-toi avec bienveillance."],
        "Une pièce prend vie quand tu comprends sa phrase. Repère son sommet et la note où elle se repose. Choisis ensuite une nuance qui aide l’auditeur à suivre cette direction. Joue une fois, puis écoute sans te juger. Pour la reprise, choisis un seul détail à améliorer. L’interprétation se construit par des décisions attentives.",
        "Une phrase racontée", "Joue le motif en faisant grandir doucement le son vers la note la plus haute, puis en le laissant retomber.",
        ["Do", "Ré", "Mi", "Sol", "La", "Sol", "Mi", "Do"], 48,
    ),
    _lesson(
        "composition-1", "Composer une courte forme A–B–A", "Composer une petite pièce",
        "improvisation", "CRÉATION", 6, 14, "✧", "lavender",
        "Assemble un motif, un contraste et un retour pour créer une mini-composition.",
        "Composer une forme courte en réutilisant et transformant un motif.", ["improvisation-1", "theory-4"],
        [
            ("La partie A : une idée reconnaissable", "Invente un motif de quelques notes et choisis un rythme. Répète-le pour que l’auditeur puisse le reconnaître."),
            ("La partie B : un contraste", "Change la direction, le registre ou le rythme. Garde un lien avec le motif initial pour que le contraste reste cohérent."),
            ("Le retour : A transformé", "Reviens au motif A. Tu peux modifier sa dernière note ou sa nuance. Note tes idées, puis joue les trois parties sans t’arrêter."),
        ],
        "Construire une forme musicale", "scale",
        ["A présente un motif.", "B apporte un contraste.", "A revient avec une petite variation."],
        "Compose une mini-pièce en trois parties. Dans la partie A, présente un motif facile à reconnaître. La partie B crée un contraste en changeant le rythme ou la direction. Enfin, fais revenir A avec une petite variation. Note tes idées et écoute si les trois parties forment un tout. Tu viens de donner une forme à ta musique.",
        "Ta forme A–B–A", "Joue un motif, invente une réponse contrastée, puis reviens au premier motif en changeant une note.",
        ["Do", "Mi", "Sol", "La", "Sol", "Fa", "Ré", "Do", "Mi", "Sol", "Mi", "Do"], 48,
    ),
    _lesson(
        "ensemble-1", "Jouer avec quelqu’un : écouter et accompagner", "Jouer à plusieurs",
        "ensemble", "ENSEMBLE", 6, 12, "♬", "mint",
        "Prépare un accompagnement simple qui s’adapte à un autre musicien ou à une voix.",
        "Garder son rôle et sa pulsation en jouant avec un partenaire.", ["repertoire-3", "composition-1"],
        [
            ("Écouter avant de jouer", "Repère le tempo, le départ et les respirations de ton partenaire. Le jeu d’ensemble commence par l’écoute, pas par le volume."),
            ("Tenir un rôle clair", "Choisis une partie simple et régulière. Si l’autre musicien accélère ou ralentit, reste attentif et retrouve ensemble la pulsation."),
            ("Communiquer en musique", "Regarde les départs, respire aux fins de phrase et ajuste ton intensité. Un accompagnement réussi soutient l’autre sans prendre toute la place."),
        ],
        "Écouter pour jouer ensemble", "hands",
        ["Écoute le tempo de l’autre.", "Garde un rôle simple et stable.", "Respire ensemble aux fins de phrase."],
        "Pour jouer avec une autre personne, commence par l’écouter. Repère le tempo et les respirations. Choisis un accompagnement simple que tu peux garder régulièrement. Regarde les départs, respire à la fin des phrases et ajuste ton volume. Le but n’est pas d’aller plus vite : c’est de construire une musique commune.",
        "Un accompagnement stable", "Joue le motif à tempo lent comme soutien à une mélodie imaginée. Laisse de l’espace entre les phrases.",
        ["Do", "Sol", "Mi", "Sol", "Do", "Sol", "Mi", "Sol"], 48,
    ),
    _lesson(
        "evaluation-3", "Bilan final : relier toutes tes compétences", "Bilan du cursus",
        "evaluation", "ÉVALUATION", 6, 15, "✷", "butter",
        "Fais le point sur le clavier, les styles, l’histoire, l’écoute et la création.",
        "Mobiliser tes connaissances et tes gestes dans une évaluation intégrée.",
        ["ensemble-1", "history-4", "styles-5", "technique-3", "theory-4"],
        [
            ("Un bilan, pas un jugement", "Ce bilan vérifie ce que tu peux expliquer et relier. Il ne résume ni ta créativité ni ta valeur comme musicien ou musicienne."),
            ("Relier les matières", "Une idée musicale peut réunir l’histoire d’un style, une lecture, une harmonie, un geste technique et une écoute attentive."),
            ("Choisir la suite", "Après tes réponses, reviens aux notions qui demandent encore du travail. La progression musicale continue grâce à une pratique régulière et curieuse."),
        ],
        "Relier les connaissances au jeu", "hands",
        ["Relie histoire et styles.", "Écoute puis explique tes choix.", "La musique continue après le bilan."],
        "Tu arrives au bilan du cursus. Tu as étudié la lecture, les styles, l’histoire du piano, l’harmonie, la technique et la création. Prends le temps de réfléchir à chaque question. Un bilan montre les acquis et les points à revoir ; il ne mesure pas ta créativité. Après tes réponses, choisis la prochaine musique que tu aimerais découvrir.",
        "Échauffement avant le bilan", "Joue ce motif lentement, respire, puis passe aux questions quand tu te sens prêt.",
        ["Do", "Ré", "Mi", "Sol", "La", "Sol", "Mi", "Do"], 48,
        [
            {"prompt": "Quel changement distingue le pianoforte du clavecin ?", "choices": ["Les cordes sont frappées par des marteaux", "Il n’a pas de clavier", "Il fonctionne avec des tuyaux d’orgue", "Il ne produit qu’un seul son"], "answer": "Les cordes sont frappées par des marteaux"},
            {"prompt": "Dans une fugue baroque, que fait souvent le thème ?", "choices": ["Il passe d’une voix à l’autre", "Il disparaît après la première mesure", "Il est toujours joué en accords forts", "Il ne change jamais de registre"], "answer": "Il passe d’une voix à l’autre"},
            {"prompt": "Que désigne le rubato dans une interprétation ?", "choices": ["Une liberté expressive mesurée du tempo", "Une pédale toujours enfoncée", "Un rythme sans pulsation", "Une suite d’accords uniquement majeurs"], "answer": "Une liberté expressive mesurée du tempo"},
            {"prompt": "Quel accord crée souvent une attente avant un retour à Do majeur ?", "choices": ["Sol majeur, la dominante", "Do majeur, la tonique", "Fa mineur", "Un silence sans mesure"], "answer": "Sol majeur, la dominante"},
            {"prompt": "Quelle pratique aide à apprendre un passage difficile ?", "choices": ["L’isoler, travailler lentement, puis le replacer", "Rejouer très vite le morceau entier", "Ignorer les doigtés", "Taper plus fort à chaque essai"], "answer": "L’isoler, travailler lentement, puis le replacer"},
            {"prompt": "Comment construire une forme A–B–A ?", "choices": ["Présenter une idée, créer un contraste, puis faire revenir l’idée", "Jouer trois fois la même note", "Accélérer sans changer de motif", "Commencer par la fin et s’arrêter"], "answer": "Présenter une idée, créer un contraste, puis faire revenir l’idée"},
        ],
    ),
]


def build_lessons() -> list[dict[str, Any]]:
    legacy_data = json.loads((ROOT / "backend" / "legacy-curriculum.json").read_text(encoding="utf-8"))
    legacy = {lesson["id"]: lesson for lesson in legacy_data["lessons"]}
    section_timings_path = ROOT / "public" / "media" / "section-timings.json"
    section_timings = (
        json.loads(section_timings_path.read_text(encoding="utf-8"))
        if section_timings_path.is_file()
        else {}
    )

    legacy["evaluation-1"]["requires"] = [
        "piano-3", "ear-1", "history-2", "styles-1", "technique-1", "repertoire-1",
    ]
    legacy["evaluation-2"]["requires"] = [
        "piano-6", "theory-3", "ear-2", "history-3", "styles-3",
        "technique-2", "repertoire-2", "theory-4",
    ]
    lessons = {**legacy, **{lesson["id"]: lesson for lesson in EXTRA_LESSONS}}
    if len(lessons) != len(CURRICULUM_ORDER) or set(lessons) != set(CURRICULUM_ORDER):
        raise ValueError("The curriculum order must contain every lesson exactly once.")

    seen: set[str] = set()
    result = []
    for sequence, lesson_id in enumerate(CURRICULUM_ORDER, start=1):
        lesson = lessons[lesson_id]
        missing = [required for required in lesson.get("requires", []) if required not in seen]
        if missing:
            raise ValueError(f"{lesson_id} has prerequisites that are not earlier in the path: {missing}")
        lesson = dict(lesson)
        lesson["sequence"] = sequence
        lesson["video"] = dict(lesson["video"])
        lesson["video"]["url"] = f"/media/{lesson_id}.mp4"
        lesson["video"].pop("audioUrl", None)
        lesson["video"].pop("sceneTimings", None)
        result.append(lesson)
        seen.add(lesson_id)

    for index, lesson in enumerate(result):
        next_lesson = result[index + 1] if index + 1 < len(result) else None
        sections = _build_video_sections(lesson, next_lesson)
        script = " ".join(section["narration"] for section in sections)
        lesson["video"]["sections"] = sections
        lesson["video"]["scenes"] = [section["title"] for section in sections]
        lesson["video"]["script"] = script
        timing = section_timings.get(lesson["id"], {})
        script_hash = hashlib.sha256(script.encode("utf-8")).hexdigest()
        if (
            timing.get("scriptHash") == script_hash
            and len(timing.get("sections", [])) == len(sections)
        ):
            lesson["video"]["sectionTimings"] = timing["sections"]
        else:
            lesson["video"].pop("sectionTimings", None)
    return result
