export function renderStarRating(coolness: number): string {
	const filled = Math.max(0, Math.min(5, Math.round(coolness)));
	return "★".repeat(filled) + "☆".repeat(5 - filled);
}

export function formatRealName(realName: string | null): string {
	if (!realName || realName.trim() === "") return "Unknown";
	return realName;
}
