import { ISuccess } from '../interface/ISuccess.interface';

export async function successRes(
  data: object,
  statusCode: number = 200,
): Promise<ISuccess> {
  return {
    statusCode,
    data,
  };
}
