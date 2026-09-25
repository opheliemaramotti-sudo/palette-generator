/* =========================================================
   app.js — l'interface : relie la page HTML aux autres fichiers
   ---------------------------------------------------------
   Ce fichier ne calcule rien lui-même : il écoute les actions
   de l'utilisateur (taper, cliquer…) et met la page à jour.
   ========================================================= */

/* ---------- Les éléments de la page dont on a besoin ---------- */
var formulaireRecherche = document.getElementById("formulaire-recherche");
var champMood = document.getElementById("champ-mood");
var zoneMessage = document.getElementById("message");
var titrePalette = document.getElementById("titre-palette");
var grille = document.getElementById("grille");
var boutonTheme = document.getElementById("bouton-theme");


/* ---------- État de l'application ---------- */
// Tout ce qu'il faut savoir pour redessiner la page.
var etat = {
  moodPrincipal: null,   // le mood qui domine la palette
  moodAccent: null,      // le second mood, qui influence l'accent (ou null)
  paletteDeBase: []      // les 9 couleurs générées (avant tout décalage HUE)
};


/* ---------- Affichage de la palette ---------- */

// Peint les 9 cases de la grille avec les couleurs données.
function afficherPalette(couleurs) {
  var cases = grille.querySelectorAll(".case");
  couleurs.forEach(function (couleur, index) {
    var hex = Couleurs.hslVersHex(couleur.hsl);
    var caseCouleur = cases[index];
    caseCouleur.style.background = hex;
    caseCouleur.style.color = Couleurs.couleurTexte(hex);   // noir ou blanc selon le contraste
    caseCouleur.querySelector(".case__hex").textContent = hex;
    caseCouleur.title = couleur.libelle;
  });
}


/* ---------- Messages ---------- */

// Affiche un texte simple sous la barre de recherche.
function afficherMessage(texte) {
  zoneMessage.textContent = texte;
}

// Mot inconnu : message doux + 3 moods proches cliquables.
function afficherSuggestions(texteTape, suggestions) {
  zoneMessage.textContent = "Je ne connais pas encore « " + texteTape + " »… Peut-être : ";

  suggestions.forEach(function (mood, index) {
    var bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "suggestion";
    bouton.textContent = mood.nom;
    bouton.addEventListener("click", function () {
      champMood.value = mood.nom;
      choisirMoods(mood, null);
    });
    zoneMessage.appendChild(bouton);

    if (index < suggestions.length - 1) {
      zoneMessage.appendChild(document.createTextNode(" "));
    }
  });
}


/* ---------- Choix du mood ---------- */

// Enregistre le(s) mood(s) choisi(s) et met la page à jour.
function choisirMoods(principal, accent) {
  etat.moodPrincipal = principal;
  etat.moodAccent = accent;

  titrePalette.textContent = principal.nom;
  if (accent) {
    afficherMessage(principal.nom + ", avec une touche de " + accent.nom + " dans l'accent.");
  } else {
    afficherMessage("");
  }

  etat.paletteDeBase = Palette.generer(principal, accent);
  afficherPalette(etat.paletteDeBase);
}

// Lance la recherche à partir du texte tapé.
function lancerRecherche(texte) {
  if (texte.trim() === "") {
    afficherMessage("Tape une émotion ou une ambiance pour commencer.");
    return;
  }

  var moods = Moods.trouverMoods(texte);

  if (moods.length === 0) {
    afficherSuggestions(texte.trim(), Moods.suggerer(texte, 3));
    return;
  }

  // Le premier mood domine, le second (s'il existe) influence l'accent.
  choisirMoods(moods[0], moods[1] || null);
}


/* ---------- Écouteurs d'événements ---------- */

formulaireRecherche.addEventListener("submit", function (evenement) {
  evenement.preventDefault();   // empêche le rechargement de la page
  lancerRecherche(champMood.value);
});


/* ---------- Thème clair / sombre ---------- */
// Le CSS fait tout le travail : il suffit de poser data-theme="dark" ou
// "light" sur la balise <html>. Le choix est mémorisé dans le navigateur
// (localStorage) pour la prochaine visite.

var CLE_THEME = "mood-colors-theme";

// Le thème réellement affiché : le choix de l'utilisateur, sinon celui de l'ordinateur.
function themeActuel() {
  var choix = document.documentElement.getAttribute("data-theme");
  if (choix) return choix;
  var ordinateurEnSombre = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return ordinateurEnSombre ? "dark" : "light";
}

// Le bouton propose toujours l'AUTRE thème.
function mettreAJourBoutonTheme() {
  var sombre = themeActuel() === "dark";
  boutonTheme.textContent = sombre ? "Mode clair" : "Mode sombre";
  boutonTheme.setAttribute("aria-pressed", sombre ? "true" : "false");
}

function appliquerTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  mettreAJourBoutonTheme();
  try {
    localStorage.setItem(CLE_THEME, theme);
  } catch (erreur) {
    // Navigation privée ou stockage bloqué : le thème marche, il n'est juste pas retenu.
  }
}

function chargerThemeMemorise() {
  try {
    var theme = localStorage.getItem(CLE_THEME);
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch (erreur) {
    // Rien de mémorisé : on garde le réglage de l'ordinateur.
  }
  mettreAJourBoutonTheme();
}

boutonTheme.addEventListener("click", function () {
  appliquerTheme(themeActuel() === "dark" ? "light" : "dark");
});


/* ---------- Au chargement de la page ---------- */
// On démarre avec un mood d'exemple pour que la page ne soit jamais vide.
chargerThemeMemorise();
choisirMoods(Moods.parId("mysterieux"), null);
