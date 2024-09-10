import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SortOrder } from '../utils/response.constant';
export class QueryParams {
  @Type(() => String)
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  user_id?: number;

  @Type(() => String)
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  username?: string = '';

  @Type(() => String)
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  chat_id?: string = '';

  @Type(() => String)
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  email?: string = '';

  @Type(() => Number)
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  author_id?: number;

  @Type(() => String)
  @IsOptional()
  @IsString()
  order_by?: string = 'created_at';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(10)
  @IsOptional()
  per_page?: number = 10;

  @Type(() => String)
  @IsOptional()
  @IsString()
  keyword?: string = '';

  @IsEnum(SortOrder)
  @IsOptional()
  sort?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsBoolean()
  @Transform(({ obj, key }) => {
    return obj[key] === 'true' ? true : obj[key] === 'false' ? false : obj[key];
  })
  is_all_data?: boolean = false;

  constructor(
    keyword = '',
    page = 1,
    sort = SortOrder.DESC,
    order_by = 'created_at',
  ) {
    this.keyword = keyword;
    this.page = page;
    this.sort = sort;
    this.order_by = order_by;
  }
}
