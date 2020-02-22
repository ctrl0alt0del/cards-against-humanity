import React from 'react';
import { safeHandler } from '../../utils/Common.utils';

type GameButtonProps = {
    children: React.ReactNode | React.ReactNode[],
    onClick: React.MouseEventHandler
}

export function GameButton(props: GameButtonProps) {
    const { children, onClick } = props;
    return (
        <div className="game-button" onClick={safeHandler(onClick)}>
            {children}
        </div>
    )
}