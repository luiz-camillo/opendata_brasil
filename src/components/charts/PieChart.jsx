import { Pie } from 'react-chartjs-2'
import styles from './PieChart.module.css'

/**
 * Responsive Pie chart wrapper, for distribution-style data.
 *
 * @param {{ data: object, title?: string }} props
 */
function PieChart({ data, title }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: Boolean(title), text: title },
    },
  }

  return (
    <div className={styles.chartWrapper}>
      <Pie data={data} options={options} />
    </div>
  )
}

export default PieChart
