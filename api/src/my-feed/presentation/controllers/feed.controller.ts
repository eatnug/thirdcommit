import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Inject,
  HttpCode,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { CreateFeedHttpDto } from '@/my-feed/presentation/dto/create-feed.http.dto';
import { UpdateFeedHttpDto } from '@/my-feed/presentation/dto/update-feed.http.dto';
import { FeedHttpExceptionFilter } from '@/my-feed/presentation/filters/http-exception.filter';
import { FEED_REPOSITORY } from '@/my-feed/application/ports/feed.repository.port';
import type { IFeedRepository } from '@/my-feed/application/ports/feed.repository.port';
import { getFeedsUseCase } from '@/my-feed/application/use-cases/get-feeds.use-case';
import { getFeedByIdUseCase } from '@/my-feed/application/use-cases/get-feed-by-id.use-case';
import { createFeedUseCase } from '@/my-feed/application/use-cases/create-feed.use-case';
import { updateFeedUseCase } from '@/my-feed/application/use-cases/update-feed.use-case';
import { toggleFeedUseCase } from '@/my-feed/application/use-cases/toggle-feed.use-case';
import { deleteFeedUseCase } from '@/my-feed/application/use-cases/delete-feed.use-case';

/**
 * Feed Controller
 *
 * - HTTP 엔드포인트 정의
 * - Use Case에 위임
 * - Repository는 DI로 주입받아 Use Case에 전달
 *
 * Path: /api/my-feed/feeds
 */
@Controller('api/my-feed/feeds')
@UseFilters(FeedHttpExceptionFilter)
export class FeedController {
  constructor(
    @Inject(FEED_REPOSITORY)
    private readonly feedRepository: IFeedRepository,
  ) {}

  @Get()
  async findAll() {
    return await getFeedsUseCase(this.feedRepository);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await getFeedByIdUseCase(this.feedRepository, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateFeedHttpDto) {
    return await createFeedUseCase(this.feedRepository, dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateFeedHttpDto) {
    return await updateFeedUseCase(this.feedRepository, id, dto);
  }

  @Put(':id/toggle')
  async toggle(@Param('id') id: string) {
    return await toggleFeedUseCase(this.feedRepository, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await deleteFeedUseCase(this.feedRepository, id);
  }
}
