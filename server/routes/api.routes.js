const express = require("express");
const router = express.Router();
const Contract = require("../models/Contract.model");

// CONTRACTS Routes

router.get('/contract', async (req,res)=>{
    const contracts = await Contract.find();
    console.log("contracts:", contracts);
    res.json({contracts});
})

router.post('/contract', async (req,res)=>{
    try{
     const {sender, arbiter, beneficiary, amount, contractAddress}  = req.body;
     const newContract = await Contract.create({sender, contractAddress, arbiter, beneficiary, amount});
     console.log("new contract created:", newContract);
     res.json({message: "successfully created", contract:newContract});
}
    catch(err){
        res.json({message: err});
    }
})

router.post('/approve', async (req,res)=>{
    const {contractAddress} = req.body;
    const contract = await Contract.findOne({contractAddress});
    console.log("contract found:", contract);
    await Contract.findByIdAndUpdate(contract._id, {status: "Approved"});
    res.json({message: "contract deleted successfully"});
})

module.exports = router;