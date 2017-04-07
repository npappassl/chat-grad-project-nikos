import React, {Component} from "react";
import {ATypes} from "../actions/types";

class SearchFilterInput extends Component {
    constructor(props){
        super(props);
        this.state = {value: ""};
        this.handleChange = this.handleChange.bind(this);

    }
    handleChange(event){
        this.setState({value: event.target.value});
        this.props.dispatch(this.propagateChange(event.target.value));
    }
    propagateChange(value){
        return {
            type: ATypes.SEARCH_FILTER_CHANGED,
            payload: value
        };
    }
    render(){
        return(
                <div className="searchFilterInput">
                    <input id="searchFilterInput" type="text"
                        value={this.state.value} onChange={this.handleChange}
                        placeholder="search for a friend" />
                </div>
        );
    }

}

export default (SearchFilterInput);
