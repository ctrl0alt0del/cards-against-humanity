import React from 'react';
import { GeneralPlayerType } from '../../utils/Types';
import { getAvatarSrc } from '/imports/utils/Avatars';

interface PlayerIconProps {
    player: GeneralPlayerType,
    isReader?: boolean,
    onClick?: React.EventHandler<React.MouseEvent>
    highlighted?: boolean,
    height?: number,
    className?: string
}

export const PlayerIcon: React.FC<PlayerIconProps> = (props) => {
    const { player, isReader, onClick, highlighted, height, className } = props;
    const playerId = player._id;
    const avatarSrc = getAvatarSrc(player.avatarId);
    let style: any = {};
    if(height != undefined) {
        style.height = style.width = height;
    }
    let addtionalClassName = '';
    if(!player.online) {
        addtionalClassName = ' offline';
    } else if(highlighted) {
        addtionalClassName = ' highlighted'
    }
    return (
        <div className={"player-status-item" + (className ? ` ${className}`: '')} key={playerId} onClick={onClick} style={style}>
            {isReader && (
                <div className="reader-status-icon">
                    <i className="far fa-comment-dots"></i>
                </div>
            )}
            <img src="https://dummyimage.com/100x100/999/000" className="size-helper" />
            <div className={'player-status-item-image-wrapper' + addtionalClassName}>
                <img src={avatarSrc} className='player-status-item-image' />
            </div>
        </div>
    )
}