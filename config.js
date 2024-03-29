module.exports = {

    giveawayManager: {
        privateMessageInformation: false,
        everyoneMention: false,
        reaction: '🎉'
    },

    messages: {
        giveaway: '🎉 **Giveaway**',
        giveawayEnded: '🎉 **Giveaway Ended**',
        title: 'Prize: {this.prize}',
        drawing: 'The giveaway ends in: {timestamp}',
        dropMessage: 'Be the first, and react to 🎉!',
        inviteToParticipate: 'React with 🎉 to enter the giveaway!',
        winMessage: 'Congratulations, {winners}! You won **{this.prize}**!',
        embedFooter: '{this.winnerCount} winner(s)',
        noWinner: 'Giveaway cancelled, no valid participations.',
        hostedBy: 'Hosted by: {this.hostedBy}',
        winners: 'Winner(s):',
        endedAt: 'Ended at',
        paused: '⚠️ **This giveaway is paused!**',
        infiniteDurationText: '`NEVER`',
        congrat: 'New winner(s): {winners}! Congratulations, your prize is **{this.prize}**!',
        error: 'Reroll cancelled, no valid participations.'
    }
} 