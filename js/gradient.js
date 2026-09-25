/* =========================================================
   gradient.js — le dégradé "mesh" avec grain
   ---------------------------------------------------------
   Principe, en 3 temps, sur un <canvas> 2D :
   1. On remplit le fond avec une couleur de la palette.
   2. On pose de grandes "taches" de couleur floues (un dégradé radial
      par tache, qui passe de la couleur pleine à transparent). Elles se
      superposent et se fondent : c'est l'effet mesh.
   3. On ajoute du grain : chaque pixel est éclairci ou assombri d'une
      petite valeur au hasard.

   Pas de ctx.filter (flou) : il ne marche pas sur Safari. Le flou vient
   uniquement des dégradés radiaux.

   Les positions des taches dépendent de la "composition" du mood
   (voir moods.js) : sombres vers les bords ou un coin, clairs et
   accents en poches lumineuses.
   ========================================================= */

var Degrade = (function () {

  /* ---------- Numéros des 9 couleurs (ordre de palette.js) ---------- */
  var SOMBRE_PROFOND = 0, SOMBRE = 1;
  var DOMINANTE = 2, SECONDAIRE = 3, TERTIAIRE = 4;
  var ACCENT = 5, ACCENT_DOUX = 6;
  var CLAIR = 7, TRES_CLAIR = 8;


  /* ---------- Les compositions ---------- */
  // Pour chaque composition :
  // - fond   : la couleur qui remplit tout le cadre au départ
  // - taches : [couleur, x, y, taille], dessinées dans l'ordre (la dernière
  //            passe par-dessus). x et y vont de 0 (gauche / haut) à 1
  //            (droite / bas). La taille est une fraction de la hauteur,
  //            multipliée par TAILLE_DES_TACHES (plus grand = plus fondu).
  var COMPOSITIONS = {

    // Sombres sur les bords, lumière au centre
    vignette: {
      fond: SOMBRE,
      taches: [
        [DOMINANTE,  0.50, 0.45, 0.60],
        [SECONDAIRE, 0.15, 0.25, 0.45],
        [TERTIAIRE,  0.85, 0.70, 0.45],
        [ACCENT,     0.65, 0.35, 0.25],
        [ACCENT_DOUX,0.35, 0.68, 0.25],
        [CLAIR,      0.50, 0.50, 0.30],
        [TRES_CLAIR, 0.52, 0.44, 0.14],
        [SOMBRE_PROFOND, 0.00, 1.00, 0.45],
        [SOMBRE_PROFOND, 1.00, 0.00, 0.40],
        [SOMBRE_PROFOND, 0.00, 0.00, 0.28],
        [SOMBRE_PROFOND, 1.00, 1.00, 0.34]
      ]
    },

    // Masse sombre dans le coin bas-gauche, lumière en haut à droite
    coin: {
      fond: DOMINANTE,
      taches: [
        [SECONDAIRE, 0.80, 0.25, 0.50],
        [TERTIAIRE,  0.30, 0.40, 0.45],
        [ACCENT_DOUX,0.90, 0.60, 0.25],
        [ACCENT,     0.45, 0.55, 0.22],
        [CLAIR,      0.75, 0.22, 0.30],
        [TRES_CLAIR, 0.80, 0.15, 0.15],
        [SOMBRE,     0.10, 0.85, 0.50],
        [SOMBRE_PROFOND, 0.00, 1.00, 0.40]
      ]
    },

    // Une bande lumineuse en diagonale, sombres aux deux autres coins
    diagonale: {
      fond: DOMINANTE,
      taches: [
        [SECONDAIRE, 0.30, 0.30, 0.45],
        [TERTIAIRE,  0.75, 0.75, 0.45],
        [ACCENT,     0.78, 0.20, 0.25],
        [ACCENT_DOUX,0.22, 0.80, 0.25],
        [CLAIR,      0.25, 0.78, 0.25],
        [TRES_CLAIR, 0.50, 0.50, 0.18],
        [SOMBRE,     0.00, 0.00, 0.45],
        [SOMBRE_PROFOND, 1.00, 1.00, 0.45],
        [SOMBRE_PROFOND, 0.00, 0.00, 0.25]
      ]
    },

    // Ciel clair en haut, sol sombre en bas
    horizon: {
      fond: CLAIR,
      taches: [
        [TRES_CLAIR, 0.50, 0.10, 0.40],
        [ACCENT_DOUX,0.20, 0.30, 0.30],
        [ACCENT,     0.80, 0.35, 0.25],
        [DOMINANTE,  0.50, 0.58, 0.45],
        [SECONDAIRE, 0.15, 0.68, 0.40],
        [TERTIAIRE,  0.85, 0.72, 0.40],
        [SOMBRE,     0.50, 0.98, 0.45],
        [SOMBRE_PROFOND, 0.15, 1.05, 0.40],
        [SOMBRE_PROFOND, 0.85, 1.05, 0.40]
      ]
    },

    // Une grande poche lumineuse au centre
    halo: {
      fond: DOMINANTE,
      taches: [
        [SECONDAIRE, 0.20, 0.20, 0.45],
        [TERTIAIRE,  0.80, 0.80, 0.45],
        [SOMBRE,     0.95, 0.08, 0.35],
        [SOMBRE_PROFOND, 0.05, 0.95, 0.35],
        [ACCENT_DOUX,0.78, 0.35, 0.30],
        [ACCENT,     0.25, 0.65, 0.25],
        [CLAIR,      0.50, 0.45, 0.35],
        [TRES_CLAIR, 0.50, 0.42, 0.18]
      ]
    }
  };


  var TAILLE_DES_TACHES = 1.3;


  /* ---------- Hasard "reproductible" ---------- */
  // Un générateur de nombres pseudo-aléatoires : à partir d'une même
  // "graine", il redonne toujours la même suite de nombres (entre 0 et 1).
  // On s'en sert pour que le grain et les petits décalages de position
  // soient identiques à chaque dessin (pas de scintillement avec la barre HUE).
  function creerHasard(graine) {
    var etatInterne = graine >>> 0;
    return function () {
      etatInterne = (etatInterne + 0x6D2B79F5) >>> 0;
      var t = etatInterne;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Transforme un texte (l'identifiant du mood) en nombre, pour servir de graine.
  // Deux moods différents donnent deux nombres différents.
  function nombreDepuisTexte(texte) {
    var nombre = 2166136261;
    for (var i = 0; i < texte.length; i++) {
      nombre = Math.imul(nombre ^ texte.charCodeAt(i), 16777619);
    }
    return nombre >>> 0;
  }


  /* ---------- Dessin d'une tache floue ---------- */

  // "rgba(12, 34, 56, 0.5)" à partir d'une couleur HSL et d'une opacité
  function rgba(hsl, opacite) {
    var rgb = Couleurs.hslVersRgb(hsl);
    return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + opacite + ")";
  }

  // Un dégradé radial : couleur presque pleine au centre, transparente au bord.
  // Les étapes intermédiaires donnent un fondu doux (proche d'un flou).
  // La tache est étirée en hauteur (ETIREMENT) : des ovales se fondent de
  // façon plus organique que des ronds parfaits.
  var ETIREMENT = 1.35;

  function dessinerTache(ctx, hsl, x, y, rayon) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ETIREMENT);      // à partir d'ici, 1 unité verticale = 1,35 pixel

    var degrade = ctx.createRadialGradient(0, 0, 0, 0, 0, rayon);
    degrade.addColorStop(0,    rgba(hsl, 0.9));
    degrade.addColorStop(0.4,  rgba(hsl, 0.6));
    degrade.addColorStop(0.75, rgba(hsl, 0.18));
    degrade.addColorStop(1,    rgba(hsl, 0));
    ctx.fillStyle = degrade;
    // On couvre tout le canvas (en tenant compte du déplacement et de l'étirement)
    ctx.fillRect(-x, -y / ETIREMENT, ctx.canvas.width, ctx.canvas.height / ETIREMENT);

    ctx.restore();
  }


  /* ---------- Grain ---------- */

  // Ajoute du bruit à chaque pixel. intensite : de 0 (aucun) à 100 (fort).
  // Le même nombre est ajouté au rouge, au vert et au bleu : le grain est
  // "neutre", il ne change pas les teintes.
  function ajouterGrain(ctx, intensite) {
    if (intensite <= 0) return;
    var largeur = ctx.canvas.width;
    var hauteur = ctx.canvas.height;
    var image = ctx.getImageData(0, 0, largeur, hauteur);
    var pixels = image.data;          // [r, g, b, a, r, g, b, a, …]
    var amplitude = intensite * 0.7;  // 100 → ±35 niveaux sur 255
    var hasard = creerHasard(12345);  // toujours le même grain

    for (var i = 0; i < pixels.length; i += 4) {
      var bruit = (hasard() - 0.5) * 2 * amplitude;
      pixels[i]     += bruit;   // rouge (les valeurs sont bornées à 0-255 automatiquement)
      pixels[i + 1] += bruit;   // vert
      pixels[i + 2] += bruit;   // bleu
    }
    ctx.putImageData(image, 0, 0);
  }


  /* ---------- Position des taches ---------- */

  // Calcule où vont les taches pour un mood, en fractions du cadre (0 à 1).
  // Renvoie { fond: numéro de couleur, taches: [{ couleur, x, y, rayon }] }
  // où rayon est une fraction de la hauteur.
  // Utilisé pour le dessin ET pour l'export CSS : les deux restent identiques.
  function calculerTaches(mood) {
    var composition = COMPOSITIONS[mood.composition] || COMPOSITIONS.halo;

    // Petits décalages propres à chaque mood : deux moods qui partagent
    // une composition n'ont pas exactement le même dégradé.
    var hasard = creerHasard(nombreDepuisTexte(mood.id));

    var taches = composition.taches.map(function (tache) {
      return {
        couleur: tache[0],
        x: tache[1] + (hasard() - 0.5) * 0.12,
        y: tache[2] + (hasard() - 0.5) * 0.08,
        rayon: tache[3] * TAILLE_DES_TACHES
      };
    });
    return { fond: composition.fond, taches: taches };
  }


  /* ---------- Fonction principale ---------- */

  // Dessine le dégradé sur un canvas (à la taille du canvas).
  // - couleurs   : les 9 couleurs de la palette (avec leur hsl)
  // - mood       : la fiche du mood (pour sa composition et son identifiant)
  // - intensite  : intensité du grain, de 0 à 100
  function dessiner(canvas, couleurs, mood, intensite) {
    var ctx = canvas.getContext("2d");
    var largeur = canvas.width;
    var hauteur = canvas.height;
    var plan = calculerTaches(mood);

    // 1. Le fond
    ctx.fillStyle = rgba(couleurs[plan.fond].hsl, 1);
    ctx.fillRect(0, 0, largeur, hauteur);

    // 2. Les taches floues
    plan.taches.forEach(function (tache) {
      dessinerTache(ctx, couleurs[tache.couleur].hsl,
        tache.x * largeur, tache.y * hauteur, tache.rayon * hauteur);
    });

    // 3. Le grain
    ajouterGrain(ctx, intensite);
  }

  return {
    dessiner: dessiner,
    calculerTaches: calculerTaches,   // pour l'export CSS
    ETIREMENT: ETIREMENT              // pour l'export CSS
  };

})();
