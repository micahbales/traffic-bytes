import React, { Component } from 'react';
import trafficData from './data/traffic_bytes';
import './App.css';
import {cloneDeep, filter} from 'lodash';
import bannerLogo from './img/ie-logo-banner.png';

const filterType = {
  DEFAULT: 0,
  TO: 1,
  FROM: 2
}

// This is the default starting state for the application
const defaultState = {
  current: {
    activeIp: null,
    filter: null,
    filterButtonText: '',
    tableTitle: 'All Data Traffic',
    trafficData: trafficData
  },
  history: {
    back: [],
    forward: []
  },
};

const TrafficDataColumns = (props) => {
  return (
      <div>
        <div className="row text-center header">
          <div className={`col-4 ${props.filter === filterType.FROM ? 'highlighted-header' : ''}`}><h5>Data From</h5></div>
          <div className={`col-4 ${props.filter === filterType.TO ? 'highlighted-header' : ''}`}><h5>Data To</h5></div>
          <div className="col-4 "><h5>Total Bytes</h5></div>
        </div>
        {
          props.data.map((rowData, i) => {
            return (
              <div key={i}>
                <div className="row text-center">
                  <div className={`col-4 data-from ${rowData.result.header === 'true' ? '' : 'link-like clickable'}`} 
                          onClick={props.handleIpClick}>
                      {rowData.result['All_Traffic.src']}
                  </div>
                  <div className={`col-4 data-to ${rowData.result.header === 'true' ? '' : 'link-like clickable'}`} 
                          onClick={props.handleIpClick}>
                      {rowData.result['All_Traffic.dest']}
                  </div>
                  <div className="col-4">
                      {rowData.result['sum_bytes']}
                  </div>
                </div>
              </div>
            );
          })
        }
        <div className={`row no-data-row ${!props.data.length ? 'text-center' : 'd-none'}`}>
          <div className="col">
            <h5 className="text-center">No data for this filter</h5>
          </div>
        </div>
      </div>
      
  )
};

const PivotTable = (props) => {
  const bytesSum = props.data.reduce((acc, datum) => acc + Number(datum.result.sum_bytes), 0);

  return (
    <div className="row">
      <div className="col-8 offset-2 text-center">
        <div className="row">
          <div className="col-12 col-sm-3 offset-sm-1 col-md-2 offset-md-3">
            <button className={`btn ${!props.history.back.length ? 'invisible' : 'control-button back-button'}`}
                    onClick={props.handleHistoryBack}>
              Back
            </button>
          </div>

          <div className="col-12 col-sm-3 col-md-2">
            <button className={`btn ${!props.history.back.length && !props.history.forward.length ? 
                    'invisible' : 'control-button reset-button'}`}
                    onClick={props.handleReset}>
              All Data
            </button>
          </div>

          <div className="col-12 col-sm-3 col-md-2">
            <button className={`btn ${!props.history.forward.length ? 'invisible' : 'control-button forward-button'}`}
                    onClick={props.handleHistoryForward}>
              Forward
            </button>
          </div>
        </div>

        <div className="col-12">
          <h3 className={`${props.filter ? 'ip-selected' : ''}`}>{props.title}</h3>
          <p className={`${props.filter ? 'ip-selected' : 'invisible'}`}>({`Grand Total: ${bytesSum} bytes`})</p>
          
          <button className={`btn ${!props.filterButtonText ? 'invisible' : 'control-button filter-button'}`} 
                  onClick={props.handleSwitchFilter}>
              {props.filterButtonText}
          </button>
        </div>
      </div>

      <div className="col-8 offset-2">
        <TrafficDataColumns 
          data={props.data}
          handleIpClick={props.handleIpClick}
          filter={props.filter}
        />
      </div>
  </div>
  )
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    // Manually bind React component methods to the class
    this.handleIpClick = this.handleIpClick.bind(this);
    this.filterIpData = this.filterIpData.bind(this);
    this.handleSwitchFilter = this.handleSwitchFilter.bind(this);
    this.getFilterButtonText = this.getFilterButtonText.bind(this);
    this.handleHistoryBack = this.handleHistoryBack.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleHistoryForward = this.handleHistoryForward.bind(this);
  }

  componentWillMount() {
    // Before the component is mounted, check local storage for previous state
    const storedState = localStorage.getItem('persistedAppState');
    if (storedState !== defaultState) {
      this.setState(JSON.parse(storedState));
    } 
  }

  componentDidUpdate() {
    // Whenever the component updates, save current state in local storage
    const storedState = localStorage.getItem('persistedAppState');
    if (storedState !== defaultState) {
      localStorage.setItem('persistedAppState', JSON.stringify(this.state));
    }
  }

  render() {
    const pivotTableProps = {
      data: this.state.current.trafficData,
      title: this.state.current.tableTitle,
      history: this.state.history,
      filter: this.state.current.filter,
      filterButtonText: this.state.current.filterButtonText,
      handleIpClick: this.handleIpClick,
      handleSwitchFilter: this.handleSwitchFilter,
      handleHistoryBack: this.handleHistoryBack,
      handleReset: this.handleReset,
      handleHistoryForward: this.handleHistoryForward
    };

    return (
      <div className="App container-fluid">
        <div className="row">
          <div className="col-8 offset-2">
            <img className="header-logo mx-auto d-block img-fluid" alt="Insight Engines Logo" src={bannerLogo}></img>
          </div>
        </div>
        
        <div className="row">
          <div className="col-12 text-center">
            <h1>Traffic Bytes Pivot Table</h1>
          </div>
        </div>
        <PivotTable
          {...pivotTableProps}
        />
      </div>
    );
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
        filter: this.state.current.filter !== filterType.FROM ? filterType.TO : filterType.FROM,
        filterButtonText: this.getFilterButtonText()
      }
    });
  }

  setStateAndFilterData(currentState) {
    const newHistory = this.state.current;
    this.setState({
      current: currentState,
      history: {
        back: this.state.history.back.concat(newHistory),
        forward: []
      }
    }, () => {
      // Once state is updated, filter data to be displayed
      this.filterIpData();
    });
  }

  handleIpClick(e) {
    const ipAddress = e.currentTarget.textContent;
    const targetClasses = e.currentTarget.className;
    
    const currentState = cloneDeep(this.state.current);
    currentState.activeIp = ipAddress;
    currentState.filter = targetClasses.indexOf('data-to') !== -1 ? filterType.TO : filterType.FROM;
    currentState.filterButtonText = this.getFilterButtonText();

    this.setStateAndFilterData(currentState);
  }

  handleSwitchFilter() {
    const currentState = cloneDeep(this.state.current);
    currentState.filter = this.state.current.filter === filterType.FROM ? filterType.TO : filterType.FROM;

    this.setStateAndFilterData(currentState);
  }

  getFilterButtonText() {
    return this.state.current.filter === filterType.FROM ? 'View Traffic TO' : 'View Traffic FROM';
  }

  handleHistoryBack() {
    const history = cloneDeep(this.state.history);
    const lastSavePoint = history.back.pop();

    this.setState({
      current: this.state.history.back.length > 0 ? lastSavePoint : defaultState,
      history: {
        back: this.state.history.back.length > 0 ? history.back : [],
        forward: this.state.history.forward.concat(this.state.current)
      }
    });
  }

  handleHistoryForward() {
    const history = cloneDeep(this.state.history);
    const nextSavePoint = history.forward.pop();
    
    if (!nextSavePoint) return;

    this.setState({
      current: nextSavePoint,
      history: {
        back: history.back.concat(this.state.current),
        forward: history.forward
      }
    });
  }

  handleReset() {
    this.setState(defaultState);
  }
}

export default App;
