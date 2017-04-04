import React,{Component} from "react";

class LoginScreen extends Component{
    render(){
        return(
            <div id="loginWrap">
                <a href={this.props.loginUri}>Log In</a>
            </div>
        );
    }
}

export default LoginScreen;
