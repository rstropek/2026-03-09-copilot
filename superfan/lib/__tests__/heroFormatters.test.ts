import { describe, expect, it } from "vitest";
import { formatRealName, renderStarRating } from "../heroFormatters";

describe("renderStarRating", () => {
	it("returns 5 empty stars for 0", () => {
		expect(renderStarRating(0)).toBe("☆☆☆☆☆");
	});

	it("returns 1 filled star for 1", () => {
		expect(renderStarRating(1)).toBe("★☆☆☆☆");
	});

	it("returns 5 filled stars for 5", () => {
		expect(renderStarRating(5)).toBe("★★★★★");
	});

	it("returns 3 filled stars for 3", () => {
		expect(renderStarRating(3)).toBe("★★★☆☆");
	});

	it("clamps values below 0 to 0", () => {
		expect(renderStarRating(-1)).toBe("☆☆☆☆☆");
	});

	it("clamps values above 5 to 5", () => {
		expect(renderStarRating(10)).toBe("★★★★★");
	});
});

describe("formatRealName", () => {
	it("returns 'Unknown' for null", () => {
		expect(formatRealName(null)).toBe("Unknown");
	});

	it("returns 'Unknown' for empty string", () => {
		expect(formatRealName("")).toBe("Unknown");
	});

	it("returns 'Unknown' for whitespace-only string", () => {
		expect(formatRealName("   ")).toBe("Unknown");
	});

	it("returns the name when a valid name is provided", () => {
		expect(formatRealName("Peter Parker")).toBe("Peter Parker");
	});
});
