import Chat from "./Chat";

export default function ChatPage() {
	return (
		<div
			style={{
				minHeight: "100vh",
				display: "flex",
				flexDirection: "column",
				backgroundColor: "#f5f5f0",
			}}
		>
			<header
				style={{
					backgroundColor: "#0d1b2a",
					padding: "20px 40px",
					borderBottom: "3px solid #000",
					boxShadow: "3px 3px 0 #000",
				}}
			>
				<span
					style={{
						fontFamily: "var(--font-bangers)",
						fontSize: "2rem",
						letterSpacing: "0.08em",
						color: "#ffe600",
						textShadow: "-2px 0 #00e5ff, 2px 0 #ff2d78",
					}}
				>
					SUPERFAN AI
				</span>
			</header>
			<Chat />
		</div>
	);
}
