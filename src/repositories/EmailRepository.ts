import {inject, injectable} from 'inversify';
import { Client } from '@elastic/elasticsearch';
import { IEmailRepository } from './interfaces/IEmailRepository';
import { IEmail } from '../interfaces/IEmail';
import {TYPES} from "../di/types";

@injectable()
export class EmailRepository implements IEmailRepository {

    constructor(@inject(TYPES.ElasticsearchClient) private esClient: Client) {

    }

    async saveEmail(email: IEmail,userId:string): Promise<IEmail> {
        const result = await this.esClient.index({
            index: `emails_${userId}`,
            body: email,
        });
        email.id = result._id;
        return email;
    }

    async createIndexIfNotExists(indexName: string) {
        const indexExists = await this.esClient.indices.exists({ index: indexName });

        if (!indexExists) {
            await this.esClient.indices.create({
                index: indexName
            });
            console.log(`Index ${indexName} created.`);
        } else {
            console.log(`Index ${indexName} already exists.`);
        }
    }
    async bulkIndexEmails(indexName: string, emails: IEmail[]) {
        const operations = emails.flatMap(email => [
            { index: { _index: indexName } },
            { email: email }
        ]);
        if(!operations.length) return
        const bulkResponse = await this.esClient.bulk({ refresh: true, body: operations })
        if (bulkResponse.errors) {
            const erroredDocuments: any[] = [];
            bulkResponse.items.forEach((action: any, i: number) => {
                const operation = Object.keys(action)[0];
                if (action[operation].error) {
                    erroredDocuments.push({
                        status: action[operation].status,
                        error: action[operation].error,
                        operation: operations[i * 2],
                        document: operations[i * 2 + 1]
                    });
                }
            });
        }
        const count = await this.esClient.count({ index: indexName });
        console.log(count);
    }
    // async getEmailsByUserId(userId: string): Promise<Email[]> {
    //     const result = await this.client.search({
    //         index: 'emails',
    //         body: {
    //             query: {
    //                 match: { userId: userId },
    //             },
    //         },
    //     });
    //     return result.body.hits.hits.map((hit: any) => hit._source as Email);
    // }

    // async searchEmails(userId: string, query: string): Promise<Email[]> {
    //     const result = await this.client.search({
    //         index: 'emails',
    //         body: {
    //             query: {
    //                 bool: {
    //                     must: [
    //                         { match: { userId: userId } },
    //                         { multi_match: { query: query, fields: ['subject', 'body'] } },
    //                     ],
    //                 },
    //             },
    //         },
    //     });
    //     return result.body.hits.hits.map((hit: any) => hit._source as Email);
    // }
}