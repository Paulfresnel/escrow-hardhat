const express = require("express");
const cors = require("cors");


module.exports = (app) => {

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: ["http://localhost:3000", process.env.ORIGIN],
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));  
};