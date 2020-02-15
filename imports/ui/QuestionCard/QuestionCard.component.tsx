import React from 'react';
import { getQuestionByIndex } from '/imports/utils/GameData.utils';

type QuestionCardPropsType = {
    questionIndex: number
}

type QuestionCardStateType = {
    questionText: string
}

export class QuestionCard extends React.Component<QuestionCardPropsType, QuestionCardStateType> {

    state = {
        questionText: ''
    }

    componentDidMount() {
        this.resolveQuestionData();
    }

    async resolveQuestionData() {
        const {
            questionIndex
        } = this.props;
        const qData = await getQuestionByIndex(questionIndex);
        this.setState({
            questionText: qData.text
        })
    }

    render() {
        const { questionText } = this.state;
        return (
            <div className="question-card-wrapper">
                <div className="question-card-text-wrapper">
                    {questionText}
                </div>
            </div>
        )
    }
}