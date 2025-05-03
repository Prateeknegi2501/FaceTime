import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";

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
    name: name,
    username: username,
    password: hashedPassword,
  });
  await newUser.save();
  res
    .status(httpStatus.CREATED)
    .json({ message: "User Registered Successfully" });
};

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
  if (await bcrypt.compare(password, user.password)) {
    let token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();
    return res
      .status(httpStatus.OK)
      .json({ message: "Login Successfully", token: token });
  } else {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "Invalid Username or Password" });
  }

  return res
    .status(httpStatus.UNAUTHORIZED)
    .json({ message: "Invalid password" });
};

export { register, login };
