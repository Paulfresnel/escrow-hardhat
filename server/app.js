require("dotenv").config();

require("./db");


const express = require("express");

const app = express();

require("./config")(app);


const apiRoutes = require('./routes/api.routes')
app.use('/api', apiRoutes)

require("./error-handling")(app);

module.exports = app;