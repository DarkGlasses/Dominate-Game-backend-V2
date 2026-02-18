const prisma = require("../prisma");
const multer = require("multer");
const bcrypt = require("bcrypt");
const authService = require("../services/auth.service");
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const role = (email === ADMIN_EMAIL) ? 'admin' : 'user';
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      role: role
    });

    res.json({
      status: "success",
      message: "Login successfully",
      token,
      role,
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};

exports.register = async (req, res) => {
  upload.single('profile')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        message: 'Error uploading file'
      });
    }

    const { username, email, password, role } = req.body;
    const profile = req.file ? req.file.filename : null;
    const hashedPassword = await bcrypt.hash(password, 10);

    const exist = await prisma.users.findUnique({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: "Email already exists" });
    }
    try {
      const user = await prisma.users.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role,
          profile
        }
      });

      res.status(201).json({
        message: "Register success",
        user
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  });
};

exports.updateProfile = async (req, res) => {
  upload.single('profile')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: 'error', message: 'Error uploading file' });
    }

    const userId = req.user.id;
    const { username, password } = req.body;
    const profile = req.file ? req.file.filename : null;

    try {
      const updateData = {};
      if (username) updateData.username = username;

      if (password && password.trim() !== "") {
        updateData.password = await bcrypt.hash(password, 10);
      }

      if (profile) {
        updateData.profile = profile;
      }

      const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: updateData
      });

      const { password: _, ...userWithoutPassword } = updatedUser;

      res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: userWithoutPassword
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  });
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userData } = user;

    res.json({
      status: "success",
      data: userData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

