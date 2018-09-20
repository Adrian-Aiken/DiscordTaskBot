

module.exports = class Task {
    constructor(assignedTo, assignedBy, text, reward, punishment) {
        this.id = (new Date).getTime().toString();
        this.assignedTo = assignedTo;
        this.assignedBy = assignedBy;
        this.text = text;
        this.reward = reward;
        this.punishment = punishment;
        this.status = 'incomplete';
    }

    
}