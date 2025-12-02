

$('#oeffnungszeitInput').clockpicker({
  placement: 'bottom',
  align: 'left',
  autoclose: true,
  donetext: 'Fertig',
  twelvehour: false
}).on('change', function() {
  filterUhrzeit = this.value;
  searchAtms();
});


let filterEntfernung = "";

document.getElementById("entfernungInput").addEventListener("input", function() {
  filterEntfernung = this.value;  // Meter als Zahl
  searchAtms();                  // Karte aktualisieren
});

let filterUhrzeit = "";

document.getElementById("oeffnungszeitInput").addEventListener("input", function() {
  filterUhrzeit = this.value;  // Format "HH:MM"
  searchAtms();               // Karte aktualisieren
});



let filterBankart = "";
document.querySelectorAll("#myDropdown3 a").forEach(item => {
  item.addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("dropbtn3").textContent = this.textContent;
    document.getElementById("myDropdown3").classList.remove("show");

    filterBankart = this.textContent;
    searchAtms();
  });
});

function toggleDropdown(dropdownId) {
  document.getElementById(dropdownId).classList.toggle("show");
}



document.getElementById("dropbtn3").addEventListener("click", function(event) {
  toggleDropdown("myDropdown3");
  event.stopPropagation();
});

window.addEventListener("click", function(){
  document.querySelectorAll(".dropdown-content3")
    .forEach(menu => menu.classList.remove("show"));
});


// KARTE


const map = L.map('map').setView([51.1657, 10.4515], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const lilaIcon = L.icon({
  iconUrl: 'iconlila.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

let markers = [];



// SUCHEN & FILTERN


document.querySelector(".suchleiste input").addEventListener("input", searchAtms);

async function searchAtms() {
  const suchtext = document.querySelector(".suchleiste input").value;

  const url = new URL("http://localhost:3000/api/atms");
  url.searchParams.append("search", suchtext);

  const response = await fetch(url);
  const geldautomaten = await response.json();

  applyFilters(geldautomaten);
}



// FILTERLOGIK


function applyFilters(atms) {
  let result = atms;


  // BANKART

  if (filterBankart) {
    result = result.filter(a =>
      a.bank.toLowerCase() === filterBankart.toLowerCase()
    );
  }

  // ÖFFNUNGSZEITEN

  if (filterUhrzeit) {
    const [inputHour, inputMinute] = filterUhrzeit.split(":").map(Number);

    result = result.filter(a => {
      if (!a.oeffnungszeiten) return false;

      const text = a.oeffnungszeiten.trim().toLowerCase();

      // Fall 1: Immer geöffnet
      if (text === "immer") return true;

      // Fall 2: Zeitbereich wie "9:00 - 16:00" oder "09:30 - 17:15"
      const match = text.match(/(\d{1,2}):?(\d{2})?\s*[-–]\s*(\d{1,2}):?(\d{2})?/);

      if (!match) return false;

      // Startzeit
      const startHour = parseInt(match[1]);
      const startMinute = match[2] ? parseInt(match[2]) : 0;

      // Endzeit
      const endHour = parseInt(match[3]);
      const endMinute = match[4] ? parseInt(match[4]) : 0;

      // Vergleich in Minuten
      const userMinutes = inputHour * 60 + inputMinute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      return userMinutes >= startMinutes && userMinutes <= endMinutes;
    });
  }


  if (filterEntfernung && userLat != null && userLng != null) {
    const maxDist = Number(filterEntfernung);

    result = result.filter(a => {
      const dist = getDistance(userLat, userLng, a.breite, a.laenge);
      return dist <= maxDist;
    });
  }

  updateMap(result);
  geldautomatenListeAktualisieren(result);

}

// Seitenpanel
document.getElementById("Seitenfenster").addEventListener("click", () => {
  document.getElementById("geldautomatSeitenpanel").classList.toggle("offen");
});

function geldautomatenListeAktualisieren(geldautomaten) {
  const liste = document.getElementById("geldautomatListeninhalt");
  liste.innerHTML = "";

  if (geldautomaten.length === 0) {
    liste.innerHTML = "<p>Keine Standorte gefunden.</p>";
    return;
  }

  console.log(geldautomaten[0]);
  geldautomaten.forEach(g => {
    const feld = document.createElement("div");
    feld.className = "geldautomatKarte";

    feld.innerHTML = `
      <strong>${g.bank}</strong><br>
      ${g.name}<br>
      <small>${g.adresse} ${g.postleitzahl} ${g.stadt}</small><br>
      Öffnungszeiten: ${g.oeffnungszeiten || "Keine Angaben"}<br>
    `;

    // Beim Klicken Karte auf den Geldautomaten zentrieren
    feld.addEventListener("click", () => {
      if (g.breite && g.laenge) {
        map.setView([g.breite, g.laenge], 17);
      }
    });

    liste.appendChild(feld);
  });
}



// MARKER ZEICHNEN


function updateMap(atms) {
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  atms.forEach(atm => {
    if (!atm.breite || !atm.laenge) return;

    const marker = L.marker([atm.breite, atm.laenge], { icon: lilaIcon })
      .addTo(map)
      .bindPopup(`${atm.bank} – ${atm.name}<br>${atm.stadt}`);

    markers.push(marker);
  });
}

// ENTFERNUNGSFUNKTION

function getDistance(lat1, lon1, lat2, lon2) {
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


let userLat = null;
let userLng = null;

function showUserLocation() {
  if (!navigator.geolocation) {
    alert("Standort nicht unterstützt.");
    return;
  }

  navigator.geolocation.getCurrentPosition((pos) => {
    userLat = pos.coords.latitude;
    userLng = pos.coords.longitude;

    L.circle([userLat, userLng], {
      color: "#4b134f",
      fillColor: "#70219a",
      fillOpacity: 0.5,
      radius: 50
    }).addTo(map);

    map.setView([userLat, userLng], 15);
  });
}
