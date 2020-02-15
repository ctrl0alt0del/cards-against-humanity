import { Mongo } from "meteor/mongo";
import { QuestionType } from "../../utils/Types";

export const QuestionCollection = new Mongo.Collection<QuestionType>("questionCollection");