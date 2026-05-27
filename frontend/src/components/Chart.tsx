import './App.css'
import { Line,Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(ArcElement,CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)
export default function Chart({transactions,type}:any){
    return (
        <div>
        {type === 'line' && (
            <div className='w-auto h-full flex items-center justify-center text-slate-400'>
            <Line data={transactions} options={{responsive:true}}/>
        </div>
        )}
        {type === 'donut' && (
            <div className='w-auto h-full flex items-center justify-center text-slate-400'>
            <Doughnut data={transactions} options={{responsive:true}}/>
        </div>
        )}
        </div>
    )
}