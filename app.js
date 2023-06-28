"use strict";
// This is main file from where server is listened

require("events").EventEmitter.defaultMaxListeners = Infinity;
const express = require("express");
const app = express();
const { router } = require("./router");

app.use(router); //Creating router to make main file neat and clean

app.listen(80, () => {
  console.log(`Server running at ${80}`);
});

module.exports = app;
