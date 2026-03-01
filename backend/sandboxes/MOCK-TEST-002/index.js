const http = require('http');

const port = process.env.PORT || 5000;

const requestHandler = (request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(`
    <html>
      <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0fdf4; margin: 0;">
        <div style="text-align: center;">
            <h1 style="color: #166534;">🎉 Hello from the Sandbox!</h1>
            <p style="color: #15803d;">This application was autonomously generated and is now running live in your Live Preview environment.</p>
        </div>
      </body>
    </html>
  `);
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
    if (err) {
        return console.error('Something bad happened', err);
    }
    console.log(`Server is listening on port ${port}`);
});
