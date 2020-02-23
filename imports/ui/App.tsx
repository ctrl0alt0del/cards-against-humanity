import React from 'react';
import { withTracker } from "meteor/react-meteor-data";
import { GameType, GeneralGameSessionType, GeneralPlayerType, GeneralVotingType, DirectMessagesEnum } from '../utils/Types';
import { Meteor } from 'meteor/meteor';
import { ClientPlayer } from '../utils/ClientPlayerManager';
import { PlayerCollection } from '../api/Player/PlayerCollection';
import { GameSessionCollection } from "../api/GameSession/GameSession.collection";
import { CardsAgainstHumanityContent } from './CardsAgainstHumanityContent/CardsAgainstHumanityContent.component';
import { InitialScreen } from './InitialScreen/InitialScreen.component';
import { VotingCollection } from '../api/Voting/Voting.collection';
import { VotingDialog } from './VotingDialog/VotingDialog.component';
import { performAssHack } from '../utils/TrashUtils';
import Modal from 'react-awesome-modal';
import { GameButton } from './Helpers/GameButton';

type AppPropsType = {
    players: GeneralPlayerType[],
    gameSession: GeneralGameSessionType,
    me: GeneralPlayerType,
    votings: GeneralVotingType[]
}

type AppStateType = {
    quickAlertData: { message: string, onClose: () => void }
}

declare var Streamy: any;

class App extends React.Component<AppPropsType, AppStateType> {

    state: AppStateType = {
        quickAlertData: null
    }

    private readonly closeAlert = () => {
        const cb = this.state.quickAlertData?.onClose;
        cb && cb();
        this.setState({
            quickAlertData: null
        })
    }

    quickAlert(text: string, callback: () => void) {
        this.setState({
            quickAlertData: { message: text, onClose: callback }
        })
    }

    componentDidMount() {

        Meteor.call("register", ClientPlayer.getLastConnectionId(), (err, connId) => {
            if (err) {
                console.error(err);
            } else {
                localStorage.setItem('connectionId', connId);
            }
        });
        Streamy.on('message', data => {
            const { type } = data;
            switch (type) {
                case DirectMessagesEnum.VibroAssHacking:
                    this.quickAlert('Увага! Дуже важливе повідомлення, яке стосується гри "Чорне по білому". Нажміть "Добре", щоб відкрити повідомлення!', () => performAssHack());
                    return;
            }
        })
    }

    render() {
        const { players, me, gameSession, votings } = this.props;
        const { quickAlertData } = this.state;
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
                <Modal visible={!!quickAlertData} onClickAway={this.closeAlert}>
                    <div id="quick-alert-wrapper">
                        <div id="quick-alert-text">
                            {quickAlertData?.message}
                        </div>
                        <div id="quick-alert-button">
                            <GameButton flat onClick={this.closeAlert}>
                                Добре
                            </GameButton>
                        </div>
                    </div>
                </Modal>
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
