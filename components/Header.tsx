import Image from "next/image";

export default function Header() {
  return (
    <header className="flex items-center p-4 bg-white shadow">
      <Image src="/playhop-logo.png" alt="PlayHop Logo" width={40} height={40} />
      <h1 className="ml-2 text-xl font-bold">PlayHop</h1>
    </header>
  )
}
