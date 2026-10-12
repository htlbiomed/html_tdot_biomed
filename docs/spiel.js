// Spiellogik: Diese Datei muss für die Übungen nicht verändert werden.

const canvas = document.getElementById("spiel");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const regen = document.getElementById("regen");
const sprechblase = document.getElementById("sprechblase");
const figur = canvas.dataset.figur;

// Die Positionen der Organe und der passenden Körperstellen.
const organe = [
    { name: "Herz",  x: 50, y: 50,  zielX: 270, zielY: 400 },
    { name: "Lunge", x: 50, y: 100, zielX: 220, zielY: 370 },
    { name: "Leber", x: 50, y: 150, zielX: 210, zielY: 480 },
    { name: "Magen", x: 50, y: 200, zielX: 320, zielY: 500 },
    { name: "Darm",  x: 50, y: 250, zielX: 270, zielY: 565 }
];

const bilder = {};
for (const [zustand, datei] of Object.entries({
    normal: `body_${figur}.png`,
    richtig: `body_happy_${figur}.png`,
    falsch: `body_sad_${figur}.png`
})) {
    bilder[zustand] = new Image();
    bilder[zustand].src = `img/${datei}`;
    bilder[zustand].onload = zeichnen;
}

let verbindungen = []; // { organ: Index, ziel: Index }
let auswahl = null;
let zustand = "normal";

function zeichnen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bild = bilder[zustand];
    if (bild.complete && bild.naturalWidth) {
        ctx.drawImage(bild, 0, 0, canvas.width, canvas.height);
    }

    // Verbindungslinien einzeichnen
    ctx.strokeStyle = "#ff4d4d";
    ctx.lineWidth = 2;
    for (const { organ, ziel } of verbindungen) {
        const start = organe[organ];
        const ende = organe[ziel];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(ende.zielX, ende.zielY);
        ctx.stroke();
    }

    // Punkte und Beschriftungen einzeichnen
    for (let i = 0; i < organe.length; i++) {
        const o = organe[i];
        punkt(o.x, o.y, "white", auswahl === i);
        punkt(o.zielX, o.zielY, "#d9b34b", false);
        ctx.fillStyle = "#333";
        ctx.font = "13px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(o.name, o.x + 16, o.y);
    }
}

function punkt(x, y, farbe, markiert) {
    ctx.beginPath();
    ctx.arc(x, y, markiert ? 12 : 6, 0, Math.PI * 2);
    ctx.fillStyle = farbe;
    ctx.fill();
    ctx.strokeStyle = markiert ? "#e8524b" : "#888";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function geklickterPunkt(x, y) {
    for (let i = 0; i < organe.length; i++) {
        const o = organe[i];
        if (Math.hypot(x - o.x, y - o.y) < 15) return { art: "organ", index: i };
        if (Math.hypot(x - o.zielX, y - o.zielY) < 15) return { art: "ziel", index: i };
    }
    return null;
}

function pruefen() {
    const falsch = verbindungen.some(v => v.organ !== v.ziel);
    const richtig = organe.every((_, i) =>
        verbindungen.some(v => v.organ === i && v.ziel === i)
    );

    zustand = falsch ? "falsch" : richtig ? "richtig" : "normal";
    regen.style.display = falsch ? "block" : "none";
    statusText.textContent = falsch ? "Oh nein! Da stimmt etwas nicht ..." :
        richtig ? "Super! Alles richtig zugeordnet 😄" :
        `Richtig zugeordnet: ${verbindungen.filter(v => v.organ === v.ziel).length} von ${organe.length}`;
    zeichnen();
}

// pointerdown funktioniert mit Maus und Touchscreen.
canvas.addEventListener("pointerdown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * canvas.width / rect.width;
    const y = (event.clientY - rect.top) * canvas.height / rect.height;
    const punkt = geklickterPunkt(x, y);

    if (!punkt) { auswahl = null; zeichnen(); return; }
    if (punkt.art === "organ") {
        auswahl = auswahl === punkt.index ? null : punkt.index;
        zeichnen();
        return;
    }
    if (auswahl === null) return;

    const organ = auswahl;
    auswahl = null;
    const vorhanden = verbindungen.findIndex(v => v.organ === organ && v.ziel === punkt.index);
    if (vorhanden >= 0) {
        verbindungen.splice(vorhanden, 1); // dieselbe Verbindung entfernen
    } else {
        // Pro Organ und Körperstelle höchstens eine Verbindung
        verbindungen = verbindungen.filter(v => v.organ !== organ && v.ziel !== punkt.index);
        verbindungen.push({ organ, ziel: punkt.index });
    }
    pruefen();
});

canvas.style.touchAction = "manipulation";

document.getElementById("reset").onclick = () => {
    verbindungen = [];
    auswahl = null;
    pruefen();
    statusText.textContent = "Viel Spaß!";
};

document.getElementById("automatisch").onclick = () => {
    verbindungen = organe.map((_, i) => ({ organ: i, ziel: i }));
    auswahl = null;
    pruefen();
};

sprechblase.textContent = `Hallo ${document.getElementById("name").textContent}!`;
setTimeout(() => { sprechblase.style.display = "none"; }, 10000);
zeichnen();
