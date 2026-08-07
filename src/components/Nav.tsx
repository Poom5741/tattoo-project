import { useState, useEffect } from "react";
import { PasskeyWalletProvider } from "../contexts/PasskeyWalletContext";
import PasskeyNavButton from "./PasskeyNavButton";
import LanguageSwitcher from "./LanguageSwitcher";
import DevRoleSwitcher from "./DevRoleSwitcher";
import { createT, isSupportedLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

interface NavProps {
	currentPath?: string;
	locale?: Locale;
}

/**
 * Read the active locale from <html data-locale> (set by Astro SSR).
 * Locale switches reload the page (see LanguageSwitcher), so this is
 * read once at hydration via a lazy initializer — no setter needed.
 */
export default function Nav({ currentPath = "/", locale: propLocale }: NavProps) {
	const [open, setOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);

	// Localized nav labels (hrefs stay locale-independent). Read once
	// at hydration; a locale switch reloads the page (#80).
	const [locale] = useState<Locale>(propLocale || "en");
	const t = createT(locale);
	const links: [string, string][] = [
		["/market", t("nav.gallery")],
		["/artists", t("nav.artists")],
		["/booking", t("nav.book")],
		["/wallet", t("nav.myWallet")],
		["/inbox", t("nav.inbox")],
		["/artist/portal", t("nav.artistPortal")],
		["/", t("nav.howItWorks")],
	];

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<PasskeyWalletProvider>
			<header
				className={
					"w-full sticky top-0 z-50 transition-all duration-300 " +
					(scrolled
						? "bg-surface-container-low/95 backdrop-blur-md shadow-[0_1px_0_0_rgba(147,110,107,0.12)]"
						: "bg-surface-container-low")
				}
			>
				<nav className="flex justify-between items-center w-full px-5 md:px-16 py-4 max-w-container-max mx-auto">
					{/* Brand */}
					<a
						href="/"
						className="font-display text-2xl md:text-3xl font-bold tracking-tight text-on-surface"
					>
						SAKNID
					</a>

					{/* Desktop links */}
					<div className="hidden md:flex gap-8 items-center">
						{links.map(([href, label]) => {
							const isActive = currentPath === href;
							return (
								<a
									key={href}
									href={href}
									className={
										"font-body text-label-md font-semibold transition-colors duration-200 relative py-1 " +
										(isActive
											? "text-on-surface"
											: "text-on-surface-variant hover:text-on-surface")
									}
								>
									{label}
									<span
										className={
											"absolute left-0 right-0 bottom-0 h-[2px] bg-primary-container transition-transform duration-200 origin-left " +
											(isActive ? "scale-x-100" : "scale-x-0")
										}
										aria-hidden="true"
									/>
								</a>
							);
						})}
					</div>

					{/* Dev role switcher + Language switcher */}
					<div className="hidden md:flex items-center gap-2">
						<DevRoleSwitcher />
						<LanguageSwitcher />
					</div>

					{/* Right side — connect + burger */}
					<div className="flex items-center gap-4">
						<div className="hidden md:block">
							<PasskeyNavButton />
						</div>
						<button
							className="md:hidden flex items-center justify-center w-10 h-10 text-on-surface"
							onClick={() => setOpen(!open)}
							aria-label={open ? "Close menu" : "Open menu"}
							aria-expanded={open}
						>
							<span className="relative w-5 h-5">
								<span
									className={
										"absolute left-0 h-[1.5px] w-5 bg-on-surface transition-all duration-300 origin-center " +
										(open ? "top-[9px] rotate-45" : "top-[3px] rotate-0")
									}
								/>
								<span
									className={
										"absolute left-0 top-[9px] h-[1.5px] w-5 bg-on-surface transition-all duration-300 " +
										(open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100")
									}
								/>
								<span
									className={
										"absolute left-0 h-[1.5px] w-5 bg-on-surface transition-all duration-300 origin-center " +
										(open ? "top-[9px] -rotate-45" : "top-[15px] rotate-0")
									}
								/>
							</span>
						</button>
					</div>
				</nav>
			</header>

			<div
				className={
					"fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 md:hidden " +
					(open
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none")
				}
				onClick={() => setOpen(false)}
				aria-hidden="true"
			/>

			<div
				className={
					"fixed top-0 right-0 z-40 h-full w-[300px] max-w-[85vw] bg-surface-container-low shadow-2xl " +
					"flex flex-col pt-20 px-6 pb-8 " +
					"transition-transform duration-300 ease-out md:hidden " +
					(open ? "translate-x-0" : "translate-x-full")
				}
			>
				<nav className="flex flex-col gap-1">
					{links.map(([href, label]) => {
						const isActive = currentPath === href;
						return (
							<a
								key={href}
								href={href}
								onClick={() => setOpen(false)}
								className={
									"font-body text-body-lg py-3 px-3 rounded-lg transition-colors duration-200 " +
									(isActive
										? "text-on-surface bg-surface-container-high font-semibold"
										: "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60")
								}
							>
								{label}
							</a>
						);
					})}
				</nav>
				<div className="mt-6 px-3">
					<PasskeyNavButton />
				</div>
				<div className="mt-4 px-3">
					<div className="flex items-center gap-2">
						<DevRoleSwitcher />
						<LanguageSwitcher />
					</div>
				</div>
			</div>
		</PasskeyWalletProvider>
	);
}
