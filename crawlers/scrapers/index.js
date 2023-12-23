require('module-alias/register');
const axios = require('axios');

const md5 = require('@shared/utils/md5');
const errors = require('@shared/error-codes');

const { WebpageMetadata, WebpageObject } = require('@shared/models/webpage');
const { setupConsumer, setupProducer } = require("@shared/amqp");

require('dotenv').config();
require('@shared/stores').connect(process.env.STORE_URL);

async function start(urlFrontierConsumer, downstreamBrokerProducer) {

    let counter = 0;

    async function scrapeWebpage({url}) {

        console.log(`${++counter}.\tScraping from: ${url}`);

        const urlId = md5(url);

        try {
            const response = await axios.get(url);

            await WebpageObject.findOneAndUpdate(
                {urlId},
                {urlId, url, html: response.data},
                {upsert: true, new: true},
            );

            await WebpageMetadata.findOneAndUpdate(
                {urlId},
                {urlId, url, timestampOfLastCrawl: Date.now()},
                {upsert: true, new: true},
            )

            downstreamBrokerProducer.produce({urlId});

        } catch (error) {
            console.error(`Error crawling ${url}: ${error.message}`);
        }
    }

    await urlFrontierConsumer.consume(message => scrapeWebpage(message));
}

(async () => {
    const urlFrontierConsumer = await setupConsumer(process.env.URL_FRONTIER_URL, process.env.URL_FRONTIER_QUEUE);
    if (urlFrontierConsumer === null) { process.exit(errors.AMQP_FAILED); }

    const downstreamBrokerProducer = await setupProducer(process.env.DOWNSTREAM_BROKER_URL, process.env.DOWNSTREAM_BROKER_QUEUE);
    if (downstreamBrokerProducer === null) { process.exit(errors.AMQP_FAILED); }

    await start(urlFrontierConsumer, downstreamBrokerProducer);
})();

module.exports = { start }