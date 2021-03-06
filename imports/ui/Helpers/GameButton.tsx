import React, { useState } from 'react';
import { safeHandler } from '../../utils/Common.utils';

type GameButtonProps = {
    children: React.ReactNode | React.ReactNode[],
    onClick?: (event: React.MouseEvent) => void | Promise<any>,
    flat?: boolean,
    className?: string
}

export function GameButton(props: GameButtonProps) {
    const { children, onClick, flat, className } = props;
    const [isPending, setPending] = useState(false);
    return (
        <div className={(flat ? "flat-game-button" : "game-button") + (isPending ? ' pending' : '') + (className?` ${className}`: '')} onClick={(ev) => {
            let res = safeHandler(onClick)(ev);
            if(res && res instanceof Promise) {
                setPending(true);
                res.then(()=>{
                    setPending(false);
                })
            }
        }}>
            {!isPending? children : (
                <i className="fas fa-spinner"/>
            )}
        </div>
    )
}