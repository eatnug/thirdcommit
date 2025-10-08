import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';
import type { CreateTodoDto } from '@/stuff/domain/dto/create-todo.dto';

/**
 * HTTP Layer Create Todo DTO
 *
 * - class-validator 데코레이터 사용
 * - NestJS validation pipe에서 사용
 * - Domain DTO와 분리
 */
export class CreateTodoHttpDto implements CreateTodoDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(100, { message: 'Title must be less than 100 characters' })
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must be less than 500 characters' })
  description?: string;
}
