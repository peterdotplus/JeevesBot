import request from "supertest";
import express from "express";
import { authenticate, AuthenticatedRequest } from "../src/middleware/auth";

// Mock config
const mockConfig = {
  authentication: {
    users: [
      {
        username: "admin",
        password: "password123",
        role: "admin",
      },
      {
        username: "user",
        password: "userpass",
        role: "user",
      },
    ],
  },
};

describe("Authentication Middleware", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Mock app.locals.config
    app.locals.config = mockConfig;

    // Add authentication middleware
    app.use(authenticate);

    // Test endpoint
    app.get("/test", (req: AuthenticatedRequest, res) => {
      res.status(200).json({
        success: true,
        user: req.user,
      });
    });
  });

  describe("URL Parameter Authentication", () => {
    it("should authenticate with valid username and password in URL parameters", async () => {
      const response = await request(app)
        .get("/test")
        .query({ username: "admin", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        username: "admin",
        role: "admin",
      });
    });

    it("should authenticate with different user credentials in URL parameters", async () => {
      const response = await request(app)
        .get("/test")
        .query({ username: "user", password: "userpass" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        username: "user",
        role: "user",
      });
    });

    it("should reject authentication with invalid username in URL parameters", async () => {
      const response = await request(app)
        .get("/test")
        .query({ username: "wronguser", password: "password123" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should reject authentication with invalid password in URL parameters", async () => {
      const response = await request(app)
        .get("/test")
        .query({ username: "admin", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should reject authentication with missing username in URL parameters", async () => {
      const response = await request(app)
        .get("/test")
        .query({ password: "password123" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Authentication required");
    });

    it("should reject authentication with missing password in URL parameters", async () => {
      const response = await request(app)
        .get("/test")
        .query({ username: "admin" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Authentication required");
    });
  });

  describe("Basic Auth Header Authentication", () => {
    it("should authenticate with valid Basic Auth header", async () => {
      const response = await request(app)
        .get("/test")
        .set(
          "Authorization",
          "Basic " + Buffer.from("admin:password123").toString("base64"),
        );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        username: "admin",
        role: "admin",
      });
    });

    it("should reject invalid Basic Auth header format", async () => {
      const response = await request(app)
        .get("/test")
        .set("Authorization", "Bearer token");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Authentication required");
    });

    it("should reject malformed Basic Auth credentials", async () => {
      const response = await request(app)
        .get("/test")
        .set(
          "Authorization",
          "Basic " + Buffer.from("malformed").toString("base64"),
        );

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain("Authentication required");
    });
  });

  describe("Authentication Priority", () => {
    it("should prioritize URL parameters over Basic Auth header", async () => {
      const response = await request(app)
        .get("/test")
        .query({ username: "user", password: "userpass" })
        .set(
          "Authorization",
          "Basic " + Buffer.from("admin:password123").toString("base64"),
        );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        username: "user",
        role: "user",
      });
    });
  });
});
