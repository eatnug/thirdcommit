import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import type { UpdateFeedDto } from '@/my-feed/domain/dto/update-feed.dto';

/**
 * HTTP Layer Update Feed DTO
 *
 * - class-validator 데코레이터 사용
 * - NestJS validation pipe에서 사용
 * - Domain DTO와 분리
 */
export class UpdateFeedHttpDto implements UpdateFeedDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Title must be less than 100 characters' })
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must be less than 500 characters' })
  description?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
