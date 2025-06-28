'use client'
import React from 'react'
import { motion } from 'motion/react'
import { AuroraBackground } from '../app/components/ui/AuroraBackground'
import { TypewriterEffectSmooth } from './components/ui/typewriter-effect'
import { Hero } from './components/hero'
import { Navbar } from './components/navbar'

export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
    </div>
  )
}
