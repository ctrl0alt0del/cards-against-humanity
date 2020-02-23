import React from 'react';
import Modal from 'react-awesome-modal';
import { GameButton } from '../Helpers/GameButton';
import { safeHandler, meteorCall } from '../../utils/Common.utils';
import { Meteor } from 'meteor/meteor';
import { QuestionType, AnswerType } from '../../utils/Types';

export enum EditingEnitityType {
    Question,
    Answer
}

enum EditorMode {
    Create,
    List
}

interface AddingEditorPropsType {
    display: boolean,
    onClose: () => void
}
interface AddingEditorStateType {
    type: EditingEnitityType,
    text: string,
    insertInQueue: boolean,
    mode: EditorMode,
    editList: (QuestionType | AnswerType)[]
}

export class AddingEditor extends React.Component<AddingEditorPropsType, AddingEditorStateType> {
    state: AddingEditorStateType = {
        text: '',
        insertInQueue: false,
        type: EditingEnitityType.Question,
        mode: EditorMode.Create,
        editList: null
    }

    componentDidUpdate(prevProps, prevState: AddingEditorStateType) {
        const prevEditorMode = prevState.mode;
        const prevEntType = prevState.type;
        const currEntType = this.state.type;
        const currentEditorMode = this.state.mode;
        if (currentEditorMode === EditorMode.List && (prevEditorMode !== EditorMode.List || prevEntType !== currEntType)) {
            this.resolveEditingList(currEntType);
        }
    }

    private setEditorType(type: EditingEnitityType) {
        this.setState({
            type
        })
    }

    private onTextareaChange = (event: React.ChangeEvent) => {
        const value = (event.currentTarget as any).value;
        this.setState({
            text: value
        })
    }

    private readonly markInsertionInQueue = () => {
        this.setState({
            insertInQueue: !this.state.insertInQueue
        })
    }

    private readonly save = () => {
        const { type, text, insertInQueue } = this.state;
        if (this.props.onClose) {
            this.props.onClose();
        }
        if (type === EditingEnitityType.Question) {
            Meteor.call("addNewQuestion", text, insertInQueue, err => {
                if (err) {
                    console.error(err);
                } else {
                    this.setState({
                        text: '',
                        insertInQueue: false
                    })
                }
            })
        } else {
            Meteor.call("addNewAnswer", text, err => {
                if (err) {
                    console.error(err);
                } else {
                    this.setState({
                        text: '',
                        insertInQueue: false
                    })
                }
            })
        }
    }

    private readonly switchEditorMode = async () => {
        const mode = this.state.mode;
        if (mode === EditorMode.Create) {
            const type = this.state.type;
            this.setState({
                mode: EditorMode.List
            });
        } else {
            this.setState({
                mode: EditorMode.Create
            })
        }
    }

    private async resolveEditingList(type: EditingEnitityType) {
        let list = null;
        if (type === EditingEnitityType.Answer) {
            list = await meteorCall('fetchAllAnswers');
        }
        else {
            list = await meteorCall('fetchAllQuestions');
        }
        this.setState({
            editList: list
        });
    }

    render() {
        const { display, onClose } = this.props;
        const { type, insertInQueue, mode } = this.state;
        return (
            <Modal visible={display} width="90%">
                <div id="adding-editor-wrapper">
                    <div id="adding-editor-type-switcher">
                        <div className="adding-editor-type-radio-wrapper insert-in-queue">
                            <button
                                className={"styled-radio square" + (mode === EditorMode.List ? " checked" : "")}
                                id="edit"
                                onClick={this.switchEditorMode}
                            />
                            <label htmlFor="edit">Редагувати вже існуючий запис</label>
                        </div>
                        <div className="adding-editor-type-radio-wrapper">
                            <button
                                className={"styled-radio round" + (type === EditingEnitityType.Question ? " checked" : "")}
                                id="type-q"
                                onClick={() => this.setEditorType(EditingEnitityType.Question)}
                            />
                            <label htmlFor="type-q">Питання</label>
                        </div>

                        <div className="adding-editor-type-radio-wrapper">
                            <button
                                className={"styled-radio round" + (type === EditingEnitityType.Answer ? " checked" : "")}
                                id="type-a"
                                onClick={() => this.setEditorType(EditingEnitityType.Answer)}
                            />
                            <label htmlFor="type-a">Відповідь</label>
                        </div>
                    </div>
                    {this.getCurrentEditorMode()}
                    <div id="adding-editor-buttons">
                        <GameButton onClick={safeHandler(onClose)}>
                            Закрити
                        </GameButton>
                        {mode !== EditorMode.List && (
                            <GameButton onClick={this.save}>
                                Зберегти
                            </GameButton>
                        )}
                    </div>
                </div>
            </Modal>
        )
    }

    private async removeItem(itemId: string) {
        const type = this.state.type;
        try {
            if (type === EditingEnitityType.Answer) {
                await meteorCall('deleteAnswer', itemId)
            } else {
                await meteorCall('deleteQuestion', itemId)
            }
            this.setState({
                editList: this.state.editList.filter(obj => obj._id !== itemId)
            })
        } catch (err) {
            console.error(err);
        }
    }

    private getCurrentEditorMode() {

        const { type, text, insertInQueue, mode, editList } = this.state;
        if (mode === EditorMode.Create) {
            return (
                <React.Fragment>
                    <div id="adding-form-wrapper">
                        <textarea value={text} className={type === EditingEnitityType.Question ? "question-textarea" : "answer-textarea"} onChange={this.onTextareaChange} />
                        {type === EditingEnitityType.Question && (<div className="adding-editor-type-radio-wrapper insert-in-queue">
                            <button className={"styled-radio square" + (insertInQueue ? " checked" : "")} id="type-q" onClick={this.markInsertionInQueue} />
                            <label htmlFor="type-q">Зробити це питання наступним в черзі</label>
                        </div>)}
                    </div>

                </React.Fragment>
            )
        } else {
            if (!editList) {
                return 'Loading...';
            }
            return editList.map((data, index) => {
                return (
                    <div className="entity-edit-list-item" key={data._id}>
                        <div className="entity-list-item-text">
                            {index + 1}. {data.text}
                        </div>
                        <div className="entity-item-remove" onClick={() => this.removeItem(data._id)}>
                            <i className="fas fa-trash-alt" />
                        </div>
                    </div>
                )
            })
        }
    }
}