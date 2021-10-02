const Discord = require('discord.js');
const client = new Discord.Client();

var search = require("youtube-search");
const ytdl = require('ytdl-core');
const broadcast = client.createVoiceBroadcast()

const AuthDetails = require("./auth.json");

const opts = {
    maxResults: 3,
    key: AuthDetails.youtube_api_key
};

var servers = {};
const queue = new Map();


function play(connection, guild_id) {

    let server = servers[guild_id];

    if(server.queue[0] == null){
        connection.disconnect();
    }

    server.dispatcher = connection.playStream(ytdl(server.queue[0], { filter : 'audioonly' }));

    server.queue.shift();

    server.dispatcher.on("end", function() {
        if (server.queue[0]) play(connection, guild_id);
        else connection.disconnect();
    });
}

client.on("message", function (message) {
    if (message.channel.type == "dm") {
        let args = message.content.split(' ');
        const epitech = client.guilds.get("793156829672243232");
        const mid = message.author.id;
        const member = epitech.members.get(mid);
        switch (args[0].toLowerCase())
        {
            case "status":
                const embed = new Discord.RichEmbed()
                    .setTitle("Get some information")
                    .setColor("RANDOM")
                    .addField(" Status", ":white_check_mark: Online")
                    .addField("Connection", ":clock: " + client.ping + " ms")
                    .addBlankField()
                    .setThumbnail("https://cdn.shurisko.fr/shurisko.gif")
                    .setTimestamp();
                message.channel.send(embed);
                break;
            case "!!joinme":
                if (!member.voiceChannel) {
                    message.channel.send("Erreur, vous n'êtes pas danc un channel vocal !");
                    return;
                }
                member.voiceChannel.join();
                message.channel.send("Succès, j'ai bien rejoins votre channel vocal !");
                break;
            case "!!leave":
                if (!epitech.voiceConnection) {
                    message.channel.send("Erreur, je ne suis pas dans un channel !");
                    return;
                }
                epitech.voiceConnection.disconnect();
                connection = null;
                message.channel.send("Succès, j'ai bien déconnecté du channel !");
                break;
            case "!!play":
                if (!member.voiceChannel) {
                    message.channel.send("Erreur, vous n'êtes pas dans un vocal !");
                    return;
                }
                if(!servers[epitech.id]) servers[epitech.id] = {
                    queue: []
                };
                var link = message.content.split(' ');
                link.shift();
                link = link.join(' ');
                search(link, opts, function(err, results) {
                    if(err) return console.log(err);
                    for (var y = 0; results[y].kind == 'youtube#channel'; y++);
                    if(!servers[epitech.id]) servers[epitech.id] = {
                        queue: []
                    };
                    var server = servers[epitech.id];
                    server.queue.push("" + results[y].link + " ");

                    var conf = new Discord.RichEmbed()
                        .setColor("RANDOM")
                        .setTitle("Vous venez d'ajouter à la playlist la  musique : ")
                        .setDescription("**`" + results[y].title + "**`")
                        .setTimestamp();
                    message.channel.send(conf);
                    if (!epitech.voiceConnection) {
                        member.voiceChannel.join().then(function (connection) {
                            play(connection, epitech.id)
                        })
                    }
                });
                break;
            case "!!skip":
                var server = servers[epitech.id];
                if(server.dispatcher) server.dispatcher.end();
                if (!epitech.voiceConnection) {
                    member.voiceChannel.join().then(function(connection) {
                        play(connection, epitech.id)
                    });
                }
                var conf = new Discord.RichEmbed()
                    .setColor("RANDOM")
                    .setTitle(":loud_sound: Changement de la musique, nous passons a la musique suivante ")
                    .setTimestamp();
                message.channel.send(conf)
                break;;
            case "!!stop":
                queue.clear();
                epitech.voiceConnection.disconnect();
                break;
            case "!!form":
                message.channel.send("https://forms.office.com/Pages/ResponsePage.aspx?id=yrQckGK4KUCTBuXND22fhitssQgMGWdFqpxibRfEeZ9UMFg0Mk9GMTlMSFhRNUlOU0I1QUNGRlZPOS4u");
                break;
        }
    } else {
        return;
    }
})

client.login("ODkzODYyMTI4ODYyMjM2NzU2.YVhn-g.FyHsNMZmK0tYBjjE3fNIzGiIHsE");
