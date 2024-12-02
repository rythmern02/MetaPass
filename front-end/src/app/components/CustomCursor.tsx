'use client'

import { useState, useEffect } from 'react'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [isPointer, setIsPointer] = useState(false)

  useEffect(() => {
    const updateCursorPosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const updateCursorStyle = () => {
      const target = document.elementFromPoint(position.x, position.y) as any
      setIsPointer(window?.getComputedStyle(target).cursor === 'pointer')
    }

    window.addEventListener('mousemove', updateCursorPosition)
    window.addEventListener('mouseover', updateCursorStyle)

    return () => {
      window.removeEventListener('mousemove', updateCursorPosition)
      window.removeEventListener('mouseover', updateCursorStyle)
    }
  }, [position.x, position.y])

  return (
    <>
      <div
        className="custom-cursor"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      <div
        className={`custom-cursor-dot ${isPointer ? 'scale-0' : 'scale-100'}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
    </>
  )
}
