
class INCREMENT {
    constructor(system,pane){
		this.system = system;
		this.pane = pane;
		this._number = 0;
		this.system.options.data["number" + this.pane.objID] = this._number;
	}

    increment() {
        this._number++;
		this.system.options.data["number" + this.pane.objID] = this._number;
		console.log(this.system.options.data['increment' + this.pane.objID].number); 
    }

    get number() {
        return this._number;
    }
} 