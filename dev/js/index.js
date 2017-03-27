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


import {sendAuthUriRequest} from "./actions/index";


const logger = createLogger();
const store = createStore(
    allReducers,
    applyMiddleware(thunk, promise, logger)
);

// patchStoreToAddLogging(store);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);

var host = location.origin.replace(/^http/, 'ws');
var ws = new WebSocket(host);
ws.onmessage = function (event) {
    console.log(event);
    var li = document.createElement('li');
    li.innerHTML = JSON.parse(event.data);
    document.querySelector('#pings').appendChild(li);
};

//
// function patchStoreToAddLogging(store) {
//   let next = store.dispatch;
//   store.dispatch = function dispatchAndLog(action) {
//     console.log("dispatching", action);
//     let result = next(action);
//     console.log("next state", store.getState());
//     return result
//   }
// }
