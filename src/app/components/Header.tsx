"use client";

import Link from "next/link";
import ConnectWalletButton from "./ConnectWalletButton";


export default function Header() {
	return (
		<header className="bg-white shadow-md fixed top-0 left-0 right-0">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<Link href="/" className="flex-shrink-0">
							<img className="h-8 w-8" src="/placeholder.svg?height=32&width=32" alt="Logo" />
						</Link>
						<div className="hidden md:block">
							<div className="ml-10 flex items-baseline space-x-4">
								<Link href="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
								<Link href="/marketplace" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Marketplace</Link>
								<Link href="/portfolio" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Portfolio</Link>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-6 justify-end m-4">
						<ConnectWalletButton />
					</div>

				</div>
			</div>
		</header>
	)
}