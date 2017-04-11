import React,{Component} from "react";
import RaisedButton from 'material-ui/RaisedButton';

class LoginScreen extends Component{
    render(){
        return(

            <div id="loginWrap">
                <a href={this.props.loginUri}>Log In</a>
                <RaisedButton>Log In</RaisedButton>
            </div>
        );
    }
}

export default LoginScreen;
