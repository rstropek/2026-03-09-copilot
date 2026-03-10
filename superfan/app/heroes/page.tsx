import Link from "next/link";
import { getAllHeroes } from "../../data/heroes";
import HeroList from "./HeroList";
import styles from "./HeroList.module.css";

export default function HeroesPage() {
	const heroes = getAllHeroes();

	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<Link href="/" className={styles.logo}>
					SUPERFAN
				</Link>
			</header>
			<main className={styles.main}>
				<h1 className={styles.title}>All Heroes</h1>
				<HeroList heroes={heroes} />
			</main>
		</div>
	);
}
