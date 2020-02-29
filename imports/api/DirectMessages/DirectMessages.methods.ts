import { Meteor } from 'meteor/meteor';
import { DirectMessages } from './DirectMessages';
import { DirectMessagesEnum } from '/imports/utils/Types';
Meteor.methods({
    performVibroAssHacking(forPlayerId: string) {
        DirectMessages.emit(forPlayerId, { type: DirectMessagesEnum.AssHack})
    }
})