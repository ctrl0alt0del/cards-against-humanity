import React from 'react';
import { createPortal } from 'react-dom';

interface ModalInterface {
    children: React.ReactNode,
    portalContainerId?: string,
    active: boolean,
    rootClassName?: string
}

const DEFAULT_GAME_MODAL_CONTAINER_ID = 'react-target';
export const GameModal: React.FC<ModalInterface> = (props) => {
    const { children, active, rootClassName } = props;
    const portalContainerId = props.portalContainerId || DEFAULT_GAME_MODAL_CONTAINER_ID;
    return active ? createPortal((
        <div className="game-modal-background">
            <div className={"game-model-root" + (rootClassName ? ` ${rootClassName}`: '')}>
                {children}
            </div>
        </div>
    ), document.getElementById(portalContainerId)) : null;
}