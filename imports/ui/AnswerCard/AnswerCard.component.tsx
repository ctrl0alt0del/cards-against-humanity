import React from 'react';
import { getAnswerByIndex } from '/imports/utils/GameData.utils';

type AnswerCardPropsType = {
    answerIndex: number
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
        return (
            <div className="answer-card-wrapper">
                <div className="answer-card-text">
                    {answerText}
                </div>
            </div>
        )
    }
}