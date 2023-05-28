const mongoose = require('mongoose');
const {model, Schema} = require('mongoose');

//GIVEAWAY MODEL
var Giveaways = new Schema({
    messageId: String,
    channelId: String,
    guildId: String,
    startAt: Number,
    endAt: Number,
    ended: Boolean,
    winnerCount: Number,
    prize: String,
    messages: {
        giveaway: String,
        giveawayEnded: String,
        inviteToParticipate: String,
        drawing: String,
        dropMessage: String,
        winMessage: mongoose.Mixed,
        embedFooter: mongoose.Mixed,
        noWinner: String,
        winners: String,
        endedAt: String,
        hostedBy: String
    },
    thumbnail: String,
    hostedBy: String,
    winnerIds: { type: [String], default: undefined },
    reaction: mongoose.Mixed,
    botsCanWin: Boolean,
    embedColor: mongoose.Mixed,
    embedColorEnd: mongoose.Mixed,
    exemptPermissions: { type: [], default: undefined },
    exemptMembers: String,
    bonusEntries: String,
    extraData: mongoose.Mixed,
    lastChance: {
        enabled: Boolean,
        content: String,
        threshold: Number,
        embedColor: mongoose.Mixed,
    },
    pauseOptions: {
        isPaused: Boolean,
        content: String,
        unpauseAfter: Number,
        embedColor: mongoose.Mixed,
        durationAfterPause: Number,
        infiniteDurationText: String
    },
    isDrop: Boolean,
    allowedMentions: {
        parse: { type: [String], default: undefined },
        users: { type: [String], default: undefined },
        roles: { type: [String], default: undefined }
    }
}, { id: false });    

const GiveawaysModel = model('Giveaways', Giveaways);

// LOGS MODEL
var Logs = new Schema({
    Guild: String,
    Channel: String,
});

const LogsModel = model('Logs', Logs);

//REACTIONS MODEL
var ReactionsRoles = new Schema({
    GuildID: String,
    roles: Array
});
    
const ReactionsRolesModel = model('ReactionsRoles', ReactionsRoles);

//SUGGESTION MODEL
var Suggestion = new Schema({
    GuildID: String,
    MessageID: String,
    Details: Array
});
const SuggestionModel = model('Suggestion', Suggestion);

var ChannelSuggest = new Schema({
    GuildID: String,
    ChannelID: String,
});
const ChannelSuggestModel = model('ChannelSuggest', ChannelSuggest);

//TICKET MODEL
var Ticket = new Schema({
    GuildID: String,
    MembersID: [String],
    TicketID: String,
    ChannelID: String,
    Closed: Boolean,
    Locked: Boolean,
    Type: String,
    Claimed: Boolean,
    ClaimedBy: String
})
    
const TicketModel = model('Ticket', Ticket);

//TICKET SETUP MODEL
var SetupTicket = new Schema({
        GuildID: String,
        Channel: String,
        Category: String,
        Transcripts: String,
        Handlers: String,
        Everyone: String,
        Description: String,
        Buttons: [String],
    })
    
const TicketSetupModel = model('SetupTicket', SetupTicket);

//WARNINGS MODEL
var Warnings = new Schema({
    GuildID: String,
    UserID: String,
    UserTag: String,
    Content: Array
});
const WarningsModel = model('Warnings', Warnings);

//WELCOME MODEL
var Welcome = new Schema({
    Guild: String,
    Channel: String,
    Msg: String
});

const WelcomeModel = model('Welcome', Welcome);

//LOCKDOWN MODEL
var Lockdown = new Schema({
    GuildID: String,
    ChannelID: String,
    Time: String
});

const LockdownModel = model('Lockdown', Lockdown);

var Roles = new Schema({
    guildId: String,
    userId: String,
    roleId: String,
    expiresAt: {type: Date, expires: 0}
});

const RolesModel = model('Roles', Roles);

module.exports = { 
    Roles: RolesModel,
    Lockdown: LockdownModel,
    Welcome: WelcomeModel, 
    Warnings: WarningsModel, 
    TicketSetup: TicketSetupModel, 
    Ticket: TicketModel, 
    ChannelSuggest: ChannelSuggestModel,
    Suggestions: SuggestionModel,
    ReactionsRoles: ReactionsRolesModel,
    Logs: LogsModel,
    Giveaways: GiveawaysModel
}