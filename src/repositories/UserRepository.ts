
import {inject, injectable} from "inversify";
import { Client } from "@elastic/elasticsearch";
import { IUser } from "../interfaces/IUser";
import { IUserRepository } from "./interfaces/IUserRepository";
import {TYPES} from "../di/types";
import {SearchResponse} from "@elastic/elasticsearch/lib/api/types";

@injectable()
export class UserRepository implements IUserRepository {
  private index = "users";

  constructor(@inject(TYPES.ElasticsearchClient) private esClient: Client) {}

  async createUser(user: IUser): Promise<IUser> {
    const result = await this.esClient.index({
      index: this.index,
      body: user,
      refresh: true,
    }) as any;
    return { ...user, id: result._id };
  }

  async getUserById(id: string): Promise<IUser | null> {
    try {
      const result = await this.esClient.get({
        index: this.index,
        id: id,
      }) as any;
      return result._source as IUser;
    } catch (error:any) {
      if (error.meta.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    const result = await this.esClient.search({
      index: this.index,
      body: {
        query: {
          term: { email: email },
        },
      },
    }) as any;

    if (result.hits.total.value > 0) {
      return result.body.hits.hits[0]._source as IUser;
    }
    return null;
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser> {
    try {
      const searchResponse:SearchResponse = await this.esClient.search({
        index: this.index,
        body: {
          query: {
            term: { 'id.keyword':id }
          }
        }
      });

      if ((searchResponse.hits.total as any).value === 0) {
        throw Error('not found')
      }

      const esId = searchResponse.hits.hits[0]._id;
      if(!esId) throw Error('id not found')

      const updateResponse = await this.esClient.update({
        index: this.index,
        id: esId,
        body: {
          doc: updates
        }
      });
      return this.getUserById(id) as Promise<IUser>;


    } catch (error) {
     throw error
    }
  }

  async getAllUsers(
      page: number = 1,
      size: number = 10,
  ): Promise<IUser[]> {
    try {
      const response = await this.esClient.search({
        index: 'users',
        body: {
          query: {
            match_all: {}
          },
          from: (page - 1) * size,
          size: size
        }
      });

      return response.hits.hits.map(hit => ({
        ...hit._source as any
      } )) as IUser[];

    } catch (error) {
      console.error('Error fetching users from Elasticsearch:', error);
      throw error;
    }
  }
}
