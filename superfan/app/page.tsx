import styles from "./page.module.css";

export default function Home() {
	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<span className={styles.logo}>SUPERFAN</span>
			</header>
			<main className={styles.main}>
				<div className={styles.panel}>
					<h1 className={styles.title}>
						Hello
						<br />
						World!
					</h1>
					<p className={styles.subtitle}>Your adventure begins here.</p>
					<div className={styles.ctas}>
						<button className={styles.btnPrimary}>GET STARTED</button>
						<button className={styles.btnSecondary}>LEARN MORE</button>
					</div>
				</div>
			</main>
		</div>
	);
}
