"use client";
import {motion} from "motion/react"
export default function NavBar() {
  return (
    <motion.div 
      initial={{opacity:0, y:40}}
      animate={{opacity:1, y:0}}
      transition={{duration:0.8, ease:"easeOut"}}
      className="w-full h-[67px] flex mt-6 justify-center">
      <div className="navbar bg-[#FFFFFF] w-[1376px] flex justify-between items-center rounded-4xl px-14">
        <div className="flex items-center cursor-pointer select-none">
          <span className="text-lg font-semibold text-gray-800">
            Sketch
          </span>
        </div>


        <div className="flex items-center gap-3">
          <button className="px-5 py-2 text-sm border border-gray-400 rounded-md bg-white hover:bg-gray-50 text-gray-700">
            Sign in
          </button>
          <button className="px-5 py-2 text-sm rounded-md bg-yellow-300 text-black hover:bg-green-600">
            Sign Up
          </button>
        </div>
      </div>
    </motion.div>
  );
}
