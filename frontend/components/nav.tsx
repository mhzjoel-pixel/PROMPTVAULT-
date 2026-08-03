import Link from 'next/link';
export function Nav(){return <nav className="mx-auto flex max-w-7xl items-center justify-between p-6"><Link href="/" className="text-2xl font-black text-aqua">AttendX</Link><div className="flex gap-4 text-sm"><Link href="/events">Events</Link><Link href="/dashboard">Dashboard</Link><Link href="/verify">World ID</Link><Link href="/admin">Admin</Link></div></nav>}
