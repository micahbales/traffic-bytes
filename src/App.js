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
          <div>
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
            <div className={`row no-data-row ${props.data.length < 1 ? 'text-center' : 'd-none'}`}>
              <div className="col-md-4 offset-md-4">
                <h5 className="text-center">No data for this filter</h5>
              </div>
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
        <button className={`btn ${props.filterButtonText === '' ? 'd-none' : 'btn-primary filter-button'}`} 
                onClick={props.handleSwitchFilter}>
            {props.filterButtonText}
        </button>
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
      filterButtonText: '',
      tableTitle: 'All Data Traffic',
      trafficData: trafficData
    }
    // Manually bind React component methods to the class
    this.handleIpClick = this.handleIpClick.bind(this);
    this.filterIpData = this.filterIpData.bind(this);
    this.handleSwitchFilter = this.handleSwitchFilter.bind(this);
    this.getFilterButtonText = this.getFilterButtonText.bind(this);
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
          filterButtonText={this.state.filterButtonText}
          handleIpClick={this.handleIpClick}
          handleSwitchFilter={this.handleSwitchFilter}
        />
      </div>
    );
  }

  handleIpClick(e) {
    const ipAddress = e.currentTarget.textContent;
    const targetClasses = e.currentTarget.className;

    this.setState({
      activeIp: ipAddress, 
      filter: targetClasses.indexOf('data-to') !== -1 ? filterType.TO : filterType.FROM,
      filterButtonText: this.getFilterButtonText()
    }, () => {
      // Filter displayed data once state is updated
      this.filterIpData();
    });
  }

  handleSwitchFilter() {
    console.log('handleSwitchFilter');
    this.setState({
      filter: this.state.filter === filterType.FROM ? filterType.TO : filterType.FROM,
      filterButtonText: this.getFilterButtonText()
    }, () => {
      this.filterIpData();
    })
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
      tableTitle: `Traffic ${this.state.filter !== filterType.FROM ? 'To' : 'From'} ${activeIp}`,
      filterButtonText: this.getFilterButtonText()
    });
  }

  getFilterButtonText() {
    return this.state.filter === filterType.FROM ? 'View Traffic FROM' : 'View Traffic TO';
  }
}

export default App;
