"use client"
import Link from "next/link";
import NavBar from "@/components/NavBar";
import {motion} from "motion/react"
export default function LandingPage() {
  return (
    <>
      <NavBar />
      <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16 gap-4">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Sketch. Collaborate. Create.
        </motion.h1>
        <motion.p 
          initial={{opacity:0}}
          animate={{opacity:1}}
          transition={{delay:1,duration:0.7}}
          className="text-2xl text-gray-600 max-w-2xl">
          Bring your ideas to life with real-time drawing and teamwork — all in one place.
        </motion.p>
        <motion.a
          href="/dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          whileHover={{ scale: 1.08, boxShadow: "0px 4px 12px rgba(0,0,0,0.15)" }}
          whileTap={{ scale: 0.95 }}
          className="bg-yellow-300 rounded-lg w-36 h-10 font-semibold flex items-center justify-center cursor-pointer text-gray-900"
        >
        Get Started
        </motion.a>
      </div>
    </>
  );
}
