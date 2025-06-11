import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
@Injectable({})
export class AuthService{
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService
    ) {}
    async login(dto: AuthDto) : Promise<{ access_token: string }> {
        // Here you would typically validate the user credentials
        // For example, check if the user exists and if the password matches
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });
        if (!user) {
            throw new ForbiddenException('Credentials incorrect');
        }
        const pwMatches =  argon.verify(user.hash, dto.password);
        if (!pwMatches) {
            throw new ForbiddenException('Credentials incorrect');
        }
        // Remove the hash from the user object before returning
        return this.signToken(user.id, user.email)
    }
    async signup(dto: AuthDto){
        // Hash the password
        const hash = await argon.hash(dto.password);
        // Here you would typically save the user to the database
        try{
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                },
            });
        
            // Remove the hash from the response
            const { hash: _, ...userWithoutHash } = user;
            return userWithoutHash;
        }catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                if(error.code === 'P2002'){
                    throw new ForbiddenException('Credentials taken');
                }
            }
            throw error; // Re-throw the error if it's not a known Prisma error
        }   
    }
    async signToken(userId: number, email: string): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email,
        };
        const secret = this.config.get('JWT_SECRET') || process.env.JWT_SECRET;
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '15m',
            secret: process.env.JWT_SECRET
        });
        return {
            access_token: token,
        };
    }
}