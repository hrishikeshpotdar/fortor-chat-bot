import { Client } from '@elastic/elasticsearch';

const esClient = new Client({ node: 'https://ednfvgeikh:joufotk16p@hrishi-search-2813699401.us-east-1.bonsaisearch.net:443' });
const indexName = 'question-messages';

async function setupElasticsearch() {
    try {
        const indexExists = await esClient.indices.exists({ index: indexName });
        if (!indexExists.body) {
            await esClient.indices.create({
                index: indexName,
                // include other index settings and mappings here if needed
            });
            console.log(`Index ${indexName} created`);
        } else {
            console.log(`Index ${indexName} already exists`);
        }
    } catch (error) {
        console.error('Error setting up Elasticsearch:', error);
        throw error; // Rethrow to handle it in the main server file
    }
}

export { setupElasticsearch };
