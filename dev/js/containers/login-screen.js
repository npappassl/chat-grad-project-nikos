import React,{Component} from "react";
import {connect} from 'react-redux';

class LoginScreen extends Component{
    render(){
        return(
            <a href={this.props.loginUri}>Log In</a>
        );
    }
}

export default LoginScreen;
