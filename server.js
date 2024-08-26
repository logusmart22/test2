const http = require('http');
const { Worker } = require('worker_threads');

// Function to run the big loop in a worker thread
function runBigLoop() {
    return new Promise((resolve, reject) => {
        const worker = new Worker(`
            const { parentPort } = require('worker_threads');
            let sum = 0;
            for (let i = 0; i < 1e9; i++) {
                sum += i;
            }
            parentPort.postMessage(sum);
        `, { eval: true });

        worker.on('message', resolve);
        worker.on('error', reject);
    });
}

const server = http.createServer(async (req, res) => {
    // Run the big loop in a worker thread
    try {
        const result = await runBigLoop();
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Loop result: ' + result);
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error: ' + error.message);
    }
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
