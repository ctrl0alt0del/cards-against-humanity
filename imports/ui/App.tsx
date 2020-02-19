import React from 'react';
import { GameState } from '../utils/Game.utils';
import { withTracker } from "meteor/react-meteor-data";
import { ClientGameManager } from '../utils/ClientGameManager';
import { GameType, GeneralGameSessionType, GeneralPlayerType } from '../utils/Types';
import { PlayersInfo, DisplayPlayersInfoTypeEnum } from './PlayersInfo/PlayersInfo.component';
import { Meteor } from 'meteor/meteor';
import { ClientPlayer } from '../utils/ClientPlayerManager';
import { PlayerCollection } from '../api/Player/PlayerCollection';
import { GameSessionCollection } from "../api/GameSession/GameSession.collection";
import { CardsAgainstHumanityContent } from './CardsAgainstHumanityContent/CardsAgainstHumanityContent.component';

type AppPropsType = {
    players: GeneralPlayerType[],
    gameSession: GeneralGameSessionType,
    me: GeneralPlayerType
}

type AppStateType = {}

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

    /*private readonly onAnswerSelected = (answerIndex: number): void => {
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
        if (this.state.selectedAnswers.length === this.state.maxAnswersForCurrentQuestion) {
            meteorCall("selectAnswer", this.state.selectedAnswers);
        }
    }

    private readonly onResetAnswersList = () => {
        this.setState({
            selectedAnswers: [],
            currentAnswerCardIndixies: this.state.currentAnswerCardIndixies.concat(this.state.selectedAnswers)
        })
    }
    */
    get isReady() {
        const currentUserData = ClientPlayer.me();
        if (currentUserData) {
            return currentUserData.readyFor !== GameType.None;
        } else {
            return false;
        }
    }

    componentDidMount() {
        /*this.initGameManagerListener();*/

        Meteor.call("register", ClientPlayer.getLastConnectionId(), (err, connId) => {
            if (err) {
                console.error(err);
            } else {
                localStorage.setItem('connectionId', connId);
            }
        })
    }

    /*initGameManagerListener() {
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
    }*/

    render() {
        const { players, me, gameSession } = this.props;
        let appContent;
        if (gameSession) {
            switch (gameSession.gameType) {
                case GameType.CardsAgainstHumanity:
                    appContent = <CardsAgainstHumanityContent player={me} session={gameSession} players={players}/>
            }
        } else {
            appContent = (
                <div id="intial-content-wrapper">
                    <div id="connected-users-wrapper">
                        <PlayersInfo players={players} infoType={DisplayPlayersInfoTypeEnum.Ready} />
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
        }
        return (
            <div id="app">
                {appContent}
            </div>
        );
    }

    private startGameHandler = async () => {
        Meteor.call("readyFor", GameType.CardsAgainstHumanity, err => {
            if (err) {
                console.error(err);
            }
        })
    }
}

export default withTracker(() => {
    Meteor.subscribe('me');
    Meteor.subscribe('allPlayers');
    Meteor.subscribe("session");
    const players = PlayerCollection.find({}).fetch();
    const gameSession = GameSessionCollection.findOne({});
    return {
        players,
        me: ClientPlayer.me(),
        gameSession
    }
})(App);
