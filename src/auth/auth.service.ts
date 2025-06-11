import { ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
@Injectable({})
export class AuthService{
    constructor(private prisma: PrismaService) {}
    async login(dto: AuthDto) {
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
        const pwMatches = await argon.verify(user.hash, dto.password);
        if (!pwMatches) {
            throw new ForbiddenException('Credentials incorrect');
        }
        // Remove the hash from the user object before returning
        const { hash, ...userWithoutHash } = user;
        return userWithoutHash; // Return the user object without the password hash
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
}