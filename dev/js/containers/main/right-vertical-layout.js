import React,{Component} from "react";
import MessagesContainer from './messages-container';
import MessageTextArea from './message-text-area';

class RightVerticalLayout extends Component{
    render(){
        return(
            <div id="rightVerticalLayout">
                <MessagesContainer />
                <MessageTextArea />
            </div>
        );
    }
}

export default (RightVerticalLayout);
