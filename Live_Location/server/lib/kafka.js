import { Kafka, logLevel } from 'kafkajs';

const brokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
const username = process.env.KAFKA_USERNAME;
const password = process.env.KAFKA_PASSWORD;

const kafka = new Kafka({
  clientId: 'livetrack',
  brokers,
  logLevel: logLevel.WARN,
  ...(username && password ? {
    ssl: true,
    sasl: { mechanism: 'plain', username, password },
  } : {}),
});

export const producer = kafka.producer();
export const TOPIC    = process.env.KAFKA_TOPIC || 'location-updates';

export function createConsumer(groupId) {
  return kafka.consumer({ groupId });
}

export async function initProducer() {
  await producer.connect();
  console.log('[kafka] producer connected');
}
