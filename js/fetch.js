// --- WETTER API (Open-Meteo) ---

function getSiteWeather() {
    const descEl = document.getElementById('weather_desc');
    
    if (!navigator.geolocation) {
        descEl.innerText = "Kein GPS verfügbar.";
        return;
    }

    descEl.innerText = "Orte Satelliten...";

    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        // API Abruf (Open-Meteo ist kostenlos & ohne Key)
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
            .then(response => response.json())
            .then(data => {
                const w = data.current_weather;
                
                // Werte setzen
                document.getElementById('weather_temp').innerText = w.temperature + "°C";
                document.getElementById('weather_wind').innerText = "💨 " + w.windspeed + " km/h";
                document.getElementById('weather_desc').innerText = "Standort ermittelt";
                
                // Prüfungen für den SHKler
                const warnBox = document.getElementById('weather_warning');
                let warnings = [];

                if(w.temperature < 5) {
                    warnings.push("❄️ Achtung: Unter 5°C! Vorsicht bei Klebern, Silikon und Lacken.");
                }
                if(w.temperature < 0) {
                    warnings.push("🧊 Frostgefahr! Leitungen entleeren oder schützen.");
                }
                if(w.windspeed > 30) {
                    warnings.push("💨 Starker Wind: Vorsicht bei Dacharbeiten.");
                }

                if(warnings.length > 0) {
                    warnBox.style.display = 'block';
                    warnBox.innerHTML = warnings.join('<br>');
                } else {
                    warnBox.style.display = 'none';
                }

            })
            .catch(err => {
                descEl.innerText = "Fehler beim Laden.";
                console.error(err);
            });
    }, () => {
        descEl.innerText = "GPS verweigert.";
    });
}

// Optional: Beim Laden der Seite direkt Wetter holen (wenn gewünscht)
// getSiteWeather();