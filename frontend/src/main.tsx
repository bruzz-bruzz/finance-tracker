import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routes,Route} from 'react-router-dom'
import {CookiesProvider} from 'react-cookie'
import './index.css'
import Dashboard from './components/Dashboard.tsx'
import Login from './components/Login.tsx'
import Register from './components/Register.tsx'
import Addtransaction from './components/Addtransaction.tsx'
import Changepassword from './components/Changepassword.tsx'
import Changeemail from './components/Changeemail.tsx'
import Changeusername from './components/Changeusername.tsx'
createRoot(document.getElementById('root')!).render(
  <CookiesProvider>
    <BrowserRouter>
    <Routes>
      <Route path='/login' element={<Login/>}></Route>
      <Route path='/register' element={<Register/>}></Route>
      <Route path='/dashboard/:id' element={<Dashboard/>}></Route>
      <Route path='/addtransaction/:id' element={<Addtransaction/>}></Route>
      <Route path='/changepassword/:id' element={<Changepassword/>}></Route>
      <Route path='/changeemail/:id' element={<Changeemail/>}></Route>
      <Route path='/changeusername/:id' element={<Changeusername/>}></Route>
    </Routes>
    </BrowserRouter>
    </CookiesProvider>
)
