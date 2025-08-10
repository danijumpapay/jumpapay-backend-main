import { producer } from "@config/kafka";

export const publishOutgoingMessage = async (data: any) => {
  await producer.connect();
  await producer.send({
    topic: "chat_outgoing",
    messages: [{ value: JSON.stringify(data) }],
  });
  await producer.disconnect();
};

export const publishIncomingMessage = async (data: any) => {
  await producer.connect();
  await producer.send({
    topic: "chat_incoming",
    messages: [{ value: JSON.stringify(data) }],
  });
  await producer.disconnect();
};
