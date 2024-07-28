// Import express from the package
import express from "express";

// Import cors from the package
import cors from "cors";

// Import any routers that you need
import dataRouter from "./routes/data.route.js";

// Using express to create a server
const server = express();

// MIDDLEWARE
// Reads any request coming in that has JSON data, and makes that data available via the request.body
server.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

server.use(express.json());

// Use the imported router
server.use("/data", dataRouter);

// Tell the server to begin listening for incoming requests on a specified port
server.listen(5555, () => {
    console.log("Server started on port 5555");
});