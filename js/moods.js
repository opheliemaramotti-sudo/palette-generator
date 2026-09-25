/* =========================================================
   moods.js — le dictionnaire des moods + la recherche
   ---------------------------------------------------------
   Chaque mood est une "fiche de réglages" qui décrit COMMENT
   fabriquer sa palette (le calcul lui-même est dans palette.js).

   Les réglages d'un mood :
   - nom          : nom affiché
   - mots         : synonymes FR / EN (accents et majuscules sans importance,
                    le nom du mood est ajouté automatiquement)
   - teinte       : [min, max] plage de teinte de la couleur dominante (0-360°).
                    Le max peut dépasser 360 pour « traverser » le rouge :
                    [350, 365] = de 350° à 5°.
   - saturation   : [min, max] saturation des 3 tons moyens (0-100 %)
   - luminosite   : [min, max] luminosité des 3 tons moyens (0-100 %)
   - harmonie     : place des tons secondaire et tertiaire sur le cercle
                    "analogue" | "complementaire" | "complementaire-divisee" | "triadique"
   - accent       : les 2 accents. "decalage" = écart de teinte par rapport
                    à la dominante (180 = pile à l'opposé)
   - sombres      : les 2 sombres teintés (decalage 0 = teintés par la dominante)
   - clairs       : les 2 clairs teintés
   - composition  : disposition des masses dans le dégradé (utilisé dans gradient.js)
                    "vignette" (sombres sur les bords) | "coin" (sombres dans un coin)
                    "diagonale" | "horizon" (sombre en bas, clair en haut)
                    "halo" (grande poche lumineuse)

   Toutes les valeurs sont modifiables : c'est ici qu'on "affine" un mood.
   ========================================================= */

var Moods = (function () {

  var LISTE = [

    /* ================= Moods de départ (références Pinterest) ================= */

    {
      nom: "Mystérieux",
      mots: ["mystère", "mysterious", "mystery", "énigmatique", "enigmatic", "secret", "occulte", "occult", "sombre", "dark", "étrange", "strange", "bizarre", "weird", "peur", "fear"],
      teinte: [290, 330], saturation: [25, 45], luminosite: [22, 40],
      harmonie: "complementaire",
      accent:  { decalage: 200, saturation: [30, 45], luminosite: [75, 86] },
      sombres: { decalage: 0,   saturation: [30, 55], luminosite: [5, 13] },
      clairs:  { decalage: 0,   saturation: [10, 25], luminosite: [78, 88] },
      composition: "vignette"
    },
    {
      nom: "Dramatique",
      mots: ["drame", "drama", "dramatic", "intense", "théâtral", "theatrical", "orageux", "stormy", "tempête", "storm"],
      teinte: [185, 195], saturation: [35, 55], luminosite: [18, 50],
      harmonie: "complementaire",
      accent:  { decalage: 175, saturation: [60, 72], luminosite: [30, 38] },
      sombres: { decalage: 0,   saturation: [45, 60], luminosite: [6, 12] },
      clairs:  { decalage: 0,   saturation: [35, 50], luminosite: [70, 82] },
      composition: "coin"
    },
    {
      nom: "Nostalgique",
      mots: ["nostalgie", "nostalgic", "nostalgia", "souvenir", "souvenirs", "memories", "memory", "passé"],
      teinte: [10, 25], saturation: [8, 20], luminosite: [45, 75],
      harmonie: "analogue",
      accent:  { decalage: 20,  saturation: [10, 20], luminosite: [55, 65] },   // quasi pas d'accent
      sombres: { decalage: 195, saturation: [20, 30], luminosite: [14, 20] },   // ancré par un bleu nuit
      clairs:  { decalage: 0,   saturation: [18, 30], luminosite: [82, 90] },
      composition: "horizon"
    },
    {
      nom: "Serein",
      mots: ["sereine", "sérénité", "serene", "serenity", "calme", "calm", "tranquille", "tranquil", "paisible", "peaceful", "quiet"],
      teinte: [165, 200], saturation: [15, 35], luminosite: [55, 75],
      harmonie: "analogue",
      accent:  { decalage: 130, saturation: [15, 25], luminosite: [50, 62] },   // mauve poudré
      sombres: { decalage: -15, saturation: [5, 12],  luminosite: [18, 22] },   // gris-vert
      clairs:  { decalage: 0,   saturation: [30, 50], luminosite: [78, 86] },
      composition: "halo"
    },
    {
      nom: "Onirique",
      mots: ["rêve", "rêveur", "rêveuse", "dream", "dreamy", "dreamlike", "songe", "éthéré", "ethereal", "féerique"],
      teinte: [250, 290], saturation: [25, 45], luminosite: [55, 75],
      harmonie: "analogue",
      accent:  { decalage: -130, saturation: [75, 85], luminosite: [58, 68] },  // menthe lumineuse
      sombres: { decalage: -100, saturation: [25, 35], luminosite: [8, 24] },   // vert très sombre
      clairs:  { decalage: -40,  saturation: [70, 100], luminosite: [88, 93] }, // lavande claire
      composition: "halo"
    },
    {
      nom: "Énergique",
      mots: ["énergie", "energetic", "energy", "acide", "acid", "dynamique", "dynamic", "vif", "tonique"],
      teinte: [270, 290], saturation: [15, 30], luminosite: [25, 45],          // violet grisé
      harmonie: "complementaire",
      accent:  { decalage: 165, saturation: [85, 100], luminosite: [50, 60] },  // vert-jaune acide
      sombres: { decalage: 0,   saturation: [20, 35], luminosite: [8, 15] },
      clairs:  { decalage: 165, saturation: [40, 60], luminosite: [85, 90] },
      composition: "diagonale"
    },
    {
      nom: "Audacieux",
      mots: ["audace", "audacieuse", "bold", "pop", "daring", "vibrant", "flashy", "osé"],
      teinte: [265, 280], saturation: [45, 70], luminosite: [30, 45],          // indigo
      harmonie: "triadique",
      accent:  { decalage: 110, saturation: [90, 100], luminosite: [48, 55] },  // orange vif
      sombres: { decalage: 0,   saturation: [70, 100], luminosite: [8, 14] },
      clairs:  { decalage: 150, saturation: [90, 100], luminosite: [84, 90] },  // jaune pâle
      composition: "diagonale"
    },
    {
      nom: "Chaleureux",
      mots: ["chaleureuse", "cosy", "cozy", "accueillant", "lumineux", "lumineuse", "lumière", "bright", "luminous", "hygge"],
      teinte: [270, 285], saturation: [45, 65], luminosite: [55, 75],          // glycine
      harmonie: "analogue",
      accent:  { decalage: 135, saturation: [95, 100], luminosite: [65, 72] },  // jaune soleil
      sombres: { decalage: 0,   saturation: [55, 70], luminosite: [8, 12] },
      clairs:  { decalage: 0,   saturation: [50, 70], luminosite: [86, 92] },
      composition: "halo"
    },

    /* ================= Émotions ================= */

    {
      nom: "Joyeux",
      mots: ["joyeuse", "joie", "joy", "joyful", "happy", "heureux", "heureuse", "bonheur", "gai", "gaieté", "cheerful", "fun"],
      teinte: [35, 50], saturation: [70, 90], luminosite: [55, 70],
      harmonie: "triadique",
      accent:  { decalage: 150, saturation: [60, 80], luminosite: [50, 60] },   // turquoise
      sombres: { decalage: 0,   saturation: [40, 60], luminosite: [14, 22] },
      clairs:  { decalage: 0,   saturation: [80, 100], luminosite: [88, 93] },
      composition: "halo"
    },
    {
      nom: "Triste",
      mots: ["tristesse", "sad", "sadness", "chagrin", "cafard", "gloomy", "morose", "pluie", "rain", "rainy", "pluvieux"],
      teinte: [205, 225], saturation: [8, 20], luminosite: [35, 60],
      harmonie: "analogue",
      accent:  { decalage: 15, saturation: [10, 18], luminosite: [55, 65] },
      sombres: { decalage: 0,  saturation: [15, 25], luminosite: [10, 18] },
      clairs:  { decalage: 0,  saturation: [8, 15],  luminosite: [78, 88] },
      composition: "horizon"
    },
    {
      nom: "Mélancolique",
      mots: ["mélancolie", "melancholy", "melancholic", "spleen", "pensif", "pensive", "wistful"],
      teinte: [210, 230], saturation: [15, 30], luminosite: [30, 55],          // bleu-gris ardoise
      harmonie: "analogue",
      accent:  { decalage: 125, saturation: [20, 30], luminosite: [60, 70] },   // vieux rose
      sombres: { decalage: 0,   saturation: [20, 35], luminosite: [8, 16] },
      clairs:  { decalage: 130, saturation: [10, 20], luminosite: [82, 90] },
      composition: "coin"
    },
    {
      nom: "Romantique",
      mots: ["romantic", "romance", "amour", "amoureux", "amoureuse", "love", "lovely", "tendresse", "valentin", "valentine"],
      teinte: [340, 355], saturation: [25, 45], luminosite: [60, 78],          // rose poudré
      harmonie: "analogue",
      accent:  { decalage: 110, saturation: [15, 25], luminosite: [70, 80] },   // sauge pâle
      sombres: { decalage: 5,   saturation: [45, 60], luminosite: [16, 24] },   // bordeaux
      clairs:  { decalage: 0,   saturation: [40, 60], luminosite: [88, 93] },
      composition: "halo"
    },
    {
      nom: "Doux",
      mots: ["douce", "douceur", "soft", "gentle", "tendre", "délicat", "délicate", "cotonneux", "suave"],
      teinte: [20, 35], saturation: [25, 45], luminosite: [75, 88],            // pêche pâle
      harmonie: "analogue",
      accent:  { decalage: 245, saturation: [25, 40], luminosite: [78, 86] },   // lilas pâle
      sombres: { decalage: 0,   saturation: [10, 20], luminosite: [28, 35] },   // taupe chaud
      clairs:  { decalage: 0,   saturation: [40, 60], luminosite: [90, 94] },
      composition: "halo"
    },
    {
      nom: "Apaisant",
      mots: ["apaisé", "apaisée", "apaisement", "soothing", "relaxant", "relaxing", "relax", "zen", "détente", "sauge", "sage", "bien-être", "wellness", "spa"],
      teinte: [90, 110], saturation: [10, 25], luminosite: [50, 72],           // vert sauge
      harmonie: "analogue",
      accent:  { decalage: -80, saturation: [30, 45], luminosite: [65, 75] },   // terre cuite pâle
      sombres: { decalage: -20, saturation: [15, 25], luminosite: [16, 24] },   // olive
      clairs:  { decalage: -60, saturation: [15, 30], luminosite: [86, 92] },
      composition: "horizon"
    },
    {
      nom: "Borderline",
      mots: ["limite", "instable", "unstable", "chaos", "chaotique", "chaotic", "tension", "nerveux", "nerveuse", "anxieux", "anxieuse", "anxious"],
      teinte: [350, 365], saturation: [70, 90], luminosite: [40, 52],          // rouge vif qui "grince"
      harmonie: "complementaire",
      accent:  { decalage: 175, saturation: [60, 80], luminosite: [45, 55] },   // teal en conflit
      sombres: { decalage: 220, saturation: [30, 45], luminosite: [6, 11] },    // noir bleuté
      clairs:  { decalage: 200, saturation: [8, 15],  luminosite: [88, 93] },   // blanc froid
      composition: "diagonale"
    },
    {
      nom: "Angélique",
      mots: ["ange", "angel", "angelic", "céleste", "celestial", "divin", "divine", "paradis", "heaven", "heavenly", "auréole", "halo", "pur", "pure"],
      teinte: [40, 50], saturation: [50, 70], luminosite: [75, 85],            // crème doré
      harmonie: "analogue",
      accent:  { decalage: 170, saturation: [50, 70], luminosite: [80, 88] },   // bleu ciel pâle
      sombres: { decalage: 0,   saturation: [20, 35], luminosite: [30, 38] },
      clairs:  { decalage: 0,   saturation: [60, 80], luminosite: [92, 95] },
      composition: "halo"
    },
    {
      nom: "Démoniaque",
      mots: ["démon", "demon", "demonic", "diable", "diabolique", "devil", "evil", "maudit", "cursed", "enfer", "hell", "infernal", "sang", "blood", "colère", "angry", "anger", "rage", "fureur", "furieux"],
      teinte: [355, 370], saturation: [75, 95], luminosite: [30, 42],          // rouge sang
      harmonie: "analogue",
      accent:  { decalage: 25, saturation: [90, 100], luminosite: [50, 56] },   // braise
      sombres: { decalage: 0,  saturation: [50, 70],  luminosite: [4, 8] },
      clairs:  { decalage: 20, saturation: [40, 60],  luminosite: [70, 78] },   // pas de vraie lumière
      composition: "vignette"
    },
    {
      nom: "Mignon",
      mots: ["mignonne", "cute", "kawaii", "adorable", "chou", "sweet"],
      teinte: [330, 350], saturation: [60, 80], luminosite: [75, 85],          // rose bonbon
      harmonie: "triadique",
      accent:  { decalage: 150, saturation: [45, 60], luminosite: [75, 82] },   // menthe
      sombres: { decalage: 0,   saturation: [20, 35], luminosite: [25, 32] },
      clairs:  { decalage: 60,  saturation: [80, 100], luminosite: [88, 93] },  // jaune beurre
      composition: "halo"
    },

    /* ================= Lumière, saisons, températures ================= */

    {
      nom: "Solaire",
      mots: ["soleil", "sun", "sunny", "solar", "ensoleillé", "sunshine", "doré", "golden"],
      teinte: [38, 52], saturation: [80, 100], luminosite: [50, 65],
      harmonie: "analogue",
      accent:  { decalage: -40, saturation: [80, 95], luminosite: [50, 58] },   // rouge-orangé
      sombres: { decalage: -30, saturation: [50, 70], luminosite: [12, 20] },
      clairs:  { decalage: 0,   saturation: [85, 100], luminosite: [86, 92] },
      composition: "halo"
    },
    {
      nom: "Lunaire",
      mots: ["lune", "moon", "lunar", "moonlight", "clair de lune", "nuit", "night", "nocturne", "nocturnal"],
      teinte: [220, 240], saturation: [10, 25], luminosite: [40, 70],
      harmonie: "analogue",
      accent:  { decalage: 180, saturation: [40, 60], luminosite: [78, 86] },   // or pâle
      sombres: { decalage: 0,   saturation: [35, 55], luminosite: [6, 12] },
      clairs:  { decalage: 0,   saturation: [10, 20], luminosite: [86, 93] },
      composition: "halo"
    },
    {
      nom: "Matinal",
      mots: ["matin", "morning", "aube", "dawn", "aurore", "sunrise", "lever de soleil", "réveil"],
      teinte: [25, 40], saturation: [50, 70], luminosite: [70, 82],            // pêche de l'aube
      harmonie: "complementaire",
      accent:  { decalage: 175, saturation: [45, 65], luminosite: [70, 80] },   // bleu ciel
      sombres: { decalage: 190, saturation: [25, 40], luminosite: [18, 25] },
      clairs:  { decalage: 0,   saturation: [70, 90], luminosite: [90, 94] },
      composition: "horizon"
    },
    {
      nom: "Automnal",
      mots: ["automne", "autumn", "autumnal", "fall", "feuilles", "leaves", "rouille", "rust", "cannelle"],
      teinte: [15, 30], saturation: [45, 65], luminosite: [30, 50],            // rouille
      harmonie: "analogue",
      accent:  { decalage: 50, saturation: [45, 60], luminosite: [35, 48] },    // olive / moutarde
      sombres: { decalage: 0,  saturation: [40, 55], luminosite: [10, 16] },
      clairs:  { decalage: 20, saturation: [40, 60], luminosite: [80, 88] },
      composition: "coin"
    },
    {
      nom: "Estival",
      mots: ["été", "summer", "summery", "vacances", "holiday", "plage", "beach", "sable"],
      teinte: [180, 195], saturation: [60, 80], luminosite: [45, 60],          // turquoise
      harmonie: "complementaire",
      accent:  { decalage: 180, saturation: [80, 95], luminosite: [62, 70] },   // corail
      sombres: { decalage: 0,   saturation: [50, 70], luminosite: [12, 20] },
      clairs:  { decalage: 225, saturation: [60, 80], luminosite: [84, 90] },   // sable
      composition: "halo"
    },
    {
      nom: "Printanier",
      mots: ["printemps", "spring", "springtime", "floral", "fleuri", "fleurs", "flowers", "bourgeon", "bloom", "frais", "fraîche", "fresh"],
      teinte: [80, 100], saturation: [40, 60], luminosite: [60, 75],           // vert tendre
      harmonie: "triadique",
      accent:  { decalage: 250, saturation: [60, 80], luminosite: [80, 88] },   // fleur de cerisier
      sombres: { decalage: 0,   saturation: [30, 45], luminosite: [14, 22] },
      clairs:  { decalage: -30, saturation: [70, 90], luminosite: [88, 93] },   // jaune pâle
      composition: "halo"
    },
    {
      nom: "Hivernal",
      mots: ["hiver", "winter", "wintry", "neige", "snow", "noël", "christmas", "flocon", "givre", "frost"],
      teinte: [200, 215], saturation: [20, 40], luminosite: [60, 80],
      harmonie: "analogue",
      accent:  { decalage: -60, saturation: [30, 45], luminosite: [25, 35] },   // vert sapin
      sombres: { decalage: -60, saturation: [30, 45], luminosite: [8, 14] },
      clairs:  { decalage: 0,   saturation: [20, 35], luminosite: [90, 95] },
      composition: "horizon"
    },
    {
      nom: "Froid",
      mots: ["froide", "cold", "cool", "frisson", "chilly"],
      teinte: [195, 220], saturation: [20, 40], luminosite: [40, 70],
      harmonie: "analogue",
      accent:  { decalage: 60, saturation: [25, 40], luminosite: [60, 70] },    // violet froid
      sombres: { decalage: 0,  saturation: [30, 45], luminosite: [8, 14] },
      clairs:  { decalage: 0,  saturation: [20, 35], luminosite: [88, 93] },
      composition: "vignette"
    },
    {
      nom: "Chaud",
      mots: ["chaude", "chaleur", "warm", "hot", "brûlant", "braise", "feu", "fire", "fiery", "ardent", "passion", "passionné"],
      teinte: [5, 25], saturation: [60, 85], luminosite: [40, 55],
      harmonie: "analogue",
      accent:  { decalage: 30,  saturation: [85, 100], luminosite: [55, 62] },  // ambre
      sombres: { decalage: -10, saturation: [50, 70], luminosite: [10, 16] },
      clairs:  { decalage: 25,  saturation: [70, 90], luminosite: [84, 90] },
      composition: "halo"
    },
    {
      nom: "Glacier",
      mots: ["glace", "ice", "icy", "glacial", "gelé", "frozen", "polaire", "polar", "banquise", "arctique", "arctic", "iceberg"],
      teinte: [185, 200], saturation: [40, 60], luminosite: [70, 85],          // bleu glace
      harmonie: "analogue",
      accent:  { decalage: 30, saturation: [55, 75], luminosite: [40, 50] },    // bleu profond
      sombres: { decalage: 25, saturation: [45, 60], luminosite: [10, 16] },
      clairs:  { decalage: 0,  saturation: [50, 75], luminosite: [91, 95] },
      composition: "horizon"
    },

    /* ================= Nature et lieux ================= */

    {
      nom: "Océanique",
      mots: ["océan", "ocean", "oceanic", "mer", "sea", "marin", "marine", "vague", "vagues", "waves", "abysse", "abysses"],
      teinte: [195, 215], saturation: [45, 70], luminosite: [25, 55],
      harmonie: "analogue",
      accent:  { decalage: 180, saturation: [60, 75], luminosite: [70, 78] },   // corail pâle
      sombres: { decalage: 0,   saturation: [60, 80], luminosite: [7, 14] },
      clairs:  { decalage: -20, saturation: [40, 60], luminosite: [82, 90] },
      composition: "horizon"
    },
    {
      nom: "Montagneux",
      mots: ["montagne", "montagnes", "mountain", "mountains", "alpin", "alpine", "alpes", "sommet", "peak", "randonnée", "hiking", "rocheux", "roche"],
      teinte: [150, 170], saturation: [15, 30], luminosite: [25, 45],          // vert sapin grisé
      harmonie: "analogue",
      accent:  { decalage: 60, saturation: [35, 50], luminosite: [65, 75] },    // ciel d'altitude
      sombres: { decalage: 0,  saturation: [20, 35], luminosite: [8, 14] },
      clairs:  { decalage: 60, saturation: [10, 20], luminosite: [88, 93] },    // neige
      composition: "horizon"
    },
    {
      nom: "Sauvage",
      mots: ["wild", "nature", "jungle", "forêt", "forest", "savage", "brut", "primitif", "feral"],
      teinte: [100, 130], saturation: [35, 55], luminosite: [20, 40],          // vert forêt
      harmonie: "complementaire-divisee",
      accent:  { decalage: -90, saturation: [60, 80], luminosite: [40, 50] },   // ocre rouille
      sombres: { decalage: 0,   saturation: [35, 50], luminosite: [7, 13] },
      clairs:  { decalage: -70, saturation: [30, 45], luminosite: [78, 86] },
      composition: "coin"
    },
    {
      nom: "City core",
      mots: ["city", "ville", "urbain", "urbaine", "urban", "métropole", "béton", "concrete", "rue", "street"],
      teinte: [215, 235], saturation: [15, 30], luminosite: [25, 45],          // bleu-gris de la nuit
      harmonie: "complementaire",
      accent:  { decalage: 180, saturation: [85, 100], luminosite: [55, 62] },  // orange lampadaire
      sombres: { decalage: 0,   saturation: [20, 35], luminosite: [7, 12] },
      clairs:  { decalage: 0,   saturation: [5, 12],  luminosite: [80, 88] },   // béton clair
      composition: "coin"
    },
    {
      nom: "Astro",
      mots: ["astral", "astrologie", "astrology", "cosmos", "cosmique", "cosmic", "espace", "space", "galaxie", "galaxy", "étoile", "étoiles", "star", "stars", "nébuleuse", "nebula", "zodiaque", "zodiac", "univers"],
      teinte: [250, 270], saturation: [50, 70], luminosite: [20, 35],          // indigo spatial
      harmonie: "analogue",
      accent:  { decalage: 60,  saturation: [60, 80], luminosite: [60, 70] },   // rose nébuleuse
      sombres: { decalage: 0,   saturation: [60, 80], luminosite: [4, 9] },
      clairs:  { decalage: 150, saturation: [60, 80], luminosite: [82, 88] },   // or d'étoile
      composition: "vignette"
    },

    /* ================= Élégance et atmosphères ================= */

    {
      nom: "Luxueux",
      mots: ["luxe", "luxury", "luxurious", "chic", "élégant", "élégante", "elegant", "élégance", "précieux", "riche", "rich", "opulent", "glamour", "glam", "gold"],
      teinte: [155, 170], saturation: [40, 60], luminosite: [18, 32],          // émeraude profond
      harmonie: "complementaire",
      accent:  { decalage: -120, saturation: [45, 65], luminosite: [55, 65] },  // or champagne
      sombres: { decalage: 0,    saturation: [45, 65], luminosite: [5, 10] },
      clairs:  { decalage: -120, saturation: [30, 50], luminosite: [85, 90] },  // crème
      composition: "vignette"
    },
    {
      nom: "Gothique",
      mots: ["goth", "gothic", "vampire", "vampirique", "noir", "noire", "black"],
      teinte: [345, 360], saturation: [40, 60], luminosite: [15, 28],          // bordeaux sang noir
      harmonie: "complementaire",
      accent:  { decalage: 170, saturation: [15, 25], luminosite: [55, 65] },   // vert-de-gris
      sombres: { decalage: 0,   saturation: [30, 45], luminosite: [5, 9] },
      clairs:  { decalage: 200, saturation: [5, 12],  luminosite: [78, 86] },   // argent pâle
      composition: "vignette"
    },
    {
      nom: "Futuriste",
      mots: ["futur", "future", "futuristic", "cyber", "cyberpunk", "néon", "neon", "techno", "tech", "science-fiction", "sci-fi", "scifi", "électrique", "electric", "digital", "numérique"],
      teinte: [195, 225], saturation: [80, 100], luminosite: [45, 58],         // bleu électrique
      harmonie: "complementaire-divisee",
      accent:  { decalage: 100,  saturation: [90, 100], luminosite: [55, 62] }, // magenta néon
      sombres: { decalage: 20,   saturation: [50, 70], luminosite: [6, 11] },
      clairs:  { decalage: -120, saturation: [80, 95], luminosite: [80, 86] },  // chartreuse
      composition: "diagonale"
    },
    {
      nom: "Dark academia",
      mots: ["academia", "bibliothèque", "library", "université", "university", "oxford", "érudit", "tweed", "vieux livres"],
      teinte: [25, 35], saturation: [25, 40], luminosite: [20, 35],            // brun cuir
      harmonie: "analogue",
      accent:  { decalage: -35, saturation: [40, 55], luminosite: [25, 32] },   // bordeaux
      sombres: { decalage: 110, saturation: [25, 40], luminosite: [8, 13] },    // vert bouteille
      clairs:  { decalage: 10,  saturation: [30, 45], luminosite: [78, 85] },   // parchemin
      composition: "vignette"
    },
    {
      nom: "Dark nautical",
      mots: ["nautique", "nautical", "pirate", "pirates", "navire", "ship", "capitaine", "naufrage", "shipwreck"],
      teinte: [210, 225], saturation: [45, 65], luminosite: [18, 30],          // marine
      harmonie: "complementaire",
      accent:  { decalage: 180, saturation: [45, 60], luminosite: [45, 55] },   // laiton
      sombres: { decalage: 0,   saturation: [50, 70], luminosite: [5, 9] },
      clairs:  { decalage: 180, saturation: [20, 35], luminosite: [78, 85] },   // parchemin
      composition: "vignette"
    },
    {
      nom: "Vintage",
      mots: ["ancien", "ancienne", "antique", "old", "sépia", "sepia", "patine", "brocante", "old school", "oldschool", "époque"],
      teinte: [30, 40], saturation: [20, 35], luminosite: [45, 62],            // sépia
      harmonie: "complementaire",
      accent:  { decalage: 150, saturation: [20, 30], luminosite: [45, 55] },   // teal poussiéreux
      sombres: { decalage: 0,   saturation: [25, 35], luminosite: [14, 20] },
      clairs:  { decalage: 5,   saturation: [35, 50], luminosite: [82, 88] },
      composition: "vignette"
    },
    {
      nom: "Rétro",
      mots: ["retro", "seventies", "70s", "années 70", "disco", "groovy", "funky"],
      teinte: [25, 40], saturation: [55, 75], luminosite: [45, 58],            // orange / moutarde 70s
      harmonie: "analogue",
      accent:  { decalage: 155, saturation: [40, 55], luminosite: [35, 45] },   // teal
      sombres: { decalage: 0,   saturation: [40, 55], luminosite: [14, 20] },
      clairs:  { decalage: 15,  saturation: [50, 70], luminosite: [82, 88] },
      composition: "horizon"
    },
    {
      nom: "Citypop",
      mots: ["city pop", "80s", "années 80", "eighties", "synthwave", "retrowave", "vaporwave", "outrun", "miami"],
      teinte: [320, 340], saturation: [55, 75], luminosite: [55, 68],          // magenta coucher de soleil
      harmonie: "complementaire-divisee",
      accent:  { decalage: 190, saturation: [55, 75], luminosite: [50, 60] },   // teal
      sombres: { decalage: -90, saturation: [45, 60], luminosite: [12, 18] },   // bleu nuit
      clairs:  { decalage: 45,  saturation: [70, 90], luminosite: [82, 88] },   // pêche
      composition: "horizon"
    },
    {
      nom: "Pastel",
      mots: ["pastels", "candy", "bonbon", "bonbons", "sucre", "sugar", "dragée"],
      teinte: [170, 190], saturation: [45, 65], luminosite: [78, 86],          // menthe-bleu
      harmonie: "triadique",
      accent:  { decalage: 160, saturation: [60, 80], luminosite: [82, 88] },   // rose
      sombres: { decalage: 0,   saturation: [15, 25], luminosite: [32, 40] },
      clairs:  { decalage: 240, saturation: [70, 90], luminosite: [90, 94] },   // beurre
      composition: "halo"
    },

    /* ================= Esthétiques "core" et sous-cultures ================= */

    {
      nom: "Cottagecore",
      mots: ["cottage", "campagne", "countryside", "champêtre", "rustic", "rustique", "ferme", "farm", "jardin", "garden", "prairie", "meadow"],
      teinte: [85, 105], saturation: [20, 35], luminosite: [55, 70],           // sauge
      harmonie: "complementaire",
      accent:  { decalage: 250, saturation: [30, 45], luminosite: [72, 80] },   // rose poussiéreux
      sombres: { decalage: -65, saturation: [30, 45], luminosite: [18, 25] },   // brun bois
      clairs:  { decalage: -45, saturation: [40, 60], luminosite: [88, 93] },   // crème
      composition: "horizon"
    },
    {
      nom: "Grunge",
      mots: ["grungy", "punk", "destroy", "sale", "dirty", "délavé", "faded", "flannel"],
      teinte: [60, 80], saturation: [15, 30], luminosite: [25, 40],            // olive délavé
      harmonie: "complementaire-divisee",
      accent:  { decalage: -75, saturation: [40, 55], luminosite: [28, 36] },   // bordeaux
      sombres: { decalage: 0,   saturation: [10, 20], luminosite: [7, 12] },
      clairs:  { decalage: -20, saturation: [10, 20], luminosite: [72, 80] },   // clair "sale"
      composition: "coin"
    },
    {
      nom: "Indie",
      mots: ["indie kid", "alternatif", "alternative", "hipster", "vinyle", "vinyl", "polaroid", "tumblr"],
      teinte: [40, 55], saturation: [40, 55], luminosite: [50, 62],            // moutarde
      harmonie: "complementaire-divisee",
      accent:  { decalage: 150, saturation: [25, 40], luminosite: [55, 65] },   // bleu délavé
      sombres: { decalage: 180, saturation: [20, 35], luminosite: [16, 22] },
      clairs:  { decalage: -45, saturation: [35, 50], luminosite: [82, 88] },   // rose lavé
      composition: "diagonale"
    },
    {
      nom: "Frutiger",
      mots: ["frutiger aero", "aero", "vista", "windows vista", "bulles", "bubbles", "aqua", "glossy", "y2k"],
      teinte: [190, 205], saturation: [70, 90], luminosite: [50, 65],          // bleu ciel brillant
      harmonie: "analogue",
      accent:  { decalage: -80, saturation: [65, 85], luminosite: [48, 56] },   // vert herbe
      sombres: { decalage: 0,   saturation: [60, 80], luminosite: [16, 24] },
      clairs:  { decalage: 0,   saturation: [70, 100], luminosite: [88, 94] },
      composition: "halo"
    },
    {
      nom: "Princess",
      mots: ["princesse", "conte de fées", "fairytale", "disney", "tiara", "diadème", "perle", "pearl", "royal", "royale"],
      teinte: [325, 345], saturation: [50, 70], luminosite: [72, 84],          // rose tendre
      harmonie: "analogue",
      accent:  { decalage: 75, saturation: [55, 75], luminosite: [60, 68] },    // or
      sombres: { decalage: 0,  saturation: [25, 40], luminosite: [22, 30] },    // prune
      clairs:  { decalage: 0,  saturation: [50, 70], luminosite: [90, 94] },    // nacre
      composition: "halo"
    },
    {
      nom: "Dark princess",
      mots: ["princesse sombre", "princesse noire", "dark fairytale"],
      teinte: [330, 345], saturation: [30, 50], luminosite: [30, 45],          // vieux rose profond
      harmonie: "analogue",
      accent:  { decalage: 75,  saturation: [40, 55], luminosite: [50, 58] },   // or vieilli
      sombres: { decalage: -20, saturation: [35, 50], luminosite: [6, 11] },    // prune noire
      clairs:  { decalage: 0,   saturation: [25, 40], luminosite: [78, 86] },
      composition: "vignette"
    },
    {
      nom: "Soft goth",
      mots: ["pastel goth", "goth doux", "creepy cute", "creepycute"],
      teinte: [270, 290], saturation: [15, 30], luminosite: [35, 60],          // lavande grisée
      harmonie: "analogue",
      accent:  { decalage: 60, saturation: [25, 40], luminosite: [65, 75] },    // rose poussiéreux
      sombres: { decalage: 0,  saturation: [10, 20], luminosite: [7, 12] },
      clairs:  { decalage: 0,  saturation: [10, 20], luminosite: [82, 88] },
      composition: "vignette"
    },
    {
      nom: "Coconut girl",
      mots: ["coconut", "tropical", "tropique", "tropiques", "hawaï", "hawaii", "hibiscus", "surf", "island", "île", "îles"],
      teinte: [5, 20], saturation: [70, 85], luminosite: [60, 70],             // corail hibiscus
      harmonie: "complementaire",
      accent:  { decalage: 175, saturation: [60, 80], luminosite: [55, 65] },   // turquoise
      sombres: { decalage: 20,  saturation: [35, 50], luminosite: [20, 28] },   // peau bronzée
      clairs:  { decalage: 30,  saturation: [60, 80], luminosite: [88, 93] },   // coco
      composition: "halo"
    },
    {
      nom: "Dolette",
      mots: ["dollette", "doll", "dolly", "poupée", "porcelaine", "porcelain", "dentelle", "lace"],
      teinte: [340, 355], saturation: [40, 60], luminosite: [80, 88],          // rose porcelaine
      harmonie: "complementaire-divisee",
      accent:  { decalage: 205, saturation: [45, 60], luminosite: [80, 86] },   // bleu layette
      sombres: { decalage: 0,   saturation: [20, 30], luminosite: [28, 35] },
      clairs:  { decalage: 50,  saturation: [60, 80], luminosite: [92, 95] },   // crème
      composition: "halo"
    },
    {
      nom: "Acubi",
      mots: ["acubi club", "minimaliste", "minimalist", "minimal", "épuré", "clean", "neutre", "neutral", "gris", "grey", "gray"],
      teinte: [200, 220], saturation: [5, 15], luminosite: [45, 70],           // gris bleuté délavé
      harmonie: "analogue",
      accent:  { decalage: 170, saturation: [15, 25], luminosite: [70, 78] },   // beige
      sombres: { decalage: 0,   saturation: [5, 12],  luminosite: [12, 18] },
      clairs:  { decalage: 0,   saturation: [5, 10],  luminosite: [86, 92] },
      composition: "horizon"
    },
    {
      nom: "Scene",
      mots: ["scene kid", "scenecore", "myspace", "rawr"],
      teinte: [315, 330], saturation: [85, 100], luminosite: [50, 60],         // rose fluo
      harmonie: "triadique",
      accent:  { decalage: 130,  saturation: [85, 100], luminosite: [50, 58] }, // vert citron
      sombres: { decalage: 0,    saturation: [20, 35], luminosite: [5, 9] },
      clairs:  { decalage: -120, saturation: [80, 100], luminosite: [82, 88] }, // cyan
      composition: "diagonale"
    },
    {
      nom: "Emo",
      mots: ["emo kid", "emocore"],
      teinte: [350, 365], saturation: [55, 75], luminosite: [25, 38],          // cramoisi
      harmonie: "analogue",
      accent:  { decalage: -60, saturation: [30, 45], luminosite: [30, 40] },   // violet sombre
      sombres: { decalage: 0,   saturation: [5, 15],  luminosite: [5, 9] },
      clairs:  { decalage: 0,   saturation: [5, 10],  luminosite: [70, 80] },
      composition: "vignette"
    },
    {
      nom: "Acid pixie",
      mots: ["pixie", "fée acide", "rave", "raver", "glitter", "paillettes", "festival"],
      teinte: [285, 300], saturation: [70, 90], luminosite: [45, 58],          // violet UV
      harmonie: "triadique",
      accent:  { decalage: 165, saturation: [90, 100], luminosite: [55, 62] },  // vert acide
      sombres: { decalage: 0,   saturation: [50, 70], luminosite: [8, 14] },
      clairs:  { decalage: 40,  saturation: [80, 100], luminosite: [82, 88] },  // rose
      composition: "diagonale"
    },
    {
      nom: "Gyaru",
      mots: ["gal", "shibuya", "bronzé", "tanned", "léopard", "leopard"],
      teinte: [25, 35], saturation: [45, 65], luminosite: [45, 58],            // caramel
      harmonie: "complementaire-divisee",
      accent:  { decalage: 300, saturation: [85, 100], luminosite: [58, 66] },  // rose vif
      sombres: { decalage: 0,   saturation: [40, 55], luminosite: [14, 20] },
      clairs:  { decalage: 15,  saturation: [70, 90], luminosite: [82, 88] },   // blond
      composition: "halo"
    },
    {
      nom: "Fairy kei",
      mots: ["fairy", "fée", "fées", "licorne", "unicorn"],
      teinte: [270, 290], saturation: [55, 75], luminosite: [78, 86],          // lavande
      harmonie: "triadique",
      accent:  { decalage: -120, saturation: [50, 70], luminosite: [78, 84] },  // menthe
      sombres: { decalage: 0,    saturation: [25, 40], luminosite: [30, 38] },
      clairs:  { decalage: 65,   saturation: [70, 90], luminosite: [88, 93] },  // rose bébé
      composition: "halo"
    },
    {
      nom: "Cherry core",
      mots: ["cherry", "cerise", "cerises", "cherries"],
      teinte: [350, 358], saturation: [70, 85], luminosite: [38, 50],          // rouge cerise
      harmonie: "complementaire",
      accent:  { decalage: 125, saturation: [45, 60], luminosite: [35, 45] },   // vert queue de cerise
      sombres: { decalage: 0,   saturation: [55, 70], luminosite: [12, 18] },
      clairs:  { decalage: -10, saturation: [50, 70], luminosite: [86, 92] },
      composition: "halo"
    },
    {
      nom: "Coquette",
      mots: ["coquettecore", "nymphette", "nœud", "nœuds", "bow", "bows", "ribbon", "ruban", "rubans", "girly", "féminin", "féminine", "feminine", "rose", "pink"],
      teinte: [340, 355], saturation: [55, 75], luminosite: [80, 88],          // rose pâle
      harmonie: "analogue",
      accent:  { decalage: 15, saturation: [70, 85], luminosite: [45, 55] },    // rouge ruban
      sombres: { decalage: 0,  saturation: [25, 40], luminosite: [25, 33] },
      clairs:  { decalage: 30, saturation: [50, 70], luminosite: [92, 95] },    // crème
      composition: "halo"
    },
    {
      nom: "Dark coquette",
      mots: ["coquette sombre", "coquette noire"],
      teinte: [345, 355], saturation: [45, 60], luminosite: [25, 38],          // bordeaux
      harmonie: "analogue",
      accent:  { decalage: 5,  saturation: [40, 60], luminosite: [72, 80] },    // blush
      sombres: { decalage: 0,  saturation: [30, 45], luminosite: [5, 10] },
      clairs:  { decalage: 20, saturation: [30, 45], luminosite: [86, 91] },    // dentelle crème
      composition: "vignette"
    }
  ];


  /* ---------- Normalisation du texte ---------- */

  // "  Mélancolique & SEREIN !" → "melancolique serein"
  // - minuscules
  // - accents retirés (é → e, ç → c…) grâce à la décomposition Unicode "NFD"
  // - tout ce qui n'est ni lettre ni chiffre devient un espace
  function normaliser(texte) {
    return texte
      .toLowerCase()
      .replace(/œ/g, "oe")
      .replace(/æ/g, "ae")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")   // retire les accents détachés par NFD
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  // Forme "compacte" (sans espaces) : permet de reconnaître
  // "dark academia", "darkacademia" et "dark-academia" de la même façon.
  function compacter(texte) {
    return normaliser(texte).replace(/ /g, "");
  }


  /* ---------- Index de recherche ---------- */

  // On prépare une fois pour toutes un "annuaire" : mot compact → mood.
  // Ex : INDEX["darkacademia"] = (le mood Dark academia)
  var INDEX = {};
  var NB_MOTS_MAX = 1;   // nombre de mots du plus long synonyme ("clair de lune" = 3)

  function construireIndex() {
    LISTE.forEach(function (mood) {
      mood.id = normaliser(mood.nom).replace(/ /g, "-");   // ex : "dark-academia"
      var tousLesMots = [mood.nom].concat(mood.mots);
      tousLesMots.forEach(function (mot) {
        INDEX[compacter(mot)] = mood;
        NB_MOTS_MAX = Math.max(NB_MOTS_MAX, normaliser(mot).split(" ").length);
      });
    });
  }


  /* ---------- Distance entre deux mots (pour les fautes de frappe) ---------- */

  // Distance de Levenshtein : le nombre minimum de lettres à ajouter,
  // supprimer ou remplacer pour passer d'un mot à l'autre.
  // Ex : "serin" → "serein" = 1   |   "gotik" → "gothic" = 2
  function distance(a, b) {
    // ligne[j] = distance entre le début de a et les j premières lettres de b
    var ligne = [];
    for (var j = 0; j <= b.length; j++) ligne.push(j);

    for (var i = 1; i <= a.length; i++) {
      var precedent = ligne[0];   // valeur "en diagonale"
      ligne[0] = i;
      for (var k = 1; k <= b.length; k++) {
        var temporaire = ligne[k];
        var cout = a[i - 1] === b[k - 1] ? 0 : 1;
        ligne[k] = Math.min(
          ligne[k] + 1,          // suppression
          ligne[k - 1] + 1,      // ajout
          precedent + cout       // remplacement (ou rien si lettres identiques)
        );
        precedent = temporaire;
      }
    }
    return ligne[b.length];
  }


  /* ---------- Reconnaissance d'un mot isolé ---------- */

  // Pour un mot seul qui n'est pas pile dans l'index, on tolère :
  // 1. un mot plus long qui commence par un synonyme ("romantiques", "gothiques")
  // 2. le début d'un synonyme d'au moins 5 lettres ("melanc" → mélancolique)
  // 3. une petite faute de frappe (1 lettre, ou 2 pour les mots longs)
  function reconnaitreApproximativement(mot) {
    if (mot.length < 4) return null;
    var cles = Object.keys(INDEX);

    for (var i = 0; i < cles.length; i++) {
      var cle = cles[i];
      if (cle.length >= 5 && mot.indexOf(cle) === 0) return INDEX[cle];
      if (mot.length >= 5 && cle.indexOf(mot) === 0) return INDEX[cle];
    }

    // Fautes de frappe seulement à partir de 5 lettres : sur un mot court,
    // une lettre de différence change tout ("rage" ≠ "rave").
    if (mot.length < 5) return null;
    var tolerance = mot.length >= 8 ? 2 : 1;
    for (var j = 0; j < cles.length; j++) {
      if (distance(mot, cles[j]) <= tolerance) return INDEX[cles[j]];
    }
    return null;
  }


  /* ---------- Recherche principale ---------- */

  // Lit une phrase et renvoie la liste des moods reconnus, dans l'ordre.
  // "nostalgique et serein" → [Nostalgique, Serein]
  // Les mots inconnus ("et", "un peu"…) sont simplement ignorés.
  function trouverMoods(texte) {
    var mots = normaliser(texte).split(" ").filter(Boolean);
    var trouves = [];
    var i = 0;

    while (i < mots.length) {
      var mood = null;
      var nbMotsUtilises = 1;

      // On essaie d'abord les groupes de mots les plus longs
      // ("dark academia" avant "dark")
      for (var n = Math.min(NB_MOTS_MAX, mots.length - i); n >= 1; n--) {
        var groupe = mots.slice(i, i + n).join("");
        if (INDEX[groupe]) {
          mood = INDEX[groupe];
          nbMotsUtilises = n;
          break;
        }
      }

      // Sinon, tolérance sur le mot seul (pluriel, début de mot, faute de frappe)
      if (!mood) {
        mood = reconnaitreApproximativement(mots[i]);
      }

      if (mood && trouves.indexOf(mood) === -1) {
        trouves.push(mood);
      }
      i += nbMotsUtilises;
    }

    return trouves;
  }

  // Pour un texte inconnu : les "nombre" moods dont un synonyme
  // ressemble le plus au texte tapé.
  function suggerer(texte, nombre) {
    var mots = normaliser(texte).split(" ").filter(Boolean);
    mots.push(compacter(texte));   // la phrase entière compte aussi

    var scores = LISTE.map(function (mood) {
      var meilleur = Infinity;
      [mood.nom].concat(mood.mots).forEach(function (synonyme) {
        var cle = compacter(synonyme);
        mots.forEach(function (mot) {
          // Distance ramenée à la longueur : 2 fautes sur 12 lettres,
          // c'est plus proche que 2 fautes sur 4 lettres.
          var score = distance(mot, cle) / Math.max(mot.length, cle.length);
          meilleur = Math.min(meilleur, score);
        });
      });
      return { mood: mood, score: meilleur };
    });

    scores.sort(function (a, b) { return a.score - b.score; });
    return scores.slice(0, nombre).map(function (s) { return s.mood; });
  }

  // Retrouve un mood à partir de son identifiant (ex : "dark-academia")
  function parId(id) {
    for (var i = 0; i < LISTE.length; i++) {
      if (LISTE[i].id === id) return LISTE[i];
    }
    return null;
  }


  construireIndex();

  return {
    liste: LISTE,
    normaliser: normaliser,
    trouverMoods: trouverMoods,
    suggerer: suggerer,
    parId: parId
  };

})();
