require('module-alias/register');

const errors = require('@shared/error-codes');

const { setupProducer } = require('@shared/amqp');
const { WebpageMetadata } = require("@shared/models/webpage");

require('dotenv').config();
require('@shared/stores').connect(process.env.STORE_URL);

async function start(urlFrontierProducer) {

    let counter = 0;
    function queue(url) {
        console.log(`${ ++counter }.\tQueuing: ${ url }`);
        urlFrontierProducer.produce({ url });
    }

    const metadataChangeStream = WebpageMetadata.watch();

    function setupMetadataChangeListener() {
        metadataChangeStream.on('change', (change) => {
            if (change.operationType === 'insert' &&
                change.fullDocument.timestampOfLastCrawl === 0) {
                queue(change.fullDocument.url);
            }
        });
    }

    async function queueNewWebpages() {
        const allNewWebpages = await WebpageMetadata.find(
            { timestampOfLastCrawl: 0 },
            { url: 1 }
        );

        allNewWebpages.forEach((webpage) => queue(webpage.url));
    }

    setupMetadataChangeListener();
    await queueNewWebpages();

    queue(process.env.ENTRY_POINT);
}

(async () => {
    const urlFrontierProducer = await setupProducer(process.env.URL_FRONTIER_URL, process.env.URL_FRONTIER_QUEUE);
    if (urlFrontierProducer === null) {
        process.exit(errors.AMQP_FAILED);
    }

    await start(urlFrontierProducer);
})();

module.exports = { start }