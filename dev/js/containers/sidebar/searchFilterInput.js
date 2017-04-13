import React, {Component} from "react";
import {ATypes} from "../../actions/types";
// import Typeahead from "typeahead";

class SearchFilterInput extends Component {
    constructor(props){
        super(props);
        this.state = {value: ""};
        this.handleChange = this.handleChange.bind(this);
        // this.userArray = [];
        // this.textInput;
    }
    // componentDidMount(){
    //     const self = this;
    //     self.userArray = [];
    //     self.ta = Typeahead(self.textInput,
    //         {
    //             source: self.userArray
    //         });
    //
    // }
    // -----------------------------------------------------------
//     componentDidUpdate(){
//         const userObj = this.props.users.users;
//         console.log(userObj);
//         this.userArray.length = 0;
//         if(userObj){
//             Object.keys(userObj).map((key) => {
//                 console.log(userObj[key]);
//                 this.userArray.push(userObj[key].id);
//             });
//         }
//         console.log(this.userArray);
// // -------------------------------------------------------------------------
//         // this.userArray = this.props.users.users.map((key) => {
//         //     return obj[key];
//         // });
//         // console.log(this.userArray);
//         console.log(this.textInput);
//     }
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
                    <input
                        ref={(input) => { this.textInput = input; }}
                        id="searchFilterInput" type="text"
                        value={this.state.value} onChange={this.handleChange}
                        placeholder="search for a friend" />
                </div>
        );
    }

}

export default (SearchFilterInput);
