"use strict";
// In this file all the api routes are defined such as /flipkartdetailsbylink,/flipkartdetails, etc

// Importing all the modules and files required
const express = require("express");
const router = new express.Router();
const routertext = require("./routertext");

// Importing the file to scrap the complete products details from nykaa, amazon and flipkart
const { flipkartbylink } = require(routertext.FTS_FLIPKART_BL);
const { amazon } = require(routertext.FTS_AMAZON_BC);
const { amazonbylink } = require(routertext.FTS_AMAZON_BL);
const { flipkart } = require(routertext.FTS_FLIPKART_BC);
const { nykaa } = require(routertext.FTS_NYKAA_BC);
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

// Router to handle post request made by client to scrap the number of categories simultaneously
router.post(routertext.ART_FLIPKART_BC, async (req, res) => {
  try {
    // Calling the flipkart function to scrap the all categories details
    let listofproducts = await flipkart(req["body"]);

    res.send(listofproducts);
  } catch (e) {
    res.send("Check the input format");
  }
});

router.post(routertext.ART_AMAZON_BC, async (req, res) => {
  try {
    const listofproducts = await amazon(req["body"]);
    res.send(listofproducts);
  } catch (e) {
    console.log("Something went wrong on router");
  }
});

router.post(routertext.ART_NYKAA_BC, async (req, res) => {
  try {
    let listofproducts = await nykaa(req["body"]);
    // listofproducts = await sql(listofproducts, 5);
    res.send(listofproducts);
  } catch (e) {
    console.log("jh");
    res.send("Something went wrong on router");
  }
});

module.exports = { router };
