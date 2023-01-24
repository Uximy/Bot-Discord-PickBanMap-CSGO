const { REST, Routes, ButtonStyle} = require('discord.js');
const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
const config = require('./Config/config.json');
const map1 = require('./Config/map1.json');
const map2 = require('./Config/map2.json');
const fs = require('fs');

function checkRole(interaction) 
{
    for (let i = 0; i <= interaction.member._roles.length; i++) {
        for (let j = 0; j < config.roleImmunityId.length; j++) {
            if (interaction.member._roles[i] == config.roleImmunityId[j]) {
                return 1;
            }
        }
    }
    return 0;
}

function checkRole_map(interaction, role) 
{
    for (let i = 0; i <= interaction.member._roles.length; i++) {
        if (interaction.member._roles[i] == role) {
            return 1;
        }
    }
    return 0;
}

const command = [
    {
        name: 'startmatch',
        description: 'Запустить матч',
        options: [
            {
                type: 8,
                name: 'team1',
                description: 'Выберите тиму 1',
                required: true,
            },
            {
                type: 8,
                name: 'team2',
                description: 'Выберите тиму 2',
                required: true,
            }
        ]
    },
];

const rest = new REST({ version: '10' }).setToken(config.Token);

(async () => {
    try {
        console.log('Начал обновлять команды приложения (/).');
        await rest.put(Routes.applicationCommands(config.id_bot), { body: command });
        console.log('Успешно перезагружено приложение (/) команды.');
    } catch (error) {
        console.log('Возникла ошибка перезагрузки приложение (/) команды.');
      console.error(error);
    }
})();

client.on('ready', async () => {
    console.log(`Бот авторизировался как ${client.user.tag}!`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const guild = client.guilds.cache.get(config.guild_id);
    try {
        if(checkRole(interaction)){
            if (interaction.commandName == 'startmatch') {
                
                const team1 = interaction.options.get('team1').value;

                const team2 = interaction.options.get('team2').value;

                let TeamsMapBan = [team1,team2];

                let role = TeamsMapBan[Math.floor(Math.random()*TeamsMapBan.length)]; //TODO НУЖНО БУДЕТ ПЕРЕПИСАТЬ

                const message_1 = new EmbedBuilder()
                .setColor('#FA747D')
                .setTitle('Select the map you want to ban') 
                .setAuthor({name: 'SDTV.GG', url: 'https://sdtv.gg/'})
                .setFooter({text: `Now choose: ${guild.roles.cache.get(role).name}`})

                let BufferyArray1 = [];
                for(let i = 0; i < map1.length; i++)
                {
                    map1[i].disable = false;
                    map1[i].user = '';
                    map1[i].number = 6;
                    map1[i].team = '';
                    Rewriting(map1, 'map1');

                    BufferyArray1[i] = new ButtonBuilder()
                        .setCustomId(map1[i].custom_id)
                        .setLabel(map1[i].custom_id)
                        .setStyle(map1[i].style)
                        .setDisabled(map1[i].disable)
                }

                let BufferyArray2 = [];
                for(let i = 0; i < map2.length; i++)
                {   
                    map2[i].disable = false;
                    map2[i].user = '';
                    map2[i].number = 6;
                    map2[i].team = '';
                    Rewriting(map2, 'map2');

                    BufferyArray2[i] = new ButtonBuilder()
                        .setCustomId(map2[i].custom_id)
                        .setLabel(map2[i].custom_id)
                        .setStyle(map2[i].style)
                        .setDisabled(map2[i].disable)
                }

                await interaction.reply({embeds: [message_1], components: [new ActionRowBuilder().addComponents(...BufferyArray1), new ActionRowBuilder().addComponents(...BufferyArray2)]});

                const filter_btn = async (i) => 
                {
                    for(let j = 0; j < map1; j++)
                    {
                        if(i.customId === map1[j].custom_Id) return true;
                        
                    }
                    for (let k = 0; k < map2; k++) {
                        if(i.customId === map2[k].custom_Id) return true;
                    }
                };

                if (!interaction.isButton()) {
                    const collector = interaction.channel.createMessageComponentCollector({filter_btn});

                    collector.on('collect', async i => {
                        for (let j = 0; j < map1.length; j++) 
                        {
                            for (let l = 0; l < map2.length; l++) 
                            {
                                if (i.customId === map1[j].custom_id || i.customId === map2[l].custom_id) 
                                {
                                    for (let p = 0; p <= interaction.member._roles.length; p++) {
                                        if (checkRole_map(i, role)) 
                                        {
                                            let count = 0;

                                            for (let iterator = 0; iterator < map1.length; iterator++) 
                                            {
                                                if(map1[iterator].disable) {
                                                    count++;
                                                }
                                            } 
                                            for (let iterator = 0; iterator < map2.length; iterator++) 
                                            {
                                                if(map2[iterator].disable) 
                                                {
                                                    count++;
                                                } 
                                            } 

                                            for (let iterator = 0; iterator < map1.length; iterator++) 
                                            {
                                                if(map1[iterator].custom_id == i.customId) 
                                                {
                                                    map1[iterator].user = guild.roles.cache.get(role).name;
                                                    map1[iterator].number = count;
                                                    Rewriting(map1, "map1");
                                                    break;
                                                }
                                            } 
                                            for (let iterator = 0; iterator < map2.length; iterator++) 
                                            {
                                                if(map2[iterator].custom_id == i.customId) 
                                                {
                                                    map2[iterator].user = guild.roles.cache.get(role).name;
                                                    map2[iterator].number = count;
                                                    Rewriting(map2, "map2");
                                                    break;
                                                } 
                                            } 

                                            if (i.customId == map2[l].custom_id){
                                                Ban_Pick(map2, 'map2', i);
                                            }
                                            if(count < 6)
                                            {
                                                Ban_Pick(map1, 'map1', i);
                                            }
                                        }
                                        else{
                                            await i.reply({content: "it's not your turn now", ephemeral: true});
                                        }
                                        return 0;
                                    }
                                }
                            }
                        }
                    })

                }

                function Ban_Pick(newJson, map, i)
                {
                    newJson.forEach(element => {
                        if (element.custom_id == i.customId) 
                        {
                            element.disable = true;
                            fs.writeFileSync(`./Config/${map}.json`, JSON.stringify(newJson));

                            let count = 0;

                            for (let l = 0; l < map1.length; l++) 
                            {
                                if(map1[l].disable) {
                                    count++;
                                }
                            } 
                            for (let l = 0; l < map2.length; l++) 
                            {
                                if(map2[l].disable) {
                                    count++;
                                } 
                            } 

                            let ThisTeam;
                            for (let l = 0; l < map1.length; l++) 
                            {
                                if(map1[l].number == count - 1) {
                                    ThisTeam = map1[l].user;
                                    break;
                                }
                            } 

                            for (let l = 0; l < map2.length; l++) 
                            {
                                if(map2[l].number == count - 1) {
                                    ThisTeam = map2[l].user;
                                    break;
                                } 
                            } 
                            
                            TeamsMapBan.forEach(item => {
                                if(guild.roles.cache.get(item).name != ThisTeam) 
                                {
                                    role = item;
                                }
                            });

                            const message_edit = new EmbedBuilder()
                            .setColor('#FA747D')
                            .setTitle('Select the map you want to ban') 
                            .setAuthor({name: 'SDTV.GG'})
                            .setFooter({text: `Now choose: ${guild.roles.cache.get(role).name}`})
                            
                            let BufferyArray1_test = [];
                            for(let i = 0; i < map1.length; i++)
                            {
                                BufferyArray1_test[i] = new ButtonBuilder()
                                    .setCustomId(map1[i].custom_id)
                                    .setLabel(map1[i].custom_id)
                                    .setStyle(map1[i].style)
                                    .setDisabled(map1[i].disable)
                            }

                            let BufferyArray2_test = [];
                            for(let i = 0; i < map2.length; i++)
                            {   
                                BufferyArray2_test[i] = new ButtonBuilder()
                                    .setCustomId(map2[i].custom_id)
                                    .setLabel(map2[i].custom_id)
                                    .setStyle(map2[i].style)
                                    .setDisabled(map2[i].disable)

                            }

                            
                            if(count >= 6) // Мб стоит 7 понизить до 6, в зависимости от кол-во карт. 
                            {

                                // TODO: Выбор стороны
                                /*
                                Pick - ${MapsNameSort[2]} (${MapsUserSort[2]})
                                Pick - ${MapsNameSort[3]} (${MapsUserSort[3]})
                                */

                                const filter = async (i) => 
                                i.customId === 'CT_1' ||
                                i.customId === 'T_1';

                                const filter_2 = async (i) => 
                                i.customId === 'CT_2' ||
                                i.customId === 'T_2';


                                let MapsNameSort = [];
                                let MapsUserSort = [];
                                
                                for (let l = 0; l < map1.length; l++) 
                                {
                                    MapsNameSort[map1[l].number] = map1[l].custom_id;
                                    MapsUserSort[map1[l].number] = map1[l].user;
                                } 
                                for (let l = 0; l < map2.length; l++) 
                                {
                                    MapsNameSort[map2[l].number] = map2[l].custom_id;
                                    MapsUserSort[map2[l].number] = map2[l].user;
                                } 

                                const ButtonChoiceTeamCt = new ButtonBuilder()
                                    .setCustomId('CT_1')
                                    .setLabel('CT')
                                    .setStyle(ButtonStyle.Primary)

                                const ButtonChoiceTeamT = new ButtonBuilder()
                                    .setCustomId('T_1')
                                    .setLabel('T')
                                    .setStyle(ButtonStyle.Danger)

                                const MessageChoiceTeam = new EmbedBuilder()
                                    .setColor('#FA747D')
                                    .setTitle('Выбор сторон:') 
                                    .setAuthor({name: 'SDTV.GG', url: 'https://sdtv.gg/'})
                                    .setDescription(`
                                        Choosing a side on the map: ${MapsNameSort[2]}
                                        The team chooses the team: ${MapsUserSort[3]}
                                    `)

                                i.update({embeds: [MessageChoiceTeam], components: [new ActionRowBuilder().addComponents(ButtonChoiceTeamCt, ButtonChoiceTeamT)]});
                                

                                const new_collector = i.channel.createMessageComponentCollector({filter});
            
                                new_collector.on('collect', async i_new => {
                                    if (i_new.customId == 'T_1' || i_new.customId == 'CT_1') 
                                    {
                                        //ПРОВЕРКА НА РОЛЬ.
                                        let MapsNameSort = [];
                                        let MapsUserSort = [];
                                        let ThisNumberMap = -1;

                                        let RoleOk = false;
                                        for (let l = 0; l < map1.length; l++) 
                                        {
                                            if(map1[l].number == 2) ThisNumberMap = l;
                                            MapsNameSort[map1[l].number] = map1[l].custom_id;
                                            MapsUserSort[map1[l].number] = map1[l].user;
                                        } 
                                        for (let l = 0; l < map2.length; l++) 
                                        {
                                            if(map2[l].number == 2) ThisNumberMap = l + 3;
                                            MapsNameSort[map2[l].number] = map2[l].custom_id;
                                            MapsUserSort[map2[l].number] = map2[l].user;
                                        } 

                                        
                                        for (let i = 0; i <= i_new.member._roles.length; i++) 
                                        {
                                            try
                                            {
                                                if (guild.roles.cache.get(i_new.member._roles[i]).name == MapsUserSort[3]) 
                                                {
                                                    RoleOk = true;
                                                    break;
                                                }
                                            }
                                            catch
                                            {
                                                continue;
                                            }
                                        }

                                        if(RoleOk == false)
                                        {
                                            await i_new.reply({content: `It's not your turn now` , ephemeral: true});
                                        }
                                        else
                                        {
                                            //ПЕРЕЗАПИСЬ JSON
                                            (ThisNumberMap < 4) ? (map1[ThisNumberMap].team = (i_new.customId == `T_1`) ? ("CT") : ("T")) : (map2[ThisNumberMap - 3].team = (i_new.customId == `T_1`) ? ("CT") : ("T"));
                                            Rewriting((ThisNumberMap < 4) ? (map1) : (map2), (ThisNumberMap < 4) ? ("map1") : ("map2"));

                                            const ButtonChoiceTeamCt = new ButtonBuilder()
                                                .setCustomId('CT_2')
                                                .setLabel('CT')
                                                .setStyle(ButtonStyle.Primary)
            
                                            const ButtonChoiceTeamT = new ButtonBuilder()
                                                .setCustomId('T_2')
                                                .setLabel('T')
                                                .setStyle(ButtonStyle.Danger)
            
                                            const MessageChoiceTeam = new EmbedBuilder()
                                                .setColor('#FA747D')
                                                .setTitle('Side selection:') 
                                                .setAuthor({name: 'SDTV.GG', url: 'https://sdtv.gg/'})
                                                .setDescription(`
                                                    Choosing a side on the map: ${MapsNameSort[3]}
                                                    The team chooses the team: ${MapsUserSort[2]}
                                                `)
            
                                            const new_collector_new = i.channel.createMessageComponentCollector({filter_2});

                                            new_collector_new.on('collect', async i_new_2 => {
                                                if (i_new_2.customId == 'T_2' || i_new_2.customId == 'CT_2'){
                                                    
                                                    let MapsNameSort = [];
                                                    let MapsUserSort = [];
                                                    let ThisNumberMap = -1;
                                                    let PastNumberMap = -1;
                                                    let RoleOk = false;
                                                    for (let l = 0; l < map1.length; l++) 
                                                    {
                                                        if(map1[l].number == 2) PastNumberMap = l;
                                                        if(map1[l].number == 3) ThisNumberMap = l;
                                                        MapsNameSort[map1[l].number] = map1[l].custom_id;
                                                        MapsUserSort[map1[l].number] = map1[l].user;
                                                    } 
                                                    for (let l = 0; l < map2.length; l++) 
                                                    {
                                                        if(map2[l].number == 2) PastNumberMap = l + 3;
                                                        if(map2[l].number == 3) ThisNumberMap = l + 3;
                                                        MapsNameSort[map2[l].number] = map2[l].custom_id;
                                                        MapsUserSort[map2[l].number] = map2[l].user;
                                                    } 

                                                    for (let i = 0; i <= i_new_2.member._roles.length; i++) 
                                                    {
                                                        try
                                                        {
                                                            if (guild.roles.cache.get(i_new_2.member._roles[i]).name == MapsUserSort[2]) 
                                                            {
                                                                RoleOk = true;
                                                                break;
                                                            }
                                                        }
                                                        catch
                                                        {
                                                            continue;
                                                        }
                                                    }
            
                                                    if(RoleOk == false)
                                                    {
                                                        await i_new_2.reply({content: `It's not your turn now` , ephemeral: true});
                                                    }
                                                    else
                                                    {
                                                        (ThisNumberMap < 4) ? (map1[ThisNumberMap].team = (i_new_2.customId == `T_2`) ? ("CT") : ("T")) : (map2[ThisNumberMap - 3].team = (i_new_2.customId == `T_2`) ? ("CT") : ("T"));
                                                        let TeamStr = ["", ""];
                                                        (PastNumberMap < 4) ? (TeamStr[0] = map1[PastNumberMap].team) : (TeamStr[0] = map2[PastNumberMap - 3].team);
                                                        (ThisNumberMap < 4) ? (TeamStr[1] = map1[ThisNumberMap].team) : (TeamStr[1] = map2[ThisNumberMap - 3].team);
                                                        //ПЕРЕЗАПИСЬ JSON
                                                        Rewriting((ThisNumberMap < 4) ? (map1) : (map2), (ThisNumberMap < 4) ? ("map1") : ("map2"));
                                                        let MessageFooter = `Ban - ${MapsNameSort[0]} (${MapsUserSort[0]})\nBan - ${MapsNameSort[1]} (${MapsUserSort[1]})\nPick - ${MapsNameSort[2]} (${MapsUserSort[2]} - ${TeamStr[0]})\nPick - ${MapsNameSort[3]} (${MapsUserSort[3]} - ${TeamStr[1]})\nBan - ${MapsNameSort[4]} (${MapsUserSort[4]})\nBan - ${MapsNameSort[5]} (${MapsUserSort[5]})\nDecider - ${MapsNameSort[6]}`;
                                                        const message_finale = new EmbedBuilder()
                                                        .setColor('#FA747D')
                                                        .setTitle('Election results:') 
                                                        .setAuthor({name: 'SDTV.GG', url: 'https://sdtv.gg/'})
                                                        .setDescription(MessageFooter)
                                                        i_new_2.update({embeds: [message_finale], components: []});
                                                    }
                                                }
                                            });
                                            
                                            i_new.update({embeds: [MessageChoiceTeam], components: [new ActionRowBuilder().addComponents(ButtonChoiceTeamCt, ButtonChoiceTeamT)]});
                                        }
                                    }
                                })
                            }
                            else
                            {
                                i.update({embeds: [message_edit], components: [new ActionRowBuilder().addComponents(...BufferyArray1_test), new ActionRowBuilder().addComponents(...BufferyArray2_test)]});
                            }
                        }
                    })
                    
                }
                
            }
            
        }else{
            await interaction.reply({content: `You do not have access to this command!` , ephemeral: true});
        } 
    } catch (error) {
        console.error(error);
    }
});

function Rewriting(newJson, path)
{
    fs.writeFileSync(`./Config/${path}.json`, JSON.stringify(newJson));
}

client.login(config.Token);