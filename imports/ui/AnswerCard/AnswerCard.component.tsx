import React from 'react';
import { getAnswerByIndex } from '/imports/utils/GameData.utils';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import { safeHandler } from '/imports/utils/Common.utils';

type AnswerCardPropsType = {
    answerIndex: number,
    onDrag?: DraggableEventHandler,
    onDrop?: DraggableEventHandler,
    disableDrag?: boolean
}

type AnswerCardStateType = {
    answerText: string
}

export class AnswerCard extends React.Component<AnswerCardPropsType, AnswerCardStateType> {

    state = {
        answerText: ''
    }

    componentDidMount() {
        this.resolveAnswerCardData();
    }

    async resolveAnswerCardData() {
        const {
            answerIndex
        } = this.props;
        const answerData = await getAnswerByIndex(answerIndex);
        this.setState({
            answerText: answerData.text
        })
    }

    render() {
        const { answerText } = this.state;
        const answerLength = answerText ? answerText.length : 0;
        const decreaseFontSize = answerLength > 15;
        return (
            <Draggable disabled={!!this.props.disableDrag} handle=".answer-card-wrapper" onDrag={safeHandler(this.props.onDrag)} onStop={safeHandler(this.props.onDrop)}>
                <div className="answer-card-wrapper">
                    <div className={"answer-card-text"+(decreaseFontSize ? ' small-font': '')}>
                        {answerText}
                    </div>
                </div>
            </Draggable>
        )
    }
}