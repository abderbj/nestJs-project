import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guard';
import { getUser } from 'src/decorator';
import { User } from '@prisma/client';
    
@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    @Get('me')
    getMe(@getUser() user : User) {        
        return user;
    }
} 
