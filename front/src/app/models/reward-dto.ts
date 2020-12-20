export class RewardDto {
  id: string;
  vault: string;
  block: number;
  blockDate: number;
  reward: number;
  periodFinish: number;

  blockDateAdopted: Date;

  public static fromJson(data: string): RewardDto {
    const jsonData = JSON.parse(data);
    const tx: RewardDto = new RewardDto();

    tx.id = jsonData.id;
    tx.vault = jsonData.vault;
    tx.block = jsonData.block;
    tx.blockDate = jsonData.blockDate;
    tx.reward = jsonData.reward;
    tx.periodFinish = jsonData.periodFinish;

    RewardDto.enrich(tx);
    return tx;
  }

  public static enrich(tx: RewardDto): void {
    RewardDto.fillBlockDateAdopted(tx);
  }

  public static fillBlockDateAdopted(tx: RewardDto): void {
    if (tx.blockDateAdopted == null) {
      const d = new Date(0);
      d.setUTCSeconds(tx.blockDate);
      tx.blockDateAdopted = d;
    }
  }
}
