import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Chart from './Chart'
import Toast from './Toast.tsx'
import Togglemode from './Togglemode.tsx'
export default function Dashboard() {
  const par = useParams()
  const nav = useNavigate()
  const [userName, setUserName] = useState('User')
  const [userData,setUserData] = useState({username:'',registereddate:'',email:''})
  const [registeredDate, setRegisteredDate] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])
  const [summary, setSummary] = useState({ income: 0, expenses: 0})
  const [page, setPage] = useState<'overview' | 'transactions' | 'account'>('overview')
  const [filterType,setFilterType] = useState<'income' | 'expense'>('income')
  const [chartData,setChartData] = useState(null)
  const [transactionCategories,setTransactionCategories] = useState<string[]>([])
  const [currentCategory,setCurrentCategory] = useState('')
  const [allCategories,setAllCategories] = useState<any[]>([])
  const [toast,setToast] = useState({ok:false,message:''})
  const [category,setCategory] = useState<string>('')
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
                setToast({ok:true, message:"Category added successfully!"})
            } else{
                setToast({ok:false, message:"Failed to add category."})
            }
        })
        }else{
            setToast({ok:false, message:"Category name cannot be 'all'."})
        }
    }
  async function loadData(){
        await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/getUser`,{
            credentials:"include",
            headers:{
                'Content-Type':'application/json'
            },
            method:"POST",
            body:JSON.stringify({userid:par.id})
        })
        .then(res=>res.json())
        .then(data=>{
            setUserName(data.username)
            setRegisteredDate(data.registereddate.split('T')[0])
            setUserData(data)
        })
    }
    async function loadCategories(){
      await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/getTransactionCategories`,{
        method:"POST",
        body:JSON.stringify({userid:par.id}),
        credentials:"include",
        headers:{"Content-Type":"application/json"}
      })
      .then(res=>res.json())
      .then(data=>{
        setAllCategories(data)
      })
    }
    async function verifyAndLoad() {
        await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/verify`, {
            credentials:'include',
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({userid: par.id})
         })
        .then(res => res.json())
        .then(data =>{
            if(data == false){
                nav('/')
            } else {
                loadData()
            }
        })
    }
    async function deleteTransaction(transactionId:number){
        await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/deleteTransaction`,{
            method:"DELETE",
            credentials:"include",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({transactionid:transactionId,userid:par.id})
         })
         .then(res=>res.json()) 
         .then(data=>{
            console.log(data)
         })
      await getTransactions()
    }
    async function getTransactionCategories(){
      await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/getTransactionCategories`,{
        method:"POST",
        credentials:"include",
        headers:{"Content-Type":'application/json'},
        body:JSON.stringify({userid:par.id})
      })
      .then(res=>res.json())
      .then(data=>{
        console.log(data)
        setTransactionCategories(data)
      })
    }
    async function getTransactions(){
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/getTransactions`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({userid:par.id,type:'',category:''}),
            credentials:'include'
        })
        const data = await res.json()
        const tmpSummary = { income: 0, expenses: 0 }
        setTransactions(data)
        for (let i = 0; i < data.length; i++) {
          const tx = data[i]
          const amount = Number(tx.transactiondata) || 0
          if (tx.transactiontype === 'income') {
            tmpSummary.income += amount
          } else {
            tmpSummary.expenses += amount
          }
        }
        setSummary(tmpSummary)
    }
    async function getTransactionsbyType(filterType?:'income' | 'expense',filterCategory?:string){
    const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/getTransactions`,{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({userid:par.id, type: filterType, category: filterCategory === 'all' ? '':filterCategory}),
            credentials:'include'
        })
        const data = await res.json()
        return data
    }
    async function calculateTransactions(filterType?:'income' | 'expense',filterCategory?:string){
      const tempTransactions:any[] = await getTransactionsbyType(filterType,filterCategory === 'all'? '':filterCategory)
      const d:any = {
        labels:[],
        datasets:[
          {
            label:"Transactions",
            data:[],
            borderColor:filterType === 'income' ? 'rgb(75, 192, 75)' :'rgb(192, 93, 75)'
          }
        ]
      }
      const dataa:any[] = []
      const labels:any[] = []
      let dict:any = new Map()
      if (Array.isArray(tempTransactions)){
        if(filterType === 'income'){
          for(const tx of tempTransactions){
            if(tx.transactiontype === 'income'){
              dict.set(tx.transactiondate.split("T")[0], (dict.get(tx.transactiondate.split("T")[0]) || 0) + Number(tx.transactiondata) || 0)
            }
          }
        } else {
          for(const tx of tempTransactions){
            if(tx.transactiontype === 'expense'){
              dict.set(tx.transactiondate.split("T")[0], (dict.get(tx.transactiondate.split("T")[0]) || 0) + Number(tx.transactiondata) || 0)
            }
          }
        }
      }
      for(const [key,value] of dict.entries()){
        labels.push(key)
        dataa.push(value)
      }
      d.datasets[0].data = dataa
      d['labels'] = labels
      console.log(d)
      setChartData(d)
      return d
    }
    async function deleteCategory(idx:number){
      let tmp = allCategories
      tmp.splice(idx,1)
      await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/deleteTransactionCategories`,{
        method:"POST",
        credentials:'include',
        body:JSON.stringify({userid:par.id,newCategories:tmp}),
        headers:{"Content-Type":"application/json"}
      })
      .then(res=>res.json())
      .then(data=>{
        if(data === 'Success'){
          setToast({ok:true,message:data})
        } else{
          setToast({ok:false,message:'Error occured'})
        }
      })
    }
  useEffect(() => {
    verifyAndLoad()
    loadCategories()
    getTransactions()
    getTransactionCategories()
    calculateTransactions(filterType, currentCategory)
    }, [])
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Togglemode />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column / Sidebar */}
        <aside className="lg:col-span-1 bg-white rounded-2xl p-6 shadow">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              FT
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-800">{userName}</div>
              <div className="text-sm text-slate-500">Member since {registeredDate}</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50" onClick={() => setPage('overview')}>
              Overview
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50" onClick={() => setPage('transactions')}>
              Transactions
            </button>
            <button className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50" onClick={() => setPage('account')}>
              Account settings
            </button>
          </div>
        </aside>

        {/* Main content */}
        {page === 'overview' && (
            <main className="lg:col-span-3 space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="rounded-full bg-indigo-600 text-white px-4 py-2 text-sm"
              onClick={()=>{
                nav(`/addtransaction/${par.id}`)
              }}
              >New transaction</button>
            </div>
          </header>

          {/* Summary cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <div className="text-sm text-slate-500">Income</div>
              <div className="mt-2 text-xl font-semibold text-green-600">${summary.income.toFixed(2)}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <div className="text-sm text-slate-500">Expenses</div>
              <div className="mt-2 text-xl font-semibold text-rose-500">-${summary.expenses.toFixed(2)}</div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
              <div className="text-sm text-slate-500">Balance</div>
              <div className="mt-2 text-xl font-semibold text-slate-800">${(summary.income - summary.expenses).toFixed(2)}</div>
              <div className="mt-2 text-xs text-slate-400">Available</div>
            </div>
          </section>

          {/* Chart + Transactions */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-800">Spending</h3>
                <div className="text-sm text-slate-500">
                  <div className="text-sm text-slate-500">
                  <select className="border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e)=>{
                    setFilterType(e.target.value as 'income' | 'expense')
                    setCurrentCategory('all')
                    calculateTransactions(e.target.value as 'income' | 'expense','all')
                  }}
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expenses</option>
                  </select>
                </div>
                  <select className="border border-slate-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" defaultValue={'all'} onChange={(e)=>{
                    setCurrentCategory(e.target.value)
                    calculateTransactions(filterType,e.target.value)
                    }}>
                  {transactionCategories.map((val,idx)=>(
                    <option key={idx} value={val}>{val}</option>
                  ))}
                  <option aria-selected="true" value="all">All</option>
                </select>
                </div>
              </div>
              <div className="mt-6 h-48 rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 flex items-center justify-center text-slate-400">
                {chartData && <Chart transactions={chartData} />}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow">
              <h3 className="text-lg font-semibold text-slate-800">Recent transactions</h3>
                <ul className="mt-4 space-y-3">
                    {transactions.toReversed().slice(0,5).map((tx,index)=>(
                        <li key={index} className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-slate-800">{tx.transactiondate.split('T')[0]} : {tx.transactiontype === 'income' ? `+${tx.transactiondata.toFixed(2)}` : `-${tx.transactiondata.toFixed(2)}`}</div>
                            </div>
                        </li>
                    ))}
                </ul>
              <div className="mt-4">
                <button className="w-full rounded-md bg-indigo-600 text-white py-2 text-sm" onClick={()=>{setPage('transactions')}}>View all transactions</button>
              </div>
            </div>
          </section>
        </main>
        )}
        {page === 'transactions' && (
            <main className="lg:col-span-3 space-y-6">
                <header className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
            <div className="flex items-center gap-4">
              <button className="rounded-full bg-indigo-600 text-white px-4 py-2 text-sm"
              onClick={()=>{
                nav(`/addtransaction/${par.id}`)
              }}
              >New transaction</button>
            </div>
          </header>
                <table className="p-2 w-full bg-white rounded-2xl shadow overflow-hidden">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="text-left text-slate-500 font-normal px-4 py-3">Title</th>
                            <th className="text-left text-slate-500 font-normal px-4 py-3">Amount</th>
                            <th className="text-left text-slate-500 font-normal px-4 py-3">Transaction Date</th>
                            <th className="text-left text-slate-500 font-normal px-4 py-3">Transaction Category</th>
                            <th className="text-left text-slate-500 font-normal px-4 py-3">Delete transaction</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                    {transactions.map((tx,index)=>(
                        <tr key={index}>
                            <td className="px-4 py-3 ">{tx.title}</td>
                            <td className="px-4 py-3 ">{tx.transactiontype === 'income' ? `+${tx.transactiondata.toFixed(2)}` : `-${tx.transactiondata.toFixed(2)}`}</td>
                            <td className="px-4 py-3 ">{tx.transactiondate}</td>
                            <td className="px-4 py-3 ">{tx.transactioncategory}</td>
                            <td className="px-4 py-3 ">
                                <button className="bg-red-500 text-white py-1 px-3 rounded-md" onClick={() => deleteTransaction(tx.transactionid)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </main>
        )}
        {page === 'account' && (
            <main className="lg:col-span-3 space-y-6">
                <h1 className="text-2xl font-bold text-slate-800">Account settings</h1>
                <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
                        <div className="text-sm text-slate-500">Account Name</div>
                        <div className="mt-2 text-xl font-semibold">{userData.username}</div>
                        <button className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md" onClick={()=>{
                            nav(`/changeusername/${par.id}`)
                        }}>Change Username</button>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
                        <div className="text-sm text-slate-500">Account Email</div>
                        <div className="mt-2 text-xl font-semibold">{userData.email}</div>
                        <button className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md" onClick={()=>{
                            nav(`/changeemail/${par.id}`)
                        }}>Change Email</button>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
                        <div className="text-sm text-slate-500">Account Registered Date</div>
                        <div className="mt-2 text-xl font-semibold">{userData.registereddate.split('T')[0]}</div>
                        <div className="mt-2 text-xl font-semibold">{userData.registereddate.split('T')[1].split('.')[0]}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
                        <div className="text-sm text-slate-500">Password</div>
                        <div className="mt-2 text-xl font-semibold">••••••••</div>
                        <button className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md" onClick={()=>{
                            nav(`/changepassword/${par.id}`)
                        }}>Change Password</button>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
                        <div className="text-sm text-slate-500">Logout</div>
                        <button className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md" onClick={async ()=>{
                          await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/logout`,{
                            method:"POST",
                            credentials:'include',
                            headers:{"Content-Type":"application/json"}
                          })
                          .then(res=>res.json())
                          .then(data=>{
                            if(data === 'Success'){
                              nav('/login')
                            }
                          })
                        }}>Logout</button>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow flex flex-col">
                        <div className="text-sm text-slate-500">Your categories</div>
                        <div>
                          {allCategories.map((val,idx)=>(
                            <div>
                            <p className="mt-2 text-xl font-semibold" key={idx}>{val}</p>
                            <button className="mt-2 bg-indigo-600 text-white py-2 px-4 rounded-md" onClick={async ()=>{
                              await deleteCategory(idx)
                              loadCategories()
                            }}>Delete</button>
                            </div>
                          ))}
                          <input type='text' className='border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500' id='newCategory' placeholder='Enter new category' value={category} onChange={(e)=>setCategory(e.target.value)}/>
                          <button className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md' onClick={async (e) => {
                                e.preventDefault()
                                await addCategory()
                                getTransactionCategories()
                                loadCategories()
                            }}>Add Category</button>
                        </div>
                    </div>
                </section>
            </main>
        )}
      </div>
      {toast.message.length > 0 && (
        <Toast message={toast.message} type={toast.ok}/>
      )}
    </div>
  )
}