"use client";

import { useState } from "react";
import type { Hero } from "../../../types/hero";
import styles from "./HeroForm.module.css";

export default function HeroForm() {
	const [name, setName] = useState("");
	const [realName, setRealName] = useState("");
	const [firstAppearance, setFirstAppearance] = useState("");
	const [powerInput, setPowerInput] = useState("");
	const [powers, setPowers] = useState<string[]>([]);
	const [coolness, setCoolness] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [createdHero, setCreatedHero] = useState<Hero | null>(null);

	function addPower() {
		const trimmed = powerInput.trim();
		if (trimmed && !powers.includes(trimmed)) {
			setPowers([...powers, trimmed]);
			setPowerInput("");
		}
	}

	function removePower(index: number) {
		setPowers(powers.filter((_, i) => i !== index));
	}

	function handlePowerKeyDown(e: React.KeyboardEvent) {
		if (e.key === "Enter") {
			e.preventDefault();
			addPower();
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const res = await fetch("/api/heroes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name,
					real_name: realName || null,
					first_appearance: firstAppearance,
					super_powers: powers,
					coolness_factor: coolness,
				}),
			});

			if (!res.ok) {
				const data = await res.json();
				setError(data.error || "Something went wrong");
				return;
			}

			const hero: Hero = await res.json();
			setCreatedHero(hero);
		} catch {
			setError("Failed to create hero");
		} finally {
			setSubmitting(false);
		}
	}

	function resetForm() {
		setName("");
		setRealName("");
		setFirstAppearance("");
		setPowerInput("");
		setPowers([]);
		setCoolness(0);
		setError("");
		setCreatedHero(null);
	}

	if (createdHero) {
		return (
			<div className={styles.panel}>
				<h2 className={styles.title}>Hero Created!</h2>
				<div className={styles.heroCard}>
					<div className={styles.heroName}>{createdHero.name}</div>
					{createdHero.real_name && (
						<div className={styles.heroDetail}>
							<strong>Real Name:</strong> {createdHero.real_name}
						</div>
					)}
					<div className={styles.heroDetail}>
						<strong>First Appearance:</strong> {createdHero.first_appearance}
					</div>
					{createdHero.super_powers.length > 0 && (
						<div className={styles.tags}>
							{createdHero.super_powers.map((power) => (
								<span key={power} className={styles.tag}>
									{power}
								</span>
							))}
						</div>
					)}
					<div className={styles.heroStars}>
						{"★".repeat(createdHero.coolness_factor)}
						{"☆".repeat(5 - createdHero.coolness_factor)}
					</div>
				</div>
				<button type="button" className={styles.resetBtn} onClick={resetForm}>
					CREATE ANOTHER
				</button>
			</div>
		);
	}

	return (
		<form className={styles.panel} onSubmit={handleSubmit}>
			<h2 className={styles.title}>New Hero</h2>

			<div className={styles.field}>
				<label className={styles.label} htmlFor="name">
					Hero Name
				</label>
				<input
					id="name"
					className={styles.input}
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>
			</div>

			<div className={styles.field}>
				<label className={styles.label} htmlFor="realName">
					Real Name (optional)
				</label>
				<input
					id="realName"
					className={styles.input}
					type="text"
					value={realName}
					onChange={(e) => setRealName(e.target.value)}
				/>
			</div>

			<div className={styles.field}>
				<label className={styles.label} htmlFor="firstAppearance">
					First Appearance
				</label>
				<input
					id="firstAppearance"
					className={styles.input}
					type="text"
					value={firstAppearance}
					onChange={(e) => setFirstAppearance(e.target.value)}
					required
				/>
			</div>

			<div className={styles.field}>
				<label className={styles.label} htmlFor="powerInput">
					Super Powers
				</label>
				<div className={styles.powerRow}>
					<input
						id="powerInput"
						className={styles.input}
						type="text"
						value={powerInput}
						onChange={(e) => setPowerInput(e.target.value)}
						onKeyDown={handlePowerKeyDown}
						placeholder="Type a power..."
					/>
					<button type="button" className={styles.addBtn} onClick={addPower}>
						ADD
					</button>
				</div>
				{powers.length > 0 && (
					<div className={styles.tags}>
						{powers.map((power, i) => (
							<span key={power} className={styles.tag}>
								{power}
								<button
									type="button"
									className={styles.tagRemove}
									onClick={() => removePower(i)}
									aria-label={`Remove ${power}`}
								>
									×
								</button>
							</span>
						))}
					</div>
				)}
			</div>

			<div className={styles.field}>
				<span className={styles.label}>Coolness Factor</span>
				<div className={styles.stars}>
					{[1, 2, 3, 4, 5].map((n) => (
						<button
							key={n}
							type="button"
							className={`${styles.star} ${n <= coolness ? styles.starFilled : ""}`}
							onClick={() => setCoolness(n)}
							aria-label={`${n} star${n > 1 ? "s" : ""}`}
						>
							{n <= coolness ? "★" : "☆"}
						</button>
					))}
				</div>
			</div>

			{error && <p className={styles.error}>{error}</p>}

			<button type="submit" className={styles.submitBtn} disabled={submitting}>
				{submitting ? "CREATING..." : "CREATE HERO"}
			</button>
		</form>
	);
}
