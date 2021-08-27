import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ViewTypeService} from '@data/services/view-type.service';
import * as echarts from 'echarts';
import {ChartSeries} from '@modules/dashboard/vault-stats/models/chart-series.model';
import {StaticValues} from '@data/static/static-values';
import {HardworksService} from '@data/services/http/hardworks.service';
import {HardWorkDto} from '@data/models/hardwork-dto';
import {HarvestTvl} from '@data/models/harvest-tvl';
import {TvlsService} from '@data/services/http/tvls.service';
import {HarvestsService} from '@data/services/http/harvests.service';
import {EChartsOption} from 'echarts';
import {ActivatedRoute} from '@angular/router';
import {forkJoin, Observable, Subscriber} from 'rxjs';

@Component({
  selector: 'app-vault-stats-total',
  templateUrl: './vault-stats-total.component.html',
  styleUrls: ['./vault-stats-total.component.scss']
})
export class VaultStatsTotalComponent implements OnInit {

    options1: EChartsOption;
    options2: EChartsOption;
    options3: EChartsOption;
    options4: EChartsOption;



    title1 = 'Total TVL';
    title2 = 'Total Profits';
    title3 = 'TVL';
    title4 = 'Profit';




    tvlTotalSelectedValue = '';
    tvlTotalSelectedDate = '';
    profitTotalSelectedValue = '';
    profitTotalSelectedDate = '';

    valueSymbol1 = '$';
    valueSymbol2 = '$';
    valueSymbol3 = '$';
    valueSymbol4 = '$';

    changesTvlTotalInPercent = '';
    changesTvlTotalInAmount = '';
    changesProfitTotalInPercent = '';
    changesProfitTotalInAmount = '';

    minus1 = false;
    minus2 = false;
    minus3 = false;
    minus4 = false;

    vaultAddress = '';
    vaultNetwork = '';

    networks = ['eth', 'bsc'];

    totalDataTVL: ChartSeries[] = [];
    totalDataProfit: ChartSeries[] = [];

    constructor(private ref: ChangeDetectorRef,
                private route: ActivatedRoute,
                private harvestService: HarvestsService,
                private hardWorkService: HardworksService,
                private tvlService: TvlsService,
                public vt: ViewTypeService) {
    }

    ngOnInit(): void {
        this.loadTotalTVL();
        this.loadTotalProfit();
    }

    loadTotalTVL(): void {
        forkJoin([ this.tvlService.getHistoryAllTvl(StaticValues.NETWORKS.get(this.networks[0])),
                           this.tvlService.getHistoryAllTvl(StaticValues.NETWORKS.get(this.networks[1]))
                         ]
                ).subscribe(([data, data2]) => {
                if (data.length && data2.length) {
                    this.totalDataTVL = data.map((item) => {
                        const date = new Date(item.calculateTime * 1000);
                        return {
                            name: date.toUTCString(),
                            value: [
                                [
                                    date.getFullYear(), date.getMonth() + 1, date.getDate()
                                ].join('/'),
                                item.lastTvl.toString()
                            ]
                        };
                    });
                    let totalDataTVL = data2.map((item) => {
                        const date = new Date(item.calculateTime * 1000);
                        return {
                            name: date.toUTCString(),
                            value: [
                                [
                                    date.getFullYear(), date.getMonth() + 1, date.getDate()
                                ].join('/'),
                                item.lastTvl.toString()
                            ]
                        };
                    });
                    totalDataTVL = this.dataReducer(totalDataTVL, 50);
                    this.totalDataTVL = this.dataReducer(this.totalDataTVL, 50);
                    console.log(totalDataTVL);
                    console.log(this.totalDataTVL);
                    this.initializeChartTotalTVL();
                    this.changesTvlTotalInAmount =  this.lastChanges(this.totalDataTVL).amountChanges;
                    this.changesTvlTotalInPercent =  this.lastChanges(this.totalDataTVL).percentChanges;
                    this.minus1 = this.lastChanges(this.totalDataTVL).minus;
                }
            }, err => {
                console.log(err);
            });
    }
    initializeChartTotalTVL(): void {
        let temp = '';
        this.options1 = {
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    params = params[0];
                    if (params.value[1] !== temp) {
                        temp = params.value[1];
                    } else {
                        return '';
                    }
                    const date = new Date(params.name);
                    const roundedSum = this.nFormatter(temp, 2);
                    this.tvlTotalSelectedValue = '$' + roundedSum;
                    this.tvlTotalSelectedDate = date.toString();
                    this.ref.detectChanges();
                    return  ``;
                },
                backgroundColor: 'rgb(25, 27, 31)',
                borderWidth: 0,
                position: [-10, 25],
                extraCssText: 'box-shadow: none'
            },
            grid: {
                top: '26%',
                left: '3.5%',
                right: '6%',
                bottom: '12%',
            },
            axisPointer: {
                lineStyle: {
                    type: 'solid',
                    color: '#2c2f36'
                }
            },
            xAxis: {
                type: 'category',
                splitLine: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisTick: {
                    show: false,
                },
                axisLabel: {
                    color: 'rgb(108, 114, 132)',
                    fontSize: '16px',
                    fontFamily: 'Inter var',
                    formatter: (value) => echarts.format.formatTime('dd', value, false),
                    showMinLabel: true,
                    showMaxLabel: true,
                },
                boundaryGap: false,

            },
            yAxis: {
                type: 'value',
                splitLine: {
                    show: false
                },
                show: false
            },
            series: [{
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: this.totalDataTVL,
                itemStyle: {
                    color: '#ff007a'
                },
                areaStyle: {
                    color: '#37162a'
                },
            }]
        };
    }

    loadTotalProfit(): void {
        this.hardWorkService.getHardWorkHistoryData(StaticValues.NETWORKS.get(this.vaultNetwork), 1)
            .subscribe((data) => {
                if (data.length) {
                    const cumulative = new Map<string, number>();
                    let lastTotalProfit = 0;

                    data.forEach( hw => {
                        const date = new Date(hw.blockDate * 1000);
                        const curDate = [date.getFullYear(), date.getMonth() + 1].join('/');
                        if(!cumulative.has(curDate)) {
                            lastTotalProfit = 0;
                        }
                        lastTotalProfit += hw.fullRewardUsd;
                        cumulative.set(curDate, lastTotalProfit);
                    });
                    this.totalDataProfit = data.map((item: HardWorkDto) => {
                        const date = new Date(item.blockDate * 1000);
                        const curDate = [date.getFullYear(), date.getMonth() + 1].join('/');
                        return {
                            name: date.toString(),
                            value: [
                                curDate,
                                cumulative.get(curDate).toString()
                            ]
                        };
                    });
                    this.totalDataProfit = this.dataReducer(this.totalDataProfit, 50);
                    this.initializeChartTotalProfit();
                    this.changesProfitTotalInAmount =  this.lastChanges(this.totalDataProfit).amountChanges;
                    this.changesProfitTotalInPercent =  this.lastChanges(this.totalDataProfit).percentChanges;
                    this.minus2 = this.lastChanges(this.totalDataProfit).minus;
                }
            }, err => {
                console.log(err);
            });
    }
    initializeChartTotalProfit(): void {
        let temp = '';
        this.options2 = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
                formatter: (params) => {
                    params = params[0];
                    if (params.value[1] !== temp) {
                        temp = params.value[1];
                    } else {
                        return '';
                    }
                    const date = new Date(params.name);
                    const roundedSum = this.nFormatter(params.value[1], 2);
                    this.profitTotalSelectedValue = '$' + roundedSum;
                    this.profitTotalSelectedDate = date.toString();
                    this.ref.detectChanges();
                    return  ``;
                },
                backgroundColor: 'rgb(25, 27, 31)',
                borderWidth: 0,
                position: [-10, 25],
                extraCssText: 'box-shadow: none',
            },
            grid: {
                top: '26%',
                left: '4.5%',
                right: '6%',
                bottom: '12%',
            },
            xAxis: [
                {
                    type: 'category',
                    axisTick: {
                        show: false,
                    },
                    axisLine: {
                        show: false
                    },
                    axisLabel: {
                        color: 'rgb(108, 114, 132)',
                        fontSize: '16px',
                        fontFamily: 'Inter var',
                        formatter: (value) => echarts.format.formatTime('MM', value, false),
                        showMinLabel: true,
                        showMaxLabel: true,
                    },

                },
            ],
            yAxis: [{
                show: false,
                type: 'value'
            }],
            series: [{
                type: 'bar',
                barWidth: '70%',
                data: this.totalDataProfit,
                itemStyle: {
                    color: '#2172e5',
                    borderRadius: 6
                },
            }]
        };
    }





    lastChanges(data): { minus: boolean; amountChanges: string; percentChanges: string } {
        const lastChanges = +data[data.length - 1].value[1] - + data[data.length - 2].value[1];
        const previousNumber = +data[data.length - 2].value[1] ;
        let minus = false;
        let amountChanges = '';
        let percentChanges = '';
        if (lastChanges  < 0 ) {
            minus = true;
        }
        if (minus) {
            amountChanges = this.nFormatter(lastChanges * (-1), 2);
        } else {
            amountChanges = this.nFormatter(lastChanges, 2);
        }
        const finalPercent = Math.abs(lastChanges / previousNumber * 100);
        if (finalPercent >= 1) {
            percentChanges = this.nFormatter(finalPercent.toString(), 2);
        } else {
            percentChanges = finalPercent.toFixed(2);
        }
        return {
            minus,
            amountChanges,
            percentChanges
        };
    }

    nFormatter(num, digits): string {
        const lookup = [
            { value: 1, symbol: '' },
            { value: 1e3, symbol: 'k' },
            { value: 1e6, symbol: 'm' },
            { value: 1e9, symbol: 'b' },
            { value: 1e12, symbol: 't' },
            { value: 1e15, symbol: 'p' },
            { value: 1e18, symbol: 'e' }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        const item = lookup.slice().reverse().find((it) => num >= it.value);
        return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0.00';
    }

    dataReducer(data, length): Array<{name: string; value: Array<string>}> {
        let tempArray = [...data].reverse();
        tempArray = tempArray.filter((thing, index, self) =>
            index === self.findIndex((t) => (
                t.value[0] === thing.value[0]
            ))
        );
        if (tempArray.length > length) {
            return tempArray.reverse().slice(tempArray.length - length);
        } else {
            return tempArray.reverse();
        }
    }


}
