import {PricesDto} from './prices-dto';
import {LpStat} from './lp-stat';

export class HarvestDto {
  id: string;
  hash: string;
  block: number;
  confirmed: boolean;
  blockDate: number;
  methodName: string;
  owner: string;
  amount: number;
  amountIn: number;
  vault: string;
  lastGas: number;
  lastTvl: number;
  lastUsdTvl: number;
  ownerCount: number;
  sharePrice: number;
  usdAmount: number;
  prices: string;
  lpStat: string;
  lpStatDto: LpStat;
  pricesDto: PricesDto;
  blockDateAdopted: Date;
  acquired: Date;

  public static fromJson(data: string): HarvestDto {
    const jsonData = JSON.parse(data);
    const tx: HarvestDto = new HarvestDto();
    tx.id = jsonData.id;
    tx.hash = jsonData.hash;
    tx.block = jsonData.block;
    tx.confirmed = jsonData.confirmed;
    tx.methodName = jsonData.methodName;
    tx.owner = jsonData.owner;
    tx.amount = jsonData.amount;
    tx.amountIn = jsonData.amountIn;
    tx.vault = jsonData.vault;
    tx.lastGas = jsonData.lastGas;
    tx.lastTvl = jsonData.lastTvl;
    tx.lastUsdTvl = jsonData.lastUsdTvl;
    tx.ownerCount = jsonData.ownerCount;
    tx.sharePrice = jsonData.sharePrice;
    tx.usdAmount = jsonData.usdAmount;
    tx.blockDate = jsonData.blockDate;
    tx.prices = jsonData.prices;
    tx.lpStat = jsonData.lpStat;

    tx.acquired = new Date();
    HarvestDto.enrich(tx);
    return tx;
  }

  public static enrich(tx: HarvestDto): void {
    if (tx.acquired == null) {
      tx.acquired = new Date();
    }
    if (tx.prices) {
      tx.pricesDto = JSON.parse(tx.prices);
    }
    if (tx.lpStat) {
      tx.lpStatDto = JSON.parse(tx.lpStat);
    }
    HarvestDto.fillBlockDateAdopted(tx);
  }

  public static fillBlockDateAdopted(tx: HarvestDto): void {
    if (tx.blockDateAdopted == null) {
      const d = new Date(0);
      d.setUTCSeconds(tx.blockDate);
      tx.blockDateAdopted = d;
    }
  }

  print(): string {
    // (moment(this.blockDateAdopted)).format('DD-MMM HH:mm:ss')
    return this.methodName
      + ' ' + this.usdAmount?.toFixed(2)
      + '$ ' + this.vault
      + ' TVL is ' + this.lastUsdTvl?.toFixed(2) + '$'
      ;
  }
}
