import React from 'react';
import Provider from "./Provider";

import DefaultCountdown, { Countdown, ConnectedMillitSecondDisplay } from './Countdown';
import { arrayTypeAnnotation } from '@babel/types';

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
const MixedTemplate = ({ count, ...args }) => <Provider>
  <h2>Scope 2</h2>
  <DefaultCountdown {...args} scope="scope2" />
  <h2>Scope 5</h2>
  <DefaultCountdown {...args} scope="scope5" />
  <h2>Scope 'index + 1'</h2>
  {Array.from({length: Math.max(1, count)}).map((_, idx) => <><p>Scope {idx + 1}</p><DefaultCountdown {...args} scope={`scope${idx + 1}`} /></>)}
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

export const MixedConnectedCountdown = MixedTemplate.bind({});
MixedConnectedCountdown.args = {
  MsDisplay: ConnectedMillitSecondDisplay,
  count: 3,

};
