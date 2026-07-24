import { Radar } from 'react-chartjs-2'
import styles from './RadarChart.module.css'

/**
 * Responsive Radar chart wrapper, for multi-dimensional comparisons.
 *
 * @param {{ data: object, title?: string }} props
 */
function RadarChart({ data, title }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: Boolean(title), text: title },
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          callback(value) {
            return Number(value).toLocaleString('pt-BR')
          },
        },
      },
    },
  }

  return (
    <div className={styles.chartWrapper}>
      <Radar data={data} options={options} />
    </div>
  )
}

export default RadarChart
