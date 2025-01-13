const waveCanvas = document.getElementById('waveCanvas');
const waveCtx = waveCanvas.getContext('2d');

let waveWidth, waveHeight;

function resizeWaveCanvas() {
    waveWidth = waveCanvas.parentElement.clientWidth;
    waveHeight = waveCanvas.parentElement.clientHeight;
    waveCanvas.width = waveWidth;
    waveCanvas.height = waveHeight;
}

const waves = [
    { color: 'rgba(59, 130, 246, 0.3)', frequency: 0.02, amplitude: 30, speed: 0.02 },
    { color: 'rgba(99, 102, 241, 0.3)', frequency: 0.03, amplitude: 20, speed: 0.03 },
    { color: 'rgba(139, 92, 246, 0.3)', frequency: 0.04, amplitude: 15, speed: 0.04 }
];

let offset = 0;

function animateWaves() {
    waveCtx.clearRect(0, 0, waveWidth, waveHeight);
    
    waves.forEach(wave => {
        waveCtx.beginPath();
        waveCtx.moveTo(0, waveHeight/2);
        
        for(let x = 0; x < waveWidth; x++) {
            const y = Math.sin(x * wave.frequency + offset * wave.speed) * wave.amplitude + waveHeight/2;
            waveCtx.lineTo(x, y);
        }
        
        waveCtx.strokeStyle = wave.color;
        waveCtx.lineWidth = 3;
        waveCtx.stroke();
    });
    
    offset += 1;
    requestAnimationFrame(animateWaves);
}

document.addEventListener('DOMContentLoaded', () => {
    resizeWaveCanvas();
    animateWaves();
});

window.addEventListener('resize', resizeWaveCanvas);
