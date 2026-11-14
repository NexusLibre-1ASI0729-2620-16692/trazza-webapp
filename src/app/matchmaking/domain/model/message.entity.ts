import {BaseEntity} from '../../../shared/domain/model/base-entity';

export interface Message extends BaseEntity {
  id: number;
  senderId: string;
  senderName: string;
  isMine: boolean;
  content: string;
  sentAt: string;
  readAt: string | null;
}
