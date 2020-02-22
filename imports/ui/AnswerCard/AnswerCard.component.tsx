import React from 'react';
import { getAnswerById } from '/imports/utils/GameData.utils';
import Draggable, { DraggableEventHandler, DraggableEvent } from 'react-draggable';
import { safeHandler } from '/imports/utils/Common.utils';

type AnswerCardPropsType = {
    answerId: string,
    onDrag?: DraggableEventHandler,
    onDrop?: (e: DraggableEvent) => boolean,
    disableDrag?: boolean
}

type AnswerCardStateType = {
    answerText: string,
    overridePosition: { x: number, y: number }
}

export class AnswerCard extends React.Component<AnswerCardPropsType, AnswerCardStateType> {

    state = {
        answerText: '',
        overridePosition: { x: 0, y: 0 }
    }


    componentDidMount() {
        this.resolveAnswerCardData();
    }

    async resolveAnswerCardData() {
        const {
            answerId: answerIndex
        } = this.props;
        const answerData = await getAnswerById(answerIndex);
        this.setState({
            answerText: answerData.text
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

    render() {
        const { answerText, overridePosition } = this.state;
        const answerLength = answerText ? answerText.length : 0;
        const decreaseFontSize = answerLength > 15;
        return (
            <Draggable
                disabled={!!this.props.disableDrag}
                handle=".answer-card-wrapper"
                onStart={this.onDragStart}
                onDrag={safeHandler(this.props.onDrag)}
                onStop={this.onDragStop}
                position={overridePosition}
            >
                <div className="answer-card-wrapper">
                    <div className={"answer-card-text" + (decreaseFontSize ? ' small-font' : '')}>
                        {answerText}
                    </div>
                </div>
            </Draggable>
        )
    }
}