import {
  addUserMessage,
  addAssistantMessage,
  getUserConversationHistory,
  clearUserConversation,
  formatConversationHistoryForPrompt,
  initializeConversationMemory,
  clearInMemoryData,
  ConversationMessage,
} from "../../src/services/conversationMemoryService";
import fs from "fs";
import path from "path";

// Mock the file system operations
jest.mock("fs");
jest.mock("path");

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedPath = path as jest.Mocked<typeof path>;

describe("Conversation Memory Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the in-memory data for tests
    clearInMemoryData();
  });

  describe("initializeConversationMemory", () => {
    it("should create data directory and file if they don't exist", () => {
      mockedFs.existsSync.mockReturnValue(false);
      mockedPath.join.mockReturnValue("/test/data/conversation-memory.json");
      mockedPath.dirname.mockReturnValue("/test/data");

      initializeConversationMemory();

      expect(mockedFs.mkdirSync).toHaveBeenCalledWith("/test/data", {
        recursive: true,
      });
      expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
        "/test/data/conversation-memory.json",
        JSON.stringify({}, null, 2),
        "utf-8",
      );
    });

    it("should not create file if it already exists", () => {
      mockedFs.existsSync.mockReturnValue(true);

      initializeConversationMemory();

      expect(mockedFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe("addUserMessage", () => {
    it("should add a user message to conversation history", () => {
      const userId = 123456789;
      const message = "Hello, how are you?";

      addUserMessage(userId, message);

      const history = getUserConversationHistory(userId);
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        role: "user",
        content: message,
        timestamp: expect.any(String),
      });
    });

    it("should create new conversation for new user", () => {
      const userId = 987654321;
      const message = "First message";

      addUserMessage(userId, message);

      const history = getUserConversationHistory(userId);
      expect(history).toHaveLength(1);
      expect(history[0]?.content).toBe(message);
    });
  });

  describe("addAssistantMessage", () => {
    it("should add an assistant message to conversation history", () => {
      const userId = 123456789;
      const message = "I'm doing well, thank you!";

      addAssistantMessage(userId, message);

      const history = getUserConversationHistory(userId);
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        role: "assistant",
        content: message,
        timestamp: expect.any(String),
      });
    });
  });

  describe("getUserConversationHistory", () => {
    it("should return empty array for non-existent user", () => {
      const userId = 999999999;
      const history = getUserConversationHistory(userId);
      expect(history).toEqual([]);
    });

    it("should return conversation history for existing user", () => {
      const userId = 123456789;
      const userMessage = "User message";
      const assistantMessage = "Assistant response";

      addUserMessage(userId, userMessage);
      addAssistantMessage(userId, assistantMessage);

      const history = getUserConversationHistory(userId);
      expect(history).toHaveLength(2);
      expect(history[0]?.content).toBe(userMessage);
      expect(history[1]?.content).toBe(assistantMessage);
    });
  });

  describe("clearUserConversation", () => {
    it("should clear conversation history for user", () => {
      const userId = 123456789;
      addUserMessage(userId, "Test message");

      // Verify message exists
      let history = getUserConversationHistory(userId);
      expect(history).toHaveLength(1);

      // Clear conversation
      clearUserConversation(userId);

      // Verify conversation is cleared
      history = getUserConversationHistory(userId);
      expect(history).toHaveLength(0);
    });

    it("should handle clearing non-existent user conversation", () => {
      const userId = 999999999;
      expect(() => clearUserConversation(userId)).not.toThrow();
    });
  });

  describe("formatConversationHistoryForPrompt", () => {
    it("should return empty string for empty history", () => {
      const history: ConversationMessage[] = [];
      const result = formatConversationHistoryForPrompt(history);
      expect(result).toBe("");
    });

    it("should format conversation history correctly", () => {
      const history: ConversationMessage[] = [
        {
          role: "user",
          content: "Hello, how are you?",
          timestamp: "2025-01-01T00:00:00.000Z",
        },
        {
          role: "assistant",
          content: "I'm doing well, thank you!",
          timestamp: "2025-01-01T00:00:01.000Z",
        },
        {
          role: "user",
          content: "What can you help me with?",
          timestamp: "2025-01-01T00:00:02.000Z",
        },
      ];

      const result = formatConversationHistoryForPrompt(history);

      expect(result).toContain("Recent conversation:");
      expect(result).toContain("User: Hello, how are you?");
      expect(result).toContain("Assistant: I'm doing well, thank you!");
      expect(result).toContain("User: What can you help me with?");
    });

    it("should handle mixed user and assistant messages", () => {
      const history: ConversationMessage[] = [
        {
          role: "user",
          content: "First user message",
          timestamp: "2025-01-01T00:00:00.000Z",
        },
        {
          role: "assistant",
          content: "First assistant response",
          timestamp: "2025-01-01T00:00:01.000Z",
        },
        {
          role: "user",
          content: "Second user message",
          timestamp: "2025-01-01T00:00:02.000Z",
        },
      ];

      const result = formatConversationHistoryForPrompt(history);

      expect(result).toContain("User: First user message");
      expect(result).toContain("Assistant: First assistant response");
      expect(result).toContain("User: Second user message");
    });
  });

  describe("message limit", () => {
    it("should limit conversation history to maximum messages", () => {
      const userId = 123456789;
      const maxMessages = 30;

      // Add more messages than the limit
      for (let i = 0; i < maxMessages + 10; i++) {
        addUserMessage(userId, `Message ${i}`);
      }

      const history = getUserConversationHistory(userId);
      expect(history).toHaveLength(maxMessages);
      expect(history[0]?.content).toBe("Message 10"); // Should keep the last 30 messages
      expect(history[history.length - 1]?.content).toBe("Message 39");
    });
  });
});
