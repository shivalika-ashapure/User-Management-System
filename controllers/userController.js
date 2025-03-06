const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// Cloudinary Setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: 787195123151781,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Multer Storage for Profile Image Upload
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// Generate Temporary Password
const generateTempPassword = () => Math.random().toString(36).slice(-8);

// ✅ **Fixed registerUser Function**
const registerUser = async (req, res) => {
  try {
    const { name, email, phone,imageBase64} = req.body;
    console.log("process.env.CLOUDINARY_CLOUD_NAME",process.env.CLOUDINARY_CLOUD_NAME)


    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Generate and hash temporary password
    const tempPassword = generateTempPassword();
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
 
    let base64Image= imageBase64.startsWith("data:image")
    ?imageBase64
    : `data:image/png:base64,${imageBase64}`;
    // Upload Profile Image to Cloudinary

    const result = await cloudinary.uploader.upload(base64Image,{
      folder: 'uploads',
    
    });

    // Create a new user in the database
    console.log("result.secure_url",result.secure_url)
    user = new User({ name, email, phone, profileImage:result.secure_url, password: hashedPassword, tempPassword: hashedTempPassword });
    await user.save();

    // Send Email with Temporary Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Temporary Password",
      text: `Hello ${name}, your temporary password is: ${tempPassword}`,
    });

    res.status(201).json({ msg: "User registered. Check email for temporary password." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Check if user is using temporary password
    if (user.tempPassword && await bcrypt.compare(password, user.tempPassword)) {
      return res.status(200).json({ msg: "Please reset your password", firstTimeLogin: true });
    }

    // Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
const { password: _, tempPassword, ...userData } = user.toObject();

    res.json({ token, user :userData});

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ RESET PASSWORD FUNCTION (NO CHANGES NEEDED)
const resetPassword = async (req, res) => {
  try {
    const { email, tempPassword, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(tempPassword, user.tempPassword);
    if (!isMatch) return res.status(400).json({ msg: "Invalid temporary password" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.tempPassword = null;
    await user.save();

    
    res.json({ msg: "Password reset successful. Please login with new password." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// dmug rplw uptm zknw
// ogja hhlp lxnj rlky

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const updateUser = async (req, res) => {
  try {
    const { name, email, phone, imageBase64 } = req.body;
    const userId = req.params.id; // Get user ID from request params

    // Check if user exists
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    let profileImage = user.profileImage; // Default to existing image

    // If new Base64 image is provided, upload it to Cloudinary
    if (imageBase64) {
      let base64Image = imageBase64.startsWith("data:image")
        ? imageBase64
        : `data:image/png;base64,${imageBase64}`;

      try {
        const result = await cloudinary.uploader.upload(base64Image, {
          folder: "uploads",
        });
        profileImage = result.secure_url; // Update image URL
      } catch (uploadError) {
        return res.status(500).json({ error: "Image upload failed" });
      }
    }

    // Update user details
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.profileImage = profileImage;

    await user.save();

    res.json({ msg: "User updated successfully!", user });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "User deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = { registerUser, loginUser, resetPassword,
  //  upload,
   getUsers, getUserById, updateUser, deleteUser  };
