import { Injectable } from '@nestjs/common';
import { SettingsServiceInterface } from '@rayvin-flow/flow-scanner-lib/lib/settings/settings-service';
import { InjectRepository } from '@nestjs/typeorm';
import { ScannerSettingsEntity } from '../entities/scanner-settings.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ScannerSettingsService implements SettingsServiceInterface {
  constructor(
    @InjectRepository(ScannerSettingsEntity)
    private scannerSettingsRepository: Repository<ScannerSettingsEntity>,
  ) {}

  async getProcessedBlockHeight(): Promise<number | undefined> {
    const settings = await this.scannerSettingsRepository.findOneBy({
      id: ScannerSettingsEntity.ID,
    });
    return settings?.processedBlockHeight;
  }

  async setProcessedBlockHeight(blockHeight: number): Promise<void> {
    await this.scannerSettingsRepository.upsert(
      {
        id: ScannerSettingsEntity.ID,
        processedBlockHeight: blockHeight,
      },
      { conflictPaths: ['id'] },
    );
  }
}
