import jwt from "jsonwebtoken";
import { bad } from "../utils/response.js";

export function auth(required = false) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      if (required) return bad(res, "Missing token", 401);
      req.user = null;
      return next();
    }
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.sub, role: payload.role, email: payload.email };
      return next();
    } catch (e) {
      console.error("Invalid token");
      return bad(res, "Invalid token", 401);
    }
  };
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role)
      return res.status(403).json({ error: "Forbidden" });
    return next();
  };
}

export function requireRoles(roles) {
  return (req, res, next) => {
    if (!req.user) return bad(res, "Unauthorized", 401);
    if (!roles.includes(req.user.role)) return bad(res, "Forbidden", 403);
    return next();
  };
}

export function notRequireRole(role) {
  return (req, res, next) => {
    if (!req.user) return bad(res, "Unauthorized", 401);
    if (req.user.role === role) return bad(res, "Forbidden", 403);
    return next();
  };
}

export function notRequireRoles(roles) {
  return (req, res, next) => {
    if (!req.user) return bad(res, "Unauthorized", 401);
    if (roles.includes(req.user.role)) return bad(res, "Forbidden", 403);
    return next();
  };
}
