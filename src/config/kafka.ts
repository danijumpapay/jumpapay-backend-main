import { Kafka } from "kafkajs";
import dotenv from "dotenv";

dotenv.config();

export const kafka = new Kafka({
  clientId: "message-service-producer",
  brokers: [process.env.KAFKA_HOST || "localhost:9092"],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "chat-group" });

export const initProducer = async () => {
  await producer.connect();
};
