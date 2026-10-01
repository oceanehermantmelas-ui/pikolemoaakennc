// ==========================================
// CONFIGURATION DES ÉTAPES
// ==========================================
// Modifie ici le titre, le message final et toutes les étapes.
// x / y : position du point sur la carte, en % (0% = haut/gauche, 100% = bas/droite).
// answer : une réponse, ou plusieurs dans un tableau ["loriquet", "lori quet"].
//          Majuscules, accents et espaces autour sont ignorés.
// image / video : facultatif (chemin dans /assets), ex. "assets/photo1.jpg".
// success : texte affiché après la réussite (facultatif).
// L'ordre du tableau = l'ordre du parcours (la 1re étape est débloquée au départ).

const GAME_TITLE = "PIKO le MOAKEN";
const FINAL_MESSAGE = "Tu connais maintenant le campus sur le bout des doigts !";

const checkpoints = [
  { id: 1, name: "Agora", x: "40.4%", y: "41.4%",
    question: "Mon premier est le nom du dieu du tonnerre, de la force, de la guerre et de la protection dans la mythologie nordique. Mon deuxième désigne l'acte d'ôter la vie. Mon tout est un animal marin à carapace...",
    answer: "tortue", hint: "J'aime nager dans l'océan.", success: "Premier lieu découvert !" },
  { id: 2, name: "Centre de recherche (A5)", x: "46.9%", y: "28.5%",
    question: "Mon premier est la neuvième lettre de l'alphabet. Mon deuxième est une syllabe qui signifie une deuxième fois. Mon troisième est une partie du corps juste au-dessus des genoux. Mon tout est...",
    answer: "hibiscus", hint: "Je suis une jolie fleur que tu aimes accrocher à ton oreille.", success: "Prêt pour la suite ?" },
  { id: 3, name: "Étape 3", x: "55.4%", y: "31.9%",
    question: "Mon premier est partout autour de la Nouvelle-Calédonie. On y nage, on y plonge... Mon deuxième accompagne à la perfection la salade tahitienne. Mon troisième est l'endroit où tu vas au sport, boire un petit café et tu traverses la route pour aller au bingo. Mon tout est un petit animal volant.",
    answer: "loriquet", hint: "Je suis de toutes les couleurs.", success: "" },
  { id: 4, name: "Étape 4", x: "60.6%", y: "34.8%",
    question: "Mon premier, on le dit deux fois de quelqu'un qui est sale. Mon deuxième est le son de la deuxième lettre de l'alphabet. Mon tout est un crustacé qui peut faire très mal. Je suis le...",
    answer: "crabe", hint: "Avec de l'aïoli, un délice pour les papilles.", success: "" },
  { id: 5, name: "Étape 5", x: "65.2%", y: "36.1%",
    question: "Mon premier désigne l'action de tenir quelque chose avec force. Mon deuxième est le son que l'on fait lorsqu'on souffle. Mon tout est un animal de la forêt aux bois resplendissants. Je suis le...",
    answer: "cerf", hint: "Tout le monde aime ma viande.", success: "" }
];

// ==========================================
// LOGIQUE DU JEU (pas besoin de modifier)
// ==========================================
const STORAGE_KEY = "jeu-campus-progress";
const $ = (id) => document.getElementById(id);
let progress = 0;   // nombre d'étapes réussies
let zoom = 1;

// --- Sauvegarde ---
function load() {
  try { progress = Math.min(parseInt(localStorage.getItem(STORAGE_KEY)) || 0, checkpoints.length); }
  catch (e) { progress = 0; }
}
function save() { try { localStorage.setItem(STORAGE_KEY, progress); } catch (e) {} }

// --- Utilitaires ---
const normalize = (s) => s.toString().trim().toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").replace(/^(le |la |les |l'|un |une )/, "");
const stateOf = (i) => i < progress ? "done" : i === progress ? "available" : "locked";

function toast(text) {
  const t = $("toast"); t.textContent = text; t.hidden = false;
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.hidden = true, 3500);
}
function confetti() {
  const colors = ["#e8294f", "#ffc53d", "#3ddc84", "#4da3ff", "#fff"];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement("div"); c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = 1.8 + Math.random() * 1.8 + "s";
    document.body.appendChild(c); setTimeout(() => c.remove(), 3800);
  }
}
const media = (cp) =>
  (cp.image ? `<img src="${cp.image}" alt="">` : "") +
  (cp.video ? `<video src="${cp.video}" controls></video>` : "");

// --- Affichage de la carte ---
function render(justUnlocked = -1) {
  const box = $("points"); box.innerHTML = "";
  checkpoints.forEach((cp, i) => {
    const st = stateOf(i);
    const b = document.createElement("button");
    b.className = `point ${st}` + (i === justUnlocked ? " just-unlocked" : "");
    b.style.left = cp.x; b.style.top = cp.y;
    b.innerHTML = (st === "locked" ? "🔒" : st === "available" ? "🔓" : "✅") +
                  `<span class="label">${cp.name}</span>`;
    b.setAttribute("aria-label", `${cp.name} (${st})`);
    b.onclick = () => openStep(i);
    box.appendChild(b);
  });
  $("progress-label").textContent = `PROGRESSION : ${progress} / ${checkpoints.length}`;
  $("progress-fill").style.width = (progress / checkpoints.length * 100) + "%";
}

// --- Fenêtre modale ---
function openModal(html) { $("modal-body").innerHTML = html; $("overlay").hidden = false; }
function closeModal() { $("overlay").hidden = true; }

function openStep(i) {
  const cp = checkpoints[i], st = stateOf(i);
  if (st === "locked") {
    return openModal(`<div class="lock-anim">🔒</div><h2>Étape verrouillée !</h2>
      <p>Cette étape est verrouillée ! Résous l'énigme précédente pour continuer ton aventure.</p>
      <button class="primary" onclick="closeModal()">OK</button>`);
  }
  if (st === "done") {
    return openModal(`<div class="step-num">ÉTAPE ${String(i + 1).padStart(2, "0")} ✅</div>
      <h2>${cp.name}</h2>${media(cp)}<p>${cp.success || "Étape déjà réussie."}</p>
      <p><em>Réponse : ${Array.isArray(cp.answer) ? cp.answer[0] : cp.answer}</em></p>
      <button class="primary" onclick="closeModal()">FERMER</button>`);
  }
  openModal(`<div class="step-num">ÉTAPE ${String(i + 1).padStart(2, "0")}</div>
    <h2>🧩 À toi de jouer !</h2>${media(cp)}<p>${cp.question}</p>
    <input id="answer" type="text" placeholder="Entrer ma réponse" autocomplete="off" autocapitalize="off">
    <p id="feedback" aria-live="polite"></p>
    <button class="primary" id="validate">VALIDER</button>
    <button class="hint-btn" id="hint-btn">💡 Un indice ?</button>`);
  const input = $("answer"); input.focus();
  $("validate").onclick = () => check(i);
  input.onkeydown = (e) => { if (e.key === "Enter") check(i); };
  $("hint-btn").onclick = () => { $("feedback").className = ""; $("feedback").textContent = "💡 " + cp.hint; };
}

function check(i) {
  const cp = checkpoints[i];
  const good = [].concat(cp.answer).map(normalize);
  if (good.includes(normalize($("answer").value))) return success(i);
  const f = $("feedback"); f.className = "";
  void f.offsetWidth; // relance l'animation
  f.className = "msg-bad";
  f.innerHTML = "❌ Ce n'est pas la bonne réponse !<br>Essaie encore…";
}

function success(i) {
  const cp = checkpoints[i], last = i === checkpoints.length - 1;
  progress = i + 1; save(); confetti();
  openModal(`<div class="lock-anim open">🔓</div><h2>🎉 Bravo !</h2>
    ${cp.success ? `<p>${cp.success}</p>` : ""}
    <p>${last ? "Tu as terminé toutes les étapes !" : "Tu viens de débloquer la prochaine étape !"}</p>
    <button class="primary" id="go">CONTINUER L'AVENTURE →</button>`);
  $("go").onclick = () => {
    closeModal();
    if (last) return showFinal();
    render(progress);
    toast(`✨ Nouvelle étape disponible : ${checkpoints[progress].name}`);
  };
}

function showFinal() { $("final-message").textContent = FINAL_MESSAGE; $("final").hidden = false; confetti(); }

// --- Zoom ---
function setZoom(z) { zoom = Math.min(2.5, Math.max(1, z)); $("stage").style.width = (zoom * 100) + "%"; $("stage").style.maxWidth = zoom === 1 ? "900px" : "none"; }

// --- Recommencer ---
function restart(ask = true) {
  if (ask && !confirm("Remettre toute la progression à zéro ?")) return;
  progress = 0; save(); $("final").hidden = true; closeModal(); render();
}

// --- Démarrage ---
document.title = GAME_TITLE; $("game-title").textContent = GAME_TITLE;
$("zoom-in").onclick = () => setZoom(zoom + 0.3);
$("zoom-out").onclick = () => setZoom(zoom - 0.3);
$("restart").onclick = () => restart(true);
$("replay").onclick = () => restart(false);
$("modal-close").onclick = closeModal;
$("overlay").onclick = (e) => { if (e.target === $("overlay")) closeModal(); };
load(); render();
if (progress >= checkpoints.length) showFinal();
