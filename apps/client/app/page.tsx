import Link from "next/link";
import NavBar from "@/components/NavBar";

export default function LandingPage() {
  return (
    <>
      <NavBar />
      <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16 gap-4">
        <h1 className="text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Sketch. Collaborate. Create.
        </h1>
        <p className="text-2xl text-gray-600 max-w-2xl">
          Bring your ideas to life with real-time drawing and teamwork — all in one place.
        </p>
        <Link
          href="/dashboard"
          className="bg-yellow-300 rounded-lg w-36 h-10 font-semibold flex items-center justify-center"
        >
          Get Started
        </Link>
      </div>
    </>
  );
}
