import { Global, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Global()
@Injectable()
export class PrismaService extends PrismaClient {
    constructor(config: ConfigService ) {
        super(
            {
                datasources:{
                    db:{
                        url: config.get('DATABASE_URL') || 'file:./dev.db',
                    }
                }
            }
        );        
    }
}
