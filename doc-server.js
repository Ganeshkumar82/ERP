const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4545;
const HOST = '192.168.0.111';

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route to serve the API documentation
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'Vendor_API_Documentation.html');
    
    // Check if the file exists
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).send(`
            <html>
                <head>
                    <title>Documentation Not Found</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                        .error { color: #e74c3c; }
                        .info { color: #3498db; }
                    </style>
                </head>
                <body>
                    <h1 class="error">Documentation File Not Found</h1>
                    <p class="info">Please ensure 'Vendor_API_Documentation.html' exists in the same directory as this server.</p>
                    <p><strong>Expected path:</strong> ${htmlPath}</p>
                </body>
            </html>
        `);
    }
});

// Route to serve the documentation directly
app.get('/docs', (req, res) => {
    const htmlPath = path.join(__dirname, 'Vendor_API_Documentation.html');
    
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else {
        res.status(404).json({
            error: 'Documentation file not found',
            path: htmlPath
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Documentation Server is running',
        timestamp: new Date().toISOString(),
        server: {
            host: HOST,
            port: PORT
        }
    });
});

// Start the server
app.listen(PORT, HOST, () => {
    console.log('🚀 Documentation Server Started Successfully!');
    console.log('=====================================');
    console.log(`📍 Server running on: http://${HOST}:${PORT}`);
    console.log(`📖 API Documentation: http://${HOST}:${PORT}/`);
    console.log(`📖 Alternative URL: http://${HOST}:${PORT}/docs`);
    console.log(`💓 Health Check: http://${HOST}:${PORT}/health`);
    console.log('=====================================');
    console.log('Press Ctrl+C to stop the server');
});

// Handle server errors
app.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use on ${HOST}`);
        console.error('Please try a different port or stop the service using this port.');
    } else if (err.code === 'EADDRNOTAVAIL') {
        console.error(`❌ Error: Address ${HOST} is not available`);
        console.error('Please check your network configuration or use a different IP address.');
    } else {
        console.error('❌ Server Error:', err.message);
    }
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Documentation Server...');
    console.log('✅ Server stopped successfully');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Documentation Server...');
    console.log('✅ Server stopped successfully');
    process.exit(0);
});
