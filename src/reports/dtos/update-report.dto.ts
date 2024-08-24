import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateReportDto {
  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price must be at least 0' })
  @Max(1000000, { message: 'Price cannot exceed 1,000,000' })
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  make?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsNumber({}, { message: 'Year must be a number' })
  @Min(1930, { message: 'Year must be at least 1930' })
  @Max(2052, { message: 'Year cannot exceed 2052' })
  @IsOptional()
  year?: number;

  @IsNumber({}, { message: 'Mileage must be a number' })
  @IsOptional()
  mileage?: number;

  @IsLatitude()
  @IsOptional()
  lat?: number;

  @IsLongitude()
  @IsOptional()
  lng?: number;
}
