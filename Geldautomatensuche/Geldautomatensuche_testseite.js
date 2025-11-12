


// Dropdown ein-/ausblenden
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Text der geklickten Option in den Button schreiben
document.querySelectorAll('#myDropdown a').forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault(); // verhindert Sprung nach oben
    const button = document.getElementById("dropbtn");
    button.textContent = this.textContent; // gewählten Text einsetzen
    document.getElementById("myDropdown").classList.remove("show"); // Dropdown schließen
  });
});

// Dropdown schließen, wenn außerhalb geklickt wird
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (let i = 0; i < dropdowns.length; i++) {
      const openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

// generische Funktion zum Öffnen/Schließen
function toggleDropdown(dropdownId) {
  document.getElementById(dropdownId).classList.toggle("show");
}

// Klick auf Button2
document.getElementById("dropbtn2").addEventListener("click", function(event) {
  toggleDropdown("myDropdown2");
  event.stopPropagation(); // verhindert, dass window.onclick sofort das Dropdown wieder schließt
});

// Auswahl einer Option
document.querySelectorAll("#myDropdown2 a").forEach(item => {
  item.addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("dropbtn2").textContent = this.textContent;
    document.getElementById("myDropdown2").classList.remove("show");
  });
});

// Dropdown schließen, wenn außerhalb geklickt wird
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn2')) {
    const dropdown = document.getElementById("myDropdown2");
    if (dropdown.classList.contains('show')) {
      dropdown.classList.remove("show");
    }
  }
}

// Karte initialisieren (Mittelpunkt Deutschland)
const map = L.map('map').setView([51.1657, 10.4515], 6);

// OpenStreetMap-Layer hinzufügen
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Beispielmarker hinzufügen
L.marker([52.5200, 13.4050])
  .addTo(map)
  .bindPopup('Geldautomat in Berlin');


async function searchAtms() {
  const query = document.querySelector(".suchleiste input").value;

  // Anfrage an Backend
  const response = await fetch(`http://localhost:3000/api/atms?search=${query}`);
  const atms = await response.json();

  console.log("Gefundene Geldautomaten:", atms);

  // Karte aktualisieren
  updateMap(atms);
}

// Eventlistener für die Suchleiste
document.querySelector(".suchleiste input").addEventListener("input", searchAtms);

let markers = [];

// Funktion, um Marker zu aktualisieren
function updateMap(atms) {
  // alte Marker entfernen
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];

  // neue Marker hinzufügen
  atms.forEach(atm => {
    // prüfen, ob beide Werte existieren und Zahlen sind
    if (atm.breite != null && atm.laenge != null) {
      const lat = parseFloat(atm.breite);
      const lng = parseFloat(atm.laenge);

      if (!isNaN(lat) && !isNaN(lng)) {
        const marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`${atm.bank} – ${atm.name}<br>${atm.stadt}`);
        markers.push(marker);
      } else {
        console.warn("Koordinaten sind keine Zahlen:", atm);
      }
    } else {
      console.warn("Ungültige Koordinaten für ATM:", atm);
    }
  });
}

function showUserLocation() {
  if (!navigator.geolocation) {
    alert("Dein Browser unterstützt keine Standortabfrage.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Marker oder Kreis für den Standort
      const userMarker = L.circle([lat, lng], {
        color: "blue",
        fillColor: "#3b82f6",
        fillOpacity: 0.5,
        radius: 50
      }).addTo(map);

      // Karte auf Benutzerstandort zentrieren
      map.setView([lat, lng], 15);

      // Popup anzeigen
      userMarker.bindPopup("Dein aktueller Standort").openPopup();
    },
    (error) => {
      alert("Standort konnte nicht abgerufen werden: " + error.message);
    }
  );
}
