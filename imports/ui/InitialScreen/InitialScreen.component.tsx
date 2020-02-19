import React from 'react';
import { PlayersInfo, DisplayPlayersInfoTypeEnum } from '../PlayersInfo/PlayersInfo.component';
import { GeneralPlayerType, GameType } from '../../utils/Types';
import { Meteor } from 'meteor/meteor';

type InitialScreenPropsType = {
    players: GeneralPlayerType[]
}

type InitialScreenStateType = {

}

export class InitialScreen extends React.Component<InitialScreenPropsType, InitialScreenStateType> {

    
    private startGameHandler = async () => {
        Meteor.call("readyFor", GameType.CardsAgainstHumanity, err => {
            if (err) {
                console.error(err);
            }
        })
    }

    render() {
        const { players } = this.props;
        return (
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
        )
    }
}