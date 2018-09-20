

module.exports = class User {
    // Passes in user info from Discord. 
    constructor(userInfo) {
        this.userInfo = userInfo;
        this.powerOver = [];
        this.controlledBy = [];
        this.rules = [];
        this.tasks = [];
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    removeRule(ruleId) {
        const index = this.rules.findIndex(rule.Id = ruleId);
        this.rules.splice(index, 1);
    }
}