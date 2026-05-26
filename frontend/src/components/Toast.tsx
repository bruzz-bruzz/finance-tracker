import './App.css'
import { useEffect, useState, useRef } from 'react'

export default function Toast({message,type, duration = 3000}:{message:string,type:boolean, duration?:number}){
    const [visible, setVisible] = useState(true)
    const [mounted, setMounted] = useState(true)
    const hideTimer = useRef<number | null>(null)
    const unmountTimer = useRef<number | null>(null)

    useEffect(() => {
        // reset when message changes
        setMounted(true)
        setVisible(true)
        if (hideTimer.current) window.clearTimeout(hideTimer.current)
        if (unmountTimer.current) window.clearTimeout(unmountTimer.current)

        hideTimer.current = window.setTimeout(() => {
            setVisible(false)
        }, duration)

        unmountTimer.current = window.setTimeout(() => {
            setMounted(false)
        }, duration + 350) // allow animation to finish

        return () => {
            if (hideTimer.current) window.clearTimeout(hideTimer.current)
            if (unmountTimer.current) window.clearTimeout(unmountTimer.current)
        }
    }, [message, duration])

    if (!mounted) return null

    return (
        <div>
            <div className={`toast ${visible ? 'show' : 'hide'} fixed bottom-4 right-4 p-4 rounded shadow-lg text-white ${type ? 'bg-green-500' : 'bg-red-500'}`}>
                {message}
            </div>
        </div>
    )
}