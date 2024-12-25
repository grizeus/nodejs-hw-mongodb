import { loginUser, logoutUser, registerUser } from "../services/auth.js";

export const registerController = async (req, res) => {
  await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: "Successfully registered a user",
  });
};

export const loginController = async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + session.refreshTokenValidUntil),
  });

  res.cookie("sessionId", session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + session.refreshTokenValidUntil),
  });

  res.json({
    status: 200,
    message: "User succesfully loged in",
    data: {
      accessToken: session.accessToken,
    },
  });
};
export const logoutController = async (req, res) => {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie("sessionId");
  res.clearCookie("refreshToken");

  res.status(204).send();
};
