import './App.css'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)
export default function Chart({ transactions }: any){
    return (
        <div className='w-auto h-full flex items-center justify-center text-slate-400'>
            <Line data={transactions} options={{responsive:true}}/>
        </div>
    )
}