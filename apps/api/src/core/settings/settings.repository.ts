import { Repository, EntityRepository } from 'typeorm';

import { SettingsEntity } from './settings.entity';

@EntityRepository(SettingsEntity)
export class SettingsRepostiory extends Repository<SettingsEntity> {}
