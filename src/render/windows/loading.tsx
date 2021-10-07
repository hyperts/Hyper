import React from "react";
import ReactDOM from "react-dom";
import axios from 'axios';

import '../style/index.css';
import '../style/loading.css'
interface LoadingProps {
    
}

interface LoadingStates {
    artwork: {image: string, name: string, link: string, author: string}
}

class App extends React.Component<LoadingProps, LoadingStates> {
    
    constructor(props: LoadingProps) {
        super(props)
        this.state = {
            artwork: {image:'', author: '', link: '', name: ''}
        }
    }
   
    componentWillMount() {
        axios.get('https://raw.githubusercontent.com/hyperts/hyperassets/main/loadingartwork.json') // TODO: Move this to .env?
        .then((response)=>{
            console.log("Response", response)
            const artworkList = response.data
            const random = Math.floor(Math.random() * artworkList.length);
            this.setState({
                artwork : {
                    image: artworkList[random].image,
                    name: artworkList[random].name,
                    link: artworkList[random].link,
                    author: artworkList[random].author
                }
            })
            console.log("State changed to", this.state.artwork)
        })
        .catch((err)=>{
            console.log(err)
        })
    }

    render() {
        return <>
            <div className={`flex flex-row w-full h-screen bg-bg rounded-md text-white dragger`}>
                <div className={`flex flex-row relative w-1/2 bg-primary rounded-tl-md rounded-bl-md dragger`}>
                    <img src={this.state.artwork.image} className={`rounded-l-md dragger`}></img>
                </div>
                <div className={`flex flex-row relative w-1/2 h-full dragger`}>
                    <div className="cloudWrap dragger">
                        <div className="lightningBolt top-1/3 dragger"></div>   
                    </div>
                    <div className={`absolute bottom-16 w-full text-center dragger`}>
                        <h3 className={`text-xl dragger`}>Hyper is loading</h3>
                        <p className={`text-gray-500 text-sm dragger`}>A chicken's flight record is 13 seconds</p>
                    </div>
                    <span className={`text-subtle absolute bottom-1 w-full text-center text-xs dragger`}>Artwork: {this.state.artwork.name} by {this.state.artwork.author}</span>
                </div>
            </div>
        </>
    }
}

ReactDOM.render(
    <App/>
    ,document.getElementById('root')
    )