// importing express
import express from "express";
const app = express();
const port = process.env.PORT || 3300;

//importing swagger
import swagger from "swagger-ui-express";
import swaggerDoc from "./swagger.json" assert{type:"json"};

app.use("/api-docs",swagger.serve,swagger.setup(swaggerDoc));

//importing body parser
import bodyParser from "body-parser";
app.use(bodyParser.json());


import db from "./config/mongoose.js";
// importing cors
import cors from "cors";

//importing logger middleware
import {logger} from "./config/logger_middleware.js"


//using cors
app.use(cors());

//declaring statics for songs and cover art
app.use("/songs", express.static("./uploads/songs"));
app.use("/covers", express.static("./uploads/covers"));

//setting static files
app.use(express.static("./assets"));


//SETTING UP VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", "./views");


//using decoder to read from POST requests
app.use(express.urlencoded({ extended: true }));

//using logger middleware
app.use(logger);

//routing all requests to routes
import router from "./routes/index.js"
app.use("/", router);


//listening to the server
app.listen(port, (error) => {
    if (error) {
        console.log("Error starting the server", error);
        return;
    }
    console.log(`Server listening on port: ${port}`);
});