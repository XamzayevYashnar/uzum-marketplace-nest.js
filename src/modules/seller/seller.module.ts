import { Module } from "@nestjs/common";
import { SellerService } from "./seller.service";
import { SellerController } from "./seller.controller";

@Module({
    imports: [],
    controllers: [SellerController],
    providers: [SellerService],
    exports: [SellerService],
})
export class SellerModule {}