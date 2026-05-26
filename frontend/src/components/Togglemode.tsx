import {useState} from 'react'
import {useCookies} from 'react-cookie'
import './App.css'
export default function Togglemode(){
	const [cookies, setCookie] = useCookies(['theme'])
	const [isDarkMode, setIsDarkMode] = useState(cookies.theme === 'dark')
	const toggleTheme = () => {
		const newTheme = isDarkMode ? 'light' : 'dark'
		setIsDarkMode(!isDarkMode)
		setCookie('theme', newTheme, { path: '/' })
	}
	return (
        <div>
            <button onClick={toggleTheme} className={`absolute left-4 bottom-4 px-4 py-2 rounded ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
        </div>
    )
}