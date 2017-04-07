import React,{Component} from "react";
import MessagesContainer from '../containers/messages-container';
import MessageTextArea from '../containers/message-text-area';

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
