import Link from 'next/link'

export default function Header() {
    return (
        <header className="flex flex-col gap-4 items-center">
            <h1>React ❤️ Next.js</h1>
            <nav className="flex gap-4">
                <Link href="/" className="hover:underline">Intro</Link>
                <Link href="/produtos" className="hover:underline">Produtos</Link>
            </nav>
        </header>
    )
}