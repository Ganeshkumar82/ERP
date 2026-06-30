const express = require('express');
const router = express.Router();
const product = require('../services/product');


router.post('/add', async function(req,res,next){
  try {
      res.json(await product.addProduct(req.body)); 
  } catch (error) {
    console.log(`Error while adding product: ${error}`);
    next(error);
  }
});

module.exports = router;
