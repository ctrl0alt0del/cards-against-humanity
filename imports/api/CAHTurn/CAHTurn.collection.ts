import { Mongo } from "meteor/mongo";
import { CAHTurnType } from "/imports/utils/Types";

export const CAHTurnsCollection = new Mongo.Collection<CAHTurnType>('cahTurns');