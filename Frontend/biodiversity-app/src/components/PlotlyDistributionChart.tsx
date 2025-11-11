import React from 'react';
import Plot from 'react-plotly.js';

interface DistributionData {
  histogram: {
    x: number[];
    y: number[];
    type: string;
    name: string;
    marker: {
      color: string;
      opacity: number;
    };
  };
  user_score: {
    x: number[];
    y: number[];
    type: string;
    mode: string;
    name: string;
    line: {
      color: string;
      width: number;
    };
  };
  benchmarks: Array<{
    x: number[];
    y: number[];
    type: string;
    mode: string;
    name: string;
    line: {
      dash: string;
      width: number;
    };
  }>;
}

interface PlotlyDistributionChartProps {
  distributionData: DistributionData;
  userScore: number;
  className?: string;
}

export const PlotlyDistributionChart: React.FC<PlotlyDistributionChartProps> = ({
  distributionData,
  userScore,
  className = ""
}) => {
  try {
    // Prepare data for Plotly
    const plotData: any[] = [];

    // Add histogram
    if (distributionData.histogram) {
      plotData.push({
        x: distributionData.histogram.x,
        y: distributionData.histogram.y,
        type: 'bar',
        name: 'Score Distribution',
        marker: {
          color: '#10B981',
          opacity: 0.6
        },
        hovertemplate: 'Score: %{x:.2f}<br>Count: %{y}<extra></extra>'
      });
    }

    // Add user score line
    if (distributionData.user_score) {
      plotData.push({
        x: distributionData.user_score.x,
        y: distributionData.user_score.y,
        type: 'scatter',
        mode: 'lines',
        name: 'Your Recording',
        line: {
          color: '#EF4444',
          width: 3
        },
        hovertemplate: 'Your Score: %{x:.3f}<extra></extra>'
      });
    }

    // Add benchmark lines
    if (distributionData.benchmarks && Array.isArray(distributionData.benchmarks)) {
      distributionData.benchmarks.forEach((benchmark, index) => {
        plotData.push({
          x: benchmark.x,
          y: benchmark.y,
          type: 'scatter',
          mode: 'lines',
          name: benchmark.name,
          line: {
            dash: 'dash',
            width: 2,
            color: ['#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'][index % 5]
          },
          hovertemplate: `${benchmark.name}: %{x:.2f}<extra></extra>`
        });
      });
    }

    const layout = {
      title: {
        text: 'Biodiversity Score Distribution',
        font: {
          color: '#10B981',
          size: 16,
          family: 'monospace'
        }
      },
      xaxis: {
        title: {
          text: 'Biodiversity Score',
          font: { color: '#9CA3AF' }
        },
        tickfont: { color: '#9CA3AF' },
        gridcolor: '#374151',
        range: [0, 1]
      },
      yaxis: {
        title: {
          text: 'Frequency',
          font: { color: '#9CA3AF' }
        },
        tickfont: { color: '#9CA3AF' },
        gridcolor: '#374151'
      },
      plot_bgcolor: 'rgba(0,0,0,0.8)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: '#D1D5DB',
        family: 'monospace'
      },
      legend: {
        font: { color: '#D1D5DB' },
        bgcolor: 'rgba(0,0,0,0.5)',
        bordercolor: '#10B981',
        borderwidth: 1
      },
      margin: {
        l: 60,
        r: 40,
        t: 60,
        b: 60
      }
    };

    const config = {
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: [
        'pan2d' as const,
        'lasso2d' as const,
        'select2d' as const,
        'autoScale2d' as const,
        'hoverClosestCartesian' as const,
        'hoverCompareCartesian' as const,
        'toggleSpikelines' as const
      ],
      responsive: true
    };

    return (
      <div className={`w-full ${className}`}>
        <Plot
          data={plotData}
          layout={layout}
          config={config}
          style={{ width: '100%', height: '400px' }}
          useResizeHandler={true}
        />
      </div>
    );

  } catch (error) {
    console.error('Error rendering Plotly chart:', error);
    
    // Fallback display
    return (
      <div style={{
        width: '100%',
        height: '400px',
        background: 'linear-gradient(to bottom, rgba(6, 78, 59, 0.3), black)',
        borderRadius: '4px',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#10B981',
        fontFamily: 'monospace'
      }}>
        <div style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', marginBottom: '1rem' }}>
          [PLOTLY DISTRIBUTION CHART]
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
          marginBottom: '1rem'
        }}>
          {[0.1, 0.3, 0.5, 0.8, 0.95].map((val, i) => (
            <div key={i} style={{ fontSize: '0.75rem', textAlign: 'center' }}>
              <div style={{
                height: '64px',
                width: '32px',
                backgroundColor: Math.abs(val - userScore) < 0.1 ? '#10B981' : '#065F46',
                borderRadius: '2px',
                marginBottom: '4px'
              }}></div>
              {val}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          Your Score: <span style={{ color: '#10B981', fontWeight: 'bold' }}>{userScore.toFixed(3)}</span>
        </div>
        <div style={{ 
          fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)', 
          marginTop: '0.5rem', 
          color: '#9CA3AF' 
        }}>
          Chart loading fallback
        </div>
      </div>
    );
  }
};

export default PlotlyDistributionChart;