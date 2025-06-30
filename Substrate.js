class Substrate {
    units = [];
    logItems = [];
    div = null;
    logDiv = null;
    constructor() {
        this.div = makeDiv('Substrate');
        this.logDiv = makeDiv('log');
    }

    insertUnit(unitSrc, atIndex = this.units.length) {
        const unit = new Unit(unitSrc.name, unitSrc.code, unitSrc.isOpen, this);
        if (unitSrc.weights) {
            unit.loadWeights(unitSrc.weights);
        }
        this.units.splice(atIndex, 0, unit);
        this.units.forEach((currUnit, i) => currUnit.div.style.order = (i * 2) + 1);
        this.div.appendChild(unit.div);
        this.#updateInserts();
        return unit;
    }
    insertNewUnit(atIndex) {
        const prefix = Unit.DEFAULT_NAME_PREFIX;
        let num = 0;
        let currName = `${ prefix }${ num }`;
        while (this.units.find(x => x.name === currName)) {
            currName = `${ prefix }${ ++num }`
        }
        this.insertUnit({ name: currName, code: Unit.DEFAULT_CODE, isOpen: true }, atIndex);
    }
    removeUnit(unit) {
        unit.cleanup();
        unit.div.parentElement.removeChild(unit.div);
        this.units.splice(this.units.indexOf(unit), 1);
        this.units.forEach((currUnit, i) => currUnit.div.style.order = (i * 2) + 1);
        this.#updateInserts();
    }

    run() {
        for (let currUnit of this.units) {
            if (currUnit.run() === false) {
                break;
            }
        }
    }

    log(unit, text, type = 'info') {
        const logItem = {
            time: Date.now(),
            unit: unit === null ? null : unit.name,
            text,
            type
        }
        const shouldFollow = true;
        this.logItems.push(logItem);
        const lineDiv = makeLogLine(logItem, type);
        this.logDiv.appendChild(lineDiv);
        if (shouldFollow) {
            this.logDiv.scrollTop = this.logDiv.scrollHeight;
        }
    }

    async serialize() {
        const unitsSrc = [];
        for (let currUnit of this.units) {
            unitsSrc.push(await currUnit.save());
        }
        return JSON.stringify({ units: unitsSrc });
    }
    deserialize(jsonStr) {
        const src = JSON.parse(jsonStr);
        this.units.forEach(x => x.cleanup());
        this.units = [];
        this.div.innerHTML = '';
        src.units.forEach(currUnitSrc => this.insertUnit(currUnitSrc));
    }



    #updateInserts() {
        this.div.querySelectorAll('.insert').forEach(currEl => currEl.parentElement.removeChild(currEl));
        for (let i = 0; i <= this.units.length; ++i) {
            const currInsertDiv = this.div.appendChild(makeDiv('insert'));
            const order = i * 2;
            currInsertDiv.style.order = order;
            currInsertDiv.appendChild(makeButton('<svg class="ionicon" viewBox="0 0 512 512"><use href="#addImg"></use></svg>', `Insert new unit at: ${ i }`, () => this.insertNewUnit(i)));
        }
    }
}