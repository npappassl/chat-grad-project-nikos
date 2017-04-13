import React, {Component} from "react";
import {ATypes} from "../../actions/types";
import TypeaheadDiv from "./typeahead-div-container";

class SearchFilterInput extends Component {
    constructor(props){
        super(props);
        this.state = {value: "", typeahead: false};
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);

    }
    handleChange(event){
        if (event.target.value === "") {
            this.setState({value: event.target.value, typeahead:false});
        } else {
            this.setState({value: event.target.value, typeahead:true});
        }
        this.props.dispatch(this.propagateChange(event.target.value));
    }
    handleBlur(event){
        console.log(event.target);
        setTimeout(() =>{
            this.setState({typeahead: false});
        },300);
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
                    <input
                        ref={(input) => { this.textInput = input; }}
                        id="searchFilterInput" type="text"
                        value={this.state.value} onChange={this.handleChange}
                        onBlur={this.handleBlur}
                        placeholder="search for a friend" />
                        <TypeaheadDiv filter={this.state.value} show={this.state.typeahead} />
                </div>
        );
    }

}

export default (SearchFilterInput);
