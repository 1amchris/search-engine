require('module-alias/register');
const { URL } = require('url');
const cheerio = require('cheerio');

const errors = require('@shared/error-codes');
const md5 = require('@shared/utils/md5');

const { setupConsumer } = require("@shared/amqp");
const { WebpageLink, WebpageMetadata, WebpageObject } = require('@shared/models/webpage');

require('dotenv').config();
require('@shared/stores').connect(process.env.STORE_URL);

async function start(downstreamBrokerConsumer) {

    let counter = 0;

    async function extractLinks({ urlId: sourceUrlId }) {

        console.log(`${++counter}.\tExtracting from: ${sourceUrlId}`);

        const webpages = await WebpageObject.aggregate([
            { $match: { urlId: sourceUrlId } },
            { $lookup: {
                from: WebpageMetadata.collection.name,
                localField: 'urlId',
                foreignField: 'urlId',
                as: 'metadata',
            }},
            { $unwind: {
                path: '$metadata',
                preserveNullAndEmptyArrays: true,
            }},
            { $limit: 1 },
        ]);

        if (webpages.size === 0) {
            return;
        }

        const webpage = webpages[0];
        const $ = cheerio.load(webpage.html);

        await Promise.all(
            $('a').each(async (index, element) => {
            let url = $(element).attr('href');
            url = url?.split('#')[0];

            if (url) {
                url = !url.startsWith('http')
                    ? new URL(url, webpage.metadata.url).href
                    : url;

                const urlId = md5(url);
                if (url.startsWith(process.env.TARGET_BASE_URL || '')) {
                    await WebpageMetadata.findOneAndUpdate(
                        { urlId },
                        {
                            $setOnInsert: { timestampOfLastCrawl: 0 },
                            $set: { urlId, url },
                        },
                        { upsert: true },
                    )

                    await WebpageLink.findOneAndUpdate(
                        { sourceUrlId, destinationUrlId: urlId },
                        { sourceUrlId, destinationUrlId: urlId },
                        { upsert: true }
                    )
                }
            }
        }));
    }

    await downstreamBrokerConsumer.consume(message => extractLinks(message));
}

(async () => {
    const downstreamBrokerConsumer = await setupConsumer(process.env.DOWNSTREAM_BROKER_URL, process.env.DOWNSTREAM_BROKER_QUEUE);
    if (downstreamBrokerConsumer === null) {
        process.exit(errors.AMQP_FAILED);
    }

    await start(downstreamBrokerConsumer);
})();

module.exports = { start }