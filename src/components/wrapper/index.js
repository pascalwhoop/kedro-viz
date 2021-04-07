import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import LargePipelineWarning from '../large-pipeline-warning';
import FlowChart from '../flowchart';
import Sidebar from '../sidebar';
import MetaData from '../metadata';
import ExportModal from '../export-modal';
import PlotModal from '../plotly-chart-modal';
import LoadingIcon from '../icons/loading';
import { isLoading } from '../../selectors/loading';
import './wrapper.css';

const plotData = {
  data: [
    {
      hovertemplate: 'importance=%{x}<br>features=%{y}<extra></extra>',
      legendgroup: '',
      marker: {
        color: '#636efa',
        symbol: 'circle',
      },
      mode: 'markers',
      name: '',
      orientation: 'h',
      showlegend: false,
      type: 'scatter',
      x: [98, 90, 94, 97, 31, 27, 0, 90, 5, 89, 30, 31, 3, 99, 45, 59],
      xaxis: 'x',
      y: [
        'feature1',
        'feature2',
        'feature3',
        'feature4',
        'feature5',
        'feature6',
        'feature7',
        'feature8',
        'feature9',
        'feature10',
        'feature11',
        'feature12',
        'feature13',
        'feature14',
        'feature15',
        'feature16',
      ],
      yaxis: 'y',
    },
  ],
  layout: {
    legend: {
      tracegroupgap: 0,
    },
    margin: {
      t: 60,
    },
    template: {
      data: {
        bar: [
          {
            error_x: {
              color: '#2a3f5f',
            },
            error_y: {
              color: '#2a3f5f',
            },
            marker: {
              line: {
                color: '#E5ECF6',
                width: 0.5,
              },
            },
            type: 'bar',
          },
        ],
        barpolar: [
          {
            marker: {
              line: {
                color: '#E5ECF6',
                width: 0.5,
              },
            },
            type: 'barpolar',
          },
        ],
        carpet: [
          {
            aaxis: {
              endlinecolor: '#2a3f5f',
              gridcolor: 'white',
              linecolor: 'white',
              minorgridcolor: 'white',
              startlinecolor: '#2a3f5f',
            },
            baxis: {
              endlinecolor: '#2a3f5f',
              gridcolor: 'white',
              linecolor: 'white',
              minorgridcolor: 'white',
              startlinecolor: '#2a3f5f',
            },
            type: 'carpet',
          },
        ],
        choropleth: [
          {
            colorbar: {
              outlinewidth: 0,
              ticks: '',
            },
            type: 'choropleth',
          },
        ],
        contour: [
          {
            colorbar: {
              outlinewidth: 0,
              ticks: '',
            },
            colorscale: [
              [0.0, '#0d0887'],
              [0.1111111111111111, '#46039f'],
              [0.2222222222222222, '#7201a8'],
              [0.3333333333333333, '#9c179e'],
              [0.4444444444444444, '#bd3786'],
              [0.5555555555555556, '#d8576b'],
              [0.6666666666666666, '#ed7953'],
              [0.7777777777777778, '#fb9f3a'],
              [0.8888888888888888, '#fdca26'],
              [1.0, '#f0f921'],
            ],
            type: 'contour',
          },
        ],
        contourcarpet: [
          {
            colorbar: {
              outlinewidth: 0,
              ticks: '',
            },
            type: 'contourcarpet',
          },
        ],
        heatmap: [
          {
            colorbar: {
              outlinewidth: 0,
              ticks: '',
            },
            colorscale: [
              [0.0, '#0d0887'],
              [0.1111111111111111, '#46039f'],
              [0.2222222222222222, '#7201a8'],
              [0.3333333333333333, '#9c179e'],
              [0.4444444444444444, '#bd3786'],
              [0.5555555555555556, '#d8576b'],
              [0.6666666666666666, '#ed7953'],
              [0.7777777777777778, '#fb9f3a'],
              [0.8888888888888888, '#fdca26'],
              [1.0, '#f0f921'],
            ],
            type: 'heatmap',
          },
        ],
        heatmapgl: [
          {
            colorbar: {
              outlinewidth: 0,
              ticks: '',
            },
            colorscale: [
              [0.0, '#0d0887'],
              [0.1111111111111111, '#46039f'],
              [0.2222222222222222, '#7201a8'],
              [0.3333333333333333, '#9c179e'],
              [0.4444444444444444, '#bd3786'],
              [0.5555555555555556, '#d8576b'],
              [0.6666666666666666, '#ed7953'],
              [0.7777777777777778, '#fb9f3a'],
              [0.8888888888888888, '#fdca26'],
              [1.0, '#f0f921'],
            ],
            type: 'heatmapgl',
          },
        ],
        histogram: [
          {
            marker: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'histogram',
          },
        ],
        histogram2d: [
          {
            colorbar: {
              outlinewidth: 0,
              ticks: '',
            },
            colorscale: [
              [0.0, '#0d0887'],
              [0.1111111111111111, '#46039f'],
              [0.2222222222222222, '#7201a8'],
              [0.3333333333333333, '#9c179e'],
              [0.4444444444444444, '#bd3786'],
              [0.5555555555555556, '#d8576b'],
              [0.6666666666666666, '#ed7953'],
              [0.7777777777777778, '#fb9f3a'],
              [0.8888888888888888, '#fdca26'],
              [1.0, '#f0f921'],
            ],
            type: 'histogram2d',
          },
        ],
        histogram2dcontour: [
          {
            colorbar: {
              outlinewidth: 0,
              ticks: '',
            },
            colorscale: [
              [0.0, '#0d0887'],
              [0.1111111111111111, '#46039f'],
              [0.2222222222222222, '#7201a8'],
              [0.3333333333333333, '#9c179e'],
              [0.4444444444444444, '#bd3786'],
              [0.5555555555555556, '#d8576b'],
              [0.6666666666666666, '#ed7953'],
              [0.7777777777777778, '#fb9f3a'],
              [0.8888888888888888, '#fdca26'],
              [1.0, '#f0f921'],
            ],
            type: 'histogram2dcontour',
          },
        ],
        mesh3d: [
          {
            colorbar: {
              outlinewidth: 0,
              ticks: '',
            },
            type: 'mesh3d',
          },
        ],
        parcoords: [
          {
            line: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'parcoords',
          },
        ],
        pie: [
          {
            automargin: true,
            type: 'pie',
          },
        ],
        scatter: [
          {
            marker: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'scatter',
          },
        ],
        scatter3d: [
          {
            line: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            marker: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'scatter3d',
          },
        ],
        scattercarpet: [
          {
            marker: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'scattercarpet',
          },
        ],
        scattergeo: [
          {
            marker: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'scattergeo',
          },
        ],
        scattergl: [
          {
            marker: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'scattergl',
          },
        ],
        scattermapbox: [
          {
            marker: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'scattermapbox',
          },
        ],
        scatterpolar: [
          {
            marker: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'scatterpolar',
          },
        ],
        scatterpolargl: [
          {
            marker: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'scatterpolargl',
          },
        ],
        scatterternary: [
          {
            marker: {
              colorbar: {
                outlinewidth: 0,
                ticks: '',
              },
            },
            type: 'scatterternary',
          },
        ],
        surface: [
          {
            colorbar: {
              outlinewidth: 0,
              ticks: '',
            },
            colorscale: [
              [0.0, '#0d0887'],
              [0.1111111111111111, '#46039f'],
              [0.2222222222222222, '#7201a8'],
              [0.3333333333333333, '#9c179e'],
              [0.4444444444444444, '#bd3786'],
              [0.5555555555555556, '#d8576b'],
              [0.6666666666666666, '#ed7953'],
              [0.7777777777777778, '#fb9f3a'],
              [0.8888888888888888, '#fdca26'],
              [1.0, '#f0f921'],
            ],
            type: 'surface',
          },
        ],
        table: [
          {
            cells: {
              fill: {
                color: '#EBF0F8',
              },
              line: {
                color: 'white',
              },
            },
            header: {
              fill: {
                color: '#C8D4E3',
              },
              line: {
                color: 'white',
              },
            },
            type: 'table',
          },
        ],
      },
      layout: {
        annotationdefaults: {
          arrowcolor: '#2a3f5f',
          arrowhead: 0,
          arrowwidth: 1,
        },
        autotypenumbers: 'strict',
        coloraxis: {
          colorbar: {
            outlinewidth: 0,
            ticks: '',
          },
        },
        colorscale: {
          diverging: [
            [0, '#8e0152'],
            [0.1, '#c51b7d'],
            [0.2, '#de77ae'],
            [0.3, '#f1b6da'],
            [0.4, '#fde0ef'],
            [0.5, '#f7f7f7'],
            [0.6, '#e6f5d0'],
            [0.7, '#b8e186'],
            [0.8, '#7fbc41'],
            [0.9, '#4d9221'],
            [1, '#276419'],
          ],
          sequential: [
            [0.0, '#0d0887'],
            [0.1111111111111111, '#46039f'],
            [0.2222222222222222, '#7201a8'],
            [0.3333333333333333, '#9c179e'],
            [0.4444444444444444, '#bd3786'],
            [0.5555555555555556, '#d8576b'],
            [0.6666666666666666, '#ed7953'],
            [0.7777777777777778, '#fb9f3a'],
            [0.8888888888888888, '#fdca26'],
            [1.0, '#f0f921'],
          ],
          sequentialminus: [
            [0.0, '#0d0887'],
            [0.1111111111111111, '#46039f'],
            [0.2222222222222222, '#7201a8'],
            [0.3333333333333333, '#9c179e'],
            [0.4444444444444444, '#bd3786'],
            [0.5555555555555556, '#d8576b'],
            [0.6666666666666666, '#ed7953'],
            [0.7777777777777778, '#fb9f3a'],
            [0.8888888888888888, '#fdca26'],
            [1.0, '#f0f921'],
          ],
        },
        colorway: [
          '#636efa',
          '#EF553B',
          '#00cc96',
          '#ab63fa',
          '#FFA15A',
          '#19d3f3',
          '#FF6692',
          '#B6E880',
          '#FF97FF',
          '#FECB52',
        ],
        font: {
          color: '#2a3f5f',
        },
        geo: {
          bgcolor: 'white',
          lakecolor: 'white',
          landcolor: '#E5ECF6',
          showlakes: true,
          showland: true,
          subunitcolor: 'white',
        },
        hoverlabel: {
          align: 'left',
        },
        hovermode: 'closest',
        mapbox: {
          style: 'light',
        },
        paper_bgcolor: 'white',
        plot_bgcolor: '#E5ECF6',
        polar: {
          angularaxis: {
            gridcolor: 'white',
            linecolor: 'white',
            ticks: '',
          },
          bgcolor: '#E5ECF6',
          radialaxis: {
            gridcolor: 'white',
            linecolor: 'white',
            ticks: '',
          },
        },
        scene: {
          xaxis: {
            backgroundcolor: '#E5ECF6',
            gridcolor: 'white',
            gridwidth: 2,
            linecolor: 'white',
            showbackground: true,
            ticks: '',
            zerolinecolor: 'white',
          },
          yaxis: {
            backgroundcolor: '#E5ECF6',
            gridcolor: 'white',
            gridwidth: 2,
            linecolor: 'white',
            showbackground: true,
            ticks: '',
            zerolinecolor: 'white',
          },
          zaxis: {
            backgroundcolor: '#E5ECF6',
            gridcolor: 'white',
            gridwidth: 2,
            linecolor: 'white',
            showbackground: true,
            ticks: '',
            zerolinecolor: 'white',
          },
        },
        shapedefaults: {
          line: {
            color: '#2a3f5f',
          },
        },
        ternary: {
          aaxis: {
            gridcolor: 'white',
            linecolor: 'white',
            ticks: '',
          },
          baxis: {
            gridcolor: 'white',
            linecolor: 'white',
            ticks: '',
          },
          bgcolor: '#E5ECF6',
          caxis: {
            gridcolor: 'white',
            linecolor: 'white',
            ticks: '',
          },
        },
        title: {
          x: 0.05,
        },
        xaxis: {
          automargin: true,
          gridcolor: 'white',
          linecolor: 'white',
          ticks: '',
          title: {
            standoff: 15,
          },
          zerolinecolor: 'white',
          zerolinewidth: 2,
        },
        yaxis: {
          automargin: true,
          gridcolor: 'white',
          linecolor: 'white',
          ticks: '',
          title: {
            standoff: 15,
          },
          zerolinecolor: 'white',
          zerolinewidth: 2,
        },
      },
    },
    title: {
      text: 'Test',
    },
    xaxis: {
      anchor: 'y',
      domain: [0.0, 1.0],
      title: {
        text: 'x',
      },
    },
    yaxis: {
      anchor: 'x',
      domain: [0.0, 1.0],
      title: {
        text: 'y',
      },
    },
  },
  config: { modeBarButtonsToRemove: ['toImage'] },
};
/**
 * Main app container. Handles showing/hiding the sidebar nav, and theme classes.
 */
export const Wrapper = ({ loading, theme }) => (
  <div
    className={classnames('kedro-pipeline kedro', {
      'kui-theme--dark': theme === 'dark',
      'kui-theme--light': theme === 'light',
    })}>
    <h1 className="pipeline-title">Kedro-Viz</h1>
    <Sidebar />
    <MetaData />
    <div className="pipeline-wrapper">
      <LargePipelineWarning />
      <FlowChart />
      <LoadingIcon className="pipeline-wrapper__loading" visible={loading} />
    </div>
    <ExportModal />
    <PlotModal
      data={plotData.data}
      layout={plotData.layout}
      config={plotData.config}
    />
  </div>
);

export const mapStateToProps = (state) => ({
  loading: isLoading(state),
  theme: state.theme,
});

export default connect(mapStateToProps)(Wrapper);
