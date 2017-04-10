import React, {Component} from "react";

export default class UserDetailSpan extends Component{
    constructor(props){
        super(props);
    }
    componentWillUpdate(){
        this.editGroupButtonClass = "hidden";
        if(this.props.user.group){
            this.editGroupButtonClass = "button";
        }
        console.log("mountew",this.props.user.group );
    }
    render(){
        return (
            <span id="userDetailSpan">
                <span id="userThumbSpan">
                    <img id="userThumb" height="64" src={this.props.user.avatarUrl} />
                </span>
                <span id="userName">
                    <span >{this.props.user.id}</span>
                    <span id="userDescription">Description: {this.props.user.description}</span>
                </span>
                <button className={this.editGroupButtonClass}
                    // onClick={this.props.openEditGroupDialogue}
                    id="editGroupButton">
                    Edit group
                </button>
            </span>
        );
    }
}
