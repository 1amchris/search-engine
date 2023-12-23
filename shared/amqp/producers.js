const amqp = require("amqplib");

async function setupProducer(connectionUrl, queue) {
    try {
        const connection = await amqp.connect(connectionUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue);

        console.log(`Ready to send messages on ${queue}...`);

        return {
            produce: (content) => {
                const buffer = Buffer.from(JSON.stringify(content));
                channel.sendToQueue(queue, buffer);
            }
        };

    } catch (error) {
        console.error(`Error connecting: ${error.message}`);
        return null;
    }
}

module.exports = { setupProducer }