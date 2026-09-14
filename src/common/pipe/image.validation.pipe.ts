import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { extname } from "path";

@Injectable()
export class ImageValidationPipe implements PipeTransform {
  private allowExtensions = ["jpg", "png", "svg", "jpeg", "avif"];

  transform(value: Express.Multer.File) {
    if (!value) {
      return
    }

    const fileExtension = extname(value.originalname).toLowerCase().slice(1);
    
    const mediaBytes = value.size;
    const sizeMb = mediaBytes / (1024 * 1024);

    if (!this.allowExtensions.includes(fileExtension)) {
      throw new BadRequestException("Faqa rasim kiritish shart (jpg, png, svg, jpeg)");
    }

    if (sizeMb > 5) {
      throw new BadRequestException("Rasim hajmi 5 MB dan oshmasligi shart");
    }

    return value;
  }
}
