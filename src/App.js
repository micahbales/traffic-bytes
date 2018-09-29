import React, { Component } from 'react';
import trafficData from './data/traffic_bytes';
import './App.css';

const TrafficDataColumns = (props) => {
  // Add headers to data
  props.data.unshift({result: {
    'header': 'true',
    'All_Traffic.dest': 'Traffic Data Source',
    'All_Traffic.src': 'Traffic Data Destination',
    'sum_bytes': 'Traffic Data Bytes'
  }});

  return (
      props.data.map((rowData, i) => {
        return (
          <div className="row" key={i}>
            <div className="col-md-4">{rowData.result['All_Traffic.dest']}</div>
            <div className="col-md-4">{rowData.result['All_Traffic.src']}</div>
            <div className="col-md-4">{rowData.result['sum_bytes']}</div>
          </div>
        );
      })
  )
};

const PivotTable = (props) => {
  return (
    <div className="row">
    <div className="col-md-8 offset-md-2 text-center">
      <h3>{props.title}</h3>
    </div>
    <div className="col-md-8 offset-md-2">
      <TrafficDataColumns 
        data={props.trafficData}
      />
    </div>
  </div>
  )
};

class App extends Component {
  render() {
    return (
      <div className="App container-fluid">
        <div className="header-logo">
        </div>
        <div className="row">
          <div className="col-md-12 text-center">
            <h1>Traffic Bytes Pivot Table</h1>
          </div>
        </div>
        <PivotTable
          trafficData={trafficData}
          title="All Data"
        />
      </div>
    );
  }
}

export default App;
