import React from 'react';
import { GameButton } from '../../Helpers/GameButton';
import { GameModal } from '../../Helpers/Modal';
import { meteorCall } from '/imports/utils/Common.utils';
import { AddNewQuestionType } from '/imports/utils/Constants';


interface QuickAnswerCreatorPropsInterface {

}

interface QuickAnswerCreatorStateInterface {
    dialogOpened: boolean;
    questionText: string;
}

export class QuickAnswerCreator extends React.Component<QuickAnswerCreatorPropsInterface, QuickAnswerCreatorStateInterface> {
    state: QuickAnswerCreatorStateInterface = {
        dialogOpened: false,
        questionText: ''
    }

    private readonly openDialog = () => {
        this.setState({
            dialogOpened: true
        })
    }

    private readonly closeDialog = () => {
        this.setState({
            dialogOpened: false
        })
    }

    private readonly onQuestionTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        this.setState({
            questionText: value
        })
    }

    private readonly saveNewQuestion = async () => {
        const qText = this.state.questionText;
        await meteorCall('addNewQuestion', qText, AddNewQuestionType.CurrentQuestion);
        this.closeDialog();
    }

    render() {
        const { dialogOpened, questionText } = this.state;
        return (
            <React.Fragment>
                <GameButton onClick={this.openDialog}>
                    <i className="fas fa-plus"/>
                </GameButton>
                <GameModal active={dialogOpened} rootClassName="quick-question-creator-dialog">
                    <textarea
                        value={questionText}
                        onChange={this.onQuestionTextareaChange}
                    />
                    <div className="quick-question-creator-buttons">
                        <GameButton onClick={this.closeDialog}>
                            Закрити
                        </GameButton>
                        <GameButton onClick={this.saveNewQuestion}>
                            Продовжити
                        </GameButton>
                    </div>
                </GameModal>
            </React.Fragment>
        )
    }
}