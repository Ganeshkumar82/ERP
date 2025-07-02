const express = require('express');
const router = express.Router();
const vendor = require('../services/vendor');


router.post('/addvendor', async function(req,res,next){
  try{
    res.json(await vendor.AddVendor(req.body));
  }catch(er){
    console.log(`Error adding the vendor -> ${er}`);
    next(er);
  }
});

router.post('/getvendor', async function(req,res,next){
  try{
   res.json(await vendor.GetVendor(req.body));
  }catch(er){
   console.log(`Error getting the vendor -> ${er}`);
   next(er);
  }
});

router.post('/addquotation', async function(req,res,next){
  try{
    res.json(await vendor.AddQuotation(req, res, next));
  }catch(er){
    console.log(`Error adding the vendor quotation -> ${er}`);
    next(er);
  }
});

router.post('/detailspreloader', async function(req, res, next) {
  try {
    await vendor.vendorDetailsPreLoader(req, res);
  } catch (er) {
    console.log(`Error in vendor details preloader -> ${er}`);
    next(er);
  }
});

module.exports = router;