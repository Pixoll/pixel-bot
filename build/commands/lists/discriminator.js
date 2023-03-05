"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixoll_commando_1 = require("pixoll-commando");
const utils_1 = require("../../utils");
const args = [{
        key: 'number',
        prompt: 'What discriminator do you want to look for?',
        type: 'integer',
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
            autogenerateSlashCommand: true,
        });
    }
    async run(context, { number }) {
        const { guild } = context;
        const members = guild.members.cache;
        const discriminator = number.toString().padStart(4, '0').slice(-4);
        const match = members.filter(member => member.user.discriminator === discriminator)
            .sort((a, b) => (0, utils_1.abcOrder)(a.user.tag, b.user.tag))
            .map(m => `${m.toString()} ${m.user.tag}`);
        if (!match || match.length === 0) {
            await (0, utils_1.replyAll)(context, (0, utils_1.basicEmbed)({
                color: 'Red',
                emoji: 'cross',
                description: 'I couldn\'t find any members.',
            }));
            return;
        }
        await (0, utils_1.generateEmbed)(context, match, {
            number: 20,
            authorName: `Found ${(0, utils_1.pluralize)('member', match.length)} with discriminator #${discriminator}`,
            useDescription: true,
        });
    }
}
exports.default = DiscriminatorCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY3JpbWluYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tYW5kcy9saXN0cy9kaXNjcmltaW5hdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscURBQTZGO0FBQzdGLHVDQUF1RjtBQUV2RixNQUFNLElBQUksR0FBRyxDQUFDO1FBQ1YsR0FBRyxFQUFFLFFBQVE7UUFDYixNQUFNLEVBQUUsNkNBQTZDO1FBQ3JELElBQUksRUFBRSxTQUFTO1FBQ2YsR0FBRyxFQUFFLENBQUM7UUFDTixHQUFHLEVBQUUsSUFBSTtLQUNaLENBQVUsQ0FBQztBQUtaLE1BQXFCLG9CQUFxQixTQUFRLHlCQUFzQjtJQUNwRSxZQUFtQixNQUFzQjtRQUNyQyxLQUFLLENBQUMsTUFBTSxFQUFFO1lBQ1YsSUFBSSxFQUFFLGVBQWU7WUFDckIsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDO1lBQ3BCLEtBQUssRUFBRSxPQUFPO1lBQ2QsV0FBVyxFQUFFLGdEQUFnRDtZQUM3RCxPQUFPLEVBQUUsNkNBQTZDO1lBQ3RELE1BQU0sRUFBRSx3QkFBd0I7WUFDaEMsUUFBUSxFQUFFLENBQUMsb0JBQW9CLENBQUM7WUFDaEMsU0FBUyxFQUFFLElBQUk7WUFDZixJQUFJO1lBQ0osd0JBQXdCLEVBQUUsSUFBSTtTQUNqQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUE2QixFQUFFLEVBQUUsTUFBTSxFQUFjO1FBQ2xFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDcEMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFbkUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLGFBQWEsQ0FBQzthQUM5RSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFBLGdCQUFRLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFFL0MsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM5QixNQUFNLElBQUEsZ0JBQVEsRUFBQyxPQUFPLEVBQUUsSUFBQSxrQkFBVSxFQUFDO2dCQUMvQixLQUFLLEVBQUUsS0FBSztnQkFDWixLQUFLLEVBQUUsT0FBTztnQkFDZCxXQUFXLEVBQUUsK0JBQStCO2FBQy9DLENBQUMsQ0FBQyxDQUFDO1lBQ0osT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFBLHFCQUFhLEVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRTtZQUNoQyxNQUFNLEVBQUUsRUFBRTtZQUNWLFVBQVUsRUFBRSxTQUFTLElBQUEsaUJBQVMsRUFBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsYUFBYSxFQUFFO1lBQzdGLGNBQWMsRUFBRSxJQUFJO1NBQ3ZCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXhDRCx1Q0F3Q0MifQ==