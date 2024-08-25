import { Expose, Transform } from 'class-transformer';

export class ReportDto {
  @Expose()
  id: number;

  @Expose()
  price: number;

  @Expose()
  make: string;

  @Expose()
  model: string;

  @Expose()
  year: number;

  @Expose()
  mileage: number;

  @Expose()
  lng: number;

  @Expose()
  lat: number;

  @Expose()
  approved: boolean;

  // @Transform(({ obj }) => {
  //   console.log('Transforming userId from Report:', obj.user);
  //   return obj.user?.id;
  // })
  @Transform(({ obj }) => obj.user?.id)
  @Expose()
  userId: number;
}
