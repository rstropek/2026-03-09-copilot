"use client";

import { marked } from "marked";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Chat.module.css";

marked.setOptions({ async: false, breaks: true });

let nextId = 0;

interface Message {
	id: number;
	role: "user" | "assistant";
	content: string;
	toolCalls?: string[];
}

export default function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [responseId, setResponseId] = useState<string | null>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [scrollToBottom]);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = input.trim();
		if (!trimmed || isLoading) return;

		const userMessage: Message = {
			id: nextId++,
			role: "user",
			content: trimmed,
		};
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const res = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					message: trimmed,
					previousResponseId: responseId,
				}),
			});

			if (!res.ok) {
				const errData = await res.json();
				setMessages((prev) => [
					...prev,
					{
						id: nextId++,
						role: "assistant",
						content: errData.error || "Something went wrong.",
					},
				]);
				setIsLoading(false);
				return;
			}

			const reader = res.body?.getReader();
			if (!reader) return;

			const decoder = new TextDecoder();
			let assistantContent = "";
			const toolNames: string[] = [];
			let buffer = "";

			// Add empty assistant message to stream into
			const assistantId = nextId++;
			setMessages((prev) => [
				...prev,
				{ id: assistantId, role: "assistant", content: "", toolCalls: [] },
			]);

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				// Keep the last potentially incomplete line in the buffer
				buffer = lines.pop() ?? "";

				let eventType = "";
				for (const line of lines) {
					if (line.startsWith("event: ")) {
						eventType = line.slice(7);
					} else if (line.startsWith("data: ")) {
						const data = JSON.parse(line.slice(6)) as string;

						if (eventType === "text") {
							assistantContent += data;
							const currentContent = assistantContent;
							const currentTools = [...toolNames];
							setMessages((prev) =>
								prev.map((m) =>
									m.id === assistantId
										? { ...m, content: currentContent, toolCalls: currentTools }
										: m,
								),
							);
						} else if (eventType === "tool") {
							toolNames.push(data);
							const currentContent = assistantContent;
							const currentTools = [...toolNames];
							setMessages((prev) =>
								prev.map((m) =>
									m.id === assistantId
										? { ...m, content: currentContent, toolCalls: currentTools }
										: m,
								),
							);
						} else if (eventType === "response_id") {
							setResponseId(data);
						}
					}
				}
			}
		} catch {
			setMessages((prev) => [
				...prev,
				{
					id: nextId++,
					role: "assistant",
					content: "Failed to reach the AI. Try again.",
				},
			]);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className={styles.container}>
			<div className={styles.messages}>
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={`${styles.messageRow} ${
							msg.role === "user"
								? styles.messageRowUser
								: styles.messageRowAssistant
						}`}
					>
						<div
							className={`${styles.bubble} ${
								msg.role === "user" ? styles.bubbleUser : styles.bubbleAssistant
							}`}
						>
							{msg.toolCalls && msg.toolCalls.length > 0 && (
								<div style={{ marginBottom: 8 }}>
									{msg.toolCalls.map((tool) => (
										<span key={tool} className={styles.toolIndicator}>
											⚡ {tool}
										</span>
									))}
								</div>
							)}
							{msg.role === "assistant" && msg.content ? (
								<div
									className={styles.markdown}
									// biome-ignore lint/security/noDangerouslySetInnerHtml: content is from OpenAI API, not user input
									dangerouslySetInnerHTML={{
										__html: marked.parse(msg.content) as string,
									}}
								/>
							) : (
								msg.content
							)}
							{msg.role === "assistant" && !msg.content && isLoading && (
								<span className={styles.loading}>Thinking...</span>
							)}
						</div>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>
			<form className={styles.inputBar} onSubmit={handleSubmit}>
				<input
					className={styles.input}
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Ask about heroes..."
					disabled={isLoading}
				/>
				<button
					className={styles.sendBtn}
					type="submit"
					disabled={isLoading || !input.trim()}
				>
					SEND
				</button>
			</form>
		</div>
	);
}
