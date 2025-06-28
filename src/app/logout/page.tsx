'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

function Logout() {
  const router = useRouter()

  useEffect(() => {
    // Clear localStorage
    sessionStorage.removeItem('accessToken')
    localStorage.removeItem('userData')

    // Redirect to home page after a brief delay
    const timer = setTimeout(() => {
      router.push('/')
    }, 1500)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className='w-full h-[70vh] flex flex-col items-center justify-center'>
      <h1 className='text-3xl md:text-5xl font-bold text-white mb-6'>Logging Out</h1>
      <p className='text-neutral-400 text-lg mb-8 text-center max-w-md'>
        You have been successfully logged out.
        <br />
        Redirecting to home page...
      </p>
      <div className='animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full'></div>
    </div>
  )
}

export default Logout
