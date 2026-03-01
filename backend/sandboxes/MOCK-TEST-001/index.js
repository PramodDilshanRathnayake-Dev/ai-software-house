console.log("Starting Web Server...");

// Intentional Error: Calling a method that doesn't exist to crash the process
const dbConnection = null;
dbConnection.connect();

console.log("Web server running!");
