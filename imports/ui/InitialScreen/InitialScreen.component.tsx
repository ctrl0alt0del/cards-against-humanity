import React from 'react';
import { PlayersInfo, DisplayPlayersInfoTypeEnum } from '../PlayersInfo/PlayersInfo.component';
import { GeneralPlayerType, GameType } from '../../utils/Types';
import { Meteor } from 'meteor/meteor';
import { ClientPlayer } from '/imports/utils/ClientPlayerManager';
import Modal from 'react-awesome-modal';
import { Avatars } from '../../utils/Avatars';
import { GameButton } from '../Helpers/GameButton';
import { PictureTacker } from '../PictureTaker/PictureTaker.component';
import { AvatarCreator } from './AvatarCreator/AvatarCreator.component';

type InitialScreenPropsType = {
    players: GeneralPlayerType[],
    me: GeneralPlayerType
}

type InitialScreenStateType = {
    avatarModalOpened: boolean
}

export class InitialScreen extends React.Component<InitialScreenPropsType, InitialScreenStateType> {

    state: InitialScreenStateType = {
        avatarModalOpened: false
    }

    get isReady() {
        const currentUserData = ClientPlayer.me();
        if (currentUserData) {
            return currentUserData.readyFor !== GameType.None;
        } else {
            return false;
        }
    }

    private startGameHandler = async () => {
        Meteor.call("readyFor", GameType.CardsAgainstHumanity, err => {
            if (err) {
                console.error(err);
            }
        })
    }

    private readonly openCharacterSelection = () => {
        this.setState({
            avatarModalOpened: true
        });
    }

    private readonly setAvatar = (avatarId: string) => {
        this.closeAvatarSelectionModal();
        Meteor.call("setAvatarForCurrentPlayer", avatarId, err => {
            if (err) {
                console.error(err);
            }
        })
    }

    private closeAvatarSelectionModal = () => {
        this.setState({
            avatarModalOpened: false
        });
    }

    render() {
        const { players, me } = this.props;
        const { avatarModalOpened } = this.state;
        const alreadyUsedAvatarsId = players.reduce((total, player) => player.avatarId ? total.concat(player.avatarId) : total, [])
        return (
            <div id="intial-content-wrapper">
                <div id="connected-users-wrapper">
                    <PlayersInfo players={players} infoType={DisplayPlayersInfoTypeEnum.Ready} />
                </div>
                <div id="initials-screen-buttons-wrapper">
                    {me?.avatarId && (this.isReady ?
                        (
                            <div id="start-button-expl">
                                Очікуйте коли інші підключені гравці будуть готові.
                            </div>
                        ) : (
                            <GameButton onClick={this.startGameHandler}>
                                Start
                            </GameButton>
                        ))
                    }
                    <GameButton onClick={this.openCharacterSelection}>
                        Вибрати персонажа
                    </GameButton>
                </div>
                <Modal visible={avatarModalOpened} width="90%" effecft="fadeInDown" onClickAway={this.closeAvatarSelectionModal}>
                    <AvatarCreator
                        alreadyUsedAvatarsId={alreadyUsedAvatarsId}
                        onDefaultAvatarSelected={this.setAvatar}
                    />
                </Modal>
            </div>
        )
    }
}