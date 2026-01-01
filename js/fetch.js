// --- WETTER API (Open-Meteo) ---

async function getSiteWeather() {
    const descEl = document.getElementById('weather_desc');
    const warnBox = document.getElementById('weather_warning');

    const isCap = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    const geoPlugin = isCap ? window.Capacitor.Plugins?.Geolocation : null;

    const handlePosition = (lat, lon) => {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
            .then(response => response.json())
            .then(data => {
                const w = data.current_weather;

                document.getElementById('weather_temp').innerText = w.temperature + "°C";
                document.getElementById('weather_wind').innerText = "💨 " + w.windspeed + " km/h";
                descEl.innerText = "Standort ermittelt";

                const warnings = [];
                if (w.temperature < 5) warnings.push("❄️ Achtung: Unter 5°C! Vorsicht bei Klebern, Silikon und Lacken.");
                if (w.temperature < 0) warnings.push("🧊 Frostgefahr! Leitungen entleeren oder schützen.");
                if (w.windspeed > 30) warnings.push("💨 Starker Wind: Vorsicht bei Dacharbeiten.");

                if (warnings.length > 0) {
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
    };

    try {
        if (geoPlugin) {
            descEl.innerText = "Frage GPS (native) an...";
            await geoPlugin.requestPermissions?.({ permissions: ['location'] });
            const pos = await geoPlugin.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
            handlePosition(pos.coords.latitude, pos.coords.longitude);
            return;
        }
    } catch (err) {
        console.error('Geolocation (Capacitor) fehlgeschlagen', err);
        descEl.innerText = "GPS verweigert.";
    }

    if (!navigator.geolocation) {
        descEl.innerText = "Kein GPS verfügbar.";
        return;
    }

    descEl.innerText = "Orte Satelliten...";

    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        handlePosition(lat, lon);
    }, () => {
        descEl.innerText = "GPS verweigert.";
    });
}

// Optional: Beim Laden der Seite direkt Wetter holen (wenn gewünscht)
// getSiteWeather();