
document.getElementById("dropbtn").addEventListener("click", function(event){
  toggleDropdown("myDropdown");
  event.stopPropagation();
});

let filterEntfernung = "";
document.querySelectorAll('#myDropdown a').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById("dropbtn").textContent = this.textContent;
    document.getElementById("myDropdown").classList.remove("show");

    filterEntfernung = this.textContent.replace("m", "");
    searchAtms();
  });
});

let filterOeffnungszeiten = "";
document.querySelectorAll("#myDropdown2 a").forEach(item => {
  item.addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("dropbtn2").textContent = this.textContent;
    document.getElementById("myDropdown2").classList.remove("show");

    filterOeffnungszeiten = this.textContent.toLowerCase();
    searchAtms();
  });
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

document.getElementById("dropbtn2").addEventListener("click", function(event) {
  toggleDropdown("myDropdown2");
  event.stopPropagation();
});

document.getElementById("dropbtn3").addEventListener("click", function(event) {
  toggleDropdown("myDropdown3");
  event.stopPropagation();
});

window.addEventListener("click", function(){
  document.querySelectorAll(".dropdown-content, .dropdown-content2, .dropdown-content3")
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

  if (filterOeffnungszeiten === "jetzt geöffnet") {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    result = result.filter(a => {
      if (!a.oeffnungszeiten) return false;

      const text = a.oeffnungszeiten.trim().toLowerCase();

      // Fall 1: Immer geöffnet
      if (text === "immer") return true;

      // Fall 2: Zeitfenster z. B. "9-16 uhr"
      const match = text.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})/);

      if (match) {
        const start = parseInt(match[1]);
        const end = parseInt(match[2]);

        return currentHour >= start && currentHour < end;
      }

      return false;
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
