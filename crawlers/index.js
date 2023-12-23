require('module-alias/register');

const errors = require('@shared/error-codes');
const extractors = require('@crawlers/links-extractors');
const recrawlers = require('@crawlers/recrawl-prioritizers');
const scrapers = require('@crawlers/scrapers');

const { setupConsumer, setupProducer } = require("@shared/amqp");

require('dotenv').config();
require('@shared/stores').connect(process.env.STORE_URL);

(async () => {
    const awaitables = [];

    const urlFrontierConsumer = await setupConsumer(process.env.URL_FRONTIER_URL, process.env.URL_FRONTIER_QUEUE);
    const urlFrontierProducer = await setupProducer(process.env.URL_FRONTIER_URL, process.env.URL_FRONTIER_QUEUE);
    if (urlFrontierConsumer === null || urlFrontierProducer == null) { process.exit(errors.AMQP_FAILED); }

    const downstreamBrokerConsumer = await setupConsumer(process.env.DOWNSTREAM_BROKER_URL, process.env.DOWNSTREAM_BROKER_QUEUE);
    const downstreamBrokerProducer = await setupProducer(process.env.DOWNSTREAM_BROKER_URL, process.env.DOWNSTREAM_BROKER_QUEUE);
    if (downstreamBrokerConsumer === null || downstreamBrokerProducer === null) { process.exit(errors.AMQP_FAILED); }

    for (let i = 0; i < process.env.EXTRACTORS_COUNT; i++) {
        awaitables.push(extractors.start(downstreamBrokerConsumer));
    }

    for (let i = 0; i < process.env.SCRAPERS_COUNT; i++) {
        awaitables.push(scrapers.start(urlFrontierConsumer, downstreamBrokerProducer));
    }

    for (let i = 0; i < process.env.RECRAWLERS_COUNT; i++) {
        awaitables.push(recrawlers.start(urlFrontierProducer));
    }

    await Promise.all(awaitables);
})();