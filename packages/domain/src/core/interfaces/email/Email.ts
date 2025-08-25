export interface Email {
  send(to: string, subject: string, body: string): Promise<void>;
}
