const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

console.log('Neural network script loaded');
console.log('Canvas element:', canvas);

let width, height;
const inputNodes = [];
const hiddenNodes = [];
const outputNodes = [];
const connections = [];

function resizeCanvas() {
    console.log('Resizing canvas');
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
    
    createNetwork();
}

function createNetwork() {
    // Clear existing nodes
    inputNodes.length = 0;
    hiddenNodes.length = 0;
    outputNodes.length = 0;
    connections.length = 0;

    // Create nodes with adjusted positions
    for (let i = 0; i < 4; i++) {
        inputNodes.push(new Node(width * 0.2, height * (0.2 + i * 0.15)));
    }

    for (let i = 0; i < 3; i++) {
        hiddenNodes.push(new Node(width * 0.5, height * (0.3 + i * 0.15)));
    }

    for (let i = 0; i < 2; i++) {
        outputNodes.push(new Node(width * 0.8, height * (0.35 + i * 0.2)));
    }

    // Create connections
    inputNodes.forEach(input => {
        hiddenNodes.forEach(hidden => {
            connections.push(new Connection(input, hidden));
        });
    });

    hiddenNodes.forEach(hidden => {
        outputNodes.forEach(output => {
            connections.push(new Connection(hidden, output));
        });
    });
}

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 8;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,255,0.25)';
        ctx.fill();
    }
}

class Connection {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.particles = [];
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = 'rgba(0,0,255,0.15)';
        ctx.stroke();

        this.particles.forEach(particle => particle.draw());
    }

    addParticle() {
        if (Math.random() < 0.1) {
            this.particles.push(new Particle(this.start, this.end));
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.progress < 1;
        });
    }
}

class Particle {
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
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,255,0.4)';
        ctx.fill();
    }
}

function animate() {
    if (!canvas.parentElement) return;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw connections and particles
    connections.forEach(conn => {
        conn.draw();
        conn.addParticle();
        conn.updateParticles();
    });

    // Draw all nodes
    inputNodes.concat(hiddenNodes, outputNodes).forEach(node => node.draw());

    requestAnimationFrame(animate);
}

// Initialize immediately after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    if (!canvas || !ctx) {
        console.error('Canvas or context not found');
        return;
    }
    console.log('Initializing neural network');
    resizeCanvas();
    createNetwork();
    animate();
});

window.addEventListener('resize', resizeCanvas);
