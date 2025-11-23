import { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    role: string;
  };
}

/**
 * Simple authentication middleware that checks for basic auth
 * and validates against hardcoded users in config
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  // Check if authentication configuration exists
  if (!req.app.locals.config?.authentication) {
    console.error("❌ Authentication configuration missing");
    return res.status(500).json({
      success: false,
      error: "Authentication configuration error",
    });
  }

  let username: string | undefined;
  let password: string | undefined;

  // Check for URL parameters first
  if (req.query.username && req.query.password) {
    username = req.query.username as string;
    password = req.query.password as string;
  }
  // Fall back to Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Basic ")
  ) {
    const authHeader = req.headers.authorization;
    const base64Credentials = authHeader.split(" ")[1];
    if (base64Credentials) {
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "ascii",
      );
      [username, password] = credentials.split(":");
    }
  }

  if (!username || !password) {
    return res.status(401).json({
      success: false,
      error:
        "Authentication required. Provide username and password as URL parameters or Basic Auth header",
    });
  }

  // Find user in config
  const users = req.app.locals.config.authentication.users;

  // Check if users array exists and has entries
  if (!users || !Array.isArray(users) || users.length === 0) {
    console.error("❌ No users configured for authentication");
    return res.status(500).json({
      success: false,
      error: "Authentication configuration error",
    });
  }

  const user = users.find(
    (u: any) => u.username === username && u.password === password,
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Invalid credentials",
    });
  }

  // Attach user to request
  req.user = {
    username: user.username,
    role: user.role,
  };

  return next();
}

/**
 * Middleware to require specific role
 */
export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
      });
    }

    return next();
  };
}
