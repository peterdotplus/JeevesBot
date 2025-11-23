import config from "../config.json";

export interface Config {
  name: string;
  description: string;
  version: string;
  environment: {
    development: EnvironmentConfig;
    production: EnvironmentConfig;
    staging: EnvironmentConfig;
  };
  authentication: {
    backendCredentials: {
      username: string;
      password: string;
      note: string;
    };
    frontendLogin: {
      enabled: boolean;
      sessionTimeout: number;
      note: string;
    };
  };
  app: {
    name: string;
    description: string;
    version: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
    };
    features: {
      pwa: boolean;
      offlineSupport: boolean;
      pushNotifications: boolean;
      darkMode: boolean;
    };
  };
  api: {
    endpoints: {
      appointments: {
        get: string;
        create: string;
        delete: string;
      };
    };
    timeout: number;
    retryAttempts: number;
  };
  pwa: {
    manifest: {
      name: string;
      short_name: string;
      description: string;
      start_url: string;
      display: string;
      background_color: string;
      theme_color: string;
      orientation: string;
      scope: string;
      icons: Array<{
        src: string;
        sizes: string;
        type: string;
      }>;
      categories: string[];
      lang: string;
    };
  };
  development: {
    hotReload: boolean;
    sourceMaps: boolean;
    analyzeBundle: boolean;
    port: number;
  };
  notes: string[];
}

export interface EnvironmentConfig {
  BACKEND_URL: string;
  NEXT_PUBLIC_APP_NAME: string;
  NODE_ENV: string;
}

// Determine current environment
const getCurrentEnvironment = (): "development" | "production" | "staging" => {
  if (typeof window !== "undefined") {
    // Client-side: check URL or other indicators
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "development";
    } else if (hostname.includes("staging")) {
      return "staging";
    } else {
      return "production";
    }
  } else {
    // Server-side: use NODE_ENV or default to development
    return process.env.NODE_ENV === "production" ? "production" : "development";
  }
};

// Get configuration for current environment
export const getConfig = (): EnvironmentConfig & {
  authentication: Config["authentication"];
  app: Config["app"];
  api: Config["api"];
} => {
  const currentEnv = getCurrentEnvironment();
  const envConfig = config.environment[currentEnv];

  return {
    BACKEND_URL: envConfig.BACKEND_URL,
    NEXT_PUBLIC_APP_NAME: envConfig.NEXT_PUBLIC_APP_NAME,
    NODE_ENV: envConfig.NODE_ENV,
    authentication: config.authentication,
    app: config.app,
    api: config.api,
  };
};

// Get specific environment configuration
export const getEnvironmentConfig = (
  environment:
    | "development"
    | "production"
    | "staging" = getCurrentEnvironment(),
): EnvironmentConfig => {
  return config.environment[environment];
};

// Get authentication credentials
export const getAuthCredentials = () => {
  return config.authentication.backendCredentials;
};

// Get API endpoints
export const getApiEndpoints = () => {
  return config.api.endpoints;
};

// Get app configuration
export const getAppConfig = () => {
  return config.app;
};

export default getConfig;
