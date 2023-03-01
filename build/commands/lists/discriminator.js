"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const pixoll_commando_1 = require("pixoll-commando");
const functions_1 = require("../../utils/functions");
const args = [{
        key: 'number',
        prompt: 'What discriminator do you want to look for?',
        type: 'integer',
        parse: (value) => +(Array.isArray(value) ? value[0] : value).padStart(4, '0').slice(-4),
        min: 1,
        max: 9999,
    }];
class DiscriminatorCommand extends pixoll_commando_1.Command {
    constructor(client) {
        super(client, {
            name: 'discriminator',
            aliases: ['discrim'],
            group: 'lists',
            description: 'Displays a list of users with a discriminator.',
            details: '`number` has to be a number from 1 to 9999.',
            format: 'discriminator [number]',
            examples: ['discriminator 1234'],
            guildOnly: true,
            args,
        }, {
            options: [{
                    type: discord_js_1.ApplicationCommandOptionType.Integer,
                    name: 'number',
                    description: 'The discriminator to look for.',
                    required: true,
                    minValue: 1,
                    maxValue: 9999,
                }],
        });
    }
    async run(context, { number }) {
        const { guild } = context;
        const members = guild.members.cache;
        if (context.isInteraction()) {
            number = +number.toString().padStart(4, '0').slice(-4);
        }
        const match = members.filter(member => member.user.discriminator === number.toString())
            .sort((a, b) => (0, functions_1.abcOrder)(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`);
        if (!match || match.length === 0) {
            await (0, functions_1.replyAll)(context, (0, functions_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find any members.',
            }));
            return;
        }
        await (0, functions_1.generateEmbed)(context, match, {
            number: 20,
            authorName: `Found ${(0, functions_1.pluralize)('member', match.length)}`,
            useDescription: true,
        });
    }
}
exports.default = DiscriminatorCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY3JpbWluYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9saXN0cy9kaXNjcmltaW5hdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQTBEO0FBQzFELHFEQUE2RjtBQUM3RixxREFBaUc7QUFFakcsTUFBTSxJQUFJLEdBQUcsQ0FBQztRQUNWLEdBQUcsRUFBRSxRQUFRO1FBQ2IsTUFBTSxFQUFFLDZDQUE2QztRQUNyRCxJQUFJLEVBQUUsU0FBUztRQUNmLEtBQUssRUFBRSxDQUFDLEtBQXdCLEVBQVUsRUFBRSxDQUN4QyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RSxHQUFHLEVBQUUsQ0FBQztRQUNOLEdBQUcsRUFBRSxJQUFJO0tBQ1osQ0FBVSxDQUFDO0FBS1osTUFBcUIsb0JBQXFCLFNBQVEseUJBQXNCO0lBQ3BFLFlBQW1CLE1BQXNCO1FBQ3JDLEtBQUssQ0FBQyxNQUFNLEVBQUU7WUFDVixJQUFJLEVBQUUsZUFBZTtZQUNyQixPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDcEIsS0FBSyxFQUFFLE9BQU87WUFDZCxXQUFXLEVBQUUsZ0RBQWdEO1lBQzdELE9BQU8sRUFBRSw2Q0FBNkM7WUFDdEQsTUFBTSxFQUFFLHdCQUF3QjtZQUNoQyxRQUFRLEVBQUUsQ0FBQyxvQkFBb0IsQ0FBQztZQUNoQyxTQUFTLEVBQUUsSUFBSTtZQUNmLElBQUk7U0FDUCxFQUFFO1lBQ0MsT0FBTyxFQUFFLENBQUM7b0JBQ04sSUFBSSxFQUFFLHlDQUE0QixDQUFDLE9BQU87b0JBQzFDLElBQUksRUFBRSxRQUFRO29CQUNkLFdBQVcsRUFBRSxnQ0FBZ0M7b0JBQzdDLFFBQVEsRUFBRSxJQUFJO29CQUNkLFFBQVEsRUFBRSxDQUFDO29CQUNYLFFBQVEsRUFBRSxJQUFJO2lCQUNqQixDQUFDO1NBQ0wsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBNkIsRUFBRSxFQUFFLE1BQU0sRUFBYztRQUNsRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsT0FBTyxDQUFDO1FBQzFCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBRXBDLElBQUksT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFO1lBQ3pCLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzFEO1FBRUQsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQzthQUNsRixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFBLG9CQUFRLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFL0MsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM5QixNQUFNLElBQUEsb0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxzQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsK0JBQStCO2FBQy9DLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFBLHlCQUFhLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRTtZQUNoQyxNQUFNLEVBQUUsRUFBRTtZQUNWLFVBQVUsRUFBRSxTQUFTLElBQUEscUJBQVMsRUFBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3hELGNBQWMsRUFBRSxJQUFJO1NBQ3ZCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQW5ERCx1Q0FtREMifQ==