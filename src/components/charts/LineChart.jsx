import { Line } from 'react-chartjs-2'
import styles from './LineChart.module.css'

/**
 * Responsive Line chart wrapper for time-series data.
 *
 * @param {{ data: object, title?: string, xLabel?: string, yLabel?: string }} props
 */
function LineChart({ data, title, xLabel, yLabel }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: Boolean(title), text: title },
    },
    scales: {
      x: {
        title: { display: Boolean(xLabel), text: xLabel },
      },
      y: {
        title: { display: Boolean(yLabel), text: yLabel },
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
      <Line data={data} options={options} />
    </div>
  )
}

export default LineChart
