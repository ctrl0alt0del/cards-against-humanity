import { QuestionCollection } from "/imports/api/QuestionCollection/QuestionCollection";
import { AnswerCollection } from '../imports/api/AnswerCollection/AnswerCollection';

declare var Assets: any;

export function fillQuestionCollection() {
    const questionJsonText = Assets.getText("questions.json");
    try {
        const questionArray = JSON.parse(questionJsonText);
        QuestionCollection.remove({});
        for(let index = 0; index < questionArray.length; index++) {
            const question = questionArray[index]
            QuestionCollection.insert({
                index: index,
                text: question.text
            })
        }
    } catch(err) {
        console.error(err);
        return;
    }
}

export function fillAnswerCollection() {
    const answersJsonText = Assets.getText("answers.json");
    try {
        const answersArray = JSON.parse(answersJsonText);
        AnswerCollection.remove({});
        for(let index = 0; index < answersArray.length; index++) {
            const answers = answersArray[index]
            AnswerCollection.insert({
                index: index,
                text: answers.text
            })
        }
    } catch(err) {
        console.error(err);
        return;
    }
}