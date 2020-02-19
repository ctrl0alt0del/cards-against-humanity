import React from 'react';
import { GameState } from '../utils/Game.utils';
import { withTracker } from "meteor/react-meteor-data";
import { GameType, GeneralGameSessionType, GeneralPlayerType } from '../utils/Types';
import { Meteor } from 'meteor/meteor';
import { ClientPlayer } from '../utils/ClientPlayerManager';
import { PlayerCollection } from '../api/Player/PlayerCollection';
import { GameSessionCollection } from "../api/GameSession/GameSession.collection";
import { CardsAgainstHumanityContent } from './CardsAgainstHumanityContent/CardsAgainstHumanityContent.component';
import { InitialScreen } from './InitialScreen/InitialScreen.component';

type AppPropsType = {
    players: GeneralPlayerType[],
    gameSession: GeneralGameSessionType,
    me: GeneralPlayerType
}

type AppStateType = {}

class App extends React.Component<AppPropsType, AppStateType> {
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

    get isReady() {
        const currentUserData = ClientPlayer.me();
        if (currentUserData) {
            return currentUserData.readyFor !== GameType.None;
        } else {
            return false;
        }
    }

    componentDidMount() {

        Meteor.call("register", ClientPlayer.getLastConnectionId(), (err, connId) => {
            if (err) {
                console.error(err);
            } else {
                localStorage.setItem('connectionId', connId);
            }
        })
    }

    render() {
        const { players, me, gameSession } = this.props;
        let appContent;
        if (gameSession) {
            switch (gameSession.gameType) {
                case GameType.CardsAgainstHumanity:
                    appContent = <CardsAgainstHumanityContent player={me} session={gameSession} players={players}/>
            }
        } else {
            appContent = <InitialScreen players={players} />;
        }
        return (
            <div id="app">
                {appContent}
            </div>
        );
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
