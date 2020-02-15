import { Meteor } from "meteor/meteor";
import { ServerGameManager } from './GameManager';
import { GameMessageQueue } from "/imports/utils/Constants";
import { Random } from "meteor/random";

Meteor.publish("game", function(){
    //TODO: on user disconnect
    const gameManager = ServerGameManager.getInstance();
    const unsub = gameManager.createSession(message => {
        this.added(GameMessageQueue, Random.id(), message);
    });
    this.onStop(()=>{
        unsub();
    })
})