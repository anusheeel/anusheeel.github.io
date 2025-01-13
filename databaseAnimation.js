const dbCanvas = document.getElementById('dbCanvas');
const dbCtx = dbCanvas.getContext('2d');

let dbWidth, dbHeight;

function resizeDbCanvas() {
    dbWidth = dbCanvas.parentElement.clientWidth;
    dbHeight = dbCanvas.parentElement.clientHeight;
    dbCanvas.width = dbWidth;
    dbCanvas.height = dbHeight;
}

class DatabaseNode {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = type === 'server' ? 25 : 15;
        this.color = type === 'server' ? 'rgba(0,0,255,0.25)' : 'rgba(0,0,255,0.25)';
    }

    draw() {
        dbCtx.beginPath();
        if (this.type === 'server') {
            // Draw server icon
            dbCtx.rect(this.x - 20, this.y - 20, 40, 40);
            dbCtx.fillStyle = this.color;
            dbCtx.fill();
            // Draw server lines
            for (let i = 1; i < 4; i++) {
                dbCtx.beginPath();
                dbCtx.moveTo(this.x - 15, this.y - 15 + i * 10);
                dbCtx.lineTo(this.x + 15, this.y - 15 + i * 10);
                dbCtx.strokeStyle = '#fff';
                dbCtx.stroke();
            }
        } else {
            // Draw database cylinder
            dbCtx.ellipse(this.x, this.y - 5, 15, 5, 0, 0, Math.PI * 2);
            dbCtx.fillStyle = this.color;
            dbCtx.fill();
            dbCtx.beginPath();
            dbCtx.moveTo(this.x - 15, this.y - 5);
            dbCtx.lineTo(this.x - 15, this.y + 15);
            dbCtx.arc(this.x, this.y + 15, 15, Math.PI, 0, false);
            dbCtx.lineTo(this.x + 15, this.y - 5);
            dbCtx.fill();
        }
    }
}

class DataPacket {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.progress = 0;
        this.speed = 0.0125;
    }

    update() {
        this.progress += this.speed;
        return this.progress >= 1;
    }

    draw() {
        const x = this.start.x + (this.end.x - this.start.x) * this.progress;
        const y = this.start.y + (this.end.y - this.start.y) * this.progress;
        dbCtx.beginPath();
        dbCtx.arc(x, y, 3, 0, Math.PI * 2);
        dbCtx.fillStyle = 'rgba(0,0,255,0.4)';
        dbCtx.fill();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    resizeDbCanvas();
    
    const server = new DatabaseNode(dbWidth / 2, dbHeight * 0.4, 'server');
    const databases = [];
    const packets = [];
    const numDatabases = 6;

    // Create database nodes in a circular pattern
    for (let i = 0; i < numDatabases; i++) {
        let x, y;
        if (i === 0 || i === 1) {
            x = dbWidth / 2 - (dbWidth * 0.2);
            y = dbHeight * (0.3 + (i * 0.2));
        } else if (i === 2 || i === 3) {
            x = dbWidth / 2 + (dbWidth * 0.2);
            y = dbHeight * (0.3 + ((i-2) * 0.2));
        } else {
            const angle = (Math.PI * ((i-3) / 2) - Math.PI/4);
            x = dbWidth / 2 + Math.cos(angle) * (dbWidth * 0.25);
            y = dbHeight * 0.6 + Math.sin(angle) * (dbHeight * 0.2);
        }
        databases.push(new DatabaseNode(x, y, 'database'));
    }

    function animateDb() {
        dbCtx.clearRect(0, 0, dbWidth, dbHeight);

        // Draw connections
        databases.forEach(db => {
            dbCtx.beginPath();
            dbCtx.moveTo(server.x, server.y);
            dbCtx.lineTo(db.x, db.y);
            dbCtx.strokeStyle = 'rgba(0,0,255,0.15)';
            dbCtx.lineWidth = 1;
            dbCtx.stroke();
        });

        // Random packet creation
        if (Math.random() < 0.05) {
            if (Math.random() < 0.5) {
                packets.push(new DataPacket(server, databases[Math.floor(Math.random() * databases.length)]));
            } else {
                packets.push(new DataPacket(databases[Math.floor(Math.random() * databases.length)], server));
            }
        }

        // Update and draw packets
        for (let i = packets.length - 1; i >= 0; i--) {
            if (packets[i].update()) {
                packets.splice(i, 1);
            } else {
                packets[i].draw();
            }
        }

        server.draw();
        databases.forEach(db => db.draw());

        requestAnimationFrame(animateDb);
    }

    animateDb();
});
window.addEventListener('resize', resizeDbCanvas);

