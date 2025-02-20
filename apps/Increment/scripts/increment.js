class INCREMENT {
    constructor(system,pane){
		this.system = system;
		this.pane = pane;
		this._number = 0;
	}

    increment() {
        this._number++;
    }

    get number() {
        return this._number;
    }
} 