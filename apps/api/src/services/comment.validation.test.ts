import { validateCreateComment } from "./comment.validation";

describe("validateCreateComment", () => {
  it("trims valid comment content", () => {
    expect(validateCreateComment({ content: "  It is fixed.  " })).toEqual({
      content: "It is fixed.",
    });
  });

  it.each(["", "   ", "\n\t"])(
    "rejects empty or whitespace-only content",
    (content) => {
      expect(() => validateCreateComment({ content })).toThrow();
    }
  );

  it("rejects a missing or non-string content value", () => {
    expect(() => validateCreateComment({})).toThrow();
    expect(() => validateCreateComment({ content: 42 })).toThrow();
  });

  it("does not include request-supplied authorId in parsed input", () => {
    expect(
      validateCreateComment({
        content: "A comment",
        authorId: "another-user",
      })
    ).toEqual({ content: "A comment" });
  });
});
