export const data = {
    name: 'ping',
    description: 'Replies with Pong!',
};

export async function execute(message) {
    await message.reply('Pong!');
}