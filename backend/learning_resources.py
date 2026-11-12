from typing import Any


CATEGORY_REFERENCES: dict[str, dict[str, list[dict[str, str]]]] = {
    "solfege": {
        "videos": [
            {
                "title": "Apprendre l’essentiel du solfège en moins de 10 minutes",
                "source": "Salut La Mi !",
                "url": "https://www.youtube.com/watch?v=Wz_Co3SVZ6Y",
                "language": "Français",
                "description": "Un rappel visuel des premiers repères de lecture musicale.",
            }
        ],
        "reading": [
            {
                "title": "Lessons — notes, portée et lecture musicale",
                "source": "musictheory.net",
                "url": "https://www.musictheory.net/lessons",
                "kind": "Cours interactif",
                "language": "Anglais",
                "description": "Des leçons courtes pour revoir la portée, les notes et les intervalles.",
            }
        ],
    },
    "piano": {
        "videos": [
            {
                "title": "Apprendre le piano — guide complet pour les débutants",
                "source": "Piano en ligne",
                "url": "https://www.youtube.com/watch?v=n7lOJNYGYvw",
                "language": "Français",
                "description": "Une démonstration complémentaire pour prendre ses premiers repères au clavier.",
            }
        ],
        "reading": [
            {
                "title": "25 Études faciles et progressives, Op. 100",
                "source": "Friedrich Burgmüller · IMSLP",
                "url": "https://imslp.org/wiki/25_%C3%89tudes_faciles_et_progressives,_Op.100_(Burgm%C3%BCller,_Friedrich)",
                "kind": "Partition",
                "language": "Notation musicale",
                "description": "Recueil de petites pièces pour prolonger le travail des premières leçons. Vérifie le statut de chaque édition dans ton pays.",
            }
        ],
    },
    "rythme": {
        "videos": [
            {
                "title": "Comprendre vraiment le rythme en musique",
                "source": "Musilasol · Camille Houdart",
                "url": "https://www.youtube.com/watch?v=1gyqNbGitAQ",
                "language": "Français",
                "description": "Une explication des divisions rythmiques, des durées et des mesures.",
            }
        ],
        "reading": [
            {
                "title": "Basics of Rhythm",
                "source": "Music Theory for the 21st-Century Classroom",
                "url": "https://musictheory.pugetsound.edu/mt21c/BasicsOfRhythm.html",
                "kind": "Cours en accès gratuit",
                "language": "Anglais",
                "description": "Un chapitre de référence sur la pulsation, les subdivisions et la notation des durées.",
            }
        ],
    },
    "theorie": {
        "videos": [
            {
                "title": "Les accords au piano : tout ce que vous devez savoir",
                "source": "Piano en ligne",
                "url": "https://www.youtube.com/watch?v=KEHkUhm8mPI",
                "language": "Français",
                "description": "Une démonstration des accords au clavier, en complément des notions du cours.",
            }
        ],
        "reading": [
            {
                "title": "Music Theory for the 21st-Century Classroom",
                "source": "Robert Hutchinson · University of Puget Sound",
                "url": "https://musictheory.pugetsound.edu/mt21c/MusicTheory.html",
                "kind": "Manuel en ligne gratuit",
                "language": "Anglais",
                "description": "Un manuel structuré qui approfondit notation, harmonie, formes et analyse.",
            },
            {
                "title": "Essentials of Music Theory: Elementary",
                "source": "Carl E. Gardner · Project Gutenberg",
                "url": "https://www.gutenberg.org/ebooks/65500",
                "kind": "Livre numérisé",
                "language": "Anglais",
                "description": "Un manuel historique gratuit pour comparer les premières notions de théorie musicale.",
            },
        ],
    },
    "ecoute": {
        "videos": [
            {
                "title": "Reconnaître les intervalles à l’oreille",
                "source": "Piano en ligne",
                "url": "https://www.youtube.com/watch?v=w6atmDkkLLU",
                "language": "Français",
                "description": "Une démonstration guidée pour associer les intervalles à leur couleur sonore.",
            }
        ],
        "reading": [
            {
                "title": "Exercises — entraînement de l’oreille",
                "source": "teoria.com",
                "url": "https://www.teoria.com/en/exercises/",
                "kind": "Exercices interactifs",
                "language": "Anglais",
                "description": "Exercices gratuits pour travailler intervalles, accords et reconnaissance auditive.",
            }
        ],
    },
    "histoire": {
        "videos": [
            {
                "title": "Cristofori, le piano et le marteau lâché",
                "source": "Le Centre de gravité",
                "url": "https://www.youtube.com/watch?v=ktG_W8j-B-4",
                "language": "Français",
                "description": "Un complément historique consacré à l’invention du pianoforte.",
            }
        ],
        "reading": [
            {
                "title": "The Structure of the Piano",
                "source": "Yamaha Musical Instrument Guide",
                "url": "https://www.yamaha.com/en/musical_instrument_guide/piano/structure/",
                "kind": "Guide illustré gratuit",
                "language": "Anglais",
                "description": "Un guide illustré sur la caisse, la table d’harmonie, le cadre, les cordes et la mécanique du piano.",
            },
            {
                "title": "How Pianos Are Made",
                "source": "Yamaha Musical Instrument Guide",
                "url": "https://www.yamaha.com/en/musical_instrument_guide/piano/manufacturing/",
                "kind": "Guide de fabrication gratuit",
                "language": "Anglais",
                "description": "Les grandes étapes de fabrication d’un piano, de la préparation des pièces à l’assemblage et aux réglages.",
            },
            {
                "title": "History of the Pianoforte and Pianoforte Players",
                "source": "Oskar Bie · Project Gutenberg",
                "url": "https://www.gutenberg.org/ebooks/71333",
                "kind": "Livre numérisé",
                "language": "Anglais",
                "description": "Un ouvrage historique à parcourir par extraits ; son regard date de son époque.",
            }
        ],
    },
    "styles": {
        "videos": [
            {
                "title": "Master Your Piano Technique for Baroque Style",
                "source": "Improstation · Szymon Jakubowski",
                "url": "https://www.youtube.com/watch?v=sf5Oiq0PXJM",
                "language": "Anglais",
                "description": "Une démonstration de gestes et d’articulation appliqués au répertoire baroque.",
            }
        ],
        "reading": [
            {
                "title": "The Art of Music, Vol. 7 — Pianoforte and Chamber Music",
                "source": "Daniel Gregory Mason et collaborateurs · Project Gutenberg",
                "url": "https://www.gutenberg.org/ebooks/72303",
                "kind": "Livre numérisé",
                "language": "Anglais",
                "description": "Un ouvrage historique sur le piano et la musique de chambre ; à lire comme une source d’époque.",
            }
        ],
    },
    "technique": {
        "videos": [
            {
                "title": "Positionnement des mains au piano : trois techniques",
                "source": "Tous Pianistes !",
                "url": "https://www.youtube.com/watch?v=cwuJb9CvUZE",
                "language": "Français",
                "description": "Une démonstration de position des mains pour compléter la pratique sans tension.",
            }
        ],
        "reading": [
            {
                "title": "25 Études faciles et progressives, Op. 100",
                "source": "Friedrich Burgmüller · IMSLP",
                "url": "https://imslp.org/wiki/25_%C3%89tudes_faciles_et_progressives,_Op.100_(Burgm%C3%BCller,_Friedrich)",
                "kind": "Partition d’étude",
                "language": "Notation musicale",
                "description": "De courtes pièces pour mettre en pratique articulation, coordination et régularité. Vérifie le statut de chaque édition dans ton pays.",
            }
        ],
    },
    "repertoire": {
        "videos": [
            {
                "title": "Apprendre à lire une partition de piano — les bases",
                "source": "Joaquim · Pianobook",
                "url": "https://www.youtube.com/watch?v=VtAk5YN-L-s",
                "language": "Français",
                "description": "Une lecture guidée d’une partition, en complément des étapes de lecture du cursus.",
            }
        ],
        "reading": [
            {
                "title": "25 Études faciles et progressives, Op. 100",
                "source": "Friedrich Burgmüller · IMSLP",
                "url": "https://imslp.org/wiki/25_%C3%89tudes_faciles_et_progressives,_Op.100_(Burgm%C3%BCller,_Friedrich)",
                "kind": "Partitions",
                "language": "Notation musicale",
                "description": "Un recueil de pièces progressives à choisir selon le niveau et les acquis. Vérifie le statut de chaque édition dans ton pays.",
            },
            {
                "title": "The Pianoforte Sonata",
                "source": "J. S. Shedlock · Project Gutenberg",
                "url": "https://www.gutenberg.org/ebooks/17074",
                "kind": "Livre numérisé",
                "language": "Anglais",
                "description": "Une lecture historique pour découvrir l’évolution de la sonate pour piano.",
            },
        ],
    },
    "improvisation": {
        "videos": [
            {
                "title": "Apprendre à composer un blues au piano",
                "source": "Improviser au piano",
                "url": "https://www.youtube.com/watch?v=qpElb6E3QsU",
                "language": "Français",
                "description": "Une démonstration pour transformer une grille de blues en matière d’improvisation.",
            }
        ],
        "reading": [
            {
                "title": "The 12-Bar Blues",
                "source": "Music Theory for the 21st-Century Classroom",
                "url": "https://musictheory.pugetsound.edu/mt21c/TwelveBarBlues.html",
                "kind": "Cours en accès gratuit",
                "language": "Anglais",
                "description": "Un chapitre consacré à la forme de douze mesures et à son vocabulaire harmonique.",
            }
        ],
    },
    "ensemble": {
        "videos": [
            {
                "title": "Comment accompagner une mélodie simple au piano",
                "source": "Musiclassroom",
                "url": "https://www.youtube.com/watch?v=j6g0MZi7Ihg",
                "language": "Français",
                "description": "Une démonstration d’accompagnement pour écouter la mélodie tout en jouant.",
            }
        ],
        "reading": [
            {
                "title": "Partitions pour piano à quatre mains",
                "source": "IMSLP",
                "url": "https://imslp.org/wiki/Category:For_piano_4_hands",
                "kind": "Partitions",
                "language": "Notation musicale",
                "description": "Un catalogue de répertoire à partager au clavier. Vérifie les droits de chaque édition dans ton pays.",
            }
        ],
    },
    "evaluation": {
        "videos": [
            {
                "title": "Comment j’apprendrais le piano si je devais repartir de zéro",
                "source": "Le Piano Grand Ouvert",
                "url": "https://www.youtube.com/watch?v=KnpqsFaOjz4",
                "language": "Français",
                "description": "Un retour d’expérience sur l’organisation d’un apprentissage progressif.",
            }
        ],
        "reading": [
            {
                "title": "Exercises — outils de pratique musicale",
                "source": "musictheory.net",
                "url": "https://www.musictheory.net/exercises",
                "kind": "Exercices interactifs",
                "language": "Anglais",
                "description": "Des exercices gratuits pour réviser les notions avant et après les bilans ClaviTempo.",
            },
            {
                "title": "How to Appreciate Music",
                "source": "Gustav Kobbé · Project Gutenberg",
                "url": "https://www.gutenberg.org/ebooks/34610",
                "kind": "Livre numérisé",
                "language": "Anglais",
                "description": "Une lecture historique sur l’écoute et l’attention musicales.",
            },
        ],
    },
}


def references_for(category_id: str) -> dict[str, list[dict[str, str]]]:
    references = CATEGORY_REFERENCES.get(category_id, {"videos": [], "reading": []})
    return {
        "videos": [dict(item) for item in references["videos"]],
        "reading": [dict(item) for item in references["reading"]],
    }


def lesson_with_references(lesson: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(lesson)
    enriched["references"] = references_for(str(lesson.get("category", "")))
    return enriched


def categories_with_references(categories: list[dict[str, str]]) -> list[dict[str, Any]]:
    return [
        {**category, "references": references_for(category["id"])}
        for category in categories
    ]
