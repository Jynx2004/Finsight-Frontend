'use client'
import Link from 'next/link'

const LogoIcon = () => (
  <div className='w-8 h-8 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-600 flex items-center justify-center shadow-md'>
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className='h-5 w-5 text-white'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={1.6}
        d='M12 3L4 6v5c0 5.25 3.6 10.74 8 12 4.4-1.26 8-6.75 8-12V6l-8-3z'
      />
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.6} d='M9.5 11a2.5 2.5 0 015 0v1h-5v-1z' />
      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.6} d='M12 13v2' />
    </svg>
  </div>
)

export const Logo = () => {
  return (
    <span className='flex items-center gap-2 text-sm font-semibold font-[Montserrat] text-white'>
      <LogoIcon />
      <span className='bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent font-semibold'>
        FINSIGHT
      </span>
    </span>
  )
}
