const Discord = require('discord.js');
const winston = require('winston');

const User = require('./types/user');
const Task = require('./types/task');
const config = require('./config.json');


const client = new Discord.Client();

// TEMP DATA - NEED TO FIGURE OUT DATA STORAGE
const users = [];
const tasks = [];

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console()
    ]
});

client.on('ready', () => {
    logger.info('Connected');
    logger.info(`Logged in as: ${client.user.username} - (${client.user.id})`);
});

client.on('message', message => {
    if (message.author.bot || !(message.content.charAt(0) === config.commandChar)) return;

    const args = message.content.split(' ');
    const curUser = users.find(u => u.userInfo.id === message.author.id);
    let targetUser;

    if (!curUser && args[0] === '!register') {
        users.push(new User(message.author));
        message.channel.send('Registered! You may now control (or be controlled) by others!');
        return;
    }

    if (!curUser) {
        message.channel.send('ERROR: Could not find user. Perhaps you haven\'t registered yet? (!register)');
        return;
    }

    switch (args[0]) {
        case '!ping':
            message.channel.send('pong!');
            break;

        case '!echo':
            message.channel.send(args.slice(1).join(' '));
            break;

        case '!register':
            message.channel.send('ERROR: You are already registered');
            break;

        case '!status':
            if (args.length === 1) {
                message.channel.send(`***** CURRENT USER *****
                    ID: ${curUser.userInfo.id}
                    Name: ${curUser.userInfo.username}
                    Controlled by: ${curUser.controlledBy}
                    Rules: ${curUser.rules.join(', ')}
                    Tasks: ${curUser.tasks.map(t => `[${t.id}](${t.status}) - ${t.text}`).join(', ')}
                `);
                break;
            }

            targetUser = users.find(u => u.userInfo.id === args[1]);
            if (!targetUser) {
                message.channel.send('Error: that user is not registered!');
                break;
            }

            message.channel.send(`***** OTHER USER *****
                ID: ${targetUser.userInfo.id}
                Name: ${targetUser.userInfo.username}
                Controlled by: ${targetUser.controlledBy}
                Rules: ${targetUser.rules.join(', ')}
                Tasks: ${targetUser.tasks.map(t => `[${t.id}](${t.status}) - ${t.text}`).join(', ')}
            `);
            break;

        case '!allowcontrol':
            if (args.length < 2) break;

            client.fetchUser(args[1]).then((newUser) => {
                curUser.controlledBy.push(newUser);
                message.channel.send(`Done! ${newUser.username} may now control you`);
            }).catch((err) => {
                message.channel.send('Error getting user info. Please only use ID, still in development');
                debugger;
            });

            break;

        case '!newtask':
            if (args.length === 1) {
                message.channel.send('Usage: !newtask userId {Task text} {Reward} {Punishment}');
                break;
            }

            targetUser = users.find(u => u.userInfo.id === args[1]);
            if (!targetUser) {
                message.channel.send('Error: that user is not registered!');
                break;
            }

            if (!targetUser.controlledBy.find(u => u.id === message.author.id)) {
                message.channel.send('Error: You are not authorised to give this user tasks');
                break;
            }

            const taskArgs = message.content.match(/{.*?}/g);
            if (taskArgs.length !== 3) {
                message.channel.send('Please send exactly 3 arguments.\nUsage: !newtask {Task text} {Reward} {Punishment}');
                break;
            }
            
            let newTask = new Task(targetUser,
                message.author,
                taskArgs[0].slice(1, taskArgs[0].length-1),
                taskArgs[1].slice(1, taskArgs[1].length-1),
                taskArgs[2].slice(1, taskArgs[2].length-1)
            );

            targetUser.tasks.push(newTask);
            tasks.push(newTask);
            message.channel.send('Done! Task added with id ' + newTask.id);
            break;

        case '!finishtask':
            if (args.length === 1) {
                break;
            }

            const finishedTask = tasks.find(t => t.id === args[1]);
            if (!finishedTask) {
                message.channel.send('Could not find that task');
                break;
            }

            finishedTask.status = 'complete';
            message.channel.send(`Congratulations! Your reward: ${finishedTask.reward}`);
            break;

        case '!failtask':
            if (args.length === 1) {
                break;
            }

            const failedTask = tasks.find(t => t.id === args[1]);
            if (!failedTask) {
                message.channel.send('Could not find that task');
                break;
            }

            failedTask.status = 'failed';
            message.channel.send(`How naughty! Your punishment: ${failedTask.punishment}`);
            break;
    }

    logger.info(`Recieved message from ${message.author.username}: ${message.content}`);
});

client.login(config.token);