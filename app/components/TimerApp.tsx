'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, Pause, Play, RotateCcw, Settings } from 'lucide-react'

export default function TimerApp() {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [isSoundOn, setIsSoundOn] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const savedSoundSetting = localStorage.getItem('isSoundOn')
    if (savedSoundSetting !== null) {
      setIsSoundOn(JSON.parse(savedSoundSetting))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('isSoundOn', JSON.stringify(isSoundOn))
  }, [isSoundOn])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval)
            setIsRunning(false)
            setIsFinished(true)
            if (isSoundOn && audioRef.current) {
              audioRef.current.play()
            }
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    } else if (time === 0) {
      setIsRunning(false)
    }

    return () => clearInterval(interval)
  }, [isRunning, time, isSoundOn])

  const startTimer = () => {
    if (time > 0) {
      setIsRunning(true)
      setIsFinished(false)
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsFinished(false)
    setTime(0)
  }

  const handleTimeChange = (unit: 'minutes' | 'seconds', value: string) => {
    const numValue = parseInt(value, 10) || 0
    let newTime = time

    switch (unit) {
      case 'minutes':
        newTime = (numValue * 60) + (time % 60)
        break
      case 'seconds':
        newTime = Math.floor(time / 60) * 60 + numValue
        break
    }

    setTime(Math.min(newTime, 5999)) // Max 99 minutes 59 seconds
  }

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Simple Timer</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-2"
            aria-label="Settings"
          >
            <Settings className="h-6 w-6" />
          </button>
        </header>

        {showSettings ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Sound</span>
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSoundOn}
                    onChange={() => setIsSoundOn(!isSoundOn)}
                  />
                  <div className={`block w-14 h-8 rounded-full ${isSoundOn ? 'bg-blue-600' : 'bg-gray-400'}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${isSoundOn ? 'transform translate-x-6' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-center space-x-4 mb-6">
              <select
                value={Math.floor(time / 60)}
                onChange={(e) => handleTimeChange('minutes', e.target.value)}
                className="h-12 w-24 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 100 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                ))}
              </select>
              <select
                value={time % 60}
                onChange={(e) => handleTimeChange('seconds', e.target.value)}
                className="h-12 w-24 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 60 }, (_, i) => (
                  <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>
            <div className="text-7xl font-bold text-center text-gray-800 mb-8" aria-live="polite">
              {formatTime(time)}
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={isRunning ? pauseTimer : startTimer}
                className={`flex items-center justify-center w-32 h-12 rounded-md text-white font-semibold transition-colors duration-300 ${
                  isRunning
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                aria-label={isRunning ? 'Pause timer' : 'Start timer'}
              >
                {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center justify-center w-32 h-12 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-md transition-colors duration-300"
                aria-label="Reset timer"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset
              </button>
            </div>
          </>
        )}
      </div>
      {isFinished && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Time's up!</h2>
            <button
              onClick={() => setIsFinished(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <audio ref={audioRef} src="/alarm-sound.mp3" />
    </div>
  )
}