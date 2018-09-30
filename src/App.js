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
          <div key={i}>
            <div className="row">
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
        <button className={`btn ${props.history.length < 1 ? 'd-none' : 'btn-danger filter-button'}`}
                onClick={props.handleHistoryBack}>
          Back
        </button>
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
      current: {
        activeIp: null,
        filter: null,
        filterButtonText: '',
        tableTitle: 'All Data Traffic',
        trafficData: trafficData
      },
      history: []
    }
    // Manually bind React component methods to the class
    this.handleIpClick = this.handleIpClick.bind(this);
    this.filterIpData = this.filterIpData.bind(this);
    this.handleSwitchFilter = this.handleSwitchFilter.bind(this);
    this.getFilterButtonText = this.getFilterButtonText.bind(this);
    this.handleHistoryBack = this.handleHistoryBack.bind(this);
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
          data={this.state.current.trafficData}
          title={this.state.current.tableTitle}
          history={this.state.history}
          filterButtonText={this.state.current.filterButtonText}
          handleIpClick={this.handleIpClick}
          handleSwitchFilter={this.handleSwitchFilter}
          handleHistoryBack={this.handleHistoryBack}
        />
      </div>
    );
  }

  handleIpClick(e) {
    const ipAddress = e.currentTarget.textContent;
    const targetClasses = e.currentTarget.className;
    
    const currentState = cloneDeep(this.state.current);
    currentState.activeIp = ipAddress;
    currentState.filter = targetClasses.indexOf('data-to') !== -1 ? filterType.TO : filterType.FROM;
    currentState.filterButtonText = this.getFilterButtonText();

    const newHistory = this.state.current;

    this.setState({
      current: currentState,
      history: this.state.history.concat(newHistory)
    }, () => {
      // Filter displayed data once state is updated
      this.filterIpData();
    });
  }

  handleSwitchFilter() {
    const newHistory = this.state.current;
    const currentState = cloneDeep(this.state.current);
    currentState.filter = this.state.current.filter !== filterType.FROM ? filterType.TO : filterType.FROM;

    this.setState({
      current: currentState,
      history: this.state.history.concat(newHistory)
    }, () => {
      this.filterIpData();
    })
  }

  filterIpData() {
    if (!this.state.current.activeIp) return;

    const data = cloneDeep(trafficData);
    const activeIp = this.state.current.activeIp;
    const recordKey = this.state.current.filter !== filterType.FROM ? 'All_Traffic.dest' : 'All_Traffic.src';

    const updatedData = filter(data, (record) => {
      return record.result[recordKey] === activeIp;
    });

    this.setState({
      current: {
        activeIp: this.state.current.activeIp,
        trafficData: updatedData,
        tableTitle: `Traffic ${this.state.current.filter !== filterType.FROM ? 'To' : 'From'} ${activeIp}`,
        filter: this.state.current.filter === filterType.FROM ? filterType.TO : filterType.FROM,
        filterButtonText: this.getFilterButtonText()
      }
    });
  }

  getFilterButtonText() {
    return this.state.current.filter === filterType.FROM ? 'View Traffic TO' : 'View Traffic FROM';
  }

  handleHistoryBack() {
    const history = cloneDeep(this.state.history);
    const lastSavePoint = history.pop();
    const resetValues = {
      activeIp: null,
      filter: null,
      filterButtonText: '',
      tableTitle: 'All Data Traffic',
      trafficData: trafficData
    };

    this.setState({
      current: this.state.history.length > 1 ? lastSavePoint : resetValues,
      history: this.state.history.length > 1 ? history : []
    })
  }
}

export default App;
