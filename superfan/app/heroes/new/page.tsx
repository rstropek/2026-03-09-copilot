import Link from "next/link";
import HeroForm from "./HeroForm";
import styles from "./HeroForm.module.css";

export default function NewHeroPage() {
	return (
		<div className={styles.container}>
			<header className={styles.header}>
				<Link href="/" className={styles.logo}>
					SUPERFAN
				</Link>
			</header>
			<main className={styles.main}>
				<HeroForm />
			</main>
		</div>
	);
}
