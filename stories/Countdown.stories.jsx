import React from 'react';
import Provider from "./Provider";

import DefaultCountdown, { Countdown, ConnectedMillitSecondDisplay } from './Countdown';

export default {
  title: 'Example/Countdown',
  component: Countdown,
};

const Template = (args) => <Countdown {...args} />;
const ConnectedTemplate = (args) => <Provider><DefaultCountdown {...args} /></Provider>;
const MultiTemplate = (args) => <Provider>
  <DefaultCountdown {...args} scope="scope1" />
  <DefaultCountdown {...args} scope="scope2" />
  <DefaultCountdown {...args} scope="scope3" />
</Provider>;

export const UnconnectedCountdown = Template.bind({});
UnconnectedCountdown.args = {
  minutes: 0,
  hours: 0,
  seconds: 0,
  milliseconds: 0,
  tick: () => null
};

export const ConnectedCountdown = ConnectedTemplate.bind({});
ConnectedCountdown.args = {
  MsDisplay: ConnectedMillitSecondDisplay
};

export const MultiConnectedCountdown = MultiTemplate.bind({});
MultiConnectedCountdown.args = {
  MsDisplay: ConnectedMillitSecondDisplay
};
