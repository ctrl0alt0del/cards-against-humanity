import React from 'react';
import { PlayerType, GeneralPlayerType, GameType } from '../../utils/Types';
import { ClientPlayer } from '../../utils/ClientPlayerManager';

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
        return (
            <div className="players-info-wrapper">
                <div className="players-info-wrapper-label">
                    Гравці:
                </div>
                {players.map(data => {
                    let highlight = false;
                    if (data._id === ClientPlayer.me()._id && infoType === DisplayPlayersInfoTypeEnum.Answered) {
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
                    return (
                        <div className={"player-badge-wrapper" + (highlight ? " highlighted" : '')} key={data._id}>
                            <img src="https://dummyimage.com/100x100/999/000" className="size-helper" />
                            <div className={"player-badge" + (highlight ? " highlighted" : '')} />
                        </div>
                    )
                })}
            </div>
        )
    }
}