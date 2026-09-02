export function getEloChartOptions(showElo) {
  return {
    parsing: {
      xAxisKey: 'startgametime',
      yAxisKey: 'elo'
    },

    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      tooltip: {
        callbacks: {
          title(items) {
            const date = new Date(items[0].parsed.x)

            return date.toLocaleDateString('es-ES', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })
          },
          ...(showElo ? {} : {
            label: (context) => context.dataset.label,
          }),
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'yyyy-MM-dd HH:mm',
          displayFormats: {
            day: 'MMM d',
          },
        },
      },
      y: {
        ticks: {
          display: showElo,
        },
      },
    },
  }
}