"use client"

import { Card } from "@/components/ui/card"
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
  TimeScale,
} from 'chart.js'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface SensorData {
  timestamp: string
  temperature: number
  device_id: string
}

interface TemperatureChartProps {
  data?: SensorData[]
}

export function TemperatureChart({ data = [] }: TemperatureChartProps) {
  const chartData = {
    labels: data.map(item => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: data.map(item => item.temperature),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Temperatura en Tiempo Real',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Hora'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Temperatura (°C)'
        },
        min: 0,
        max: 40
      },
    },
  }

  return (
    <Card className="p-6">
      <Line data={chartData} options={options} />
    </Card>
  )
}