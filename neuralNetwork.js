const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 10; // Increased radius to make nodes bigger
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 255, 0.4)';  // Blue color with 40% opacity
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
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.2)';  // Blue color with lower opacity for connection lines
        ctx.lineWidth = 3; // Increased line width for thicker connections
        ctx.stroke();

        this.particles.forEach(particle => particle.draw());
    }

    addParticle() {
        if (Math.random() < 0.1) {
            this.particles.push(new Particle(this.start, this.end));
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => !particle.isFinished());
        this.particles.forEach(particle => particle.update());
    }
}

class Particle {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.pos = { x: start.x, y: start.y };
        this.speed = 0.01 + Math.random() * 0.00025;
        this.progress = 0;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 4, 0, Math.PI * 2);  // Increased particle size to 4
        ctx.fillStyle = 'rgba(255, 155, 0, 1)';  // Bright yellow color with 100% opacity
        ctx.fill();
    }

    update() {
        this.progress += this.speed;
        this.pos.x = this.start.x + (this.end.x - this.start.x) * this.progress;
        this.pos.y = this.start.y + (this.end.y - this.start.y) * this.progress;
    }

    isFinished() {
        return this.progress >= 1;
    }
}

const inputNodes = [];
const hiddenNodes = [];
const outputNodes = [];
const connections = [];

function createNetwork() {
    // Input Layer: 4 Nodes
    for (let i = 0; i < 4; i++) {
        inputNodes.push(new Node(width * 0.2, height * (0.2 + i * 0.2)));
    }

    // Hidden Layer: 3 Nodes
    for (let i = 0; i < 3; i++) {
        hiddenNodes.push(new Node(width * 0.5, height * (0.25 + i * 0.25)));
    }

    // Output Layer: 2 Nodes
    for (let i = 0; i < 2; i++) {
        outputNodes.push(new Node(width * 0.8, height * (0.33 + i * 0.33)));
    }

    // Final Output Layer: 1 Node
    outputNodes.push(new Node(width * 0.9, height * 0.5));

    // Create connections between layers
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

function animate() {
    ctx.clearRect(0, 0, width, height);

    connections.forEach(conn => {
        conn.draw();
        conn.addParticle();
        conn.updateParticles();
    });

    inputNodes.concat(hiddenNodes, outputNodes).forEach(node => node.draw());

    requestAnimationFrame(animate);
}

createNetwork();
animate();
