import React,{Component} from "react";

export default class Badge extends Component{
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <span className={this.props.className}><p>{this.props.number}</p></span>
        );
    }
}
