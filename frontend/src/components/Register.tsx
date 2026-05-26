import React, { useState } from 'react'
import Toast from './Toast'
import {useNavigate} from 'react-router-dom'
export default function Register() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirm, setConfirm] = useState('')
	const nav = useNavigate()
    const [toast, setToast] = useState<{message:string,type:boolean}>({message:'',type:false})
    async function sendData(data:any){
        await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/register`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            credentials:'include',
            body:JSON.stringify({username:data.name,email:data.email,password:data.password})
         })
         .then(res => res.json())
         .then(data=>{
            if(data == 'Success'){
                setToast({message:'Registration successful!',type:true})
            }else{
                setToast({message:'Registration failed!',type:false})
            }
         })
    }
	function validateEmail(email:string){
		const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		return re.test(email)
	}
	function submit(e: React.FormEvent) {
		e.preventDefault()
		if (password !== confirm){ setToast({message:'Passwords do not match!',type:false})}
		if(validateEmail(email) === false){ setToast({message:'Invalid email format!',type:false})}
        else{
        sendData({name:name,email:email,password:password})}
        }
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
			  <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
				<div className="hidden md:flex flex-col justify-center px-8">
				  <div className="mb-6">
					<div className="inline-flex items-center gap-3">
					  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg flex items-center justify-center text-white font-bold">FT</div>
					  <div>
						<h1 className="text-2xl font-extrabold text-slate-800">FinanceTracker</h1>
						<p className="text-sm text-slate-600">Smarter budgeting & insights</p>
					  </div>
					</div>
				  </div>
		
				  <p className="text-slate-700">
					Track spending, set budgets, and reach your financial goals with a clean,
					modern interface built for clarity.
				  </p>
				</div>
			{/* start*/}
		<div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8">
			<h2 className="text-2xl font-semibold mb-2 text-slate-800">Create an account</h2>
			<p className="text-sm text-slate-600 mb-6">Start tracking your finances in minutes</p>

			<form onSubmit={submit} className="space-y-4">
				<label className="block">
					<span className="text-sm text-slate-600">Full name</span>
					<input
						type="text"
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
						placeholder="Your name"
					/>
				</label>

				<label className="block">
					<span className="text-sm text-slate-600">Email</span>
					<input
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
						placeholder="you@domain.com"
					/>
				</label>

				<label className="block">
					<span className="text-sm text-slate-600">Password</span>
					<input
						type="password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
						placeholder="Create a password"
					/>
				</label>

				<label className="block">
					<span className="text-sm text-slate-600">Confirm password</span>
					<input
						type="password"
						required
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						className="mt-1 block w-full rounded-md border-gray-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
						placeholder="Repeat your password"
					/>
				</label>

				<button
					type="submit"
					className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-white font-semibold shadow"
				>
					Create account
				</button>
			</form>

			<div className="mt-4 text-center text-sm text-slate-600">
				Already have an account?{' '}
				<button
					onClick={() => nav('/login')}
					className="text-indigo-600 font-medium hover:underline"
				>
					Sign in
				</button>
			</div>
		</div>
			  {/* a */}
			  </div>
			  {toast.message && (
					  <div>
						<Toast message={toast.message} type={toast.type} />
					  </div>
					   )}
			</div>
	)
}

