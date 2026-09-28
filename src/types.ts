export type MessageDirection = 'incoming' | 'outgoing';
export type MessagePosition = 'single' | 'first' | 'last' | 'normal';
export type MessageSender = 'assistant' | 'user';

export interface Message {
  id: string;
  sentTime: string;
  sender: MessageSender;
  direction: MessageDirection;
  position: MessagePosition;
  message: string;
  image?: string;
}
