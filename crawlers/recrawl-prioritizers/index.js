require('module-alias/register');

const errors = require('@shared/error-codes');

const { setupProducer } = require('@shared/amqp');

require('dotenv').config();
require('@shared/stores').connect(process.env.STORE_URL);

async function start(urlFrontierProducer) {

    const url = process.env.ENTRY_POINT;
    let counter = 0;

    async function foo() {
        for (let i = 0; i < 1_000; i++) {
            console.log(`${++counter}.\tRecrawling: ${url}`);
            urlFrontierProducer.produce({ url });
        }
    }

    await foo();
}

(async () => {
    const urlFrontierProducer = await setupProducer(process.env.URL_FRONTIER_URL, process.env.URL_FRONTIER_QUEUE);
    if (urlFrontierProducer === null) {
        process.exit(errors.AMQP_FAILED);
    }

    await start(urlFrontierProducer);
})();

module.exports = { start }