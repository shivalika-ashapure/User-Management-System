const express = require("express");
const { registerUser, loginUser, resetPassword, upload ,getUsers,getUserById,updateUser,deleteUser} = require("../controllers/userController");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/reset-password", resetPassword);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.get("/", authMiddleware, getUsers); 
router.get("/:id", authMiddleware, getUserById);
router.put("/update/:id", authMiddleware, updateUser); 
router.delete("/delete/:id", authMiddleware, deleteUser);

// /  Protected Route (Only accessible with a valid token)
router.get("/profile", authMiddleware, async (req, res) => {
  res.json({ msg: "This is a protected route", user: req.user });
});
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


module.exports = router;
