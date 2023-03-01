import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('scanner_settings')
export class ScannerSettingsEntity {
  static ID = 1;

  @PrimaryColumn({ type: 'int' })
  id = ScannerSettingsEntity.ID;

  @Column()
  processedBlockHeight: number;
}
