import { IsString, Length } from "class-validator";

export class JoinRoomDto {
    @IsString()
    @Length(2, 20)
    alias: string;

    @IsString()
    @Length(6)
    roomId: string;
}