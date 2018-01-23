import _ from 'lodash'
import React from 'react';
import { Bar, Line } from 'react-chartjs-2';

// Logic
import { getSNAPBenefits } from '../programs/federal/snap';
import { getHousingBenefit } from '../programs/massachusetts/housing';

// Data
import { PROGRAM_CHART_VALUES } from '../utils/PROGRAM_CHART_VALUES'

// Our Components
import { FormPartsContainer } from './formHelpers';


const SNAPColor     = PROGRAM_CHART_VALUES.SNAP.color,
      SNAPName      = PROGRAM_CHART_VALUES.SNAP.name,
      section8Color = PROGRAM_CHART_VALUES.section8.color,
      section8Name  = PROGRAM_CHART_VALUES.section8.name,
      incomeColor   = PROGRAM_CHART_VALUES.income.color,
      incomeName    = PROGRAM_CHART_VALUES.income.name;


// Helper functions to format vlaues
const formatAxis = function ( label ) {
  /* Adds 1,000s separators to graph axes */
  return label.toLocaleString( "en-US" );
};

const toFancyMoneyStr = function ( toFormat ) {
  return toFormat.toLocaleString("en-US", {style:"currency",currency:"USD"}).replace('.00','');
}

const formatTitle = function (tooltipItems, data) {
  var toFormat = data.labels[tooltipItems[0].index];
  return toFancyMoneyStr( toFormat );
};

const formatLabel =  function(tooltipItem, data) {
  /* From https://github.com/chartjs/Chart.js/issues/2386 */
  return data.datasets[tooltipItem.datasetIndex].label
          + ": " + toFancyMoneyStr( tooltipItem.yLabel );
}


/* Note: default tooltip for chart.js 2.0+:
 * options: { tooltips: { callbacks: {
 *  label: function(tooltipItem, data) {
 *    return tooltipItem.yLabel;
 *  }
 * }}}
 */

const ResultsGraph = (props) => {
  var xRange = _.range(0, 100000, 1000);
  /** Need a new object so client's data doesn't get changed. */
  var fakeClient = _.cloneDeep( props.client );

  var snapData = xRange.map(annualIncome => {
      fakeClient.future.earned = annualIncome/12;
      return getSNAPBenefits(fakeClient, 'future') * 12});

  /** Section-8 Housing Choice Voucher */
  /** @todo Base this rent on FMR areas and client area of residence if no rent available. */
  fakeClient.current.contractRent = fakeClient.current.contractRent || 700;
  fakeClient.current.earned = 0;
  var housingData = xRange.map(function ( annualIncome ) {
    // New renting data
    fakeClient.future.earned = annualIncome/12;

    var monthlySubsidy  = getHousingBenefit( fakeClient, 'future' ),
        yearlySubsidy   = monthlySubsidy * 12;

    // Prep for next loop
    var newShare = fakeClient.current.contractRent - monthlySubsidy;
    fakeClient.current.rentShare  = newShare;
    fakeClient.current.earned     = annualIncome/12;

    return yearlySubsidy;
  });

  var lineProps = {
    data: {
      labels: xRange,
      datasets: [
        {
          label: SNAPName,
          borderColor: SNAPColor,
          data: snapData,
          fill: false
        },
        {
          label: section8Name,
          borderColor: section8Color,
          data: housingData,
          fill: false
        },
      ]
    },  // end `data`
    options: {
      title: {
        display: true,
          text: 'Individual Benefit Amounts for Household as Income Changes'
      },
      showLines: true,
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Benefit Value ($)'
          },
          ticks: {
            beginAtZero: true,
            /* chart.js v2.7 requires a callback function */
            callback: formatAxis
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Annual Income ($)'
          },
          ticks: {
            callback: formatAxis
          }
        }]
      },  // end `scales`
      tooltips: {
        callbacks: {
          title: formatTitle,
          label: formatLabel
        }
      }  // end `tooltips`
    }  // end `options`
  };  // end lineProps

  const stackedBarProps = {
    data: {
      labels: xRange,
      datasets: [
        {
          label: SNAPName,
          backgroundColor: SNAPColor,
          data: snapData
        },
        {
          label: section8Name,
          backgroundColor: section8Color,
          data: housingData
        },
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Stacked Benefit Amounts for Household as Income Changes'
      },
      scales: {
        yAxes: [{
          stacked: true,
          scaleLabel: {
            display: true,
              labelString: 'Total Benefit Values ($)'
          },
          ticks: {
            beginAtZero: true,
            callback: formatAxis
          }
        }],
        xAxes: [{
          stacked: true,
          scaleLabel: {
            display: true,
              labelString: 'Annual Income ($)'
          },
          ticks: {
            callback: formatAxis
          }
        }]
      },
      tooltips: {
        callbacks: {
          title: formatTitle,
          label: formatLabel
        }
      }
    }
  };

  const stackedAreaProps = {
    data: {
      labels: xRange.slice(0, 50),
      datasets: [
        {
          label: incomeName,
          backgroundColor: incomeColor,
          data: xRange.slice(0, 50),
          fill: "origin"
        },
        {
          label: SNAPName,
          backgroundColor: SNAPColor,
          data: snapData.slice(0, 50)
        },
        {
          label: section8Name,
          backgroundColor: section8Color,
          data: housingData.slice(0, 50)
        },
      ]
    },
    options: {
      title: {
        display: true,
        text: 'All Money Coming in as Income Changes'
      },
      elements: {
        line: {
          fill: '-1'
        },
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 10
        }
      },
      scales: {
        yAxes: [{
          stacked: true,
          scaleLabel: {
            display: true,
              labelString: 'Total Money Coming In ($)'
          },
          ticks: {
            beginAtZero: true,
            callback: formatAxis
          }
        }],
        xAxes: [{
          stacked: true,
          scaleLabel: {
            display: true,
              labelString: 'Annual Income ($)'
          },
          ticks: {
            callback: formatAxis
          }
        }]
      },
      tooltips: {
        callbacks: {
          title: function(tooltipItems, data) {
            const { index } = tooltipItems[0];
            return toFancyMoneyStr( _.sumBy( data.datasets, dataset => dataset.data[index] ))
          },
          label: formatLabel
        }
      }
    }
  }

  return (
    <div className = 'result-page flex-item flex-column'>
      <FormPartsContainer
        title     = {'Results'}
        left      = {{ name: 'Go Back', func: props.previousStep }}
        right      = {{ name: 'Reset', func: reloadPage }}
      >
         <div>
           <Line {...lineProps} />
           <Bar {...stackedBarProps} />
           <Line {...stackedAreaProps} />
          </div>
      </FormPartsContainer>
    </div>
  )

};  // End Results()

const reloadConfirmationMessage = 'This action will erase all current data. Are you sure you want to do this?';
function reloadPage() {
  if (window.confirm(reloadConfirmationMessage)) {
    window.onbeforeunload = null;
    window.location.reload();
  }
}

export default ResultsGraph
