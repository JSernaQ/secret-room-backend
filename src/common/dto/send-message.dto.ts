import { IsNumber, IsString, Length } from "class-validator";

export class SendMessageDto {
    @IsString()
    @Length(6)    
    roomId: string;
    
    @IsString()
    type: 'user' | 'system';
    
    @IsString()
    ciphertext: string;
    
    @IsString()
    iv: string;
    
    @IsString()
    from?: string;

    @IsNumber()
    timestamp: number;
}