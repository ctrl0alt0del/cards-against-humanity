import { Mongo } from "meteor/mongo";
import { GameMessageQueue } from './Constants';
import { Meteor } from 'meteor/meteor';
import { meteorCall } from "./Common.utils";
import { GameMessage } from './GameData.utils';
import { GameMessageEnum, DrawCardMessage, ReadQuestionMessage } from "./Types";

const ENQUEUED_EMIT_TIME = 200;

export class ClientGameManager extends EventTarget {
    private static instance: ClientGameManager = null;
    private _collection = new Mongo.Collection<GameMessage>(GameMessageQueue);
    private _enqueuedItemsCount = 0;

    static getInstance() {
        if (!ClientGameManager.instance) {
            ClientGameManager.instance = new ClientGameManager();
        }
        return ClientGameManager.instance;
    }

    startGame() {
        return meteorCall("startGame");
    }
    addEventListener(e: 'draw-card', l: (ev: CustomEvent<DrawCardMessage>) => void): void;
    addEventListener(e: 'next-turn', l: (ev: CustomEvent<ReadQuestionMessage>) => void): void;
    addEventListener<T extends GameMessage>(eventName: string, listener: (event: CustomEvent<T>) => void) {
        return super.addEventListener(eventName, listener);
    }


    private emit(eventName: string, acitonParamObj: GameMessage) {
        this.dispatchEvent(new CustomEvent(eventName, {
            detail: acitonParamObj
        }))
    }
    private enqueuedEmit(eventName: string, messageObj: GameMessage) {
        setTimeout(() => {
            this.emit(eventName, messageObj);
            this._enqueuedItemsCount--;
        }, ENQUEUED_EMIT_TIME * (this._enqueuedItemsCount++ + 1));
    }

    init() {
        Meteor.subscribe("game");
        this._collection.find({}).observe({
            added: (message) => {
                switch (message.message) {
                    case GameMessageEnum.DrawCard:
                        return this.enqueuedEmit('draw-card', message);
                    case GameMessageEnum.ReadQuestion:
                        return this.emit('next-turn', message);
                }
            }
        })
    }
}