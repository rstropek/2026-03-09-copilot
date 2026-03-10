"use client";

import { useRouter } from "next/navigation";
import { formatRealName, renderStarRating } from "../../lib/heroFormatters";
import type { Hero } from "../../types/hero";
import styles from "./HeroList.module.css";

interface HeroListProps {
	heroes: Hero[];
	nameFilter?: string;
}

export default function HeroList({ heroes, nameFilter }: HeroListProps) {
	const router = useRouter();

	function handleFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		const params = new URLSearchParams();
		if (value) params.set("name", value);
		router.push(`/heroes${value ? `?${params.toString()}` : ""}`);
	}

	return (
		<>
			<div className={styles.filterRow}>
				<input
					type="search"
					placeholder="Filter by hero name…"
					defaultValue={nameFilter ?? ""}
					onChange={handleFilterChange}
					className={styles.filterInput}
					aria-label="Filter heroes by name"
				/>
			</div>
			{heroes.length === 0 ? (
				<div className={styles.empty}>
					<p>No heroes found.</p>
				</div>
			) : (
				<ul className={styles.grid}>
					{heroes.map((hero) => (
						<li key={hero.id} className={styles.card}>
							<div className={styles.heroName}>{hero.name}</div>
							<div className={styles.detail}>
								<span className={styles.detailLabel}>Real Name</span>
								<span>{formatRealName(hero.real_name)}</span>
							</div>
							<div className={styles.detail}>
								<span className={styles.detailLabel}>First Appearance</span>
								<span>{hero.first_appearance}</span>
							</div>
							{hero.super_powers.length > 0 && (
								<div className={styles.tags}>
									{hero.super_powers.map((power) => (
										<span key={power} className={styles.tag}>
											{power}
										</span>
									))}
								</div>
							)}
							<div
								className={styles.stars}
								role="img"
								aria-label={`Coolness: ${hero.coolness_factor} out of 5`}
							>
								{renderStarRating(hero.coolness_factor)}
							</div>
						</li>
					))}
				</ul>
			)}
		</>
	);
}
