const amqp = require("amqplib");

async function setupConsumer(connectionUrl, queue) {
    try {
        const connection = await amqp.connect(connectionUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue);

        console.log(`Listening for messages on ${queue}...`);

        return {
            consume: async (handler) => {
                await channel.consume(queue, message => {
                    const content = JSON.parse(message.content.toString());
                    handler(content);
                    channel.ack(message);
                });
            }
        }

    } catch (error) {
        console.error(`Error connecting: ${error.message}`);
        return null;
    }
}

module.exports = { setupConsumer }