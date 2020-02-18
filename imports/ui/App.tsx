import React from 'react';
import { GameState } from '../utils/Game.utils';
import { QuestionReadState } from './QuestionReadState/QuestionReadState.component';
import { AnswerList } from './AnswerList/AnswerList.component';
import { withTracker } from "meteor/react-meteor-data";
import { ClientGameManager } from '../utils/ClientGameManager';
import { PlayerData, AnswerSelectionType } from '../utils/Types';
import { PlayersInfo, DisplayPlayersInfoTypeEnum } from './PlayersInfo/PlayersInfo.component';
import { meteorCall } from '../utils/Common.utils';
import { CSSTransition } from 'react-transition-group';

type AppPropsType = {

}

type AppStateType = {
    gameState: GameState,
    currentAnswerCardIndixies: number[],
    questionIndex: number,
    playersData: PlayerData[],
    selectedAnswers: number[],
    answersForQuestion: AnswerSelectionType[],
    gameScore: number,
    playUpdateScoreAnim: boolean,
    maxAnswersForCurrentQuestion: number
}

class App extends React.Component<AppPropsType, AppStateType> {
    gameManager = ClientGameManager.getInstance();
    state: AppStateType = {
        gameState: GameState.Initial,
        currentAnswerCardIndixies: [],
        questionIndex: null,
        selectedAnswers: [],
        playersData: [],
        answersForQuestion: null,
        gameScore: 0,
        playUpdateScoreAnim: false,
        maxAnswersForCurrentQuestion: 1
    }

    private readonly onAnswerSelected = (answerIndex: number): void => {
        const nextSelectedAnswers = [...this.state.selectedAnswers, answerIndex];

        this.setState({
            selectedAnswers: nextSelectedAnswers,
            currentAnswerCardIndixies: this.state.currentAnswerCardIndixies.filter(index => index !== answerIndex)
        });
    };

    private readonly onBestAnswerSelected = (selectionId: string) => {
        meteorCall("selectBestAnswer", selectionId);
        this.setState({
            gameState: GameState.AnswerList,
            questionIndex: null,
            selectedAnswers: [],
            answersForQuestion: null,
            maxAnswersForCurrentQuestion: 1
        })
    }
    private readonly onAcceptAnswers = () => {
        if(this.state.selectedAnswers.length === this.state.maxAnswersForCurrentQuestion) {
            meteorCall("selectAnswer", this.state.selectedAnswers);
        }
    }

    private readonly onResetAnswersList = () => {
        this.setState({
            selectedAnswers: [],
            currentAnswerCardIndixies: this.state.currentAnswerCardIndixies.concat(this.state.selectedAnswers)
        })
    }

    get isReady() {
        const currentUserData = this.state.playersData.find(data => data.isCurentPlayer);
        if (currentUserData) {
            return currentUserData.ready;
        } else {
            return false;
        }
    }

    componentDidMount() {
        this.initGameManagerListener();
    }

    initGameManagerListener() {
        this.gameManager.addEventListener("draw-card", event => {
            const cardIndex = event.detail.messageParams.cardIndex;
            this.setState({
                gameState: GameState.AnswerList,
                questionIndex: null,
                selectedAnswers: [],
                answersForQuestion: null,
                maxAnswersForCurrentQuestion: 1,
                currentAnswerCardIndixies: [...this.state.currentAnswerCardIndixies, cardIndex]
            });
        });
        this.gameManager.addEventListener('next-turn', event => {
            const questionIndex = event.detail.messageParams.questionIndex;
            this.setState({
                gameState: GameState.QuestionRead,
                questionIndex: questionIndex
            })
        });
        this.gameManager.addEventListener("players-data", event => {
            const pData = event.detail.messageParams.players;
            this.setState({
                playersData: pData
            })
        });
        this.gameManager.addEventListener("answers-ready", event => {
            const data = event.detail.messageParams.data;
            this.setState({
                answersForQuestion: data
            })
        });
        this.gameManager.addEventListener('receive-points', () => {
            this.setState({
                playUpdateScoreAnim: true,
                gameScore: this.state.gameScore + 1
            });
            setTimeout(() => {
                this.setState({
                    playUpdateScoreAnim: false
                })
            }, 400)
        })
        this.gameManager.addEventListener("max-answers", event => {
            const answerCount = event.detail.messageParams.count;
            this.setState({
                maxAnswersForCurrentQuestion: answerCount
            })
        })
    }

    render() {
        const {
            gameState,
            currentAnswerCardIndixies,
            questionIndex,
            playersData,
            selectedAnswers,
            answersForQuestion,
            gameScore,
            playUpdateScoreAnim,
            maxAnswersForCurrentQuestion
        } = this.state;
        let appContent;
        switch (gameState) {
            case GameState.Initial:
                appContent = (
                    <div id="intial-content-wrapper">
                        <div id="connected-users-wrapper">
                            <PlayersInfo players={playersData} infoType={DisplayPlayersInfoTypeEnum.Ready} />
                        </div>
                        {
                            this.isReady ?
                                (
                                    <div id="start-button-expl">
                                        Очікуйте коли інші підключені гравці будуть готові.
                                    </div>
                                ) : (
                                    <div id="start-button" onClick={this.startGameHandler}>
                                        Start
                                    </div>
                                )
                        }
                    </div>
                );
                break;
            case GameState.QuestionRead:
                appContent = <QuestionReadState
                    questionIndex={questionIndex}
                    players={playersData}
                    answers={answersForQuestion}
                    onBestAnswerSelected={this.onBestAnswerSelected}
                />
                break;
            case GameState.AnswerList:
                appContent = <AnswerList
                    selectedAnswers={selectedAnswers}
                    answerIndexies={currentAnswerCardIndixies}
                    maxAnswersCount={maxAnswersForCurrentQuestion}
                    onAnswerSelected={this.onAnswerSelected}
                    onResetAnswersList={this.onResetAnswersList}
                    onAcceptAnswers={this.onAcceptAnswers}
                />
                break;
        }
        return (
            <div id="app">
                {gameState !== GameState.Initial && (
                    <div id="app-status-line">
                        <div id="score-wrapper">
                            <CSSTransition in={playUpdateScoreAnim} classNames="score-update" timeout={300}>
                                <div id="score-card-icon">{gameScore}</div>
                            </CSSTransition>
                        </div>
                    </div>
                )}
                {appContent}
            </div>
        );
    }

    private startGameHandler = async () => {
        await this.gameManager.startGame();
    }
}

export default withTracker(() => {
    ClientGameManager.getInstance().init();
    return {

    }
})(App);
