import React, { Component } from 'react';
import trafficData from './data/traffic_bytes';
import './App.css';
import {cloneDeep, filter} from 'lodash';

const filterType = {
  DEFAULT: 0,
  TO: 1,
  FROM: 2
}

const TrafficDataColumns = (props) => {
  const data = cloneDeep(props.data);
  // Add headers to traffic data
  data.unshift({result: {
    'header': 'true',
    'All_Traffic.dest': 'Traffic Data To',
    'All_Traffic.src': 'Traffic Data From',
    'sum_bytes': 'Total Bytes Transferred'
  }});
  return (
      data.map((rowData, i) => {
        return (
          <div className="row" key={i}>
            <div className={`col-md-4 data-to ${rowData.result.header === 'true' ? '' : 'link-like clickable'}`} 
                    onClick={props.handleIpClick}>
                {rowData.result['All_Traffic.dest']}
            </div>
            <div className={`col-md-4 data-from ${rowData.result.header === 'true' ? '' : 'link-like clickable'}`} 
                    onClick={props.handleIpClick}>
                {rowData.result['All_Traffic.src']}
            </div>
            <div className="col-md-4">
                {rowData.result['sum_bytes']}
            </div>
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
          data={props.data}
          handleIpClick={props.handleIpClick}
        />
      </div>
  </div>
  )
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIp: null,
      filter: null,
      tableTitle: 'All Data Traffic',
      trafficData: trafficData
    }
    // Manually bind React component methods to the class
    this.handleIpClick = this.handleIpClick.bind(this);
    this.filterIpData = this.filterIpData.bind(this);
  }

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
          data={this.state.trafficData}
          title={this.state.tableTitle}
          handleIpClick={this.handleIpClick}
        />
      </div>
    );
  }

  handleIpClick(e) {
    const ipAddress = e.currentTarget.textContent;
    const targetClasses = e.currentTarget.className;
    
    this.setState({
      activeIp: ipAddress, 
      filter: targetClasses.indexOf('data-to') !== -1 ? filterType.TO : filterType.FROM
    }, () => {
      // Filter displayed data once state is updated
      this.filterIpData();
    });
  }

  filterIpData() {
    if (!this.state.activeIp) return;

    const data = cloneDeep(trafficData);
    const activeIp = this.state.activeIp;
    const recordKey = this.state.filter !== filterType.FROM ? 'All_Traffic.dest' : 'All_Traffic.src';

    const updatedData = filter(data, (record) => {
      return record.result[recordKey] === activeIp;
    });

    this.setState({
      trafficData: updatedData,
      tableTitle: `Traffic ${this.state.filter !== filterType.FROM ? 'To' : 'From'} ${activeIp}`
    });
  }
}

export default App;
