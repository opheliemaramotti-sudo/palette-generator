/* =========================================================
   palette.js — fabrique les 9 couleurs d'un mood
   ---------------------------------------------------------
   Les 9 couleurs ont chacune un RÔLE :
   - 2 sombres teintés   (jamais de noir pur)
   - 3 tons moyens       (dominante, secondaire, tertiaire)
   - 2 accents           (souvent à l'opposé de la dominante)
   - 2 clairs teintés    (jamais de blanc pur)

   Tout est calculé en HSL à partir de la fiche du mood (moods.js),
   avec un peu d'aléatoire contrôlé : on tire des valeurs DANS les
   plages du mood, donc chaque palette est différente mais reste
   dans l'ambiance.
   ========================================================= */

var Palette = (function () {

  /* ---------- Réglages généraux ---------- */

  // Bornes de sécurité : aucune couleur ne descend sous 4 % ni ne dépasse
  // 96 % de luminosité, et les sombres / clairs gardent au moins 6 % de
  // saturation pour rester "teintés" (pas de gris neutre, pas de #000 / #FFF).
  var LUMINOSITE_MIN = 4;
  var LUMINOSITE_MAX = 96;
  var SATURATION_MIN_TEINTEE = 6;

  // Place des tons secondaire et tertiaire, en degrés autour de la dominante.
  var ECARTS_HARMONIE = {
    "analogue":               [30, -30],    // voisins sur le cercle
    "complementaire":         [25, 180],    // un voisin + l'opposé
    "complementaire-divisee": [150, 210],   // de part et d'autre de l'opposé
    "triadique":              [120, 240]    // triangle équilatéral
  };


  /* ---------- Aléatoire contrôlé ---------- */

  // Un nombre au hasard entre min et max. Ex : tirer([20, 40]) → 31.7
  function tirer(plage) {
    return plage[0] + Math.random() * (plage[1] - plage[0]);
  }

  // Une petite variation autour d'une valeur. Ex : varier(180, 5) → entre 175 et 185
  function varier(valeur, amplitude) {
    return valeur + (Math.random() * 2 - 1) * amplitude;
  }

  // Un point précis d'une plage : 0 = le minimum, 1 = le maximum, 0.5 = le milieu.
  // Ex : dansLaPlage([20, 60], 0.25) → 30
  function dansLaPlage(plage, position) {
    return plage[0] + position * (plage[1] - plage[0]);
  }


  /* ---------- Fabrication d'une couleur ---------- */

  // Assemble une couleur HSL "propre" (teinte bouclée, bornes respectées).
  function creerCouleur(role, libelle, h, s, l, estTeintee) {
    var saturationMin = estTeintee ? SATURATION_MIN_TEINTEE : 0;
    return {
      role: role,          // "sombre", "moyen", "accent" ou "clair"
      libelle: libelle,    // ex : "Dominante"
      hsl: {
        h: Couleurs.normaliserTeinte(h),
        s: Couleurs.limiter(s, saturationMin, 100),
        l: Couleurs.limiter(l, LUMINOSITE_MIN, LUMINOSITE_MAX)
      }
    };
  }


  /* ---------- Les 4 familles de couleurs ---------- */

  // 2 sombres, teintés par la dominante (ou décalés, ex : bleu nuit du Nostalgique).
  function creerSombres(mood, teinteDominante) {
    var reglage = mood.sombres;
    var teinte = teinteDominante + reglage.decalage;
    return [
      creerCouleur("sombre", "Sombre profond", varier(teinte, 4),
        tirer(reglage.saturation), varier(dansLaPlage(reglage.luminosite, 0.2), 1.5), true),
      creerCouleur("sombre", "Sombre", varier(teinte + 8, 4),
        tirer(reglage.saturation), varier(dansLaPlage(reglage.luminosite, 0.85), 1.5), true)
    ];
  }

  // 3 tons moyens placés selon l'harmonie du mood.
  function creerTonsMoyens(mood, teinteDominante) {
    var ecarts = ECARTS_HARMONIE[mood.harmonie];
    var saturation = tirer(mood.saturation);
    return [
      creerCouleur("moyen", "Dominante", teinteDominante,
        saturation, varier(dansLaPlage(mood.luminosite, 0.5), 3), false),
      creerCouleur("moyen", "Secondaire", varier(teinteDominante + ecarts[0], 6),
        saturation * 0.9, varier(dansLaPlage(mood.luminosite, 0.15), 3), false),
      // La tertiaire, souvent plus éloignée sur le cercle, est un peu adoucie
      // pour ne pas voler la vedette aux accents.
      creerCouleur("moyen", "Tertiaire", varier(teinteDominante + ecarts[1], 6),
        saturation * 0.75, varier(dansLaPlage(mood.luminosite, 0.85), 3), false)
    ];
  }

  // 2 accents. Si un second mood est donné ("nostalgique et serein"),
  // c'est sa teinte dominante qui colore l'accent.
  function creerAccents(mood, teinteDominante, moodAccent) {
    var reglage = mood.accent;
    var teinte = teinteDominante + reglage.decalage;
    var saturation = tirer(reglage.saturation);

    if (moodAccent) {
      teinte = tirer(moodAccent.teinte);
      // On mélange la saturation des deux moods : l'accent garde l'énergie
      // du second mood sans casser le calme (ou l'intensité) du premier.
      saturation = (saturation + tirer(moodAccent.saturation)) / 2;
    }

    var luminosite = tirer(reglage.luminosite);
    // Le 2e accent est une variation du 1er : teinte voisine, luminosité
    // décalée vers le milieu pour qu'on distingue bien les deux.
    var luminosite2 = luminosite > 50 ? luminosite - 14 : luminosite + 14;

    return [
      creerCouleur("accent", "Accent", varier(teinte, 4), saturation, luminosite, false),
      creerCouleur("accent", "Accent doux", varier(teinte + 18, 4), saturation * 0.8, luminosite2, false)
    ];
  }

  // 2 clairs, teintés (jamais de blanc pur).
  function creerClairs(mood, teinteDominante) {
    var reglage = mood.clairs;
    var teinte = teinteDominante + reglage.decalage;
    return [
      creerCouleur("clair", "Clair", varier(teinte, 4),
        tirer(reglage.saturation), varier(dansLaPlage(reglage.luminosite, 0.2), 1.5), true),
      creerCouleur("clair", "Très clair", varier(teinte - 8, 4),
        tirer(reglage.saturation), varier(dansLaPlage(reglage.luminosite, 0.9), 1.5), true)
    ];
  }


  /* ---------- Fonction principale ---------- */

  // Génère les 9 couleurs d'un mood.
  // - mood       : la fiche du mood principal (voir moods.js)
  // - moodAccent : un second mood qui influence l'accent, ou null
  // Renvoie un tableau de 9 couleurs, dans l'ordre d'affichage de la grille :
  // 2 sombres, 3 moyens, 2 accents, 2 clairs.
  function generer(mood, moodAccent) {
    var teinteDominante = tirer(mood.teinte);

    return []
      .concat(creerSombres(mood, teinteDominante))
      .concat(creerTonsMoyens(mood, teinteDominante))
      .concat(creerAccents(mood, teinteDominante, moodAccent))
      .concat(creerClairs(mood, teinteDominante));
  }

  return {
    generer: generer
  };

})();
