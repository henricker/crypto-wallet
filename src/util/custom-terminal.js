import DraftLog from "draftlog";
import readline from 'readline';
import chalkTable from 'chalk-table';
import TABLE_OPTIONS from '../config/terminal.js'
import chalk from 'chalk'
import asciichart from 'asciichart'

const kPrint = Symbol('kprint');
const kData = Symbol('kdata');
const kTerminal = Symbol('kterminal');

export class CustomTerminal {
    constructor() {
        this[kPrint] = {};
        this[kData] = new Map();
        this[kTerminal] = null;
    }

    initialize() {
        DraftLog(console).addLineListener(process.stdin);
        this[kTerminal] = readline.createInterface(
            process.stdin,
            process.stdout
        )
    }

    draftTable() {
        const data = Array.from(this[kData].values());
        const table = chalkTable(TABLE_OPTIONS, data.map((_data) => ({ 
            id: _data.id,
            symbol: _data.symbol,
            name: _data.name,
            cmc_rank: _data.cmc_rank,
            total_supply: _data.total_supply,
         })));
        this[kPrint] = console.draft(table);
    }

    hasDataToPrint() {
        return this[kData].size !== 0;
    }

    addDataToPrint(data) {
        data.forEach(_data => {
            if(_data) {
                 this[kData].set(Symbol.for(_data.id), _data)
            }
        })
    }

    getDataById(id) {
        return this[kData].get(Symbol.for(id));
    }

    removeDataById(id) {
        return this[kData].delete(Symbol.for(id));
    }

    ploteQuoteChart(data) {
        if(!data) return;

        const s0 = [
            ...Array.from({ length: 30}, () => data.percent_change_90d),
            ...Array.from({ length: 30}, () => data.percent_change_60d),
            ...Array.from({ length: 30}, () => data.percent_change_30d),
            ...Array.from({ length: 7}, () => data.percent_change_7d),
            data.percent_change_24h,
        ];

        this.print(
            asciichart.plot(s0)
        )
    }

    print(message) {
        this[kPrint] = console.log(message);
    }

    printSuccess(message) {
        this.print(chalk.green(message));
    }

    printError(message) {
        this.print(chalk.red(message));
    }

    printInfo(message) {
        this.print(chalk.cyan(message));
    }

    async readLine(label = '') {
        return new Promise(resolve => this[kTerminal].question(label, resolve));
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    close() {
        this[kTerminal].close();
    }
}