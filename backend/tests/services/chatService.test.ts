import {
  handleChatMessage,
  isSlashCommand,
} from "../../src/services/chatService";

describe("Chat Service", () => {
  describe("isSlashCommand", () => {
    it("should return true for messages starting with /", () => {
      expect(isSlashCommand("/start")).toBe(true);
      expect(isSlashCommand("/test")).toBe(true);
      expect(isSlashCommand("/help")).toBe(true);
    });

    it("should return false for messages not starting with /", () => {
      expect(isSlashCommand("hello")).toBe(false);
      expect(isSlashCommand("how are you")).toBe(false);
      expect(isSlashCommand("")).toBe(false);
      expect(isSlashCommand(" /test")).toBe(false); // space before slash
    });

    it("should handle edge cases", () => {
      expect(isSlashCommand("/")).toBe(true);
      expect(isSlashCommand("//")).toBe(true);
      expect(isSlashCommand("/ ")).toBe(true);
    });
  });

  describe("handleChatMessage", () => {
    it("should return null for slash commands", async () => {
      const result = await handleChatMessage(123456789, "/start");
      expect(result).toBeNull();
    });

    it("should return placeholder response for regular chat messages", async () => {
      const result = await handleChatMessage(123456789, "Hallo, hoe gaat het?");

      expect(result).toBe(
        "I'm currently focused on calendar functionality. Please use /help to see available commands.",
      );
    });

    it("should handle empty messages", async () => {
      const result = await handleChatMessage(123456789, "");
      expect(result).toBeNull();
    });

    it("should handle whitespace-only messages", async () => {
      const result = await handleChatMessage(123456789, "   ");
      expect(result).toBeNull();
    });
  });
});
