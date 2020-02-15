import React from 'react';
import { GameState } from '../utils/Game.utils';
import { QuestionReadState } from './QuestionReadState/QuestionReadState.component';
import { AnswerList } from './AnswerList/AnswerList.component';
import { withTracker } from "meteor/react-meteor-data";
import { ClientGameManager } from '../utils/ClientGameManager';

type AppPropsType = {

}

type AppStateType = {
    gameState: GameState,
    currentAnswerCardIndixies: number[],
    questionIndex: number
}

class App extends React.Component<AppPropsType, AppStateType> {
    gameManager = ClientGameManager.getInstance();
    state = {
        gameState: GameState.Initial,
        currentAnswerCardIndixies: [],
        questionIndex: 0
    }

    componentDidMount() {
        this.initGameManagerListener();
    }

    initGameManagerListener() {
        this.gameManager.addEventListener("draw-card", event => {
            const cardIndex = event.detail.messageParams.cardIndex;
            this.setState({
                gameState: GameState.AnswerList,
                currentAnswerCardIndixies: [...this.state.currentAnswerCardIndixies, cardIndex]
            });
        });
        this.gameManager.addEventListener('next-turn', event => {
            const questionIndex = event.detail.messageParams.questionIndex;
            this.setState({
                gameState: GameState.QuestionRead,
                questionIndex: questionIndex
            })
        })
    }

    render() {
        const { gameState, currentAnswerCardIndixies, questionIndex } = this.state;
        let appContent;
        switch (gameState) {
            case GameState.Initial:
                appContent = (
                    <div id="start-button-wrapper">
                        <div id="start-button" onClick={this.startGameHandler}>
                            Start
                        </div>
                        <div id="start-button-expl">
                            * При натисненні на кнопку, гра розпочнеться миттєво, тому, будь ласка, дочекайтися поки вcі бажаючі підключаться.
                        </div>
                    </div>
                );
                break;
            case GameState.QuestionRead:
                appContent = <QuestionReadState questionIndex={questionIndex}/>
                break;
            case GameState.AnswerList:
                appContent = <AnswerList answerIndexies={currentAnswerCardIndixies} />
                break;
        }
        return (
            <div id="app">
                {appContent}
            </div>
        );
    }

    private startGameHandler = async () => {
        await this.gameManager.startGame();
        this.setState({
            gameState: GameState.AnswerList
        })
    }
}

export default withTracker(() => {
    ClientGameManager.getInstance().init();
    return {

    }
})(App);
