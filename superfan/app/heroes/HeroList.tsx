"use client";

import { formatRealName, renderStarRating } from "../../lib/heroFormatters";
import type { Hero } from "../../types/hero";
import styles from "./HeroList.module.css";

interface HeroListProps {
	heroes: Hero[];
}

export default function HeroList({ heroes }: HeroListProps) {
	if (heroes.length === 0) {
		return (
			<div className={styles.empty}>
				<p>No heroes yet. Be the first to add one!</p>
			</div>
		);
	}

	return (
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
	);
}
