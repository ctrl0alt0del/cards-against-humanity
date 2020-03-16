import React from 'react';
import { Avatars } from '/imports/utils/Avatars';
import { safeHandler } from '../../../utils/Common.utils';
import { GameButton } from '../../Helpers/GameButton';
import { PictureTacker } from '../../PictureTaker/PictureTaker.component';

enum AvatarCreatorDisplayMode {
    Default,
    Creator
}

interface AvatarCreatorProps {
    alreadyUsedAvatarsId: string[],
    onDefaultAvatarSelected?: (avatarId: string) => void
}

interface AvatarCreatorState {
    displayMode: AvatarCreatorDisplayMode,
    isPhotoTacken: boolean
}

export class AvatarCreator extends React.Component<AvatarCreatorProps, AvatarCreatorState> {

    state: AvatarCreatorState = {
        displayMode: AvatarCreatorDisplayMode.Default,
        isPhotoTacken: false
    }

    private readonly switchDisplayMode = () => {
        const currDisplayMode = this.state.displayMode;
        const nextDisplayMode = currDisplayMode === AvatarCreatorDisplayMode.Default ? AvatarCreatorDisplayMode.Creator : AvatarCreatorDisplayMode.Default;
        this.setState({
            displayMode: nextDisplayMode
        })
    }

    render() {
        const { alreadyUsedAvatarsId, onDefaultAvatarSelected } = this.props;
        const { displayMode } = this.state;
        let content;
        if (displayMode === AvatarCreatorDisplayMode.Default) {
            content = (
                <React.Fragment>
                    <div id="avatar-selection-wrapper-content">
                        {Avatars.map(avatarData => {
                            if (alreadyUsedAvatarsId.includes(avatarData.id)) {
                                return null;
                            }
                            return (
                                <div className="avatar-selection-item" key={avatarData.id} onClick={() => safeHandler(onDefaultAvatarSelected)(avatarData.id)}>
                                    <img src={avatarData.src} />
                                </div>
                            );
                        })}
                    </div>
                    <GameButton onClick={this.switchDisplayMode}>
                        Створити нового
                    </GameButton>
                </React.Fragment>
            );
        } else {
            content = (
                <React.Fragment>
                    <PictureTacker />
                    <GameButton onClick={this.switchDisplayMode}>
                        Вибрати вже готовий
                    </GameButton>
                </React.Fragment>
            )
        }
        return (
            <div id="avatar-selection-wrapper">
                {content}
            </div>
        )

    }
}