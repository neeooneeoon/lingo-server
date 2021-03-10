import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Action } from './action.enum';
import { Book } from 'src/libs/books/schema/book.schema';
import { QuestionHolder, Question } from 'src/libs/question-holders/schema/question-holder.schema';
import { User } from 'src/libs/users/schema/user.schema';

export type Subjects =
    | typeof Book
    | typeof QuestionHolder | Question
    | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder<
            Ability<[Action, Subjects]>
        >(Ability as AbilityClass<AppAbility>);

        if (user.role === "Admin") {
            can(Action.Manage, 'all');
        } else {
            can(Action.Read, 'all');
        }
        return build();
    }
}
