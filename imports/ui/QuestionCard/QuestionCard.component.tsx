import React from 'react';
import { getQuestionById } from '/imports/utils/GameData.utils';

type QuestionCardPropsType = {
    questionId: string
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

    componentDidUpdate(prevProps: QuestionCardPropsType){
        if(prevProps.questionId !== this.props.questionId) {
            this.resolveQuestionData();
        }
    }

    async resolveQuestionData() {
        const {
            questionId
        } = this.props;
        const qData = await getQuestionById(questionId);
        this.setState({
            questionText: qData.text
        })
    }

    render() {
        const { questionText } = this.state;
        const textToDisplay = questionText.replace(/\_/g, '_______');
        return (
            <div className="question-card-wrapper">
                <div className="question-card-text-wrapper">
                    {textToDisplay}
                </div>
            </div>
        )
    }
}