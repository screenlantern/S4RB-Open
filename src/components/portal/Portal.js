import './portal';
import 'milligram';
import endpoints from '../../api';
import { Component } from 'preact';
import Table from '../cpmu_table/Table';
import { cpmuCalc as calc } from '../../utils';
import {groupBy, forIn} from 'lodash';
import moment from 'moment';

export default
class Portal extends Component {
  constructor() {
    super();
    this.state = {
      data: [],
      period: 'Month',
      dataToDisplay: []
    };

    this.togglePeriod = this.togglePeriod.bind(this);
  }

  componentDidMount() {
    fetch(endpoints.cpmu)
    .then(res => res.json())
    .then(data => {
        this.setState({
          data
        });
        // console.log(this.state.data);
        this.missingDates();
    });
  }

  missingDates() {
     let dates = this.state.data.map(obj => obj.Month );
     //console.log(dates);
     let startd = moment(dates[0]);
     let endd = moment(dates[dates.length -1]);
     console.log(startd);
     console.log(endd);
     let months = endd.diff(startd, 'months', false);
     console.log(months);
     for(let i = 0; i < months; i++){
      console.log(startd.add(1, 'M').toISOString());
     }
  }

  togglePeriod() {
    this.setState({
      period: (this.state.period === 'Month' )? 'Quarter' : 'Month',
      dataToDisplay: (this.state.period === 'Month' ) ? this.displayByQuarter() : this.state.data
    });
  }

  groupQuarterly() {
    const grp = groupBy(this.state.data, obj =>  obj.Quarter);
    return grp;
  }

  cpmuQuarterly(i) {
    let units = 0, comps = 0;
    i.forEach((item) => {
      units +=  item.UnitsSold;
      comps += item.Complaints;
    });
    return(calc(comps, units));
  }

  displayByQuarter() {
    let qrt = [];
    forIn(this.groupQuarterly(), (obj, key) => {
      qrt.push({Quarter: key, Cmpu: this.cpmuQuarterly(obj)});
    });
    return qrt;
  }

	render(props, state) {
		return (
			<div>
				<Table period={state.period} toggle={this.togglePeriod} data={(state.dataToDisplay.length > 0 )? state.dataToDisplay : state.data} />
			</div>
		);
	}
}
