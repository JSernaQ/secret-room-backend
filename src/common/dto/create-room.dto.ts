import { IsString, Length } from "class-validator";

export class CreateRoomDto {
    @IsString()
    @Length(0, 20)
    alias: string;
}