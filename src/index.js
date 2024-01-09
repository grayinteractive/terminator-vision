import React from 'react';
import './index.css';
import App from './App';
import rootInstance from './rootInstance';
import * as serviceWorker from './serviceWorker';

rootInstance.render(React.createElement(App));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
