import React from 'react';
import { withTracker } from "meteor/react-meteor-data";
import { GameType, GeneralGameSessionType, GeneralPlayerType, GeneralVotingType } from '../utils/Types';
import { Meteor } from 'meteor/meteor';
import { ClientPlayer } from '../utils/ClientPlayerManager';
import { PlayerCollection } from '../api/Player/PlayerCollection';
import { GameSessionCollection } from "../api/GameSession/GameSession.collection";
import { CardsAgainstHumanityContent } from './CardsAgainstHumanityContent/CardsAgainstHumanityContent.component';
import { InitialScreen } from './InitialScreen/InitialScreen.component';
import { VotingCollection } from '../api/Voting/Voting.collection';
import { VotingDialog } from './VotingDialog/VotingDialog.component';

type AppPropsType = {
    players: GeneralPlayerType[],
    gameSession: GeneralGameSessionType,
    me: GeneralPlayerType,
    votings: GeneralVotingType[]
}

type AppStateType = {}

class App extends React.Component<AppPropsType, AppStateType> {

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
        const { players, me, gameSession, votings } = this.props;
        let appContent;
        if (gameSession) {
            switch (gameSession.gameType) {
                case GameType.CardsAgainstHumanity:
                    appContent = <CardsAgainstHumanityContent player={me} session={gameSession} players={players} />
            }
        } else {
            appContent = <InitialScreen players={players} me={me} />;
        }
        return (
            <div id="app">
                {appContent}
                <VotingDialog votings={votings} players={players} />
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('me');
    const players = PlayerCollection.find({}).fetch();
    if (ClientPlayer.me()) {
        Meteor.subscribe("session");
    }
    const gameSession = GameSessionCollection.findOne({});
    if (gameSession) {
        Meteor.subscribe('allPlayers', gameSession._id);
        Meteor.subscribe("voting");
    } else {
        Meteor.subscribe('allPlayers');
    }
    const votings = VotingCollection.find().fetch();
    return {
        players,
        me: ClientPlayer.me(),
        gameSession,
        votings
    }
})(App);
