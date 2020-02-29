import React from 'react';
import { getAnswerById } from '/imports/utils/GameData.utils';
import Draggable, { DraggableEventHandler, DraggableEvent } from 'react-draggable';
import { safeHandler, meteorCall } from '/imports/utils/Common.utils';
import { JOCKER_ANSWER_ID } from '/imports/utils/Constants';

type AnswerCardPropsType = {
    answerId: string,
    onDrag?: DraggableEventHandler,
    onDrop?: (e: DraggableEvent) => boolean,
    disableDrag?: boolean,
    aspectRatio?: number,
    canLikeJocker?: boolean
}

type AnswerCardStateType = {
    answerText: string | React.ReactNode,
    overridePosition: { x: number, y: number },
    isJocker: boolean
}

export class AnswerCard extends React.Component<AnswerCardPropsType, AnswerCardStateType> {

    state = {
        answerText: '',
        overridePosition: { x: 0, y: 0 },
        isJocker: false
    }


    componentDidMount() {
        this.resolveAnswerCardData();
    }

    async resolveAnswerCardData() {
        const {
            answerId
        } = this.props;
        let answerText = null;
        let isJokerCard = false;
        if (answerId !== JOCKER_ANSWER_ID) {
            const answerData = await getAnswerById(answerId);
            answerText = answerData.text;
            isJokerCard = answerData.isJoker;
        } else {
            answerText = (<i className="fas fa-mask" />)
        }
        this.setState({
            answerText: answerText,
            isJocker: isJokerCard
        })
    }

    private readonly onDragStart = () => {
        /*this.setState({
            overridePosition: null
        })*/
    }


    private readonly onDragStop = (event) => {
        const res = safeHandler(this.props.onDrop)(event);
        if (!res) {
            this.setState({
                overridePosition: { x: 0, y: 0 }
            });
        }
    };

    private onJockerIconClick = async () => {
        if(!this.props.canLikeJocker) {
            return;
        }
        const cardId = this.props.answerId;
        await meteorCall('likeJokerCard', cardId);
        this.setState({
            isJocker: false
        })
    }

    render() {
        const { answerText, overridePosition, isJocker } = this.state;
        const aspectRatio = this.props.aspectRatio || 0.25;
        const answerLength = answerText && typeof answerText === 'string' ? answerText.length : 0;
        const decreaseFontSize = answerLength > 15;
        const increaseFontSize = answerLength < 4;
        let fontSize = '0.9rem';
        if (decreaseFontSize) {
            fontSize = '0.7rem';
        } else if (increaseFontSize) {
            fontSize = '1.2rem';
        }
        return (
            <Draggable
                disabled={!!this.props.disableDrag}
                handle=".answer-card-wrapper"
                onStart={this.onDragStart}
                onDrag={safeHandler(this.props.onDrag)}
                onStop={this.onDragStop}
                position={overridePosition}
            >
                <div className="answer-card-wrapper" style={{ padding: `${aspectRatio * 100}% 6px` }}>
                    {isJocker && (<i className="joker fas fa-mask" onClick={this.onJockerIconClick} />)}
                    <div className={"answer-card-text"} style={{ fontSize }}>
                        {answerText}
                    </div>
                </div>
            </Draggable>
        )
    }
}