const express = require("express");
const router = express.Router();
const {
  
    registerUserCtr,
    checkEmail,
    sendCodeConf,
    verifierCode,
    loginUserCtrl,
    microsoftLogin,
    forgotpwd,
    resetpwd,
    checkNum,
    updateDescriptor,
    gettokenName,
    getAll,updateDescriptorById,getAllusers
,updateUser,deleteUser,updateEmailFunction,updatePasswordController,gettokenEmail,getUserCountByDate} = require("../controllers/authcontroller.js");  
router.put('/update-password', updatePasswordController);
router.post("/register", registerUserCtr);
router.post("/checkEmail", checkEmail);
router.post("/sendcode", sendCodeConf);
router.post("/verifiercode", verifierCode);
router.post("/login", loginUserCtrl);
router.post("/microsoft-login", microsoftLogin);
router.post("/forgot-password",forgotpwd);
router.post("/reset-password", resetpwd);
router.post("/check-Num", checkNum);
router.post("/updateDescriptor", updateDescriptor);
router.post("/get-token-name", gettokenName);
router.post("/get-token-email", gettokenEmail);
router.get("/user-count-by-date", getUserCountByDate);
router.get("/users", getAll);
router.put("/update-descriptor", updateDescriptorById);
router.get("/get-all-users",getAllusers);
router.put("/update-user",updateUser);
router.delete("/delete-user/:id", deleteUser);
router.put("/update-email", updateEmailFunction);
module.exports = router;
