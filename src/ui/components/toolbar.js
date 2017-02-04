import React from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import Slider from 'material-ui/Slider';
import StateChangeStepper from './stateChangeStepper';
import SliderBar from './slider';

const Toolbar = (props) => {
  const { getData, sendUpdate, history, curIndex, getCurAction, curAction } = props;

  return (
    <Tabs>
      <Tab label="Time Travel" >
        <div style={styles.text}> {curAction} </div>
        <SliderBar
          getData={getData}
          sendUpdate={sendUpdate}
          getCurAction={getCurAction}
          history={history}
        />
      </Tab>
      <Tab label="Undo/Redo" >
        <div>
          <StateChangeStepper
            getData={getData}
            sendUpdate={sendUpdate}
            history={history}
            curIndex={curIndex}
            curAction={curAction}
            getCurAction={getCurAction}
          />
        </div>
      </Tab>
      <Tab label="Dependency Tree">
        <div>
          <h2 style={styles.headline}>Plant Tree Here</h2>
          <p>
            And watch it grow!
          </p>
        </div>
      </Tab>
    </Tabs>
  );
};

const styles = {
  headline: {
    fontSize: 24,
    paddingTop: 16,
    marginBottom: 12,
    fontWeight: 400,
  },
  text: {
    marginLeft: 5,
    paddingTop: 10
  }
};

Toolbar.propTypes = {
  getData: React.PropTypes.func,
  sendUpdate: React.PropTypes.func,
  getCurAction: React.PropTypes.func,
  history: React.PropTypes.array,
  curIndex: React.PropTypes.number,
  curAction: React.PropTypes.string
};

export default Toolbar;
