export const data = {
    name: 'beep',
    description: 'Replies with Boop!',
};

export async function execute(message) {
    await message.reply('Boop!');
}