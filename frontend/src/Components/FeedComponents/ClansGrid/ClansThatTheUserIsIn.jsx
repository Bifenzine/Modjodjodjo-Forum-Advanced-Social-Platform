import React from 'react'
import ClansGrid from './ClansGrid'
import { motion } from 'framer-motion'

const ClansThatTheUserIsIn = () => {
  return (
    <div className="bg-slate-900 p-3 shadow-md rounded-2xl">
      <h2 className="text-xl font-bold mb-1">Clans</h2>

      <motion.hr
        style={{
          scaleX: 0,
          transformOrigin: 'left',
        }}
        animate={{ scaleX: 0.4 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
        className="w-[8rem] mb-4"
      ></motion.hr>

      <ClansGrid />


    </div>
  )
}

export default ClansThatTheUserIsIn