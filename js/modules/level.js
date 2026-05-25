// Wasserwaage Modul
// Device Orientation API für Level-Funktion

function requestLevelPerm() {
    if (hasDeviceOrientationPermission()) {
        requestIOSPermission();
    } else {
        setupOrientationListener();
    }
}

function hasDeviceOrientationPermission() {
    return typeof DeviceOrientationEvent !== 'undefined' && 
           typeof DeviceOrientationEvent.requestPermission === 'function';
}

function requestIOSPermission() {
    DeviceOrientationEvent.requestPermission()
        .then(response => {
            if (response === 'granted') {
                setupOrientationListener();
            } else {
                alert("Erlaubnis verweigert.");
            }
        })
        .catch(console.error);
}

function setupOrientationListener() {
    window.addEventListener('deviceorientation', handleOrientation);
}

function handleOrientation(event) {
    const x = event.gamma; // -90 bis 90
    const y = event.beta;  // -180 bis 180

    updateTiltDisplay(x, y);
    updateBubblePosition(x, y);
    updateBubbleColor(x, y);
}

function updateTiltDisplay(x, y) {
    const tiltX = document.getElementById('tilt_x');
    const tiltY = document.getElementById('tilt_y');
    
    if (tiltX) tiltX.innerText = Math.round(x);
    if (tiltY) tiltY.innerText = Math.round(y);
}

function updateBubblePosition(x, y) {
    let moveX = x * 2;
    let moveY = y * 2;

    const max = 80;
    moveX = clamp(moveX, -max, max);
    moveY = clamp(moveY, -max, max);

    const bubble = document.getElementById('bubble');
    if (bubble) {
        bubble.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    }
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function updateBubbleColor(x, y) {
    const bubble = document.getElementById('bubble');
    if (!bubble) return;
    
    const isLevel = Math.abs(x) < 2 && Math.abs(y) < 2;
    
    if (isLevel) {
        bubble.style.backgroundColor = "#00c851";
        bubble.style.boxShadow = "0 0 15px #00c851";
    } else {
        bubble.style.backgroundColor = "#ff4444";
        bubble.style.boxShadow = "none";
    }
}
