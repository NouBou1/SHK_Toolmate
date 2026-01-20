// --- RECHNER FUNKTIONEN ---
function calcHeizlast() {
    const qm = parseFloat(document.getElementById('hl_flaeche').value);
    const factor = parseFloat(document.getElementById('hl_typ').value);

    if (!qm) return;

    const watt = qm * factor;
    const kw = (watt / 1000).toFixed(2);

    showResult('res_heizlast', `Bedarf: ca. ${watt} Watt (${kw} kW)`);
}

function calcVolumenstrom() {
    const kw = parseFloat(document.getElementById('vs_kw').value);
    const dt = parseFloat(document.getElementById('vs_dt').value);

    if (!kw || !dt) return;

    const result = (kw * 1000) / (1.163 * dt);
    showResult('res_volumen', `Volumenstrom: ${Math.round(result)} l/h`);
}

function calcZirkulation() {
    const len = parseFloat(document.getElementById('zirk_m').value);
    const contentPerM = parseFloat(document.getElementById('zirk_dn').value);

    if (!len) return;

    const totalVol = len * contentPerM;
    const isCritical = totalVol > 3;

    const msg = `Inhalt: ${totalVol.toFixed(2)} Liter.\n` +
        (isCritical ? "ACHTUNG: > 3 Liter! Zirkulation pflicht (DVGW W 551)." : "OK: Keine Zirkulation nötig.");

    showResult('res_zirk', msg, isCritical);
}

function calcMAG() {
    const h = parseFloat(document.getElementById('mag_hoehe').value);

    if (isNaN(h)) return;

    // Formel: Statische Höhe / 10 + 0.3 bar (VDI 4708 empfiehlt mind 0.3 Zuschlag zur Verdampfungsvermeidung)
    // Mindestens jedoch oft 1.0 bar bei Etagenheizungen, wir rechnen hier den reinen Sollwert.
    let p0 = (h / 10) + 0.3;

    // Runden
    p0 = Math.round(p0 * 10) / 10;

    // Fülldruck ist meist p0 + 0.3 bis 0.5
    const pFill = p0 + 0.3;

    showResult('res_mag',
        `Vordruck (P0): ${p0} bar\n` +
        `Anlagen-Fülldruck: ca. ${pFill.toFixed(1)} bar`
    );
}

function calcPipeVol() {
    const len = parseFloat(document.getElementById('vol_len').value);
    const dn = parseFloat(document.getElementById('vol_dim').value); // DN ist hier ca Innendurchmesser in mm

    if (!len) return;

    // Radius in cm umrechnen für Liter (dm³)
    // DN 15 = 15mm innen = 1.5cm -> r = 0.75cm
    // Volumen = r² * pi * länge(cm) / 1000 für Liter

    // Vereinfachte Faktoren pro Meter (gängige Rohrreihen Cu/C-Stahl)
    // DN 12 (~13mm innen) -> 0.13 l/m
    // DN 15 (~16mm innen) -> 0.20 l/m
    // DN 20 (~20mm innen) -> 0.31 l/m
    // DN 25 (~26mm innen) -> 0.53 l/m
    // DN 32 (~33mm innen) -> 0.85 l/m
    // DN 40 (~40mm innen) -> 1.25 l/m
    // DN 50 (~51mm innen) -> 2.04 l/m

    let factor = 0;
    switch (dn) {
        case 12: factor = 0.13; break;
        case 15: factor = 0.20; break;
        case 20: factor = 0.31; break;
        case 25: factor = 0.53; break;
        case 32: factor = 0.85; break;
        case 40: factor = 1.25; break;
        case 50: factor = 2.04; break;
    }

    const total = len * factor;

    showResult('res_pipevol',
        `Rohrinhalt: ${total.toFixed(2)} Liter\n` +
        `(Faktor ca. ${factor} l/m)`
    );
}


// --- NEUE TOOLS ---

function calcHardness() {
    const val = parseFloat(document.getElementById('hard_val').value);
    const mode = document.getElementById('hard_mode').value;

    if (isNaN(val)) return;

    let result = 0;
    // Faktoren: 1 °dH = 0.1783 mmol/l | 1 mmol/l = 5.608 °dH

    if (mode === 'dh_to_mmol') {
        result = val * 0.1783;
        showResult('res_hard', `${val} °dH = ${result.toFixed(2)} mmol/l`);
    } else {
        result = val * 5.608;
        showResult('res_hard', `${val} mmol/l = ${result.toFixed(1)} °dH`);
    }
}

function calcGasPower() {
    const sec = parseFloat(document.getElementById('gas_sec').value);
    const vol = parseFloat(document.getElementById('gas_vol').value); // m³

    if (!sec || !vol) return;

    // Brennwert H-Gas ca. 11,2 kWh/m³ | Heizwert ca 10.0
    // L-Gas ca. 8-9.
    // Wir nehmen einen realistischen Mittelwert für Heizwert Hi (ca 10 kWh/m³) für die Belastung
    // oder Brennwert Hs (ca 11 kWh/m³).
    // Für die Geräteeinstellung (Düsendruck/Volumenstrom) rechnet man oft mit Hi ~ 10.0 (Faustformel).

    const factor = 10.0; // kWh/m³ (Kann man optional konfigurierbar machen)

    // Formel: (Volumen * Faktor * 3600) / Zeit
    const load = (vol * factor * 3600) / sec;

    showResult('res_gas',
        `Durchsatz: ${(vol * 3600 / sec).toFixed(2)} m³/h\n` +
        `Feuerungsleistung: ca. ${load.toFixed(1)} kW\n` +
        `(bei Hi = 10 kWh/m³)`
    );
}


function calcMixWater() {
    const tHot = parseFloat(document.getElementById('mix_t_hot').value);
    const volHot = parseFloat(document.getElementById('mix_vol').value);
    const tCold = parseFloat(document.getElementById('mix_t_cold').value);
    const tTarget = 38; // Zieltemperatur Badewasser/Dusche

    if (!tHot || !volHot) return;

    // Physik: Wärmemengenbilanz
    // V_mix = V_hot * (T_hot - T_cold) / (T_mix - T_cold)

    const numerator = volHot * (tHot - tCold);
    const denominator = tTarget - tCold;

    if (denominator <= 0) {
        showResult('res_mix', 'Fehler: Kaltwasser wärmer als Ziel?', true);
        return;
    }

    const vMix = numerator / denominator;

    // Faktor: Wie viel mal mehr Wasser bekomme ich raus?
    const factor = (vMix / volHot).toFixed(1);

    showResult('res_mix',
        `Ertrag bei 38°C: ca. ${Math.round(vMix)} Liter\n` +
        `(Faktor ${factor}x des Speichervolumens)`
    );
}

function calcOffset() {
    const offset = parseFloat(document.getElementById('offset_cm').value);

    if (!offset) return;

    // Formel für 45 Grad: Hypotenuse = Kathete * Wurzel(2)
    // Wurzel(2) ist ca. 1.414
    const diag = offset * 1.4142;

    // Hinweis auf Einschubtiefe (Z-Maß)
    showResult('res_offset',
        `Rohrlänge (Mitte-Mitte): ${diag.toFixed(1)} cm\n` +
        `\n⚠️ Achtung: Einstecktiefe der Fittings noch abziehen!`
    );
}

function calcSlope() {
    const len = parseFloat(document.getElementById('slope_len').value);
    const perc = parseFloat(document.getElementById('slope_perc').value);

    if (!len) return;

    // Gefälle in cm = Länge(m) * Prozent
    // 2m * 2% = 4cm
    const diff = len * perc; // Da len in m, ergibt das Ergebnis eigentlich m/100 -> also cm
    // Beispiel: 1m * 2 (=2%) = 2cm. Korrekt.

    // cm in mm für genaues Messen
    const mm = diff * 10;

    showResult('res_slope',
        `Höhenunterschied: ${diff.toFixed(1)} cm\n` +
        `(${mm} mm am Zollstock)`
    );
}

// --- NEUE FUNKTIONEN ---

function calcCoreDrill() {
    const dn = parseFloat(document.getElementById('kb_dn').value);
    const iso = parseFloat(document.getElementById('kb_iso').value);

    // Berechnung: Rohr Außen + (2 * Dämmung) + 20mm Montagespielraum
    // Wir nehmen an, der User wählt das DN Maß, das Rohr ist außen oft minimal größer (z.B. DN100 = 110mm)
    // Die Select Values im HTML sind bereits die echten Außendurchmesser (z.B. 110).

    const totalDiameter = dn + (2 * iso);
    const drillHole = totalDiameter + 30; // +3cm Luft für Mörtel/Schaum ist praxisnah

    // Aufrunden auf nächste 10er Stelle für Kronen-Maß
    const recommendation = Math.ceil(drillHole / 10) * 10;

    showResult('res_kb',
        `Rohr + Dämmung: ${totalDiameter} mm\n` +
        `Empfohlene Kernbohrung: ∅ ${recommendation} mm\n` +
        `(inkl. Montagespielraum)`
    );
}

function calcRadiator() {
    const factorType = parseFloat(document.getElementById('hk_typ').value); // Watt pro Meter bei Höhe 600 (Referenz)
    const factorHeight = parseFloat(document.getElementById('hk_height').value);
    const lenMm = parseFloat(document.getElementById('hk_len').value);

    if (!lenMm) return;

    // Faustformel-Logik:
    // Die Faktoren im Value sind ca. Watt pro lfm bei Typ X und Höhe 600.
    // Wir müssen das auf die Höhe skalieren.
    // Höhe 600 ist Faktor 1.0 (Referenz).
    // Höhe 300 hat ca. 55% der Leistung von 600.
    // Höhe 900 hat ca. 140% der Leistung von 600.

    let heightCorrection = 1.0;
    if (factorHeight === 0.3) heightCorrection = 0.55;
    if (factorHeight === 0.4) heightCorrection = 0.70;
    if (factorHeight === 0.5) heightCorrection = 0.85;
    if (factorHeight === 0.6) heightCorrection = 1.00;
    if (factorHeight === 0.9) heightCorrection = 1.45;

    // Berechnung: (Watt pro Meter * Korrektur * Länge in Meter)
    const power70 = factorType * heightCorrection * (lenMm / 1000);

    // Umrechnung auf Niedertemperatur (Wärmepumpe 55/45/20) - grob Faktor 0.5
    const powerWP = power70 * 0.5;

    showResult('res_hk',
        `Leistung (70/55°C): ca. ${Math.round(power70)} Watt\n` +
        `Leistung (55/45°C): ca. ${Math.round(powerWP)} Watt\n` +
        `(Schätzwert für Altbau-Bestand)`
    );
}


// --- NEUE PROFI-RECHNER ---

function calcTank() {
    // Eingaben in cm
    const d = parseFloat(document.getElementById('tank_d').value);
    const l = parseFloat(document.getElementById('tank_l').value);
    const h = parseFloat(document.getElementById('tank_h').value);

    if (!d || !l || !h) return;
    if (h > d) {
        showResult('res_tank', 'Fehler: Füllhöhe größer als Durchmesser!', true);
        return;
    }

    // Radius
    const r = d / 2;

    // Berechnung Segmentfläche des Kreises (komplexe Geometrie)
    // Alpha ist der Winkel des Segments
    // Wenn voll: Einfach Zylindervolumen

    let area;

    if (h === d) {
        area = Math.PI * r * r;
    } else {
        // Formel für Kreissegment
        // Wir rechnen mit Radius und Abstand Mittelpunkt zur Oberfläche
        const x = r - h; // Abstand Mittelpunkt

        // Fläche Segment = r² * arccos(x/r) - x * wurzel(r² - x²)
        // (Winkel im Bogenmaß)
        area = (r * r * Math.acos(x / r)) - (x * Math.sqrt(r * r - x * x));
    }

    // Volumen in cm³ (Area * Länge) -> / 1000 für Liter
    const volLiters = (area * l) / 1000;

    // Gesamtvolumen des Tanks zum Vergleich
    const totalVol = (Math.PI * r * r * l) / 1000;
    const percent = (volLiters / totalVol) * 100;

    showResult('res_tank',
        `Aktueller Inhalt: ${Math.round(volLiters)} Liter\n` +
        `Füllstand: ${percent.toFixed(1)} %\n` +
        `(Gesamtkapazität: ${Math.round(totalVol)} Liter)`
    );
}

function calcFlowSpeed() {
    let vol = parseFloat(document.getElementById('flow_vol').value);
    const unit = document.getElementById('flow_unit').value;
    const dnMm = parseFloat(document.getElementById('flow_dn').value);

    if (!vol || !dnMm) return;

    // Alles auf m³/s umrechnen (SI Einheit)
    let flowM3s = 0;

    if (unit === 'l_h') flowM3s = vol / 1000 / 3600;
    if (unit === 'l_min') flowM3s = vol / 1000 / 60;
    if (unit === 'm3_h') flowM3s = vol / 3600;

    // Querschnittsfläche Rohr in m²
    // A = pi * r²
    const rM = (dnMm / 1000) / 2;
    const area = Math.PI * rM * rM;

    // Geschwindigkeit v = Q / A
    const speed = flowM3s / area;

    // Bewertung (Ampel)
    let warning = "";
    // Grenzwerte grob: Heizung max 1.0 m/s, Trinkwasser max 2.0 m/s, Luft max 3-5 m/s
    if (unit === 'l_h' && speed > 1.0) warning = "\n⚠️ Achtung: > 1 m/s (Geräuschgefahr Heizung!)";
    if (unit === 'l_min' && speed > 2.0) warning = "\n⚠️ Achtung: > 2 m/s (Druckschlag/Korrosion!)";
    if (unit === 'm3_h' && speed > 5.0) warning = "\n⚠️ Achtung: > 5 m/s (Luftkanal laut!)";

    showResult('res_flow',
        `Geschwindigkeit: ${speed.toFixed(2)} m/s` + warning,
        warning !== ""
    );
}

function calcCondensate() {
    const kw = parseFloat(document.getElementById('cond_kw').value);
    const factor = parseFloat(document.getElementById('cond_fuel').value);
    const hours = parseFloat(document.getElementById('cond_hours').value);

    if (!kw || !hours) return;

    // Pro Stunde
    const perHour = kw * factor;
    // Pro Tag
    const perDay = perHour * hours;

    showResult('res_cond',
        `Kondensat: ca. ${perHour.toFixed(2)} Liter/Stunde\n` +
        `Tagesmenge: ca. ${perDay.toFixed(1)} Liter\n` +
        `(Bei Vollbrennwertnutzung)`
    );
}


// --- NEU: ABGLEICH & LÜFTUNG ---

function calcKvValue() {
    const watt = parseFloat(document.getElementById('kv_watt').value);
    const dt = parseFloat(document.getElementById('kv_dt').value);
    const dpMbar = parseFloat(document.getElementById('kv_dp').value);

    if (!watt || !dt || !dpMbar) return;

    // 1. Volumenstrom (l/h) = Watt / (1.163 * dt)
    const qLh = watt / (1.163 * dt);

    // 2. Kv-Wert Berechnung
    // Formel: Kv = Q (m³/h) / Wurzel(dp in bar)
    // Q in m³/h = qLh / 1000
    // dp in bar = dpMbar / 1000

    const qM3 = qLh / 1000;
    const dpBar = dpMbar / 1000;

    const kv = qM3 / Math.sqrt(dpBar);

    // 3. Schätzung der Voreinstellung (Standard Heimeier/Danfoss Skala 1-6)
    // Das ist eine Näherung, da jeder Ventilherteller andere Kennlinien hat!
    let setting = "?";
    // Grobe Kennlinie für Standard-Ventile (V-exakt o.ä.)
    if (kv < 0.13) setting = "1";
    else if (kv < 0.28) setting = "2";
    else if (kv < 0.42) setting = "3";
    else if (kv < 0.56) setting = "4";
    else if (kv < 0.70) setting = "5";
    else if (kv < 0.90) setting = "6";
    else setting = "Offen (7/N)";

    // Visualisierung updaten
    document.getElementById('valve_visual').innerText = setting;
    document.getElementById('valve_visual').style.color = "#ff9900";

    showResult('res_kv',
        `Durchfluss: ${Math.round(qLh)} l/h\n` +
        `Errechneter Kv-Wert: ${kv.toFixed(2)}\n` +
        `Empfohlene Stufe: ca. ${setting}`
    );
}

function calcAirExchange() {
    const qm = parseFloat(document.getElementById('air_qm').value);
    const h = parseFloat(document.getElementById('air_h').value);
    const typeVal = parseFloat(document.getElementById('air_type').value); // Faktor oder Pauschale

    if (!qm || !h) return;

    const volRaum = qm * h;
    let result = 0;
    let msg = "";

    // Wenn typeVal > 10 ist, gehen wir von Pauschalwert aus (z.B. 40m³/h für Bad nach DIN 18017)
    if (typeVal > 10) {
        // DIN 18017-3 fordert oft 40 oder 60 m³/h
        result = typeVal;
        msg = `Pauschal-Forderung (DIN 18017): ~${result} m³/h`;
    } else {
        // Luftwechselrate berechnen
        result = volRaum * typeVal;
        msg = `Luftwechsel (${typeVal}x / h): ${result.toFixed(1)} m³/h`;
    }

    showResult('res_air',
        `Raumvolumen: ${volRaum.toFixed(1)} m³\n` +
        msg + "\n" +
        "(Mindestleistung des Lüfters)"
    );
}


// --- NEUE FUNKTIONEN RUNDE 3 ---

function calcHeatUpTime() {
    const vol = parseFloat(document.getElementById('heatup_vol').value);
    const t1 = parseFloat(document.getElementById('heatup_t1').value);
    const t2 = parseFloat(document.getElementById('heatup_t2').value);
    const kw = parseFloat(document.getElementById('heatup_kw').value);

    if (!vol || !kw) return;
    if (t1 >= t2) {
        showResult('res_heatup', 'Start-Temperatur muss kleiner als Ziel sein.', true);
        return;
    }

    // Formel: Q = m * c * deltaT
    // c Wasser = 1.163 Wh/kgK
    const deltaT = t2 - t1;
    const energyWh = vol * 1.163 * deltaT; // Benötigte Energie in Wattstunden

    // Zeit = Energie / Leistung
    // energyWh / (kw * 1000) = Stunden
    const hours = energyWh / (kw * 1000);
    const minutes = Math.round(hours * 60);

    // Schöne Formatierung (z.B. 1h 20min)
    const hDisplay = Math.floor(minutes / 60);
    const mDisplay = minutes % 60;

    showResult('res_heatup',
        `Benötigte Energie: ${(energyWh / 1000).toFixed(1)} kWh\n` +
        `Dauer: ca. ${minutes} Min\n` +
        `(${hDisplay} Std. ${mDisplay} Min.)`
    );
}

function calcClipDist() {
    const mat = document.getElementById('clip_mat').value;
    const dn = parseInt(document.getElementById('clip_dn').value);

    let dist = 0;

    // Richtwerte (Mittelwerte aus gängigen Tabellen & Befestigungsregeln)
    // Stahlrohr trägt weiter als Kupfer, Kupfer weiter als Verbundrohr

    if (mat === 'plastic') {
        // Verbundrohr hängt schnell durch
        if (dn <= 16) dist = 0.80;
        else if (dn <= 20) dist = 1.00;
        else if (dn <= 26) dist = 1.25;
        else if (dn <= 32) dist = 1.50;
        else if (dn <= 40) dist = 1.75;
        else dist = 2.00;
    }
    else if (mat === 'cu') {
        // Kupfer / Edelstahl
        if (dn <= 15) dist = 1.25;
        else if (dn <= 22) dist = 1.50; // Standard 22er
        else if (dn <= 28) dist = 1.75; // Standard 28er
        else if (dn <= 35) dist = 2.00;
        else if (dn <= 42) dist = 2.25;
        else dist = 2.75;
    }
    else {
        // Stahlrohr (sehr steif)
        if (dn <= 18) dist = 1.50; // 3/8"
        else if (dn <= 22) dist = 2.00; // 1/2"
        else if (dn <= 28) dist = 2.25; // 3/4"
        else if (dn <= 35) dist = 2.75; // 1"
        else if (dn <= 42) dist = 3.00; // 1 1/4"
        else dist = 3.25;
    }

    showResult('res_clip',
        `Max. Abstand: ${dist.toFixed(2)} Meter\n` +
        `(Empfehlung für waagerechte Montage)`
    );
}

function calcRealPower() {
    const flow = parseFloat(document.getElementById('real_flow').value);
    const vl = parseFloat(document.getElementById('real_vl').value);
    const rl = parseFloat(document.getElementById('real_rl').value);

    if (!flow || isNaN(vl) || isNaN(rl)) return;

    const dt = vl - rl;
    if (dt <= 0) {
        showResult('res_realpower', 'Delta T ist 0 oder negativ!', true);
        return;
    }

    // P = V * c * dt
    // P (Watt) = Flow(l/h) * 1.163 * K
    const watt = flow * 1.163 * dt;
    const kw = watt / 1000;

    showResult('res_realpower',
        `Spreizung: ${dt.toFixed(1)} K\n` +
        `Leistung: ${kw.toFixed(2)} kW\n` +
        `(${Math.round(watt)} Watt)`
    );
}
