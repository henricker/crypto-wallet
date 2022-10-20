import { createConnection } from 'net'
import constants from './config/constants.js';
import { CustomTerminal } from './util/custom-terminal.js'

const VOCABULARY = {
  STOP: ':q',
  SELECT: 'select',
  REMOVE: 'remove',
  UPDATE: '',
};

const terminal = new CustomTerminal();
terminal.initialize();

const socket = createConnection({
    host: 'localhost',
    port: 3000
});

socket.on('error', (e) => {
    terminal.printError(`Error@mainloop: ${err.message}\n`);
})


socket.on('data', (payload) => {
    const data = JSON.parse(payload.toString() || {});
    const { event, message } = data;

    switch(event) {
        case constants.SOCKET.EVENTS.RECEIVE_MESSAGE_FROM_SERVER: {
            terminal.addDataToPrint([message.crypto])
            selectedCrypto = message.crypto;
            terminal.printSuccess('New data available, [press Enter] to fetch')
            break;
        }
    }
});

let selectedCrypto = null;

async function mainLoop() {
    try {
        terminal.printSuccess(
            '---------------------------- \n' + 'Wallet | Connection Stablished'
        );

        if(selectedCrypto) {
            terminal.print(
            '---------------------------- \n' +
                `Percentage variation of ${selectedCrypto.symbol} (${selectedCrypto.name}): `
            )
            terminal.ploteQuoteChart(selectedCrypto.quote.USD);
        }

        terminal.printInfo(
        '---------------------------- \n' +
            'Commands: \n' +
            '\t* [press Enter]: update your Wallet \n' +
            '\t* select <ID>: select the crypto according to the specified <ID> \n' +
            '\t* remove <ID>: remove the crypto according to the specified <ID> \n' +
            '\t* :q : finish the process. \n'
        );

        terminal.print('Current listing: ');

        if(!terminal.hasDataToPrint()) {
            terminal.printError('\tNo items in your wallet yet.');
        } else {
            terminal.draftTable();
        }

        const answer = await terminal.readLine(
            'Insert the chosen command bellow: \n'
        );
        
        const [command] = answer.split(' ');

        switch(command) {
            case VOCABULARY.STOP: {
                terminal.close();
                console.info('Terminal instance finished!');
                process.exit(0);
            }
            case VOCABULARY.SELECT: {
                terminal.printSuccess(`SELECTING REGISTER...`);
                await terminal.wait(100);
                const [_, id] = answer.split(' ');

                const data = terminal.getDataById(+id);
                
                if(!data) {
                    throw new RangeError(`No register found for id [${id  || ' '}]`)
                }

                selectedCrypto = data;
                terminal.printSuccess('REGISTER SELECTED SUCCESSFULLY');
                await terminal.wait(100);
                break;
            }
            case VOCABULARY.REMOVE: {
                terminal.printSuccess('REMOVING REGISTER FROM YOUR WALLET...');
                await terminal.wait(100);
                const [_, id] = answer.split(' ');

                const data = terminal.removeDataById(+id);

                if(!data) {
                    throw new RangeError(`No register found for id [${id || ' '}]`)
                }

                selectedCrypto = null;
                terminal.printSuccess('REGISTER REMOVED SUCCESSFULLY!');
                await terminal.wait(100);
                break;
            }
            case VOCABULARY.UPDATE: {
                terminal.printSuccess('FETCHING...');
                await terminal.wait(100);

                return mainLoop();
            }
            default: {
                terminal.printError('Unknown command. Check the syntax and try again.');
                break;
            }
        }

    } catch(err) {
        terminal.printError(`Error@mainloop: ${err.message}\n`);
    }

    return mainLoop();
}

await mainLoop()