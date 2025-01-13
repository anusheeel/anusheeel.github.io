const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext('2d');

console.log('Neural network 2 script loaded');
console.log('Canvas2 element:', canvas2);

let width2, height2;
const inputNodes2 = [];
const hiddenNodes2 = [];
const outputNodes2 = [];
const connections2 = [];

function resizeCanvas2() {
    console.log('Resizing canvas2');
    width2 = canvas2.parentElement.clientWidth;
    height2 = canvas2.parentElement.clientHeight;
    canvas2.width = width2;
    canvas2.height = height2;
    
    createNetwork2();
}

function createNetwork2() {
    // Clear existing nodes
    inputNodes2.length = 0;
    hiddenNodes2.length = 0;
    outputNodes2.length = 0;
    connections2.length = 0;

    // Create nodes with adjusted positions
    for (let i = 0; i < 4; i++) {
        inputNodes2.push(new Node2(width2 * 0.2, height2 * (0.2 + i * 0.15)));
    }

    for (let i = 0; i < 3; i++) {
        hiddenNodes2.push(new Node2(width2 * 0.5, height2 * (0.3 + i * 0.15)));
    }

    for (let i = 0; i < 2; i++) {
        outputNodes2.push(new Node2(width2 * 0.8, height2 * (0.35 + i * 0.2)));
    }

    // Create connections
    inputNodes2.forEach(input => {
        hiddenNodes2.forEach(hidden => {
            connections2.push(new Connection2(input, hidden));
        });
    });

    hiddenNodes2.forEach(hidden => {
        outputNodes2.forEach(output => {
            connections2.push(new Connection2(hidden, output));
        });
    });
}

class Node2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 8;
    }

    draw() {
        ctx2.beginPath();
        ctx2.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx2.fillStyle = 'rgba(0,0,255,0.25)';
        ctx2.fill();
    }
}

class Connection2 {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.particles = [];
    }

    draw() {
        ctx2.beginPath();
        ctx2.moveTo(this.start.x, this.start.y);
        ctx2.lineTo(this.end.x, this.end.y);
        ctx2.strokeStyle = 'rgba(0,0,255,0.15)';
        ctx2.stroke();

        this.particles.forEach(particle => particle.draw());
    }

    addParticle() {
        if (Math.random() < 0.1) {
            this.particles.push(new Particle2(this.start, this.end));
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.progress < 1;
        });
    }
}

class Particle2 {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.progress = 0;
        this.speed = 0.0125;
    }

    update() {
        this.progress += this.speed;
        return this.progress;
    }

    draw() {
        const x = this.start.x + (this.end.x - this.start.x) * this.progress;
        const y = this.start.y + (this.end.y - this.start.y) * this.progress;
        ctx2.beginPath();
        ctx2.arc(x, y, 3, 0, Math.PI * 2);
        ctx2.fillStyle = 'rgba(0,0,255,0.4)';
        ctx2.fill();
    }
}

function animate2() {
    if (!canvas2.parentElement) return;
    
    ctx2.clearRect(0, 0, width2, height2);
    
    // Draw connections and particles
    connections2.forEach(conn => {
        conn.draw();
        conn.addParticle();
        conn.updateParticles();
    });

    // Draw all nodes
    inputNodes2.concat(hiddenNodes2, outputNodes2).forEach(node => node.draw());

    requestAnimationFrame(animate2);
}

// Initialize immediately after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    if (!canvas2 || !ctx2) {
        console.error('Canvas2 or context not found');
        return;
    }
    console.log('Initializing neural network 2');
    resizeCanvas2();
    createNetwork2();
    animate2();
});

window.addEventListener('resize', resizeCanvas2);
