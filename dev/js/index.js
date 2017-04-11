import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {createStore, applyMiddleware} from "redux";
import thunk from "redux-thunk";
import promise from "redux-promise";
import createLogger from "redux-logger";
import allReducers from "./reducers";
import App from "./components/App";

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {sendAuthUriRequest} from "./actions/index";


const logger = createLogger();
const store = createStore(
    allReducers,
    applyMiddleware(thunk, promise, logger)
);
const AppStyled = () => (
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>
);
ReactDOM.render(
    <Provider store={store}>
        <AppStyled />
    </Provider>,
    document.getElementById("root")
);
