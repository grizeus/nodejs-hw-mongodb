import { registerUser } from "../services/auth.js";

export const registerController = async (req, res) => {
  await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: "Successfully registered a user",
  });
};

export const loginController = async (req, res) => {
  await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: "Successfully registered a user",
  });
};
