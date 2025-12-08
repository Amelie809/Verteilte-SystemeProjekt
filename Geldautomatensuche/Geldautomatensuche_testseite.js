
$('#oeffnungszeitInput').clockpicker({
  placement: 'bottom',
  align: 'left',
  autoclose: true,
  donetext: 'Fertig',
  twelvehour: false
}).on('change', function() {
  filterUhrzeit = this.value;
  geldautomatenSuchen();
});

let filterEntfernung = "";

document.getElementById("entfernungInput").addEventListener("input", function() {
  filterEntfernung = this.value;  // Meter
  geldautomatenSuchen();
});

let filterUhrzeit = "";

document.getElementById("oeffnungszeitInput").addEventListener("input", function() {
  filterUhrzeit = this.value;
  geldautomatenSuchen();
});

let filterBankart = "";
document.querySelectorAll("#meinDropdown a").forEach(item => {
  item.addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("dropbtn").textContent = this.textContent;
    document.getElementById("meinDropdown").classList.remove("show");

    filterBankart = this.textContent;
    geldautomatenSuchen();
  });
});

function dropdownUmschalten(dropdownId) {
  document.getElementById(dropdownId).classList.toggle("show");
}

document.getElementById("dropbtn").addEventListener("click", function(event) {
  dropdownUmschalten("meinDropdown");
  event.stopPropagation();
});

window.addEventListener("click", function(){
  document.querySelectorAll(".dropdown-content")
    .forEach(menu => menu.classList.remove("show"));
});


const karte = L.map('map').setView([51.1657, 10.4515], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(karte);

const lilaIcon = L.icon({
  iconUrl: 'iconlila.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

let markerListe = [];


document.querySelector(".suchleiste input").addEventListener("input", geldautomatenSuchen);

async function geldautomatenSuchen() {
  const suchtext = document.querySelector(".suchleiste input").value;

  const url = new URL("http://localhost:3000/api/atms");
  url.searchParams.append("search", suchtext);

  const response = await fetch(url);
  const geldautomaten = await response.json();

  filterAnwenden(geldautomaten);
}


function filterAnwenden(atms) {
  let ergebnis = atms;

  if (filterBankart) {
    ergebnis = ergebnis.filter(a =>
      a.bank.toLowerCase() === filterBankart.toLowerCase()
    );
  }

  if (filterUhrzeit) {
    const [inputStunde, inputMinute] = filterUhrzeit.split(":").map(Number);

    ergebnis = ergebnis.filter(a => {
      if (!a.oeffnungszeiten) return false;

      const text = a.oeffnungszeiten.trim().toLowerCase();

      if (text === "immer") return true;

      const match = text.match(/(\d{1,2}):?(\d{2})?\s*[-–]\s*(\d{1,2}):?(\d{2})?/);
      if (!match) return false;

      const startStunde = parseInt(match[1]);
      const startMinute = match[2] ? parseInt(match[2]) : 0;
      const endStunde = parseInt(match[3]);
      const endMinute = match[4] ? parseInt(match[4]) : 0;

      const nutzerMinuten = inputStunde * 60 + inputMinute;
      const startMinuten = startStunde * 60 + startMinute;
      const endMinuten = endStunde * 60 + endMinute;

      return nutzerMinuten >= startMinuten && nutzerMinuten <= endMinuten;
    });
  }

  if (filterEntfernung && nutzerBreite != null && nutzerLaenge != null) {
    const maxDist = Number(filterEntfernung);

    ergebnis = ergebnis.filter(a => {
      const dist = entfernungBerechnen(nutzerBreite, nutzerLaenge, a.breite, a.laenge);
      return dist <= maxDist;
    });
  }

  karteAktualisieren(ergebnis);
  listeAktualisieren(ergebnis);
}


  document.getElementById("seitenpanelBtn").addEventListener("click", function () {
  document.getElementById("seitenpanel").classList.toggle("offen");
});


function listeAktualisieren(geldautomaten) {
  const liste = document.getElementById("geldautomatListeninhalt");
  liste.innerHTML = "";

  if (geldautomaten.length === 0) {
    liste.innerHTML = "<p>Keine Standorte gefunden.</p>";
    return;
  }

  geldautomaten.forEach(g => {
    const feld = document.createElement("div");
    feld.className = "geldautomatKarte";

    feld.innerHTML = `
      <strong>${g.bank}</strong><br>
      ${g.name}<br>
      <small>${g.adresse}, ${g.postleitzahl} ${g.stadt}</small><br>
      Öffnungszeiten: ${g.oeffnungszeiten || "Keine Angaben"}<br>
    `;

    feld.addEventListener("click", () => {
      if (g.breite && g.laenge) {
        karte.setView([g.breite, g.laenge], 17);
      }
    });

    liste.appendChild(feld);
  });
}


// MARKER
function karteAktualisieren(atms) {
  // Alte Marker entfernen
  markerListe.forEach(m => karte.removeLayer(m));
  markerListe = [];

  const koordinaten = [];

  // Neue Marker setzen
  atms.forEach(atm => {
    if (!atm.breite || !atm.laenge) return;

    const marker = L.marker([atm.breite, atm.laenge], { icon: lilaIcon })
      .addTo(karte)
      .bindPopup(`${atm.bank} – ${atm.name}<br>${atm.stadt}`);

    markerListe.push(marker);

    koordinaten.push([atm.breite, atm.laenge]);
  });

  //  ZOOM
  if (koordinaten.length > 0) {
    const bounds = L.latLngBounds(koordinaten);

    karte.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 13,
      animate: true
    });
  }
}



function entfernungBerechnen(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// STANDORT
let nutzerBreite = null;
let nutzerLaenge = null;

function nutzerStandortAnzeigen() {
  if (!navigator.geolocation) {
    alert("Standort nicht unterstützt.");
    return;
  }
  navigator.geolocation.getCurrentPosition((pos) => {
    nutzerBreite = pos.coords.latitude;
    nutzerLaenge = pos.coords.longitude;

    L.circle([nutzerBreite, nutzerLaenge], {
      color: "#4b134f",
      fillColor: "#70219a",
      fillOpacity: 0.5,
      radius: 50
    }).addTo(karte);

    karte.setView([nutzerBreite, nutzerLaenge], 15);
  });
}
