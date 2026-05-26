import './App.css'
import {useState, useEffect} from 'react'
import {useParams,useNavigate} from 'react-router-dom'
import Toast from './Toast.tsx'
export default function Addtransaction() {
    const [title,setTitle] = useState('')
    const [amount,setAmount] = useState(0)
    const par = useParams()
    const nav = useNavigate()
    const [type,setType] = useState('income')
    const [name,setName] = useState('')
    const [message,setMessage] = useState({ok:false,msg:''})
    const [transactionCategories,setTransactionCategories] = useState<string[]>([]) 
    const [category,setCategory] = useState('')
    const [page,setPage] = useState('addTransaction')
    async function submit() {
        await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/addTransaction`,{
            method:"POST",
            credentials:"include",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({title:title,amount:amount,type:type,userid:par.id,category:category})
         })
         .then(res=>res.json())
         .then(data => {
             if(data === "Success") {
                 setMessage({ok:true, msg:"Transaction added successfully!"})
                 setTimeout(()=>{
                    nav(`/dashboard/${par.id}`)
                 }, 3000)
             } else {
                 setMessage({ok:false, msg:"Failed to add transaction."})
             }
         })
    }
    async function getTransactionCategories(){
        await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/getTransactionCategories`,{
            method:"POST",
            credentials:"include",
            headers:{"Content-Type":"application/json",},
            body:JSON.stringify({userid:par.id})
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
            if(data === "400: Bad request - Error occurred while fetching transaction categories"){
                return
            }else{
                setTransactionCategories(data)
            }
        })
    }
    async function getUserData(){
        await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/getUser`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({userid:par.id}),
            credentials:'include'
        })
        .then(res => res.json())
        .then(data =>{
            setName(data.username + '#' + data.id)
        })
    }
    async function addCategory(){
        if(category.trim() !== 'all'){
            await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/addTransactionCategory`,{
            credentials:'include',
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({userid:par.id,category:category})
        })
        .then(res=>res.json())
        .then(data=>{
            if(data === 'Success'){
                setMessage({ok:true, msg:"Category added successfully!"})
            } else{
                setMessage({ok:false, msg:"Failed to add category."})
            }
        })
        }else{
            setMessage({ok:false, msg:"Category name cannot be 'all'."})
        }
    }
    useEffect(()=>{
        getUserData()
        getTransactionCategories()
    },[])
    return (
        <div className='flex justify-center items-center min-h-screen'>
            <div>
                {page === 'addTransaction' && (
                    <form className='flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md'>
                    <div>
                        <p>Welcome, {name}!</p>
                        <label htmlFor='title'>Title: </label>
                        <input className='border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' type='text' id='title' placeholder='Transaction title' value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor='category'>Category: </label>
                        <select className='border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' id='category' value={category} onChange={(e) => setCategory(e.target.value)}>
                            {transactionCategories.map((val,idx)=>(
                                <option key={idx} value={val}>{val}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md' onClick={(e) => {
                                e.preventDefault()
                                setPage('addCategory')
                        }}>Add a new category</button>
                    </div>
                    <div>
                    <label htmlFor="transactionType">Transaction Type: </label>
                    <select className='border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' id="transactionType" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    </div>
                    <div>
                    <label htmlFor='amount'>Amount: </label>
                    <input className='border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' type='number' id='amount' placeholder='0.00' value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md' onClick={(e)=>{
                            e.preventDefault()
                            submit()
                        }}>Confirm</button>
                    </div>
                </form>
                )}
                {page === 'addCategory' && (
                    <form className='flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md'>
                    <div>
                        <p>Welcome, {name}!</p>
                        <div>
                        <label htmlFor='newCategory'>New Category: </label>
                        <input className='border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' type='text' id='newCategory' placeholder='Enter new category' value={category} onChange={(e) => setCategory(e.target.value)} />
                        </div>
                        <div>
                            <button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md' onClick={async (e) => {
                                e.preventDefault()
                                setPage('addTransaction')
                                await addCategory()
                                await getTransactionCategories()
                            }}>Add Category</button>
                        </div>
                        <div className="mt-4 text-sm text-slate-600">
                            <button className="text-indigo-600 hover:underline" onClick={() => setPage('addTransaction')}>Back</button>
                        </div>
                    </div>
                </form>
                )}
            </div>
            {message.msg && <Toast message={message.msg} type={message.ok} />}
        </div>
    )
}