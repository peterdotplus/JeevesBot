import {
  getConfig,
  getEnvironmentConfig,
  getAuthCredentials,
  getApiEndpoints,
  getAppConfig,
  buildAuthenticatedUrl,
} from "@/utils/config";

// Mock the config.json file
jest.mock(
  "@/config.json",
  () => ({
    name: "JeevesBot Frontend Configuration",
    description: "Configuration file for the JeevesBot frontend application",
    version: "1.0.0",
    environment: {
      development: {
        BACKEND_URL: "http://localhost:3001",
        NEXT_PUBLIC_APP_NAME: "JeevesBot Calendar (Development)",
        NODE_ENV: "development",
      },
      production: {
        BACKEND_URL: "https://api.example.com",
        NEXT_PUBLIC_APP_NAME: "JeevesBot Calendar",
        NODE_ENV: "production",
      },
      staging: {
        BACKEND_URL: "https://staging.api.example.com",
        NEXT_PUBLIC_APP_NAME: "JeevesBot Calendar (Staging)",
        NODE_ENV: "production",
      },
    },
    authentication: {
      backendCredentials: {
        username: "test-user",
        password: "test-password",
        note: "Test credentials",
      },
      frontendLogin: {
        enabled: true,
        sessionTimeout: 86400000,
        note: "Frontend login configuration",
      },
    },
    app: {
      name: "JeevesBot Calendar",
      description: "Test application description",
      version: "1.0.0",
      theme: {
        primaryColor: "#3b82f6",
        secondaryColor: "#6b7280",
        accentColor: "#10b981",
      },
      features: {
        pwa: true,
        offlineSupport: false,
        pushNotifications: false,
        darkMode: false,
      },
    },
    api: {
      endpoints: {
        appointments: {
          get: "/api/appointments",
          create: "/api/appointments",
          delete: "/api/appointments/[id]",
        },
      },
      timeout: 10000,
      retryAttempts: 3,
    },
    pwa: {
      manifest: {
        name: "JeevesBot Calendar",
        short_name: "JeevesBot",
        description: "Test PWA manifest",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#3b82f6",
        orientation: "portrait",
        scope: "/",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
        categories: ["productivity", "business"],
        lang: "en",
      },
    },
    development: {
      hotReload: true,
      sourceMaps: true,
      analyzeBundle: false,
      port: 3000,
    },
    notes: ["Test configuration note"],
  }),
  { virtual: true },
);

describe("Configuration Utility", () => {
  describe("getConfig", () => {
    it("should return configuration for current environment", () => {
      // Mock window.location for client-side environment detection
      Object.defineProperty(window, "location", {
        value: {
          hostname: "localhost",
        },
        writable: true,
      });

      const config = getConfig();

      expect(config).toBeDefined();
      expect(config.BACKEND_URL).toBe("http://localhost:3001");
      expect(config.NEXT_PUBLIC_APP_NAME).toBe(
        "JeevesBot Calendar (Development)",
      );
      expect(config.NODE_ENV).toBe("development");
      expect(config.authentication.backendCredentials.username).toBe(
        "test-user",
      );
      expect(config.app.name).toBe("JeevesBot Calendar");
      expect(config.api.timeout).toBe(10000);
    });

    it("should use production configuration for non-localhost domains", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "app.example.com",
        },
        writable: true,
      });

      const config = getConfig();

      expect(config.BACKEND_URL).toBe("https://api.example.com");
      expect(config.NEXT_PUBLIC_APP_NAME).toBe("JeevesBot Calendar");
      expect(config.NODE_ENV).toBe("production");
    });

    it("should use staging configuration for staging domains", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "staging.example.com",
        },
        writable: true,
      });

      const config = getConfig();

      expect(config.BACKEND_URL).toBe("https://staging.api.example.com");
      expect(config.NEXT_PUBLIC_APP_NAME).toBe("JeevesBot Calendar (Staging)");
      expect(config.NODE_ENV).toBe("production");
    });
  });

  describe("getEnvironmentConfig", () => {
    it("should return specific environment configuration", () => {
      const devConfig = getEnvironmentConfig("development");
      expect(devConfig.BACKEND_URL).toBe("http://localhost:3001");
      expect(devConfig.NEXT_PUBLIC_APP_NAME).toBe(
        "JeevesBot Calendar (Development)",
      );

      const prodConfig = getEnvironmentConfig("production");
      expect(prodConfig.BACKEND_URL).toBe("https://api.example.com");
      expect(prodConfig.NEXT_PUBLIC_APP_NAME).toBe("JeevesBot Calendar");

      const stagingConfig = getEnvironmentConfig("staging");
      expect(stagingConfig.BACKEND_URL).toBe("https://staging.api.example.com");
      expect(stagingConfig.NEXT_PUBLIC_APP_NAME).toBe(
        "JeevesBot Calendar (Staging)",
      );
    });

    it("should default to current environment when no parameter provided", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "localhost",
        },
        writable: true,
      });

      const config = getEnvironmentConfig();
      expect(config.BACKEND_URL).toBe("http://localhost:3001");
    });
  });

  describe("getAuthCredentials", () => {
    it("should return authentication credentials", () => {
      const auth = getAuthCredentials();

      expect(auth).toBeDefined();
      expect(auth.username).toBe("test-user");
      expect(auth.password).toBe("test-password");
      expect(auth.note).toBe("Test credentials");
    });

    describe("buildAuthenticatedUrl", () => {
      it("should build URL with username and password parameters", () => {
        const baseUrl = "http://localhost:3001";
        const path = "/api/appointments";

        const url = buildAuthenticatedUrl(baseUrl, path);

        expect(url).toBe(
          "http://localhost:3001/api/appointments?username=test-user&password=test-password",
        );
      });

      it("should build URL with path parameters and existing query string", () => {
        const baseUrl = "http://localhost:3001";
        const path = "/api/appointments/123?filter=active";

        const url = buildAuthenticatedUrl(baseUrl, path);

        expect(url).toBe(
          "http://localhost:3001/api/appointments/123?filter=active&username=test-user&password=test-password",
        );
      });

      it("should build URL for production environment", () => {
        const baseUrl = "https://api.example.com";
        const path = "/api/appointments";

        const url = buildAuthenticatedUrl(baseUrl, path);

        expect(url).toBe(
          "https://api.example.com/api/appointments?username=test-user&password=test-password",
        );
      });

      it("should handle paths with trailing slash", () => {
        const baseUrl = "http://localhost:3001";
        const path = "/api/appointments/";

        const url = buildAuthenticatedUrl(baseUrl, path);

        expect(url).toBe(
          "http://localhost:3001/api/appointments/?username=test-user&password=test-password",
        );
      });
    });
  });

  describe("getApiEndpoints", () => {
    it("should return API endpoints configuration", () => {
      const endpoints = getApiEndpoints();

      expect(endpoints).toBeDefined();
      expect(endpoints.appointments.get).toBe("/api/appointments");
      expect(endpoints.appointments.create).toBe("/api/appointments");
      expect(endpoints.appointments.delete).toBe("/api/appointments/[id]");
    });
  });

  describe("getAppConfig", () => {
    it("should return application configuration", () => {
      const appConfig = getAppConfig();

      expect(appConfig).toBeDefined();
      expect(appConfig.name).toBe("JeevesBot Calendar");
      expect(appConfig.description).toBe("Test application description");
      expect(appConfig.version).toBe("1.0.0");
      expect(appConfig.theme.primaryColor).toBe("#3b82f6");
      expect(appConfig.features.pwa).toBe(true);
    });
  });

  describe("Environment Detection", () => {
    it("should detect development environment for localhost", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "localhost",
        },
        writable: true,
      });

      const config = getConfig();
      expect(config.BACKEND_URL).toBe("http://localhost:3001");
    });

    it("should detect development environment for 127.0.0.1", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "127.0.0.1",
        },
        writable: true,
      });

      const config = getConfig();
      expect(config.BACKEND_URL).toBe("http://localhost:3001");
    });

    it("should detect staging environment for staging subdomains", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "staging.example.com",
        },
        writable: true,
      });

      const config = getConfig();
      expect(config.BACKEND_URL).toBe("https://staging.api.example.com");
    });

    it("should detect production environment for other domains", () => {
      Object.defineProperty(window, "location", {
        value: {
          hostname: "app.example.com",
        },
        writable: true,
      });

      const config = getConfig();
      expect(config.BACKEND_URL).toBe("https://api.example.com");
    });
  });

  describe("Server-side Environment Detection", () => {
    // Save original process.env
    const originalEnv = process.env.NODE_ENV;
    const originalWindow = global.window;

    beforeEach(() => {
      // Mock server-side by removing window
      delete (global as any).window;
    });

    afterEach(() => {
      // Restore original process.env and window
      process.env.NODE_ENV = originalEnv;
      global.window = originalWindow;
    });

    it("should use NODE_ENV for server-side detection", () => {
      process.env.NODE_ENV = "production";

      const config = getConfig();
      expect(config.BACKEND_URL).toBe("https://api.example.com");
    });

    it("should default to development when NODE_ENV is not set", () => {
      // Remove NODE_ENV entirely
      delete process.env.NODE_ENV;

      const config = getConfig();
      expect(config.BACKEND_URL).toBe("http://localhost:3001");
    });

    it("should use development when NODE_ENV is development", () => {
      process.env.NODE_ENV = "development";

      const config = getConfig();
      expect(config.BACKEND_URL).toBe("http://localhost:3001");
    });
  });
});
