import { Users } from './entities/users.js';
import { User } from './entities/user.js'
import { CustomTerminal } from './util/custom-terminal.js';
import { CryptoService } from './service/crypto-service.js';
import constants from './config/constants.js';

const VOCABULARY = {
  STOP: ':q',
  LIST: '',
  SELECT: 'select',
};

const users = new Users();
const terminal = new CustomTerminal()
const cryptoService = new CryptoService();
const cryptoGenerator = cryptoService.list();

terminal.initialize()

export function onConsumerConnected(socket) {
    const socketId = socket.remoteAddress + ':' + socket.remotePort;
    users.add(new User({ id: socketId, socket }));
}

export function sendMessagesToAllUsers(message) {
    for(const user of users) {
        const payload = JSON.stringify({ 
            event: constants.SOCKET.EVENTS.RECEIVE_MESSAGE_FROM_SERVER, 
            message 
        });
        user.socket.write(payload);
    }
}

export async function mainLoop() {
    try {
        if(users.hasUsers()) {
            terminal.printSuccess(
                '---------------------------- \n' +
                'Connected Users: ' +
                 Array.from(users).map(_user => _user.id).join(', ') + '\n'
            );
        }

        terminal.printInfo(
        '---------------------------- \n' +
            'Commands: \n' +
            '\t* [press Enter]: list 5 more values \n' +
            '\t* select <ID>: select the crypto according to the specified <ID> \n' +
            '\t* :q : finish the process. \n'
        );

        if(!terminal.hasDataToPrint()) {
            const { value } = await cryptoGenerator.next();
            terminal.addDataToPrint(value);
        }
    
        terminal.print('Current listing: ');
        terminal.draftTable();

     

        const answer = await terminal.readLine(
            'Insert the chosen command bellow: \n'
        )
        
        const [command] = answer.split(' ');
        
        switch(command) {
            case VOCABULARY.STOP: {
                terminal.close();
                console.info('Terminal instance finished!');
                process.exit(0);
            }
            case VOCABULARY.LIST: {
                const { value } = await cryptoGenerator.next();
                terminal.addDataToPrint(value);
                break;
            }
            case VOCABULARY.SELECT: {
                terminal.printSuccess('SELECTING REGISTER...');
                const [_, id] = answer.split(' ');

                const data = terminal.getDataById(+id);

                if(!data) {
                    throw new RangeError(
                        `No register found for id [${id || ' '}]`
                    )
                }

                sendMessagesToAllUsers({
                    crypto: data
                });


                terminal.printSuccess(
                    'REGISTER SUCCESSFULLY SELECTED AND SENT TO THE FOLLOWING USERS: \n' + 
                    Array.from(users).map(_user => _user.id).join(', ') + '\n'
                )

                await terminal.wait(1000);
                break;
            }
            default:
                terminal.printError('Unknown command. Check the syntax and try again.');
                break;
        }

    } catch(err) {
        terminal.printError(`Error@mainLoop: ${error.message} \n`);
    }

    return mainLoop();
}


