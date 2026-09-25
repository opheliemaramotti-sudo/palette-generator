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


/* ---------- État de l'application ---------- */
// Tout ce qu'il faut savoir pour redessiner la page.
var etat = {
  moodPrincipal: null,   // le mood qui domine la palette
  moodAccent: null       // le second mood, qui influence l'accent (ou null)
};


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
  // (Étapes suivantes : générer et afficher la palette ici.)
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
