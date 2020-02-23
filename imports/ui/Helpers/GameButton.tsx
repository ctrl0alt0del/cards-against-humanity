import React from 'react';
import { safeHandler } from '../../utils/Common.utils';

type GameButtonProps = {
    children: React.ReactNode | React.ReactNode[],
    onClick?: React.MouseEventHandler,
    flat?: boolean
}

export function GameButton(props: GameButtonProps) {
    const { children, onClick, flat } = props;
    return (
        <div className={flat ? "flat-game-button" : "game-button"} onClick={safeHandler(onClick)}>
            {children}
        </div>
    )
}