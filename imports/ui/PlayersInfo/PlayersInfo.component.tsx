import React from 'react';
import { PlayerType, GeneralPlayerType, GameType } from '../../utils/Types';
import { ClientPlayer } from '../../utils/ClientPlayerManager';
import { Avatars } from '../../utils/Avatars';
import { PlayerIcon } from '../Helpers/Player';

export enum DisplayPlayersInfoTypeEnum {
    Ready,
    Answered
}

type PlayersInfoPropsType = {
    players: GeneralPlayerType[],
    infoType: DisplayPlayersInfoTypeEnum
}

export class PlayersInfo extends React.Component<PlayersInfoPropsType> {
    render() {
        const { players, infoType } = this.props;
        const playersToDisplay = players.filter(player => infoType !== DisplayPlayersInfoTypeEnum.Answered || player.readyFor === GameType.CardsAgainstHumanity);
        return (
            <div className="players-info-wrapper">
                {playersToDisplay.map(data => {
                    let highlight = false;
                    if (data._id === ClientPlayer.me()?._id && infoType === DisplayPlayersInfoTypeEnum.Answered) {
                        return null;
                    }
                    switch (infoType) {
                        case DisplayPlayersInfoTypeEnum.Ready:
                            highlight = data.readyFor !== GameType.None;
                            break;
                        case DisplayPlayersInfoTypeEnum.Answered:
                            highlight = data.gameData.answered;
                            break;
                    }
                    let displayImageSrc = null;
                    if (data.avatarId) {
                        const targetAvatar = Avatars.find(avatar => avatar.id === data.avatarId);
                        if (targetAvatar) {
                            displayImageSrc = targetAvatar.src;
                        }
                    }
                    return <PlayerIcon player={data}  highlighted={highlight}/>
                })}
            </div>
        )
    }
}