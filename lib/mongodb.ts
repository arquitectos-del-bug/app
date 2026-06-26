import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI
let client: MongoClient | null = null

export async function getDb(): Promise<Db | null> {
  if (!uri) return null
  if (!client) {
    client = new MongoClient(uri)
    await client.connect()
  }
  return client.db('yakualert')
}
