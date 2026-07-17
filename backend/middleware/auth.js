import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies?.gplkltn_token;
  if (!token) {
    return res.status(401).json({ error: "Belum login. Silakan login dulu." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Sesi login tidak valid atau sudah kedaluwarsa." });
  }
}
