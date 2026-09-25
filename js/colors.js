/* =========================================================
   colors.js — la "boîte à outils" couleur
   ---------------------------------------------------------
   Trois façons d'écrire une même couleur :
   - HEX : "#5B1E32"                    (pour le web et l'affichage)
   - RGB : { r: 91, g: 30, b: 50 }      (0 à 255, ce que voit l'écran)
   - HSL : { h: 340, s: 50, l: 24 }     (teinte 0-360°, saturation et
                                          luminosité 0-100 %)
   On CRÉE les palettes en HSL (c'est la façon de penser d'un designer :
   « même teinte, plus sombre, moins saturée… ») puis on convertit en HEX.

   Tout est rangé dans l'objet global "Couleurs" : dans les autres
   fichiers, on écrit par exemple Couleurs.hslVersHex(...).
   ========================================================= */

var Couleurs = (function () {

  /* ---------- Petits utilitaires ---------- */

  // Garde une valeur entre un minimum et un maximum.
  // Ex : limiter(120, 0, 100) → 100
  function limiter(valeur, min, max) {
    return Math.min(max, Math.max(min, valeur));
  }

  // Ramène une teinte dans l'intervalle 0-360 (le cercle chromatique boucle).
  // Ex : 370° → 10°   et   -30° → 330°
  function normaliserTeinte(h) {
    return ((h % 360) + 360) % 360;
  }


  /* ---------- HEX ⇄ RGB ---------- */

  // "#5B1E32" (ou "5b1e32", ou "#5B3") → { r: 91, g: 30, b: 50 }
  function hexVersRgb(hex) {
    var propre = hex.replace("#", "");
    // Format court "#5B3" → "#55BB33"
    if (propre.length === 3) {
      propre = propre[0] + propre[0] + propre[1] + propre[1] + propre[2] + propre[2];
    }
    return {
      r: parseInt(propre.slice(0, 2), 16),
      g: parseInt(propre.slice(2, 4), 16),
      b: parseInt(propre.slice(4, 6), 16)
    };
  }

  // Un nombre 0-255 → deux caractères hexadécimaux. Ex : 11 → "0B"
  function composanteVersHex(valeur) {
    var entier = Math.round(limiter(valeur, 0, 255));
    return entier.toString(16).padStart(2, "0").toUpperCase();
  }

  // { r: 91, g: 30, b: 50 } → "#5B1E32"
  function rgbVersHex(rgb) {
    return "#" + composanteVersHex(rgb.r) + composanteVersHex(rgb.g) + composanteVersHex(rgb.b);
  }


  /* ---------- RGB ⇄ HSL ---------- */

  // { r, g, b } (0-255) → { h, s, l } (0-360, 0-100, 0-100)
  function rgbVersHsl(rgb) {
    // On travaille entre 0 et 1, plus pratique pour les calculs
    var r = rgb.r / 255;
    var g = rgb.g / 255;
    var b = rgb.b / 255;

    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var ecart = max - min;

    // Luminosité : la moyenne entre la composante la plus forte et la plus faible
    var l = (max + min) / 2;

    // Gris parfait (r = g = b) : ni teinte ni saturation
    if (ecart === 0) {
      return { h: 0, s: 0, l: l * 100 };
    }

    // Saturation : à quel point la couleur s'éloigne du gris
    var s = ecart / (1 - Math.abs(2 * l - 1));

    // Teinte : dépend de la composante dominante (rouge, vert ou bleu)
    var h;
    if (max === r) {
      h = 60 * (((g - b) / ecart) % 6);
    } else if (max === g) {
      h = 60 * ((b - r) / ecart + 2);
    } else {
      h = 60 * ((r - g) / ecart + 4);
    }

    return { h: normaliserTeinte(h), s: s * 100, l: l * 100 };
  }

  // { h, s, l } → { r, g, b } (0-255)
  function hslVersRgb(hsl) {
    var h = normaliserTeinte(hsl.h);
    var s = limiter(hsl.s, 0, 100) / 100;
    var l = limiter(hsl.l, 0, 100) / 100;

    // "Chroma" : l'intensité de la couleur pure
    var chroma = (1 - Math.abs(2 * l - 1)) * s;
    // Composante intermédiaire, selon la position dans le sixième de cercle
    var x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
    // Valeur à ajouter pour atteindre la bonne luminosité
    var m = l - chroma / 2;

    // Le cercle est découpé en 6 secteurs de 60°
    var r1, g1, b1;
    if (h < 60)       { r1 = chroma; g1 = x;      b1 = 0; }
    else if (h < 120) { r1 = x;      g1 = chroma; b1 = 0; }
    else if (h < 180) { r1 = 0;      g1 = chroma; b1 = x; }
    else if (h < 240) { r1 = 0;      g1 = x;      b1 = chroma; }
    else if (h < 300) { r1 = x;      g1 = 0;      b1 = chroma; }
    else              { r1 = chroma; g1 = 0;      b1 = x; }

    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255)
    };
  }


  /* ---------- Raccourcis HEX ⇄ HSL ---------- */

  function hslVersHex(hsl) {
    return rgbVersHex(hslVersRgb(hsl));
  }

  function hexVersHsl(hex) {
    return rgbVersHsl(hexVersRgb(hex));
  }


  /* ---------- Contraste (formule WCAG 2) ---------- */

  // Luminance relative : la luminosité PERÇUE par l'œil (0 = noir, 1 = blanc).
  // L'œil est bien plus sensible au vert qu'au bleu, d'où les coefficients.
  function luminanceRelative(rgb) {
    function lineariser(composante) {
      var c = composante / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * lineariser(rgb.r) + 0.7152 * lineariser(rgb.g) + 0.0722 * lineariser(rgb.b);
  }

  // Ratio de contraste entre deux couleurs HEX : de 1 (aucun) à 21 (noir sur blanc).
  function ratioContraste(hex1, hex2) {
    var l1 = luminanceRelative(hexVersRgb(hex1));
    var l2 = luminanceRelative(hexVersRgb(hex2));
    var clair = Math.max(l1, l2);
    var sombre = Math.min(l1, l2);
    return (clair + 0.05) / (sombre + 0.05);
  }

  // Choisit le texte (noir ou blanc) le plus lisible sur un fond donné.
  // Note : ici le noir et le blanc purs sont autorisés, c'est du texte d'interface,
  // pas une couleur de la palette.
  function couleurTexte(hexFond) {
    var contrasteNoir = ratioContraste(hexFond, "#000000");
    var contrasteBlanc = ratioContraste(hexFond, "#FFFFFF");
    return contrasteNoir >= contrasteBlanc ? "#000000" : "#FFFFFF";
  }


  /* ---------- Décalage de teinte (barre HUE) ---------- */

  // Tourne la teinte d'une couleur HSL de "degres" sur le cercle chromatique.
  // Saturation et luminosité ne bougent pas : seule l'ambiance change.
  // Renvoie une NOUVELLE couleur (l'originale n'est pas modifiée).
  function decalerTeinte(hsl, degres) {
    return { h: normaliserTeinte(hsl.h + degres), s: hsl.s, l: hsl.l };
  }


  /* ---------- Ce que le fichier rend disponible ---------- */
  return {
    limiter: limiter,
    normaliserTeinte: normaliserTeinte,
    hexVersRgb: hexVersRgb,
    rgbVersHex: rgbVersHex,
    rgbVersHsl: rgbVersHsl,
    hslVersRgb: hslVersRgb,
    hslVersHex: hslVersHex,
    hexVersHsl: hexVersHsl,
    luminanceRelative: luminanceRelative,
    ratioContraste: ratioContraste,
    couleurTexte: couleurTexte,
    decalerTeinte: decalerTeinte
  };

})();
