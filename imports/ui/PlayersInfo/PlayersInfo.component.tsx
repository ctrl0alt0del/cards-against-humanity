import React from 'react';
import { PlayerData } from '../../utils/Types';

export enum DisplayPlayersInfoTypeEnum {
    Ready,
    Answered
}

type PlayersInfoPropsType = {
    players: PlayerData[],
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
                    if(data.isCurentPlayer && infoType === DisplayPlayersInfoTypeEnum.Answered) {
                        return null;
                    }
                    switch (infoType) {
                        case DisplayPlayersInfoTypeEnum.Ready:
                            highlight = data.ready;
                            break;
                        case DisplayPlayersInfoTypeEnum.Answered:
                            highlight = data.answered;
                            break;
                    }
                    return (
                        <div className={"player-badge-wrapper" + (highlight ? " highlighted" : '')} key={data.sessionId}>
                            <img src="https://dummyimage.com/100x100/999/000" className="size-helper" />
                            <div className={"player-badge" + (highlight ? " highlighted" : '')} />
                        </div>
                    )
                })}
            </div>
        )
    }
}