"use strict";
// In this file all the api routes are defined such as /flipkartdetailsbylink,/flipkartdetails, etc

// Importing all the modules and files required
const express = require("express");
const router = new express.Router();
const routertext = require("./routertext");

// Importing the file to scrap the complete products details from nykaa, amazon and flipkart
const { flipkartbylink } = require(routertext.FTS_FLIPKART_BL);
const { amazonbylink } = require(routertext.FTS_AMAZON_BL);
const { nykaabylink } = require(routertext.FTS_NYKAA_BL);

//Calling middleware to identify the incoming JSON from the front end
router.use(express.json());
router.use(express.urlencoded({ extended: false }));

// Router to handle get request made by client
router.get("/", async (req, res) => {
  try {
    res.status(200).send("hii");
  } catch {
    res.send("fuss");
  }
});

// Router to handle post request made by client to scrap the particular product details from a link
router.post(routertext.ART_FLIPKART_BL, async (req, res) => {
  try {
    res.send(await flipkartbylink(req["body"].link));
  } catch (e) {
    res.send("Check the input format");
  }
});

router.post(routertext.ART_AMAZON_BL, async (req, res) => {
  try {
    const listofproducts = await amazonbylink(req["body"].link);
    res.send(listofproducts);
  } catch (e) {
    console.log("Something went wrong on router");
  }
});

router.post(routertext.ART_NYKAA_BL, async (req, res) => {
  try {
    const obj = await nykaabylink(req.body);
    res.send(obj);
  } catch (e) {
    console.log("jh");
    res.send("Something went wrong on router");
  }
});

module.exports = { router };
