import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Register user
const register = async (req, res) => {
  const { username, name, password } = req.body;

  if (!username || !name || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "All fields are required" });
  }

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res
      .status(httpStatus.FOUND)
      .json({ message: "User Already Registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    username,
    password: hashedPassword,
  });

  await newUser.save();
  res
    .status(httpStatus.CREATED)
    .json({ message: "User Registered Successfully" });
};

// Login user
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: "Please Provide all data" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({ message: "User not Found" });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "Invalid Username or Password" });
  }

  const token = crypto.randomBytes(20).toString("hex");
  user.token = token;
  await user.save();

  res
    .status(httpStatus.OK)
    .json({ message: "Login Successfully", token, user: user.name });
};

// Get user meeting history
const getUserHistory = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not Found" });
    }

    const meetings = await Meeting.find({ userId: user._id });
    res.status(httpStatus.OK).json({ message: "User History", meetings });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

// Add meeting to user history
const addToHistory = async (req, res) => {
  const { token, meetingCode } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not Found" });
    }

    const meeting = new Meeting({
      userId: user._id,
      meetingCode,
    });

    await meeting.save();
    res
      .status(httpStatus.CREATED)
      .json({ message: "Meeting Added to History" });
  } catch (error) {
    res
      .status(httpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export { register, login, getUserHistory, addToHistory };
