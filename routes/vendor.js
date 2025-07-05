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
    res.json(await vendor.vendorDetailsPreLoader(req.body));
  } catch (er) {
    console.log(`Error in vendor details preloader -> ${er}`);
    next(er);
  }
});
router.post('/getprocesslist', async function(req, res, next) {
  try {
    res.json(await vendor.GetProcessList(req.body));
  } catch (er) {
    console.log(`Error in vendor process list -> ${er}`);
    next(er);
  }
});

router.post('/getsubprocesslist', async function(req, res, next) {
  try {
    res.json(await vendor.GetSubProcessList(req.body));
  } catch (er) {
    console.log(`Error in vendor sub process list -> ${er}`);
    next(er);
  }
});

router.post('/postrfq', async function(req, res, next) {
  try {
    res.json(await vendor.PostRFQ(req, res));
  } catch (er) {
    console.log(`Error posting RFQ -> ${er}`);
    next(er);
  }
});

module.exports = router;