export class TelegramUserDto {
  id: number;
  chatId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedTelegramUsersDto {
  users: TelegramUserDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
